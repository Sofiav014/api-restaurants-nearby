import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';

/**
 * Service responsible for interacting with external APIs to fetch restaurant data.
 */
@Injectable()
export class RestaurantsService {
  /**
   * Constructs the RestaurantsService.
   * @param configService - The configuration service used to retrieve API keys and URLs.
   */
  constructor(private readonly configService: ConfigService) {}

  apiKey = this.configService.get('maps.apiKey');
  placesApiUrl = this.configService.get('maps.apiUrl');
  geoCodingApiUrl = this.configService.get('maps.geoCodingApiUrl');

  /**
   * Retrieves a list of restaurants near a specified city.
   * @param city - The name of the city to search for nearby restaurants.
   * @param radius - The search radius in meters (default is 500.0).
   * @param maxResultCount - The maximum number of results to return (default is 10).
   * @returns A promise that resolves to an array of restaurant data.
   * @throws BusinessLogicException if the city is not found or an error occurs during the API call.
   */
  async getRestaurantsNearCity(
    city: string,
    radius: number = 500.0,
    maxResultCount: number = 10,
  ): Promise<RestaurantResponseDto[]> {
    const queryParameters = new URLSearchParams({
      address: city,
      key: this.apiKey,
    });

    try {
      const response = await axios.get(
        `${this.geoCodingApiUrl}?${queryParameters}`,
      );
      if (!response.data.results.length) {
        throw new BusinessLogicException(
          'City not found',
          BusinessError.NOT_FOUND,
        );
      }
      const { lat, lng } = response.data.results[0].geometry.location;
      return await this.getRestaurantsByCoordinates(
        lat,
        lng,
        radius,
        maxResultCount,
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a list of restaurants based on geographic coordinates.
   * @param lat - The latitude of the location.
   * @param lon - The longitude of the location.
   * @param radius - The search radius in meters (default is 500.0).
   * @param maxResultCount - The maximum number of results to return (default is 10).
   * @returns A promise that resolves to an array of restaurant data.
   * @throws BusinessLogicException if required query parameters are missing or an error occurs during the API call.
   */
  async getRestaurantsByCoordinates(
    lat: number,
    lon: number,
    radius: number = 500.0,
    maxResultCount: number = 10,
  ): Promise<RestaurantResponseDto[]> {
    if (!lat || !lon) {
      throw new BusinessLogicException(
        'Missing required query parameters: City or coordinates (Latitude and Longitude)',
        BusinessError.BAD_REQUEST,
      );
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.apiKey,
      'X-Goog-FieldMask': '*',
    };

    const body = {
      includedTypes: ['restaurant'],
      maxResultCount: maxResultCount,
      locationRestriction: {
        circle: {
          center: {
            latitude: lat,
            longitude: lon,
          },
          radius: radius,
        },
      },
    };
    try {
      const response = await axios.post(this.placesApiUrl, body, { headers });

      if (Object.keys(response.data).length === 0) {
        throw new BusinessLogicException(
          'No restaurants found in the specified area',
          BusinessError.NOT_FOUND,
        );
      }

      const restaurants: RestaurantResponseDto[] = response.data.places.map(
        (restaurant) => ({
          name: restaurant.displayName.text,
          address: restaurant.formattedAddress,
          rating: restaurant.rating,
          more_info: restaurant.googleMapsUri,
        }),
      );

      return restaurants;
    } catch (error) {
      throw error;
    }
  }
}

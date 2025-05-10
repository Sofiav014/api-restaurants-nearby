import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { RestaurantsService } from './restaurants.service';

/**
 * Controller for handling restaurant-related operations.
 */
@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  /**
   * Initializes the RestaurantsController with the provided RestaurantsService.
   * @param restaurantsService - The service used to handle restaurant-related operations.
   */
  constructor(private readonly restaurantsService: RestaurantsService) {}

  /**
   * Retrieves nearby restaurants based on the provided location or city.
   *
   * @summary Get nearby restaurants
   * @description This endpoint allows users to fetch nearby restaurants either by providing latitude and longitude coordinates or by specifying a city name.
   *
   * @param lat - The latitude of the location (optional).
   * @param lng - The longitude of the location (optional).
   * @param city - The name of the city to search for restaurants (optional).
   * @param radius - The radius (in meters) within which to search for restaurants. Default is 500 meters.
   * @param maxResultCount - The maximum number of restaurants to return in the response. Default is 10.
   *
   * @returns A list of nearby restaurants.
   *
   * @throws UnauthorizedException - If the user is not authenticated.
   * @throws NotFoundException - If the specified city is not found.
   * @throws BadRequestException - If required query parameters are missing.
   */
  @ApiOperation({
    summary: 'Get nearby restaurants by city or coordinates (lat and lng)',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'lat',
    required: false,
    type: Number,
    description:
      'The latitude of the location to search for nearby restaurants.',
  })
  @ApiQuery({
    name: 'lng',
    required: false,
    type: Number,
    description:
      'The longitude of the location to search for nearby restaurants.',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'The name of the city to search for nearby restaurants.',
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    type: Number,
    description:
      'The radius (in meters) within which to search for restaurants. Default is 500 meters.',
  })
  @ApiQuery({
    name: 'maxResultCount',
    required: false,
    type: Number,
    description:
      'The maximum number of restaurants to return in the response. Default is 10.',
  })
  @ApiResponse({
    status: 200,
    description: 'Gets nearby restaurants successfully',
    type: [RestaurantResponseDto],
  })
  @ApiResponse({
    status: 400,
    description:
      'Missing required query parameters: City or coordinates (Latitude and Longitude)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'City not found or no restaurants found in the area',
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getNearbyRestaurants(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('city') city: string,
    @Query('radius') radius: number,
    @Query('maxResultCount') maxResultCount: number,
  ) {
    if (city) {
      return this.restaurantsService.getRestaurantsNearCity(
        city,
        radius,
        maxResultCount,
      );
    }
    return this.restaurantsService.getRestaurantsByCoordinates(
      lat,
      lng,
      radius,
      maxResultCount,
    );
  }
}

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  BusinessError,
  BusinessLogicException,
} from '../shared/errors/business-errors';
import { RestaurantsService } from './restaurants.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RestaurantsService', () => {
  let service: RestaurantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'maps.apiKey':
                  return 'test-api-key';
                case 'maps.apiUrl':
                  return 'https://mock-places-api.com';
                case 'maps.geoCodingApiUrl':
                  return 'https://mock-geocoding-api.com';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRestaurantsNearCity', () => {
    it('should return restaurants when the city is found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [
            {
              geometry: {
                location: { lat: 37.7937, lng: -122.3965 },
              },
            },
          ],
        },
      });

      // Mock the axios response for the places API
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          places: [
            {
              displayName: {
                text: 'Restaurant A',
              },
              formattedAddress: '123 Main St, San Francisco, CA',
              rating: 4.5,
              googleMapsUri: 'https://maps.google.com/?cid=1234567890123456789',
            },
            {
              displayName: {
                text: 'Restaurant B',
              },
              formattedAddress: '456 Elm St, San Francisco, CA',
              rating: 4.0,
              googleMapsUri: 'https://maps.google.com/?cid=9876543210987654321',
            },
          ],
        },
      });

      const result = await service.getRestaurantsNearCity('San Francisco');
      expect(result).toEqual([
        {
          name: 'Restaurant A',
          address: '123 Main St, San Francisco, CA',
          rating: 4.5,
          more_info: 'https://maps.google.com/?cid=1234567890123456789',
        },
        {
          name: 'Restaurant B',
          address: '456 Elm St, San Francisco, CA',
          rating: 4.0,
          more_info: 'https://maps.google.com/?cid=9876543210987654321',
        },
      ]);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://mock-places-api.com',
        {
          includedTypes: ['restaurant'],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: { latitude: 37.7937, longitude: -122.3965 },
              radius: 500.0,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': 'test-api-key',
            'X-Goog-FieldMask': '*',
          },
        },
      );
    });

    it('should throw a BusinessLogicException when the city is not found', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          results: [],
        },
      });

      await expect(
        service.getRestaurantsNearCity('Unknown City'),
      ).rejects.toThrow(
        new BusinessLogicException('City not found', BusinessError.NOT_FOUND),
      );
    });

    it('should propagate any errors thrown by axios', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(
        service.getRestaurantsNearCity('San Francisco'),
      ).rejects.toThrow(error);
    });
  });

  describe('getRestaurantsByCoordinates', () => {
    it('should return restaurants when given valid coordinates', async () => {
      // Mock the axios response for the places API
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          places: [
            {
              displayName: {
                text: 'Restaurant A',
              },
              formattedAddress: '123 Main St, San Francisco, CA',
              rating: 4.5,
              googleMapsUri: 'https://maps.google.com/?cid=1234567890123456789',
            },
            {
              displayName: {
                text: 'Restaurant B',
              },
              formattedAddress: '456 Elm St, San Francisco, CA',
              rating: 4.0,
              googleMapsUri: 'https://maps.google.com/?cid=9876543210987654321',
            },
          ],
        },
      });

      const result = await service.getRestaurantsByCoordinates(
        37.7937,
        -122.3965,
      );
      expect(result).toEqual([
        {
          name: 'Restaurant A',
          address: '123 Main St, San Francisco, CA',
          rating: 4.5,
          more_info: 'https://maps.google.com/?cid=1234567890123456789',
        },
        {
          name: 'Restaurant B',
          address: '456 Elm St, San Francisco, CA',
          rating: 4.0,
          more_info: 'https://maps.google.com/?cid=9876543210987654321',
        },
      ]);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://mock-places-api.com',
        {
          includedTypes: ['restaurant'],
          maxResultCount: 10,
          locationRestriction: {
            circle: {
              center: { latitude: 37.7937, longitude: -122.3965 },
              radius: 500.0,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': 'test-api-key',
            'X-Goog-FieldMask': '*',
          },
        },
      );
    });

    it('should propagate any errors thrown by axios in getRestaurantsByCoordinates', async () => {
      const error = new Error('API error');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(
        service.getRestaurantsByCoordinates(37.7937, -122.3965),
      ).rejects.toThrow(error);
    });

    it('should throw a BusinessLogicException if latitude or longitude is missing', async () => {
      await expect(
        service.getRestaurantsByCoordinates(null, -122.3965),
      ).rejects.toThrow(
        new BusinessLogicException(
          'Missing required query parameters: City or coordinates (Latitude and Longitude)',
          BusinessError.BAD_REQUEST,
        ),
      );

      await expect(
        service.getRestaurantsByCoordinates(37.7937, null),
      ).rejects.toThrow(
        new BusinessLogicException(
          'Missing required query parameters: City or coordinates (Latitude and Longitude)',
          BusinessError.BAD_REQUEST,
        ),
      );
    });

    it('should throw a BusinessLogicException if no restaurants are found in the specified area', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {}, // Simulate an empty response
      });

      await expect(
        service.getRestaurantsByCoordinates(37.7937, -122.3965),
      ).rejects.toThrow(
        new BusinessLogicException(
          'No restaurants found in the specified area',
          BusinessError.NOT_FOUND,
        ),
      );
    });
  });
describe('getRestaurantsByCoordinates - Latitude and Longitude Validation', () => {
  it('should throw a BusinessLogicException if latitude is out of range', async () => {
    await expect(
      service.getRestaurantsByCoordinates(-91, -122.3965),
    ).rejects.toThrow(
      new BusinessLogicException(
        'Latitude must be between -90 and 90 degrees',
        BusinessError.BAD_REQUEST,
      ),
    );

    await expect(
      service.getRestaurantsByCoordinates(91, -122.3965),
    ).rejects.toThrow(
      new BusinessLogicException(
        'Latitude must be between -90 and 90 degrees',
        BusinessError.BAD_REQUEST,
      ),
    );
  });

  it('should throw a BusinessLogicException if longitude is out of range', async () => {
    await expect(
      service.getRestaurantsByCoordinates(37.7937, -181),
    ).rejects.toThrow(
      new BusinessLogicException(
        'Longitude must be between -180 and 180 degrees',
        BusinessError.BAD_REQUEST,
      ),
    );

    await expect(
      service.getRestaurantsByCoordinates(37.7937, 181),
    ).rejects.toThrow(
      new BusinessLogicException(
        'Longitude must be between -180 and 180 degrees',
        BusinessError.BAD_REQUEST,
      ),
    );
  });
});
});

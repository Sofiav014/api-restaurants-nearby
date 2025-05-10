import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

// Mock the JwtAuthGuard to always pass
const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('RestaurantsController', () => {
  let controller: RestaurantsController;
  let service: RestaurantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [
        {
          provide: RestaurantsService,
          useValue: {
            getRestaurantsNearCity: jest.fn(),
            getRestaurantsByCoordinates: jest.fn(),
          },
        },
        ConfigService,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
    service = module.get<RestaurantsService>(RestaurantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNearbyRestaurants', () => {
    it('should call getRestaurantsNearCity when city is provided', async () => {
      const mockCity = 'San Francisco';
      const radius = null;
      const maxResultCount = null;
      const mockRestaurants = {
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
      };

      // Mock service method
      (service.getRestaurantsNearCity as jest.Mock).mockResolvedValue(
        mockRestaurants,
      );

      const result = await controller.getNearbyRestaurants(
        null,
        null,
        mockCity,
        null,
        null,
      );
      expect(service.getRestaurantsNearCity).toHaveBeenCalledWith(
        mockCity,
        radius,
        maxResultCount,
      );
      expect(result).toEqual(mockRestaurants);
    });

    it('should call getRestaurantsByCoordinates when city is not provided but lat and lng are', async () => {
      const mockLat = 37.7937;
      const mockLng = -122.3965;
      const radius = null;
      const maxResultCount = null;
      const mockRestaurants = {
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
      };

      // Mock service method
      (service.getRestaurantsByCoordinates as jest.Mock).mockResolvedValue(
        mockRestaurants,
      );

      const result = await controller.getNearbyRestaurants(
        mockLat,
        mockLng,
        null,
        null,
        null,
      );
      expect(service.getRestaurantsByCoordinates).toHaveBeenCalledWith(
        mockLat,
        mockLng,
        radius,
        maxResultCount,
      );
      expect(result).toEqual(mockRestaurants);
    });
  });
});

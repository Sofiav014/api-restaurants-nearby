import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { ConfigService } from '@nestjs/config';
import { RestaurantsController } from './restaurants.controller';

@Module({
  providers: [RestaurantsService, ConfigService],
  controllers: [RestaurantsController],
})
export class RestaurantsModule {}

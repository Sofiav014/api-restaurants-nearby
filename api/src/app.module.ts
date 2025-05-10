import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import placesConfig from './config/apis/maps.config';
import authConfig from './config/auth/auth.config';
import { databaseConfig } from './config/database/database.config';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { TokenBlacklistsModule } from './token-blacklist/token-blacklist.module';
import { TransactionsMiddleware } from './transactions/transactions.middleware';
import { TransactionsModule } from './transactions/transactions.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [authConfig, placesConfig],
    }),
    ScheduleModule.forRoot(),
    databaseConfig(),
    UsersModule,
    AuthModule,
    RestaurantsModule,
    TransactionsModule,
    TokenBlacklistsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TransactionsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

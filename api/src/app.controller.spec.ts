import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello Tyba! This is the API for the technical test resolved by Sofia Velasquez Marin."', () => {
      expect(appController.getHello()).toBe(
        'Hello Tyba! This is the API for the technical test resolved by Sofia Velasquez Marin.',
      );
    });
  });
});

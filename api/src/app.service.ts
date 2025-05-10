import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello Tyba! This is the API for the technical test resolved by Sofia Velasquez Marin.';
  }
}

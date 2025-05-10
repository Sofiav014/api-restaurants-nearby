import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
    });
  }

  async set(key: string, value: string, expirationInSeconds?: number): Promise<void> {
    console.log('Setting key:', key, 'with value:', value);
    if (expirationInSeconds) {
      await this.client.set(key, value, 'EX', expirationInSeconds);
    } else {
      await this.client.set(key, value);
    }
    console.log('Key set successfully');
  }

  async get(key: string): Promise<string | null> {
    console.log('Getting key:', key);
    const value = await this.client.get(key);
    if (value) {
      console.log('Key found:', key, 'with value:', value);
    }
    if (!value) {
      console.log('Key not found:', key);
    }
    return value;
    // return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    console.log('Deleting key:', key);
    const result = await this.client.del(key);
    if (result) {
      console.log('Key deleted successfully:', key);
    } else {
      console.log('Key not found for deletion:', key);
    }
    return result;
    // return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    console.log('Checking existence of key:', key);
    const exists = await this.client.exists(key);
    if (exists) {
      console.log('Key exists:', key);
    } else {
      console.log('Key does not exist:', key);
    }
    return exists;
    // return await this.client.exists(key);
  }
}
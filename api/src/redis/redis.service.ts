import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
/**
 * A service for interacting with a Redis database. This service provides methods
 * for storing, retrieving, deleting, and checking the existence of key-value pairs
 * in the Redis database. It uses a Redis client instance to execute commands and
 * manage the connection.
 */
export class RedisService {
  /**
   * Represents the Redis client instance used to interact with the Redis database.
   * This client is responsible for executing Redis commands and managing the connection.
   */
  private client: Redis;

  /**
   * Initializes a new instance of the Redis service.
   * 
   * @param configService - The configuration service used to retrieve Redis connection details.
   * 
   * The Redis client is configured using the following properties from the configuration service:
   * - `redis.host`: The hostname or IP address of the Redis server.
   * - `redis.port`: The port number on which the Redis server is running.
   * - `redis.password`: The password for authenticating with the Redis server.
   */
  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('redis.host'),
      port: this.configService.get('redis.port'),
      password: this.configService.get('redis.password'),
    });
  }

  /**
   * Stores a key-value pair in the Redis database with an optional expiration time.
   *
   * @param key - The key under which the value will be stored.
   * @param value - The value to be stored.
   * @param expirationInSeconds - (Optional) The expiration time in seconds. 
   * If provided, the key-value pair will expire after the specified time.
   * If not provided, the key-value pair will persist indefinitely.
   * @returns A promise that resolves when the operation is complete.
   */
  async set(
    key: string,
    value: string,
    expirationInSeconds?: number,
  ): Promise<void> {
    if (expirationInSeconds) {
      await this.client.set(key, value, 'EX', expirationInSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Retrieves the value associated with the specified key from the Redis database.
   *
   * @param key - The key whose associated value is to be retrieved.
   * @returns A promise that resolves to the value as a string if the key exists,
   *          or `null` if the key does not exist.
   */
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * Deletes a key from the Redis database.
   *
   * @param key - The key to be deleted from the Redis database.
   * @returns A promise that resolves to the number of keys that were removed.
   */
  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  /**
   * Checks if a given key exists in the Redis database.
   *
   * @param key - The key to check for existence in the Redis database.
   * @returns A promise that resolves to the number of keys that exist (0 if the key does not exist, 1 if it does).
   */
  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }
}

import { TypeOrmModule } from '@nestjs/typeorm';

export const databaseConfig = () =>
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'postgres',
    entities: ['dist/**/*.entity{.ts,.js}'],
    dropSchema: process.env.NODE_ENV === 'development',
    synchronize: true,
  });

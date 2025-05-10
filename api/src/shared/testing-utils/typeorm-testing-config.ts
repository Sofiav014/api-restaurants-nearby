import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';
import { UserEntity } from '../../users/entities/user.entity';

export const TypeOrmTestingConfig = () => [
  TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
  TypeOrmModule.forFeature([UserEntity, TransactionEntity]),
];

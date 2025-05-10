import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, UserEntity]),
    RedisModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, UsersService],
  exports: [TransactionsService],
})
export class TransactionsModule {}

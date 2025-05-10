import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: true,
  })
  user_id: string | null;

  @Column()
  endpoint: string;

  @Column()
  method: string;

  @Column()
  status_code: number;

  @CreateDateColumn()
  created_at: Date;
}

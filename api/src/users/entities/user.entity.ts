import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Represents a user entity in the system.
 * This entity is mapped to a database table using TypeORM.
 */
@Entity()
export class UserEntity {
  /**
   * The unique identifier for the user.
   * This is a UUID generated automatically.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The username of the user.
   */
  @Column()
  username: string;

  /**
   * The full name of the user.
   */
  @Column()
  name: string;

  /**
   * The password of the user.
   * This field is excluded from serialization.
   */
  @Column()
  @Exclude()
  password: string;

  /**
   * Constructs a new instance of the UserEntity class.
   * Allows partial initialization of the entity's properties.
   *
   * @param partial - An object containing partial properties of the user entity.
   */
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

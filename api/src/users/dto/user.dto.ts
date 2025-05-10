import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'Username',
    type: String,
    required: true,
    example: 'johndoe1',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User password',
    type: String,
    required: true,
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'User name',
    type: String,
    required: true,
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

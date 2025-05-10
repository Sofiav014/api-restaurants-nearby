import { ApiProperty } from '@nestjs/swagger';

export class RestaurantResponseDto {
  @ApiProperty({
    example: 'El Buen Sabor',
    description: 'Nombre del restaurante',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 'Cra. 7 #32-16, Bogotá, Colombia',
    description: 'Dirección del restaurante',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: 4.5,
    description: 'Calificación del restaurante',
    required: false,
  })
  rating?: number;

  @ApiProperty({
    example: 'https://maps.google.com/?cid=1234567890123456789',
    description: 'Enlace a Google Maps para más información',
    required: false,
  })
  more_info?: string;
}

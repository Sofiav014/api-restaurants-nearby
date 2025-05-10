import { registerAs } from '@nestjs/config';

export default registerAs('maps', () => ({
  apiKey: process.env.MAPS_PLATFORM_API_KEY || 'defaultApiKey',
  apiUrl: process.env.PLACES_API_URL || 'defaultPlacesApiUrl',
  geoCodingApiUrl: process.env.GEOCODING_API_URL || 'defaultGeoCodingApiUrl',
}));

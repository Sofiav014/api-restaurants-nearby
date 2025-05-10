import { registerAs } from '@nestjs/config';

export default registerAs('places', () => ({
  apiKey: process.env.PLACES_API_KEY || 'defaultApiKey',
  apiUrl: process.env.PLACES_API_URL || 'defaultApiUrl',
  geoCodingApiUrl: process.env.GEO_CODING_API_URL || 'defaultGeoCodingApiUrl',
}));

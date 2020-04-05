import fs from 'fs';
import { EtradeClient } from './configured-client';

const etrade = EtradeClient.fromEnvironment();

etrade.authenticatedRequest('get', '/v1/market/quote/MSFT.json')
  .then(({ body }) => console.log(JSON.stringify(body, null, '\t')))
  .catch(console.error);

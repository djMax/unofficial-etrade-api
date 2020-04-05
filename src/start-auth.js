import fs from 'fs';
import opn from 'opn';
import readline from 'readline';
import { EtradeClient } from './configured-client';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const etrade = EtradeClient.fromEnvironment();

etrade.getAuthInfo()
  .then((tokenInfo) => {
    console.log('Opening browser to', tokenInfo.url);
    opn(tokenInfo.url);
    return new Promise((accept) => {
      const prompt = 'Enter the code you receive after completing authorization: ';
      rl.question(prompt, code => accept([tokenInfo, code]));
    });
  })
  .then(([tokenInfo, code]) => etrade.getAccessToken(tokenInfo, code))
  .then(({ body: authInfo }) => {
    fs.writeFileSync('./.keys.json', JSON.stringify(authInfo, null, '\t'));
    console.log('Wrote keys to .keys.json');
    rl.close();
  });

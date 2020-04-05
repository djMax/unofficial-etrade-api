import tap from 'tap';
import sign from '../src/sign';

tap.test('test_sign', (test) => {
  const oauthSpecValues = sign({
    method: 'GET',
    uri: 'http://photos.example.net/photos',
    params: {
      oauth_nonce: 'kllo9940pd9333jh',
      oauth_timestamp: '1191242096',
      oauth_token: 'nnch734d00sl2jdk',
      oauth_consumer_key: 'dpf43f3p2l4k3l03',
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
      file: 'vacation.jpg',
      size: 'original',
    },
    clientSecret: 'kd94hf93k423kf44',
    tokenSecret: 'pfkkdhi9sl3r4s00',
  });
  test.strictEquals(oauthSpecValues, 'tR3+Ty81lMeYAr/Fid0kMTYa/WM=', 'Should match oauth spec example');

  const knownValues = sign({
    method: 'GET',
    uri: 'https://api.etrade.com/v1/accounts/list',
    params: {
      oauth_nonce: '0bba225a40d1bbac2430aa0c6163ce44',
      oauth_timestamp: '1344885636',
      oauth_token: 'VbiNYl63EejjlKdQM6FeENzcnrLACrZ2JYD6NQROfVI=',
      oauth_consumer_key: 'c5bb4dcb7bd6826c7c4340df3f791188',
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
    },
    clientSecret: '7d30246211192cda43ede3abd9b393b9',
    tokenSecret: 'XCF9RzyQr4UEPloA+WlC06BnTfYC1P0Fwr3GUw/B0Es=',
  });
  test.strictEquals(encodeURIComponent(knownValues), '%2FXiv96DzZabnUG2bzPZIH2RARHM%3D', 'Should match known values');
  test.end();
});

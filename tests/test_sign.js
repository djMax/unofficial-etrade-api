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
  test.end();
});

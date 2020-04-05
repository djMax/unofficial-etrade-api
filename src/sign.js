import { hmacsign } from 'oauth-sign';

export default function authorizationHeader({ method, uri, params, clientSecret, tokenSecret }) {
  return hmacsign(method, uri, params, clientSecret, tokenSecret);
}

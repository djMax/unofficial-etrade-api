import fs from 'fs';
import crypto from 'crypto';
import qs from 'querystring';
import OAuth from 'oauth-1.0a';
import request from 'superagent';

const SECRETS = Symbol('eTrade client secrets');

export class EtradeClient {
  constructor(config) {
    const { clientId, clientSecret, accessToken, accessTokenSecret, isProduction, webSecret } = config;
    this.oauth = OAuth({
      consumer: { key: clientId, secret: clientSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString, signingKey) {
        return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
      },
    });
    this.uniqueId = crypto.createHash('sha256').update(clientId).digest('base64');
    this.isProduction = isProduction;
    this.webSecret = webSecret;
    this[SECRETS] = { clientId, accessToken, accessTokenSecret };
    if (accessToken) {
      this.authorized = true;
    }
  }

  /**
   * Get the authentication URL and token key/secret.
   */
  async getAuthInfo() {
    const tokenRequest = {
      url: 'https://api.etrade.com/oauth/request_token',
      method: 'GET',
      data: {
        oauth_callback: 'oob',
        format: 'json',
      },
    };

    const { body } = await request.get(tokenRequest.url).query(this.oauth.authorize(tokenRequest));
    const { oauth_token: token, oauth_token_secret: secret } = body;
    return {
      token,
      secret,
      url: `https://us.etrade.com/e/t/etws/authorize?key=${this[SECRETS].clientId}&token=${token}`,
    };
  }

  async getAccessToken(tokenInfo, code) {
    const accessRequest = {
      url: 'https://api.etrade.com/oauth/access_token',
      method: 'get',
      data: {
        oauth_verifier: code,
      },
    };
    const tokenQuery = this.oauth.authorize(accessRequest, { key: tokenInfo.token, secret: tokenInfo.secret });
    return request.get(accessRequest.url).query(tokenQuery)
      .then(response => response.body);
  }

  authenticatedRequest(method, path, query) {
    const host = this.isProduction ? 'api' : 'apisb';
    const r = {
      method: method.toUpperCase(),
      url: `https://${host}.etrade.com${path}`,
    };
    if (query) {
      r.data = query;
    }
    const oauthQuery = this.oauth.authorize(r, { key: this[SECRETS].accessToken, secret: this[SECRETS].accessTokenSecret });
    return request[method.toLowerCase()](r.url).set(this.oauth.toHeader(oauthQuery));
  }

  optionsChain(symbol, options) {
    const query = qs.stringify({ ...options, symbol });
    return this.authenticatedRequest('get', `/v1/market/optionchains.json?${query}`)
      .then(r => r.body?.OptionChainResponse);
  }

  quote(symbol) {
    return this
      .authenticatedRequest('get', `/v1/market/quote/${symbol}.json`)
      .then(r => r.body?.QuoteResponse?.QuoteData);
  }

  static fromEnvironment() {
    let keys = {};
    try {
      const {
        web_secret: webSecret,
        oauth_token: accessToken,
        oauth_token_secret: accessTokenSecret,
      } = JSON.parse(fs.readFileSync('./.keys.json', 'utf8'));
      keys = { accessToken, accessTokenSecret, webSecret };
    } catch (error) {
      // Nothing to do
    }
    return new EtradeClient({
      ...keys,
      clientId: process.env.ETRADE_KEY,
      clientSecret: process.env.ETRADE_SECRET,
      isProduction: process.env.ETRADE_ENV === 'production',
    });
  }
}

exports.ETrade = EtradeClient;

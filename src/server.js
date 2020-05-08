#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import EtradeClient from '.';

const app = express();
const client = EtradeClient.fromEnvironment();

const port = process.env.PORT || 3000;

app.use(express.static('web'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: client.uniqueId,
  name: 'quote_session',
}));

app.get('/auth/go', async (req, res) => {
  const tokenInfo = await client.getAuthInfo();
  req.session.auth = tokenInfo;
  req.session.save(() => {
    res.redirect(tokenInfo.url);
  });
});

app.post('/auth/complete', async (req, res) => {
  const authInfo = await client.getAccessToken(req.session.auth, req.body.code);
  console.error(authInfo);
  client.webSecret = uuid();
  console.log('API secret (passed as either Authorization header or key query string argument:', client.webSecret);
  fs.writeFileSync('./.keys.json', JSON.stringify({
    ...authInfo,
    web_secret: client.webSecret,
  }, null, '\t'));
  res.redirect(`/api.html?key=${client.webSecret}`);
});

function auth(req, res, next) {
  const callerSecret = req.query.key || req.headers?.authorization;
  if (callerSecret !== client.webSecret) {
    res.sendStatus(401);
    return;
  }
  next();
}

app.get('/quote', auth, async (req, res) => {
  const info = await client.quote(req.query.symbol);
  res.json(info);
});

app.get('/options', auth, async (req, res) => {
  const { symbol, key, ...rest } = req.query;
  const info = await client.optionsChain(symbol, rest);
  res.json(info);
});

app.listen(port, () => {
  if (process.env.QUIET !== 'true') {
    if (client.webSecret) {
      console.log('Local API secret key is', client.webSecret);
    } else {
      console.log(`E*Trade is not yet authorized. Go to http://localhost:${port}/auth.html`);
    }
    console.log(`E*Trade API Proxy Listening on ${port}`);
  }
});

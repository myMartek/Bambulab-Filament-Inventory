import 'dotenv/config';
import express from 'express';
import { expressjwt } from 'express-jwt';
import cryptoRandomString from 'crypto-random-string';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import data from './src/hass-bambulab.js';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app = express();

// Generate a random secret for JWT signing
const secret = process.env.DEBUG ? 'unsecure' : cryptoRandomString({ length: 64 });

// Add json body parser
app.use(express.json());

// Add CORS
app.use(cors());

// Use Express JWT to validate JWT tokens
// Disable JWT validation for /oauth/token / and all static files
app.use(
  expressjwt({
    secret,
    algorithms: ['HS256'],
  }).unless((path) => {
    var url = path.originalUrl;
    
    if (url === '/oauth/token') {
      return true;
    }

    if (url === '/') {
      return true;
    }

    if (url.startsWith('/assets/')) {
      return true;
    }

    if (url.startsWith('/favicon.ico')) {
      return true;
    }

    return false;
  })
);

app.get('/', async (req, res) => {
  let content = await fs.readFile('./frontend/dist/index.html', 'utf-8');

  res.send(content);
});

// Implement (deprecated) OAuth 2.0 password grant
app.post('/oauth/token', (req, res) => {
  if (req.body.grant_type !== 'password') {
    res.status(400).send('Invalid grant type');
    return;
  }

  if (req.body.username !== process.env.AUTH_USER || req.body.password !== process.env.AUTH_PASSWORD) {
    res.status(401).send('Invalid credentials');
    return;
  }

  res.json({
    access_token: jwt.sign({ sub: req.body.username }, secret, {
      algorithm: 'HS256',
      expiresIn: process.env.DEBUG ? '10y' : '8h',
    }),
    token_type: 'Bearer',
    expires_in: process.env.DEBUG ? 315360000 : 28800
  });
});

app.get('/filaments', async (req, res) => {
  res.send(Object.keys(data).map(key => data[key]));
});

app.post('/delete', async (req, res) => {
  const { tag_uid } = req.body;

  delete data[tag_uid];

  await fs.writeFile('./data/hass-data.json', JSON.stringify(data));

  res.send(Object.keys(data).map(key => data[key]));
});

app.post('/update', async (req, res) => {
  let { tag_uid } = req.body;

  if (!tag_uid) {
    tag_uid = uuidv4();
  }

  if (req.body.color?.length === 7) {
    req.body.color = req.body.color + 'FF';
  }

  req.body.color = req.body.color.toUpperCase();

  if (!data[tag_uid]) {
    data[tag_uid] = {
      tag_uid,
      type: 'Unknown',
      manufacturer: 'Unknown',
      remain: 0,
      color: '#FFFFFFFF',
      empty: true,
      name: 'Unknown',
      size: 1000,
      ...req.body,
      tracking: false
    };
  } else {
    data[tag_uid] = {
      ...data[tag_uid],
      ...req.body
    };
  }

  await fs.writeFile('./data/hass-data.json', JSON.stringify(data));

  res.send(Object.keys(data).map(key => data[key]));
});

// deliver static files from frontend/dist
app.use(express.static('frontend/dist'));

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});

require('dotenv').config();

import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import schema from './schema';
import googleAuth from './auth/google';
import facebookAuth from './auth/facebook';
import { Token } from './models';

console.log('Starting server for env:', process.env.NODE_ENV);

const PORT = process.env.PORT || 4000;
const SITE_URL = process.env.SITE_URL;

const app = express();

app.use(cors());

app.use(helmet());
app.use(compression());
app.use(express.json());

const initServer = async() => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useCreateIndex: true });
  } catch (e) {
    console.warn('Handled MongoDB Error, restarting in 5sec');
    return setTimeout(initServer, 5000);
  }
  
  googleAuth({ SITE_URL, app });
  facebookAuth({ SITE_URL, app });
  
  const getToken = ({ headers }) => {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
  };
  
  const server = new ApolloServer({
    schema,
    context: async({ req }) => {
      const tokenKey = getToken(req);
      if (tokenKey) {
        const token = await Token.findOne({ key: tokenKey });
        if (token) {
          let verifiedToken;
          try {
            verifiedToken = token.verify();
          } catch (err) {
            verifiedToken = null;
          }
          if (verifiedToken) {
            const business = await token.owner;
            if (business && verifiedToken.authId == business.id) {
              return { token, business };
            }
          }
          return { token };
        }
      }
      return null;
    },
  });
  
  server.applyMiddleware({ app });
};

app.get('/', (req, res, next) => {
  res.send('This is Inkwell API server');
});


const ws = createServer(app);

ws.listen(PORT, () => {
  console.log(`GraphQL Server is now running on http://localhost:4000`);
  new SubscriptionServer({
    execute,
    subscribe,
    schema
  }, {
    server: ws,
    path: '/subscriptions',
  });
});

initServer();
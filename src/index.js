require('dotenv').config();

import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';
import { ApolloServer, graphiqlExpress, makeExecutableSchema } from 'apollo-server-express';
import mongoose from 'mongoose';
import _ from 'lodash';
import { Comment, Like, Types, Message, User, Work, Job, Event, Team, Tag, Dialogue, Location } from './resolvers';
import typeDefs from './typeDefs';

import googleAuth from './auth/google';
import facebookAuth from './auth/facebook';


import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
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
    typeDefs,
    resolvers: _.merge(Comment, Like, Types, User, Work, Job, Event, Team, Message, Tag, Dialogue, Location),
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
            const user = await token.owner;
            // console.log('token user', user.id, decoded, decoded.authId);
            if (user && verifiedToken.authId == user.id) {
              return { token, user };
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
    schema: makeExecutableSchema({ typeDefs, resolvers: _.merge(Comment, Like, Types, User, Work, Job, Event, Team, Message, Tag, Dialogue, Location) })
  }, {
    server: ws,
    path: '/subscriptions',
  });
});

initServer();
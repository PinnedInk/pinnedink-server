import _ from 'lodash';
import jwt from 'jsonwebtoken';
import request from 'request';
import { User, Business, Token, Team, Message, Like, Comment, Event, Job, Work, Dialogue, Tag } from '../models';
import { google } from 'googleapis';
import { FB } from 'fb';
import { removeIds, createTag } from '../utils';
import moment from 'moment';


const sendVerificationMail = async(email) => {
  const sessionSecret = process.env.SESSION_SECRET;
  const tokenKey = jwt.sign({
    authId: email
  }, sessionSecret, { expiresIn: '1d' });
  
  const token = await Token.findOneAndUpdate({ ownerId: email, provider: 'email-verification' }, {
    key: tokenKey,
    date: new Date()
  }, { upsert: true, new: true });
  const API_URL = 'https://zat932sfo2.execute-api.us-east-1.amazonaws.com/prod/sendVerificationEmail';
  return new Promise((resolve, reject) => request.post(
    API_URL,
    { json: { email, token: tokenKey.substr(tokenKey.length - 43) } },
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else if (error) {
        reject(error);
      }
    }
  ));
};

const verifyGoogleProvider = async(values, token, user) => {
  const { code } = values;
  const CLIENT_ID = process.env.Google_clientID;
  const CLIENT_SECRET = process.env.Google_clientSecret;
  const SITE_URL = process.env.SITE_URL;
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, `${SITE_URL}/auth/google`);
  let email, avatarUrl, thumbUrl, name;
  const { tokens } = await oauth2Client.getToken(code);
  const ticket = await oauth2Client.verifyIdToken({ idToken: tokens['id_token'], audience: CLIENT_ID });
  //console.log('ticket', ticket);
  const payload = ticket.getPayload();
  avatarUrl = payload.picture + '?sz=400';
  thumbUrl = payload.picture + '?sz=200';
  name = payload.name;
  email = payload.email;
  try {
    return updateUser({ email, name, thumbUrl, avatarUrl }, 'google');
  } catch (err) {
    console.log(err);
  }
  
  return null;
};

const verifyFacebookProvider = async(values, token, user) => {
  const { code } = values;
  const CLIENT_ID = process.env.FACEBOOK_APP_ID;
  const CLIENT_SECRET = process.env.FACEBOOK_APP_SECRET;
  const SITE_URL = process.env.SITE_URL;
  const { access_token: accessToken } = await FB.api('oauth/access_token', {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: `${SITE_URL}/auth/facebook`,
    code: code
  });
  
  // console.log('accessToken', accessToken);
  return new Promise(resolve => {
    FB.api('me', { fields: ['name', 'email', 'picture'], access_token: accessToken }, async(payload) => {
      var email = payload.email,
        name = payload.name,
        thumbUrl = payload.picture.data.url,
        avatarUrl = payload.picture.data.url;
      try {
        console.log('payload.picture.data.url', payload.picture.data.url);
        resolve(await updateUser({ email, name, thumbUrl, avatarUrl }, 'facebook'));
      } catch (err) {
        console.log(err);
      }
    });
  });
};

const verifyTwitterProvider = async(values, token, user) => {
  const { code } = values;
  const CLIENT_ID = process.env.TWITTER_APP_ID;
  const CLIENT_SECRET = process.env.TWITTER_APP_SECRET;
  console.log('twitter', values, token, user);
};

export default {
  Query: {
    currentUser: async(_, values, { token, user }) => {
      if (token && user) {
        return user;
      }
      return null;
    },
    user: async(_, { id, email }) => {
      if (id) {
        let user = await Business.findOne({ id });
        return user;
      }
      if (email) {
        return await Business.findOne({ email });
      }
      return null;
    },
    verifyEmailToken: async(_, { token: verifyToken, email }) => {
      //TODO: Add date validatuin
      let token = await Token.findOne({
        'key': { $regex: verifyToken },
        ownerId: email,
        provider: 'email-verification'
      });
      if (token && token.verify()) {
        await token.remove();
        const user = Business.findOne({ email });
        if (user) {
          return true;
        }
      }
      return false;
    },
    verify: async(_, values, { token, user }) => {
      const { provider } = values;
      if (provider == 'google') {
        try {
          return await verifyGoogleProvider(values, token, user);
        } catch (err) {
          console.log('Error on login', err);
        }
      } else if (provider == 'facebook') {
        return await verifyFacebookProvider(values, token, user);
      } else if (provider == 'twitter') {
        return await verifyTwitterProvider(values, token, user);
      }
      return null;
    },
  },
  Mutation: {
    login: async(_, { email, password }) => {
      const business = await Business.findOne({ email });
      if (business && business.validPassword(password)) {
        const sessionSecret = process.env.SESSION_SECRET;
        const emailToken = await Token.findOne({ email, provider: 'email-verification' });
        if (emailToken) {
          return new Error('E-mail should be verified.');
        }
        const token = await Token.findByIdAndUpdate(business.tokenId, {
          key: jwt.sign({
            authId: business.id
          }, sessionSecret, { expiresIn: '1d' }),
          ownerId: email,
          provider: 'email'
        }, { new: true, upsert: true });
        business.tokenId = token.id;
        await business.save();
        return business;
      }
      return new Error('Wrong email or password');
    },
    logout: async(_, data, { token, user }) => {
      if (token) {
        await Token.findOneAndRemove({ key: token.key });
        token = null;
      } else {
        return new Error('Token missing');
      }

      if (user) {
        user.tokenId = null;
        user.save();
        return null;
      } else {
        return new Error('User missing');
      }
    },
    addNewBusiness: async(err, { companyName, name, phoneNumber, email, password}, { business, token }) => {
      if (business) {
        return new Error(`Should be not-authorized to create business`);
      }

      let existingBusiness = await Business.findOne({ email });
      if (!existingBusiness || existingBusiness == null) {
        password = Business.generateHash(password);
        const sessionSecret = process.env.SESSION_SECRET;
        try {
          const business = await Business.create({ email, password, companyName, name, phoneNumber });
          await sendVerificationMail(email);
        } catch (e) {
          return new Error('Sending mail generated error');
        } finally {
          return business;
        }
      }
      return new Error(`User with email ${email} exists`);
    },
    sendVerifyEmail: async(_, { email }) => {
      try {
        await sendVerificationMail(email);
        return true;
      } catch (err) {
        return false;
      }
    },
  }
};
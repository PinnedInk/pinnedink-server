import jwt from 'jsonwebtoken';
import request from 'request';
import { Business, Token } from '../models';
import { google } from 'googleapis';
import { FB } from 'fb';


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

export default {
  Query: {
    currentUser: async(_, values, { token, business }) => {
      if (token && business) {
        return business;
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
    addNewBusiness: async(err, { companyName, name, phoneNumber, email, password }, { business, token }) => {
      if (business) {
        return new Error(`Should be not-authorized to create business`);
      }
      let existingBusiness = await Business.findOne({ email });
      if (!existingBusiness || existingBusiness == null) {
        password = Business.generateHash(password);
        const sessionSecret = process.env.SESSION_SECRET;
        try {
          business = await Business.create({ email, password, companyName, name, phoneNumber });
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
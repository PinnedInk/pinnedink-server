import _ from 'lodash';
import jwt from 'jsonwebtoken';
import request from 'request';
import { User, Token, Team, Business } from '../models';
import { FB } from 'fb';
import moment from 'moment';

export default {
  Query: {
    currentUser: async(_, values, { token, user }) => {
      if (token && user) {
        return user;
      }
      return null;
    },
    user: async(_, { inkname, email }) => {
      if (inkname) {
        let user = await User.findOne({ inkname });
        if (!user) {
          return await Team.findOne({ inkname });
        }
        return user;
      }
      if (email) {
        return await User.findOne({ email });
      }
      return null;
    },
  },
  Mutation: {
    login: async(_, { email, password }) => {
      const user = await User.findOne({ email });
      
      if (user && user.validPassword(password)) {
        const sessionSecret = process.env.SESSION_SECRET;
        const emailToken = await Token.findOne({ email, provider: 'email-verification' });
        if (emailToken) {
          return new Error('E-mail should be verified.');
        }
        const token = await Token.findByIdAndUpdate(user.tokenId, {
          key: jwt.sign({
            authId: user.id
          }, sessionSecret, { expiresIn: '1d' }),
          ownerId: email,
          provider: 'email'
        }, { new: true, upsert: true });
        user.tokenId = token.id;
        await user.save();
        return user;
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
    createUser: async(err, { email, password }, { user, token }) => {
      if (user) {
        return new Error(`Should be not-authorized to create user`);
      }
      
      let existingUser = await User.findOne({ email });
      if (!existingUser) {
        password = User.generateHash(password);
        const sessionSecret = process.env.SESSION_SECRET;
        try {
          const user = await User.create({ email, password });
          await sendVerificationMail(email);
        } catch (e) {
          return new Error('Sending mail generated error');
        } finally {
          return user;
        }
      }
      return new Error(`User with email ${email} exists`);
    },
  }
};
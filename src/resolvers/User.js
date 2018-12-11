import _ from 'lodash';
import jwt from 'jsonwebtoken';
import request from 'request';
import { User, Token, Team, Message, Like, Comment, Event, Job, Work, Dialogue, Tag } from '../models';
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

const updateUser = async({ email, name, thumbUrl, avatarUrl }, provider) => {
  const payload = _.pickBy({
    avatarUrl,
    thumbUrl,
    name
  }, v => !!v);
  const user = await User.findOneAndUpdate({
    email
  }, payload, { upsert: true, new: true });
  const sessionSecret = process.env.SESSION_SECRET;
  const token = await Token.findByIdAndUpdate(user.tokenId, {
    key: jwt.sign({
      authId: user.id
    }, sessionSecret, { expiresIn: '1d' }),
    ownerId: email,
    provider
  }, { new: true, upsert: true });
  user.tokenId = token.id;
  await user.save();
  return user;
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
    verifyEmailToken: async(_, { token: verifyToken, email }) => {
      //TODO: Add date validatuin
      let token = await Token.findOne({
        'key': { $regex: verifyToken },
        ownerId: email,
        provider: 'email-verification'
      });
      if (token && token.verify()) {
        await token.remove();
        const user = User.findOne({ email });
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
    currentUser: async(_, values, { token, user }) => {
      if (token && user) {
        return user;
      }
      return null;
    },
    users: async(_, values) => {
      return User.find({
        inkname: {
          $exists: true
        }
      });
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
    filteredUsers: async(_, { value }) => {
      if (value) {
        let user = await User.find({ 'inkname': { $regex: '^' + value, $options: 'i' } });
        if (!user) {
          user = await Team.find({ 'inkname': { $regex: '^' + value, $options: 'i' } });
        }
        return user;
      }
    },
  },
  Mutation: {
    sendVerifyEmail: async(_, { email }) => {
      try {
        await sendVerificationMail(email);
        return true;
      } catch (err) {
        return false;
      }
    },
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
    validateUserName: async(_, { inkname }) => {
      let user;
      if (inkname) {
        user = await User.findOne({ inkname });
        if (!user) {
          user = await Team.findOne({ inkname });
        }
      }
      return user;
    },
    follow: async(_, { inkname }, { user }) => {
      let target = null;
      let subscriber = user;
      if (inkname) {
        target = await User.findOne({ inkname });
        if (!target) {
          target = await Team.findOne({ inkname });
        }
      }
      let targetId = subscriber.followingIds.indexOf(target.id);
      let subscribeId = target.followersIds.indexOf(subscriber.id);
      if (targetId !== -1) {
        subscriber.followingIds.splice(targetId, 1);
        target.followersIds.splice(subscribeId, 1);
      } else {
        subscriber.followingIds.push(target.id);
        target.followersIds.push(user.id);
      }
      await subscriber.save();
      await target.save();
      return subscriber;
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
    updateUser: async(err, { name, inkname, description, avatarUrl, email, password, tags }, { user }) => {
      let thumbUrl;
      if (!user) {
        return new Error('Authorization required');
      }
      if (password) {
        password = password && User.generateHash(password);
      }
      if (avatarUrl) {
        thumbUrl = `avatar/thumbnail/${avatarUrl}`;
        avatarUrl = `avatar/${avatarUrl}`;
      }
      if (tags) {
        await createTag(tags, user);
      }
      const payload = _.pickBy({
        name,
        inkname,
        password,
        avatarUrl,
        thumbUrl,
        email,
        description
      }, v => !!v);
      return User.findOneAndUpdate({ '_id': user.id }, payload, { new: true });
    },
    removeUser: async(err, { _ }, { user, token }) => {
      if (!user) {
        return new Error('Authorization required');
      }
      if (token) {
        await Token.findOneAndRemove({ key: user.key });
        token = null;
      } else {
        return new Error('Token missing');
      }
      
      await user.followersIds.forEach(async(followerId) => {
        let follower = await User.findById(followerId);
        await removeIds(follower, user.id, 'followingIds');
      });
      
      await user.followingIds.forEach(async(followingId) => {
        let following = await User.findById(followingId);
        await removeIds(following, user.id, 'followersIds');
      });
      
      await Like.deleteMany({ author: user.id });
      await Job.deleteMany({ authorId: user.id });
      await Event.deleteMany({ authorId: user.id });
      await Comment.deleteMany({ authorId: user.id });
      await Message.deleteMany({ authorId: user.id });
      await Team.deleteMany({ ownerId: user.id });
      await Work.deleteMany({ authorId: user.id });
      await User.findByIdAndRemove(user.id);
      return null;
    },
    applyInvite: async(_, { inkname, messageId }, { user }) => {
      const team = await Team.findOne({ inkname });
      const message = await Message.findByIdAndRemove(messageId);
      const dialogueId = message.targetId;
      await Dialogue.findOneAndUpdate(
        { _id: dialogueId },
        { $pull: { messagesIds: message.id } },
        { new: true }
      );
      user.teamId = team.id;
      if (team.membersIds.indexOf(user.id) !== -1) {
        return null;
      }
      team.membersIds.push(user.id);
      await user.save();
      await team.save();
      return user;
    },
    toggleEffect: async(__, { type }, { user }) => {
      const isExistEffect = _.find(user.effects, { type });
      if (isExistEffect) {
        return await User.findOneAndUpdate(
          { _id: user.id },
          { $pull: { effects: { _id: isExistEffect.id } } },
          { new: true }
        );
      } else {
        return await User.findOneAndUpdate(
          { _id: user.id },
          { $addToSet: { effects: { type: type } } },
          { new: true }
        );
      }
    },
    leaveTeam: async(_, { inkname }, { user }) => {
      await Team.findOneAndUpdate(
        { inkname },
        { $pull: { membersIds: user.id } },
        { new: true }
      );
      user.teamId = null;
      await user.save();
      return user;
    },
    removeTeam: async(_, { id }, { user }) => {
      const team = await Team.findByIdAndRemove(id);
      
      if (team.followersIds.length) {
        await User.bulkWrite(team.followersIds.map((id => ({
          updateOne: {
            filter: { '_id': id },
            update: { $pull: { followingIds: team.id } },
            new: true
          }
        }))));
      }
      if (team.dialogueIds.length) {
        team.dialogueIds.forEach(async(id) => {
          const dialogue = await Dialogue.findById(id);
          if (dialogue.membersIds.length) {
            await User.bulkWrite(dialogue.membersIds.map((id => ({
              updateOne: {
                filter: { '_id': id },
                update: { $pull: { dialogueIds: dialogue.id } },
                new: true
              }
            }))));
          }
          if (dialogue.messagesIds.length) {
            await Message.deleteMany({ targetId: dialogue.id });
          }
        });
      }
      if (team.membersIds.length) {
        await User.bulkWrite(team.membersIds.map((id => ({
          updateOne: {
            filter: { '_id': id },
            update: { teamId: null },
            new: true
          }
        }))));
      }
      if (team.tags.length) {
        await Tag.bulkWrite(team.tags.map((tag => ({
          updateOne: {
            filter: { tagname: tag },
            update: { $inc: { rating: -1 } },
            upsert: true
          }
        }))));
      }
      await Dialogue.deleteMany({ authorId: team.id });
      user.teamId = null;
      await user.save();
      return user;
    },
  }
};
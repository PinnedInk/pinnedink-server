import passport from 'passport';
import { OAuth2Strategy } from 'passport-google-oauth';
import jwt from 'jsonwebtoken';
import _ from "lodash";
import { User, Token } from '../models';
// import Session from '../models/Session';

const { Strategy } = OAuth2Strategy;

const auth = ({ROOT_URL, app}) => {
  const SITE_URL = process.env.SITE_URL;
  const verify = async (accessToken, refreshToken, profile, verified) => {
    let email;
    let avatarUrl, thumbUrl;
    if (profile.emails) {
      email = profile.emails[0].value;
    }

    if (profile.photos && profile.photos.length > 0) {
      avatarUrl = profile.photos[0].value.replace('sz=50', 'sz=128');
      thumbUrl = profile.photos[0].value;
    }

    try {
      /*
      googleToken: { accessToken, refreshToken },
      displayName: profile.displayName,
      googleId: profile.id,
      */
      
      const user = await User.findOneAndUpdate({ email }, { avatarUrl, thumbUrl }, { new: true });
      const token = new Token({
        key: jwt.sign({ accessToken, refreshToken }, user.id, { expiresIn: '1h' }),
        ownerId: email,
        date: new Date(),
        provider: 'google'
      });
      verified(null, user);
    } catch (err) {
      verified(err);
      // console.log(err, profile); // eslint-disable-line
    }
  };

  passport.use(new Strategy({
    clientID: process.env.Google_clientID,
    clientSecret: process.env.Google_clientSecret,
    callbackURL: `${SITE_URL}/auth/google`
  }, verify));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser( async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });

  app.get('/auth/google', (req, res, next) => {
    const options = {
      scope: ['profile', 'email'],
      prompt: 'select_account'
    };
    passport.authenticate('google', options)(req, res, next);
  });
}

module.exports = auth;
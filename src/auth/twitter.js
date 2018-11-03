import passport from 'passport';
import Strategy from 'passport-twitter';
import jwt from 'jsonwebtoken';
import _ from "lodash";
import { User, Token } from '../models';
// import Session from '../models/Session';

const auth = ({ROOT_URL, app}) => {

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
        provider: 'twitter'
      });
      verified(null, user);
    } catch (err) {
      verified(err);
      // console.log(err, profile); // eslint-disable-line
    }
  };

  passport.use(new Strategy({
    consumerKey: process.env.TWITTER_APP_ID,
    consumerSecret: process.env.TWITTER_APP_SECRET,
    callbackURL: `https://theink-30b2a.firebaseapp.com/__/auth/handler`
  }, verify));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser( async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });

  app.get('/auth/twitter', (req, res, next) => {
    const options = {
      scope: ['profile', 'email'],
      prompt: 'select_account'
    };
    passport.authenticate('twitter', options)(req, res, next);
  });
}

module.exports = auth;
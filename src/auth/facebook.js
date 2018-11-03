import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy } from 'passport-facebook';
import _ from "lodash";
import { User, Token } from '../models';
// import Session from '../models/Session';

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
      console.error(err, profile); // eslint-disable-line
    }
  };

  passport.use(new Strategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${SITE_URL}/auth/facebook`
  }, verify));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser( async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });

  app.get('/auth/facebook', (req, res, next) => {
    const options = {
      scope: ['email'],
      prompt: 'select_account'
    };
    passport.authenticate('facebook', options)(req, res, next);
  });

  app.get('/verify/facebook', passport.authenticate('facebook'), 
    async (req, res) => {
      if (!req.user) {
        return res.status(400).send('Authentication Error');
      }

      if (req.user) {
        return res.status(200).send();
      }

      return res.status(500).send('Unhandled error');
    }
  )
}

module.exports = auth;
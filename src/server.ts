//import MongoStore from 'connect-mongo'
import { createClient } from '@supabase/supabase-js';
import express from 'express'
import passport from 'passport';
import payload from 'payload'
import cors from 'cors'
import getCookieExpiration from 'payload/dist/utilities/getCookieExpiration';
import express_session from 'express-session';
import jwt from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv'
import axios from 'axios';
import crypto from 'crypto';
import OAuth2Strategy from 'passport-oauth2';
import pg from 'pg';
import _pgSession from 'connect-pg-simple'

const pgSession = _pgSession(express_session);

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})


async function findOrCreateUser(collectionSlug, sub, email, pictureUrl) {

  let users = await payload.find({
    collection: collectionSlug,
    where: { sub: { equals: sub } },
    showHiddenFields: true,
  });

  if (users.docs && users.docs.length) {
    let user = users.docs[0];
    user.collection = collectionSlug;
    user._strategy = "googleOauth";
    return user;
  } else {

    const randomPassword = crypto.randomBytes(20).toString('hex');

    return await payload.create({
      collection: collectionSlug,
      data: {
        email: email,
        sub: sub,
        pictureURL: pictureUrl,
        password: randomPassword,
      },
      showHiddenFields: true,
    });
  }
}


const PORT = process.env.PORT || 3000

const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URI || '',
});

const app = express()
app.use(cors());


app.get('/oauth2/authorize', passport.authenticate('googleOauth'));


app.get(
  '/oauth/google/callback',
  express_session({
    store: new pgSession({
      pool: pgPool,
      tableName: 'user_sessions'
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.PAYLOAD_SECRET || 'default_secret',
  }),

  passport.authenticate('googleOauth', { failureRedirect: '/login' }),
  function (req, res) {
    const collectionConfig = payload.collections["user"].config;

    console.log('collectionConfig', collectionConfig)

    const userProfile = req.user;

    console.log('userProfile', userProfile)

    let fieldToSign = {
      email: userProfile.email,
      id: userProfile.id,
      collection: 'user'
    };

    const token = jwt.sign(fieldToSign, payload.secret, {
      expiresIn: collectionConfig.auth.tokenExpiration
    });

    res.cookie(`${payload.config.cookiePrefix}-token`, token, {
      path: "/",
      httpOnly: true,
      expires: getCookieExpiration(collectionConfig.auth.tokenExpiration),
      secure: collectionConfig.auth.cookies.secure,
      sameSite: collectionConfig.auth.cookies.sameSite,
      domain: collectionConfig.auth.cookies.domain || undefined,
    });

    res.redirect("/admin");
  }
);



const GoogleOAuthStrategy = new OAuth2Strategy({
  authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile',
  tokenURL: 'https://accounts.google.com/o/oauth2/token',
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:3000/oauth/google/callback`
} as any,
  (async (accessToken, refreshToken, profile, cb) => {
    try {
      const userProfileURL = 'https://www.googleapis.com/oauth2/v3/userinfo';
      const response = await axios.get(userProfileURL, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const userData = response.data;

      const { email } = userData;
      const { sub } = userData;
      const pictureUrl = userData.picture;
      const collectionSlug = 'user';

      const user = await findOrCreateUser(collectionSlug, sub, email, pictureUrl);

      cb(null, user);
    } catch (e) {
      console.error('Authentication failed:', e);
      cb(e);
    }
  }))

const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET,
    express: app,
    loggerOptions: { level: "debug" },
    onInit: async () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    }
  })


  passport.use("googleOauth", GoogleOAuthStrategy);


  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await payload.findByID({ collection: "user", id });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.listen(PORT)
}

start()

import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

// Custom extractor to get JWT from cookie or Authorization header
const cookieExtractor = function(req) {
  let token = null;
  if (req && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req && req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  return token;
};

const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      // jwt_payload may have id or userId depending on your token generation
      const userId = jwt_payload.id || jwt_payload.userId;
      const user = await User.findById(userId).select("-password");
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);


// Google login strategy (authenticate or create user)
passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_LOGIN_CALLBACK_URL || process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Pro pattern: find by googleId, googleEmail, or email
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { googleEmail: profile.emails[0].value },
            { email: profile.emails[0].value },
          ],
        });
        if (user) {
          // If not already linked, link Google info
          let updated = false;
          if (!user.googleId) {
            user.googleId = profile.id;
            updated = true;
          }
          if (!user.googleEmail) {
            user.googleEmail = profile.emails[0].value;
            updated = true;
          }
          // Optionally sync name/avatar if missing
          if (!user.fullName) {
            user.fullName = profile.displayName;
            updated = true;
          }
          if (!user.profilePic || user.profilePic.includes('/avatar.png')) {
            user.profilePic = (profile.photos && profile.photos[0] && profile.photos[0].value)
              ? profile.photos[0].value
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}`;
            updated = true;
          }
          if (updated) await user.save();
        } else {
          // Create new user if not found
          user = await User.create({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            password: undefined, // No password for Google users
            profilePic: (profile.photos && profile.photos[0] && profile.photos[0].value) ? profile.photos[0].value : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}`,
            needsProfileSetup: true,
            googleId: profile.id,
            googleEmail: profile.emails[0].value,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

// Google link strategy (for linking Google to an existing account)
passport.use(
  "google-link",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_LINK_CALLBACK_URL || process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // req.user should be set (user is logged in)
        if (!req.user) return done(null, false);
        // Link Google account (store Google ID/email if needed)
        req.user.googleId = profile.id;
        req.user.googleEmail = profile.emails[0].value;
        // Pro pattern: sync name and avatar if missing
        if (!req.user.fullName) {
          req.user.fullName = profile.displayName;
        }
        if (!req.user.profilePic || req.user.profilePic.includes('/avatar.png')) {
          req.user.profilePic = (profile.photos && profile.photos[0] && profile.photos[0].value)
            ? profile.photos[0].value
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}`;
        }
        await req.user.save();
        return done(null, req.user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;

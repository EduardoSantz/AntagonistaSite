const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./prismaClient');
const jwt = require('jsonwebtoken');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Certifique-se de que este URL aponte para o backend
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails.length) {
          return done(new Error('Email não fornecido pelo Google'), null);
        }

        const user = await prisma.user.upsert({
          where: { email: profile.emails[0].value },
          update: { googleId: profile.id },
          create: {
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName || profile.emails[0].value.split('@')[0],
          },
        });

        // Gera um token JWT com payload consistente
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
          expiresIn: '1h',
        });
        return done(null, { ...user, token });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Se você optar por utilizar sessões, mantenha estes métodos:
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

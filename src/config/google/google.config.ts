import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserService from "../../modules/user/api/user.service";
import { RoleEnum } from "../../common/enum/role.enum";
import { Types } from "mongoose";

const userService = new UserService();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        let user = await userService.findUserByEmail(
          profile.emails?.[0].value || ""
        );
        if (!user) {
          user = await userService.createUser({
            fullName: profile.displayName,
            email: profile.emails?.[0].value || "",
            password: "",
            userRole: RoleEnum.CLIENT,
            role: new Types.ObjectId("67dea9f480ccdc88548f99e7"),
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

export default passport;

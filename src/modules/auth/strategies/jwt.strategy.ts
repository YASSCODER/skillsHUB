import { ExtractJwt, Strategy } from "passport-jwt";
import passport from "passport";
import { JwtDto } from "../dto/jwt.dto";
import UserService from "../../user/api/user.service";

class JwtStrategy {
  constructor(private readonly userService: UserService) {}

  initialize() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    passport.use(
      new Strategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: jwtSecret,
        },
        async (payload: JwtDto, done: any) => {
          try {
            // Get user by email from JWT payload
            const user = await this.userService.findUserByEmail(payload.email);
            if (!user) {
              return done(null, false);
            }
            done(null, user);
          } catch (error) {
            done(error, false);
          }
        }
      )
    );
  }

  authenticate = passport.authenticate("jwt", { session: false });
}

export default new JwtStrategy(new UserService());

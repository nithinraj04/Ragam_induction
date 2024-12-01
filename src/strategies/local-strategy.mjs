import passport from "passport";
import { comparePassword } from "../utils/encryption.mjs";
import { Strategy } from "passport-local";
import { User } from "../mongoose/schemas/users.mjs";

export default passport.use(
    new Strategy(async (username, password, done) => {
        try {
            const findUser = await User.findOne({ username: username });
            if (!findUser) {
                return done(null, false, { message: "User not found" });
            }
            if (!comparePassword(password, findUser.password)) {
                return done(null, false, { message: "Bad login credentials" });
            }
            done(null, findUser);
        } catch (err) {
            done(err, null);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
})

passport.deserializeUser(async (userId, done) => {
    try{
        const findUser = await User.findById(userId);
        if(!findUser)
            throw new Error("UserID not found");
        done(null, findUser);
    }
    catch(error){
        done(error, null);
    }
})
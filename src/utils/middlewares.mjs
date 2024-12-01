import { validationResult } from "express-validator";
import passport from "passport";

export const handleValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(400).send({ errors: errors.array() });
    next();
}

export const userAuthentication = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).send({ message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return next();
        });
    })(req, res, next);
};
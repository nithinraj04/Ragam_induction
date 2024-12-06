import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import passport from "passport";

export const handleValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
        return res.status(400).send({ errors: errors.array() });
    next();
}

export const userAuthentication = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log(req.headers);
    if(!authHeader){
        req.authmsg = "Pls login";
        return next();
    }
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, user) => {
            if(err){
                req.authmsg = "Pls refresh token";
                return next();
            }
            console.log(user);
            req.user = user;
            next();
        }
    )
};
import { response, Router } from "express";
import { checkSchema, validationResult, matchedData } from "express-validator";

import "../strategies/local-strategy.mjs"
import { User } from "../mongoose/schemas/users.mjs";
import { userLoginValidationSchema, newUserRegValidationSchema } from "../utils/userValidationSchemas.mjs";
import { forgotPasswordValidationSchema, logoutValidationSchema } from "../utils/userValidationSchemas.mjs";
import passport from "passport";
import { handleValidationResult, userAuthentication } from "../utils/middlewares.mjs";


const router = Router();

router.post(
    '/api/auth/login',
    checkSchema(userLoginValidationSchema),
    handleValidationResult,
    userAuthentication,
    (req, res) => {
        if(req.user)
            return res.status(200).send({ msg: `login successful` });
        else
            return res.status(400).send({ msg: `login failed, try again` });
    }
)

router.get(
    '/api/auth/status',
    (req, res) => {
        if(req.user){
            return res.status(200).send({
                username: req.user.username,
                displayName: req.user.displayName
            });
        }
        else{
            return res.status(400).send({ msg: "not logged in" });
        }
    }
)

router.post(
    '/api/auth/logout',
    (req, res) => {
        req.logout((err) => {
            if(err)
                return res.status(400).send({ msg: "Can't logout" });
            return res.status(200).send({ msg: "logged out successfully!" })
        })
    }
)

export default router;
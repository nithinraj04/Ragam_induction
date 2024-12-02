import { Router } from "express";
import { checkSchema, validationResult, matchedData, check } from "express-validator";

import "../strategies/local-strategy.mjs"
import { User } from "../mongoose/schemas/users.mjs";
import { userLoginValidationSchema, newUserRegValidationSchema } from "../utils/userValidationSchemas.mjs";
import { updateProfileValidationSchema, deleteUserValidationSchema } from "../utils/userValidationSchemas.mjs";
import { resetPasswordValidationSchema } from "../utils/userValidationSchemas.mjs";
import { hashPassword } from "../utils/encryption.mjs";
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

router.post(
    '/api/auth/newUser',
    checkSchema(newUserRegValidationSchema),
    handleValidationResult,
    async (req, res) => {
        if(req.user && !req.user.isAdmin){
            return res.status(400).send({ msg: `You are not an admin. Pls logout to create a new user`})
        }

        const user = matchedData(req);
        user.password = hashPassword(user.password);
        const newUser = new User(user);
        try{
            const savedUser = await newUser.save();
            return res.status(201).send({ msg: `User ${savedUser.displayName} created successfully!`})
        }catch(err){
            if(err.code == 11000)
                return res.status(400).send({ msg: "User already exists" });
            return res.status(400).send(err);
        }
    }
)

router.patch(
    '/api/auth/updateUser',
    checkSchema(updateProfileValidationSchema),
    handleValidationResult,
    async (req, res) => {
        if(!req.user)
            return res.status(400).send({ msg: "You are not logged in" });
        const newData = matchedData(req);
        if(newData.password)
            newData.password = hashPassword(newData.password);
        try{
            await User.findByIdAndUpdate(req.user._id, newData);
            return res.status(200).send({ msg: "User updated successfully" });
        }catch(err){
            return res.status(400).send({ msg: "Failed to update user", error: err });
        }
    }
)

router.post(
    '/api/auth/resetPassword',
    checkSchema(resetPasswordValidationSchema),
    handleValidationResult,
    async (req, res) => {
        if(!req.user.isAdmin)
            return res.status(400).send({ msg: "You are not authorized to do this action! "})
        const { username, email, password } = matchedData(req);
        const hashedPassword = hashPassword(password);
        const findUser = await User.findOne({ username: username });
        if(!findUser)
            return res.status(404).send({ msg: "User not found" });
        if(findUser.email !== email)
            return res.status(400).send({ msg: "Email doesn't match" });
        try{
            await findUser.updateOne({ password: hashedPassword})
            return res.status(200).send({ msg: "Password reset successfully" });
        }catch(err){
            return res.status(400).send({ msg: "Failed to update password", error: err })
        }
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

router.delete(
    '/api/auth/deleteUser',
    checkSchema(deleteUserValidationSchema),
    handleValidationResult,
    async (req, res) => {
        if(!req.user)
            return res.status(400).send({ msg: "You are not logged in" });
        let deleteUser = null;
        if(req.user.isAdmin){
            deleteUser = matchedData(req).username;
        }
        else{
            deleteUser = req.user.username;
        }
        try{
            const deletedUser = await User.findOneAndDelete({ username: deleteUser });
            if(!deletedUser)
                return res.status(404).send({ msg: "User not found" });
            req.logout((err) => {
                if(err)
                    return res.status(400).send({ msg: "User deleted but failed to logout", error: err });
                return res.status(200).send({ msg: "User deleted successfully" });
            });
        }catch(err){
            return res.status(400).send({ msg: "Failed to delete user", error: err });
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
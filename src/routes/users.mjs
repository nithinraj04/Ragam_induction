import { Router } from "express";
import { checkSchema, matchedData } from "express-validator";

import "../strategies/local-strategy.mjs";
import { User } from "../mongoose/schemas/users.mjs";
import { 
    userLoginValidationSchema, 
    newUserRegValidationSchema, 
    updateProfileValidationSchema, 
    deleteUserValidationSchema, 
    adminActionValidationSchema 
} from "../utils/userValidationSchemas.mjs";
import { hashPassword } from "../utils/encryption.mjs";
import { handleValidationResult } from "../utils/middlewares.mjs";
import { comparePassword } from "../utils/encryption.mjs";
import jwt from 'jsonwebtoken';
import { Authentication } from "../mongoose/schemas/authentication.mjs";
import { userAuthentication } from "../utils/middlewares.mjs";

const router = Router();

const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(401).send({ msg: "You are not authorized to do this action!", error: req.authmsg });
    }
    next();
};

const isLoggedIn = (req, res, next) => {
    if(!req.user){
        return res.status(401).send({ msg: "You are not logged in", error: req.authmsg });
    }
    next();
}

router.post(
    '/api/auth/login',
    checkSchema(userLoginValidationSchema),
    handleValidationResult,
    async (req, res) => {
        const {username, password} = matchedData(req);
        try{
            const findUser = await User.findOne({ username });
            if (!findUser) {
                return res.status(400).send({ msg: "User not found" });
            }
            const compare = comparePassword(password, findUser.password);
            if (!compare) {
                return res.status(400).send({ msg: "Bad login credentials" });
            }

            // console.log("HEllo");

            const accessToken = jwt.sign(
                {
                    _id: findUser._id,
                    username: findUser.username,
                    displayName: findUser.displayName,
                    email: findUser.email,
                    isAdmin: findUser.isAdmin,
                    membershipType: findUser.membershipType,
                    regDate: findUser.regDate
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10m' }
            );

            const refreshToken = jwt.sign(
                { 
                    _id: findUser._id
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );

            // console.log(accessToken, refreshToken);

            const filter = { userID: findUser._id };
            const update = { refreshToken };
            // console.log(newAuth);
            const savedAuth = await Authentication.findOneAndUpdate(filter, update, { upsert: true, new: true });
            if(!savedAuth){
                return res.status(400).send({ msg: "Failed to save refresh token" });
            }

            res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
            res.status(200).send({ accessToken, msg: `Logged in as ${findUser.displayName}` });
        }
        catch(err){
            return res.status(400).send(err);
        }
    }
);

router.post(
    '/api/auth/refresh',
    async (req, res) => {
        const token = req.cookies.refreshToken;
        if(!token){
            return res.status(401).send({ msg: "No refresh token" });
        }
        jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, user) => {
                if(err){
                    return res.status(403).send({ msg: "Invalid refresh token" });
                }
                const findUserID = await Authentication.findOne({ refreshToken: token });
                if(!findUserID){
                    return res.status(403).send({ msg: "Invalid refresh token" });
                }
                const findUser = await User.findById(findUserID.userID);
                if(!findUser){
                    return res.status(404).send({ msg: "User not found" });
                }
                const accessToken = jwt.sign(
                    {
                        _id: findUser._id,
                        username: findUser.username,
                        displayName: findUser.displayName,
                        email: findUser.email,
                        isAdmin: findUser.isAdmin,
                        membershipType: findUser.membershipType,
                        regDate: findUser.regDate
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '10m' }
                );
                return res.status(200).send({ accessToken });
            }
        )
    }
)

router.post(
    '/api/auth/register',
    checkSchema(newUserRegValidationSchema),
    handleValidationResult,
    userAuthentication,
    async (req, res) => {
        try {
            if (req.user && !req.user.isAdmin) {
                return res.status(400).send({ msg: "You are not an admin. Please logout to create a new user" });
            }

            const user = matchedData(req);
            user.password = hashPassword(user.password);
            const newUser = new User(user);
            const savedUser = await newUser.save();
            return res.status(201).send({ msg: `User ${savedUser.displayName} created successfully!` });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).send({ msg: "User already exists" });
            }
            return res.status(400).send(err);
        }
    }
);

router.get(
    '/api/auth/profile',
    userAuthentication,
    isLoggedIn,
    (req, res) => {
        const { username, displayName, email, membershipType, regDate } = req.user;
        return res.status(200).send({ username, displayName, email, membershipType, regDate });
    }
);

router.put(
    '/api/auth/profile',
    checkSchema(updateProfileValidationSchema),
    handleValidationResult,
    userAuthentication,
    isLoggedIn,
    async (req, res) => {
        const newData = matchedData(req);
        if (newData.password) {
            newData.password = hashPassword(newData.password);
        }
        try {
            await User.findByIdAndUpdate(req.user._id, newData);
            return res.status(200).send({ msg: "User updated successfully" });
        } catch (err) {
            return res.status(400).send({ msg: "Failed to update user", error: err });
        }
    }
);

router.delete(
    '/api/auth/profile',
    userAuthentication,
    isLoggedIn,
    async (req, res) => {
        const id = req.user._id;
        try {
            const deletedUser = await User.findByIdAndDelete(id);
            if (!deletedUser) {
                return res.status(404).send({ msg: "Error: User not found" });
            }
            req.logout((err) => {
                if (err) {
                    return res.status(400).send({ msg: "User deleted but failed to logout", error: err });
                }
                return res.status(200).send({ msg: "User deleted successfully" });
            });
        } catch (err) {
            return res.status(400).send({ msg: "Failed to delete user", error: err });
        }
    }
);

router.post(
    '/api/auth/logout',
    userAuthentication,
    async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        // console.log(refreshToken);
        if(!refreshToken){
            return res.status(200).send({ msg: "Success!" });
        }
        try{
            const findToken = await Authentication.findOneAndDelete({ refreshToken });
            if(!findToken){
                return res.status(400).send({ msg: "Failed to logout" });
            }
            res.clearCookie('refreshToken');
            return res.status(200).send({ msg: "Success!" });
        }
        catch(err){
            return res.status(400).send({ msg: "Failed to logout", error: err });
        }
    }
);

router.get(
    '/api/auth/users',
    userAuthentication,
    isAdmin,
    async (req, res) => {
        try {
            const users = await User.find({}, { password: 0 });
            return res.status(200).send(users);
        } catch (err) {
            return res.status(400).send({ msg: "Failed to fetch users", error: err });
        }
    }
);

router.get(
    '/api/auth/users/:id',
    checkSchema({ id: { isMongoId: true } }, ['params']),
    handleValidationResult,
    userAuthentication,
    isAdmin,
    async (req, res) => {
        try {
            const { id } = matchedData(req);
            const user = await User.findById(id, { password: 0 });
            if (!user) {
                return res.status(404).send({ msg: "User not found" });
            }
            return res.status(200).send(user);
        } catch (err) {
            return res.status(400).send({ msg: "Failed to fetch user", error: err });
        }
    }
)

router.put(
    '/api/auth/users/:id',
    checkSchema({ id: { isMongoId: true } }, ['params']),
    checkSchema(adminActionValidationSchema),
    handleValidationResult,
    userAuthentication,
    isAdmin,
    async (req, res) => {
        const { id, ...data } = matchedData(req);
        if (data.password) {
            data.password = hashPassword(data.password);
        }
        try {
            const updatedUser = await User.findByIdAndUpdate(id, data);
            if (!updatedUser) {
                return res.status(404).send({ msg: "User not found" });
            }
            return res.status(200).send({ msg: "User updated successfully" });
        } catch (err) {
            return res.status(400).send({ msg: "Failed to update user", error: err });
        }
    }
);

router.delete(
    '/api/auth/users/:id',
    checkSchema({ id: { isMongoId: true } }, ['params']),
    handleValidationResult,
    userAuthentication,
    isAdmin,
    async (req, res) => {
        try {
            const { id } = matchedData(req);
            const deletedUser = await User.findByIdAndDelete(id);
            if (!deletedUser) {
                return res.status(404).send({ msg: "User not found" });
            }
            return res.status(200).send({ msg: "User deleted successfully" });
        } catch (err) {
            return res.status(400).send({ msg: "Failed to delete user", error: err });
        }
    }
);

export default router;
import { Router } from "express";
import { checkSchema, validationResult, matchedData } from "express-validator";

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
import { handleValidationResult, userAuthentication } from "../utils/middlewares.mjs";

const router = Router();

const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(400).send({ msg: "You are not authorized to do this action!" });
    }
    next();
};

const isLoggedIn = (req, res, next) => {
    if(!req.user){
        return res.status(400).send({ msg: "You are not logged in" });
    }
    next();
}

router.post(
    '/api/auth/login',
    checkSchema(userLoginValidationSchema),
    handleValidationResult,
    userAuthentication,
    (req, res) => {
        if (req.user) {
            return res.status(200).send({ msg: "Login successful" });
        } else {
            return res.status(400).send({ msg: "Login failed, try again" });
        }
    }
);

router.post(
    '/api/auth/register',
    checkSchema(newUserRegValidationSchema),
    handleValidationResult,
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
    (req, res) => {
        if (!req.user) {
            return res.status(400).send({ msg: "You are not logged in" });
        }
        const { username, displayName, email } = req.user;
        return res.status(200).send({ username, displayName, email });
    }
);

router.put(
    '/api/auth/profile',
    checkSchema(updateProfileValidationSchema),
    handleValidationResult,
    isLoggedIn,
    async (req, res) => {
        try {
            const newData = matchedData(req);
            if (newData.password) {
                newData.password = hashPassword(newData.password);
            }
            await User.findByIdAndUpdate(req.user._id, newData);
            return res.status(200).send({ msg: "User updated successfully" });
        } catch (err) {
            return res.status(400).send({ msg: "Failed to update user", error: err });
        }
    }
);

router.delete(
    '/api/auth/profile',
    isLoggedIn,
    async (req, res) => {
        try {
            const deleteUser = req.user.username;
            const deletedUser = await User.findOneAndDelete({ username: deleteUser });
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
    isLoggedIn,
    (req, res) => {
        req.logout((err) => {
            if (err) {
                return res.status(400).send({ msg: "Can't logout" });
            }
            return res.status(200).send({ msg: "Logged out successfully!" });
        });
    }
);

router.get(
    '/api/auth/users',
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
import 'dotenv/config'
import { User } from "../mongoose/schemas/users.mjs";
import { hashPassword } from './encryption.mjs';
import { json } from 'express';

export const initAdminUser = async () => {
    const adminUser = await User.findOne({ isAdmin: true });
    if(!adminUser){
        const admin = JSON.parse(process.env.ADMIN_USER_CREDENTIALS);
        admin.password = hashPassword(admin.password);
        const newAdmin = new User(admin);
        try{
            const createAdmin = await newAdmin.save();
            console.log("Admin user created successfully!");
        }
        catch (error){
            console.log("Failed creating admin user");
            console.log(error);
        }
    }
    else{
        console.log("Admin user already exists in db");
    }
};
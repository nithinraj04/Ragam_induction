import mongoose from "mongoose";

const authenticationSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    refreshToken: {
        type: mongoose.Schema.Types.String,
        required: true, 
        unique: true
    }
});

export const Authentication = mongoose.model('Authentication', authenticationSchema);
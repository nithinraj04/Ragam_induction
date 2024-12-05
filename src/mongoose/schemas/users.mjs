import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
    },
    password: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    isAdmin: {
        type: mongoose.Schema.Types.Boolean,
        default: false
    },
    displayName: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    email: {
        type: mongoose.Schema.Types.String,
        required: true,
        unique: true
    },
    membershipType: {
        type: mongoose.Schema.Types.String,
        default: "regular"
    },
    regDate: {
        type: mongoose.Schema.Types.Date,
        default: Date.now
    }
});

export const User = mongoose.model('User', userSchema);
import mongoose from "mongoose";

const borrowingsSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    bookID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Books'
    },
    borrowDate: {
        type: mongoose.Schema.Types.Date,
        default: Date.now
    },
    dueDate: {
        type: mongoose.Schema.Types.Date,
        default: Date.now() + 1000 * 60 * 60 * 24 * 30
    },
    returnedAt: {
        type: mongoose.Schema.Types.Date,
        required: false
    }
})

export const Borrowings = mongoose.model('Borrowings', borrowingsSchema);
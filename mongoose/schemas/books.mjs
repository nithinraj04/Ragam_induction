import mongoose, { mongo } from "mongoose";

const booksSchema = new mongoose.Schema({
    title: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    publishedYear: {
        type: mongoose.Schema.Types.Number,
        required: false
    },
    genre: {
        type: mongoose.Schema.Types.String,
        required: false
    },
    availableCopies: {
        type: mongoose.Schema.Types.Number,
        required: false
    }
})

export const Books = mongoose.model('Books', booksSchema);
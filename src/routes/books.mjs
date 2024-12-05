import { Router } from 'express';
import { validationResult, matchedData, checkSchema, check } from 'express-validator';
import { handleValidationResult } from '../utils/middlewares.mjs';
import { Books } from '../mongoose/schemas/books.mjs';
import { bookValidationSchema, bookIdValidationSchema, bookSearchValidationSchema, bookRestockValidationSchema } from '../utils/booksValidationSchemas.mjs';

const router = Router();

const isAdmin = (req, res, next) => {
    if(req.user && req.user.isAdmin){
        return next();
    }
    else{
        return res.status(401).send({msg: "You are not authorized to do this action"});
    }
}

router.get(
    '/api/books',
    checkSchema(bookSearchValidationSchema, ['query']),
    handleValidationResult,
    async (req, res) => {
        const filters = matchedData(req);
        const books = await Books.find(filters, { __v: 0 });
        res.status(200).send(books);
    }
)

router.get(
    '/api/books/:id',
    checkSchema(bookIdValidationSchema, ['params']),
    handleValidationResult,
    async (req, res) => {
        // console.log(matchedData(req));
        const { id } = matchedData(req);
        try{
            const bookData = await Books.findById(id);
            if(!bookData)
                return res.status(404).send({msg: "Book not found"});
            return res.status(200).send(bookData)
        }
        catch(err){
            return res.status(400).send(err);
        }
    }
)

router.post(
    '/api/books',
    checkSchema(bookValidationSchema),
    handleValidationResult,
    isAdmin,
    async (req, res) => {
        const newBook = matchedData(req);
        const book = new Books(newBook);
        try{
            const savedBook = await book.save();
            if(!savedBook)
                return res.status(400).send("Failed to save book");
            return res.status(201).send(book);
        }
        catch(err){
            if(err.code === 11000){
                return res.status(400).send('Book already exists');
            }
            return res.status(400).send(err);
        }
    }
)

router.put(
    '/api/books/:id',
    checkSchema(bookRestockValidationSchema),
    checkSchema(bookIdValidationSchema, ['params']),
    handleValidationResult,
    isAdmin,
    async (req, res) => {
        const { id, availableCopies } = matchedData(req);
        const updated = await Books.findByIdAndUpdate(id, { availableCopies });
        if(!updated)
            return res.status(418).send("Book not found. No changes made");
        return res.status(200).send({ msg: "Book updated successfully" });
    }
)

router.delete(
    '/api/books/:id',
    checkSchema(bookIdValidationSchema, ['params']),
    handleValidationResult,
    isAdmin,
    async (req, res) => {
        const { id } = matchedData(req);
        try{
            const deletedBook = await Books.findByIdAndDelete(id);
            if(!deletedBook)
                return res.status(400).send({ msg: "Book not found" });
            return res.status(200).send({
                msg: "Success", 
                deletedBook: deletedBook
            })
        }
        catch(err){
            return res.status(400).send(err);
        }
    }
)

export default router;
import { Router } from 'express';
import { query, body, validationResult, matchedData, checkSchema, check } from 'express-validator';
import { Books } from '../mongoose/schemas/books.mjs';
import { bookValidationSchema } from '../utils/validationSchemas.mjs';

const router = Router();

router.get(
    '/api/books',
    async (req, res) => {
        const books = await Books.find({},{ _id: 0, __v: 0 });
        res.status(200).send(books);
    }
)

router.post(
    '/api/books',
    checkSchema(bookValidationSchema),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const newBook = matchedData(req);
        const book = new Books(newBook);
        try{
            await book.save();
        }
        catch(err){
            if(err.code === 11000){
                return res.status(400).send('Book already exists');
            }
            return res.status(400).send(err);
        }
        return res.status(201).send(book);
    }
)

export default router;
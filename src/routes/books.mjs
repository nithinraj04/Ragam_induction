import { Router } from 'express';
import { validationResult, matchedData, checkSchema, check } from 'express-validator';
import { Books } from '../mongoose/schemas/books.mjs';
import { bookValidationSchema, bookIdValidationSchema, bookSearchValidationSchema } from '../utils/validationSchemas.mjs';

const router = Router();

router.get(
    '/api/books',
    checkSchema(bookSearchValidationSchema, ['query']),
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty)
            return res.status(400).send({ errors: errors.array() });

        const filters = matchedData(req);
        const books = await Books.find({...filters},{ __v: 0 });
        res.status(200).send(books);
    }
)

router.get(
    '/api/books/:id',
    checkSchema(bookIdValidationSchema, ['params']),
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).send({ errors: errors.array() });
        console.log(matchedData(req));
        const { params: { id }} = req;
        const bookData = await Books.findById(id);
        if(!bookData)
            return res.status(404).send({msg: "Book not found"});
        return res.status(200).send(bookData)
    }
)

router.post(
    '/api/books',
    checkSchema(bookValidationSchema),
    async (req, res) => {
        console.log("Validation done!");
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

router.put(
    '/api/books/:id',
    checkSchema(bookValidationSchema),
    checkSchema(bookIdValidationSchema, ['params']),
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).send({ errors: errors.array() });

        const { id, ...data } = matchedData(req);
        const newBook = Books(data);
        const updated = await Books.findByIdAndUpdate(id, data);
        if(!updated)
            return res.status(418).send("Book not found. No changes made");
        return res.status(200).send(updated);
    }
)

router.delete(
    '/api/books/:id',
    checkSchema(bookIdValidationSchema, ['params']),
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).send({errors : errors.array()});

        const { id } = matchedData(req);
        const deletedBook = await Books.findByIdAndDelete(id);
        if(!deletedBook)
            return res.status(400).send({ msg: "Book not found" });
        return res.status(200).send({
            msg: "Success", 
            deletedBook: deletedBook
        })
    }
)

export default router;
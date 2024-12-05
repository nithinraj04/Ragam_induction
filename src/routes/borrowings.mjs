import { Router } from "express";
import { checkSchema, validationResult, matchedData } from "express-validator";
import { Borrowings } from "../mongoose/schemas/borrowings.mjs";
import { Books } from "../mongoose/schemas/books.mjs";
import { borrowingSearchValidationSchema, newBorrowingValidationSchema } from "../utils/borrowingsValidationSchema.mjs";
import { handleValidationResult } from "../utils/middlewares.mjs";
import { startOfDay, endOfDay } from "date-fns";

const router = Router();

const isLoggedIn = (req, res, next) => {
    if(!req.user){
        return res.status(401).send({ msg: "You are not logged in" });
    }
    next();
}

const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(401).send({ msg: "You are not authorized to do this action!" });
    }
    next();
};

const verifyBorrowingLimit = async (req, res, next) => {
    if(req.user.membershipType === "premium"){
        return next();
    }
    const count = await Borrowings.countDocuments({ userID: req.user._id });
    if(count >= 5){
        return res.status(400).send({ msg: "You have reached the maximum borrowing limit" });
    }
    next();
}

const handleBookStock = async (req, res, next) => {
    const { bookID } = matchedData(req);
    const findBook = await Books.findById(bookID).select('availableCopies');
    if(!findBook)
        return res.status(404).send({ msg: "Book not found" });
    const { availableCopies: count } = findBook;
    console.log(count);
    if(count <= 0){
        return res.status(400).send({ msg: "Book is not available for borrowing" });
    }
    next();
}

const alreadyBorrowedCheck = async (req, res, next) => {
    const { bookID } = matchedData(req);
    const borrowing = await Borrowings.findOne({ bookID, userID: req.user._id });
    if(borrowing){
        return res.status(400).send({ msg: "You have already borrowed this book" });
    }
    next();
}

router.post(
    '/api/borrowings',
    checkSchema(newBorrowingValidationSchema),
    handleValidationResult,
    isLoggedIn,
    verifyBorrowingLimit,
    alreadyBorrowedCheck,
    handleBookStock,
    async (req, res) => {
        const { bookID } = matchedData(req);
        
        const borrowing = new Borrowings({
            bookID,
            userID: req.user._id
        });

        try{
            const borrowingSave = await borrowing.save();
            const updateBook = await Books.findByIdAndUpdate(bookID, { $inc: { availableCopies: -1 } });
            
            if(!updateBook){
                await Borrowings.findByIdAndDelete(borrowingSave._id);
                return res.status(400).send({ msg: "Failed to borrow book" });
            }

            return res.status(201).send(borrowingSave);
        }
        catch(err){
            return res.status(400).send(err);
        }
    }
)

router.get(
    '/api/borrowings',
    isLoggedIn,
    checkSchema(borrowingSearchValidationSchema, ['query']),
    handleValidationResult,
    async (req, res) => {
        let filters = matchedData(req);
        if(filters.returnedAt){
            const returnDate = filters.returnedAt;
            delete filters.returnedAt;
            filters.returnedAt = {
                $gte: startOfDay(new Date(returnDate)),
                $lte: endOfDay(new Date(returnDate))
            }
        }
        if(filters.overDue){
            // console.log(filters.overDue);
            const today = new Date();
            filters.dueDate = { $lt: startOfDay(today) };
            delete filters.overDue;
        }

        let required = { userID: req.user._id };
        let options = { __v: 0, _id: 0, userID: 0 };
        if(req.user.isAdmin){
            required = {};
            options = {};
        }
        required = { ...filters, ...required };
        const borrowings = await Borrowings.find(required, options);

        const sendBorrowings = await Promise.all(borrowings.map(async element => {
            const book = await Books.findById(element.bookID).select('title');
            const borrowingObject = element.toObject();
            return { bookTitle: book.title, ...borrowingObject };
        }));
        return res.status(200).send(sendBorrowings);
    }
)

router.put(
    '/api/borrowings/:id',
    checkSchema({ id: { isMongoId: true } }, ['params']),
    handleValidationResult,
    isAdmin,
    async (req, res) => {
        const { id } = matchedData(req);
        const returnDate = Date.now();
        try{
            const borrowing = await Borrowings.findByIdAndUpdate(id, { returnedAt: returnDate });
            if(!borrowing)
                return res.status(404).send({ msg: "Borrowing not found" });
            const updateBook = await Books.findByIdAndUpdate(borrowing.bookID, { $inc: { availableCopies: 1 } });
            if(!updateBook){
                await Borrowings.findByIdAndUpdate(id, { returnedAt: null });
                return res.status(400).send({ msg: "Failed to return book" });
            }
            return res.status(200).send({ msg: "Book returned successfully" });
        }
        catch(err){
            return res.status(400).send(err);
        }
    }
)

export default router;
import express from "express";
import mongoose from "mongoose";
import booksRouter from "./routes/books.mjs";
import usersRouter from "./routes/users.mjs"
import borrowingsRouter from "./routes/borrowings.mjs";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";
import "dotenv/config";

import { Books } from "./mongoose/schemas/books.mjs";
import { initAdminUser } from "./utils/initAdminUser.mjs";

const app = express();

mongoose.connect('mongodb://localhost:27017/test', )
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => console.error(err));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));



app.get('/', 
	(request, response) => {
		console.log(request.sessionID);
		response.send({
			msg : "Hello world!"
		});
	}
)

app.use(booksRouter);
app.use(usersRouter);
app.use(borrowingsRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
	initAdminUser();
});
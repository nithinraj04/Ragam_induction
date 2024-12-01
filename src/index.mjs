import express from "express";
import mongoose from "mongoose";
import router from "./routes/books.mjs";
import cookieParser from "cookie-parser";
import "dotenv/config";

import { Books } from "./mongoose/schemas/books.mjs";

const app = express();

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));


mongoose.connect('mongodb://localhost:27017/test', )
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => console.error(err));

app.get('/', 
	(request, response) => {
		console.log(process.env.COOKIE_PARSER_SECRET);
		response.send({
			msg : "Hello world!"
		});
	}
)

app.use(router);


app.listen(8080, () => {
	console.log('Server is running on port 8080')
});
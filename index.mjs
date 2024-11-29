import express from "express";
import mongoose from "mongoose";

const app = express();

app.use(express.json());


mongoose.connect('mongodb://localhost:27017/test', )
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => console.error(err));

app.get('/', 
	(request, response) => {
		response.send({
			msg : "Hello world!"
		});
	}
)


app.listen(8080, () => {
	console.log('Server is running on port 8080')
});
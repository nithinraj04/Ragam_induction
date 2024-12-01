import { Router } from "express";
import { checkSchema, validationResult, matchedData } from "express-validator";

import { User } from "../mongoose/schemas/users.mjs";


const router = Router();
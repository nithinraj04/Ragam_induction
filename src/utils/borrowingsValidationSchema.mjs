export const newBorrowingValidationSchema = {
    bookID: {
        isMongoId: {
            errorMessage: "Invalid book ID",
        },
        notEmpty: true
    }
}

export const borrowingSearchValidationSchema = {
    returnedAt: {
        required: false,
        notEmpty: false,
        optional: true,
        isDate:{
            format: "YYYY-MM-DD",
            delimiter: '-',
            errorMessage: "Invalid date format"
        },
    },
    overDue: {
        isBoolean: {
            errorMessage: "Overdue must be a boolean"
        },
        optional: true
    },
    userID: {
        isMongoId: {
            errorMessage: "Invalid user ID"
        },
        optional: true
    },
    bookID: {
        isMongoId: {
            errorMessage: "Invalid book ID"
        },
        optional: true
    }
}
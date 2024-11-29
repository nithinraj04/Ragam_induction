export const bookValidationSchema = {
    title: {
        isString: {
            errorMessage: 'Title must be a string',
        },
        notEmpty: {
            errorMessage: 'Title is required',
        },
    },
    author: {
        isString: {
            errorMessage: 'Author must be a string',
        },
        notEmpty: {
            errorMessage: 'Author is required',
        },
    },
    publishedYear: {
        isInt: {
            errorMessage: 'Published Year must be an integer',
        },
        optional: true,
    },
    genre: {
        isString: {
            errorMessage: 'Genre must be a string',
        },
        optional: true,
    },
    availableCopies: {
        isInt: {
            errorMessage: 'Available Copies must be an integer',
        },
        optional: true,
    },
}


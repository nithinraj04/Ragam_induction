export const userLoginValidationSchema = {
    username: {
        isString: true,
        notEmpty: {
            errorMessage: "Username cannot be empty"
        }
    },
    password: {
        isString: true,
        notEmpty: {
            errorMessage: "Password cannot be empty"
        }
    }
};

export const newUserRegValidationSchema = {
    ...userLoginValidationSchema,
    displayName: {
        isString: true,
        notEmpty: {
            errorMessage: "Display name cannot be empty"
        }
    },
    email: {
        isEmail: {
            errorMessage: "Invalid email"
        }
    }
}

export const resetPasswordValidationSchema = {
    ...userLoginValidationSchema,
    email: {
        isEmail: {
            errorMessage: "Invalid email"
        },
        notEmpty: {
            errorMessage: "email is necessary"
        }
    },
}

export const updateProfileValidationSchema = {
    password: {
        isString: true,
        optional: true
    },
    displayName: {
        isString: true,
        optional: true
    },
    email: {
        isEmail: {
            errorMessage: "Invalid email"
        },
        optional: true
    }
}

export const deleteUserValidationSchema = {
    username: {
        isString: true,
        notEmpty: {
            errorMessage: "Username cannot be empty"
        }
    }
}
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
    userLoginValidationSchema,
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

export const forgotPasswordValidationSchema = {
    userLoginValidationSchema,
    email: {
        isEmail: {
            errorMessage: "Invalid email"
        }
    },
}

export const logoutValidationSchema = {
    username: {
        isString: true,
        notEmpty: {
            errorMessage: "Username cannot be empty"
        }
    }
}
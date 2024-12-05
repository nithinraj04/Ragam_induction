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

export const adminActionValidationSchema = {
    password: {
        isString: true,
        notEmpty: false
    },
    username: {
        isString: true,
        notEmpty: false
    },
    email: {
        isEmail: {
            errorMessage: "Invalid email"
        },
        notEmpty: false
    },
    membershipType: {
        isString: true,
        optional: true
    }
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
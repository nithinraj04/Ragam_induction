# Library management

## Project Description

A simple Node.js application that uses Express for building web APIs and Mongoose for interacting with a MongoDB database. It includes user authentication (token based), book management, and borrowing functionalities. 

## Usage

### Prerequisites

Make sure you have Node installed. Clone this repository and run the following command to install dependencies. 
``` bash
npm install
```

### Environment variables

This project depends on some environment variables. If you are running this project locally, create a `.env` file at the root for these variables. 

``` bash
PORT=
MONGODB_URI=
COOKIE_PARSER_SECRET=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ADMIN_USER_CREDENTIALS='{
    "username":"",
    "password":"",
    "isAdmin":true,
    "displayName":"",
    "email":""
}'
```
### Running the server

Run the following command:
```bash
npm start
```

## Functionalities

### User Authentication
- Users can register and log in. 
    - `POST /api/auth/register`
    - `POST /api/auth/login`
    - `POST api/auth/logout`
- Token-based authentication using JWT. To refresh token, visit
    - `POST /api/auth/refresh`
- Users can view, update and delete their profile
    - `GET PUT DELETE /api/auth/profile`
- Admin users can view, create, update, and delete other users.
    - `GET /api/auth/users`
    - `GET PUT DELETE /api/auth/users/:id`
- Only admins can change the subscription status of a user

### Book Management
- Admin users can add, update, and delete books.
    - `POST /api/books`
    - `GET PUT DELETE/api/books/:id`
- Users can view the list of available books and search for books by various criteria.
    - `GET /api/books`

### Borrowing Management
- Users can borrow books if they have not exceeded their borrowing limit. Also, they can view all their borrowings.
    - `POST GET /api/borrowings`
- Admins can mark a borrowing as returned.
    - `PUT /api/borrowings/:id`
- Admin users can view all borrowings and manage them.
    - `GET /api/borrowings`

<-- Pending -->
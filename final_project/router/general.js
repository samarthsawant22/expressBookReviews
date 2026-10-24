const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const auth = require('./auth_users.js');

const public_users = express.Router();
const BASE_URL = 'http://localhost:5000';

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Unable to register user.'
        });
    }

    if (auth.isValid(username)) {
        return res.status(409).json({
            message: 'User already exists!'
        });
    }

    auth.users.push({ username, password });

    return res.status(200).json({
        message: 'User successfully registered. Now you can login'
    });
});

// Internal data endpoint used by Axios
public_users.get('/books-data', (req, res) => {
    return res.status(200).json(books);
});

// Internal endpoint to retrieve one book by ISBN
public_users.get('/books-data/:isbn', (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.status(200).json(book);
});

// Retrieve all books using Axios and async/await
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/books-data`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books'
        });
    }
});

// Retrieve a book by ISBN using Axios and Promises
public_users.get('/isbn/:isbn', (req, res) => {
    axios.get(
        `${BASE_URL}/books-data/${encodeURIComponent(req.params.isbn)}`
    )
        .then(response => {
            return res.status(200).json(response.data);
        })
        .catch(error => {
            if (error.response && error.response.status === 404) {
                return res.status(404).json({
                    message: 'Book not found'
                });
            }

            return res.status(500).json({
                message: 'Unable to retrieve book by ISBN'
            });
        });
});

// Retrieve books by author using Axios and async/await
public_users.get('/author/:author', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/books-data`);
        const author = req.params.author.toLowerCase();

        const result = Object.values(response.data).filter(
            book => book.author.toLowerCase() === author
        );

        if (result.length === 0) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books by author'
        });
    }
});

// Retrieve books by title using Axios and async/await
public_users.get('/title/:title', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/books-data`);
        const title = req.params.title.toLowerCase();

        const result = Object.values(response.data).filter(
            book => book.title.toLowerCase() === title
        );

        if (result.length === 0) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: 'Unable to retrieve books by title'
        });
    }
});

// Retrieve reviews for a book
public_users.get('/review/:isbn', (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({
            message: 'Book not found'
        });
    }

    return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
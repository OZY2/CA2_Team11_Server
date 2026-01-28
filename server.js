//include the required packages
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

//database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

//intialize Express app
const app = express();

//helps app to read JSON
app.use(express.json());

//start the server
app.listen(port, () => {
    console.log(`Server running on port`, port);
});

// Route: Get all recyclable items
app.get('/allrecyclable', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.recyclable');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error for allrecyclable'});
    }
});

// Route: Get a single recyclable item by ID
app.get('/recyclable/:id', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM defaultdb.recyclable WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({message: 'Recyclable item not found'});
        }

        res.json(rows[0]); // Return the first (and should be only) item
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error - could not fetch recyclable item'});
    }
});

// Route: Create a new recyclable item
app.post('/addrecyclable', async (req, res) => {
    const { image, name, material, quantity } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO recyclable (image, name, material, quantity) VALUES (?, ?, ?, ?)',
            [image, name, material, quantity]
        );
        res.status(201).json({message: 'Recyclable item '+ name + ' added successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error - could not add recyclable item ' + name});
    }
});

// Route: Edit/Update a recyclable item
app.put('/recyclable/:id', async (req, res) => {
    const { image, name, material, quantity } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE recyclable SET image = ?, name = ?, material = ?, quantity = ? WHERE id = ?',
            [image, name, material, quantity, req.params.id]
        );
        res.json({message: 'Recyclable item updated successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error - could not update recyclable item'});
    }
});

// Route: Delete a recyclable item
app.delete('/recyclable/:id', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM recyclable WHERE id = ?',
            [req.params.id]
        );
        res.json({message: 'Recyclable item deleted successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error - could not delete recyclable item'});
    }
});

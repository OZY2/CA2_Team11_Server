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

const cors = require("cors");

const allowedOrigins = [
    "http://localhost:3000",
    "https://ca2-c219.vercel.app",
    "https://c346-ca2-team11.onrender.com",
    "https://ca2-team11-server-0rto.onrender.com"
];

app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (Postman/server-to-server)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
    })
);

//start the server
app.listen(port, () => {
    console.log(`Server running on port`, port);
});

// Route: Get all recyclable items with automatic fallback
app.get('/allrecyclable', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        
        // Try defaultdb first
        try {
            const [rows] = await connection.execute('SELECT * FROM defaultdb.recyclable');
            console.log('Successfully fetched from defaultdb');
            return res.json(rows);
        } catch (firstError) {
            // If defaultdb fails, try C346_CA2_dependgone
            console.log('defaultdb failed, trying C346_CA2_dependgone:', firstError.message);
            
            try {
                const [rows] = await connection.execute('SELECT * FROM C346_CA2_dependgone.recyclable');
                console.log('Successfully fetched from C346_CA2_dependgone');
                return res.json(rows);
            } catch (secondError) {
                // Both failed
                console.log('Both schemas failed:', secondError.message);
                throw new Error('Both schemas failed to fetch data');
            }
        }
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

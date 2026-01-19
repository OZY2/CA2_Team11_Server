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

// Route: Get all Pokemon
app.get('/allpokemon', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.pokemon');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error for allpokemon'});
    }
});

// Route: Create a new Pokemon
app.post('/addpokemon', async (req, res) => {
    const { dex_number, name, dex_entry } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO pokemon (dex_number, name, dex_entry) VALUES (?, ?, ?)',
            [dex_number, name, dex_entry]
        );
        res.status(201).json({message: 'Pokemon '+ name + ' added successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error - could not add pokemon ' + name});
    }
});

// Route: Edit/Update a Pokemon
app.put('/pokemon/:id', async (req, res) => {
    const { dex_number, name, dex_entry } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE pokemon SET dex_number = ?, name = ?, dex_entry = ? WHERE id = ?',
            [dex_number, name, dex_entry, req.params.id]
        );
        res.json({message: 'Pokemon updated successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error - could not update pokemon'});
    }
});

// Route: Delete a Pokemon
app.delete('/pokemon/:id', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'DELETE FROM pokemon WHERE id = ?',
            [req.params.id]
        );
        res.json({message: 'Pokemon deleted successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error - could not delete pokemon'});
    }
});
// const express = require('express');
// const mysql = require('mysql2');
// const app = express();
// const cors = require('cors');
// app.use(cors());
// app.use(express.json());
// app.use(express.static('frontend'));

// const path = require('path');
// app.use(express.static(path.join(__dirname, '../frontend')));

// // Create a MySQL connection
// const db = mysql.createConnection({
//     host: 'localhost',  // Update this if your database is hosted elsewhere
//     user: 'root',  // Replace with your MySQL username
//     password: 'root',  // Replace with your MySQL password
//     database: 'set_top_box_tracker'  // Database name
// });

// // Connect to the database
// db.connect(err => {
//     if (err) {
//         console.error('Database connection failed:', err);
//         return;
//     }
//     console.log('Connected to database.');
// });

// // Route for checking in a device
// app.post('/checkin', (req, res) => {
//     const { casNumber, serialNumber, userName } = req.body;
//     const query = 'INSERT INTO checkins (cas_number, serial_number, user_name) VALUES (?, ?, ?)';
//     db.query(query, [casNumber, serialNumber, userName], (err, result) => {
//         if (err) {
//             res.status(500).send('Failed to check in device.');
//             return;
//         }
//         res.status(200).send('Device checked in successfully.');
//     });
// });

// app.post('/transferDevice', (req, res) => {
//     const { casNumber, newUserName } = req.body;

//     // Update the user associated with the CAS number
//     const query = 'UPDATE checkins SET user_name = ? WHERE cas_number = ?';

//     db.query(query, [newUserName, casNumber], (err, result) => {
//         if (err) {
//             console.error('Database error:', err);
//             res.status(500).send('Failed to transfer device.');
//             return;
//         }

//         if (result.affectedRows === 0) {
//             res.status(404).send('Device not found.');
//             return;
//         }

//         res.status(200).send('Device transferred successfully.');
//     });
// });

// // Route for searching STB by CAS number
// app.post('/searchSTB', (req, res) => {
//     const { casNumber } = req.body;
//     const query = 'SELECT * FROM checkins WHERE cas_number = ?';

//     db.query(query, [casNumber], (err, results) => {
//         if (err) {
//             console.error('Database error:', err);
//             res.status(500).send('Database query failed.');
//             return;
//         }

//         if (results.length === 0) {
//             res.status(404).json({ error: 'STB not found.' });
//             return;
//         }

//         res.status(200).json(results[0]); // Send the first matching result
//     });
// });


// app.listen(3001, '0.0.0.0', () => {
//     console.log('Server is running on port 3001');
// });


const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost',  // Update this if your database is hosted elsewhere
    user: 'root',  // Replace with your MySQL username
    password: 'Adam@0001',  // Replace with your MySQL password
    database: 'set_top_box_tracker'  // Database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to database.');
});

// Route for checking in a device
app.post('/checkin', (req, res) => {
    const { casNumber, serialNumber, userName } = req.body;
    const query = 'INSERT INTO checkins (cas_number, serial_number, user_name) VALUES (?, ?, ?)';
    db.query(query, [casNumber, serialNumber, userName], (err, result) => {
        if (err) {
            res.status(500).send('Failed to check in device.');
            return;
        }
        res.status(200).send('Device checked in successfully.');
    });
});

// Route for transferring a device
app.post('/transferDevice', (req, res) => {
    const { casNumber, newUserName } = req.body;

    const query = 'UPDATE checkins SET user_name = ? WHERE cas_number = ?';
    db.query(query, [newUserName, casNumber], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Failed to transfer device.');
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).send('Device not found.');
            return;
        }

        res.status(200).send('Device transferred successfully.');
    });
});

// Route for searching STB by CAS number
app.post('/searchSTB', (req, res) => {
    const { casNumber } = req.body;
    const query = 'SELECT * FROM checkins WHERE cas_number = ?';

    db.query(query, [casNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database query failed.');
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'STB not found.' });
            return;
        }

        res.status(200).json(results[0]); // Send the first matching result
    });
});

// Routes to serve specific HTML files
app.get('/checkin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/checkin.html'));
});

app.get('/transfer', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/transfer.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/search.html'));
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(3001, '0.0.0.0', () => {
    console.log('Server is running on port 3001');
});

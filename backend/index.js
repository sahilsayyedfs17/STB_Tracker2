const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const cors = require('cors');
//require('dotenv').config();

const app = express();
app.use(cors());

app.use(cors({origin: 'https://stb-tracker2-backend.onrender.com'}));

app.use(express.json());

const PORT = process.env.PORT || 3001;

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Direct MongoDB URI
const uri = "mongodb+srv://sahilsayyedfs17:Adam%400001@cluster0.jgmgm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB client and database variables
let db;
let checkinsCollection;

// Connect to MongoDB Atlas
MongoClient.connect(uri)
    .then(client => {
        console.log('Connected to MongoDB Atlas');
        db = client.db('set_top_box_tracker');  // Replace with your database name
        checkinsCollection = db.collection('checkins');  // Use the 'checkins' collection
    })
    .catch(err => console.error('Failed to connect to MongoDB Atlas:', err));

// Route for checking in a device
// app.post('/checkin', (req, res) => {
//     const { casNumber, serialNumber, userName } = req.body;
//     checkinsCollection.insertOne({ cas_number: casNumber, serial_number: serialNumber, user_name: userName })
//         .then(result => {
//             res.status(200).send('Device checked in successfully.');
//         })
//         .catch(err => {
//             console.error('Database error:', err);
//             res.status(500).send('Failed to check in device.');
//         });
// });

// Route for checking in a device
app.post('/checkin', (req, res) => {
    const { casNumber, userName } = req.body;

    // Check if the CAS number already exists in the database
    checkinsCollection.findOne({ cas_number: casNumber })
        .then(existingRecord => {
            if (existingRecord) {
                // CAS exists, update the username
                checkinsCollection.updateOne(
                    { cas_number: casNumber },
                    { $set: { user_name: userName } }
                )
                .then(() => {
                    res.status(200).send('Username updated successfully.');
                })
                .catch(err => {
                    console.error('Database error:', err);
                    res.status(500).send('Failed to update username.');
                });
            } else {
                // CAS does not exist, insert new record
                checkinsCollection.insertOne({ cas_number: casNumber, user_name: userName })
                .then(() => {
                    res.status(200).send('Device checked in successfully.');
                })
                .catch(err => {
                    console.error('Database error:', err);
                    res.status(500).send('Failed to check in device.');
                });
            }
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).send('Failed to check CAS number.');
        });
});


// Route for transferring a device
// app.post('/transfer', (req, res) => {
//     const { casNumber, newUserName } = req.body;
//     checkinsCollection.updateOne(
//         { cas_number: casNumber },
//         { $set: { user_name: newUserName } }
//     )
//     .then(result => {
//         if (result.matchedCount === 0) {
//             res.status(404).send('Device not found.');
//             return;
//         }
//         res.status(200).send('Device transferred successfully.');
//     })
//     .catch(err => {
//         console.error('Database error:', err);
//         res.status(500).send('Failed to transfer device.');
//     });
// });

// Route for searching STB by CAS number
app.post('/searchSTB', (req, res) => {
    const { casNumber } = req.body;
    checkinsCollection.findOne({ cas_number: casNumber })
        .then(result => {
            if (!result) {
                res.status(404).json({ error: 'STB not found.' });
                return;
            }
            res.status(200).json(result);
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).send('Database query failed.');
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on {PORT}`);
});

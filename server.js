const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/extra-assets', express.static(path.join(__dirname, 'assets')));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Adjusted this path
});

const DB_PATH = path.join(__dirname, 'db', 'db.json');  // Adjusted path for db.json

app.get('/api/notes', (req, res) => {
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading db.json:", err);
            return res.sendStatus(500);
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading db.json:", err);
            return res.sendStatus(500);
        }
        
        const notes = JSON.parse(data);
        newNote.id = Date.now().toString();
        notes.push(newNote);

        fs.writeFile(DB_PATH, JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error("Error writing to db.json:", err);
                return res.sendStatus(500);
            }
            res.json(newNote);
        });
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading db.json:", err);
            return res.sendStatus(500);
        }

        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== noteId);

        fs.writeFile(DB_PATH, JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error("Error writing to db.json:", err);
                return res.sendStatus(500);
            }
            res.json({ message: 'Deleted successfully' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
});

const express = require('express');
const path = require('path');
const notesData = require('./db/notesdb.json');
const util = require('util');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const readFromFile = util.promisify(fs.readFile);

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('/api/notes', (req, res) => {
  // Log our request to the terminal
  console.info(`${req.method} request received to get notes`);

  // Sending all notes to the client
  readFromFile('./db/notesdb.json').then((data) => res.json(JSON.parse(data)))
});

// POST request to add a note
app.post('/api/notes', (req, res) => {
  // Log that a POST request was received
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      id: uuidv4(),
    };

    // Obtain existing reviews
    fs.readFile('./db/notesdb.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        // Convert string into JSON object
        const parsedNotes = JSON.parse(data);

        // Add a new review
        parsedNotes.push(newNote);

        // Write updated reviews back to the file
        fs.writeFile(
          './db/notesdb.json',
          JSON.stringify(parsedNotes, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully updated Notes!')
        );
      }
    });

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    // res.json() returns data including a status message indicating the success of the request along with the newly created note data.
    res.status(201).json(response);
  } else {
    // the purpose of the else statement is to allow a way to throw an error if either the product, note, or username is not present.
    res.status(500).json('Error in posting note');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});

const express = require("express");
const path = require("path");
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

let app = express();
let PORT = process.env.PORT || 3200;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


let notes = [];
let id = 0;

initialize();

//Server html routes-------------------------------
app.get("/notes", function (request, response) {
    response.sendFile(path.join(__dirname, "/public/notes.html"));
});

app.get("/", function (request, response) {
    response.sendFile(path.join(__dirname, "/public/index.html"));
});

//Server API routes--------------------------------
//GET data
app.get("/api/notes", function (request, response) {
    return response.json(notes);
});

//POST data
app.post("/api/notes", function (request, response) {
    console.log(id);
    let note = request.body;
    note.id = id;
    id++;

    console.log("Request to post note:");
    console.log(note);

    notes.push(note);
    fs.writeFile(path.join(__dirname, "/db/db.json"), JSON.stringify(notes), function (error) {
        if (error) console.log(error);
    });
    response.json(true);
});

// DELETE data
app.delete("/api/notes/:id", function (request, response) {
    let deleteNoteId = request.params.id;

    console.log("Request to delete note ID: " + deleteNoteId);

    for (let x = 0; x < notes.length; x++) {
        if (parseInt(notes[x].id) === parseInt(deleteNoteId)) {
            notes.splice(x, 1);
            console.log(notes);
        }
    }

    fs.writeFile(path.join(__dirname, "/db/db.json"), JSON.stringify(notes), function (error) {
        if (error) console.log(error);
    });
    response.json(true);
});

//Turn on the server
app.listen(PORT, function () {
    console.log("Server working on port: " + PORT);
});

//Initialize notes and ID
async function initialize(){
    await readNotes();
    setId();
}

async function readNotes() {
    notes = JSON.parse(await readFile(path.join(__dirname, "/db/db.json")));

    console.log("Notes initialized as:");
    console.log(notes);
}

function setId(){
        let highestID = 0;
        if (notes.length > 0) {
            notes.forEach(function (note) {
                if (note.id > highestID) highestID = note.id;
            })
        };
        highestID++

        console.log("Setting ID as: "+ highestID);
        id = highestID;
}
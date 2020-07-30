const dotenv = require("dotenv");
const express = require("express");
const mongodb = require("mongodb");

const { getPutBodyIsAllowed } = require("./util");

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

const uri = process.env.DATABASE_URI;

app.post("/api/books", function (req, res) {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
  client.connect(() => {
    const db = client.db("literature");
    const collection = db.collection("books");

    let newBook = {};

    if (req.body.title) {
      newBook.title = req.body.title;
    }
    if (req.body.author) {
      newBook.author = req.body.author;
    }

    if (req.body.author_birth_year) {
      newBook.author_birth_year = Number(req.body.author_birth_year);
    }
    if (req.body.author_death_year) {
      newBook.author_death_year = Number(req.body.author_death_year);
    }
    if (req.body.url) {
      newBook.url = req.body.url;
    }
    collection.insertOne(newBook, (error, result) => {
      error ? res.status(400).send(error) : res.status(200).send(result.ops[0]);
    });
  });
});

app.delete("/api/books/:id", function (req, res) {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
  client.connect(() => {
    const db = client.db("literature");
    const collection = db.collection("books");
    const string = req.params.id;
    const id = new mongodb.ObjectID(string);
    const searchId = { _id: id };

    collection.deleteOne(searchId, (error, result) => {
      console.log(result.deleteCount);
      error ? res.status(400).send(error) : res.status(200).send(result);
    });
  });
});

app.put("/api/books/:id", function (req, res) {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
  client.connect(() => {
    const db = client.db("literature");
    const collection = db.collection("books");
    let id;
    const string = req.params.id;
    if (mongodb.ObjectID.isValid(string)) {
      id = new mongodb.ObjectID(string);
    } else {
      res.sendStatus(404);
    }
    const searchId = { _id: id };
    delete req.body.id;
    const data = {$set:req.body};

    const options = { returnOriginal: false };

    collection.findOneAndUpdate(searchId, data, options, (error, result) => {
      error ? res.status(500).send(error) : res.status(204).send(result.value);
    });
  });
});

app.get("/api/books", function (request, response) {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });

  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    const searchObject = {};

    if (request.query.title) {
      searchObject.title = request.query.title;
    }

    if (request.query.author) {
      searchObject.author = request.query.author;
    }

    collection.find(searchObject).toArray(function (error, books) {
      response.send(error || books);
    });
  });
});

app.get("/api/books/:id", function (request, response) {
  const client = new mongodb.MongoClient(uri, { useUnifiedTopology: true });

  let id;
  try {
    id = new mongodb.ObjectID(request.params.id);
  } catch (error) {
    response.sendStatus(400);
    return;
  }

  client.connect(function () {
    const db = client.db("literature");
    const collection = db.collection("books");

    const searchObject = { _id: id };

    collection.findOne(searchObject, function (error, book) {
      if (!book) {
        response.sendStatus(404);
      } else {
        response.send(error || book);
      }
    });
  });
});

app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});

app.get("/books/new", function (request, response) {
  response.sendFile(__dirname + "/new-book.html");
});

app.get("/books/:id", function (request, response) {
  response.sendFile(__dirname + "/book.html");
});

app.get("/books/:id/edit", function (request, response) {
  response.sendFile(__dirname + "/edit-book.html");
});

app.get("/authors/:name", function (request, response) {
  response.sendFile(__dirname + "/author.html");
});

app.listen(port || 3000, function () {
  console.log(`Running at \`http://localhost:${port}\`...`);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//  Middleware
app.use(cors());
app.use(express.json());

// Default server
app.get("/", (req, res) => {
  res.send("Bookzilla!!");
});

app.listen(port, () => {
  console.log(`Bookzilla app listening on port ${port}`);
});

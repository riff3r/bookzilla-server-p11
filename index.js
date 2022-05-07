require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//  Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g0j0y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const bookCollection = client.db("bookzilla").collection("book");
    await client.connect();

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = bookCollection.find(query);

      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

// Default server
app.get("/", (req, res) => {
  res.send("Bookzilla!!");
});

app.listen(port, () => {
  console.log(`Bookzilla app listening on port ${port}`);
});

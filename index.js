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

    // GET - Inventory Details Page API
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await bookCollection.findOne(query);
      res.send(cursor);
    });

    app.get("/myItems", async (req, res) => {
      const { email } = req.query;
      console.log(email);
      const query = { email };
      const cursor = bookCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // POST
    app.post("/add", async (req, res) => {
      let { data } = req?.body;
      data.sold = 0;

      const result = await bookCollection.insertOne(data);

      res.send(result);
    });

    // PUT - Update delivery
    app.put("/inventory/:id", async (req, res) => {
      console.log(req.body.quantity);
      const restock = req.body.restock;
      const quantity = req.body.quantity;
      const sold = req.body.sold;
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: false };

      let updateDoc;

      if (quantity)
        updateDoc = {
          $set: {
            quantity,
            sold,
          },
        };

      if (restock)
        updateDoc = {
          $set: {
            quantity: restock,
          },
        };

      const result = await bookCollection.updateOne(filter, updateDoc, options);

      res.send(result);
    });

    // DELETE - Delete collection
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };

      const result = await bookCollection.deleteOne(query);

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

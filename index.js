require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//  Middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

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

    // Auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });

      res.send({ accessToken });
    });

    // GET
    // app.get("/inventory", verifyJWT, async (req, res) => {
    //   const decodedEmail = req?.decoded?.email;
    //   const { email } = req.query;

    //   if (email === decodedEmail) {
    //     const query = {};
    //     const cursor = bookCollection.find(query);

    //     const result = await cursor.toArray();
    //     res.send(result);
    //   } else {
    //     return res.status(403).send({ message: "Forbidden Access" });
    //   }
    // });

    app.get("/inventory", async (req, res) => {
      // const decodedEmail = req?.decoded?.email;
      const { email } = req.query;

      const query = {};
      const cursor = bookCollection.find(query);

      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/myItems", verifyJWT, async (req, res) => {
      const decodedEmail = req?.decoded?.email;
      const { email } = req.query;

      if (email === decodedEmail) {
        const query = { email };
        const cursor = bookCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }
    });

    // GET - Inventory Details Page API
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await bookCollection.findOne(query);
      res.send(cursor);
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

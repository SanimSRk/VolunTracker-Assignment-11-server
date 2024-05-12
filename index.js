const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mqe77mp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db('VolunttersDB');
    const volunterCollection = database.collection('volunterUser');
    const volunterRequesCollection = database.collection('RequestUser');

    app.post('/volunteers', async (req, res) => {
      const user = req.body;
      const result = await volunterCollection.insertOne(user);
      console.log(result);
      res.send(result);
    });
    app.get('/volunteers', async (req, res) => {
      const qurey = volunterCollection.find();
      const result = await qurey.toArray();
      res.send(result);
    });

    app.get('/volunteers/:id', async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await volunterCollection.findOne(qurey);
      res.send(result);
    });

    app.get('/allVolunteers', async (req, res) => {
      const result = await volunterCollection.find().toArray();
      res.send(result);
    });

    app.get('/allVolunteers/:id', async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await volunterCollection.findOne(qurey);
      res.send(result);
    });

    app.post('/volunteerRequest', async (req, res) => {
      const user = req.body;

      const result = await volunterRequesCollection.insertOne(user);
      res.send(result);
    });

    app.get('/volunteerss', async (req, res) => {
      const result = await volunterCollection.find(req.query).toArray();
      //  const query = { $text: { $search: 'trek' } };
      res.send(result);
    });
    app.get('/mangesPost', async (req, res) => {
      const result = await volunterCollection.find(req.query).toArray();
      res.send(result);
    });
    app.delete('/mangesPost/:id', async (req, res) => {
      const id = req.params.id;
      const querys = { _id: new ObjectId(id) };
      const result = await volunterCollection.deleteOne(querys);
      res.send(result);
    });

    app.get('/loderData/:id', async (req, res) => {
      const id = req.params.id;
      const user = { _id: new ObjectId(id) };
      const result = await volunterCollection.findOne(user);
      res.send(result);
    });

    app.put('/updatess/:id', async (req, res) => {
      const id = req.params.id;
      const qureyss = { _id: new ObjectId(id) };
      const userData = req.body;
      const UpdateData = {
        $set: {
          thumbnail: userData.thumbnail,
          title: userData.title,
          description: userData.description,
          category: userData.category,
          location: userData.location,
          neededNumber: userData.neededNumber,
          email: userData.email,
          fullName: userData.fullName,
          startDate: userData.startDate,
        },
      };
      const result = await volunterCollection.updateOne(qureyss, UpdateData);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
  res.send('voluntter server site  is run');
});

app.listen(port, () => {
  console.log(`volunteer sirver port is :${port}`);
});

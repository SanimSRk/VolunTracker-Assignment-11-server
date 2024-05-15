const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cockieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://volunteers-eb06b.web.app',
      'https://volunteers-eb06b.firebaseapp.com',
      'https://6644274c6e796e3d5b7dbef3--boisterous-meerkat-eae690.netlify.app/',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cockieParser());

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  if (token) {
    jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (err, decode) => {
      if (err) {
        console.log(err);
        return res.status(401).send({ message: 'unauthorized access' });
      }
      console.log(decode);
      req.user = decode;

      next();
    });
  }
};

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
    // await client.connect();
    const database = client.db('VolunttersDB');
    const volunterCollection = database.collection('volunterUser');
    const volunterRequesCollection = database.collection('RequestUser');
    //jwt tooken create
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCES_TOKEN_SECRET, {
        expiresIn: '1d',
      });

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true });
    });

    app.get('/logout', async (req, res) => {
      res
        .clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          maxAge: 0,
        })
        .send({ success: true });
    });

    //get all for volunteer data
    app.post('/volunteers', async (req, res) => {
      const user = req.body;
      const result = await volunterCollection.insertOne(user);
      res.send(result);
    });
    app.get('/volunteers', async (req, res) => {
      const qurey = volunterCollection.find({}).sort({ startDate: 1 });
      const result = await qurey.toArray();
      res.send(result);
    });

    app.get('/volunteers/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await volunterCollection.findOne(qurey);
      res.send(result);
    });

    app.get('/allVolunteers', async (req, res) => {
      const result = await volunterCollection
        .find({})
        .sort({ startDate: 1 })
        .toArray();
      res.send(result);
    });

    app.get('/allVolunteers/:id', verifyToken, async (req, res) => {
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

    app.get('/mangesPost', verifyToken, async (req, res) => {
      const result = await volunterCollection.find(req.query).toArray();
      res.send(result);
    });

    app.delete('/mangesPost/:id', async (req, res) => {
      const id = req.params.id;
      const querys = { _id: new ObjectId(id) };
      const result = await volunterCollection.deleteOne(querys);
      res.send(result);
    });

    app.get('/loderData/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const user = { _id: new ObjectId(id) };
      const result = await volunterCollection.findOne(user);
      res.send(result);
    });

    app.put('/updatess/:id', verifyToken, async (req, res) => {
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

    app.get('/myrequstDatass', verifyToken, async (req, res) => {
      const result = await volunterRequesCollection.find(req.query).toArray();
      res.send(result);
    });

    app.delete('/myrequstData/:id', async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await volunterRequesCollection.deleteOne(qurey);
      res.send(result);
    });

    app.patch('/volunteersNumbers/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      // const numbers = req.body
      const result = await volunterCollection.updateOne(qurey, {
        $inc: { neededNumber: -1 },
      });

      const volunteerDetail = await volunterCollection.findOne(qurey);

      res.send({ result, volunteerDetail });
    });

    app.get('/volunteerSerch', async (req, res) => {
      const filter = req?.query;
      const qurey = {
        title: { $regex: filter?.search, $options: 'i' },
      };
      const result = await volunterCollection.find(qurey).toArray();
      console.log(result);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 });
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

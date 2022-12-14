const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();

const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bkopbwy.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const cardDataCollection = client.db('assignmentTwelve').collection('cardData')

        const usersCollection = client.db('assignmentTwelve').collection('users')

        const productsCollection = client.db('assignmentTwelve').collection('products')

        app.get('/cardData', async (req, res) => {
            const query = {};
            const cards = await cardDataCollection.find(query).toArray();
            res.send(cards);
        });

        app.get('/cardData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const card = await cardDataCollection.findOne(query);
            res.send(card);
        });

        app.get('/category', async (req, res) => {
            const query = {}
            const result = await cardDataCollection.find(query).project({ name: 1 }).toArray();
            res.send(result);
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });

        app.get('/users', async (req, res) => {
            const query = { category: req.query.category };
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });


        //verify sellers
        app.put('/users/verify/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'verified seller'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        //find admin
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.category === 'admin' });
        });

        //find seller
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.category === 'saler' });
        });

        //delete seller
        app.delete('/users/seller/:email', async (req, res) => {
            // const id = req.params.id;
            // const query = { _id: ObjectId(id) };
            const email = req.params.email;
            const query = { email }
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        //find buyer
        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isBuyer: user?.category === 'buyer' });
        });

        //delete buyer
        app.delete('/users/buyer/:email', async (req, res) => {
            // const id = req.params.id;
            // const query = { _id: ObjectId(id) };
            const email = req.params.email;
            const query = { email }
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });



        //get and post new products

        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        //change this

        // app.get('/products', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { email };
        //     const products = await productsCollection.find(query).toArray();
        //     res.send(products);
        // });

        // app.get('/products', async (req, res) => {
        //     let query = {};
        //     if (req.query.email) {
        //         query = {
        //             email: req.query.email
        //         }
        //     }
        //     const cursor = productsCollection.find(query);
        //     const products = await cursor.toArray();
        //     res.send(products);
        // });

        //advertise
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    isAdvertise: 'advertise'
                }
            }
            const result = await productsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        //delete item

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })



        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })


    }
    finally {

    }
}
run().catch(console.log);



app.get('/', async (req, res) => {
    res.send('assignment twelve server is running');
})

app.listen(port, () => console.log(`Assignment twelve port running on ${port}`))
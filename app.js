const express = require('express')
const bodyParser = require('body-parser'); // Import body-parser
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
const url = 'mongodb://localhost:27017';
const dbName = 'BillingSoftware';

app.post('/submit', async (req, res) => {
    const client = new MongoClient(url, { useNewParser: true, useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('Categories');
        const category = {
            Categoryname: req.body.Categoryname,
        };
        const result = await collection.insertOne(category);

        console.log(`Category inserted with ID: ${result.insertedId}`);
        res.sendFile(__dirname + '/category.html');
        res.send('Category saved successfully.');
    }
    catch (err) {
        console.error('Error occurred while saving the category:', err);
        res.send('Error occurred while saving the category.');
    } finally {
        client.close();
    }
})

app.listen(3000, () => {
    console.log(`listening on ${port}`)
})
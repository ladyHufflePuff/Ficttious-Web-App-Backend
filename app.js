const express = require('express');
const {connectToDb, getDb} = require('./db');
const { ObjectId } = require('mongodb')
const cors = require('cors');

// init app& middleware
const app = express();
app.use(cors());
app.use(express.json());

let db

// database connection
connectToDb((err) => {
    if (!err) {
        app.listen(8080, () =>{
            console.log('app listening on port 8080');
        })
        db = getDb();
    }  
})

app.param('collectionName', async (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    next();
    
})

// routes
app.get('/:collectionName', async (req,res, next) => {
    try{
        const result = await req.collection.find({}).toArray();
        console.log ("lessons fetched"); 
        res.json(result);
    } catch (err){
        console.error("error fetching lessons", err.message);
        next(err);
    }
})

app.post('/:collectionName', async (req,res, next) => {
    try{
        const {name, phone, lessons, orderDate} = req.body;
        const order = await {
            name: name,
            phone: phone,
            lessons: lessons,
            "order date": orderDate
        };
        const result = await req.collection.insertOne(order);
        console.log ("order submitted"); 
        res.json(result);
    } catch (err){
        console.error("error fetching lessons", err.message);
        next(err);
    }
})

app.put('/:collectionName/:id', async (req,res, next) => {
    try{
        const lessonId = req.params.id;
        const { space } = req.body;
        const result = await req.collection.updateOne(
            { _id: new ObjectId(lessonId) }, 
            { $set: { space: space } }      
        );
        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'Lesson not found' });
        } else {
            console.log('Lesson space updated');
            res.json({ message: 'Lesson space updated successfully', result });
        }
    } catch (err){
        console.error("error fetching lessons", err.message);
        next(err);
    }
})

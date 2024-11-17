const express = require('express');
const {connectToDb, getDb} = require('./db');
const cors = require('cors');

// init app& middleware
const app = express();
app.use(cors());

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
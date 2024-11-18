const express = require('express');
const {connectToDb, getDb} = require('./db');
const { ObjectId } = require('mongodb')
const cors = require('cors');
const logger = require('./utilities/logger');
const morgan = require('morgan');

// init app& middleware
const app = express();
const morganFormat = ':method :url :status :response-time ms';

app.use(cors());
app.use(express.json());
app.use(morgan(morganFormat,{
    stream:{
        write: (message) => {
            const logObject = {
                method: message.split(' ')[0],
                url: message.split(' ')[1],
                status: message.split(' ')[2],
                responseTime: message.split(' ')[3]
            };
            logger.info(JSON.stringify(logObject));
        }
    }
}));


// database connection
let db
connectToDb((err) => {
    if (!err) {
        app.listen(8080, () =>{
            logger.info("app listening on port 8080");
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
        res.json(result);
    } catch (err){
        logger.error("error fetching lessons", err.message);
        next(err);
    }
})

app.post('/:collectionName', async (req,res, next) => {
    try{
        const {name, phone, lessons, orderDate} = req.body;
        const order = {
            name: name,
            phone: phone,
            lessons: lessons,
            "order date": orderDate
        };
        const result = await req.collection.insertOne(order);
        res.json(result);
    } catch (err){
        logger.error("error fetching lessons", err.message);
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
            res.json({ message: 'Lesson space updated successfully', result });
        }
    } catch (err){
        logger.error("error fetching lessons", err.message);
        next(err);
    }
})

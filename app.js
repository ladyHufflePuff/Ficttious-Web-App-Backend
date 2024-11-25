const express = require('express');
const {connectToDb, getDb} = require('./db');
const { ObjectId } = require('mongodb')
const cors = require('cors');
const logger = require('./utilities/logger');
const morgan = require('morgan');
const staticMiddleware = require('./utilities/static');

// initialize app & middleware
const app = express();
const morganFormat = ':method :url :status'; 

// use middleware
app.use(cors());
app.use(express.json());
app.use(morgan(morganFormat,{  // Use morgan for HTTP request logging
    stream:{
        write: (message) => {  // Custom stream handler for morgan logs
            const logObject = {
                method: message.split(' ')[0],
                url: message.split(' ')[1],
                status: message.split(' ')[2]
            };
            logger.info(JSON.stringify(logObject)); // Log the request data using custom logger
        }
    }
}));

// serve static files
staticMiddleware(app);

// database connection setup
let db
connectToDb((err) => {
    if (!err) {
        app.listen(8080, () =>{
            logger.info("app listening on port 8080");
        })
        db = getDb();
    }  
})

// middleware to handle dynamic collection names in the route
app.param('collectionName', async (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    next();
    
})

// Routes

// GET request to fetch all lessons from lesson collection
app.get('/:collectionName', async (req,res, next) => {
    try{
        const result = await req.collection.find({}).toArray();
        res.json(result); 
    } catch (err){
        logger.error("error fetching lessons", err.message);
        next(err);
    }
})

// POST request to insert a new order into order collection
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

// PUT request to update existing lesson fields
app.put('/:collectionName/:id', async (req,res, next) => {
    try{
        const lessonId = req.params.id;
        const { id, subject, location, price, space, images } = req.body;
        const errors = [];

        if (!ObjectId.isValid(lessonId)) {
            errors.push('Invalid ObjectId');  // check if the lesson ID is a valid ObjectId
        }
        if (!Object.keys(req.body).length) {
            errors.push('No fields provided to update');  // ensure at least one field is provided for update
        } 
        if (id !== undefined && !Number.isInteger(id)) {
            errors.push('id must be an integer');  // validate id field
        }
        if (price !== undefined && !Number.isInteger(price)) {
            errors.push('price must be an integer');  // validate price field
        }
        if (space !== undefined && !Number.isInteger(space)) {
            errors.push('space must be an integer');  // validate space field
        }
        if (subject !== undefined && typeof subject !== 'string') {
            errors.push('subject must be a string');  // validate subject field
        }
        if (location !== undefined && typeof location !== 'string') {
            errors.push('location must be a string');  // validate location field
        }
        if (images !== undefined && typeof images !== 'string') {
            errors.push('images must be a string');  // validate images field
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation errors', errors });
        }

        // Update the lesson document in the collection
        const result = await req.collection.updateOne(
            { _id: new ObjectId(lessonId) }, 
            { $set: req.body }
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
});

// GET request for searching lessons
app.get('/:collectionName/search', async (req, res, next) => {
    try {
        const { search } = req.query; // Extract the search term from the query string
        function escapeRegExp(string)  {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape all special characters in search string
        };
        if (!search) {
            return res.status(205).json({ message: 'Search query is empty. Resetting content.' }); // Return if search query is empty
        }
        // Determine if the search query is a number or string
        const isNumber = !isNaN(Number(search));
        const searchQuery = isNumber ? search.toString() : search;

        // Build search query conditions
        const searchConditions = [
            { subject: { $regex: new RegExp(escapeRegExp(searchQuery), 'i') } },
            { location: { $regex: new RegExp(escapeRegExp(searchQuery), 'i') } },
            { price: { $eq: parseInt(escapeRegExp(searchQuery), 10) } },
            { space: { $eq: parseInt(escapeRegExp(searchQuery), 10) } }
        ];

        // Execute the search query
        const results = await req.collection
            .find({ $or: searchConditions })
            .limit(15)
            .toArray();

        res.json(results); // return search results
    } catch (err) {
        logger.error("Error during search:", err.message);
        next(err);
    }
});



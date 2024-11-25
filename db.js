// load environment variable
require('dotenv').config()
const { MongoClient } = require('mongodb')
// retrieve connection string from environment variables
const connectionString = process.env.MONGO_URI

let dbConnection

module.exports = {
    connectToDb:(callback) => {
        // connect to MongoDB
        MongoClient.connect(connectionString)
            .then((client) => {
                // set database reference
                dbConnection = client.db('Learn-Hub-App')
                return callback()
            })
            .catch(err => {
                // log errors that occur during connection
                console.log(err)
                return callback(err)
            })
    },
    // get current database connection
    getDb: () => dbConnection
}
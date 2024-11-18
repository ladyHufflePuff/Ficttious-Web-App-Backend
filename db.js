const { MongoClient } = require('mongodb')
const connectionString = 'mongodb+srv://uchechi:3iyjkHSUkXy2Qndh@cluster0.hymz6hv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

let dbConnection

module.exports = {
    connectToDb:(callback) => {
        MongoClient.connect(connectionString)
            .then((client) => {
                dbConnection = client.db('Learn-Hub-App')
                return callback()
            })
            .catch(err => {
                console.log(err)
                return callback(err)
            })
    },
    getDb: () => dbConnection
}
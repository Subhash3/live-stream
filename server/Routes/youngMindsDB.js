const { MongoClient } = require('mongodb')

const MONGO_URL = "http://localhost:27017"

client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })

const connect = async (client) => {
    try {
        await client.connect()
    } catch (err) {
        console.log("Error connecting to YoungMinds DB", MONGO_URL, err)
    }
}

const checkIfUserExists = (usersCollection, username) => {
    usersCollection.find().toArray(
        (err, users) => console.log(err, users)
    )
}
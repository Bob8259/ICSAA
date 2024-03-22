const {MongoClient, ObjectId} = require('mongodb');

async function connectToDB() {
    const db = new MongoClient(process.env.MONGODB_URI).db('VolunteerSystem');
    return db;
}

module.exports = {connectToDB, ObjectId};

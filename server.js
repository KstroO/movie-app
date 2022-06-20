const express = require('express')
const {MongoClient, ObjectId} = require('mongodb')
const cors = require('cors')
// const {req} = require('express')
// const {res} = require('http')
const app = express()
require('dotenv').config()

PORT = 8000
let db, 
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log('Connected to the database')
        db = client.db(dbName)
        collection = db.collection('movies')
    })
    .catch(err => console.log(err));

app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors())

app.get("/search", async (req, res) => {
    try {
        let result = await collection.aggregate([
            {
                "$search" : {
                    "index": "movie_title",
                    "autocomplete" : {
                        "query": `${req.query.query}`,
                        "path" : "title",
                        "fuzzy" : {
                            "maxEdits": 2,
                            "prefixLength": 3
                        }
                    }
                }
            }
        ]).toArray()
        res.send(result)
    } catch(error) {
        res.status(500).send({message: error.message})
    }
})

app.get("/get/:id", async (req, res) => {
    try{
        let result = await collection.findOne({
            "_id" : ObjectId(req.params.id)
        })
        res.send(result)
    } catch(error){
        res.status(500).send({message: error.message})
    }
})


app.get("/", (req, res) =>{
    res.sendFile(__dirname + '/index.html')
})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Listening to http://localhost:${PORT}`)
})
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const mongo = require('mongoose')
require('dotenv').config()

const app = express()
const port = process.env.BACKEND_PORT

// middlewares
app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors({alllowed_origins: "*"}))

// mongoDB connection
mongo.set('strictQuery', true)
mongo.connect(process.env.MONGO_CONNECTION_STRING)
.then(() => console.log("Successfully connected to MongoDB"))
.catch((err) => console.error("Error connecting to MongoDB\n" + err))


app.get('/', (req, res) => {
    res.send("Ticketing Service running!")
    return
})

app.listen(port, () => console.log(`Server listening on port ${port}!`))
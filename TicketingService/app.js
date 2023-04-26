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


// mongo - ticket model
const Ticket = mongo.model('ticket', new mongo.Schema({
    user_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: Array, required: true },
    status: { type: String, required: true },
    created_at: { type: Date, required: true },
    last_udpated_at: { type: Date, required: true },
}))


app.get('/', (req, res) => {
    console.log("GET /")
    return res.send("Ticketing Service running!") 
})

app.post('/tickets', async (req, res) => {
    console.log("POST /tickets")

    var data = {
        ticket_id: null
    }
    
    // user validation
    if (!req.headers.user_id) {
        console.log("Unauthorized")
        return res.sendStatus(401) // Unauthorized
    }

    // creating ticket
    try {
        var ticket = new Ticket({
            user_id: req.headers.user_id,
            title: req.body.title,
            description: req.body.description,
            tags: req.body.tags,
            status: "open",
            created_at: new Date(),
            last_udpated_at: new Date(),
        })

        const ticket_res = await ticket.save()
        data.ticket_id = ticket_res.id
        console.log("Ticket created successfully")
    }
    catch(err) {
        console.error("Error creating ticket\n" + err)
        return res.sendStatus(500)  // Internal server error
    }
    return res.json(data)
})

app.get('/tickets', async (req, res) => {
    console.log("GET /tickets")
    var data = {
        tickets: null
    }
    
    // user validation
    if (!req.headers.user_id) {
        console.log("Unauthorized")
        return res.sendStatus(401) // Unauthorized
    }

    // get all tickets
    try {
        const tickets = await Ticket.find()
        data.tickets = tickets
        console.log("Fetched all tickets successfully")
    }
    catch(err) {
        console.error("Error fetching all tickets\n" + err)
        return res.sendStatus(500) // Internal server error
    }
    return res.json(data)
})

app.get('/tickets/:id', async (req, res) => {
    console.log("GET /tickets/:id")
    var data = null
    
    // user validation
    if (!req.headers.user_id) {
        console.log("Unauthorized")
        return res.sendStatus(401) // Unauthorized
    }

    // ticket id validation
    if (!mongo.Types.ObjectId.isValid(req.params.id)) {
        console.log("Not found")
        return res.sendStatus(404) // Not found
    }

    // get a specific ticket
    try {
        const ticket = await Ticket.findById(req.params.id)
        if (!ticket) {
            console.error("Error fetching ticket")
            return res.sendStatus(404) // Not found
        }
        data = ticket
        console.log("Fetched ticket successfully")
    }
    catch(err) {
        console.error("Error fetching ticket\n" + err)
        return res.sendStatus(500) // Internal server error
    }
    return res.json(data)
})

app.patch('/tickets/:id', async (req, res) => {
    console.log("PATCH /tickets/:id")
    // user validation
    if (!req.headers.user_id) {
        console.log("Unauthorized")
        return res.sendStatus(401) // Unauthorized
    }

    // ticket id validation
    if (!mongo.Types.ObjectId.isValid(req.params.id)) {
        console.log("Not found")
        return res.sendStatus(404) // Not found
    }

    // ticket status validation
    if (req.body.status == "") {
        console.log("Unprocessable content")
        return res.sendStatus(422) // Unprocessable content
      }

    // update ticket status
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: req.body.status })
        if (!ticket) {
            console.error("Error updating ticket status")
            return res.sendStatus(404) // Not found
        }
        console.log("Updated ticket status successfully")
    }
    catch(err) {
        console.error("Error updating ticket status\n" + err)
        return res.sendStatus(500) // Internal server error
    }
    return res.sendStatus(204)  // No content
})

app.listen(port, () => console.log(`Ticketing Service listening on port ${port}!`))
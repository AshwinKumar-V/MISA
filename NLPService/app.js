const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const { writeConv, respond, createTicket } = require('./utils')
require("dotenv").config()

const app = express();
const port = process.env.BACKEND_PORT

//middlewares
app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors({ alllowed_origins: "*" }))


// conversation history
const conversation = []

// assistant role prompt
conversation.push({ role: "system", content: process.env.ROLE_PROMPT })
writeConv(conversation)
console.log("Assistant role assigned")


app.get('/', (req, res) => {
  console.log("GET /")
  return res.send("NLP Service running!") 
})

app.post('/chat', async (req, res) => {
  console.log("POST /chat")

  var data = {
    response: null
  }
  
  // user validation
  if (!req.headers.user_id) {
    console.log("Unauthorized")
    return res.sendStatus(401) // Unauthorized
  }

  // user prompt validation
  if (!req.body.prompt) {
    console.log("Bad request")
    return res.sendStatus(400) // Bad request
  }

  try {
    // respond to user prompt
    var completion = await respond({ role: "user", content: req.body.prompt}, conversation)

    // if ticket requested
    if (completion.action == "ticket") {

      // create ticket
      var ticket = await createTicket(completion.ticket)
      console.log("Ticket generated with ID: " + ticket.ticket_id)

      // respond to ticket confirmation
      completion = await respond({ role: "system", content: "ticket_id: " + ticket.ticket_id }, conversation)
    }

    data.response = completion.bot_response
    console.log("Response generated for user input")
  }
  catch(err) {
    console.error("Error responding to user\n" + err)
    return res.sendStatus(500)  // Internal server error
  }

  return res.json(data)
})

app.delete('/chat', (req, res) => {
  console.log("DELETE /chat")
  
  // user validation
  if (!req.headers.user_id) {
    console.log("Unauthorized")
    return res.sendStatus(401) // Unauthorized
  }

  try {
    conversation.pop()
    writeConv(conversation)
    console.log("Successfully popped conversation")
  }
  catch(err) {
    console.error("Error popping conversation\n" + err)
    return res.sendStatus(500)  // Internal server error
  }
  return res.sendStatus(204) // No content
})

app.listen(port, () => console.log(`NLP Service listening on port ${port}!`))
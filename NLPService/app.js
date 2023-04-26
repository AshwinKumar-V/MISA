const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const { respond, createTicket, getConversation, updateConversation } = require('./utils')
require("dotenv").config()

const app = express();
const port = process.env.BACKEND_PORT

//middlewares
app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors({ alllowed_origins: "*" }))


app.get('/', (req, res) => {
  console.log("GET /")
  return res.send("NLP Service running!")
})

app.post('/chat/:id', async (req, res) => {
  console.log("POST /chat/:id")

  var message_count = 0
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
    // fetch conversation based on id
    var conversation = await getConversation(req.params.id)

    // respond to user prompt
    var completion = await respond({ role: "user", content: req.body.prompt}, conversation)
    message_count += 2

    // if ticket requested
    if (completion.action == "ticket") {

      // create ticket
      var ticket = await createTicket(completion.ticket)
      console.log("Ticket generated")

      // respond to ticket confirmation
      completion = await respond({ role: "system", content: "ticket_id: " + ticket.ticket_id }, conversation)
      message_count += 2
    }

    data.response = completion.bot_response

    // update conversation messages
    await updateConversation(req.params.id, conversation.slice(-message_count))

    console.log("Response generated for user input")
  }
  catch(err) {
    console.error("Error responding to user\n" + err)
    return res.sendStatus(500)  // Internal server error
  }

  return res.json(data)
})

app.listen(port, () => console.log(`NLP Service listening on port ${port}!`))
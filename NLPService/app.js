const express = require('express')
const bodyParser = require('body-parser')
const { Configuration, OpenAIApi } = require("openai")
const cors = require('cors')
const path = require('path')
const axios = require('axios')
require("dotenv").config()

const app = express();
const port = process.env.BACKEND_PORT

//middlewares
app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors({ alllowed_origins: "*" }))


// openai configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)
let modelName = process.env.MODEL_NAME

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

  //Storing user message using Conversation MicroService
  console.log("Pushing User Message");
  const usermessage = { role: "user", content: req.body.prompt };
  try {
    await axios.post('http://localhost:3001/writemessageuser', { usermessage })
  } catch (err) {
    console.error(err)
    res.status(500).send('Error adding message')
  }

  try {

    history = [];
    try {
      history = await axios.get('http://localhost:3001/history');
      console.log("Getting History");
      console.log(history.data)
    } catch (err) {
      console.error(err)
      res.status(500).send('Error getting messages')
    }

    const response = await openai.createChatCompletion({
      model: modelName,
      messages: history.data,
      // prompt,
      // "max_tokens": 10,
      // "temperature": 0.8,
      // "n": 1,
      // "stream": false,
      // "logprobs": null,
      // "stop": "\n"
    })

    const completion = response.data.choices[0].message.content
    //Storing bot message using Conversation MicroService
    console.log("Pushing Bot Message");
    const botmessage = { role: "assistant", content: completion };
    try {
      await axios.post('http://localhost:3001/writemessagebot', { botmessage })
    } catch (err) {
      console.error(err)
      res.status(500).send('Error adding message')
    }

    data.response = completion
    console.log("Response generated for user input")
  }
  catch (err) {
    console.error("Error responding to user input\n" + err)
    return res.sendStatus(500) // Internal server issue
  }
  return res.json(data)
});

app.post("/pushmessageuser", async (req, res) => {
  console.log("Requested hit on /pushmessageuser");
  const usermessage = { role: "user", content: "Hi bot" };
  try {
    await axios.post('http://localhost:3001/writemessageuser', { usermessage })
    res.send('User Message Pushed successfully')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error adding message')
  }

});

app.post("/pushmessagebot", async (req, res) => {
  console.log("Requested hit on /pushmessagebot");
  const botmessage = { role: "assistant", content: "Hi user" };
  try {
    await axios.post('http://localhost:3001/writemessagebot', { botmessage })
    res.send('Bot Message Pushed Successfully')
  } catch (err) {
    console.error(err)
    res.status(500).send('Error adding message')
  }
});

//Retrive Context
app.get("/history", async (req, res) => {
  console.log("Requested hit on /history");
  try {
    const response = await axios.get('http://localhost:3001/history')
    res.json(response.data)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error getting messages')
  }
})

app.listen(port, () => console.log(`NLP Service listening on port ${port}!`))
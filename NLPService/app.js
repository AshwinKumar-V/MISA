const express = require('express')
const bodyParser = require('body-parser')
const { Configuration, OpenAIApi } = require("openai")
const cors = require('cors')
const path = require('path')
const { log } = require('console')
require("dotenv").config()

const app = express();
const port = process.env.BACKEND_PORT

//middlewares
app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors({ alllowed_origins: "*" }))


// openai configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)
let modelName = process.env.MODEL_NAME

// conversation history
const conversation = []

// assistant role prompt
conversation.push({ role: "system", content: process.env.ROLE_PROMPT })
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

    conversation.push({ role: "user", content: req.body.prompt})
  
    try {
      const response = await openai.createChatCompletion({
        model: modelName,
        messages: conversation,
        // prompt,
        // "max_tokens": 10,
        // "temperature": 0.8,
        // "n": 1,
        // "stream": false,
        // "logprobs": null,
        // "stop": "\n"
      })

      var completion = response.data.choices[0].message.content 

      console.log(conversation)
      console.log("\n\n")
      console.log(completion)

      completion = JSON.parse(completion) 
      data.response = completion

      conversation.push({ role: "assistant", content: completion.bot_response })
      console.log("Response generated for user input")

      if (completion.action == "ticket") {
        console.log(completion.ticket)
      }
    } 
    catch (err) {
      console.error("Error responding to user input\n" + err)
      return res.sendStatus(500) // Internal server issue
    }
    return res.json(data)
});

app.listen(port, () => console.log(`NLP Service listening on port ${port}!`))
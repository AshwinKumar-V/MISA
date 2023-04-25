const fs = require('fs').promises
const axios = require('axios')
const { Configuration, OpenAIApi } = require("openai")


// openai configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

// openai api call
async function callOpenAI(conversation) {
  try {
    const modelName = process.env.MODEL_NAME
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
    completion = completion.match(/{.*}/)[0]
  } 
  catch (err) {
    console.error("Error connecting to openai\n" + err)
    return Error()
  }
  return completion
}

// extract JSON
async function extractJSON(completion) {
  try {
    completion = JSON.parse(completion)
  }
  catch (err) {
    console.error("Error extracting JSON\n" + err)
    return Error()
  }
  return completion
}

// write conversation to file
async function writeConv(conv) {
  const filename = process.env.FILE_NAME
  try {
    await fs.writeFile(filename, JSON.stringify(conv))
  }
  catch(err) {
    console.error(`Error writing to file ${filename}\n` + err)
    return Error()
  }
  return true
}

// respond to input prompt
async function respond(prompt, conversation) {
  try {
    // add input prompt to conversation
    conversation.push(prompt)
    writeConv(conversation)
  
    // openai api call
    var completion = await callOpenAI(conversation)

    // add bot response to conversation
    conversation.push({ role: "assistant", content: completion })
    writeConv(conversation)

    // extract JSON from response
    completion = await extractJSON(completion)
  }
  catch(err) {
    console.error("Error responding to prompt\n" + err)
    return Error()
  }
  return { completion, conversation }
}

// create ticket - call ticketing microservice (POST /tickets)
async function createTicket(ticket) {
  try {
    var options = {
      headers: {
        "Content-Type": "application/json",
        "user_id": "u123"
      }
    }

    const ret = await axios.post(`${process.env.TICKETING_ADDRESS}/tickets`, ticket, options)
    if (ret) {
      return ret.data
    }
    else {
      console.error("Ticket ID not returned")
      return Error()
    }
  }
  catch(err) {
    console.error("Error creating ticket\n" + err)
    return Error()
  }
}


module.exports = { writeConv, respond, createTicket }
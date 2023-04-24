const fs = require('fs').promises
const axios = require('axios')


// write conversation to file
async function writeConv(conv) {
    var filename = process.env.FILE_NAME
    try {
      await fs.writeFile(filename, JSON.stringify(conv))
    }
    catch(err) {
      console.error(`error writing to file ${filename}\n` + err)
    }
    return true
}

// ticketing microservice - POST /tickets
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
        console.log("Ticket created successfully\nticket_id: " + ret.data.ticket_id)
        return ret.data.ticket_id
      } 
  }
  catch (err) {
      console.error("Error creating ticket\n" + err)
  }
}

module.exports = { writeConv, createTicket }
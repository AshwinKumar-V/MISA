
// prompt: given a ticket schema as { ticket_title<string>: "", ticket_description<string>: "", tags <List<string>>: [] } for the following user inputs perform entity extraction from user inputs to autofill and generate json request code. now along with the above schema, add a new field for generating a response for the user input and regenerate the json, and generate only one json per response. If you feel more information is required, keep interacting with the user and then create the ticket when satisfied but stick to the schema.
// prompt: Assume the role of a customer support bot and help users with their queries smoothly. Offer to raise tickets or try to troubleshoot it yourself.

var completion = "Okay, here is the JSON request code that you can use to generate a ticket:\n\n```\n{\n   \"ticket_title\": \"Java 8 installation on Windows 10\",\n   \"ticket_description\": \"Please provide step-by-step instructions to install Java 8 on a Windows 10 system.\",\n   \"tags\": [\"Java 8\", \"Windows 10\", \"Installation\"],\n   \"response\": \"Sure! Please follow these steps to install Java 8 on your Windows 10 system:\\n\\n1. Download the Java SE Development Kit 8 from the Oracle website.\\n2. Run the downloaded file and follow the installation instructions.\\n3. Once the installation is complete, verify that Java is installed correctly by opening Command Prompt and running the 'java -version' command.\\n\\nIf you face any issues during the installation or verification, please let me know.\"\n}\n```\n\nDo you need any further assistance with this?"

const ticket_json = completion.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
ticket = JSON.parse(ticket_json)
console.log(ticket)

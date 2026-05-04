
let {OpenAI} = require("openai");
let util = require("util");

const openai = new OpenAI();

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise(resolve => readline.question(question, answer => resolve(answer)));
};

// ANSI escape code colors
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  white: "\x1b[37m",
  bold: "\x1b[1m"
};

const chatWithGPT = async () => {
  let stop = false;

  console.log("ChatGPT Terminal Assistant\nType 'quit' to exit.\n");

  while (!stop) {
    //const userInput = await askQuestion("You: ");
    //const userInput = await askQuestion(colors.green + "You: ");
    const userInput = await askQuestion(colors.reset + "You: ");

    if (userInput.toLowerCase() === 'quit') {
      stop = true;
      readline.close();
    } else {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo-1106", //to support JSON mode and seed
          response_format: { type: "json_object" },
          seed: 12345,
          temperature: 0,
          messages: [
			  {
				role: "system",
				content: "You are a helpful assistant designed to output JSON. Use the following example of structure for JSON when asked about color "+ `{"hex": "#AABBCC", "description":"The poetic name of the color is bright green."}`,
			  },
			  { role: "user", content: userInput },
		  ]
        });

		console.log(colors.cyan +`GPT: `);
		
        console.log(colors.cyan +`GPT: ${response.choices[0].message.content}`);
        console.log(colors.white +`\nfingerprint: ${util.inspect(response,{depth: Infinity})}`);
      } catch (error) {
        console.error("Error connecting to OpenAI: ", error);
      }
    }
  }
};

chatWithGPT();
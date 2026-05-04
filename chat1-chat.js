
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

function markdownToTerminal(str) {
    // Replace the Markdown bold syntax with ANSI codes
    // \x1b[1m is the ANSI code for bold
    // \x1b[0m resets the formatting
    return str.replace(/\*\*(.*?)\*\*/g, '\x1b[37m$1\x1b[36m');
}

const chatWithGPT = async () => {
  let stop = false;

  console.log("ChatGPT Terminal Assistant\nType 'quit' to exit.\n");

  let allMessages = [{
			role: "system",
			content: "You are a helpful assistant.",
		  }
  ];

  while (!stop) {
    //const userInput = await askQuestion("You: ");
    //const userInput = await askQuestion(colors.green + "You: ");
    const userInput = await askQuestion(colors.reset + "You: ");


    if (userInput.toLowerCase() === 'quit') {
      stop = true;
      readline.close();
    } else {
      try {
        allMessages.push({ role: "user", content: userInput });
        const response = await openai.chat.completions.create({
          //model: "gpt-3.5-turbo-1106", //to support JSON mode and seed
          model: "gpt-4-1106-preview",
          //response_format: { type: "json_object" },
          //seed: 2,
          //stream: true,
          messages: allMessages
        });
        
        allMessages.push(response.choices[0].message);

		let txt = markdownToTerminal(response.choices[0].message.content);
        console.log(colors.cyan +`GPT: ${txt}`);
        console.log(colors.white + util.inspect(response.choices[0].message));


// 		console.log(colors.cyan +`GPT: `);		
// 		for await (const chunk of response) {
// 			process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
// 		  }

      } catch (error) {
        console.error("Error connecting to OpenAI: ", error);
      }
    }
  }
};

chatWithGPT();
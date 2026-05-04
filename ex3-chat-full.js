
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
    return str.replace(/\*\*(.*?)\*\*/g, '\x1b[1m$1\x1b[0m'+colors.cyan);
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
    // === READ section ===
    const userInput = await askQuestion(colors.reset + "You: ");


    if (userInput.toLowerCase() === 'quit') {
      stop = true;
      readline.close();
    } else {
      try {
        // === EVAL section ===
        allMessages.push({ role: "user", content: userInput });
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: allMessages
        });
        allMessages.push(response.choices[0].message);

        // === PRINT section ===
		let txt = markdownToTerminal(response.choices[0].message.content);
        console.log(colors.cyan +`GPT: ${txt}`);

      } catch (error) {
        console.error("Error connecting to OpenAI: ", error);
      }
    }
    // === LOOP END ===
  }
};

chatWithGPT();

let {OpenAI} = require("openai");

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
        const response = await openai.completions.create({
          model: "gpt-3.5-turbo-instruct", // Replace with the model you're using; as of my last update, "text-davinci-003" was the latest.
          prompt: userInput,
          max_tokens: 150,
        });

        //console.log(`GPT: ${response.choices[0].text.trim()}`);
        //console.log(colors.cyan +`GPT: ${response.choices[0].text.trim()}`);
        console.log(colors.bold +`GPT: ${response.choices[0].text.trim()}`);
      } catch (error) {
        console.error("Error connecting to OpenAI: ", error);
      }
    }
  }
};

chatWithGPT();
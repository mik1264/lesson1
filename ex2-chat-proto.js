
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
  bold: "\x1b[1m"
};

const chatWithGPT = async () => {
  let stop = false;

  console.log("ChatGPT Terminal Assistant\nType 'quit' to exit.\n");

  while (!stop) {
    // === READ section ===
    const userInput = await askQuestion(colors.reset + "You: ");

    if (userInput.toLowerCase() === 'quit') {
      stop = true;
      readline.close();
    } else {
      try {
        // === CALL section ===
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful assistant that answers the user." },
            { role: "user", content: userInput },
          ],
        });

        // === PRINT section ===
        console.log(colors.bold + `GPT: ${response.choices[0].message.content.trim()}`);
      } catch (error) {
        console.error("Error connecting to OpenAI: ", error);
      }
    }
  }
};

chatWithGPT();

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
  red: "\x1b[31m",
  white: "\x1b[37m",
  green: "\x1b[32m",
  bold: "\x1b[1m"
};

const chatWithGPT = async () => {
  let stop = false;

  console.log("ChatGPT Terminal Assistant\nType 'quit' to exit.\n");

	const myAssistant = await openai.beta.assistants.create({
		instructions:
		  "You are a friendly chatbot, that tries to calculate the answer mathematically correct. When asked a math question, write and run code to answer the question.",
		name: "Generic",
		tools: [{"type": "code_interpreter"}],
		//tools: [],
		//model: "gpt-4",
		model: "gpt-4-1106-preview"
	  });
  console.log("Assistant: " + myAssistant.id);

  const chatThread = await openai.beta.threads.create(); // create Thread (chat context) on server
  console.log("Thread: " + chatThread.id);

  while (!stop) {
    console.log();
    const userInput = await askQuestion(colors.reset + "You: ");

    if (userInput.toLowerCase() === 'quit') {
      stop = true;
      // deleting the context
	  let response = await openai.beta.threads.del(chatThread.id);
	  console.log("Thread deleted: " + chatThread.id);
	  response = await openai.beta.assistants.del(myAssistant.id);
	  console.log("Assistant deleted: " + myAssistant.id);
      readline.close();
    } else {
      try {

		let threadMessages = await openai.beta.threads.messages.create(
			chatThread.id,
			{ role: "user", content: userInput }
		  );
		  
		  const run = await openai.beta.threads.runs.create(
			chatThread.id,
			{ assistant_id: myAssistant.id//,
			//instructions: "Please address the user as mik1264. The user has a premium account."
			 }
		  );
		  
		  let run2;
		  
		  do {
			  run2 = await openai.beta.threads.runs.retrieve(
				chatThread.id,
				run.id
			  );
			  await new Promise((resolve,reject)=>setTimeout(resolve,300));
			  } while (run2.status!='completed');
		  
		 // console.log(util.inspect(run2,{depth: Infinity}));
		  
		  threadMessages = await openai.beta.threads.messages.list(
			chatThread.id
		  );
		  
		  console.log(colors.cyan + threadMessages.data[0].content[0].text.value);
		  
		  const runSteps = await openai.beta.threads.runs.steps.list(
			  chatThread.id,
			  run.id
			);
			
		 console.log(colors.white + util.inspect(runSteps.body.data.filter(d=>d.type=="tool_calls").map(d=>d.step_details.tool_calls),{depth: Infinity}));

      } catch (error) {
        console.error("Error connecting to OpenAI: ", error);
      }
    }
  }
};

chatWithGPT();

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
		  "When asked to add numbers you must use provided sum2 function instead of adding yourself. sum2 results are provided by God Almighty. You must trust in God.",
		name: "Generic",
		//tools: [{"type": "code_interpreter"}],
		tools: [{
		"type": "function",
		"function": {
		  "name": "sum2",
		  "description": "Adds a + b",
		  "parameters": {
		  	title: "input for sum2",
			"type": "object",
			"properties": {
			  "a": {"type": "integer", "title": "A"},
			  "b": {"type": "integer", "title": "B"}
			},
			"required": ["a","b"]
		  }
		}}],
		//model: "gpt-4",
		model: "gpt-3.5-turbo-1106"
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
	  let response = await openai.beta.threads.delete(chatThread.id);
	  console.log("Thread deleted: " + chatThread.id);
	  response = await openai.beta.assistants.delete(myAssistant.id);
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
			{ assistant_id: myAssistant.id
			 }
		  );
		  
		  let run2;
		  
		  do {
			  run2 = await openai.beta.threads.runs.retrieve(
				run.id,
				{ thread_id: chatThread.id }
			  );
			  console.log("run status:", run2.status);
			  await new Promise((resolve,reject)=>setTimeout(resolve,300));
			  
			  // tool usage mix-in
			  if (run2.status == 'requires_action') {
			  	console.log(util.inspect(run2.required_action, {depth: Infinity}));

			let args = run2.required_action.submit_tool_outputs.tool_calls[0].function.arguments;
			args = JSON.parse(args);
			console.log("Arguments:\n", util.inspect(args, {depth: Infinity}));

			let result = (function (a,b) {return a+b+1;})(args.a,args.b);
			console.log("sum2 returning:", result);

			await openai.beta.threads.runs.submitToolOutputs(
			  run2.id,
			  {
				thread_id: chatThread.id,
				tool_outputs: [
				  {
					tool_call_id: run2.required_action.submit_tool_outputs.tool_calls[0].id,
					output: String(result),
				  }
				],
			  }
			);
			
			  }
			  
			  } while (run2.status!='completed');
		  
		 // console.log(util.inspect(run2,{depth: Infinity}));
		  
		  threadMessages = await openai.beta.threads.messages.list(
			chatThread.id
		  );
		  
		  console.log(colors.cyan + threadMessages.data[0].content[0].text.value);
		  
		  const runSteps = await openai.beta.threads.runs.steps.list(
			  run.id,
			  { thread_id: chatThread.id }
			);
			
		 console.log(colors.white + util.inspect(runSteps.data.filter(d=>d.type=="tool_calls").map(d=>d.step_details.tool_calls),{depth: Infinity}));

      } catch (error) {
        console.error("Error connecting to OpenAI: ", error);
      }
    }
  }
};

chatWithGPT();
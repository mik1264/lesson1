# lesson1 — OpenAI API examples

Five small Node scripts that walk through the basics of the OpenAI Node SDK.

## Setup

```bash
npm install
export OPENAI_API_KEY=sk-...
```

Each example is a standalone script: `node ex<N>-<topic>.js`.

## Examples

| File | What it shows |
|---|---|
| `ex1-completion.js` | One-shot `chat.completions.create` call against `gpt-4o`. Logs the full response object alongside the assistant message. |
| `ex2-chat-proto.js` | Interactive REPL prototype. Each turn is independent — no conversation history. Useful as a minimal scaffold. |
| `ex3-chat-full.js` | Interactive REPL that keeps an `allMessages` array, so the assistant remembers earlier turns. Includes a tiny markdown-to-ANSI renderer for `**bold**`. |
| `ex4-call-functions.js` | Assistants API + function calling. Defines a `sum2(a, b)` tool, polls the run, and submits tool outputs back. Demonstrates the `requires_action` cycle. |
| `ex5-structured-output.js` | Structured Outputs via `response_format: { type: "json_schema", strict: true }`. The model returns guaranteed-valid JSON matching a color schema. Also handles `refusal`. |

## Notes

- The `node_modules`, `.env`, `.envrc`, and `gpt-log.txt` paths are gitignored.
- A local `.envrc` with `export NODE_OPTIONS=--no-deprecation` (loaded via [direnv](https://direnv.net/)) suppresses the punycode deprecation warning that surfaces in older transitive deps.
- Type `quit` to exit any of the interactive REPL examples.

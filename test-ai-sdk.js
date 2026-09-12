import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

async function main() {
  const apiKey = "AQ.Ab8RN6ISoQqIITvy0vOUOgltGgefK71EMs9vGCA2w8BsF19GeA";
  const google = createGoogleGenerativeAI({ apiKey });
  
  try {
    const result = await streamText({
      model: google('gemini-3.6-flash'),
      messages: [{ role: 'user', content: 'Hello!' }],
      onError: ({ error }) => {
        console.error("StreamText internal error:", error);
      }
    });

    const stream = result.textStream;
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
    console.log("\nDone!");
  } catch (error) {
    console.error("Caught error:", error);
  }
}

main();

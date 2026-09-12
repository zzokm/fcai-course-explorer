async function test() {
  console.log("Testing chat locally...");
  const chatRes = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-provider": "google",
      "x-api-key": "AQ.Ab8RN6ISoQqIITvy0vOUOgltGgefK71EMs9vGCA2w8BsF19GeA",
      "x-model": "gemini-2.5-flash"
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Hello! What is your name?" }]
    })
  });
  console.log("Chat Status:", chatRes.status);
  
  if (chatRes.ok) {
    const reader = chatRes.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      process.stdout.write(decoder.decode(value));
    }
    console.log("\nDone!");
  } else {
    console.log("Error:", await chatRes.text());
  }
}
test();

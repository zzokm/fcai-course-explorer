require('dotenv').config({ path: '.env.local' });
const { embed } = require('ai');
const { google } = require('@ai-sdk/google');

async function main() {
  try {
    console.log("Testing textEmbeddingModel...");
    const { embedding } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: "hello world"
    });
    console.log("Success! Dimensions:", embedding.length);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}
main();

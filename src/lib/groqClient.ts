// src/lib/groqClient.ts
"use client"; // if you intend to use this in React components

import { createGroq } from "@ai-sdk/groq";

export const groqClient = createGroq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, // your public key
  // baseURL, headers, or fetch overrides could go here
});

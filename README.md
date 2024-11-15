# WhatsApp Group Chat Summarizer Bot

This bot automatically summarizes WhatsApp group chats using Google's Gemini AI.

## Features

- Connects to WhatsApp using web client
- Monitors group messages
- Generates summaries on demand using !summary command
- Uses Google's Gemini AI for natural language processing

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a .env file with your Google API key:
   ```
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

3. Start the bot:
   ```bash
   npm start
   ```

4. Scan the QR code with WhatsApp to log in

## Usage

In any WhatsApp group:
- Type `!summary` to get a summary of the recent chat history
- The bot will analyze the last 50 messages and provide a concise summary

## Note

Make sure to keep your API keys secure and never share them publicly.
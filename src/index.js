import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const { Client } = pkg;
dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });


const client = new Client({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  }
});


client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code above to login');
});



const groupMessages = new Map();
client.on('ready', () => {

  console.log('WhatsApp client is ready!');
 
  client.on('message', async (message) => {
    console.log(`Message received from ${message.from}: ${message.body}`);
    const chat = await message.getChat();
    if (message.body.toLowerCase() === '!isbotthere') { //!ping 
      if (chat.isGroup) {
        const chat = await message.getChat();
        const participants = await chat.participants;
        const botId = client.info.wid._serialized;

        const isBotInGroup = participants.some(participant => participant.id._serialized === botId);

        if (isBotInGroup) {
          await message.reply("✅ Yes, I'm here in this group!");
        } else {
          await message.reply("🚫 No, I'm not in this group.");
        }
      } else {
        await message.reply("This command only works in group chats.");
      }
    }
  });
});


client.on('error', (error) => {
  console.error('WhatsApp client error:', error);
});


client.on('message', async (message) => {

  const chat = await message.getChat();
  {
    if (message.body.toLowerCase() === '!isbotthere') {
      try {
     
        if (chat.isGroup) {
          const chat = await message.getChat();
  
    
          const participants = await chat.participants;
  
          
          const botId = client.info.wid._serialized;
          const isBotInGroup = participants.some(participant => participant.id._serialized === botId);
  
          if (isBotInGroup) {
            await message.reply("✅ Yes, I'm here in this group!");
          } else {
            await message.reply("🚫 No, I'm not in this group.");
          }
        } else {
          await message.reply("This command only works in a group chat.");
        }
      } catch (error) {
        console.error("Error checking bot presence:", error);
        await message.reply("An error occurred while checking bot presence.");
      }
    }
  }
  if (chat.isGroup) {
    const chatId = message.from;

    
    console.log(`New message in group ${chatId}:`);
    console.log(`Sender: ${message._data.notifyName || 'Unknown'}`);
    console.log(`Message: ${message.body}`);
    console.log(`Timestamp: ${new Date(message.timestamp * 1000).toLocaleString()}`);

 
    if (!groupMessages.has(chatId)) {
      groupMessages.set(chatId, []);
    }

    
    const messages = groupMessages.get(chatId);
    messages.push({
      sender: message._data.notifyName || 'Unknown',
      message: message.body,
      timestamp: message.timestamp
    });

  //7pm 
    if (message.body.toLowerCase() === '!summary') {
      try {
        const last50Messages = messages.slice(-50);
        const conversationText = last50Messages
          .map(msg => `${msg.sender}: ${msg.message}`)
          .join('\n');

        const prompt = `Please provide a concise summary of this WhatsApp group chat conversation. Focus on the main topics discussed, key decisions made, and important action items. Format the summary in bullet points:\n\n${conversationText}`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        await message.reply(`📝 *Chat Summary*\n\n${summary}`);
        
        
        groupMessages.set(chatId, []);
      } catch (error) {
        console.error('Error generating summary:', error);
        await message.reply('Sorry, there was an error generating the summary. Please try again later.');
      }
    }
  }
});



client.on('error', (error) => {
  console.error('WhatsApp client error:', error);
});


client.initialize();
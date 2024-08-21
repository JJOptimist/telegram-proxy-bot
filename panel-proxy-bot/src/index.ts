import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
const PROXY_BOT_TOKEN = process.env.TELEGRAM_BOT_API; // Replace with your proxy bot token

// Function to get BotFather's chat ID
async function getBotFatherChatId() {
    try {
        // Send a message to BotFather
        await axios.post(`${TELEGRAM_API_URL}${PROXY_BOT_TOKEN}/sendMessage`, {
            chat_id: '@BotFather',
            text: '/start'
        });

        // Get updates to find the chat ID
        const updatesResponse = await axios.get(`${TELEGRAM_API_URL}${PROXY_BOT_TOKEN}/getUpdates`);
        const updates = updatesResponse.data.result;

        // Find the message that was sent to BotFather
        const botFatherMessage = updates.find((update: any) => update.message && update.message.chat.username === 'BotFather');

        if (botFatherMessage) {
            return botFatherMessage.message.chat.id;
        } else {
            throw new Error('BotFather chat ID not found in updates.');
        }
    } catch (error) {
        console.error('Error fetching BotFather chat ID:', error);
        throw error;
    }
}

// Function to create a new bot
async function createBot(botName: string, botUsername: string) {
    try {
        const botFatherChatId = await getBotFatherChatId();

        // Send /newbot command to BotFather
        await axios.post(`${TELEGRAM_API_URL}${PROXY_BOT_TOKEN}/sendMessage`, {
            chat_id: botFatherChatId,
            text: '/newbot'
        });

        // Send bot name
        await axios.post(`${TELEGRAM_API_URL}${PROXY_BOT_TOKEN}/sendMessage`, {
            chat_id: botFatherChatId,
            text: botName
        });

        // Send bot username
        await axios.post(`${TELEGRAM_API_URL}${PROXY_BOT_TOKEN}/sendMessage`, {
            chat_id: botFatherChatId,
            text: botUsername
        });

        // Get updates to retrieve the bot token
        const updatesResponse = await axios.get(`${TELEGRAM_API_URL}${PROXY_BOT_TOKEN}/getUpdates`);
        const updates = updatesResponse.data.result;

        // Find the message that contains the bot token
        const tokenMessage = updates.find((update: any) =>
            update.message.text && update.message.text.includes('Use this token to access the HTTP API')
        );

        if (tokenMessage) {
            const botToken = tokenMessage.message.text.split('token: ')[1];
            return botToken;
        } else {
            throw new Error('Failed to retrieve bot token from BotFather.');
        }
    } catch (error: any) {
        console.error('Error creating bot:', error);
        throw error;
    }
}

// API endpoint to handle bot creation
app.post('/api/create-bot', async (req, res) => {
    const { botName, botUsername } = req.body;

    try {
        const botToken = await createBot(botName, botUsername);
        res.status(200).json({ success: true, botToken });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

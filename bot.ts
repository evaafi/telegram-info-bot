import fetch from 'node-fetch';
import TelegramBot, { ChatId, SendMessageOptions } from 'node-telegram-bot-api';
import 'dotenv/config'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const CODE_TO_MSG = {
    denied: 'You has already collected testnet tokens. You are only allowed to do this once',
    ok: 'You used the tokens faucet. The action will take some time to process, please do not worry'
};

const bot = new TelegramBot(TOKEN || '', { polling: true });
const menu = [
    [{ text: 'Open Application', web_app: { url: 'https://front-end-two-snowy.vercel.app/#/new' } }],
    [{ text: 'Market Data', web_app: { url: 'https://front-end-two-snowy.vercel.app/#/market' }}],
    [{ text: 'Get Testnet Tokens', callback_data: 'Get tokens' }],
    [{ text: 'Join EVAA Community', url: 'https://t.me/EvaaProtocolHub' }],
    [{ text: 'EVAA News', url: 'https://t.me/evaaprotocol' }],
    [{ text: 'Submit Testnet Feedback', url: 'https://forms.gle/Sr6Rs2VhQqYdDuCVA' }],
    [{ text: 'Notifications (soon)', callback_data: 'notifications' }]
];


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const message = 'Welcome To EVAA Menu Telegram Bot';
    const options: SendMessageOptions = {
        reply_markup: { inline_keyboard: menu }
    };

    bot.sendMessage(chatId, message, options);
});

bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message?.chat.id as ChatId;

    if (callbackQuery.data === 'Get tokens') {
        const message = 'Enter your TON address to receive testnet tokens';
        bot.sendMessage(chatId, message);

        bot.once('message', (msg) => {
            getTokens(msg.text).then(code => {
                bot.sendMessage(msg.chat.id, CODE_TO_MSG[code]);
            });
        });
    }
});



bot.on("polling_error", console.log);



const getTokens = async (address?: string) => {
    try {
        const response = await fetch('https://evaa-testnet-faucet.herokuapp.com/api/v1/feed', {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                address
            })
        });

        const parsedResponse = await response.json();

        if (parsedResponse.status === 'denied') {
            return 'denied'
        }
        return 'ok'
    } catch {
        return 'ok'
    }
}


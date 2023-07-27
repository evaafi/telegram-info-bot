import fetch from 'node-fetch';
import TelegramBot, { ChatId, MessageEntityType, SendMessageOptions } from 'node-telegram-bot-api';
import 'dotenv/config'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const CODE_TO_MSG = {
    denied: 'You has already collected testnet tokens. You are only allowed to do this once',
    ok: 'You used the tokens faucet. The action will take some time to process, please do not worry'
};

const bot = new TelegramBot(TOKEN || '', { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const message = `\n🎉 Welcome to EVAA \n\n\n💱 EVAA - the landing protocol on TON blockchain \n\n\n[Submit Testnet feedback!](https://forms.gle/Sr6Rs2VhQqYdDuCVA) \n\n\nSubscribe to [our news](https://t.me/evaaprotocol) \n\nJoin our [EVAA Comunity](https://t.me/EvaaProtocolHub) \n\n\nStay tuned!`;
    const options: SendMessageOptions = {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: 
            [
            [{ text: '🏦 Launch App', web_app: { url: 'https://front-end-two-snowy.vercel.app/#/new' }  }],
            [{ text: '📊 Market Data', web_app: { url: 'https://front-end-two-snowy.vercel.app/#/market' }}, { text: '💰 Receve Testnet Tokens', callback_data: 'Get tokens' }]
        ]},  
        
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


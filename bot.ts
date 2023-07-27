import fetch from 'node-fetch';
import TelegramBot, { ChatId, MessageEntityType, SendMessageOptions } from 'node-telegram-bot-api';
import 'dotenv/config'
import http from 'http';
import express from 'express';

const SERVER_PORT = process.env.PORT || '3000';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const CODE_TO_MSG = {
    denied: 'You has already collected testnet tokens. You are only allowed to do this once',
    ok: 'You used the tokens faucet. The action will take some time to process, please do not worry'
};

const bot = new TelegramBot(TOKEN || '', { polling: true });

bot.onText(/\/start/, (msg: any) => { //todo rm any
    const chatId = msg.chat.id;

    const message = `🎉 Welcome to EVAA \n\n💱 EVAA - the landing protocol on TON blockchain \n\n[Submit Testnet feedback!](https://forms.gle/Sr6Rs2VhQqYdDuCVA) \n\nSubscribe to [our news](https://t.me/evaaprotocol) \nJoin our [EVAA Comunity](https://t.me/EvaaProtocolHub) \n\nStay tuned!`;
    const options: SendMessageOptions = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard:
                [
                    [{ text: '🏦 Launch App', web_app: { url: 'https://front-end-two-snowy.vercel.app/#/new' } }],
                    [{ text: '📊 Market Data', web_app: { url: 'https://front-end-two-snowy.vercel.app/#/market' } }, { text: '💰 Get Testnet Tokens', callback_data: 'Get tokens' }]
                ]
        },

    };

    bot.sendMessage(chatId, message, options);
});

bot.on('callback_query', (callbackQuery: any) => { //todo rm any
    const chatId = callbackQuery.message?.chat.id as ChatId;

    if (callbackQuery.data === 'Get tokens') {
        const message = 'Enter your TON address to receive testnet tokens';
        bot.sendMessage(chatId, message);

        bot.once('message', (msg: any) => { //todo rm any
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



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(join(path.resolve(''), 'public')));

app.set('port', SERVER_PORT);

const server = http.createServer(app);
server.listen(SERVER_PORT);

server.on('listening', () => {
    console.info(`Listening on ${SERVER_PORT}`);
});

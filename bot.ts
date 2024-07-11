import fetch from 'node-fetch';
import TelegramBot, { ChatId, MessageEntityType, SendMessageOptions } from 'node-telegram-bot-api';
import 'dotenv/config'
import http from 'http';
import express from 'express';

const SERVER_PORT = process.env.PORT || '3000';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(TOKEN || '', { polling: true });

bot.onText(/\/start/, (msg: any) => { //todo rm any
    const chatId = msg.chat.id;

    const message = `🎉 Welcome to EVAA \n\n💱 EVAA - the lending protocol on TON blockchain \n\nSubscribe to [our news](https://t.me/evaaprotocol) \nJoin our [EVAA Comunity](https://t.me/EvaaProtocolHub) \n\nStay tuned!`;
    const options: SendMessageOptions = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard:
                [
                    [{ text: '🏦 Launch App', web_app: { url: 'https://sepezhotest.web.app/' } }],
                    [{ text: '📊 Market Data', web_app: { url: 'https://sepezhotest.web.app/market' } }, { text: '📖 Guidebook', web_app: { url: 'https://evaa.gitbook.io/intro/' } }]
                ]
        },

    };

    bot.sendMessage(chatId, message, options);
});


bot.on("polling_error", console.log);


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

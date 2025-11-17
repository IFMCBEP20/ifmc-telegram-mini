import os
from flask import Flask, request, abort
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from threading import Thread

app = Flask(__name__)
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")
bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start', 'launch'])
def start(m):
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(
        "Launch Meme Token 🇮🇪",
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    bot.send_message(m.chat.id,
        "*IFMC – Ireland First Meme Centre*\n\n"
        "Create a fair memecoin on BSC in seconds.\n"
        "Click below to launch inside Telegram:",
        parse_mode="Markdown", reply_markup=markup)

@app.route(f'/{BOT_TOKEN}', methods=['POST'])
def webhook():
    if request.headers.get('content-type') == 'application/json':
        json_string = request.get_data().decode('utf-8')
        update = telebot.types.Update.de_json(json_string)
        bot.process_new_updates([update])
        return ''
    else:
        abort(403)

@app.route('/')
def index():
    return 'IFMC Bot Alive – Ready for BSC Launches!'

def run_bot():
    bot.infinity_polling()

if __name__ == '__main__':
    Thread(target=run_bot, daemon=True).start()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))

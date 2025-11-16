import os
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")

bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start', 'launch'])
def start(m):
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(
        "Launch Meme Token",
        web_app=WebAppInfo(url=WEBAPP_URL)
    ))
    bot.send_message(m.chat.id,
        "*IFMC – Ireland First Meme Centre*\n\n"
        "Create a fair memecoin on BSC in seconds.\n"
        "Click below to launch inside Telegram:",
        parse_mode="Markdown", reply_markup=markup)

print("IFMC Bot is running...")
bot.infinity_polling()

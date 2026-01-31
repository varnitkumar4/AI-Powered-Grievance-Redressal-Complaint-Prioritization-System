import random
import json
import numpy as np
import pickle
import os

from flask import Flask, request, jsonify
from flask_cors import CORS

import nltk
from nltk.stem import WordNetLemmatizer
from tensorflow.keras.models import load_model

nltk.download('punkt', quiet=True)
nltk.download('wordnet', quiet=True)

app = Flask(__name__)
CORS(app)

lemmatizer = WordNetLemmatizer()

# PATH SETUP 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

intents = json.loads(open(os.path.join(BASE_DIR, 'intents.json')).read())
words = pickle.load(open(os.path.join(BASE_DIR, 'words.pkl'), 'rb'))
classes = pickle.load(open(os.path.join(BASE_DIR, 'classes.pkl'), 'rb'))

model = load_model(os.path.join(BASE_DIR, 'chatbot_model.h5'))


# FUNCTIONS 
def clean_up_sentence(sentence):
    try:
        sentence_words = nltk.word_tokenize(sentence)
        sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
        return sentence_words
    except Exception as e:
        print("Tokenization error:", e)
        return []


def bag_of_words(sentence):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for w in sentence_words:
        for i, word in enumerate(words):
            if word == w:
                bag[i] = 1
    return np.array(bag)

def predict_class(sentence):
    bow = bag_of_words(sentence)

    if bow.sum() == 0:
        return []

    res = model.predict(np.array([bow]), verbose=0)[0]

    ERROR_THRESHOLD = 0.3
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)

    return [{'intent': classes[r[0]], 'probability': str(r[1])} for r in results]


def get_response(intents_list, intents_json):
    if not intents_list:
        return "I'm not sure I understand. Please rephrase your issue."
    tag = intents_list[0]['intent']
    for i in intents_json['intents']:
        if i['tags'] == tag:
            return random.choice(i['responses'])
    return "Sorry, I couldn't find a suitable response."

# API 

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Chatbot API is running",
        "usage": "POST /chat with JSON { message: 'your text' }"
    })

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()

    if not data or "message" not in data:
        return jsonify({"reply": "Please send a message."}), 400

    message = data["message"]
    intents_list = predict_class(message)
    reply = get_response(intents_list, intents)

    return jsonify({"reply": reply})


if __name__ == "__main__":
    app.run(port=5001, debug=True)

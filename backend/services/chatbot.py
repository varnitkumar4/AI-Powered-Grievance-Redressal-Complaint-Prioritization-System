import json
import random
import sys

message = sys.argv[1].lower()

with open("neural-network-chatbot/intents.json") as file:
    data = json.load(file)

reply = "Sorry, I didn't understand your issue."

for intent in data["intents"]:
    for pattern in intent["patterns"]:
        if pattern.lower() in message:
            reply = random.choice(intent["responses"])
            break

print(reply)
# import json
# import random
# import sys

# message = input("You: ").lower()
# with open("backend/neural-network-chatbot/intents.json") as file:
#     data = json.load(file)

# reply = "Sorry, I didn't understand your issue."

# for intent in data["intents"]:
#     for pattern in intent["patterns"]:
#         if pattern.lower() in message:
#             reply = random.choice(intent["responses"])
#             break

# print(reply)




import json
import random
from rapidfuzz import process, fuzz


message = input("You: ").lower()


with open("backend/neural-network-chatbot/intents.json") as file:
    data = json.load(file)

all_patterns = []
pattern_to_response = {}

# Store all patterns
for intent in data["intents"]:
    for pattern in intent["patterns"]:
        all_patterns.append(pattern)

        pattern_to_response[pattern] = {
            "responses": intent["responses"],
            "tag": intent["tags"]
        }

# Find best match
best_match, score, _ = process.extractOne(
    message,
    all_patterns,
    scorer=fuzz.token_sort_ratio
)

# Threshold
if score >= 75:

    response_data = pattern_to_response[best_match]

    response = random.choice(response_data["responses"])

    # print(f"\nMatched Intent: {response_data['tag']}")
    # print(f"Confidence Score: {score}%")
    print("Bot:", response)

else:
    print("Bot: Sorry, I didn't understand your complaint.")
import sys
sys.path.append('c:\\Users\\Chandu Chendi\\Desktop\\app\\backend')
import routers.session as session
from schemas import SessionCreate
from fastapi import Depends

# We just want to call the session_data generation
# But there's FastAPI dependencies. Let's just copy the generation logic.
import uuid
import datetime
import random
import data.word_bank as word_bank

now = datetime.datetime.now()
correct_year = str(now.year)
month = now.month
if month in [12, 1, 2]:
    correct_season = "Winter"
elif month in [3, 4, 5]:
    correct_season = "Spring"
elif month in [6, 7, 8]:
    correct_season = "Summer"
else:
    correct_season = "Fall"

orientation_correct = f"{correct_year} - {correct_season}"
orientation_options = [orientation_correct]
while len(orientation_options) < 4:
    y = random.choice(word_bank.YEARS)
    s = random.choice(word_bank.SEASONS)
    opt = f"{y} - {s}"
    if opt not in orientation_options:
        orientation_options.append(opt)

with open('output.txt', 'w', encoding='utf-8') as f:
    f.write(str(orientation_options))

import random, uuid
YEARS = ["2026", "2025", "2024", "2023"]
SEASONS = ["Spring 🌸", "Summer ☀️", "Fall 🍂", "Winter ❄️"]

for i in range(5):
    seed = str(uuid.uuid4())
    random.seed(seed)
    options = ["2026 - Summer"]
    while len(options) < 4:
        y = random.choice(YEARS)
        s = random.choice(SEASONS)
        opt = f"{y} - {s}"
        if opt not in options:
            options.append(opt)
    print(options)

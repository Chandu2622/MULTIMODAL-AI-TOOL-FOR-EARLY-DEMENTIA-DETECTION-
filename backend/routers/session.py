from fastapi import APIRouter, HTTPException, Depends
import uuid
import datetime
import random
from schemas import SessionCreate
from data import db, word_bank, question_templates
from utils.auth import get_current_user

router = APIRouter(prefix="/session", tags=["Session"])

@router.post("/create")
def create_session(session_data: SessionCreate, current_user: str = Depends(get_current_user)):
    if session_data.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.get_user(session_data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    session_id = str(uuid.uuid4())
    seed = str(uuid.uuid4())
    random.seed(seed)
    
    # Generate words for recall tasks
    words_to_remember_keys = random.sample(word_bank.WORDS, 3)
    words_to_remember = [f"{w} {word_bank.WORD_EMOJIS[w]}" for w in words_to_remember_keys]
    
    all_other_words = [w for w in word_bank.WORDS if w not in words_to_remember_keys]
    wrong_sets = []
    for _ in range(3):
        wrong_keys = random.sample(all_other_words, 3)
        wrong_sets.append([f"{w} {word_bank.WORD_EMOJIS[w]}" for w in wrong_keys])
        
    # Generate Math (Attention)
    start_num = random.randint(90, 100)
    step_num = random.randint(5, 9)
    math_correct = ", ".join([str(start_num - step_num * i) for i in range(1, 6)])
    math_wrong1 = ", ".join([str(start_num - step_num * i - 1) for i in range(1, 6)])
    math_wrong2 = ", ".join([str(start_num + 1 - step_num * i) for i in range(1, 6)])
    math_wrong3 = ", ".join([str(start_num - (step_num - 1) * i) for i in range(1, 6)])
    
    # Orientation (Use real system time)
    now = datetime.datetime.now()
    correct_year = str(now.year)
    
    # Determine season
    month = now.month
    if month in [12, 1, 2]:
        correct_season = "Winter ❄️"
    elif month in [3, 4, 5]:
        correct_season = "Spring 🌸"
    elif month in [6, 7, 8]:
        correct_season = "Summer ☀️"
    else:
        correct_season = "Fall 🍂"
        
    orientation_correct = f"{correct_year} - {correct_season}"
    orientation_options = [orientation_correct]
    
    # Use the other 3 seasons for the wrong options to guarantee variety
    other_seasons = [s for s in word_bank.SEASONS if s != correct_season]
    for s in other_seasons:
        y = random.choice(word_bank.YEARS)
        orientation_options.append(f"{y} - {s}")

    test_flow = [
        # ==========================================
        # MMSE (Total: 30 Points) - Higher is Better
        # ==========================================
        {
            "id": "mmse_orientation", "test_name": "MMSE", "type": "multiple_choice", 
            "title": "Orientation (Time & Place) 📅", 
            "prompt": "Which of the following describes the current year and season?", 
            "options": orientation_options,
            "score_mapping": {orientation_correct: 10, orientation_options[1]: 0, orientation_options[2]: 0, orientation_options[3]: 0}
        },
        {
            "id": "mmse_registration", "test_name": "MMSE", "type": "memorize", 
            "title": "Registration (Immediate Memory) 🧠", 
            "prompt": "Please read and remember these three words. You will be asked to recall them later.", 
            "data": words_to_remember,
            "score_mapping": {"I have memorized them": 3} # 3 points for acknowledging
        },
        {
            "id": "mmse_attention", "test_name": "MMSE", "type": "multiple_choice", 
            "title": "Attention & Calculation 🔢", 
            "prompt": f"Starting from {start_num}, subtract {step_num} sequentially. Which sequence is correct?", 
            "options": [math_correct, math_wrong1, math_wrong2, math_wrong3],
            "score_mapping": {math_correct: 5, math_wrong1: 0, math_wrong2: 0, math_wrong3: 0}
        },
        {
            "id": "mmse_recall", "test_name": "MMSE", "type": "multiple_choice", 
            "title": "Recall (Short-term Memory) 🧠", 
            "prompt": "Which of these were the three words you were asked to remember earlier?", 
            "options": [", ".join(words_to_remember), ", ".join(wrong_sets[0]), ", ".join(wrong_sets[1]), ", ".join(wrong_sets[2])],
            "score_mapping": {", ".join(words_to_remember): 3, ", ".join(wrong_sets[0]): 0, ", ".join(wrong_sets[1]): 0, ", ".join(wrong_sets[2]): 0}
        },
        {
            "id": "mmse_language", "test_name": "MMSE", "type": "multiple_choice", 
            "title": "Language 🗣️", 
            "prompt": "Which group of objects corresponds to items typically found in a kitchen?", 
            "options": ["Pot, Pan, Plate", "Car, Bike, Bus", "Dog, Cat, Bird", "Tree, Flower, Grass"],
            "score_mapping": {"Pot, Pan, Plate": 8, "Car, Bike, Bus": 0, "Dog, Cat, Bird": 0, "Tree, Flower, Grass": 0}
        },
        {
            "id": "mmse_visuospatial", "test_name": "MMSE", "type": "multiple_choice", 
            "title": "Visuospatial Ability (Copying) 📐", 
            "prompt": "Imagine drawing two intersecting pentagons. How many total angles are inside a single pentagon?", 
            "options": ["5", "4", "6", "8"],
            "score_mapping": {"5": 1, "4": 0, "6": 0, "8": 0}
        },
        
        # ==========================================
        # CDR-SB (Total: 18 Points) - Higher is Worse
        # ==========================================
        {
            "id": "cdrsb_memory", "test_name": "CDRSB", "type": "multiple_choice", "title": "Memory", 
            "prompt": "How well do you remember recent events?", 
            "options": ["No memory loss", "Slight memory loss", "Moderate memory loss", "Severe memory loss"],
            "score_mapping": {"No memory loss": 0.0, "Slight memory loss": 1.0, "Moderate memory loss": 2.0, "Severe memory loss": 3.0}
        },
        {
            "id": "cdrsb_orientation", "test_name": "CDRSB", "type": "multiple_choice", "title": "Orientation", 
            "prompt": "Do you often feel confused about where you are or what day it is?", 
            "options": ["Never", "Rarely (Slightly)", "Often (Moderately)", "Always (Severely)"],
            "score_mapping": {"Never": 0.0, "Rarely (Slightly)": 1.0, "Often (Moderately)": 2.0, "Always (Severely)": 3.0}
        },
        {
            "id": "cdrsb_judgment", "test_name": "CDRSB", "type": "multiple_choice", "title": "Judgment & Problem Solving", 
            "prompt": "Are you able to handle everyday problems and emergencies?", 
            "options": ["Fully capable", "Slight difficulty", "Needs some help", "Unable to handle"],
            "score_mapping": {"Fully capable": 0.0, "Slight difficulty": 1.0, "Needs some help": 2.0, "Unable to handle": 3.0}
        },
        {
            "id": "cdrsb_community", "test_name": "CDRSB", "type": "multiple_choice", "title": "Community Affairs", 
            "prompt": "Are you actively participating in social or community activities?", 
            "options": ["Fully active", "Slightly reduced", "Rarely participates", "Does not participate"],
            "score_mapping": {"Fully active": 0.0, "Slightly reduced": 1.0, "Rarely participates": 2.0, "Does not participate": 3.0}
        },
        {
            "id": "cdrsb_home", "test_name": "CDRSB", "type": "multiple_choice", "title": "Home & Hobbies", 
            "prompt": "Are you keeping up with your chores at home and your hobbies?", 
            "options": ["Fully capable", "Slightly impaired", "Requires assistance", "Cannot do chores"],
            "score_mapping": {"Fully capable": 0.0, "Slightly impaired": 1.0, "Requires assistance": 2.0, "Cannot do chores": 3.0}
        },
        {
            "id": "cdrsb_personal", "test_name": "CDRSB", "type": "multiple_choice", "title": "Personal Care", 
            "prompt": "Are you fully independent in dressing and washing yourself?", 
            "options": ["Fully independent", "Needs prompting", "Requires assistance", "Fully dependent"],
            "score_mapping": {"Fully independent": 0.0, "Needs prompting": 1.0, "Requires assistance": 2.0, "Fully dependent": 3.0}
        },

        # ==========================================
        # TOTAL13 (Total: 85 Points) - Higher is Worse
        # ==========================================
        {
            "id": "t13_word_recall", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Word Recall", 
            "prompt": "Which group contains the words you memorized earlier?", 
            "options": [", ".join(words_to_remember), ", ".join(wrong_sets[0]), ", ".join(wrong_sets[1])],
            "score_mapping": {", ".join(words_to_remember): 0, ", ".join(wrong_sets[0]): 5, ", ".join(wrong_sets[1]): 10}
        },
        {
            "id": "t13_naming", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Naming Objects & Fingers", 
            "prompt": "Identify this object: ✏️", 
            "options": ["Pencil", "Pen", "Eraser"],
            "score_mapping": {"Pencil": 0, "Pen": 2, "Eraser": 5}
        },
        {
            "id": "t13_commands", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Following Commands", 
            "prompt": "Read the following command: 'Tap the screen twice'. What should you do?", 
            "options": ["Tap screen twice", "Tap screen once", "Do nothing"],
            "score_mapping": {"Tap screen twice": 0, "Tap screen once": 2, "Do nothing": 5}
        },
        {
            "id": "t13_praxis", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Constructional Praxis (Drawing)", 
            "prompt": "Which describes a correctly drawn clock showing 3:00?", 
            "options": ["12 at top, hands on 12 and 3", "12 at top, hands on 3 and 6", "Missing numbers"],
            "score_mapping": {"12 at top, hands on 12 and 3": 0, "12 at top, hands on 3 and 6": 2, "Missing numbers": 5}
        },
        {
            "id": "t13_ideational", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Ideational Praxis (Task Execution)", 
            "prompt": "How do you correctly mail a letter?", 
            "options": ["Put letter in envelope, seal, stamp, mail", "Stamp letter, mail", "Mail envelope empty"],
            "score_mapping": {"Put letter in envelope, seal, stamp, mail": 0, "Stamp letter, mail": 2, "Mail envelope empty": 5}
        },
        {
            "id": "t13_orientation", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Orientation", 
            "prompt": "What is the current location?", 
            "options": ["Clinic/Home", "Outer Space", "Underwater"],
            "score_mapping": {"Clinic/Home": 0, "Outer Space": 4, "Underwater": 8}
        },
        {
            "id": "t13_word_recog", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Word Recognition", 
            "prompt": "Was the word 'Apple 🍎' on your original memory list?", 
            "options": ["Yes", "No", "Not sure"],
            "score_mapping": {"Yes": 0, "No": 12, "Not sure": 6} if any("APPLE" in w for w in words_to_remember) else {"Yes": 12, "No": 0, "Not sure": 6}
        },
        {
            "id": "t13_instructions", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Remembering Test Instructions", 
            "prompt": "Do you remember the instructions for this test?", 
            "options": ["Yes clearly", "Vaguely", "No"],
            "score_mapping": {"Yes clearly": 0, "Vaguely": 2, "No": 5}
        },
        {
            "id": "t13_spoken", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Spoken Language Ability", 
            "prompt": "Can you express yourself clearly without struggling for words?", 
            "options": ["Yes always", "Sometimes", "Rarely"],
            "score_mapping": {"Yes always": 0, "Sometimes": 2, "Rarely": 5}
        },
        {
            "id": "t13_finding", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Word Finding Difficulty", 
            "prompt": "Do you frequently forget names of common objects?", 
            "options": ["Never", "Occasionally", "Frequently"],
            "score_mapping": {"Never": 0, "Occasionally": 2, "Frequently": 5}
        },
        {
            "id": "t13_comprehension", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Comprehension", 
            "prompt": "Do you understand complex sentences easily?", 
            "options": ["Yes", "Sometimes", "No"],
            "score_mapping": {"Yes": 0, "Sometimes": 2, "No": 5}
        },
        {
            "id": "t13_delayed", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Delayed Word Recall", 
            "prompt": "One last time, which set of words did you memorize at the beginning?", 
            "options": [", ".join(words_to_remember), ", ".join(wrong_sets[0]), ", ".join(wrong_sets[1])],
            "score_mapping": {", ".join(words_to_remember): 0, ", ".join(wrong_sets[0]): 5, ", ".join(wrong_sets[1]): 10}
        },
        {
            "id": "t13_cancellation", "test_name": "TOTAL13", "type": "multiple_choice", "title": "Number Cancellation / Attention", 
            "prompt": "If you cross out all 7s in '7-3-7-4-7', how many 7s did you cross out?", 
            "options": ["3", "2", "4"],
            "score_mapping": {"3": 0, "2": 2, "4": 5}
        },

        # ==========================================
        # Speech
        # ==========================================
        {"id": "speech_task", "test_name": "Speech Assessment", "type": "speech", "title": "Speech & Picture Description", "prompt": random.choice(question_templates.SPEECH_PROMPTS), "image_url": "/cookie-theft.jpg"}
    ]
    
    # Shuffle options for multiple choice so correct isn't always first
    for step in test_flow:
        if step["type"] == "multiple_choice":
            random.shuffle(step["options"])
    
    session = {
        "session_id": session_id,
        "timestamp": datetime.datetime.now().isoformat(),
        "test_flow_seed": seed,
        "test_flow": test_flow,
        "speech_input": None,
        "cognitive_answers": None,
        "scores": None
    }
    
    db.add_session(session_data.user_id, session)
    
    return {"session_id": session_id, "test_flow": test_flow}

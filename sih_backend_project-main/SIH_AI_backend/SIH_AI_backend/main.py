from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langdetect import detect, DetectorFactory
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

from services.problem_analyzer import analyze_problem
import os
from datetime import datetime, timezone
from pathlib import Path

from pymongo import MongoClient
from pymongo.errors import ConfigurationError, ServerSelectionTimeoutError
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

DetectorFactory.seed = 0

app = FastAPI(
    title="SIH AI Backend",
    description="Multilingual Citizen Problem Analysis System",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProblemRequest(BaseModel):
    text: str


MODEL_NAME = "facebook/nllb-200-distilled-600M"

print("Loading multilingual AI model...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
translation_model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
print("Multilingual AI model loaded!")

LANGUAGE_CODES = {
    "en": "eng_Latn", "hi": "hin_Deva", "or": "ory_Orya", "bn": "ben_Beng",
    "ur": "urd_Arab", "ta": "tam_Taml", "te": "tel_Telu", "kn": "kan_Knda",
    "ml": "mal_Mlym", "gu": "guj_Gujr", "mr": "mar_Deva", "pa": "pan_Guru",
    "ne": "npi_Deva", "as": "asm_Beng", "sa": "san_Deva"
}

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "or": "Odia", "bn": "Bengali",
    "ur": "Urdu", "ta": "Tamil", "te": "Telugu", "kn": "Kannada",
    "ml": "Malayalam", "gu": "Gujarati", "mr": "Marathi", "pa": "Punjabi",
    "ne": "Nepali", "as": "Assamese", "sa": "Sanskrit"
}

# ---------------------------------------------------------
# MONGODB — connect ONCE at startup, not per-request
# ---------------------------------------------------------

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set in .env")

mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
mongo_available = False

try:
    mongo_client.admin.command("ping")
    mongo_available = True
    print("MongoDB connected!")
except (ConfigurationError, ServerSelectionTimeoutError) as e:
    print("MongoDB connection unavailable; continuing without database persistence:", e)

db = mongo_client["sih_project"]
problems_collection = db["problems"]


def translate_to_english(text: str, language_code: str) -> str:
    if language_code == "en":
        return text

    source_language = LANGUAGE_CODES.get(language_code)
    if not source_language:
        return text

    try:
        tokenizer.src_lang = source_language
        inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        forced_bos_token_id = tokenizer.convert_tokens_to_ids("eng_Latn")
        translated_tokens = translation_model.generate(
            **inputs, forced_bos_token_id=forced_bos_token_id, max_length=512
        )
        return tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)[0]
    except Exception as e:
        print("Translation error:", e)
        return text


@app.get("/")
def home():
    return {"message": "SIH AI Backend is running 🚀"}


@app.post("/analyze-problem")
def analyze(request: ProblemRequest):
    text = request.text.strip()

    if not text:
        return {"error": "Problem description cannot be empty."}

    try:
        language_code = detect(text)
    except Exception:
        language_code = "unknown"

    language = LANGUAGE_NAMES.get(language_code, "Other")

    translated_text = translate_to_english(text, language_code)

    result = analyze_problem(translated_text, language)

    result["original_text"] = text
    result["translated_text"] = translated_text
    result["language_code"] = language_code

    document = {**result, "created_at": datetime.now(timezone.utc)}

    try:
        if not mongo_available:
            raise RuntimeError("MongoDB is unavailable")
        insert_result = problems_collection.insert_one(document)
        result["problem_id"] = str(insert_result.inserted_id)
    except Exception as e:
        print("MongoDB insert error:", e)
        result["problem_id"] = None
        result["db_error"] = str(e)

    return result
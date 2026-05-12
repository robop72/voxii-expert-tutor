import sqlite3
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

# Load the database
vector_db = Chroma(
    persist_directory="./vcaa_json_index", 
    embedding_function=OpenAIEmbeddings()
)

# Get all unique subjects and year levels in the index
all_metadata = vector_db.get()['metadatas']
unique_subjects = set(m.get('subject') for m in all_metadata)
unique_years = set(m.get('year_level') for m in all_metadata)

print("--- DATABASE HEALTH CHECK ---")
print(f"Total documents: {len(all_metadata)}")
print(f"Subjects found: {unique_subjects}")
print(f"Year Levels found: {unique_years}")
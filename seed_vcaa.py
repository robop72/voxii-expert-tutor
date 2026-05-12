import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, UnstructuredPowerPointLoader
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. Setup paths
data_dir = Path(r"C:\Users\robop\OneDrive\Documents\Voxii_Tutor\Yr9_Maths")

# Find all relevant files
extensions = ['*.pdf', '*.docx', '*.doc', '*.pptx']
files = []
for ext in extensions:
    files.extend(list(data_dir.glob(ext)))

if not files:
    print(f"❌ No curriculum files found in {data_dir}. Check the path!")
    exit()

print(f"Found {len(files)} files. Starting ingestion...")

# 2. Extract and Chunk
all_docs = []
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)

for file_path in files:
    print(f"Processing: {file_path.name}")
    try:
        if file_path.suffix == '.pdf':
            loader = PyPDFLoader(str(file_path))
        elif file_path.suffix in ['.docx', '.doc']:
            loader = Docx2txtLoader(str(file_path))
        elif file_path.suffix == '.pptx':
            loader = UnstructuredPowerPointLoader(str(file_path))
        
        docs = loader.load()
        
        # Add metadata
        for doc in docs:
            doc.metadata["subject"] = "Mathematics"
            doc.metadata["year_level"] = "9"
            doc.metadata["source"] = file_path.name
            
        chunks = text_splitter.split_documents(docs)
        all_docs.extend(chunks)
    except Exception as e:
        print(f"⚠️ Could not read {file_path.name}: {e}")

# 3. Create the Vector Database
print(f"Creating 'Brain' from {len(all_docs)} text chunks...")
vector_db = Chroma.from_documents(
    documents=all_docs,
    embedding=OpenAIEmbeddings(),
    persist_directory="./vcaa_math_index"
)

print("✅ Seeding Complete! Your Year 9 Maths RAG now includes Word and PPT content.")
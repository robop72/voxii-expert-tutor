__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.chat_message_histories import ChatMessageHistory

# 1. Initialize FastAPI
app = FastAPI(title="Voxii Year 9 Maths API")

# 2. Initialize the Brain (RAG)
# Using the relative path './' ensures it finds the folder in the cloud container
vector_db = Chroma(
    persist_directory="./vcaa_math_index", 
    embedding_function=OpenAIEmbeddings()
)
retriever = vector_db.as_retriever(search_kwargs={"k": 3})
llm = ChatOpenAI(model_name="gpt-4o", temperature=0.3)

# 3. Memory Store (In-memory for MVP)
history_store = {}

def get_session_history(session_id: str):
    if session_id not in history_store:
        history_store[session_id] = ChatMessageHistory()
    return history_store[session_id]

# 4. Define the Request Structure
class ChatRequest(BaseModel):
    session_id: str
    message: str

# 5. The API Endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    history = get_session_history(request.session_id)
    
    template = """You are a VCAA Year 9 Maths Tutor. 
    Your goal is to guide students using the Socratic method—ask guiding questions rather than giving answers.
    Use the following context from the VCAA curriculum to inform your teaching.
    
    Context: {context}"""
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", template),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}")
    ])

    chain = (
        {"context": retriever, "question": RunnablePassthrough(), "history": lambda x: history.messages}
        | prompt 
        | llm 
        | StrOutputParser()
    )

    try:
        response = chain.invoke(request.message)
        history.add_user_message(request.message)
        history.add_ai_message(response)
        return {"response": response}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Root health check
@app.get("/")
async def root():
    return {"status": "Voxii Tutor is Online"}
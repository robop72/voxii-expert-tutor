import os
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.chat_message_histories import ChatMessageHistory

# 1. Load the "Brain"
if not os.path.exists("./vcaa_math_index"):
    print("❌ Error: 'vcaa_math_index' folder not found. Run your seeding script first!")
    exit()

vector_db = Chroma(
    persist_directory="./vcaa_math_index", 
    embedding_function=OpenAIEmbeddings()
)
retriever = vector_db.as_retriever(search_kwargs={"k": 3})

# 2. Setup the AI and a Memory Buffer
llm = ChatOpenAI(model_name="gpt-4o", temperature=0.3)
demo_ephemeral_chat_history = ChatMessageHistory()

# 3. Enhanced Prompt with "History" placeholder
template = """You are a VCAA Year 9 Maths Tutor specializing in Version 2.0 of the Victorian Curriculum. 
Guide the student Socratically. Use the curriculum context and the conversation history to help.

RULES:
1. Reference previous parts of the chat if the student provides more info.
2. Never give the full answer immediately.
3. Use Level 9 VCAA terminology.

Context from VCAA Documents:
{context}
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", template),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{question}")
])

# 4. The Chain (Now including history)
def get_history(_):
    return demo_ephemeral_chat_history.messages

chain = (
    {
        "context": retriever,
        "question": RunnablePassthrough(),
        "history": get_history
    }
    | prompt
    | llm
    | StrOutputParser()
)

# 5. EXECUTION: Interactive Chat with Memory
print("\n" + "="*50)
print("VCAA YEAR 9 MATHS TUTOR - SESSION WITH MEMORY")
print("Type 'exit' to end the session.")
print("="*50 + "\n")

while True:
    user_input = input("Student: ")
    if user_input.lower() in ["exit", "quit", "stop"]:
        print("\nTutor: Keep practicing! Goodbye.")
        break
    
    if not user_input.strip():
        continue

    try:
        # Generate the response
        response = chain.invoke(user_input)
        
        # SAVE both sides to memory so the AI remembers the flow
        demo_ephemeral_chat_history.add_user_message(user_input)
        demo_ephemeral_chat_history.add_ai_message(response)
        
        print(f"\nTutor: {response}")
        print("\n" + "-"*30 + "\n")
    except Exception as e:
        print(f"\n❌ Error: {e}")
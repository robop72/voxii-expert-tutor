import json
import os
from langchain_openai import ChatOpenAI

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

def enrich_curriculum_point(text):
    """Turns a dry curriculum point into a master-tutor guide."""
    prompt = f"""
    Act as a Master Pedagogy Expert for the Victorian Curriculum (VCAA). 
    Take this curriculum requirement and expand it into a 'Master Tutor Guide':
    1. EXPLANATION: A student-friendly explanation.
    2. ANALOGY: A real-world analogy to make it 'click'.
    3. COMMON PITFALLS: What do students usually get wrong?
    4. GROWTH QUESTIONS: 3 Socratic questions to lead them to mastery.

    Curriculum Point: {text}
    """
    try:
        response = llm.invoke(prompt)
        return response.content
    except:
        return text # Fallback to original text if API fails

def process_all_jsons(folder_path="raw_vcaa_data"):
    expanded_data = []
    # Loop through your scraped JSON files
    for filename in os.listdir(folder_path):
        if filename.endswith(".json"):
            with open(f"{folder_path}/{{filename}}", 'r') as f:
                items = json.load(f)
                for item in items:
                    print(f"Enriching: {{item['text'][:50]}}...")
                    # The "Expert" content is the original text + the LLM expansion
                    item['text'] = f"ORIGINAL: {{item['text']}}\n\nEXPERT GUIDE:\n{{enrich_curriculum_point(item['text'])}}"
                    expanded_data.append(item)
    
    # Save the new 'Master' JSON
    with open("master_expert_curriculum.json", "w") as f:
        json.dump(expanded_data, f)

if __name__ == "__main__":
    process_all_jsons()
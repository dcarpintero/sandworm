import streamlit as st
import sandworm


st.set_page_config(
    page_title="SandWorm: Your Farming Companion for Regenerative Agriculture",
    layout="wide",
    page_icon="🧑‍🌾",
    initial_sidebar_state="expanded",
    menu_items={"About": "Built by @dcarpintero"},
)

st.title("🧑‍🌾 Helping Farmers around The World!")

def query_llm(prompt):
    st.session_state.messages.append({"role": "user", "content": prompt})
    st.chat_message("user").write(prompt)
    response = sandworm.generate_season_plan(prompt)
    st.session_state.messages.append({"role": "assistant", "content": response})
    st.chat_message("assistant").write(response)


if "messages" not in st.session_state:                                                  
    st.session_state["messages"] = [{"role": "assistant", 
                                     "content": """Hi there! It's SandWorm, an AI farming assistant. I will create a personal farming plan for your family needs!"""}]
    st.session_state.messages.append({"role": "assistant", 
                                      "content": """Just tell me where is your land located, how many family members you have, and your planned monthly income from exceeds."""})

for msg in st.session_state.messages:
    # skip system messages
    if msg["role"] != "system":
        st.chat_message(msg["role"]).write(msg["content"])

if prompt := st.chat_input():
    query_llm(prompt)
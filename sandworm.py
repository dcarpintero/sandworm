import logging
from dotenv import load_dotenv
from typing import Optional, Dict
import requests

from langchain import hub
from langchain.tools import Tool
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor

def get_climate(city_country: str) -> Optional[Dict]:
    """
    Retrieves weather data for a given city and country.
    """
    base_url = 'https://run.mocky.io/v3/287b057c-f9f8-403e-97bb-0eba9265a8d1'
    params = {'q': f'{city_country}'}

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise an HTTPError for bad responses
        return response.json()
    except requests.exceptions.RequestException as ex:
        logging.error(f'Error occurred while retrieving climate data for {city_country}: {str(ex)}')
        return None
    
def get_soil_type(city_country: str) -> str:
    """
    Retrieves soil type for a given city and country.
    """
    base_url = 'https://run.mocky.io/v3/fae4986f-d67f-4e1a-bede-835871ec0850'
    params = {'q': f'{city_country}'}

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise an HTTPError for bad responses
        return response.json()['soil']
    except requests.exceptions.RequestException as ex:
        logging.error(f'Error occurred while retrieving soil type data for {city_country}: {str(ex)}')
        return None
    
def get_market_prices(crop: str) -> str:
    """
    Retrieves market prices for a given crop.
    """
    base_url = 'https://run.mocky.io/v3/3f8a24fa-dcce-46f8-8017-8aadd8728057'
    params = {'q': f'{crop}'}

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise an HTTPError for bad responses
        return response.json()
    except requests.exceptions.RequestException as ex:
        logging.error(f'Error occurred while retrieving market prices for {crop}: {str(ex)}')
        return None
    
def get_tools() -> list:
    return [
        Tool(
            name="ClimateData",
            func=get_climate,
            description="Useful for getting the climate in a specific city and country."
        ),
        Tool(
            name="SoilType",
            func=get_soil_type,
            description="Useful for getting the soil type for a specific city and country."
        ),
        Tool(
            name="MarketPrices",
            func=get_market_prices,
            description="Useful for getting current crop market prices for a specific city and country."
        )
    ]

def get_tool_names() -> list:
    return ["ClimateData", "SoilType", "MarketPrices"]

def generate_season_plan(usr_context: str) -> str:
    load_dotenv()
    
    model = ChatOpenAI(model="gpt-4o")
    tools = get_tools()
    tool_names = get_tool_names()
    prompt = hub.pull("dcarpintero/sandworm-react")

    agent = create_tool_calling_agent(model, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools)

    response = agent_executor.invoke({"input": usr_context,
                                      "tools": tools,
                                      "tool_names": tool_names})
    
    logging.info(f"Context: {usr_context}")
    logging.info(f"Response from the agent: {response}")

    return response['output']
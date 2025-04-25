import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class GroqClient:
    def __init__(self):
        self.api_key = os.environ.get('GROQ_API_KEY')
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.3-70b-versatile"

    def get_response(self, messages):
        """Get a response from Groq API
        
        Args:
            messages (list): List of message dicts with 'role' and 'content' keys
            
        Returns:
            str: Response from the AI
        """
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=1024,
                temperature=0.5,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Error getting response from Groq: {e}")
            return "Sorry, I'm having trouble connecting right now. Please try again later."
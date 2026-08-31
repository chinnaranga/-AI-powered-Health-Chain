from abc import ABC, abstractmethod

class BaseLLMModel(ABC):
    @abstractmethod
    def generate(self, prompt: str, context: str = "", role: str = "") -> str:
        """
        Generates text response based on prompt, context, and role permission.
        """
        pass

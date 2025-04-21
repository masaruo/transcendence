from abc import ABC, abstractmethod

class PongObj(ABC):
    @abstractmethod
    def get_bounds(self):
        pass

    @abstractmethod
    def to_dict(self):
        pass

    @abstractmethod
    def reset(self):
        pass

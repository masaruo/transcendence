from abc import ABC, abstractmethod

class PongObj(ABC):
    @abstractmethod
    def get_bounds(self) -> tuple[int, int, int, int]:
        pass

    @abstractmethod
    def to_dict(self) -> dict[str, int | str]:
        pass

    @abstractmethod
    def reset(self) -> None:
        pass

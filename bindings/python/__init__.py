"""Vala grammar for tree-sitter"""

from ._binding import language

__version__ = "0.1.0"

__all__ = [
    "language",
    "__version__",
]

def __dir__():
    return sorted(__all__ + [
        "__all__", "__builtins__", "__cached__", "__doc__", "__file__",
        "__loader__", "__name__", "__package__", "__path__", "__spec__",
    ])


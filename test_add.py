"""
Unit tests for the add function in add.py.
"""
import pytest
from add import add

def test_add_positive_integers():
    """
    Test adding two positive integers.
    """
    assert add(2, 3) == 5

def test_add_negative_integers():
    """
    Test adding two negative integers.
    """
    assert add(-2, -3) == -5
    assert add(-100, -100) == -200

def test_add_mixed_integers():
    """
    Test adding a positive and a negative integer.
    """
    assert add(5, -2) == 3

def test_add_floats():
    """
    Test adding two floating-point numbers.
    """
    assert add(1.5, 2.5) == 4.0

def test_add_zero():
    """
    Test adding zero to a number.
    """
    assert add(5, 0) == 5
    assert add(0, -5) == -5
    assert add(0, 0) == 0

def test_add_large_numbers():
    """
    Test adding very large numbers.
    """
    assert add(1e10, 1e10) == 2e10

@pytest.mark.parametrize("x, y, expected", [
    (1, 1, 2),
    (0, 0, 0),
    (-1, 1, 0),
    (2.5, 3.5, 6.0),
    (100, 200, 300),
])
def test_add_parametrized(x, y, expected):
    """
    Parametrized tests for different number combinations.
    """
    assert add(x, y) == expected

def test_add_type_error():
    """
    Test adding non-number types (should raise TypeError).
    """
    with pytest.raises(TypeError):
        add("1", 2)
    with pytest.raises(TypeError):
        add(1, "2")

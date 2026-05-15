"""
SymPy-backed tools for 100% accurate maths computation.
Used by the Mathematics agent to verify calculations before explaining them.
"""

import sympy
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
)
from sympy import symbols, solve, simplify, factor, expand, diff, integrate
from langchain_core.tools import tool

_TRANSFORMS = standard_transformations + (implicit_multiplication_application,)


def _parse(s: str):
    return parse_expr(s.strip(), transformations=_TRANSFORMS)


@tool
def solve_equation(equation: str, variable: str = "x") -> str:
    """Solve an algebraic equation exactly. Use for any 'solve for x' or 'find the value' problem.
    Write the equation using * for multiplication (e.g. '2*x + 3 = 7').
    For quadratics or polynomials, all solutions are returned."""
    try:
        var = symbols(variable)
        if "=" in equation:
            lhs, rhs = equation.split("=", 1)
            expr = _parse(lhs) - _parse(rhs)
        else:
            expr = _parse(equation)
        solutions = solve(expr, var)
        if not solutions:
            return "No real solutions."
        return f"Exact solution(s): {variable} = {', '.join(str(s) for s in solutions)}"
    except Exception as exc:
        return f"SymPy could not solve this: {exc}"


@tool
def simplify_or_expand(expression: str, mode: str = "simplify") -> str:
    """Simplify or expand an algebraic expression exactly.
    mode: 'simplify' (default) or 'expand'
    Examples: expression='(x+2)**2' mode='expand' → x**2 + 4*x + 4"""
    try:
        expr = _parse(expression)
        result = expand(expr) if mode == "expand" else simplify(expr)
        return f"Result: {result}"
    except Exception as exc:
        return f"SymPy could not process this: {exc}"


@tool
def factor_polynomial(expression: str) -> str:
    """Factor a polynomial expression exactly.
    Example: 'x**2 - 5*x + 6' → (x - 2)*(x - 3)"""
    try:
        result = factor(_parse(expression))
        return f"Factored form: {result}"
    except Exception as exc:
        return f"SymPy could not factor this: {exc}"


@tool
def calculate(expression: str) -> str:
    """Evaluate a numerical expression exactly — handles fractions, surds, powers, square roots.
    Examples: 'sqrt(144)', '3/7 + 2/5', '2**10', 'sqrt(2) * sqrt(8)'"""
    try:
        result = sympy.nsimplify(_parse(expression))
        if result.is_number:
            decimal = float(result)
            if result == int(decimal):
                return f"= {int(decimal)}"
            return f"Exact: {result}  ≈  {decimal:.6g}"
        return f"= {result}"
    except Exception as exc:
        return f"SymPy could not calculate this: {exc}"


@tool
def differentiate(expression: str, variable: str = "x") -> str:
    """Find the derivative of an expression with respect to a variable.
    Example: expression='x**3 + 2*x', variable='x' → 3*x**2 + 2"""
    try:
        result = diff(_parse(expression), symbols(variable))
        return f"d/d{variable}({expression}) = {result}"
    except Exception as exc:
        return f"SymPy could not differentiate this: {exc}"


@tool
def integrate_expression(expression: str, variable: str = "x") -> str:
    """Find the indefinite integral of an expression.
    Example: expression='3*x**2', variable='x' → x**3"""
    try:
        result = integrate(_parse(expression), symbols(variable))
        return f"∫({expression}) d{variable} = {result} + C"
    except Exception as exc:
        return f"SymPy could not integrate this: {exc}"


MATH_TOOLS = [
    solve_equation,
    simplify_or_expand,
    factor_polynomial,
    calculate,
    differentiate,
    integrate_expression,
]

"""
SymPy-backed tools for 100% accurate maths computation.
Exposes plain Python functions + OpenAI tool schemas for direct function calling.
"""

import json
import sympy
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
)
from sympy import symbols, solve, simplify, factor, expand, diff, integrate

_TRANSFORMS = standard_transformations + (implicit_multiplication_application,)


def _parse(s: str):
    return parse_expr(s.strip(), transformations=_TRANSFORMS)


def solve_equation(equation: str, variable: str = "x") -> str:
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
        return f"SymPy error: {exc}"


def simplify_or_expand(expression: str, mode: str = "simplify") -> str:
    try:
        expr = _parse(expression)
        result = expand(expr) if mode == "expand" else simplify(expr)
        return f"Result: {result}"
    except Exception as exc:
        return f"SymPy error: {exc}"


def factor_polynomial(expression: str) -> str:
    try:
        result = factor(_parse(expression))
        return f"Factored form: {result}"
    except Exception as exc:
        return f"SymPy error: {exc}"


def calculate(expression: str) -> str:
    try:
        result = sympy.nsimplify(_parse(expression))
        if result.is_number:
            decimal = float(result)
            if result == int(decimal):
                return f"= {int(decimal)}"
            return f"Exact: {result}  ≈  {decimal:.6g}"
        return f"= {result}"
    except Exception as exc:
        return f"SymPy error: {exc}"


def differentiate(expression: str, variable: str = "x") -> str:
    try:
        result = diff(_parse(expression), symbols(variable))
        return f"d/d{variable}({expression}) = {result}"
    except Exception as exc:
        return f"SymPy error: {exc}"


def integrate_expression(expression: str, variable: str = "x") -> str:
    try:
        result = integrate(_parse(expression), symbols(variable))
        return f"∫({expression}) d{variable} = {result} + C"
    except Exception as exc:
        return f"SymPy error: {exc}"


def call_tool(name: str, args: dict) -> str:
    """Dispatch a tool call by name."""
    dispatch = {
        "solve_equation":      lambda: solve_equation(args["equation"], args.get("variable", "x")),
        "simplify_or_expand":  lambda: simplify_or_expand(args["expression"], args.get("mode", "simplify")),
        "factor_polynomial":   lambda: factor_polynomial(args["expression"]),
        "calculate":           lambda: calculate(args["expression"]),
        "differentiate":       lambda: differentiate(args["expression"], args.get("variable", "x")),
        "integrate_expression": lambda: integrate_expression(args["expression"], args.get("variable", "x")),
    }
    fn = dispatch.get(name)
    return fn() if fn else f"Unknown tool: {name}"


# OpenAI function schemas
OPENAI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "solve_equation",
            "description": "Solve an algebraic equation exactly. Use for any equation or 'solve for x' problem.",
            "parameters": {
                "type": "object",
                "properties": {
                    "equation": {"type": "string", "description": "Equation string e.g. '3*x - 7 = 14'"},
                    "variable": {"type": "string", "description": "Variable to solve for (default 'x')"},
                },
                "required": ["equation"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "simplify_or_expand",
            "description": "Simplify or expand an algebraic expression exactly.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "Expression e.g. '(x+2)**2'"},
                    "mode": {"type": "string", "enum": ["simplify", "expand"], "description": "simplify or expand"},
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "factor_polynomial",
            "description": "Factor a polynomial expression exactly.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "Polynomial e.g. 'x**2 - 5*x + 6'"},
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "Evaluate a numerical expression exactly — fractions, surds, powers, roots.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "Expression e.g. 'sqrt(144)' or '3/7 + 2/5'"},
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "differentiate",
            "description": "Find the derivative of an expression.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "Expression e.g. 'x**3 + 2*x'"},
                    "variable": {"type": "string", "description": "Variable (default 'x')"},
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "integrate_expression",
            "description": "Find the indefinite integral of an expression.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {"type": "string", "description": "Expression e.g. '3*x**2'"},
                    "variable": {"type": "string", "description": "Variable (default 'x')"},
                },
                "required": ["expression"],
            },
        },
    },
]

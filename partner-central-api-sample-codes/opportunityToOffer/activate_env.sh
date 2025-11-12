#!/bin/bash
# Activate the .venv virtual environment
# Usage: source activate_env.sh

if [ -d ".venv" ]; then
    echo "Activating .venv virtual environment..."
    source .venv/bin/activate
    echo "✓ Virtual environment activated"
    echo "Python version: $(python --version)"
    echo "Pip version: $(pip --version)"
else
    echo "Error: .venv directory not found"
    echo "Please create a virtual environment first:"
    echo "  python3 -m venv .venv"
    echo "  source .venv/bin/activate"
    echo "  pip install -r requirements.txt"
fi
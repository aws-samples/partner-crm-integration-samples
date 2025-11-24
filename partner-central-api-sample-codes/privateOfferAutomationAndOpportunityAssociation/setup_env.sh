#!/bin/bash
# Setup script to create and configure the virtual environment

echo "=== Setting up Python Environment ==="

# Check if .venv exists
if [ ! -d ".venv" ]; then
    echo "Creating .venv virtual environment..."
    python3 -m venv .venv
else
    echo "✓ .venv virtual environment already exists"
fi

# Activate the environment
echo "Activating virtual environment..."
source .venv/bin/activate

# Install/upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements
if [ -f "requirements.txt" ]; then
    echo "Installing requirements from requirements.txt..."
    pip install -r requirements.txt
else
    echo "Installing boto3 directly..."
    pip install boto3
fi

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "To activate the environment in the future, run:"
echo "  source .venv/bin/activate"
echo ""
echo "Or use the activation script:"
echo "  source activate_env.sh"
echo ""
echo "To run scripts directly:"
echo "  .venv/bin/python 1_publishSaasProcuct/describe_product.py"
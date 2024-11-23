#!/bin/bash

# Upgrade pip
python -m pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Print installed packages for debugging
pip freeze

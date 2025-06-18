#!/bin/bash

# Copy prompt text files maintaining directory structure
find src/server/prompts -name "*.txt" | while read -r file; do
    # Get the relative path from src/server/prompts
    rel_path="${file#src/server/prompts/}"
    # Create the target directory
    target_dir="dist/server/prompts/$(dirname "$rel_path")"
    mkdir -p "$target_dir"
    # Copy the file
    cp "$file" "$target_dir/"
done
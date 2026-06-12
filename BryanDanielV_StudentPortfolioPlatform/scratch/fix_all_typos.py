import os
import re

replacements = {
    r'\bslate-805\b': 'slate-800',
    r'\bslate-880\b': 'slate-800',
    r'\bslate-205\b': 'slate-200',
    r'\bslate-505\b': 'slate-500',
    r'\bslate-550\b': 'slate-500',
    r'\bslate-655\b': 'slate-600',
    r'\bslate-705\b': 'slate-700',
    r'\bslate-355\b': 'slate-300',
    r'\bred-605\b': 'red-600',
    r'\bred-955\b': 'red-900',
    r'\bgreen-655\b': 'green-600',
    r'\bamber-955\b': 'amber-900',
    r'\bblue-955\b': 'blue-900',
    r'\bamber-808\b': 'amber-800'
}

frontend_dir = r"c:\internship\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            process_file(os.path.join(root, file))

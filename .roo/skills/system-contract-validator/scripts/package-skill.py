#!/usr/bin/env python3

import json
import os
import shutil
import zipfile
from pathlib import Path

def package_skill(skill_path):
    """Package the skill into a .skill file for distribution."""
    
    skill_name = Path(skill_path).name
    output_file = f"{skill_name}.skill"
    
    # Create ZIP file
    with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add SKILL.md
        zipf.write(os.path.join(skill_path, 'SKILL.md'), 'SKILL.md')
        
        # Add scripts directory if exists
        scripts_dir = os.path.join(skill_path, 'scripts')
        if os.path.exists(scripts_dir):
            for script_file in os.listdir(scripts_dir):
                zipf.write(os.path.join(scripts_dir, script_file), f'scripts/{script_file}')
        
        # Add evals directory if exists
        evals_dir = os.path.join(skill_path, 'evals')
        if os.path.exists(evals_dir):
            zipf.write(os.path.join(evals_dir, 'evals.json'), 'evals/evals.json')
    
    print(f"✅ Skill packaged: {output_file}")
    print(f"📦 Size: {os.path.getsize(output_file)} bytes")
    print(f"📋 Contents: SKILL.md + scripts/ + evals/")
    
    return output_file

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python package-skill.py <skill-path>")
        sys.exit(1)
    
    skill_path = sys.argv[1]
    
    if not os.path.exists(skill_path):
        print(f"❌ Error: Skill path '{skill_path}' does not exist")
        sys.exit(1)
    
    package_skill(skill_path)

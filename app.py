from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import uuid
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='build', static_url_path='/')
CORS(app)

STORAGE_DIR = os.path.join(os.path.expanduser('~'), '.prompt_storage')
os.makedirs(STORAGE_DIR, exist_ok=True)
logger.info(f"Using storage directory: {STORAGE_DIR}")

def get_prompts_file():
    prompts_file = os.path.join(STORAGE_DIR, 'prompts.json')
    logger.debug(f"Prompts file path: {prompts_file}")
    return prompts_file

def load_prompts():
    try:
        prompts_file = get_prompts_file()
        logger.info(f"Loading prompts from: {prompts_file}")
        with open(prompts_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.warning(f"No existing prompts found or error reading file: {str(e)}")
        return []

def save_prompts(prompts):
    prompts_file = get_prompts_file()
    logger.info(f"Saving {len(prompts)} prompts to: {prompts_file}")
    with open(prompts_file, 'w') as f:
        json.dump(prompts, f, indent=4)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/prompts', methods=['GET'])
def get_prompts():
    prompts = load_prompts()
    return jsonify(prompts)

@app.route('/prompts', methods=['POST'])
def create_prompt():
    try:
        prompt_data = request.get_json()
        prompts = load_prompts()
        
        # Generate unique ID if not provided
        prompt_data['id'] = str(uuid.uuid4())
        prompt_data['created_at'] = datetime.now().isoformat()
        
        # Ensure tags is a list
        if 'tags' not in prompt_data:
            prompt_data['tags'] = []
        elif isinstance(prompt_data['tags'], str):
            prompt_data['tags'] = [tag.strip() for tag in prompt_data['tags'].split(',') if tag.strip()]
        
        prompts.append(prompt_data)
        save_prompts(prompts)
        return jsonify(prompt_data), 201
    except Exception as e:
        logger.error(f"Error creating prompt: {str(e)}")
        return jsonify({"error": str(e)}), 400

@app.route('/prompts/<prompt_id>', methods=['DELETE'])
def delete_prompt(prompt_id):
    prompts = load_prompts()
    prompts = [p for p in prompts if p['id'] != prompt_id]
    save_prompts(prompts)
    return '', 204

@app.route('/prompts/search', methods=['GET'])
def search_prompts():
    query = request.args.get('q', '').lower()
    prompts = load_prompts()
    
    if not query:
        return jsonify(prompts)
        
    filtered_prompts = [
        p for p in prompts 
        if query in p.get('title', '').lower() or 
           query in p.get('content', '').lower() or 
           any(query in tag.lower() for tag in p.get('tags', []))
    ]
    
    return jsonify(filtered_prompts)

if __name__ == '__main__':
    app.run(debug=True)

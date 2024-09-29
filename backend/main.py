import os
import logging
import json
import time
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy 
from flask_cors import CORS
from gradio_client import Client
from sentence_transformers import SentenceTransformer
import sys
from werkzeug.utils import secure_filename
import joblib
import pandas as pd
import numpy as np

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Setup logging
logging.basicConfig(level=logging.INFO)

app.config['SECRET_KEY'] = 'mysecretkey'

# SQLite Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)



# Gradio AI Client Setup 
client = Client("yuntian-deng/ChatGPT")

# Initialize Sentence Transformer model for embedding generation
embedding_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Paths to your data files
json_file_path = "firmware_runtime_errors.json"
txt_file_path = "AI-RAG-DATA_Firmware_Beginner_Guide.txt"
embeddings_file_path = 'embeddings_output.json'

# Helper function to generate and store embeddings from JSON and text files
def generate_and_store_embeddings():
    embeddings = {}

    # Generate embeddings for JSON data
    with open(json_file_path, 'r') as f:
        json_data = json.load(f)
    
    for key, value in json_data.items():
        flattened_text = json.dumps(value) if isinstance(value, (dict, list)) else str(value)
        embedding = embedding_model.encode([flattened_text])[0].tolist()
        embeddings[key] = {"embedding": embedding, "original_data": value}

    # Generate embedding for text data
    with open(txt_file_path, 'r') as f:
        text_data = f.read()
    
    text_embedding = embedding_model.encode([text_data])[0].tolist()
    embeddings["text_file_embedding"] = {
        "embedding": text_embedding,
        "original_data": text_data
    }

    # Save the embeddings to a JSON file
    with open(embeddings_file_path, 'w+') as f:
        json.dump(embeddings, f, indent=4)
    
    logging.info("Embeddings generated and saved successfully.")
    return embeddings

# Load embeddings (call this function wherever necessary)
def load_embeddings():
    try:
        with open(embeddings_file_path, 'r') as f:
            embeddings = json.load(f)
        logging.info("Embeddings loaded successfully.")
    except Exception as e:
        logging.error(f"Error loading embeddings: {e}")
        embeddings = {}
    return embeddings

# Function to calculate cosine distance between two vectors
def cosine_distance(a, b):
    return 1 - sum([a_i * b_i for a_i, b_i in zip(a, b)]) / (
        sum([a_i ** 2 for a_i in a]) ** 0.5 * sum([b_i ** 2 for b_i in b]) ** 0.5
    )

# Function to find the nearest embedding to the given query embedding
def nearest_embedding(query_embedding, embeddings):
    nearest, nearest_distance = None, 1
    for path, entry in embeddings.items():
        embedding2 = entry['embedding']
        distance = cosine_distance(query_embedding, embedding2)
        if distance < nearest_distance:
            nearest, nearest_distance = path, distance
    return nearest

# Models for Database
class Code(db.Model):
    __tablename__ = "code"
    id = db.Column(db.Integer, primary_key=True)
    code_input = db.Column(db.Text, nullable=False)

    def __init__(self, code_input):
        self.code_input = code_input
    
    def __repr__(self):
        return f"Code Input: {self.code_input}"
    
# Function to save embeddings to a file 107
def save_embeddings(embeddings):
    with open('embeddings.json', 'w+') as f:
        json.dump(embeddings, f)

# Function to generate embeddings for input text
def get_embedding(text):
    try:
        return embedding_model.encode([text])[0]
    except Exception as e:
        logging.error(f"Error generating embedding: {e}")
        raise ValueError("Failed to generate embedding")
@app.route('/api/code', methods=['POST'])
def submit_code():


  
    # Validate input data
    data = request.json
    if not data or not data.get('code'):
        return jsonify({'message': 'Code input is required!'}), 400

    code_input = data['code']

    # Save code input to the database
    try:
        new_code = Code(code_input=code_input)
        db.session.add(new_code)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Database error!'}), 500

    # Generate embeddings for input text
    try:
        query_embedding = get_embedding(code_input)
    except Exception as e:
        return jsonify({'message': f'Embedding generation error: {e}'}), 500

    # Load existing embeddings
    embeddings = load_embeddings()

    # Generate and store embeddings if none exist
    if not embeddings:
        embeddings = generate_and_store_embeddings()
    else:
      
        embeddings[code_input] = {
            "embedding": query_embedding.tolist(),
            "original_data": code_input
        }

    save_embeddings(embeddings)

    # Save updated embeddings to the JSON file
    with open(embeddings_file_path, 'w+') as f:
        json.dump(embeddings, f, indent=4)

    # Find the nearest match
    nearest = nearest_embedding(query_embedding, embeddings)

    # Prepare response with AI model
    system_message = "You are a highly proficient firmware engineer with expertise in firmware development and coding."
    facts_message = embeddings[nearest]["original_data"]
    combined_input = f"{system_message}\n\n{facts_message}\n\nUser: {code_input}"

    # Get AI prediction
    try:
        response = client.predict(inputs=combined_input, api_name="/predict")
        response_message = response[0][0][1]
    except Exception as e:
        return jsonify({'message': f'AI prediction error: {e}'}), 500

    return jsonify({'ai_response': response_message}), 201



#Duplicates:
def generate_and_store_embeddings1():
    embeddings = {}

    # Generate embeddings for JSON data
    with open(json_file_path, 'r') as f:
        json_data = json.load(f)
    
    for key, value in json_data.items():
        flattened_text = json.dumps(value) if isinstance(value, (dict, list)) else str(value)
        embedding = embedding_model.encode([flattened_text])[0].tolist()
        embeddings[key] = {"embedding": embedding, "original_data": value}

    # Generate embedding for text data
    with open(txt_file_path, 'r') as f:
        text_data = f.read()
    
    text_embedding = embedding_model.encode([text_data])[0].tolist()
    embeddings["text_file_embedding"] = {
        "embedding": text_embedding,
        "original_data": text_data
    }

    # Save the embeddings to a JSON file
    with open(embeddings_file_path, 'w+') as f:
        json.dump(embeddings, f, indent=4)
    
    logging.info("Embeddings generated and saved successfully.")
    return embeddings

# Load embeddings (call this function wherever necessary)
def load_embeddings1():
    try:
        with open(embeddings_file_path, 'r') as f:
            embeddings = json.load(f)
        logging.info("Embeddings loaded successfully.")
    except Exception as e:
        logging.error(f"Error loading embeddings: {e}")
        embeddings = {}
    return embeddings

# Function to calculate cosine distance between two vectors
def cosine_distance1(a, b):
    return 1 - sum([a_i * b_i for a_i, b_i in zip(a, b)]) / (
        sum([a_i ** 2 for a_i in a]) ** 0.5 * sum([b_i ** 2 for b_i in b]) ** 0.5
    )

# Function to find the nearest embedding to the given query embedding
def nearest_embedding1(query_embedding, embeddings):
    nearest, nearest_distance = None, 1
    for path, entry in embeddings.items():
        embedding2 = entry['embedding']
        distance = cosine_distance(query_embedding, embedding2)
        if distance < nearest_distance:
            nearest, nearest_distance = path, distance
    return nearest

def get_embedding1(text):
    try:
        return embedding_model.encode([text])[0]
    except Exception as e:
        logging.error(f"Error generating embedding: {e}")
        raise ValueError("Failed to generate embedding")

@app.route('/api/optimize', methods=['POST'])
def optimize_code():
    # Validate input data
    data = request.json
    if not data or not data.get('code'):
        return jsonify({'message': 'Code input is required!'}), 400

    code_input = data['code']

    # Save code input to the database
    try:
        new_code = Code(code_input=code_input)
        db.session.add(new_code)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Database error!'}), 500

    # Generate embeddings for input text
    try:
        query_embedding = get_embedding(code_input)
    except Exception as e:
        return jsonify({'message': f'Embedding generation error: {e}'}), 500

    # Load existing embeddings
    embeddings = load_embeddings1()

    # Generate and store embeddings if none exist
    if not embeddings:
        embeddings = generate_and_store_embeddings1()
    else:
      
        embeddings[code_input] = {
            "embedding": query_embedding.tolist(),
            "original_data": code_input
        }

    # Save updated embeddings to the JSON file
    with open(embeddings_file_path, 'w+') as f:
        json.dump(embeddings, f, indent=4)

    # Find the nearest match
    nearest = nearest_embedding1(query_embedding, embeddings)

    # Prepare response with AI model
    system_message = "You are a highly proficient firmware engineer with expertise in firmware development and coding."
    facts_message = embeddings[nearest]["original_data"]
    combined_input = f"{system_message}\n\n{facts_message}\n\nUser: {code_input}"

    # Get AI prediction
    try:
        response = client.predict(inputs=combined_input, api_name="/predict")
        response_message = response[0][0][1]
    except Exception as e:
        return jsonify({'message': f'AI prediction error: {e}'}), 500

    return jsonify({'ai_response': response_message}), 201

#Reload 
@app.route('/api/reload', methods=['POST'])
def reload_server():
    """Reloads the server."""
    os.execv(sys.executable, ['python'] + sys.argv)
    return jsonify({'message': 'Server is restarting...'}), 200



# Basic Home Route
@app.route("/")  
def hello():
    return "Hello, World!"

# User API
@app.route("/api/user", methods=['GET'])
def return_home():
    return jsonify({
        'name': 'John Doe',
        'email': 'john@example.com'
    })


#Working on fileupload

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'csv_files')
ALLOWED_EXTENSIONS = {'csv'}

# Ensure the folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Set the upload folder in the Flask config
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to check allowed file types
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route to handle file uploads
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400

    file = request.files['file']

    # If no file is selected
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400

    # If the file is allowed, save it
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Read the CSV file and return its contents
        data = pd.read_csv(filepath)
        data_dict = data.to_dict(orient='records')  # Convert DataFrame to dictionary
        return jsonify({'message': f'File successfully uploaded', 'data': data_dict}), 200

    return jsonify({'message': 'File type not allowed, only CSV files'}), 400


# Define your database model
class DeviceData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    device_type = db.Column(db.String(50), nullable=False)
    air_temperature = db.Column(db.Float, nullable=False)
    process_temperature = db.Column(db.Float, nullable=False)
    rotational_speed = db.Column(db.Float, nullable=False)
    torque = db.Column(db.Float, nullable=False)
    tool_wear = db.Column(db.Float, nullable=False)

# Load the trained model
model = joblib.load('multi_target_rf_model_Newest.pkl')

@app.route('/submit', methods=['POST'])
def submit_data():
    data = request.json
    # Extract data from the request
    device_type = data.get('deviceType')
    air_temperature = data.get('airTemperature')
    process_temperature = data.get('processTemperature')
    rotational_speed = data.get('rotationalSpeed')
    torque = data.get('torque')
    tool_wear = data.get('toolWear')

    # Save the data to the database
    new_data = DeviceData(
        device_type=device_type,
        air_temperature=air_temperature,
        process_temperature=process_temperature,
        rotational_speed=rotational_speed,
        torque=torque,
        tool_wear=tool_wear
    )
    db.session.add(new_data)
    db.session.commit()

    # Prepare input for the AI model
    input_data = [[air_temperature, process_temperature, rotational_speed, torque, tool_wear]]
    # Make predictions
    y_pred_test = model.predict(input_data)
    y_pred_test_df = pd.DataFrame(y_pred_test, columns=['TWF', 'HDF', 'PWF', 'OSF', 'RNF'])

    # Infer overall machine failure
    machine_failure_predicted = (y_pred_test_df.sum(axis=1) > 0).astype(int).values[0]

    # Prepare response
    response = {
        'predictions': y_pred_test_df.to_dict(orient='records')[0],
        'machine_failure': bool(machine_failure_predicted)
    }
    
    return jsonify(response), 200




if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Generate embeddings when the app starts
        generate_and_store_embeddings()
    app.run(debug=True, port=8080)

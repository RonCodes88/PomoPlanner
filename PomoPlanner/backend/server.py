from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os 
from dotenv import load_dotenv
import bcrypt  # For password hashing
import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

username = os.environ.get('MONGO_USERNAME')
password = os.environ.get('MONGO_PASSWORD')
cluster = os.environ.get('MONGO_CLUSTER')

uri = f"mongodb+srv://{username}:{password}@{cluster}/?retryWrites=true&w=majority&ssl=true&tlsAllowInvalidCertificates=true"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

try:
    # Send a ping to confirm a successful connection
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
    
    # Set up database and collections
    db = client.PomoPlanner
    users_collection = db.users
    
except Exception as e:
    print(f"MongoDB Connection Error: {e}")

@app.route('/api/create-account', methods=['POST'])
def create_account():
    """Create a new user account"""
    try:
        # Get user data from request
        user_data = request.json
        email = user_data.get('email')
        password = user_data.get('password')
        
        # Basic validation
        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400
        
        # Check if user already exists
        if users_collection.find_one({"email": email}):
            return jsonify({"success": False, "message": "Email already registered"}), 400
        
        # Hash the password (never store plain text passwords!)
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create new user document
        new_user = {
            "email": email,
            "password": hashed_password.decode('utf-8'),  # Convert bytes to string for storage
            "created_at": datetime.datetime.now()
        }
        
        # Insert user into database
        result = users_collection.insert_one(new_user)
        
        if result.acknowledged:
            return jsonify({"success": True, "message": "Account created successfully"}), 201
        else:
            return jsonify({"success": False, "message": "Failed to create account"}), 500
            
    except Exception as e:
        print(f"Error creating account: {e}")
        return jsonify({"success": False, "message": "An error occurred"}), 500


@app.route('/api/login', methods=['POST'])
def login():
    """Authenticate a user"""
    try:
        # Get login data from request
        login_data = request.json
        email = login_data.get('email')
        password = login_data.get('password')
        
        # Basic validation
        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400
        
        # Find the user in the database
        user = users_collection.find_one({"email": email})
        
        # Check if user exists
        if not user:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
        
        # Check if password is correct (compare with hashed password)
        stored_password = user.get('password')
        if bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
            # Password matched - create user response without password
            user_data = {
                "email": user.get('email'),
                "userId": str(user.get('_id')),
                "created_at": user.get('created_at')
            }
            return jsonify({"success": True, "message": "Login successful", "user": user_data}), 200
        else:
            # Password didn't match
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
            
    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"success": False, "message": "An error occurred"}), 500


@app.route('/')
def hello_world():
    return 'Hello, World!'


if __name__ == '__main__':
    app.run(debug=True)
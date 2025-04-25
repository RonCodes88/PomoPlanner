from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os 
from dotenv import load_dotenv
import bcrypt  # For password hashing
import datetime
from bson.objectid import ObjectId
from groq_helper import GroqClient

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
    tasks_collection = db.tasks
    
except Exception as e:
    print(f"MongoDB Connection Error: {e}")

# Initialize the Groq client
groq_client = GroqClient()

@app.route('/')
def welcome():
    return 'Welcome to PomoPlanner!'

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

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Add a new task"""
    try:
        task_data = request.json
        
        # Validate required fields
        if not task_data.get('title') or not task_data.get('date'):
            return jsonify({"success": False, "message": "Title and date are required"}), 400
        
        # Get user ID from request
        user_id = task_data.get('userId')
        if not user_id:
            return jsonify({"success": False, "message": "Create Account/Login is required"}), 400
        
        # Prepare task document with only the needed fields
        task_document = {
            "title": task_data['title'],
            "date": task_data['date'],
            "time": task_data.get('time', ''),  # Optional time field
            "pomodoros": task_data.get('pomodoros', 0),  # Ensure it's an integer
            "userId": user_id,
            "completed": False  
        }
        
        # Insert into database
        result = tasks_collection.insert_one(task_document)
        
        if result.acknowledged:
            # Return the task with the MongoDB _id converted to string id
            # Create a new dictionary instead of modifying the original to avoid _id issues
            response_data = {
                "id": str(result.inserted_id),
                "title": task_document['title'],
                "date": task_document['date'],
                "time": task_document.get('time', ''),
                "pomodoros": task_document.get('pomodoros', 0),
                "completed": False,
                "userId": user_id
            }
            
            print(f"Added task: {task_data['title']} for date {task_data['date']} with {task_data.get('pomodoros', 0)} Pomodoros")
            return jsonify(response_data), 201
        else:
            return jsonify({"success": False, "message": "Failed to create task"}), 500
            
    except Exception as e:
        print(f"Error adding task: {e}")
        return jsonify({"success": False, "message": "An error occurred"}), 500

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks for a user"""
    try:
        # Get user ID from query parameter
        user_id = request.args.get('userId')
        
        if not user_id:
            return jsonify({"success": False, "message": "Create Account/Login is required"}), 400
            
        # Find all tasks for this user
        tasks = list(tasks_collection.find({"userId": user_id}))
        
        # Format tasks for response
        formatted_tasks = []
        for task in tasks:
            # Convert MongoDB _id to string id
            task_dict = {
                "id": str(task['_id']),
                "title": task['title'],
                "date": task['date'],
                "time": task.get('time', ''),
                "pomodoros": task.get('pomodoros', 0),
                "completed": task.get('completed', False)
            }
            formatted_tasks.append(task_dict)
            
        return jsonify(formatted_tasks)
        
    except Exception as e:
        print(f"Error retrieving tasks: {e}")
        return jsonify({"success": False, "message": "An error occurred"}), 500
    
@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    """Update an existing task"""
    try:
        task_data = request.json
        
        # Find the task first to ensure it exists
        try:
            task_obj_id = ObjectId(task_id)
        except:
            return jsonify({"success": False, "message": "Invalid task ID format"}), 400
            
        existing_task = tasks_collection.find_one({"_id": task_obj_id})
        
        if not existing_task:
            return jsonify({"success": False, "message": "Task not found"}), 404
        
        # Prepare update document - only include fields that can be updated
        update_data = {}
        for field in ['title', 'date', 'time', 'pomodoros', 'completed']:
            if field in task_data:
                update_data[field] = task_data[field]
        
        # Update in database
        result = tasks_collection.update_one(
            {"_id": task_obj_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0 or result.matched_count > 0:
            # Log the update
            if 'completed' in task_data:
                print(f"Toggled completion status for task {task_id} to: {task_data['completed']}")
            else:
                print(f"Edited task {task_id}: {task_data}")
                
            # Get the updated task to return
            updated_task = tasks_collection.find_one({"_id": task_obj_id})
            
            # Format response
            response_data = {
                "id": task_id,
                "title": updated_task['title'],
                "date": updated_task['date'],
                "time": updated_task.get('time', ''),
                "pomodoros": updated_task.get('pomodoros', 0),
                "completed": updated_task.get('completed', False)
            }
            
            return jsonify(response_data)
        else:
            return jsonify({"success": False, "message": "No changes made to the task"}), 400
            
    except Exception as e:
        print(f"Error updating task: {e}")
        return jsonify({"success": False, "message": "An error occurred"}), 500

@app.route('/api/chatbot', methods=['POST'])
def chatbot_response():
    """Process a user message and respond using Groq"""
    try:
        data = request.json
        user_id = data.get('userId')
        user_message = data.get('message')
        
        if not user_id or not user_message:
            return jsonify({"success": False, "message": "User ID and message are required"}), 400

        # Get the user's tasks from the database
        tasks = list(tasks_collection.find({"userId": user_id}))
        
        # Parse tasks for relevant information
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        today_tasks = []
        upcoming_tasks = []
        for task in tasks:
            task_info = {
                "id": str(task['_id']),
                "title": task['title'],
                "date": task['date'],
                "time": task.get('time', 'No time set'),
                "pomodoros": task.get('pomodoros', 0),
                "completed": task.get('completed', False)
            }
            
            if task['date'] == today:
                today_tasks.append(task_info)
            elif task['date'] > today:
                upcoming_tasks.append(task_info)
        
        # Sort upcoming tasks by date
        upcoming_tasks.sort(key=lambda x: x['date'])
        
        # Create context for the AI
        system_message = f"""You are a helpful assistant for the PomoPlanner app. 
IMPORTANT GUIDELINES:
1. Return clean responses without checkbox symbols or brackets
2. Always include ALL upcoming tasks in your response when asked about schedule
3. Don't ask questions, just provide information
4. Be concise but complete

Today's date is {datetime.datetime.now().strftime("%Y-%m-%d")}.
The user has {len(today_tasks)} tasks scheduled for today."""
        
        if today_tasks:
            system_message += "\n\nTODAY'S TASKS:"
            for i, task in enumerate(today_tasks, 1):
                status = "completed" if task["completed"] else "not completed"
                system_message += f"\n{i}. {task['title']} - {task['time']} ({task['pomodoros']} pomodoros) - {status}"
        else:
            system_message += "\n\nNo tasks scheduled for today."
            
        # Always include upcoming tasks in the context
        if upcoming_tasks:
            system_message += "\n\nUPCOMING TASKS:"
            for i, task in enumerate(upcoming_tasks, 1):
                system_message += f"\n{i}. {task['title']} - Date: {task['date']}, Time: {task['time']}"
        else:
            system_message += "\n\nNo upcoming tasks scheduled."

        # Create the conversation for Groq
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ]

        # Get response from Groq
        ai_response = groq_client.get_response(messages)
        
        return jsonify({"success": True, "response": ai_response})
        
    except Exception as e:
        print(f"Error in chatbot endpoint: {e}")
        return jsonify({"success": False, "message": "An error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True)
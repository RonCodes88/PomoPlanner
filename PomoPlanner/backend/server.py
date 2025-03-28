from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Add a new task"""
    task_data = request.json
    print(f"Added task: {task_data['title']} for date {task_data['date']} with {task_data.get('pomodoros', 0)} Pomodoros")
    
    # Return the same task with a fake ID
    task_data['id'] = 12345  # Using a fixed ID for simplicity
    return jsonify(task_data), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    """Update an existing task"""
    task_data = request.json
    
    if 'completed' in task_data:
        print(f"Toggled completion status for task {task_id} to: {task_data['completed']}")
    else:
        print(f"Edited task {task_id}: {task_data}")
    
    # Return the updated task - combining the ID and the updated data
    response_data = {'id': int(task_id), **task_data}
    return jsonify(response_data)


if __name__ == '__main__':
    app.run(debug=True)
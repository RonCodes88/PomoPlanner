# PomoPlanner  
Pomodoro technique, task management, and AI assistant – all in one.  

## Group Members
- Ronald Li
- David Vu

## 📄 Overview  
PomoPlanner is a productivity-focused application that integrates:  
- A **Pomodoro timer** for structured work sessions  
- A **task management system** to track and prioritize tasks  
- An **AI assistant (powered by Groq)** to provide productivity insights  

## 💻 Tech Stack  
### Frontend  
- React.js  
- Tailwind CSS  
- Material UI  

### Backend  
- Python (Flask)  

### Database  
- MongoDB  

### AI Assistant  
- Groq

## 📦 Dependencies

The following Python libraries are required:
- Python
- Flask
- Flask-cors
- Groq
- PyMongo
- bcrypt
- python-dotenv

If versions are important:      
```bash
cd backend
```

Start a virtual environment and do:
```bash
pip install -r requirements.txt
```

## 🚀 How To Run PomoPlanner
```bash
git clone https://github.com/RonCodes88/PomoPlanner.git
cd PomoPlanner
```
### Set up virtual environment (optional but recommended)
```bash
cd backend
python -m venv <your-venv-name>
source <your-venv-name>/bin/activate # On Windows: <your-venv-name>\Scripts\activate
```
### Install dependencies
```bash
pip install -r requirements.txt
```

### Run the backend
```bash
python server.py
```

### Then to run the frontend, start a new terminal and type
```bash
npm install
npm run dev
```

## 🗂️ File Structure Overview
```bash
PomoPlanner/
├── backend/
│   ├── groq_helper.py (OOP class for GroqClient)
│   ├── requirements.txt
│   └── server.py (Flask API logic)
├── src/
│   ├── components/ (Contains the main frontend components)
│   │   ├── AddTaskForm.jsx
│   │   ├── Calendar.jsx
│   │   ├── ChatbotComponent.jsx
│   │   ├── EditTaskForm.jsx
│   │   ├── NavBar.jsx
│   │   └── TaskItem.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/ (Contains the main pages in the application)
│   │   ├── CreateAccountPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── TaskVisualizationPage.jsx
│   │   └── TasksPage.jsx
│   ├── utils/ (Utility functions)
│   │   ├── dbUtils.jsx
│   │   └── timeUtils.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

## ⚠️ Known Bugs or Limitations
There are currently no bugs. One limitation is in the AI chat assistant feature where it is only able to answer questions based on a the user's calendar's tasks. The AI chat assistant is not able to perform actual operations on the calendar such as adding a task or deleting a task.

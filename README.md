# IFrameIt Backend

## Overview
IFrameIt Backend is a lightweight Node.js/Express API server that provides endpoints for AI-powered chat and code generation, designed to be easily connected to any frontend (React, Vue, etc.). This backend leverages the Groq LLM API to process chat messages and generate minimal React app templates based on user prompts.

---

## Project Flow

1. **Frontend Sends Request:**
   - The frontend (or any HTTP client) sends POST requests to the backend API endpoints (`/chat` or `/template`).
2. **Backend Processes Request:**
   - The backend receives the request, forwards the prompt/messages to the Groq LLM API, and processes the response.
3. **Backend Returns Response:**
   - The backend returns a clean JSON response to the frontend, which can be rendered or further processed by the frontend.

---

## API Endpoints

### 1. `/chat`
- **Method:** POST
- **Request Body:**
  ```json
  {
    "messages": [
      { "role": "user", "content": "Hello!" }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "reply": "Hello! It's nice to meet you. Is there something I can help you with, or would you like to chat?"
  }
  ```

### 2. `/template`
- **Method:** POST
- **Request Body:**
  ```json
  {
    "prompt": "Create a minimal React app with a button"
  }
  ```
- **Response:**
  ```json
  {
    "files": [
      { "name": "src", "type": "folder", "children": [ ... ] },
      { "name": "package.json", "type": "file", "content": "..." }
    ]
  }
  ```

---

## How to Connect with a Frontend

1. **Set up your frontend (React, Vue, etc.).**
2. **Send HTTP requests** to the backend endpoints (`/chat` and `/template`) using `fetch`, `axios`, or any HTTP client from your frontend code.
3. **Example (React using fetch):**
   ```js
   // Chat endpoint
   fetch('http://localhost:3000/chat', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello!' }] })
   })
     .then(res => res.json())
     .then(data => console.log(data.reply));

   // Template endpoint
   fetch('http://localhost:3000/template', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ prompt: 'Create a minimal React app with a button' })
   })
     .then(res => res.json())
     .then(data => console.log(data.files));
   ```

---

## Local Setup & Running

### 1. Clone the Repository
```sh
git clone https://github.com/satyampsoni/IFrameIt.git
cd IFrameIt/backend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
- Create a `.env` file in the backend directory with the following:
  ```env
  GROQ_API_KEY=your_groq_api_key_here
  PORT=3000 # (optional, defaults to 3000)
  ```

### 4. Build & Run the Server
```sh
npm run dev
```

The server will start on `http://localhost:3000`.

---

## Testing the API

You can test the endpoints using curl or Postman:

### Chat Endpoint
```sh
curl -X POST http://localhost:3000/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Hello!"}]}'
```

### Template Endpoint
```sh
curl -X POST http://localhost:3000/template \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Create a minimal React app with a button"}'
```

---

## Notes
- Make sure your GROQ API key is valid and you have internet access for the backend to communicate with the Groq LLM API.
- The backend is stateless and does not store any user data.
- You can connect any frontend or HTTP client to these endpoints.

---

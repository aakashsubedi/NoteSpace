 # 📝 NoteSpace

> **A modern, secure, and scalable note-taking platform built with Django & React**

**Unleash your ideas. Organize your world. Work smarter.**

![Python](https://img.shields.io/badge/Python-3.x-blue?logo=python)
![Django](https://img.shields.io/badge/Django-Backend-092E20?logo=django)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-UI-38BDF8?logo=tailwindcss)
![JWT](https://img.shields.io/badge/Auth-JWT-red)

---

## 📌 About the Project

**NoteSpace** is a full-stack note-taking application designed with a **clean architecture**, **secure authentication**, and a **modern user experience**.

It integrates a **Django REST backend** with a **React + TypeScript frontend**, making it ideal as a **portfolio project**, **learning reference**, or **production-ready base** for larger systems.

---

## ✨ Key Features

- 🔐 **JWT Authentication**
  - Secure login & registration
  - Token-based user authorization

- 📝 **CRUD Notes Management**
  - Create, edit, delete, and view personal notes
  - User-specific data isolation

- ⚙️ **RESTful API Architecture**
  - Clean API design for frontend–backend communication
  - Easy to extend or integrate with mobile apps

- 🎨 **Modern UI**
  - Responsive design using Tailwind CSS
  - Fast frontend with Vite + React

- 🧩 **Scalable Codebase**
  - Modular backend apps
  - Maintainable frontend structure

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite

### Backend
- Django
- Django REST Framework
- JWT Authentication

### Tools
- Git & GitHub
- npm & pip
- Pytest

---

## 🚀 Getting Started

### ✅ Prerequisites

Make sure you have the following installed:

- **Python** 3.9+
- **Node.js** 18+
- **npm** or **pip**
- **Git**

---

### 📥 Installation

#### 1️⃣ Clone the repository

```bash
git clone https://github.com/aakashsubedi/NoteSpace.git
2️⃣ Move into the project directory
bash
cd NoteSpace
3️⃣ Backend setup
bash
pip install -r backend/requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
Backend will run at:

cpp
http://127.0.0.1:8000
4️⃣ Frontend setup
bash
npm install
npm run dev
Frontend will run at:

arduino
http://localhost:3000
▶️ Usage
Register or login as a user

Create, edit, and manage notes

Notes are securely linked to your account

Backend API handles authentication and data persistence

🧪 Testing
Backend Tests
pytest
Frontend Tests
npm test


📂 Project Structure
NoteSpace/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── accounts/
│   ├── notes/
│   └── core/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
🔮 Roadmap / Future Enhancements
🏷️ Note tagging & categories

🌙 Dark / Light mode

🔍 Full-text search

☁️ Cloud storage support

📱 Mobile-first UI improvements

📄 License
This project is licensed under the MIT License — free to use, modify, and distribute.

👤 Author
Aakash Subedi
Frontend Developer | Django & React Enthusiast

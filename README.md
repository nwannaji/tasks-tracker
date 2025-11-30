# Tasks Tracker

A comprehensive task management system built with Django REST Framework backend and React TypeScript frontend, using PostgreSQL 17 for data storage.

## Features

- **User Authentication**: JWT-based registration and login system
- **Role-based Access**: Manager and Employee roles with different permissions
- **Task Management**: Create, assign, and track tasks
- **Real-time Dashboard**: Overview of tasks, statistics, and progress
- **Reports**: Generate and view task reports

## Tech Stack

### Backend

- **Django 5.2.8** - Web framework
- **Django REST Framework** - API development
- **PostgreSQL 17** - Database
- **JWT Authentication** - Token-based auth
- **Python 3.12** - Programming language

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Axios** - HTTP client

## Project Structure

```
tasks-tracker/
├── backend/                 # Django REST API
│   ├── accounts/           # User management app
│   ├── tasks/              # Task management app
│   ├── reports/            # Reports app
│   ├── tasks_tracker/      # Project settings
│   ├── manage.py
│   └── requirements.txt
├── frontend/               # React TypeScript app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── api/          # API calls
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 17
- Git

### Backend Setup

1. **Clone and navigate to backend:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```

3. **Install dependencies:**

   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter psycopg2-binary python-decouple
   ```

4. **Configure database:**

   - Create PostgreSQL database: `tasks_tracker_db`
   - Create user with appropriate permissions
   - Update `.env` file with database credentials

5. **Run migrations:**

   ```bash
   python manage.py migrate
   ```

6. **Start server:**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - Get user profile
- `GET /api/auth/employees/` - Get list of employees

### Tasks

- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task

### Reports

- `GET /api/reports/` - Get task reports

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=tasks_tracker_db
DB_USER=tasks_tracker_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Database Schema

### Users (Custom User Model)

- Fields: username, email, first_name, last_name, role, created_at
- Roles: manager, employee

### Tasks

- Fields: title, description, assigned_to, created_by, status, priority, due_date, created_at, updated_at
- Status: pending, in_progress, completed, cancelled
- Priority: low, medium, high

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Recent Updates

- ✅ Migrated from SQLite3 to PostgreSQL 17
- ✅ Fixed CORS configuration for multi-port development
- ✅ Implemented JWT authentication system
- ✅ Added role-based access control
- ✅ Created responsive dashboard with statistics

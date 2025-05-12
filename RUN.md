# Running the E-commerce Project

This guide will help you set up and run the MERN Stack E-commerce project with its three main components: backend, frontend, and admin panel.

## Prerequisites

- Node.js and npm
- Docker and Docker Compose (for MongoDB)
- Git (to clone the repository)

## Setup Instructions

1. **Initial Setup**

   Run the setup script to create environment files and start MongoDB:

   ```bash
   ./setup.sh
   ```

   This will:
   - Copy example environment files to create .env files for each component
   - Start MongoDB in a Docker container

2. **Running the Components**

   You need to run each component in a separate terminal window:

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

   **Terminal 3 - Admin Panel:**
   ```bash
   cd admin
   npm install
   npm start
   ```

3. **Accessing the Application**

   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:5000
   - Backend API: http://localhost:4000

## Using Docker Compose (Alternative)

To run the entire application with Docker Compose:

```bash
docker-compose up
```

This will start all services (backend, frontend, admin, MongoDB, and nginx) and make the app available at http://localhost:80

## Stopping the Application

If using Docker Compose:
```bash
docker-compose down
```

If running components separately, press `Ctrl+C` in each terminal window.

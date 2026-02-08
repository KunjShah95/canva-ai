# Image Editor Project Setup

## Prerequisites
- Node.js installed
- PostgreSQL installed and running locally on default port 5432
- Database `image_editor` created (or update `backend/.env` to point to an existing DB)

## Setup and Run
1.  **Configure Database**:
    - Ensure PostgreSQL is running.
    - Create a database named `image_editor` (or match your `.env`).
    - The default connection string in `backend/.env` is:
      `postgresql://postgres:postgres@localhost:5432/image_editor`
    - Update `backend/.env` if your credentials differ.

2.  **Start the Application**:
    - Double-click `start.bat` to install dependencies, run migrations, and start both backend and frontend servers.

    **OR** manually:

    - **Backend**:
      ```bash
      cd backend
      npm install
      # Ensure DB is running before this:
      npx prisma migrate dev --name init
      npm start  # NOT npx start
      ```
    - **Frontend**:
      ```bash
      # In the root directory
      npm install
      npm run dev
      ```

3.  **Troubleshooting**:
    - If `npm start` fails with DB errors, check your `.env` file and PostgreSQL service.
    - Ensure `image_editor` database exists: `createdb image_editor` (if using Postgres command line tools).

4.  **Access the App**:
    - Open `http://localhost:5173` in your browser.
    - Sign up / Log in to access the dashboard and editor.

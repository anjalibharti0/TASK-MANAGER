# Frontend Architecture & Code Walkthrough

This document provides a line-by-line explanation of the React-based frontend of our Task Manager application. The frontend uses **React**, **React Router v6** for secure page routing, **Bootstrap 5** for basic layout structures, and **React Toastify** for notification feedbacks. Styling is enriched using modern glassmorphic CSS rules.

---

## Directory Structure Overview

All source code files reside under the `src/` directory:
- **[index.js](file:///c:/Users/anjal/Desktop/TASK-MANAGER/frontend/src/index.js)**: Entry point of the React application.
- **[utils.js](file:///c:/Users/anjal/Desktop/TASK-MANAGER/frontend/src/utils.js)**: Holds backend configuration URL and notification helper functions.
- **[api.js](file:///c:/Users/anjal/Desktop/TASK-MANAGER/frontend/src/api.js)**: Functions to handle fetch requests to the backend server with JWT protection.
- **[components/ReRoute.jsx](file:///c:/Users/anjal/Desktop/TASK-MANAGER/frontend/src/components/ReRoute.jsx)**: Private and Public route guards.
- **[pages/Signup.jsx](file:///c:/Users/anjal/Desktop/TASK-MANAGER/frontend/src/pages/Signup.jsx)**: Form for creating new user accounts.
- **[pages/Login.jsx](file:///c:/Users/anjal/Desktop/TASK-MANAGER/frontend/src/pages/Login.jsx)**: Form for logging into existing accounts and retrieving JWT.
- **[App.js](file:///c:/Users/anjal/Desktop/TASK-MANAGER/frontend/src/App.js)**: Orchestrates page routing and guards.
- **[TaskManager.jsx](file:///c:/Users/anjal/Desktop/TASK-MANAGER/frontend/src/TaskManager.jsx)**: The primary dashboard for creating, reading, updating, and deleting tasks.

---

## Detailed Code Walkthrough

### 1. `src/index.js`
The entry point that bootstraps the React application to the DOM.

- **Line 1-2**: `import React from 'react';` & `import ReactDOM from 'react-dom/client';`
  Imports the core React framework and the DOM renderer package to mount React components onto the HTML document.
- **Line 3**: `import './index.css';`
  Loads our premium global CSS design tokens, background gradients, and styles.
- **Line 4**: `import App from './App';`
  Imports the main `App` component containing our application routes.
- **Line 5**: `import reportWebVitals from './reportWebVitals';`
  Imports performance analytics configuration.
- **Line 6-7**: `import 'bootstrap/dist/css/bootstrap.min.css';` & `import 'bootstrap/dist/js/bootstrap.bundle.min';`
  Imports Bootstrap styles and JavaScript bundle (enables responsive layouts, buttons, and utility classes).
- **Line 8**: `import 'react-toastify/dist/ReactToastify.css';`
  Imports styles required for rendering React Toastify alert popups.
- **Line 10**: `const root = ReactDOM.createRoot(document.getElementById('root'));`
  Selects the `<div id="root">` element inside `public/index.html` as the target container for rendering the application.
- **Line 11-15**: `root.render(...)`
  Renders the React tree inside the root element. `<React.StrictMode>` is a developer tool that runs checks and warns about legacy elements.

---

### 2. `src/utils.js`
Utility constants and functions shared across components.

- **Line 1**: `import { toast } from 'react-toastify';`
  Imports the toast controller object to trigger alerts dynamically.
- **Line 2-4**: `export const notify = (message, type) => { toast[type](message); }`
  Exports a reusable helper function `notify`. Calling `notify("Success!", "success")` triggers a popup based on the `type` parameter (e.g. `'success'`, `'error'`, `'info'`).
- **Line 5**: `export const API_URL = 'http://localhost:8080';`
  Defines the API endpoint pointing to our backend Node.js Express server.

---

### 3. `src/api.js`
Contains all REST API interaction helper methods using standard browser `fetch`.

- **Line 4-10**: `const getAuthHeaders = () => { ... }`
  Utility that constructs and returns standard header properties. It fetches the JWT from `localStorage` (`localStorage.getItem('token')`) and attaches it under `Authorization` so the backend middleware can authorize requests.
- **Line 13-30**: `export const SignupAPI = async (userObj) => { ... }`
  Sends a `POST` request to `http://localhost:8080/auth/signup` containing the signup credentials (`name`, `email`, `password`) in the request body serialized as JSON. Returns parsed JSON response data.
- **Line 33-50**: `export const LoginAPI = async (userObj) => { ... }`
  Sends a `POST` request to `http://localhost:8080/auth/login` containing the credentials. If successful, returns the login response (which includes the signed JWT).
- **Line 51-66**: `export const CreateTask = async (taskObj) => { ... }`
  Sends a `POST` request to `/tasks` to create a new task. Calls `getAuthHeaders()` to inject the token.
- **Line 69-83**: `export const GetAllTasks = async () => { ... }`
  Sends a `GET` request to `/tasks` to fetch all tasks belonging to the currently logged-in user.
- **Line 86-100**: `export const DeleteTaskById = async (id) => { ... }`
  Sends a `DELETE` request to `/tasks/:id` to delete a specific task.
- **Line 103-118**: `export const UpdateTaskById = async (id, reqBody) => { ... }`
  Sends a `PUT` request to `/tasks/:id` along with the fields to update (e.g. `{ isDone: true }`).

---

### 4. `src/components/ReRoute.jsx`
Implements route-guarding logic to prevent unauthenticated users from seeing tasks, and authenticated users from accessing login screens.

- **Line 4-7**: `export const PrivateRoute = ({ children }) => { ... }`
  Checks if `token` exists in `localStorage`. If it does, it renders the requested dashboard (`children`). If not, it redirects the user to `/login` using the `<Navigate>` wrapper from `react-router-dom`.
- **Line 9-12**: `export const PublicRoute = ({ children }) => { ... }`
  Checks if `token` exists in `localStorage`. If a user is already logged in, it redirects them to the main dashboard page (`/`). Otherwise, it allows them to access the login/signup screens (`children`).

---

### 5. `src/pages/Signup.jsx`
Responsible for capturing registration input and signing up users.

- **Line 7-11**: `const [signupInfo, setSignupInfo] = useState({ name: '', email: '', password: '' });`
  Initializes local component state to store form fields.
- **Line 15-18**: `const handleChange = (e) => { ... }`
  Updates component state dynamically as the user types by mapping input element name attributes to value states.
- **Line 20-41**: `const handleSignup = async (e) => { ... }`
  Submits the values to `SignupAPI`.
  - **Line 21**: Prevents the browser's default page refresh on form submission.
  - **Line 26**: Makes the API request.
  - **Line 28-31**: If successful, triggers success toast notification and redirects the user to `/login` after `1` second.
  - **Line 32-37**: Displays errors back to the user if server-side validation checks fail.

---

### 6. `src/pages/Login.jsx`
Responsible for capturing login credentials, saving the JWT token, and launching the dashboard.

- **Line 7-10**: `const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });`
  Defines local login credentials state.
- **Line 19-40**: `const handleLogin = async (e) => { ... }`
  Triggers authentication submission.
  - **Line 25**: Triggers the `LoginAPI` call.
  - **Line 27-31**: On successful authentication, saves the returned `jwtToken` and user's `name` to `localStorage` for session persistence.
  - **Line 32**: Redirects the browser to `/` (Task Manager Dashboard) after a slight delay.

---

### 7. `src/App.js`
Main navigation layout component.

- **Line 10-38**: Renders the Router architecture.
  - **Line 12**: `<BrowserRouter>` keeps UI in sync with the address bar URL.
  - **Line 13**: `<Routes>` renders the first matching route branch.
  - **Line 15-19**: Maps `/` to the protected `<TaskManager />` dashboard.
  - **Line 21-25**: Maps `/login` to `<Login />` (blocks authenticated users).
  - **Line 27-31**: Maps `/signup` to `<Signup />` (blocks authenticated users).
  - **Line 34**: Re-routes any unknown paths back to `/`.

---

### 8. `src/TaskManager.jsx`
The primary application interface where users manage their personal todo lists.

- **Line 7-13**: Declares component state variables:
  - `input`: Text value of the task input box.
  - `tasks`: Loaded user tasks list.
  - `copyTasks`: Backup of the tasks list used to reset searching filters.
  - `updateTask`: Reference containing the task object currently being edited.
  - `userName`: The name of the logged-in user retrieved from localStorage.
- **Line 16-19**: `useEffect(() => { ... })`
  Runs once on mount. Retrieves the user's name from localStorage and triggers the initial fetch of tasks.
- **Line 21-28**: `handleLogout`
  Clears session keys (`token` and `loggedInUser`) from `localStorage`, displays a logout success alert, and redirects to `/login`.
- **Line 30-44**: `handleTask`
  Determines whether task input submission represents a new task creation or an update operation, then calls `handleUpdateItem` or `handleAddTask` accordingly.
- **Line 51-72**: `handleAddTask`
  Calls `CreateTask` API. Checks if the response indicates token expiry (403 Unauthorized). If it does, automatically logs the user out. Otherwise, triggers a notification and re-fetches the user's list.
- **Line 74-95**: `fetchAllTasks`
  Retrieves the user's current tasks list and populates both `tasks` and `copyTasks` lists.
- **Line 97-117**: `handleDeleteTask`
  Requests task deletion on the server, verifies response status, and updates state.
- **Line 119-140**: `handleCheckAndUncheck`
  Toggles the `isDone` boolean status of a task and updates the record.
- **Line 142-167**: `handleUpdateItem`
  Sends the updated task name string back to the server, clears editing focus, and updates tasks.
- **Line 169-174**: `handleSearch`
  Filters tasks listed on-screen matching the query input. Uses `copyTasks` to avoid losing reference to the original unfiltered dataset.
- **Line 176-281**: Render layout:
  - Welcomes the user with a greeting header and provides a logout button.
  - Controls toggling visual classes (e.g. line-through formatting for checked tasks).
  - Integrates the `<ToastContainer />` which displays toast notification modals on the screen.

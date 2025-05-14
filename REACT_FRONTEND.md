# Sysdig Inspect React Frontend

This document explains how to use the new React.js frontend for Sysdig Inspect.

## Overview

The original Sysdig Inspect frontend was built with Ember.js. This project includes a new frontend implementation using React.js and Redux, which maintains the same visual appearance and functionality as the original.

The backend and controller remain unchanged, allowing you to switch between the Ember.js and React.js frontends as needed.

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher

### Setup

1. First, set up the React frontend:

```bash
npm run setup:react
```

This will install all the necessary dependencies for the React frontend.

### Running the Application

You can run the React frontend in two ways:

#### Option 1: Run the complete application (backend + React frontend)

```bash
# On Linux/macOS
npm run start:react-app

# On Windows
npm run start:win:react-app
```

This will start both the backend server and the React frontend. The React frontend will be available at http://localhost:3001 and will communicate with the backend at http://localhost:3000.

#### Option 2: Run the backend and frontend separately

```bash
# Start the backend
npm run start:backend  # or npm run start:win:backend on Windows

# In a separate terminal, start the React frontend
npm run start:react
```

### Building for Production

To build the React frontend for production:

```bash
npm run build:react
```

This creates a production build in the `react-frontend/build` directory.

### Docker

You can also build and run the React frontend in a Docker container:

```bash
npm run make:react-docker-image
docker run -p 80:80 --name sysdig-inspect-react sysdig-inspect-react
```

## Switching Between Frontends

You can easily switch between the original Ember.js frontend and the new React.js frontend:

- To use the Ember.js frontend: `npm run start:webapp`
- To use the React.js frontend: `npm run start:react`

Both frontends communicate with the same backend server.

## Project Structure

The React frontend is located in the `react-frontend` directory and has the following structure:

- `src/components`: Reusable UI components
- `src/pages`: Page components that correspond to routes
- `src/store`: Redux store configuration and slices
- `src/services`: API and utility services
- `src/styles`: LESS stylesheets
- `public`: Static assets

## License

This project is licensed under the GNU General Public License - see the LICENSE file for details.

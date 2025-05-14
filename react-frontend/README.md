# Sysdig Inspect React Frontend

This is a React.js port of the original Ember.js frontend for Sysdig Inspect. It maintains the same visual appearance and functionality while using modern React.js and Redux for state management.

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components that correspond to routes
- `src/store`: Redux store configuration and slices
- `src/services`: API and utility services
- `src/styles`: LESS stylesheets
- `public`: Static assets

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher

### Installation

```bash
cd react-frontend
npm install
```

If you encounter TypeScript version conflicts during installation, the project has been configured to use TypeScript 4.9.5 which is compatible with Create React App. The configuration includes:

- Using react-app-rewired and customize-cra for LESS support
- Setting up proper TypeScript configuration
- Adding type declarations for LESS files

If you still encounter issues, try removing the node_modules directory and package-lock.json file before reinstalling:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Development

To start the development server:

```bash
npm start
```

This will start the React development server on port 3001, which proxies API requests to the backend server running on port 3000.

### Building for Production

To build the application for production:

```bash
npm run build
```

This creates a `build` directory with the compiled application.

## Docker

To build and run the React frontend in a Docker container:

```bash
# Build the Docker image
docker build -t sysdig-inspect-react .

# Run the container
docker run -p 80:80 sysdig-inspect-react
```

## Integration with Electron

The React frontend is designed to work with the existing Electron application. The Electron main process and backend server remain unchanged, while the frontend is replaced with this React implementation.

## License

This project is licensed under the GNU General Public License - see the LICENSE file for details.

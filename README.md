# Django Blog Frontend

Frontend application for the Django Blog project.

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Axios

## Setup

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173/
```

## Build

Create production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Backend API

The frontend connects to the Django backend API.

Backend:

```text
http://127.0.0.1:8000/
```

Example API:

```text
http://127.0.0.1:8000/api/
```

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── index.html
```

## Production Build

```bash
npm install
npm run build
```

The production files are generated inside:

```text
dist/
```

## License

This project is for learning and development purposes.

# ONDC Seller App

A modern seller application for the Open Network for Digital Commerce (ONDC) platform with AI-powered catalog management capabilities.

## Features

- Product catalog management
- AI-powered product descriptions and categorization
- ONDC network integration
- Real-time analytics
- User-friendly interface

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **AI Integration**: OpenAI API
- **Authentication**: JWT

## Project Structure

```
ondc-seller-app/
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
├── docs/             # Documentation
└── docker/           # Docker configuration files
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn
- OpenAI API key

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the variables with your configuration

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

## API Documentation

API documentation is available at `/api-docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

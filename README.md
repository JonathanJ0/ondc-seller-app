# ONDC Seller App

A modern seller application for the Open Network for Digital Commerce (ONDC) platform with AI-powered catalog management capabilities and full ONDC network integration.

## Features

- **Product Catalog Management**: Add, edit, and manage product listings with AI-powered descriptions
- **ONDC Network Integration**: Full compliance with ONDC protocol for search, select, init, confirm, and track operations
- **AI-Powered Features**: 
  - Automatic product categorization
  - Image captioning and analysis
  - Smart product descriptions
- **Order Management**: Complete order lifecycle management from selection to fulfillment
- **Rating System**: Customer rating and feedback management
- **Real-time Analytics**: Dashboard with sales and performance metrics
- **User Authentication**: Secure JWT-based authentication system
- **Responsive UI**: Modern, user-friendly interface built with React and Material-UI

## ONDC Integration

This application implements the complete ONDC seller workflow:

- **Search**: Handle product search requests from buyers
- **Select**: Validate product availability and pricing
- **Init**: Create and initialize orders
- **Confirm**: Confirm orders and update inventory
- **Track**: Provide order status updates
- **Cancel**: Handle order cancellations
- **Rating**: Process customer ratings and feedback
- **Support**: Handle customer support requests

## Tech Stack

- **Frontend**: React.js with TypeScript, Material-UI
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **AI Integration**: OpenAI API, Python modules for image processing
- **Authentication**: JWT tokens
- **File Upload**: Multer for image handling
- **Validation**: Express-validator for request validation

## Project Structure

```
ondc-seller-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── store/          # Redux store and slices
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── backend/                 # Node.js backend server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── config/         # Configuration files
│   │   ├── python_module/  # Python AI modules
│   │   └── utils/          # Utility functions
│   └── uploads/            # File upload directory
├── docs/                   # Documentation
└── docker/                 # Docker configuration files
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- Python 3.8+ (for AI modules)
- npm or yarn
- OpenAI API key

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ondc-seller-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

Create `.env` files in both backend and frontend directories:

**Backend (.env):**
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/ondc_seller_db
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=development
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Database Setup

```bash
# Create PostgreSQL database
createdb ondc_seller_db

# Run migrations (if using Sequelize CLI)
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 5. Start Development Servers

```bash
# Start backend server (from backend directory)
cd backend
npm run dev

# Start frontend server (from frontend directory)
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### ONDC Endpoints
- `POST /api/ondc/search` - Handle ONDC search requests
- `POST /api/ondc/select` - Handle ONDC select requests
- `POST /api/ondc/init` - Handle ONDC init requests
- `POST /api/ondc/confirm` - Handle ONDC confirm requests
- `POST /api/ondc/update` - Handle ONDC update requests
- `POST /api/ondc/cancel` - Handle ONDC cancel requests
- `POST /api/ondc/status` - Handle ONDC status requests
- `POST /api/ondc/rating` - Handle ONDC rating requests
- `POST /api/ondc/support` - Handle ONDC support requests

## ONDC Integration Guide

For detailed information about ONDC integration, see the [ONDC Integration Guide](docs/ONDC_Integration_Guide.md).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions about ONDC integration, please refer to the [ONDC Understanding Document](docs/ONDC_Understanding_Document.markdown).

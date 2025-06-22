## ✨ Features

### 🛍️ Customer Features
- **Modern UI/UX** - Glassmorphism design with neon accents and smooth animations
- **Product Browsing** - View all products with advanced filtering and search
- **Shopping Cart** - Add/remove items with real-time updates
- **User Authentication** - Secure login and registration with JWT tokens
- **Order Management** - Track your orders and order history
- **Responsive Design** - Seamless experience across all devices

### 👨‍💼 Admin Features
- **Product Management** - Full CRUD operations for products
- **Category Management** - Create, edit, and delete product categories
- **Order Management** - View and manage customer orders
- **User Management** - Manage user accounts and permissions
- **Analytics Dashboard** - View sales and user statistics

### 🛠️ Technical Features
- **Real-time Updates** - Using React Query for data synchronization
- **Type Safety** - Full TypeScript support throughout the application
- **API Documentation** - Auto-generated Swagger/OpenAPI docs
- **Database Migrations** - Version-controlled database schema
- **Authentication** - JWT-based secure authentication
- **State Management** - Zustand for efficient state management

## 🏗️ Project Structure

```
resume/
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── lib/           # API client and utilities
│   │   └── hooks/         # Custom React hooks
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
└── backend/               # FastAPI backend
    ├── app/
    │   ├── api/           # API endpoints
    │   ├── core/          # Core functionality (security, config)
    │   ├── models/        # SQLAlchemy models
    │   ├── schemas/       # Pydantic schemas
    │   └── routers/       # API routers
    ├── scripts/           # Utility scripts
    ├── alembic/           # Database migrations
    └── requirements.txt   # Backend dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.10 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)

### 🔧 Installation

1. **Clone the repository**
   ```bash
   [git clone https://github.com/yourusername/shopswift.git](https://github.com/Kashif1Naqvi/eCommerce-website.git)
   cd eCommerce-website
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your settings
   
   # Initialize database
   python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"
   
   # Create admin user
   python scripts/create_admin.py
   # Default credentials:
   # Email: admin@example.com
   # Password: admin123
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   # or
   yarn install
   
   # Create .env file
   cp .env.example .env
   # Edit .env if needed (default should work)
   ```

### 🏃‍♂️ Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at: http://localhost:8000
   
   API Documentation: http://localhost:8000/docs

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at: http://localhost:5173

## 🧪 Testing

### Default Users

1. **Admin User**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Access: Full admin privileges

2. **Regular User**
   - Create a new account via the registration page
   - Or use the API to create test users

### API Testing

You can test the API endpoints using:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Postman**: Import the OpenAPI schema from http://localhost:8000/openapi.json

## 📱 Usage Guide

### For Customers

1. **Browse Products**
   - Visit the home page to see featured products
   - Click "Products" to view all available items
   - Use search and filters to find specific products

2. **Shopping**
   - Click on a product to view details
   - Add items to cart
   - Proceed to checkout when ready
   - Track your orders in the "Orders" section

### For Administrators

1. **Access Admin Features**
   - Login with admin credentials
   - Admin options appear in the navigation menu

2. **Manage Products**
   - Click "Manage Products" from the user menu
   - Add new products with the "Add Product" button
   - Edit or delete existing products

3. **Manage Categories**
   - Access "Manage Categories" from the user menu
   - Create, edit, or delete product categories
   - Categories must be empty before deletion

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
# Database
DATABASE_URL=sqlite:///./sql_app.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_UPLOAD_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp
```

**Frontend (.env)**
```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# App Configuration
VITE_APP_NAME=ShopSwift
VITE_APP_DESCRIPTION=The future of online shopping
```

## 🚀 Deployment

### Backend Deployment (Example with Railway/Render)

1. Update `requirements.txt` with production dependencies
2. Set environment variables in your hosting platform
3. Update `DATABASE_URL` to use PostgreSQL for production
4. Deploy using platform-specific CLI or Git integration

### Frontend Deployment (Example with Vercel/Netlify)

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting platform
3. Set environment variables in the platform dashboard
4. Configure redirects for client-side routing

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **React Query (TanStack Query)** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **React Toastify** - Toast notifications

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation
- **SQLite** (Development) / **PostgreSQL** (Production)
- **JWT** - Authentication tokens
- **Uvicorn** - ASGI server
- **Alembic** - Database migrations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspired by modern glassmorphism and cyberpunk aesthetics
- Icons from [Lucide](https://lucide.dev/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For support, email support@shopswift.com or open an issue in the GitHub repository.

---

<div align="center">
  <p>Built with ❤️ by [Your Name]</p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>

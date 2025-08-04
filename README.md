# Wanderlust - Travel Listings Platform

A full-stack web application for sharing and discovering travel destinations, built with Node.js, Express, MongoDB, and EJS templating.

## 🌟 Features

### Core Functionality
- **Travel Listings**: Create, view, edit, and delete travel destination listings
- **User Authentication**: Secure login/signup system with Passport.js
- **Reviews & Ratings**: Users can leave reviews and ratings for listings
- **Image Upload**: Cloudinary integration for image storage and management
- **Responsive Design**: Modern, mobile-friendly UI

### User Management
- User registration and authentication
- Session management with MongoDB store
- Authorization middleware for listing ownership
- Flash messages for user feedback

### Listing Management
- CRUD operations for travel listings
- Image upload with Cloudinary integration
- Search and filter capabilities
- Owner-based authorization

### Review System
- Add reviews with ratings (1-5 stars)
- Edit and delete reviews
- Author-based authorization
- Cascading deletion (reviews deleted when listing is deleted)

## 🛠️ Technology Stack

### Backend
- **Node.js** (v22.14.0) - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage
- **Joi** - Data validation

### Frontend
- **EJS** - Template engine
- **EJS-Mate** - Layout engine
- **CSS3** - Styling with custom rating system
- **JavaScript** - Client-side functionality

### Additional Libraries
- **connect-flash** - Flash messages
- **connect-mongo** - Session storage
- **method-override** - HTTP method override
- **dotenv** - Environment variable management

## 📁 Project Structure

```
wanderlust/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── middleware.js          # Custom middleware functions
├── schema.js             # Joi validation schemas
├── cloudConfig.js        # Cloudinary configuration
├── .gitignore           # Git ignore file
├── models/              # Database models
│   ├── listing.js       # Listing model
│   ├── review.js        # Review model
│   └── user.js          # User model
├── controllers/         # Route controllers
│   ├── listing.js       # Listing CRUD operations
│   ├── review.js        # Review operations
│   └── user.js          # User authentication
├── routes/              # Express routes
│   ├── listing.js       # Listing routes
│   ├── review.js        # Review routes
│   └── user.js          # User routes
├── views/               # EJS templates
│   ├── layouts/         # Layout templates
│   ├── includes/        # Partial templates
│   ├── listings/        # Listing views
│   ├── users/           # User views
│   └── error.ejs        # Error page
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   └── js/             # JavaScript files
├── utils/               # Utility functions
│   ├── ExpressError.js  # Custom error class
│   └── wrapasync.js     # Async wrapper
└── init/                # Initialization files
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v22.14.0 or higher)
- MongoDB database (local or Atlas)
- Cloudinary account for image storage

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wanderlust
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   ATLASDB_URL=your_mongodb_connection_string
   SECRET=your_session_secret
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   PORT=8080
   ```

4. **Start the application**
   ```bash
   node app.js
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:8080`

## 🔧 Configuration

### Database Configuration
- MongoDB Atlas connection string in `ATLASDB_URL`
- Session storage using MongoDB store
- Mongoose connection with error handling

### Cloudinary Setup
- Cloud name, API key, and secret required
- Image storage in 'wanderlust_DEV' folder
- Supported formats: PNG, JPG, JPEG

### Session Configuration
- 7-day session duration
- MongoDB-based session store
- Secure HTTP-only cookies

## 📋 API Endpoints

### Authentication Routes
- `GET /login` - Login page
- `POST /login` - User login
- `GET /signup` - Registration page
- `POST /signup` - User registration
- `GET /logout` - User logout

### Listing Routes
- `GET /listings` - View all listings
- `GET /listings/new` - Create new listing form
- `POST /listings` - Create new listing
- `GET /listings/:id` - View specific listing
- `GET /listings/:id/edit` - Edit listing form
- `PUT /listings/:id` - Update listing
- `DELETE /listings/:id` - Delete listing

### Review Routes
- `POST /listings/:id/reviews` - Add review
- `DELETE /listings/:id/reviews/:reviewId` - Delete review

## 🔐 Security Features

### Authentication & Authorization
- Passport.js local strategy
- Session-based authentication
- Owner-based authorization for listings
- Author-based authorization for reviews

### Data Validation
- Joi schema validation for listings and reviews
- Server-side validation for all user inputs
- Error handling with custom ExpressError class

### File Upload Security
- Cloudinary integration for secure image storage
- File type validation (PNG, JPG, JPEG)
- Automatic cleanup of deleted images

## 🎨 User Interface

### Design Features
- Responsive design for mobile and desktop
- Custom star rating system
- Flash message notifications
- Clean and intuitive navigation

### Key Pages
- **Home/Index**: Display all travel listings
- **Listing Details**: Show individual listing with reviews
- **Create/Edit Forms**: User-friendly forms with validation
- **User Authentication**: Login and registration pages

## 🐛 Error Handling

### Global Error Handling
- Uncaught exception handling
- Unhandled promise rejection handling
- Custom ExpressError class for HTTP errors
- User-friendly error messages

### Validation Errors
- Joi schema validation with detailed error messages
- Flash message integration for user feedback
- Graceful error recovery

## 🔄 Development Workflow

### Code Organization
- MVC architecture pattern
- Separation of concerns
- Modular routing and controllers
- Reusable middleware functions

### Database Relationships
- User → Listings (one-to-many)
- Listing → Reviews (one-to-many)
- User → Reviews (one-to-many)
- Cascading deletes for data integrity

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ATLASDB_URL` | MongoDB connection string | Yes |
| `SECRET` | Session secret key | Yes |
| `CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUD_API_KEY` | Cloudinary API key | Yes |
| `CLOUD_API_SECRET` | Cloudinary API secret | Yes |
| `PORT` | Server port (default: 8080) | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Built with ❤️ using Node.js and Express

## 🙏 Acknowledgments

- Express.js community
- MongoDB Atlas for database hosting
- Cloudinary for image storage
- Passport.js for authentication

---

**Note**: This is a travel listings platform where users can share their travel experiences, discover new destinations, and connect with other travelers through reviews and ratings. 
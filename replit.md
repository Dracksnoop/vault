# Raydify Vault - Inventory Management System

## Overview

This is a full-stack inventory management application called "Raydify Vault" built with React (frontend) and Express.js (backend). The application provides a comprehensive dashboard for managing inventory, customers, users, and various business operations with a modern, responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.
UI Design: Minimal white theme with slim black borders throughout the application.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with native MongoDB driver
- **Database Provider**: MongoDB Atlas (cloud-hosted)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage (legacy)
- **API Structure**: RESTful API with `/api` prefix
- **Development**: Hot module replacement via Vite integration

## Key Components

### Frontend Components
- **Layout System**: Responsive layout with sidebar navigation and header
- **UI Library**: Comprehensive component library based on Radix UI
- **Navigation**: Multi-page application with routes for:
  - Home (dashboard)
  - Inventory management
  - Customer management
  - Demo features
  - Call/Service management
  - Trade operations
  - User management
  - Profile settings
  - Support system

### Backend Components
- **Storage Interface**: Abstracted storage layer with in-memory fallback
- **Route Registration**: Modular route system for API endpoints
- **Database Schema**: User management with extensible schema design
- **Error Handling**: Centralized error handling middleware

## Data Flow

### Database Schema
- **Users Collection**: Basic user management with username/password authentication
- **Inventory Collection**: Product inventory with SKU, quantity, price, category
- **Customers Collection**: Customer management with contact information
- **Schema Validation**: Zod schemas for type-safe data validation
- **Storage Interface**: Abstracted storage layer supporting both MongoDB and in-memory fallback

### API Communication
- **HTTP Client**: Custom fetch wrapper with error handling
- **Query Management**: React Query for caching and synchronization
- **Session Handling**: Cookie-based session management

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL (configured for Neon Database)
- **UI Framework**: Radix UI components for accessible interfaces
- **Styling**: Tailwind CSS for utility-first styling
- **Date Handling**: date-fns for date manipulation
- **Form Handling**: React Hook Form with Zod validation

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **Drizzle Kit**: Database schema management and migrations
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Build Process
- **Frontend**: Vite build process outputs to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: `NODE_ENV=development` with hot reloading
- **Production**: `NODE_ENV=production` with optimized builds
- **Database**: `DATABASE_URL` environment variable for connection

### Production Deployment
- **Server**: Node.js server serving both API and static files
- **Database**: PostgreSQL database with connection pooling
- **Static Assets**: Frontend assets served from `dist/public`

### Key Design Decisions

1. **Monorepo Structure**: Shared types and utilities in `/shared` directory
2. **Database Choice**: PostgreSQL with Drizzle ORM for type safety and migration management
3. **UI System**: Radix UI + Tailwind for consistent, accessible design
4. **State Management**: React Query for server state, local state for UI
5. **Authentication**: Session-based authentication with PostgreSQL storage
6. **Development Experience**: Vite integration for fast development cycles

The application follows a clean architecture pattern with clear separation between frontend, backend, and shared concerns, making it maintainable and scalable for inventory management needs.

## Recent Changes

- **July 13, 2025**: Updated entire UI to minimal white theme with slim black borders
  - Removed navy blue header background, now uses white with black borders
  - Updated sidebar to white background with black borders
  - Changed all page components to use white backgrounds with black borders
  - Updated navigation active states to use light gray with black left border
  - Maintained clean, minimal aesthetic throughout the application

- **July 13, 2025**: Integrated MongoDB database support
  - Added MongoDB connection using native MongoDB driver
  - Created comprehensive storage interface supporting both MongoDB and in-memory fallback
  - Extended data schema to include Inventory and Customer collections
  - Implemented full CRUD API endpoints for inventory and customer management
  - Added dashboard statistics endpoint for real-time metrics
  - Connected to MongoDB Atlas cloud database with proper error handling

- **July 13, 2025**: Implemented admin panel with authentication system
  - Created admin panel for user management with minimal white theme
  - Implemented admin-controlled user creation system (no signup)
  - Added authentication endpoints with token-based session management
  - Created login system with provided credentials access
  - Updated UI components to support authenticated user sessions
  - Added user dropdown menu with logout functionality
  - Integrated authentication state management throughout the application

- **July 13, 2025**: Created separate admin dashboard interface
  - Built dedicated admin dashboard separate from inventory management app
  - Implemented admin-specific routing (admin users redirect to admin dashboard)
  - Created tabbed interface with Overview, User Management, and Settings
  - Added system statistics and monitoring for admin users
  - Removed admin menu item from regular user navigation
  - Maintained consistent minimal white theme across admin interface

- **July 13, 2025**: Built comprehensive Inventory Section UI
  - Created two-panel layout with category sidebar and item details
  - Implemented dynamic category management with "Add New Category" functionality
  - Built searchable item listing with stock tracking (In Stock, Rented, Available)
  - Added detailed unit tracking with serial numbers, barcodes, and status management
  - Created modal dialogs for adding categories, items, and individual units
  - Implemented status badges with color coding and icons (In Stock, Rented, Maintenance, Retired)
  - Added search functionality for both items and units
  - Implemented automatic serial number generation when creating items with quantities
  - Added dynamic QR code generation for each unit with download functionality
  - QR codes encode unique URLs (https://raydifyvault.com/unit/{serialNumber}) for live unit tracking
  - Maintained minimal white theme with slim black borders throughout
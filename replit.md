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
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
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
- **Users Table**: Basic user management with username/password authentication
- **Schema Validation**: Zod schemas for type-safe data validation
- **Migration System**: Drizzle migrations for database schema changes

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
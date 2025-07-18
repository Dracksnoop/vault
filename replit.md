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

- **July 14, 2025**: Implemented enhanced inventory status management system
  - Added 'Available'/'Rented' status field to units table for clear inventory tracking
  - Added 'currentCustomerId' field to track which customer has rented each unit
  - Created 'Available' status for units ready for rental
  - Created 'Rented' status for units currently assigned to customers
  - Updated all rental creation logic to assign units to specific customers
  - Added API endpoints for returning units to available status
  - Updated frontend unit filtering to show only truly available units for selection
  - Implemented customer-specific unit tracking to prevent double assignments
  - Added cleanup functionality to fix existing duplicate rental assignments
  - All new units default to 'Available' status when created
  - System now enforces unit uniqueness across all customer rentals

- **July 13, 2025**: Built comprehensive Inventory Section UI
- **July 13, 2025**: Fixed MongoDB Atlas integration and authentication system
  - Resolved API request method issues in queryClient.ts
  - Created default inventory categories in database
  - Fixed authentication token handling and session management
  - Verified login credentials: username "krish" with password "krish123"
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

- **July 13, 2025**: Implemented comprehensive multi-step Customer Management system
  - Extended database schema with new collections: services, serviceItems, rentals
  - Created full CRUD API endpoints for customer management workflow
  - Built 5-step customer management process with progress tracking
  - Step 1: Customer Details (personal/company info, addresses, payment terms)
  - Step 2: Service Selection (rent, sell, maintenance, others)
  - Step 3: Item Selection (inventory browsing, quantity/pricing)
  - Step 4: Rental Terms (dates, payment frequency, rates) - conditional on service type
  - Step 5: Review & Confirm (comprehensive summary before submission)
  - Implemented form validation and step-by-step navigation
  - Added progress bar and visual step indicators
  - Created comprehensive API endpoint for complete customer record creation
  - Integrated with existing inventory system for item selection
  - Added new navigation item "Customer Management" to sidebar
  - Maintained minimal white theme with black borders throughout all forms

- **July 14, 2025**: Fixed critical inventory synchronization and customer deletion issues
  - Resolved inventory sync problem where units remained "Rented" after customer deletion
  - Updated customer deletion logic to properly return all rented units to "Available" status
  - Fixed status value inconsistencies between frontend ("In Stock") and backend ("Available")
  - Successfully updated all 622 units to use consistent "Available" status throughout system
  - Created API endpoints for fixing data inconsistencies and orphaned rental records
  - Implemented cleanup logic to clear rental assignment fields for Available units
  - Added orphaned rental detection and correction for units with invalid customer assignments
  - Fixed dashboard statistics to use correct "Available" and "Rented" status values
  - Ensured complete data consistency across all inventory management operations

- **July 14, 2025**: Implemented customer authentication system for QR scan dashboard
  - Extended authentication to support both system users and customers
  - Customers can now login using their name/email as username and phone as password
  - Added helpful login instructions and improved user interface
  - Created test customers "John Doe" and "Sarah Wilson" for demonstration
  - Fixed JSON parsing errors in authentication API requests
  - Added proper token storage and management for secure sessions
  - Updated user interface to distinguish between customer and system user access levels

- **July 14, 2025**: Fixed real-time inventory updates in customer management system
  - Resolved issue where rented units remained visible for selection after customer creation
  - Added comprehensive cache invalidation for all relevant data (units, items, services, rentals)
  - Implemented immediate UI refresh after successful customer creation
  - Units now correctly show as "Rented" in real-time without requiring page refresh
  - Enhanced inventory synchronization across all customer management workflows
  - Improved user experience with instant feedback on unit availability changes

- **July 14, 2025**: Enhanced customer creation workflow with success confirmation
  - Added dedicated success confirmation screen after customer creation
  - Implemented loading states during customer submission process
  - Success message displays only after successful customer creation and data processing
  - Added comprehensive customer details display in confirmation screen
  - Created "Create Another Customer" functionality for streamlined workflow
  - Removed progress steps from success screen for cleaner UI
  - Enhanced user experience with clear completion feedback and next action options

- **July 14, 2025**: Implemented custom VAULT loading UI for customer creation
  - Created VaultLoader component with animated "VAULT" branding
  - Added smooth letter-by-letter animation for company name display
  - Implemented pulsing dots, progress bar, and border animations
  - Full-screen overlay with backdrop blur for professional appearance
  - Displays during 2-3 second customer creation process
  - Maintains all existing functionality while enhancing user experience
  - Uses framer-motion for smooth animations and transitions

- **July 14, 2025**: Implemented global navigation system with VAULT loader
  - Created NavigationContext for managing navigation states across the app
  - Added VaultLoader to all navigation transitions between pages
  - Updated sidebar navigation to use loading states with custom messages
  - Implemented comprehensive cache invalidation on route changes
  - Enhanced user experience with smooth transitions and data refresh
  - Navigation now shows "Loading [Page Name]..." during transitions
  - Ensures all backend changes are saved before navigation
  - Applied consistent VAULT branding across all loading states

- **July 14, 2025**: Implemented comprehensive global search functionality
  - Added GlobalSearch component with advanced search capabilities across all application data
  - Integrated search bar in header with minimal white theme and black borders
  - Implemented real-time search across items, customers, units, services, and rentals
  - Added keyboard shortcuts (Cmd+K/Ctrl+K) for quick search access
  - Created responsive design supporting both desktop and mobile layouts
  - Implemented keyboard navigation (arrow keys, Enter, Escape) for search results
  - Added intelligent search result categorization with color-coded icons
  - Integrated direct navigation to relevant pages from search results
  - Enhanced user experience with loading states and result count indicators
  - Maintained consistent design language throughout search interface

- **July 15, 2025**: Enhanced Rental Timeline with comprehensive state snapshots
  - Redesigned timeline to show complete rental state snapshots at each point in time
  - Implemented chronological boxes connected by vertical timeline line with dots
  - Each timeline entry now shows complete rental state including all items and quantities
  - Added detailed item breakdown within each snapshot showing unit prices and total values
  - Enhanced visual design with better spacing, date formatting, and snapshot presentation
  - Updated timeline creation logic to store complete rental state for all modifications
  - Timeline entries now include full item names, unit prices, quantities, and individual unit details
  - Improved data structure to support both legacy and new snapshot formats
  - Enhanced user experience with scrollable timeline showing full rental evolution
  - Maintained existing functionality while adding comprehensive state tracking

- **July 18, 2025**: Implemented comprehensive Replacements management system
  - Added "Replacements" menu item to sidebar navigation with RotateCcw icon
  - Created comprehensive replacement dashboard for tracking warranty claims, damaged items, and defective units
  - Implemented three-tab interface: Overview, Replacement Requests, and Reports
  - Added statistics tracking: total replacements, pending requests, completed replacements, warranty claims
  - Built cost analysis section showing total replacement costs, warranty coverage, and out-of-pocket expenses
  - Created performance metrics display with average processing time and success rates
  - Implemented searchable replacement requests with filtering by status and reason
  - Added detailed replacement record cards with status badges, reason indicators, and action buttons
  - Integrated replacement reasons: warranty, damage, expired, defective, and other
  - Built replacement status tracking: pending, approved, completed, and rejected
  - Added vendor information tracking and customer assignment for each replacement
  - Created reports section for generating detailed analytics and cost reports
  - Maintained minimal white theme with black borders throughout replacement interface
  - Designed system to handle warranty replacements, damage claims, and expired inventory management
  - All replacement functionality built without affecting existing database or application functionality
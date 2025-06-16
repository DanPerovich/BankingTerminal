# ATM System - Full Stack Application

## Overview

This is a full-stack ATM (Automated Teller Machine) simulation application built with React frontend and Express.js backend. The application provides a realistic ATM interface for account balance inquiries and transaction processing (credits and debits). It features a modern UI with dark/light theme support, real-time API monitoring, and configurable external API integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Theme System**: Professional theme with system/light/dark mode support
- **Animation**: Framer Motion for smooth animations and loading states

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured but not yet implemented)
- **Development Server**: Custom Vite integration for seamless development
- **Session Management**: Prepared for connect-pg-simple sessions
- **API Design**: RESTful API structure with /api prefix

## Key Components

### Frontend Components
1. **ATM Interface** (`client/src/pages/ATM.tsx`)
   - Main application interface simulating an ATM machine
   - Account selection and balance display
   - Transaction processing (credit/debit operations)
   - Real-time balance updates

2. **UI Components** (`client/src/components/ui/`)
   - Complete shadcn/ui component library
   - Professional theme implementation
   - Accessible and responsive design

3. **ATM-Specific Components** (`client/src/components/atm/`)
   - `Display`: ATM screen simulation with balance and messages
   - `Keypad`: Numeric input interface
   - `ConfigPanel`: API configuration interface
   - `DevConsole`: Developer tools for API monitoring
   - `Confetti`: Success animation effects

### Backend Structure
1. **Server Entry** (`server/index.ts`)
   - Express application setup
   - Request logging middleware
   - Error handling

2. **Storage Interface** (`server/storage.ts`)
   - Abstract storage interface for future database integration
   - In-memory storage implementation for development
   - User management methods (prepared for future use)

3. **Route Registration** (`server/routes.ts`)
   - Centralized route management
   - HTTP server creation

## Data Flow

1. **User Interaction**: User interacts with ATM interface
2. **API Configuration**: User configures external API endpoint and authentication
3. **Transaction Processing**: 
   - Frontend sends requests to external API (WireMock service)
   - API responses update the application state
   - Real-time balance updates reflect transaction results
4. **Developer Monitoring**: DevConsole tracks all API requests/responses
5. **State Management**: React Query manages server state and caching

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **axios**: HTTP client for API requests
- **framer-motion**: Animation library

### Development Dependencies
- **TypeScript**: Type safety across the application
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### External API Integration
- **WireMock Cloud**: External API service for stateful mocking
- Configurable base URL and authentication token
- RESTful endpoints for account balance and transactions

## Deployment Strategy

### Platform
- **Primary**: Google Cloud Run (configured in .replit)
- **Development**: Replit environment with Node.js 20

### Build Process
1. **Frontend**: Vite builds React application to `dist/public`
2. **Backend**: ESBuild bundles Node.js server to `dist/index.js`
3. **Database**: Drizzle migrations ready for PostgreSQL deployment

### Environment
- **Port**: 5000 (development), 80 (production)
- **Database**: PostgreSQL 16 (configured via DATABASE_URL)
- **Node Version**: 20.x LTS

## Recent Changes
- June 16, 2025: Enhanced HTTP/HTTPS endpoint configuration support
  - Added protocol selection (HTTP/HTTPS) in configuration panel with radio buttons
  - Implemented URL validation with visual feedback and error indicators
  - Enhanced security indicators for protocol selection
  - Added comprehensive mixed content security warning for HTTP endpoints
  - Provided HTTP access link solution for testing HTTP APIs
  - Fixed dialog width to properly accommodate form fields
  - Added detailed error handling for mixed content security restrictions
  - Implemented debug logging for endpoint configuration troubleshooting
- June 16, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
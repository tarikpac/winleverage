# replit.md

## Overview

This is a client-side single-page application (SPA) built to simulate leverage trading on the Brazilian B3 Mini Index (WIN). The application allows users to configure trading parameters and compare three different trading scenarios (S1, S2, S3) with varying levels of aggressiveness. Users can visualize results through charts and tables, and export data to CSV/XLSX formats.

The application simulates trading sessions (morning and afternoon) across business days, calculating contract quantities based on available capital and risk parameters, then projecting profits based on target points per session.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 14, 2025)

- Fixed date bug: Corrected date parsing to properly start from selected date (e.g., 14/08 now correctly starts on 14/08)
- Fixed card sizing: Made cards responsive with flexible text sizing to accommodate larger values
- Added dark mode: Implemented complete dark mode with toggle button and theme persistence
- Made header date dynamic: Shows current date that updates daily
- Fixed datepicker: Now properly anchored to input field with collision detection
- Removed date restrictions: Users can now select future dates for simulations
- Improved table layout: Fixed width issues and background coverage
- Added separate toggle buttons: Morning and afternoon sessions can be toggled independently
- Enhanced desktop layout: Removed unnecessary scrollbars, increased container width to 1440px

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, professional UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Custom React hooks with localStorage persistence for simulator state
- **Data Fetching**: TanStack Query (React Query) for server state management (prepared but not actively used)

### Component Structure
- **shadcn/ui Components**: Comprehensive set of accessible UI components (buttons, forms, tables, charts, dialogs, etc.)
- **Custom Hooks**: `useSimulator` for business logic and state management, `useMobile` for responsive design
- **Pages**: Single home page with tabbed interface for parameters, results, and visualizations

### Business Logic
- **Scenario Simulation**: Three trading strategies with different afternoon session contract calculations
  - S1 (Base): 1 session per day
  - S2 (Moderate): Afternoon uses 50% of next day's calculated contracts
  - S3 (Aggressive): Afternoon uses 100% of next day's calculated contracts
- **Risk Management**: Contract calculation based on available capital and risk per contract
- **Business Days**: Automatic calculation of trading days excluding weekends

### Data Visualization
- **Charts**: Chart.js integration for capital evolution visualization
- **Tables**: Detailed day-by-day breakdown of trading results
- **Export Functions**: CSV export using URL.createObjectURL and XLSX export using SheetJS

### State Persistence
- **localStorage**: Simulator parameters and trading day configurations persist across sessions
- **Parameter Validation**: Input validation and sensible defaults for all trading parameters

### Backend Architecture
- **Express.js**: Node.js server setup with TypeScript
- **Database Ready**: Drizzle ORM configured for PostgreSQL with user schema (prepared for future authentication)
- **API Structure**: RESTful API endpoints prepared but currently unused (client-side only application)
- **Development Tools**: Vite integration for hot module replacement and development server

## External Dependencies

### Core Libraries
- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **TypeScript**: Full TypeScript support across client and server
- **Vite**: Build tool and development server with React plugin

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Headless UI components for accessibility and customization
- **Class Variance Authority**: Utility for managing component variants
- **Lucide React**: Icon library for consistent iconography

### Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation library

### Visualization and Export
- **Chart.js**: Canvas-based charting library for data visualization
- **SheetJS (XLSX)**: Excel file generation for data export
- **Date-fns**: Date manipulation and formatting utilities

### Database (Prepared)
- **Drizzle ORM**: TypeScript ORM for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database provider
- **PostgreSQL**: Relational database for user management and data persistence

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **Replit Integration**: Development environment optimizations and error handling

The application is currently configured as a client-side only solution but has the infrastructure ready for backend integration when user authentication and data persistence become requirements.
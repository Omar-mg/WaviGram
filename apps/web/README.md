# WaviGram Web Frontend

This is the React/TypeScript frontend for the WaviGram social networking platform.

## Overview

The web application is built with:
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Client-side routing
- **React Hook Form + Zod** - Form handling and validation
- **Lucide Icons** - Icon set
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Sonner** - Toast notifications
- **Framer Motion** - Animations

## Features Implemented

### Authentication
- Login page with form validation (React Hook Form + Zod)
- Registration page with comprehensive validation
- Persistent authentication state using Zustand middleware
- Protected routes and guest-only route guards
- Environment variable validation on startup

### UI/UX Components
- Responsive header with theme toggle (dark/light mode)
- Collapsible sidebar navigation for dashboard
- Footer with site links
- Toast notification system (Sonner)
- Loading skeletons for better UX
- Error boundaries for graceful error handling
- Stats cards, quick actions, and activity feed components
- Form inputs with validation states

### Pages
- Home/Landing page (redirects based on auth status)
- Dashboard overview with statistics
- Authentication pages (login/register)
- Not found page (404)
- Placeholder pages for various features (messages, friends, posts, etc.)

### Technical Features
- Environment variable validation
- SEO helper component
- Analytics hook (placeholder for integration)
- Responsive design with mobile-first approach
- Dark mode support
- Accessible components
- Code organization following best practices
- Type-safe development with comprehensive tooling

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer, Sidebar)
│   ├── ui/             # Reusable UI primitives (buttons, inputs, etc.)
│   │   ├── skeleton-loader.tsx   # Skeleton loading states
│   │   ├── toast-container.tsx   # Toast notification container
│   │   └── error-boundary.tsx    # Error boundary component
│   └── seo.tsx         # SEO helper component
├── layouts/            # Page layout wrappers
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard and home pages
│   └── NotFoundPage.tsx # 404 page
├── routes/             # Route definitions
├── store/              # Zustand stores
│   └── auth.ts         # Authentication store
├── styles/             # CSS and Tailwind configuration
│   ├── sonner-theme.ts # Custom theme for toast notifications
│   └── index.css       # Tailwind CSS base styles
├── lib/                # Utility functions
│   └── env.ts          # Environment variable validation
├── hooks/              # Custom React hooks
│   ├── use-toast.ts    # Toast notification hook
│   └── use-analytics.ts # Analytics hook (placeholder)
├── services/           # API service layers
├── contexts/           # React context providers
└── assets/             # Static assets (images, icons, etc.)
```

## Getting Started

### Prerequisites
- Node.js 20+ 
- pnpm 9+

### Installation & Development

```bash
# From the WaviGram root directory
pnpm install          # Install all workspace dependencies
pnpm dev              # Start the development server
```

### Access the Application
- **Frontend**: http://localhost:5173
- The app will automatically redirect to login/register if not authenticated
- After login, you'll see the dashboard with mock data

### Environment Variables

Create a `.env` file in the `apps/web` directory with:

```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
# Optional: OAuth providers
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_APPLE_CLIENT_ID=your_apple_client_id_here
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm serve` - Preview production build
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Design System

The application follows the WaviGram design system with:
- Dark mode first approach
- Custom color palette (primary, secondary, accent, etc.)
- Consistent spacing and typography
- Accessible components
- Responsive breakpoints

## Key Enhancements

1. **Toast Notifications** - Using Sonner for beautiful, accessible toast messages
2. **Error Boundaries** - Graceful error handling with fallback UI
3. **Loading Skeletons** - Improved UX with skeleton loaders during data fetching
4. **Environment Validation** - Ensures required variables are present at startup
5. **SEO Helper** - Easy management of meta tags for better search visibility
6. **Analytics Hook** - Foundation for integrating analytics services
7. **Custom Hooks** - Encapsulated logic for toast notifications and analytics
8. **Responsive Design** - Mobile-first approach with adaptive layouts

## Next Steps

To complete the application, the following components need to be implemented:

1. **Backend API Integration** - Connect to actual endpoints
2. **Real-time Features** - Implement Socket.io connections
3. **Additional Pages** - Messages, profiles, settings, etc.
4. **Advanced Components** - Media uploaders, rich text editors, etc.
5. **Testing** - Unit and integration tests
6. **Performance Optimization** - Code splitting, lazy loading, etc.
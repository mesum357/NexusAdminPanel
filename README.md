# Pak Nexus Admin Panel

This is the separate admin panel for the Pak Nexus platform, designed to manage entities, payments, and system operations.

## Features

- **Dashboard**: Overview of system statistics and quick actions
- **Pending Entities**: Review and approve/reject institutes, shops, and products
- **Payment Requests**: Manage and verify payment requests from users
- **User Management**: Control user roles and verification status

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The admin panel will run on `http://localhost:3001`

### Building for Production

```bash
npm run build
```

## Project Structure

```
admin-panel/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   └── AdminRoute.tsx # Route protection component
│   ├── hooks/
│   │   ├── use-auth.ts   # Authentication hook
│   │   └── use-toast.ts  # Toast notification hook
│   ├── lib/
│   │   ├── config.ts     # Configuration constants
│   │   └── utils.ts      # Utility functions
│   ├── pages/
│   │   ├── AdminDashboard.tsx    # Main dashboard
│   │   ├── PendingEntities.tsx   # Entity management
│   │   ├── PaymentRequests.tsx   # Payment management
│   │   └── UserManagement.tsx    # User management
│   ├── styles/
│   │   └── globals.css   # Global styles
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/                # Static assets
├── package.json           # Dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## Configuration

The admin panel connects to the backend API. Update the `API_BASE_URL` in `src/lib/config.ts` if needed:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
```

## API Endpoints

The admin panel uses the following backend endpoints:

- `GET /api/admin/stats` - System statistics
- `GET /api/admin/pending-entities` - Pending entity approvals
- `PUT /api/admin/:entityType/:id/approval` - Approve/reject entities
- `GET /api/admin/payment-requests` - Payment requests
- `PUT /api/admin/payment-request/:id/status` - Update payment status

## Authentication

The admin panel requires admin privileges. Users must have `isAdmin: true` in their user profile to access the panel.

## Development

### Adding New Components

1. Create the component in `src/components/`
2. Export it from the appropriate index file
3. Import and use in your pages

### Adding New Pages

1. Create the page component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Update navigation if needed

### Styling

- Use Tailwind CSS classes for styling
- Follow the existing component patterns
- Use the design system tokens defined in `tailwind.config.js`

## Deployment

The admin panel can be deployed independently from the main frontend and backend:

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. Ensure the backend API is accessible from the deployment URL

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change the port in `vite.config.ts` if 3001 is in use
2. **API connection**: Verify the backend is running and accessible
3. **Build errors**: Check TypeScript compilation and dependency versions

### Getting Help

- Check the console for error messages
- Verify all dependencies are installed correctly
- Ensure the backend API endpoints are working

## License

This project is part of the Pak Nexus platform.

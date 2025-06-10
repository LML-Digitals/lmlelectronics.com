# LML Electronics Store

A complete e-commerce website built with Next.js 14, TypeScript, and Square API integration.

## Features

- **Product Catalog**: Browse electronics and components with real-time inventory
- **Shopping Cart**: Add, remove, and modify items with persistent storage
- **Checkout Process**: Complete order flow with customer information collection
- **Payment Processing**: Square API integration for secure payments
- **Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui components
- **Type Safety**: Full TypeScript implementation with proper typing

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React icons
- **State Management**: Zustand for cart management
- **Payments**: Square API (Production ready)
- **Notifications**: Sonner for toast messages

## Quick Start

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd lml-electronics-store
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   # Square API Configuration
   SQUARE_ACCESS_TOKEN=your_square_access_token_here
   SQUARE_LOCATION_ID=your_square_location_id_here
   SQUARE_ENVIRONMENT=sandbox

   # Square Web Payments SDK (for frontend)
   NEXT_PUBLIC_SQUARE_APPLICATION_ID=your_square_application_id_here
   NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Square API Setup

### 1. Create Square Developer Account

- Visit [Square Developer Portal](https://developer.squareup.com/)
- Create an account and register your application
- Get your Application ID and Access Token

### 2. Required Square API Credentials

| Variable                            | Description               | Where to Find                                            |
| ----------------------------------- | ------------------------- | -------------------------------------------------------- |
| `SQUARE_ACCESS_TOKEN`               | API access token          | Square Dashboard > Applications > Your App > Credentials |
| `SQUARE_LOCATION_ID`                | Your business location ID | Square Dashboard > Locations                             |
| `SQUARE_ENVIRONMENT`                | `sandbox` or `production` | Set to `sandbox` for testing                             |
| `NEXT_PUBLIC_SQUARE_APPLICATION_ID` | Public application ID     | Square Dashboard > Applications > Your App               |

### 3. Configure Square Catalog

To use real products, you need to:

1. Add products to your Square catalog via the Square Dashboard
2. Set up product categories and variations
3. Configure inventory tracking
4. Add product images

### 4. Test vs Production

- **Sandbox**: Use for development and testing
- **Production**: Use for live transactions

⚠️ **Important**: Never commit real Square credentials to version control!

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout process
│   ├── payment/           # Payment pages
│   ├── products/          # Product catalog
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utility functions and Square integration
├── store/                 # Zustand state management
└── types/                 # TypeScript type definitions
```

## Key Features Implementation

### Shopping Cart

- Persistent cart storage using Zustand + localStorage
- Real-time price calculations with taxes and shipping
- Quantity management and item removal
- Automatic total updates

### Product Catalog

- Square Catalog API integration
- Real-time inventory checking
- Product variations support
- Image gallery with zoom functionality
- Related products recommendations

### Checkout Process

- Multi-step form validation
- Customer information collection
- Shipping address handling
- Order creation via Square Orders API

### Payment Processing

- Square Orders API for order management
- Ready for Square Web Payments SDK integration
- PCI-compliant payment handling
- Order confirmation and tracking

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Environment Variables Reference

### Required for Development

```env
SQUARE_ACCESS_TOKEN=your_sandbox_access_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=sandbox
NEXT_PUBLIC_SQUARE_APPLICATION_ID=your_app_id
NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox
```

### Production Configuration

```env
SQUARE_ACCESS_TOKEN=your_production_access_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=production
NEXT_PUBLIC_SQUARE_APPLICATION_ID=your_app_id
NEXT_PUBLIC_SQUARE_ENVIRONMENT=production
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- Ensure all environment variables are configured
- Build the project: `npm run build`
- Start the server: `npm start`

## Square Web Payments SDK Integration

For complete payment processing, integrate Square Web Payments SDK:

1. **Install SDK**

   ```bash
   npm install squareup
   ```

2. **Initialize Payment Form**

   ```javascript
   import { payments } from "@square/web-payments-sdk";

   const payments = Square.payments(applicationId, locationId);
   const card = await payments.card();
   await card.attach("#card-container");
   ```

3. **Process Payments**
   ```javascript
   const result = await card.tokenize();
   // Send token to your backend for payment processing
   ```

## API Endpoints

| Endpoint        | Method | Description            |
| --------------- | ------ | ---------------------- |
| `/api/products` | GET    | Fetch product catalog  |
| `/api/orders`   | POST   | Create new order       |
| `/api/orders`   | GET    | Retrieve order details |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m "Add feature"`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Support

For questions or issues:

- **Email**: support@lmlelectronics.com
- **Phone**: +1 (555) 123-4567
- **Documentation**: [Square Developer Docs](https://developer.squareup.com/docs)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

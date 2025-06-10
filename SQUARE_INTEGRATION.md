# Square API Integration Documentation

This document provides a comprehensive guide to the Square API integration implemented in this e-commerce store.

## Overview

The integration provides a complete e-commerce solution using Square's APIs for:

- Product catalog management
- Order processing
- Payment processing
- Customer management
- Inventory tracking
- Webhook event handling

## Architecture

```
src/
├── lib/square/           # Square API services
│   ├── client.ts         # Square client configuration
│   ├── products.ts       # Product & catalog operations
│   ├── orders.ts         # Order management
│   ├── payments.ts       # Payment processing
│   ├── customers.ts      # Customer management
│   ├── checkout.ts       # Checkout & payment links
│   ├── webhooks.ts       # Webhook event processing
│   └── index.ts          # Main exports
├── types/                # TypeScript type definitions
│   ├── square.ts         # Square API types
│   └── product.ts        # Product & cart types
├── stores/               # State management
│   └── cart.ts           # Cart store (Zustand)
└── app/api/square/       # API routes
    ├── products/         # Product API endpoints
    ├── checkout/         # Checkout API endpoints
    └── webhooks/         # Webhook handlers
```

## Setup Instructions

### 1. Environment Variables

Copy `env.example` to `.env.local` and configure your Square credentials:

```bash
# Square API Configuration
SQUARE_ACCESS_TOKEN=your_sandbox_access_token_here
SQUARE_LOCATION_ID=your_location_id_here
SQUARE_ENVIRONMENT=sandbox
SQUARE_APPLICATION_ID=your_application_id_here
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key_here
```

### 2. Get Square Credentials

1. **Create a Square Developer Account**: Visit [Square Developer Dashboard](https://developer.squareup.com/)
2. **Create an Application**: Create a new application for your e-commerce store
3. **Get Credentials**:
   - **Access Token**: Found in the "Credentials" tab (use Sandbox for testing)
   - **Location ID**: Found in the "Locations" tab
   - **Application ID**: Found in the "Credentials" tab

### 3. Seed Sample Data

Run the seed script to populate your Square sandbox with sample products:

```bash
npm run seed
```

This will create:

- Sample product categories (iPhone Repair Kits, Samsung Galaxy Kits, etc.)
- Sample products with pricing and inventory
- Proper inventory levels for testing

### 4. Set Up Webhooks (Optional)

For real-time updates, configure webhooks:

1. In Square Developer Dashboard, go to "Webhooks"
2. Add webhook endpoint: `https://yourdomain.com/api/square/webhooks`
3. Select events: `payment.updated`, `order.updated`, `inventory.count.updated`
4. Add the webhook signature key to your environment variables

## Core Features

### 1. Product Management

```typescript
import {
  searchProducts,
  getProductById,
  getCategories,
} from "@/lib/square/products";

// Search products with filters
const products = await searchProducts({
  query: "iPhone",
  categoryIds: ["category_id"],
  priceMin: 10,
  priceMax: 100,
  sortBy: "name",
  sortOrder: "asc",
});

// Get product by ID
const product = await getProductById("product_id");

// Get all categories
const categories = await getCategories();
```

### 2. Cart Management

```typescript
import { useCartStore } from "@/lib/stores/cart";

function ProductCard({ product }) {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      quantity: 1,
      image: product.images[0],
    });
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
}
```

### 3. Checkout Process

```typescript
import { createPaymentLink } from "@/lib/square/checkout";

// Create checkout session
const checkout = await createPaymentLink(cartItems, {
  description: "Online Purchase",
  redirectUrl: "https://yourdomain.com/payment/success",
  askForShippingAddress: true,
});

// Redirect to Square checkout
if (checkout) {
  window.location.href = checkout.url;
}
```

### 4. Order Management

```typescript
import { createOrder, getOrderById } from "@/lib/square/orders";

// Create order from cart
const order = await createOrder(cartItems, customerId);

// Get order details
const orderDetails = await getOrderById(orderId);
```

### 5. Customer Management

```typescript
import { createCustomer, getCustomerByEmail } from "@/lib/square/customers";

// Create new customer
const customer = await createCustomer({
  givenName: "John",
  familyName: "Doe",
  emailAddress: "john@example.com",
});

// Find existing customer
const existingCustomer = await getCustomerByEmail("john@example.com");
```

## API Endpoints

### Products API

- `GET /api/square/products` - Search products with filters
- `GET /api/square/products?featured=true` - Get featured products

### Checkout API

- `POST /api/square/checkout` - Create payment link for checkout

### Webhooks API

- `POST /api/square/webhooks` - Process webhook events
- `GET /api/square/webhooks` - Webhook verification

## Payment Flow

1. **Add Products to Cart**: Users add products to cart (stored in Zustand store)
2. **Checkout**: Create Square Payment Link with cart items
3. **Payment**: User completes payment on Square's secure checkout page
4. **Confirmation**: User redirected back with payment confirmation
5. **Webhook Processing**: Real-time updates via webhooks

## Error Handling

The integration includes comprehensive error handling:

```typescript
try {
  const result = await squareClient.payments.create(paymentRequest);

  if (result.statusCode !== 200) {
    console.error("Payment failed:", result.errors);
    return null;
  }

  return result.payment;
} catch (error) {
  console.error("Payment error:", error);
  return null;
}
```

## Testing

### Sandbox Testing

1. Use sandbox credentials for testing
2. Square provides test card numbers:
   - **Visa**: `4111 1111 1111 1111`
   - **Mastercard**: `5105 1051 0510 5100`
   - **Amex**: `3782 8224 6310 005`

### Test Scenarios

1. **Successful Payment**: Use valid test card numbers
2. **Failed Payment**: Use `4000 0000 0000 0002` (declined card)
3. **Inventory Updates**: Test product purchases update inventory
4. **Webhook Events**: Verify webhook processing in logs

## Deployment Considerations

### Production Setup

1. **Switch to Production Environment**:

   ```bash
   SQUARE_ENVIRONMENT=production
   SQUARE_ACCESS_TOKEN=your_production_access_token
   ```

2. **Webhook Configuration**: Update webhook URLs to production domain

3. **Security**: Ensure all API keys are properly secured

### Performance Optimization

1. **Caching**: Implement Redis caching for product data
2. **Pagination**: Use cursor-based pagination for large product lists
3. **Rate Limiting**: Implement rate limiting to avoid API limits

## Monitoring and Logging

1. **API Logs**: Monitor Square API logs in Developer Dashboard
2. **Error Tracking**: Implement error tracking (e.g., Sentry)
3. **Performance Monitoring**: Track API response times

## Support and Resources

- [Square Developer Documentation](https://developer.squareup.com/docs)
- [Square API Reference](https://developer.squareup.com/reference/square)
- [Square Developer Forums](https://developer.squareup.com/forums)
- [Square Discord Community](https://discord.gg/squaredev)

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify access token and environment settings
2. **Location Errors**: Ensure location ID is correct and active
3. **Webhook Failures**: Check webhook signature verification
4. **Rate Limiting**: Implement exponential backoff for retries

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will provide detailed logging for all Square API operations.

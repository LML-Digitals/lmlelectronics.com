# Newsletter Setup

The newsletter functionality has been successfully implemented with the following features:

## Features

- ✅ **Email Validation**: Client and server-side email validation
- ✅ **Database Storage**: Newsletter subscribers stored in PostgreSQL via Prisma
- ✅ **Welcome Emails**: Automatic welcome emails with discount codes via Resend
- ✅ **User Feedback**: Toast notifications for success/error states
- ✅ **Loading States**: Visual feedback during subscription
- ✅ **Duplicate Prevention**: Prevents duplicate subscriptions
- ✅ **Discount Codes**: Generates unique welcome discount codes

## API Endpoint

- **POST** `/api/newsletter-signup`
- Handles newsletter subscription, validation, database storage, and welcome emails

## Database Schema

The newsletter uses the existing `NewsletterSubscriber` model in the Prisma schema:

```prisma
model NewsletterSubscriber {
  id           String   @id @default(cuid())
  email        String   @unique
  discountCode String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

## Environment Variables

Make sure to set up the following environment variables:

```env
# Database
DATABASE_URL="your_database_url"
DIRECT_URL="your_direct_database_url"

# Email (Resend)
RESEND_API_KEY="your_resend_api_key"
```

## Dependencies

All required dependencies are already installed:

- `react-hook-form` - Form state management
- `sonner` - Toast notifications
- `resend` - Email service
- `@prisma/client` - Database client

## Usage

1. Navigate to any page with the footer
2. Find the newsletter signup section
3. Enter a valid email address
4. Click "Subscribe"
5. Subscriber is saved to database
6. Welcome email with discount code is sent
7. User receives success/error feedback

## Form Validation Rules

- **Email**: Required, valid email format
- **Duplicate Prevention**: Checks if email is already subscribed

## Welcome Email Features

When a new subscriber signs up, they receive a welcome email containing:

- Welcome message
- Newsletter benefits list
- Unique discount code (format: `WELCOMEXXXXXX`)
- Terms and conditions
- Unsubscribe information

## Error Handling

The newsletter includes comprehensive error handling:
- Client-side validation errors
- Server-side validation errors
- Database connection errors
- Email service errors
- Network errors
- Duplicate subscription handling

All errors are displayed to the user via toast notifications.

## Discount Code Generation

- Format: `WELCOME` + 6 random alphanumeric characters
- Example: `WELCOME3A7B9C`
- Unique per subscriber
- Stored in database for future reference

## Success States

- **New Subscriber**: Success message + email notification
- **Existing Subscriber**: Info message (no duplicate subscription)
- **Form Reset**: Form clears after successful submission

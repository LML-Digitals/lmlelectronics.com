# Contact Form Setup

The contact form has been successfully implemented with the following features:

## Features

- ✅ **Form Validation**: Client-side validation using Zod schema
- ✅ **React Hook Form**: Efficient form state management
- ✅ **Database Storage**: Contact submissions stored in PostgreSQL via Prisma
- ✅ **Email Notifications**: Automatic email notifications via Resend
- ✅ **User Feedback**: Toast notifications for success/error states
- ✅ **Loading States**: Visual feedback during form submission
- ✅ **Error Handling**: Comprehensive error handling and validation

## API Endpoint

- **POST** `/api/contact-submissions`
- Handles form submission, validation, database storage, and email notifications

## Database Schema

The contact form uses the existing `ContactSubmission` model in the Prisma schema:

```prisma
model ContactSubmission {
  id         String                  @id @default(cuid())
  firstName  String
  lastName   String
  email      String
  phone      String?
  subject    String?
  message    String
  location   String?
  newsletter Boolean                 @default(false)
  createdAt  DateTime                @default(now())
  updatedAt  DateTime                @updatedAt
  status     ContactSubmissionStatus @default(UNREAD)
  
  // Response tracking
  hasResponse     Boolean   @default(false)
  responseType    ResponseType?
  respondedAt     DateTime?
  responseSubject String?
  responseMessage String?   @db.Text
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
- `@hookform/resolvers` - Form validation resolvers
- `zod` - Schema validation
- `sonner` - Toast notifications
- `resend` - Email service
- `@prisma/client` - Database client

## Usage

1. Navigate to `/contact` page
2. Fill out the form with required fields
3. Submit the form
4. Form data is saved to database
5. Email notification is sent to support team
6. User receives success/error feedback

## Form Validation Rules

- **First Name**: Required, minimum 1 character
- **Last Name**: Required, minimum 1 character
- **Email**: Required, valid email format
- **Subject**: Required, minimum 1 character
- **Message**: Required, minimum 10 characters

## Email Notifications

When a form is submitted, an email is automatically sent to `support@lmlelectronics.com` with:
- Sender information (name, email)
- Subject and message content
- Submission timestamp

## Error Handling

The form includes comprehensive error handling:
- Client-side validation errors
- Server-side validation errors
- Database connection errors
- Email service errors
- Network errors

All errors are displayed to the user via toast notifications.

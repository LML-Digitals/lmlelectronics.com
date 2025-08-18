import prisma from '../../../../lib/prisma';
import { SettingCategory } from './settingsTypes';

export async function initializeSettings () {
  const settings = [
    // Appearance Settings
    {
      key: 'dark_mode',
      name: 'Dark Mode',
      description: 'Enable dark mode for the application',
      category: SettingCategory.APPEARANCE,
      defaultValue: 'false',
    },

    // Payment Settings
    {
      key: 'payment_methods',
      name: 'Payment Methods',
      description: 'Configure available payment methods',
      category: SettingCategory.PAYMENT,
      defaultValue: JSON.stringify({
        creditCard: true,
        debitCard: true,
        bankTransfer: true,
        cash: true,
        zelle: true,
        venmo: true,
        cashapp: true,
        paypal: true,
        check: true,
        bankWire: true,
        applePay: true,
        googlePay: true,
        samsungPay: true,
      }),
    },
    {
      key: 'square_integration',
      name: 'Square Integration',
      description: 'Square payment gateway configuration',
      category: SettingCategory.PAYMENT,
      defaultValue: JSON.stringify({
        enabled: false,
        testMode: true,
      }),
    },
    {
      key: 'payment_currency',
      name: 'Default Currency',
      description: 'Default currency for payments',
      category: SettingCategory.PAYMENT,
      defaultValue: 'USD',
    },

    // Customer Settings
    {
      key: 'enable_customer_portal',
      name: 'Enable Customer Portal',
      description: 'Allow customers to access their dedicated portal',
      category: SettingCategory.CUSTOMER,
      defaultValue: 'true',
    },
    {
      key: 'allow_customer_booking',
      name: 'Allow Customer Booking',
      description: 'Enable customers to book appointments online',
      category: SettingCategory.CUSTOMER,
      defaultValue: 'true',
    },
    {
      key: 'customer_login_required',
      name: 'Require Login for Booking',
      description: 'Require customers to login before booking appointments',
      category: SettingCategory.CUSTOMER,
      defaultValue: 'false',
    },
    {
      key: 'customer_notification_preference',
      name: 'Default Notification Preference',
      description: 'Default notification method for new customers',
      category: SettingCategory.CUSTOMER,
      defaultValue: 'both',
    },
    {
      key: 'customer_default_view',
      name: 'Default Portal View',
      description: 'Default landing page when customers log in',
      category: SettingCategory.CUSTOMER,
      defaultValue: 'repairs',
    },
    {
      key: 'customer_repair_updates',
      name: 'Automatic Repair Updates',
      description: 'Send automated updates when repair status changes',
      category: SettingCategory.CUSTOMER,
      defaultValue: 'true',
    },

    // General Settings
    {
      key: 'site_name',
      name: 'Site Name',
      description: 'The name of your business displayed throughout the site',
      category: SettingCategory.GENERAL,
      defaultValue: 'LML Repair',
    },
    {
      key: 'site_logo',
      name: 'Logo URL',
      description: 'URL to your company logo',
      category: SettingCategory.GENERAL,
      defaultValue: '/logo.png',
    },
    {
      key: 'default_language',
      name: 'Default Language',
      description: 'Default language for the application',
      category: SettingCategory.GENERAL,
      defaultValue: 'en',
    },
    {
      key: 'default_timezone',
      name: 'Default Timezone',
      description: 'Default timezone for date/time displays',
      category: SettingCategory.GENERAL,
      defaultValue: 'America/Los_Angeles',
    },
    {
      key: 'date_format',
      name: 'Date Format',
      description: 'Format for displaying dates',
      category: SettingCategory.GENERAL,
      defaultValue: 'MM/DD/YYYY',
    },
    {
      key: 'time_format',
      name: 'Time Format',
      description: 'Format for displaying times',
      category: SettingCategory.GENERAL,
      defaultValue: 'h:mm A',
    },

    // Phone Settings
    {
      key: 'phone.greeting.text',
      name: 'Call Greeting Text',
      description:
        'Text greeting played when customers call (will use text-to-speech)',
      category: SettingCategory.PHONE,
      defaultValue:
        'Thank you for calling LML Repair. Please hold while we connect you to the next available representative.',
    },
    {
      key: 'phone.greeting.url',
      name: 'Call Greeting Audio URL',
      description: 'Custom audio file URL for call greeting (overrides text)',
      category: SettingCategory.PHONE,
      defaultValue: '',
    },
    {
      key: 'phone.business_hours.start',
      name: 'Business Hours Start',
      description: 'When business hours start (HH:MM format)',
      category: SettingCategory.PHONE,
      defaultValue: '09:00',
    },
    {
      key: 'phone.business_hours.end',
      name: 'Business Hours End',
      description: 'When business hours end (HH:MM format)',
      category: SettingCategory.PHONE,
      defaultValue: '17:00',
    },
    {
      key: 'phone.business_hours.enabled',
      name: 'Business Hours Enabled',
      description: 'Enable business hours restrictions for phone calls',
      category: SettingCategory.PHONE,
      defaultValue: 'true',
    },
    {
      key: 'phone.business_hours.days',
      name: 'Business Days',
      description: 'Days of week business is open (JSON array: 1=Mon, 7=Sun)',
      category: SettingCategory.PHONE,
      defaultValue: JSON.stringify([1, 2, 3, 4, 5]),
    },
    {
      key: 'phone.business_hours.timezone',
      name: 'Business Hours Timezone',
      description: 'Timezone for business hours calculation',
      category: SettingCategory.PHONE,
      defaultValue: 'America/Los_Angeles',
    },
    {
      key: 'phone.missed_call.enabled',
      name: 'Missed Call Text Enabled',
      description:
        'Send automated text for missed calls outside business hours',
      category: SettingCategory.PHONE,
      defaultValue: 'true',
    },
    {
      key: 'phone.missed_call.message',
      name: 'Missed Call Message',
      description:
        'Template for missed call automated text ([BOOKING_LINK] will be replaced)',
      category: SettingCategory.PHONE,
      defaultValue:
        "Hi! We missed your call. We'll get back to you soon or you can book online at [BOOKING_LINK]",
    },
    {
      key: 'phone.voicemail.greeting',
      name: 'Voicemail Greeting Text',
      description: 'Text for voicemail greeting (will use text-to-speech)',
      category: SettingCategory.PHONE,
      defaultValue:
        "Thank you for calling. Please leave a message and we'll get back to you as soon as possible.",
    },
    {
      key: 'phone.voicemail.greeting_url',
      name: 'Voicemail Greeting Audio URL',
      description:
        'Custom audio file URL for voicemail greeting (overrides text)',
      category: SettingCategory.PHONE,
      defaultValue: '',
    },
    {
      key: 'phone.voicemail.enabled',
      name: 'Voicemail System Enabled',
      description: 'Enable the voicemail system for missed calls',
      category: SettingCategory.PHONE,
      defaultValue: 'true',
    },
    {
      key: 'phone.voicemail.transcription_enabled',
      name: 'Voicemail Transcription',
      description: 'Enable automatic transcription of voicemails',
      category: SettingCategory.PHONE,
      defaultValue: 'true',
    },
    {
      key: 'phone.booking_reminders.enabled',
      name: 'Booking Reminder Texts',
      description: 'Send automated booking reminder texts to customers',
      category: SettingCategory.PHONE,
      defaultValue: 'true',
    },
    {
      key: 'phone.booking_reminders.message',
      name: 'Booking Reminder Message',
      description: 'Template for booking reminder texts',
      category: SettingCategory.PHONE,
      defaultValue:
        'Hi! This is a reminder that your repair appointment is tomorrow at [TIME]. Please call if you need to reschedule.',
    },
    {
      key: 'phone.review_requests.enabled',
      name: 'Review Request Texts',
      description: 'Send automated review request texts after repairs',
      category: SettingCategory.PHONE,
      defaultValue: 'true',
    },
    {
      key: 'phone.review_requests.message',
      name: 'Review Request Message',
      description: 'Template for review request texts',
      category: SettingCategory.PHONE,
      defaultValue:
        "Thanks for choosing us! If you're happy with your repair, we'd love a review: [REVIEW_LINK]",
    },
  ];

  for (const setting of settings) {
    const existingSetting = await prisma.settings.findUnique({
      where: { key: setting.key },
    });

    if (!existingSetting) {
      console.log(`Creating setting: ${setting.key}`);
      await prisma.settings.create({
        data: {
          key: setting.key,
          name: setting.name,
          description: setting.description,
          category: setting.category as any, // Type assertion for Prisma enum
          defaultValue: setting.defaultValue,
        },
      });
    }
  }

  console.log('Settings initialization complete');
}

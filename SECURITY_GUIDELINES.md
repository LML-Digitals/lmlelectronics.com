# Security Guidelines for LML Electronics Store

## 🔒 Security Overview

This document outlines security measures implemented in the LML Electronics store application and best practices for maintaining security.

## 🛡️ Implemented Security Measures

### 1. Password Security
- **Bcrypt Hashing**: All passwords are hashed using bcrypt with a cost factor of 12
- **Strong Password Requirements**: Minimum 8 characters with uppercase, lowercase, numbers, and special characters
- **No Plain Text Storage**: Passwords are never stored in plain text

### 2. Input Validation & Sanitization
- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **Length Limits**: Input fields have maximum length restrictions
- **Email Validation**: Strict email format validation
- **HTML Tag Removal**: Potential HTML tags are stripped from inputs

### 3. CORS Configuration
- **Restricted Origins**: Only specific domains are allowed
- **Development Support**: Localhost origins allowed in development only
- **Secure Headers**: Proper CORS headers implementation

### 4. Security Headers
- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME type sniffing)
- **X-XSS-Protection**: 1; mode=block (XSS protection)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts camera, microphone, geolocation, payment
- **Strict-Transport-Security**: Enforces HTTPS

### 5. Rate Limiting
- **API Rate Limiting**: 5 requests per 15 minutes per IP
- **Contact Form Protection**: Prevents spam and abuse
- **IP-based Tracking**: Uses client IP for rate limiting

### 6. Environment Variables
- **Secure Storage**: Sensitive data stored in environment variables
- **No Hardcoded Secrets**: No API keys or secrets in code
- **Proper .gitignore**: Environment files excluded from version control

## 🚨 Critical Security Issues Fixed

### 1. Weak Password Hashing ❌ → ✅
**Before**: Custom `simpleHash` function
**After**: Bcrypt with cost factor 12

### 2. Overly Permissive CORS ❌ → ✅
**Before**: `Access-Control-Allow-Origin: *`
**After**: Specific allowed origins only

### 3. Missing Input Sanitization ❌ → ✅
**Before**: Raw user input stored
**After**: Sanitized inputs with length limits

### 4. Debug Information Leakage ❌ → ✅
**Before**: Console logs in production
**After**: Development-only logging

## 🔧 Security Configuration

### Environment Variables Required
```bash
# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url

# Square Payment
NEXT_PUBLIC_SQUARE_APP_ID=your_square_app_id
NEXT_PUBLIC_SQUARE_LOCATION_ID=your_location_id
NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox|production

# Email Service
RESEND_API_KEY=your_resend_api_key

# Supabase (if used)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Base URL
NEXT_PUBLIC_API_BASE_URL=your_api_base_url
```

### Security Constants
See `src/lib/config/security.ts` for all security configuration constants.

## 🛠️ Security Best Practices

### For Developers

1. **Never commit sensitive data**
   - Use environment variables for all secrets
   - Check `.gitignore` includes `.env*` files

2. **Validate all inputs**
   - Use the provided sanitization functions
   - Implement proper validation for all forms

3. **Use secure authentication**
   - Always hash passwords with bcrypt
   - Implement proper session management
   - Use HTTPS in production

4. **Follow the principle of least privilege**
   - Only expose necessary data
   - Implement proper access controls

### For Deployment

1. **Use HTTPS only**
   - Configure SSL certificates
   - Redirect HTTP to HTTPS

2. **Regular security updates**
   - Keep dependencies updated
   - Monitor for security vulnerabilities

3. **Database security**
   - Use strong database passwords
   - Limit database access
   - Regular backups

4. **Monitoring and logging**
   - Monitor for suspicious activity
   - Log security events
   - Set up alerts for anomalies

## 🔍 Security Testing

### Automated Testing
```bash
# Run security audits
npm audit

# Check for vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Manual Testing Checklist
- [ ] Test input validation on all forms
- [ ] Verify CORS configuration
- [ ] Check security headers
- [ ] Test rate limiting
- [ ] Verify password requirements
- [ ] Test XSS prevention
- [ ] Check for information disclosure

## 🚨 Incident Response

### If a security breach is suspected:

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Change compromised credentials

2. **Investigation**
   - Review logs for suspicious activity
   - Identify the attack vector
   - Assess the scope of the breach

3. **Recovery**
   - Patch vulnerabilities
   - Restore from clean backups
   - Monitor for further attacks

4. **Post-Incident**
   - Document lessons learned
   - Update security measures
   - Notify affected users if necessary

## 📞 Security Contacts

For security issues or questions:
- **Email**: security@lmlelectronics.com
- **Emergency**: [Emergency contact number]

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [Web Security Fundamentals](https://web.dev/security/)

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Maintained By**: Development Team
# Database Security Guidelines

## 🔒 Database Security Overview

This document outlines security measures for the PostgreSQL database used by the LML Electronics store.

## 🛡️ Current Security Measures

### 1. Connection Security
- **Environment Variables**: Database credentials stored securely
- **Direct URL**: Separate direct connection for migrations
- **SSL/TLS**: Enforced encrypted connections

### 2. Schema Security
- **Password Hashing**: Customer passwords hashed with bcrypt
- **Unique Constraints**: Proper unique constraints on email fields
- **Foreign Key Constraints**: Proper referential integrity

## 🚨 Security Recommendations

### 1. Database Access Control

#### User Permissions
```sql
-- Create application user with minimal privileges
CREATE USER lml_app_user WITH PASSWORD 'strong_password_here';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE lml_electronics TO lml_app_user;
GRANT USAGE ON SCHEMA public TO lml_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lml_app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lml_app_user;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM lml_app_user;
REVOKE DROP ON SCHEMA public FROM lml_app_user;
```

#### Row Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;

-- Create policies for customer data
CREATE POLICY "Customers can only access their own data" ON "Customer"
    FOR ALL USING (auth.uid()::text = id);

-- Create policies for orders
CREATE POLICY "Customers can only access their own orders" ON "Order"
    FOR ALL USING (auth.uid()::text = "customerId");
```

### 2. Data Encryption

#### At Rest Encryption
- Enable database encryption at rest
- Use encrypted storage volumes
- Implement transparent data encryption (TDE)

#### In Transit Encryption
- Enforce SSL/TLS connections
- Use certificate-based authentication
- Implement connection pooling with encryption

### 3. Backup Security

#### Backup Encryption
```bash
# Encrypted backup example
pg_dump --dbname=postgresql://user:pass@host:port/db \
  --verbose --clean --no-owner --no-privileges \
  | gpg --encrypt --recipient backup-key@company.com \
  > backup_$(date +%Y%m%d_%H%M%S).sql.gpg
```

#### Backup Storage
- Store backups in encrypted storage
- Use separate backup credentials
- Implement backup rotation and retention

### 4. Monitoring and Logging

#### Enable Audit Logging
```sql
-- Enable PostgreSQL audit logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_duration = on;

-- Reload configuration
SELECT pg_reload_conf();
```

#### Monitor Suspicious Activity
- Monitor failed login attempts
- Track unusual query patterns
- Alert on privilege escalation attempts

### 5. Prisma Security Best Practices

#### Environment Configuration
```bash
# Production database URL with SSL
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"

# Direct URL for migrations (same as above)
DIRECT_URL="postgresql://user:pass@host:port/db?sslmode=require"
```

#### Query Security
```typescript
// Use parameterized queries (Prisma handles this automatically)
const user = await prisma.customer.findUnique({
  where: { email: userEmail }, // Safe from SQL injection
});

// Avoid raw queries when possible
// If raw queries are needed, use parameterized queries
const result = await prisma.$queryRaw`
  SELECT * FROM "Customer" WHERE email = ${userEmail}
`;
```

#### Connection Pooling
```typescript
// Configure connection pooling in Prisma
// Add to schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  // Connection pooling configuration
  relationMode = "prisma"
}
```

### 6. Data Privacy

#### PII Protection
- Encrypt sensitive personal data
- Implement data retention policies
- Provide data deletion capabilities (GDPR compliance)

#### Data Masking
```sql
-- Create views with masked data for reporting
CREATE VIEW customer_masked AS
SELECT 
  id,
  CONCAT(LEFT(first_name, 1), '***') as first_name,
  CONCAT(LEFT(last_name, 1), '***') as last_name,
  CONCAT(LEFT(email, 3), '***@***') as email,
  created_at
FROM "Customer";
```

### 7. Migration Security

#### Safe Migrations
```bash
# Always backup before migrations
pg_dump --dbname=your_db > backup_before_migration.sql

# Test migrations in staging first
# Use transaction wrapping for all migrations
```

#### Migration Validation
```typescript
// Validate migrations before applying
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function validateMigration() {
  try {
    // Test critical queries
    await prisma.customer.findMany({ take: 1 })
    console.log('Migration validation passed')
  } catch (error) {
    console.error('Migration validation failed:', error)
    process.exit(1)
  }
}
```

## 🔍 Security Checklist

### Database Setup
- [ ] Use strong, unique passwords
- [ ] Enable SSL/TLS connections
- [ ] Configure connection pooling
- [ ] Set up proper user permissions
- [ ] Enable audit logging

### Application Security
- [ ] Use environment variables for credentials
- [ ] Implement proper error handling
- [ ] Use parameterized queries
- [ ] Validate all inputs
- [ ] Implement rate limiting

### Monitoring
- [ ] Set up database monitoring
- [ ] Configure alerting for anomalies
- [ ] Regular security audits
- [ ] Backup verification
- [ ] Performance monitoring

### Compliance
- [ ] GDPR compliance measures
- [ ] Data retention policies
- [ ] Privacy policy implementation
- [ ] Regular security assessments
- [ ] Incident response plan

## 🚨 Emergency Procedures

### Database Compromise
1. **Immediate Actions**
   - Isolate database from network
   - Change all database passwords
   - Review access logs

2. **Investigation**
   - Identify breach vector
   - Assess data exposure
   - Document incident

3. **Recovery**
   - Restore from clean backup
   - Patch vulnerabilities
   - Monitor for further attacks

### Data Breach Response
1. **Notification**
   - Notify affected users
   - Report to authorities if required
   - Engage legal counsel

2. **Remediation**
   - Implement additional security measures
   - Update security policies
   - Provide user support

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Maintained By**: Database Team
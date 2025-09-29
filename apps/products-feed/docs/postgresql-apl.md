# PostgreSQL APL Configuration

This document explains how to configure the Products Feed app to use PostgreSQL as the Auth Persistence Layer (APL) for multi-tenant deployments.

## Setup

### 1. Environment Variables

Add these variables to your `.env` file:

```bash
# APL Configuration
APL=postgres
APP_NAME=products-feed

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saleor_apps
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false  # Set to true for production with SSL
```

### 2. Install Dependencies

The required dependencies are already included in `package.json`:
- `pg` - PostgreSQL client
- `@types/pg` - TypeScript definitions

### 3. Database Setup

#### Option A: Run the initialization script
```bash
pnpm init-db
```

#### Option B: Run the migration manually
```bash
psql -h localhost -U postgres -d saleor_apps -f migrations/001_create_auth_table.sql
```

### 4. Database Schema

The APL uses a single table `saleor_app_configuration`:

```sql
CREATE TABLE saleor_app_configuration (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant TEXT NOT NULL,              -- Saleor API URL
    app_name TEXT NOT NULL,            -- App identifier
    configurations JSONB NOT NULL,     -- AuthData object
    is_active BOOLEAN DEFAULT TRUE,    -- Active status (TRUE by default)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tenant, app_name)
);
```

## Multi-Tenancy Support

Each tenant (Saleor instance) gets its own row identified by:
- `tenant`: The Saleor API URL (e.g., `https://store1.saleor.cloud/graphql/`)
- `app_name`: The app identifier (e.g., `products-feed`)

This allows multiple Saleor stores and multiple apps to share the same database.

## Key Features

- **Automatic activation**: `is_active` is set to `TRUE` by default when apps are installed
- **Soft deletion**: Apps are deactivated (not deleted) when uninstalled
- **Multi-tenant**: Supports multiple Saleor instances in one database
- **Multi-app**: Supports multiple Saleor apps in one database
- **Connection pooling**: Uses pg connection pooling for performance

## Production Considerations

1. **SSL**: Set `DB_SSL=true` for production databases
2. **Connection limits**: Configure appropriate connection pool settings
3. **Monitoring**: Monitor database performance and connection usage
4. **Backups**: Ensure regular backups of the auth data
5. **Security**: Use strong passwords and restrict database access

## Troubleshooting

### Connection Issues
- Verify database credentials
- Check network connectivity
- Ensure PostgreSQL is running
- Verify SSL settings match your database configuration

### Permission Issues
- Ensure the database user has CREATE, SELECT, INSERT, UPDATE permissions
- Verify the database exists
- Check if uuid-ossp extension can be created

### Migration Issues
- Run `pnpm init-db` to create the table
- Check PostgreSQL logs for detailed error messages
- Verify the database user has sufficient privileges

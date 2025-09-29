import { Pool } from "pg";

let pool: Pool | null = null;

export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === "true" ? {
        rejectUnauthorized: false,
      } : false,
    });

    pool.on("error", (err) => {
      // eslint-disable-next-line no-console
      console.error("PostgreSQL pool error:", err);
    });
  }

  return pool;
};

export const initializeDatabase = async (): Promise<void> => {
  const pool = getPool();

  const createTableQuery = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    CREATE TABLE IF NOT EXISTS saleor_app_configuration (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      tenant TEXT NOT NULL,              
      app_name TEXT NOT NULL,            
      configurations JSONB NOT NULL,     
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT saleor_apl_api_url_app_id_unique UNIQUE (tenant, app_name)
    );
    
    CREATE INDEX IF NOT EXISTS idx_saleor_app_configuration_tenant ON saleor_app_configuration(tenant);
    CREATE INDEX IF NOT EXISTS idx_saleor_app_configuration_app_name ON saleor_app_configuration(app_name);
    CREATE INDEX IF NOT EXISTS idx_saleor_app_configuration_is_active ON saleor_app_configuration(is_active);
  `;

  try {
    await pool.query(createTableQuery);
    // eslint-disable-next-line no-console
    console.log("Database table initialized successfully");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize database table:", error);
    throw error;
  }
};

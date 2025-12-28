#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1q2w3e4r5t',
    database: 'postgres', // Connect to default postgres database first
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();

    // Check if the database exists
    const dbName = process.env.DB_DATABASE || 'notification_system_db';
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await client.query(
        `CREATE DATABASE "${dbName}"`
      );
      console.log('Database created successfully!');
    } else {
      console.log('Database already exists.');
    }

    await client.end();

    // Now connect to the target database to set up extensions
    const targetClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '1q2w3e4r5t',
      database: dbName,
    });

    console.log('Setting up database extensions...');
    await targetClient.connect();

    // Create extensions
    await targetClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await targetClient.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // Create the update function
    await targetClient.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await targetClient.end();
    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();


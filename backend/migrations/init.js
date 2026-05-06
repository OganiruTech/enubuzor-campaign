// backend/migrations/init.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

try {
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  console.log(`✅ Database '${process.env.DB_NAME}' ready`);

  await connection.query(`USE \`${process.env.DB_NAME}\``);

  // users
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      ward VARCHAR(100),
      community VARCHAR(100),
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_ward (ward)
    )
  `);

  // volunteers — user_id nullable for public signups
  await connection.query(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36),
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      ward VARCHAR(100),
      community VARCHAR(100),
      occupation VARCHAR(100),
      age_group VARCHAR(20),
      role_type VARCHAR(100) DEFAULT 'volunteer',
      skills TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_ward (ward)
    )
  `);

  // events
  await connection.query(`
    CREATE TABLE IF NOT EXISTS events (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_type VARCHAR(100),
      date DATE NOT NULL,
      time VARCHAR(20),
      location VARCHAR(255),
      ward VARCHAR(100),
      rsvp_count INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'upcoming',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_date (date),
      INDEX idx_status (status),
      INDEX idx_ward (ward)
    )
  `);

  // rsvps
  await connection.query(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id VARCHAR(36) PRIMARY KEY,
      event_id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255),
      ward VARCHAR(100),
      guests INT DEFAULT 1,
      status VARCHAR(50) DEFAULT 'confirmed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      INDEX idx_event_id (event_id)
    )
  `);

  // community_issues — includes reporter_email for confirmation emails
  await connection.query(`
    CREATE TABLE IF NOT EXISTS community_issues (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      location VARCHAR(255),
      ward VARCHAR(100),
      community VARCHAR(100),
      reporter_name VARCHAR(255),
      reporter_phone VARCHAR(20),
      reporter_email VARCHAR(255),
      status VARCHAR(50) DEFAULT 'reported',
      upvotes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category),
      INDEX idx_status (status),
      INDEX idx_ward (ward)
    )
  `);

  // donations
  await connection.query(`
    CREATE TABLE IF NOT EXISTS donations (
      id VARCHAR(36) PRIMARY KEY,
      donor_name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(20),
      amount DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(100),
      transaction_id VARCHAR(255) UNIQUE,
      message TEXT,
      is_anonymous BOOLEAN DEFAULT FALSE,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    )
  `);

  // media_posts
  await connection.query(`
    CREATE TABLE IF NOT EXISTS media_posts (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      content TEXT,
      media_type VARCHAR(50),
      media_url VARCHAR(500),
      thumbnail_url VARCHAR(500),
      category VARCHAR(100),
      tags JSON,
      views INT DEFAULT 0,
      likes INT DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      status VARCHAR(50) DEFAULT 'published',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_media_type (media_type),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    )
  `);

  console.log('✅ All tables ready');
  console.log('\n🎉 Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration error:', error);
  process.exit(1);
} finally {
  await connection.end();
}
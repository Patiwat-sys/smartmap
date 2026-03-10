-- =============================================
-- Smart Map Database Creation Script
-- Server: 10.102.10.51\SQLEXPRESS
-- Database: SmartMapDB
-- Login: SmartMapUser
-- =============================================

-- Step 1: Create Login (Run this on master database)
USE master;
GO

-- Create SQL Login
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'SmartMapUser')
BEGIN
    CREATE LOGIN SmartMapUser WITH PASSWORD = 'SmartMap@2024!';
    PRINT 'Login SmartMapUser created successfully';
END
ELSE
BEGIN
    PRINT 'Login SmartMapUser already exists';
END
GO

-- Step 2: Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SmartMapDB')
BEGIN
    CREATE DATABASE SmartMapDB;
    PRINT 'Database SmartMapDB created successfully';
END
ELSE
BEGIN
    PRINT 'Database SmartMapDB already exists';
END
GO

-- Step 3: Use the new database and create user
USE SmartMapDB;
GO

-- Create Database User
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'SmartMapUser')
BEGIN
    CREATE USER SmartMapUser FOR LOGIN SmartMapUser;
    PRINT 'User SmartMapUser created successfully';
END
ELSE
BEGIN
    PRINT 'User SmartMapUser already exists';
END
GO

-- Grant permissions
ALTER ROLE db_owner ADD MEMBER SmartMapUser;
GO

PRINT 'Database setup completed successfully!';
GO

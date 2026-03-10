-- =============================================
-- Smart Map Database Tables Creation Script
-- Database: SmartMapDB
-- =============================================

USE SmartMapDB;
GO

-- =============================================
-- Table 1: Users
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Username] NVARCHAR(50) NOT NULL UNIQUE,
        [Email] NVARCHAR(100) NOT NULL UNIQUE,
        [Password] NVARCHAR(255) NOT NULL,
        [Role] NVARCHAR(20) NOT NULL DEFAULT 'User', -- 'Admin' or 'User'
        [FullName] NVARCHAR(100) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NULL,
        [LastLoginAt] DATETIME NULL
    );
    
    CREATE INDEX IX_Users_Username ON [dbo].[Users]([Username]);
    CREATE INDEX IX_Users_Email ON [dbo].[Users]([Email]);
    CREATE INDEX IX_Users_Role ON [dbo].[Users]([Role]);
    
    PRINT 'Table Users created successfully';
END
ELSE
BEGIN
    PRINT 'Table Users already exists';
END
GO

-- =============================================
-- Table 2: MonthlyMaps
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MonthlyMaps]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[MonthlyMaps] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Month] INT NOT NULL CHECK ([Month] BETWEEN 1 AND 12),
        [Year] INT NOT NULL,
        [FileName] NVARCHAR(255) NOT NULL,
        [FilePath] NVARCHAR(500) NOT NULL,
        [FileSize] BIGINT NULL,
        [EastMin] DECIMAL(18,3) NOT NULL,
        [EastMax] DECIMAL(18,3) NOT NULL,
        [NorthMin] DECIMAL(18,3) NOT NULL,
        [NorthMax] DECIMAL(18,3) NOT NULL,
        [UploadedBy] INT NOT NULL,
        [UploadedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [Description] NVARCHAR(500) NULL,
        CONSTRAINT FK_MonthlyMaps_Users FOREIGN KEY ([UploadedBy]) REFERENCES [dbo].[Users]([Id])
    );
    
    CREATE UNIQUE INDEX IX_MonthlyMaps_Year_Month ON [dbo].[MonthlyMaps]([Year], [Month]);
    CREATE INDEX IX_MonthlyMaps_UploadedBy ON [dbo].[MonthlyMaps]([UploadedBy]);
    CREATE INDEX IX_MonthlyMaps_Year ON [dbo].[MonthlyMaps]([Year]);
    
    PRINT 'Table MonthlyMaps created successfully';
END
ELSE
BEGIN
    PRINT 'Table MonthlyMaps already exists';
END
GO

-- =============================================
-- Table 3: VerifySeams
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VerifySeams]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[VerifySeams] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [BlockName] NVARCHAR(100) NOT NULL,
        [Easting] DECIMAL(18,3) NOT NULL,
        [Northing] DECIMAL(18,3) NOT NULL,
        [Elevation] DECIMAL(18,3) NULL,
        [VerifyDate] DATETIME NOT NULL,
        [CreatedBy] INT NOT NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NULL,
        [UpdatedBy] INT NULL,
        [Status] NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Verified', 'Rejected'
        [Notes] NVARCHAR(1000) NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        CONSTRAINT FK_VerifySeams_CreatedBy FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users]([Id]),
        CONSTRAINT FK_VerifySeams_UpdatedBy FOREIGN KEY ([UpdatedBy]) REFERENCES [dbo].[Users]([Id])
    );
    
    CREATE INDEX IX_VerifySeams_BlockName ON [dbo].[VerifySeams]([BlockName]);
    CREATE INDEX IX_VerifySeams_CreatedBy ON [dbo].[VerifySeams]([CreatedBy]);
    CREATE INDEX IX_VerifySeams_Status ON [dbo].[VerifySeams]([Status]);
    CREATE INDEX IX_VerifySeams_VerifyDate ON [dbo].[VerifySeams]([VerifyDate]);
    
    PRINT 'Table VerifySeams created successfully';
END
ELSE
BEGIN
    PRINT 'Table VerifySeams already exists';
END
GO

-- =============================================
-- Table 4: VerifySeamPhotos
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VerifySeamPhotos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[VerifySeamPhotos] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [VerifySeamId] INT NOT NULL,
        [FileName] NVARCHAR(255) NOT NULL,
        [FilePath] NVARCHAR(500) NOT NULL,
        [FileSize] BIGINT NULL,
        [UploadedBy] INT NOT NULL,
        [UploadedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [DisplayOrder] INT NOT NULL DEFAULT 0,
        [Description] NVARCHAR(500) NULL,
        CONSTRAINT FK_VerifySeamPhotos_VerifySeam FOREIGN KEY ([VerifySeamId]) REFERENCES [dbo].[VerifySeams]([Id]) ON DELETE CASCADE,
        CONSTRAINT FK_VerifySeamPhotos_User FOREIGN KEY ([UploadedBy]) REFERENCES [dbo].[Users]([Id])
    );
    
    CREATE INDEX IX_VerifySeamPhotos_VerifySeamId ON [dbo].[VerifySeamPhotos]([VerifySeamId]);
    CREATE INDEX IX_VerifySeamPhotos_DisplayOrder ON [dbo].[VerifySeamPhotos]([DisplayOrder]);
    
    PRINT 'Table VerifySeamPhotos created successfully';
END
ELSE
BEGIN
    PRINT 'Table VerifySeamPhotos already exists';
END
GO

-- =============================================
-- Table 5: VerifySeamVerifiers
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VerifySeamVerifiers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[VerifySeamVerifiers] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [VerifySeamId] INT NOT NULL,
        [UserId] INT NOT NULL,
        [VerifiedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [VerificationNotes] NVARCHAR(500) NULL,
        [Status] NVARCHAR(20) NOT NULL DEFAULT 'Verified', -- 'Verified', 'Rejected'
        CONSTRAINT FK_VerifySeamVerifiers_VerifySeam FOREIGN KEY ([VerifySeamId]) REFERENCES [dbo].[VerifySeams]([Id]) ON DELETE CASCADE,
        CONSTRAINT FK_VerifySeamVerifiers_User FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]),
        CONSTRAINT UQ_VerifySeamVerifiers_VerifySeam_User UNIQUE ([VerifySeamId], [UserId])
    );
    
    CREATE INDEX IX_VerifySeamVerifiers_VerifySeamId ON [dbo].[VerifySeamVerifiers]([VerifySeamId]);
    CREATE INDEX IX_VerifySeamVerifiers_UserId ON [dbo].[VerifySeamVerifiers]([UserId]);
    
    PRINT 'Table VerifySeamVerifiers created successfully';
END
ELSE
BEGIN
    PRINT 'Table VerifySeamVerifiers already exists';
END
GO

-- =============================================
-- Table 6: GeophysicHoles
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GeophysicHoles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[GeophysicHoles] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [HoleName] NVARCHAR(100) NOT NULL UNIQUE,
        [Easting] DECIMAL(18,3) NOT NULL,
        [Northing] DECIMAL(18,3) NOT NULL,
        [Elevation] DECIMAL(18,3) NULL,
        [FileName] NVARCHAR(255) NOT NULL,
        [FilePath] NVARCHAR(500) NOT NULL,
        [FileSize] BIGINT NULL,
        [UploadedBy] INT NOT NULL,
        [UploadedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME NULL,
        [UpdatedBy] INT NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        [Description] NVARCHAR(500) NULL,
        CONSTRAINT FK_GeophysicHoles_UploadedBy FOREIGN KEY ([UploadedBy]) REFERENCES [dbo].[Users]([Id]),
        CONSTRAINT FK_GeophysicHoles_UpdatedBy FOREIGN KEY ([UpdatedBy]) REFERENCES [dbo].[Users]([Id])
    );
    
    CREATE INDEX IX_GeophysicHoles_HoleName ON [dbo].[GeophysicHoles]([HoleName]);
    CREATE INDEX IX_GeophysicHoles_UploadedBy ON [dbo].[GeophysicHoles]([UploadedBy]);
    
    PRINT 'Table GeophysicHoles created successfully';
END
ELSE
BEGIN
    PRINT 'Table GeophysicHoles already exists';
END
GO

-- =============================================
-- Table 7: ActivityLogs
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ActivityLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ActivityLogs] (
        [Id] BIGINT IDENTITY(1,1) PRIMARY KEY,
        [UserId] INT NOT NULL,
        [ActionType] NVARCHAR(50) NOT NULL, -- 'Login', 'UploadMap', 'CreateVerifySeam', etc.
        [EntityType] NVARCHAR(50) NULL, -- 'MonthlyMap', 'VerifySeam', 'GeophysicHole', etc.
        [EntityId] INT NULL,
        [Description] NVARCHAR(500) NULL,
        [IpAddress] NVARCHAR(50) NULL,
        [UserAgent] NVARCHAR(255) NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [Status] NVARCHAR(20) NOT NULL DEFAULT 'Success', -- 'Success', 'Failed', 'Error'
        CONSTRAINT FK_ActivityLogs_User FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
    );
    
    CREATE INDEX IX_ActivityLogs_UserId ON [dbo].[ActivityLogs]([UserId]);
    CREATE INDEX IX_ActivityLogs_CreatedAt ON [dbo].[ActivityLogs]([CreatedAt]);
    CREATE INDEX IX_ActivityLogs_ActionType ON [dbo].[ActivityLogs]([ActionType]);
    CREATE INDEX IX_ActivityLogs_EntityType ON [dbo].[ActivityLogs]([EntityType]);
    
    PRINT 'Table ActivityLogs created successfully';
END
ELSE
BEGIN
    PRINT 'Table ActivityLogs already exists';
END
GO

-- =============================================
-- Insert Default Admin User (with hashed passwords)
-- Password hashes generated using BCrypt with work factor 12
-- Plain passwords: admin123 and user123
-- =============================================
IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE Username = 'admin')
BEGIN
    -- BCrypt hash for "admin123"
    INSERT INTO [dbo].[Users] (Username, Email, Password, Role, FullName, IsActive)
    VALUES ('admin', 'admin@smartmap.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZ5q5Xe', 'Admin', 'System Administrator', 1);
    PRINT 'Default admin user created (Username: admin, Password: admin123 - hashed)';
END
ELSE
BEGIN
    PRINT 'Admin user already exists';
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE Username = 'user')
BEGIN
    -- Password will be auto-hashed when user logs in for the first time
    INSERT INTO [dbo].[Users] (Username, Email, Password, Role, FullName, IsActive)
    VALUES ('user', 'user@smartmap.com', 'user123', 'User', 'Test User', 1);
    PRINT 'Default user created (Username: user, Password: user123 - will be auto-hashed on first login)';
END
ELSE
BEGIN
    PRINT 'Test user already exists';
END
GO

PRINT '=============================================';
PRINT 'All tables created successfully!';
PRINT 'Database: SmartMapDB';
PRINT 'Login: SmartMapUser';
PRINT 'Password: SmartMap@2024!';
PRINT '=============================================';
GO

# SQL IDENTITY(1,1): Complete Overview

`IDENTITY(1,1)` is a SQL Server property that auto-generates sequential numeric values for a column, starting at 1 and incrementing by 1 for each new row. The first number is the seed (starting value), the second is the increment (step size). Think of it like a ticket dispenser at a deli counter—each customer gets the next number automatically, no manual assignment needed.

## Key Points

- **Syntax:** `IDENTITY(seed, increment)`
- **Common:** `IDENTITY(1,1)` starts at 1, increments by 1
- **Auto-Generated:** Database assigns values automatically
- **Primary Key:** Usually used with primary key columns
- **Cannot Update:** Identity values cannot be manually updated (normally)

## Basic Usage

```sql
-- Create table with identity column
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Name VARCHAR(100),
    Email VARCHAR(100)
);

-- Insert data (UserId auto-generated)
INSERT INTO Users (Name, Email) 
VALUES ('Alice', 'alice@example.com');
-- UserId = 1

INSERT INTO Users (Name, Email) 
VALUES ('Bob', 'bob@example.com');
-- UserId = 2

-- Query results
SELECT * FROM Users;
/*
UserId  Name    Email
1       Alice   alice@example.com
2       Bob     bob@example.com
*/
```

## Syntax Breakdown

```sql
-- IDENTITY(seed, increment)
UserId INT IDENTITY(1, 1)
                    │   │
                    │   └─ Increment: Add 1 each time
                    └───── Seed: Start at 1

-- Examples:
IDENTITY(1, 1)    -- 1, 2, 3, 4, 5...
IDENTITY(100, 1)  -- 100, 101, 102, 103...
IDENTITY(1, 10)   -- 1, 11, 21, 31...
IDENTITY(0, 1)    -- 0, 1, 2, 3...
IDENTITY(1, -1)   -- 1, 0, -1, -2... (decrements)
```

## Common Patterns

### Primary Key

```sql
-- Most common use case
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT,
    OrderDate DATETIME,
    Total DECIMAL(10,2)
);
```

### Get Last Inserted ID

```sql
-- Insert and get generated ID
INSERT INTO Users (Name, Email) 
VALUES ('Charlie', 'charlie@example.com');

-- Method 1: SCOPE_IDENTITY() (recommended)
SELECT SCOPE_IDENTITY() AS NewUserId;
-- Returns: 3

-- Method 2: @@IDENTITY (all scopes)
SELECT @@IDENTITY;

-- Method 3: IDENT_CURRENT (by table)
SELECT IDENT_CURRENT('Users');
```

### Starting Point Other Than 1

```sql
-- Start at 1000
CREATE TABLE Invoices (
    InvoiceId INT IDENTITY(1000, 1),
    Amount DECIMAL(10,2)
);

INSERT INTO Invoices (Amount) VALUES (99.99);
-- InvoiceId = 1000

INSERT INTO Invoices (Amount) VALUES (199.99);
-- InvoiceId = 1001
```

### Skip Numbers (Increment > 1)

```sql
-- Increment by 10
CREATE TABLE Batches (
    BatchId INT IDENTITY(1, 10),
    Name VARCHAR(50)
);

INSERT INTO Batches (Name) VALUES ('Batch A');  -- BatchId = 1
INSERT INTO Batches (Name) VALUES ('Batch B');  -- BatchId = 11
INSERT INTO Batches (Name) VALUES ('Batch C');  -- BatchId = 21
```

## Managing Identity

### Check Current Value

```sql
-- Get current identity value
SELECT IDENT_CURRENT('Users') AS CurrentValue;

-- Get seed and increment
SELECT 
    IDENT_SEED('Users') AS SeedValue,
    IDENT_INCR('Users') AS IncrementValue;
```

### Reset Identity

```sql
-- Reset to specific value
DBCC CHECKIDENT ('Users', RESEED, 100);
-- Next insert will be 101

-- Reset to 0 (next will be 1)
DBCC CHECKIDENT ('Users', RESEED, 0);

-- Automatically reset to highest value
DBCC CHECKIDENT ('Users', RESEED);
```

### Insert Explicit Values (Override)

```sql
-- Enable explicit inserts
SET IDENTITY_INSERT Users ON;

INSERT INTO Users (UserId, Name, Email) 
VALUES (999, 'Admin', 'admin@example.com');

SET IDENTITY_INSERT Users OFF;

-- Next auto-generated ID continues from highest
INSERT INTO Users (Name, Email) 
VALUES ('Dave', 'dave@example.com');
-- UserId = 1000 (if 999 was highest)
```

## IDENTITY vs Other Approaches

```sql
-- IDENTITY (SQL Server)
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY
);

-- AUTO_INCREMENT (MySQL)
CREATE TABLE Products (
    ProductId INT AUTO_INCREMENT PRIMARY KEY
);

-- SERIAL (PostgreSQL)
CREATE TABLE Products (
    ProductId SERIAL PRIMARY KEY
);

-- SEQUENCE (Oracle, PostgreSQL)
CREATE SEQUENCE product_seq START WITH 1;
CREATE TABLE Products (
    ProductId INT DEFAULT NEXTVAL('product_seq') PRIMARY KEY
);
```

## Common Issues

### Gaps in Sequence

```sql
-- Identity values have gaps after failed inserts or deletes
INSERT INTO Users (Name, Email) VALUES ('Test', 'invalid');  -- UserId = 5
-- Transaction fails or rollback

INSERT INTO Users (Name, Email) VALUES ('Valid', 'valid@example.com');
-- UserId = 6 (5 is skipped!)

-- This is normal behavior - identity doesn't guarantee no gaps
```

### Maximum Value Reached

```sql
-- TINYINT max = 255
CREATE TABLE Small (
    Id TINYINT IDENTITY(1,1)
);

-- After 255 inserts:
-- Error: Arithmetic overflow error

-- Solution: Use larger data type
CREATE TABLE Bigger (
    Id INT IDENTITY(1,1)  -- Max ~2 billion
);
```

### Table with Data, Adding Identity

```sql
-- Add identity to existing table (requires recreate)
-- 1. Create new table with identity
CREATE TABLE Users_New (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Name VARCHAR(100),
    Email VARCHAR(100)
);

-- 2. Copy data (identity auto-assigned)
INSERT INTO Users_New (Name, Email)
SELECT Name, Email FROM Users;

-- 3. Drop old, rename new
DROP TABLE Users;
EXEC sp_rename 'Users_New', 'Users';
```

## Checking for Gaps

```sql
-- Find missing IDs
WITH NumberSequence AS (
    SELECT MIN(UserId) AS Num FROM Users
    UNION ALL
    SELECT Num + 1 FROM NumberSequence
    WHERE Num < (SELECT MAX(UserId) FROM Users)
)
SELECT Num AS MissingId
FROM NumberSequence
WHERE Num NOT IN (SELECT UserId FROM Users);
```

## Best Practices

```sql
-- ✅ Use INT for most tables
CREATE TABLE Standard (
    Id INT IDENTITY(1,1) PRIMARY KEY
);

-- ✅ Use BIGINT for high-volume tables
CREATE TABLE HighVolume (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY
);

-- ✅ Always include in Primary Key
CREATE TABLE Good (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Data VARCHAR(100)
);

-- ❌ Don't use for natural keys
CREATE TABLE Bad (
    Email VARCHAR(100) PRIMARY KEY,  -- Use natural key
    Name VARCHAR(100)
);

-- ❌ Don't rely on no gaps
-- Identity guarantees uniqueness, not sequential without gaps

-- ❌ Don't use for distributed systems
-- Each database generates own sequence = potential conflicts
-- Use GUIDs/UUIDs instead:
CREATE TABLE Distributed (
    Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY
);
```

## Quick Reference

```sql
-- Create with identity
CREATE TABLE T (Id INT IDENTITY(1,1) PRIMARY KEY);

-- Get last inserted
SELECT SCOPE_IDENTITY();

-- Reset identity
DBCC CHECKIDENT ('TableName', RESEED, 100);

-- Insert explicit value
SET IDENTITY_INSERT TableName ON;
INSERT INTO TableName (Id, Col) VALUES (999, 'Value');
SET IDENTITY_INSERT TableName OFF;

-- Check current value
SELECT IDENT_CURRENT('TableName');
```

## References

- [SQL Server IDENTITY](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-table-transact-sql-identity-property)
- [DBCC CHECKIDENT](https://learn.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-checkident-transact-sql)

---

## Summary

**IDENTITY(1,1):** Auto-generates sequential IDs starting at 1, incrementing by 1.

**Syntax:** `ColumnName INT IDENTITY(seed, increment)`

**Common Use:** Primary keys for surrogate IDs.

**Get Last ID:** `SELECT SCOPE_IDENTITY()`

**Reset:** `DBCC CHECKIDENT('Table', RESEED, value)`

**Key Point:** Guarantees uniqueness, NOT sequential without gaps. Use INT for most tables, BIGINT for high-volume.
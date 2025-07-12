-- SQLite
-- Create Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
INSERT INTO users (name, email, password, role) 
VALUES ('Admin', 'admin@example.com', 'admin123', 'admin');

-- Create Rental History Table
CREATE TABLE IF NOT EXISTS RentalHistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    car_name TEXT NOT NULL,
    rental_date TEXT NOT NULL,
    return_date TEXT NOT NULL,
    price INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
ALTER TABLE RentalHistory ADD COLUMN return_date TEXT;


-- Sample Users
INSERT INTO Users (name, email, password) VALUES
('John Doe', 'john@example.com', 'password123'),
('Jane Smith', 'jane@example.com', 'securepass'),
('Alice Brown', 'alice@example.com', 'alicepass');

-- Sample Rental History
INSERT INTO RentalHistory (user_id, car_name, rental_date, return_date, price) VALUES
(1, 'Chevrolet Camaro', '2024-02-10', '2024-02-15', 350),
(2, 'Honda Civic', '2024-01-20', '2024-01-25', 275),
(3, 'Ford Explorer', '2024-03-01', '2024-03-10', 700);

CREATE DATABASE IF NOT EXISTS gestion_contacts;
USE gestion_contacts;

CREATE TABLE contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    avatar VARCHAR(255) NOT NULL DEFAULT 'default.png',
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    category ENUM('ami', 'famille', 'professionnel') NOT NULL DEFAULT 'ami',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
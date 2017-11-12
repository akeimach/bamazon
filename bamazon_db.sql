DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
    item_id INTEGER(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    product_sales DECIMAL(10,2) DEFAULT 0,
    department_name VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER(11) NOT NULL DEFAULT 0
);


INSERT INTO products (product_name, department_name, price) VALUES
("Fujifilm Instax Mini 9", "Camera & Photo", 59.66),
("Polaroid 2x3 inch Premium Photo Paper", "Camera & Photo", 23.38),
("Small Compact Lightweight Binoculars", "Camera & Photo", 22.99),
("Monocular Telescope, 16X52 Dual Focus", "Camera & Photo", 18.98),
("Celestron 21035 70mm Travel Scope", "Camera & Photo", 59.99),
("Nikon AF-S DX NIKKOR 35mm f/1.8G Lens", "Camera & Photo", 166.95),
("Microsoft Surface Dock", "Computers & Accessories", 125.99),
("Apple iPad with WiFi, 32GB, Space Grey", "Computers & Accessories", 329.99),
("AmazonBasics Adjustable Tablet Stand", "Computers & Accessories", 8.99);


CREATE TABLE departments (
    department_id INTEGER(11) AUTO_INCREMENT PRIMARY KEY NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    over_head_costs DECIMAL(10,2) NOT NULL
);

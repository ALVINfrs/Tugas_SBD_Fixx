-- Create database
CREATE DATABASE IF NOT EXISTS kopi_kenangan_senja;

USE kopi_kenangan_senja;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255) NOT NULL,
  category ENUM('coffee', 'non-coffee', 'snack') NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  order_number VARCHAR(50) UNIQUE,
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('bank', 'cod') NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Insert sample products
INSERT INTO products (name, description, price, image, category, is_featured) VALUES
('Kopi Arabika', 'Kopi premium dengan biji pilihan asal Toraja', 25000, 'img/products/kopi-arabika.jpg', 'coffee', 1),
('Kopi Robusta', 'Kopi dengan rasa kuat dan pahit khas Indonesia', 22000, 'img/products/kopi-robusta.jpg', 'coffee', 1),
('Kopi Latte', 'Kombinasi espresso dan susu dengan latte art spesial', 28000, 'img/products/kopi-latte.jpg', 'coffee', 1),
('Matcha Latte', 'Teh hijau premium dengan susu', 30000, 'img/products/matcha-latte.jpg', 'non-coffee', 0),
('Chocolate Frappe', 'Minuman coklat dingin dengan whipped cream', 32000, 'img/products/chocolate-frappe.jpg', 'non-coffee', 0),
('Croissant', 'Pastry renyah dengan lapisan mentega', 18000, 'img/products/croissant.jpg', 'snack', 0),
('Cookies', 'Cookies coklat chip dengan tekstur crunchy', 15000, 'img/products/cookies.jpg', 'snack', 0),
('Tea', 'Teh premium dengan pilihan rasa', 20000, 'img/products/tea.jpg', 'non-coffee', 0);

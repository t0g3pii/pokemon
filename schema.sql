CREATE DATABASE IF NOT EXISTS pokemon_go_research;

USE pokemon_go_research;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  isAdmin BOOLEAN DEFAULT FALSE
);

CREATE TABLE field_researches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  current_stage INT DEFAULT 1,
  total_stages INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE missions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_research_id INT,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (field_research_id) REFERENCES field_researches(id) ON DELETE CASCADE
);

CREATE TABLE rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_research_id INT,
  description TEXT NOT NULL,
  obtained BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (field_research_id) REFERENCES field_researches(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS schools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(75) NOT NULL,
  city VARCHAR(35) NOT NULL,
  contact VARCHAR(12) NOT NULL,
  email VARCHAR(55) NOT NULL,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 
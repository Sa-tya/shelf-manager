CREATE TABLE IF NOT EXISTS booklist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  school_id INT NOT NULL,
  class VARCHAR(5) NOT NULL,
  expected_count INT NOT NULL DEFAULT 0,
  sell_count INT NOT NULL DEFAULT 0,
  session YEAR NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  UNIQUE KEY unique_school_class_session (school_id, class, session)
); 
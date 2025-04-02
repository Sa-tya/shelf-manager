CREATE TABLE IF NOT EXISTS booklist_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT NOT NULL,
  booklist_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (booklist_id) REFERENCES booklist(id) ON DELETE CASCADE,
  UNIQUE KEY unique_book_booklist (book_id, booklist_id)
); 
Booknames attributes:

- id
- book-name-id
- company-id (foreign key to publication table)
- name
- subject-id (foreign key to subject table)


Publication attributes:

- id
- pub-id
- name
- city

Subject attributes:

- id
- subject-id
- name

School attributes:

- id
- school-id
- name
- city
- c-number
- email
<!-- - [booklist-id] (foreign key to booklist table) -->

Books attributes:

- id
- name (foreign key (id) to booknames table)
- class
- price
- quantity

booklist attributes:

- id
- session
- school-id (foreign key to school table)
<!-- - [book-id] (foreign key to books table) -->
- class
- expected-count
- sell-count

booklist-item attributes:

- id
- booklist-id (foreign key to booklist table)
- book-id (foreign key to books table)


CREATE TABLE booknames (
    ->     id INT AUTO_INCREMENT PRIMARY KEY,
    ->     book_name_id VARCHAR(10) NOT NULL UNIQUE,
    ->     company_id INT,
    ->     name VARCHAR(55) NOT NULL,
    ->     subject_id INT,
    ->     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ->     FOREIGN KEY (company_id) REFERENCES publications(id),
    ->     FOREIGN KEY (subject_id) REFERENCES subjects(id)
    -> );

CREATE TABLE publications (
    ->     id INT AUTO_INCREMENT PRIMARY KEY,
    ->     pubid VARCHAR(10) NOT NULL UNIQUE,
    ->     name VARCHAR(55) NOT NULL,
    ->     city VARCHAR(30) NOT NULL,
    ->     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -> );

CREATE TABLE subjects (
    ->     id INT AUTO_INCREMENT PRIMARY KEY,
    ->     subid VARCHAR(10) NOT NULL UNIQUE,
    ->     name VARCHAR(50) NOT NULL,
    ->     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -> );
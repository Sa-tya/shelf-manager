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
- [booklist-id] (foreign key to booklist table)

Books attributes:

- id
- name (foreign key (id) to booknames table)
- price
- quantity

booklist attributes:

- id
- session
- school-id (foreign key to school table)
- [book-id] (foreign key to books table)
- class
- expected-count
- sell-count

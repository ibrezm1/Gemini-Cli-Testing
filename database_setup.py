
import sqlite3

# Connect to a new SQLite database
conn = sqlite3.connect('university.db')
cursor = conn.cursor()

# Enable foreign key support
cursor.execute("PRAGMA foreign_keys = ON;")

# Create departments table
cursor.execute('''
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
''')

# Create students table
cursor.execute('''
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments (id)
);
''')

# Create courses table
cursor.execute('''
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments (id)
);
''')

# Create enrollments table for the many-to-many relationship between students and courses
cursor.execute('''
CREATE TABLE IF NOT EXISTS enrollments (
    student_id INTEGER,
    course_id INTEGER,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students (id),
    FOREIGN KEY (course_id) REFERENCES courses (id)
);
''')

# --- Insert Sample Data ---

# Department data
departments = [('Computer Science',), ('Electrical Engineering',), ('Physics',)]
cursor.executemany("INSERT OR IGNORE INTO departments (name) VALUES (?)", departments)

# Get department IDs
dept_map = {name: i+1 for i, (name,) in enumerate(departments)}


# Student data
students = [
    ('Alice', dept_map['Computer Science']),
    ('Bob', dept_map['Electrical Engineering']),
    ('Charlie', dept_map['Computer Science']),
    ('David', dept_map['Physics'])
]
cursor.executemany("INSERT INTO students (name, department_id) VALUES (?, ?)", students)

# Get student IDs
student_map = {name: i+1 for i, (name, _) in enumerate(students)}


# Course data
courses = [
    ('Introduction to Python', dept_map['Computer Science']),
    ('Circuits 101', dept_map['Electrical Engineering']),
    ('Quantum Mechanics', dept_map['Physics']),
    ('Data Structures', dept_map['Computer Science'])
]
cursor.executemany("INSERT INTO courses (name, department_id) VALUES (?, ?)", courses)

# Get course IDs
course_map = {name: i+1 for i, (name, _) in enumerate(courses)}


# Enrollment data
enrollments = [
    (student_map['Alice'], course_map['Introduction to Python']),
    (student_map['Alice'], course_map['Data Structures']),
    (student_map['Bob'], course_map['Circuits 101']),
    (student_map['Charlie'], course_map['Data Structures']),
    (student_map['David'], course_map['Quantum Mechanics']),
    (student_map['David'], course_map['Introduction to Python'])
]
cursor.executemany("INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)", enrollments)


# Commit changes and close the connection
conn.commit()
conn.close()

print("Database 'university.db' created successfully with sample data.")

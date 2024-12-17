CREATE DATABASE glassdoor_db;

\c glassdoor_db; 
CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(14) PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(14) PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(14) PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teacher_subject (
  id VARCHAR(14) PRIMARY KEY,
  teacher_id VARCHAR(14) NOT NULL REFERENCES teachers (id),
  subject_id VARCHAR(14) NOT NULL REFERENCES subjects (id)
);

CREATE TABLE IF NOT EXISTS ratings (
  id VARCHAR(14) PRIMARY KEY,
  teacher_id VARCHAR(14) NOT NULL REFERENCES teachers (id),
  student_id VARCHAR(14) NOT NULL REFERENCES students (id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), 
  comment TEXT NOT NULL, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

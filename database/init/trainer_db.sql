-- trainer_db — mirrors com.apex.trainer.entity.Trainer, GymClass
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS trainers (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(64),
  specialization VARCHAR(512),
  bio TEXT,
  experience_years INT,
  status VARCHAR(32),
  created_at DATETIME(6),
  updated_at DATETIME(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_trainers_user_id (user_id),
  UNIQUE KEY uk_trainers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gym_classes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  trainer_id BIGINT NOT NULL,
  trainer_name VARCHAR(255),
  class_date_time DATETIME(6) NOT NULL,
  duration_minutes INT,
  max_capacity INT,
  current_enrollment INT,
  status VARCHAR(32),
  class_type VARCHAR(32),
  created_at DATETIME(6),
  updated_at DATETIME(6),
  PRIMARY KEY (id),
  KEY idx_gym_classes_trainer (trainer_id),
  KEY idx_gym_classes_start (class_date_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

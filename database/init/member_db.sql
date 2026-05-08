-- member_db — mirrors com.apex.member.entity.Member, ClassBooking
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS members (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(64),
  address VARCHAR(1024),
  membership_type VARCHAR(32),
  status VARCHAR(32),
  membership_start_date DATE,
  membership_end_date DATE,
  created_at DATETIME(6),
  updated_at DATETIME(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_members_user_id (user_id),
  UNIQUE KEY uk_members_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS class_bookings (
  id BIGINT NOT NULL AUTO_INCREMENT,
  member_id BIGINT NOT NULL,
  class_id BIGINT NOT NULL,
  class_name VARCHAR(255),
  trainer_name VARCHAR(255),
  class_date_time DATETIME(6),
  status VARCHAR(32),
  booked_at DATETIME(6),
  cancelled_at DATETIME(6),
  notes TEXT,
  PRIMARY KEY (id),
  KEY idx_bookings_member (member_id),
  KEY idx_bookings_class (class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

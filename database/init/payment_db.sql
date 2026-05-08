-- payment_db — mirrors Payment, MembershipPlan, PaymentMethod
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT NOT NULL AUTO_INCREMENT,
  member_id BIGINT NOT NULL,
  member_name VARCHAR(255),
  member_email VARCHAR(255),
  plan_id BIGINT,
  plan_name VARCHAR(255),
  related_class_id BIGINT,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(16) NOT NULL,
  status VARCHAR(32),
  payment_type VARCHAR(32),
  description TEXT,
  transaction_reference VARCHAR(255),
  paid_at DATETIME(6),
  created_at DATETIME(6),
  updated_at DATETIME(6),
  PRIMARY KEY (id),
  KEY idx_payments_member (member_id),
  KEY idx_payments_type (payment_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS membership_plans (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INT,
  classes_included INT,
  personal_training_included BIT(1),
  active BIT(1),
  created_at DATETIME(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_plan_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_methods (
  id BIGINT NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(512),
  icon VARCHAR(255) NOT NULL,
  is_active BIT(1) NOT NULL,
  display_order INT,
  type VARCHAR(32),
  PRIMARY KEY (id),
  UNIQUE KEY uk_payment_methods_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

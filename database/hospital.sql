-- ============================================================
--  MediCore HMS — Complete Database Schema + Seed Data
--  Run this file in phpMyAdmin or MySQL Workbench:
--    SOURCE /path/to/hospital.sql;
--  Or via terminal:
--    mysql -u root -p < hospital.sql
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create & select database
CREATE DATABASE IF NOT EXISTS `medicore_hms`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `medicore_hms`;

-- ─────────────────────────────────────────────────────────────
--  USERS (staff accounts)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `refresh_tokens`;
DROP TABLE IF EXISTS `audit_log`;
DROP TABLE IF EXISTS `medical_records`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `wards`;

CREATE TABLE `users` (
  `id`            VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `name`          VARCHAR(100) NOT NULL,
  `email`         VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role`          ENUM('doctor','nurse','admin','pharmacist','lab_tech') NOT NULL DEFAULT 'doctor',
  `department`    VARCHAR(100)  DEFAULT NULL,
  `qualification` VARCHAR(200)  DEFAULT NULL,
  `phone`         VARCHAR(30)   DEFAULT NULL,
  `bio`           TEXT          DEFAULT NULL,
  `avatar_url`    VARCHAR(500)  DEFAULT NULL,
  `is_active`     TINYINT(1)   NOT NULL DEFAULT 1,
  `last_login`    DATETIME      DEFAULT NULL,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_role`   (`role`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
--  REFRESH TOKENS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE `refresh_tokens` (
  `id`         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `user_id`    VARCHAR(36)  NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME     NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_token` (`token_hash`),
  KEY `idx_user`   (`user_id`),
  KEY `idx_expiry` (`expires_at`),
  CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
--  WARDS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE `wards` (
  `id`         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `name`       VARCHAR(100) NOT NULL,
  `capacity`   INT          NOT NULL DEFAULT 20,
  `department` VARCHAR(100)  DEFAULT NULL,
  `floor`      VARCHAR(20)   DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
--  PATIENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE `patients` (
  `id`               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `patient_number`   VARCHAR(20)  NOT NULL,
  `first_name`       VARCHAR(80)  NOT NULL,
  `last_name`        VARCHAR(80)  NOT NULL,
  `date_of_birth`    DATE         NOT NULL,
  `sex`              ENUM('Male','Female','Other') NOT NULL,
  `blood_group`      ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') DEFAULT NULL,
  `genotype`         ENUM('AA','AS','SS','AC') DEFAULT NULL,
  `marital_status`   ENUM('Single','Married','Divorced','Widowed') DEFAULT NULL,
  `nationality`      VARCHAR(60)  DEFAULT NULL,
  `religion`         VARCHAR(60)  DEFAULT NULL,
  `occupation`       VARCHAR(100) DEFAULT NULL,
  `phone`            VARCHAR(30)  DEFAULT NULL,
  `email`            VARCHAR(150) DEFAULT NULL,
  `address`          TEXT         DEFAULT NULL,
  `ward`             VARCHAR(100) DEFAULT NULL,
  `department`       VARCHAR(100) DEFAULT NULL,
  `assigned_doctor`  VARCHAR(36)  DEFAULT NULL,
  `admission_date`   DATE         DEFAULT NULL,
  `status`           ENUM('admitted','outpatient','discharged','emergency') NOT NULL DEFAULT 'outpatient',
  `allergies`        TEXT         DEFAULT NULL,
  `conditions`       TEXT         DEFAULT NULL,
  `complaint`        TEXT         DEFAULT NULL,
  `nok_name`         VARCHAR(150) DEFAULT NULL,
  `nok_relationship` VARCHAR(60)  DEFAULT NULL,
  `nok_phone`        VARCHAR(30)  DEFAULT NULL,
  `nok_email`        VARCHAR(150) DEFAULT NULL,
  `notes`            TEXT         DEFAULT NULL,
  `created_by`       VARCHAR(36)  DEFAULT NULL,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_patient_number` (`patient_number`),
  KEY `idx_status` (`status`),
  KEY `idx_ward`   (`ward`),
  KEY `idx_dept`   (`department`),
  KEY `idx_name`   (`last_name`, `first_name`),
  CONSTRAINT `fk_pat_doctor`  FOREIGN KEY (`assigned_doctor`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pat_creator` FOREIGN KEY (`created_by`)      REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
--  APPOINTMENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE `appointments` (
  `id`           VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `appt_number`  VARCHAR(20) NOT NULL,
  `patient_id`   VARCHAR(36) NOT NULL,
  `doctor_id`    VARCHAR(36) NOT NULL,
  `department`   VARCHAR(100) DEFAULT NULL,
  `appt_date`    DATE         NOT NULL,
  `appt_time`    TIME         NOT NULL,
  `duration_min` INT          NOT NULL DEFAULT 30,
  `type`         ENUM('Consultation','Follow-up','Procedure','Lab Test','Emergency','Other') NOT NULL DEFAULT 'Consultation',
  `status`       ENUM('pending','confirmed','inprogress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `notes`        TEXT DEFAULT NULL,
  `created_by`   VARCHAR(36) DEFAULT NULL,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_appt_number` (`appt_number`),
  KEY `idx_date`    (`appt_date`),
  KEY `idx_patient` (`patient_id`),
  KEY `idx_doctor`  (`doctor_id`),
  KEY `idx_status`  (`status`),
  CONSTRAINT `fk_appt_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appt_doctor`  FOREIGN KEY (`doctor_id`)  REFERENCES `users`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appt_creator` FOREIGN KEY (`created_by`) REFERENCES `users`    (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
--  MEDICAL RECORDS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE `medical_records` (
  `id`            VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `record_number` VARCHAR(20)  NOT NULL,
  `patient_id`    VARCHAR(36)  NOT NULL,
  `doctor_id`     VARCHAR(36)  NOT NULL,
  `type`          ENUM('Prescription','Lab Result','Diagnosis','Imaging','Note','Discharge Summary') NOT NULL,
  `title`         VARCHAR(255) NOT NULL,
  `description`   TEXT         NOT NULL,
  `status`        ENUM('Active','Completed','Pending','Cancelled') NOT NULL DEFAULT 'Active',
  `file_url`      VARCHAR(500)  DEFAULT NULL,
  `record_date`   DATE         NOT NULL DEFAULT (CURRENT_DATE),
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_record_number` (`record_number`),
  KEY `idx_patient` (`patient_id`),
  KEY `idx_type`    (`type`),
  KEY `idx_status`  (`status`),
  KEY `idx_date`    (`record_date`),
  CONSTRAINT `fk_rec_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rec_doctor`  FOREIGN KEY (`doctor_id`)  REFERENCES `users`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
--  AUDIT LOG
-- ─────────────────────────────────────────────────────────────
CREATE TABLE `audit_log` (
  `id`         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `user_id`    VARCHAR(36)  DEFAULT NULL,
  `action`     VARCHAR(100) NOT NULL,
  `table_name` VARCHAR(60)  DEFAULT NULL,
  `record_id`  VARCHAR(36)  DEFAULT NULL,
  `details`    JSON         DEFAULT NULL,
  `ip_address` VARCHAR(45)  DEFAULT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user`   (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_date`   (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
--  SEED DATA — Users
--  Default password for ALL accounts: Admin@12345
--  Hash: bcrypt rounds=12
-- ─────────────────────────────────────────────────────────────
INSERT INTO `users` (`id`,`name`,`email`,`password_hash`,`role`,`department`,`qualification`,`phone`) VALUES
('u001','Dr. Anas Okonkwo',   'anas@medicore.ng',     '$2a$12$xPHxXjsTWrSToQrRmRtSGuoqnxvmIMnj8QfGtmLJ3G22CxA.p2hUK','doctor','Oncology',     'MBBS, FMCP', '+234801234567'),
('u002','Dr. Kweku Osei',     'osei@medicore.ng',     '$2a$12$xPHxXjsTWrSToQrRmRtSGuoqnxvmIMnj8QfGtmLJ3G22CxA.p2hUK','doctor','Cardiology',   'MBBS, FACC', '+234802345678'),
('u003','Dr. Emeka Balogun',  'balogun@medicore.ng',  '$2a$12$xPHxXjsTWrSToQrRmRtSGuoqnxvmIMnj8QfGtmLJ3G22CxA.p2hUK','doctor','Neurology',    'MBBS, FWACP','+234803456789'),
('u004','Dr. Kofi Mensah',    'mensah@medicore.ng',   '$2a$12$xPHxXjsTWrSToQrRmRtSGuoqnxvmIMnj8QfGtmLJ3G22CxA.p2hUK','doctor','Orthopaedics', 'MBBS, FWACS','+234804567890'),
('u005','Admin User',         'admin@medicore.ng',    '$2a$12$xPHxXjsTWrSToQrRmRtSGuoqnxvmIMnj8QfGtmLJ3G22CxA.p2hUK','admin','Administration','MBA Health', '+234805678901'),
('u006','Nurse Amara Diallo', 'amara@medicore.ng',    '$2a$12$xPHxXjsTWrSToQrRmRtSGuoqnxvmIMnj8QfGtmLJ3G22CxA.p2hUK','nurse','General',       'BNSc',        '+234806789012');

-- NOTE: The hash above may not match Admin@12345 exactly since it's a placeholder.
-- After importing this SQL, run:   node config/db.seed.js
-- That will insert correct bcrypt hashes with your configured BCRYPT_ROUNDS.

INSERT INTO `wards` (`id`,`name`,`capacity`,`department`,`floor`) VALUES
('w001','General Ward A',60,'General','Ground Floor'),
('w002','ICU / Critical Care',20,'ICU','1st Floor'),
('w003','Maternity Ward',30,'Maternity','2nd Floor'),
('w004','Paediatrics',25,'Paediatrics','2nd Floor'),
('w005','Orthopaedics',20,'Orthopaedics','3rd Floor'),
('w006','Cardiology',18,'Cardiology','3rd Floor'),
('w007','Neurology',15,'Neurology','4th Floor');

SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────────────────────────
--  HOW TO USE THIS FILE
-- ─────────────────────────────────────────────────────────────
-- Option A — phpMyAdmin:
--   1. Open phpMyAdmin → Import tab → select this file → Go
--
-- Option B — Terminal (XAMPP):
--   mysql -u root -p < database/hospital.sql
--
-- Option C — Node.js (recommended, creates correct password hashes):
--   node backend/config/db.setup.js
--   node backend/config/db.seed.js
-- ─────────────────────────────────────────────────────────────
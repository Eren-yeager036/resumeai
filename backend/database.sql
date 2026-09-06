-- ==========================================================
-- ResumeAI Database Schema for MySQL / XAMPP
-- Database Name: resumeai_db
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `resumeai_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `resumeai_db`;

-- ----------------------------------------------------------
-- 1. Users Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uid` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) DEFAULT NULL,
  `photo_url` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`email`),
  INDEX (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Resumes Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `resumes` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `title` VARCHAR(255) NOT NULL DEFAULT 'Untitled Resume',
  `theme` VARCHAR(50) DEFAULT 'modern',
  `theme_color` VARCHAR(50) DEFAULT '#4f46e5',
  `data` LONGTEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  CONSTRAINT `fk_resumes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Jobs Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) DEFAULT 'Remote',
  `type` VARCHAR(50) DEFAULT 'Full-time',
  `salary` VARCHAR(100) DEFAULT 'Competitive',
  `experience` VARCHAR(100) DEFAULT 'Entry Level',
  `description` TEXT DEFAULT NULL,
  `skills` TEXT DEFAULT NULL,
  `apply_url` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Job Applications Table
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `job_applications` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(100) NOT NULL,
  `job_id` VARCHAR(100) NOT NULL,
  `job_title` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `applicant_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `resume_id` VARCHAR(100) DEFAULT NULL,
  `match_score` INT DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'Submitted',
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  INDEX (`job_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

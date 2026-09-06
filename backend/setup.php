<?php
/**
 * One-Click Database Setup Script for XAMPP
 * Access in browser: http://localhost/resumeai-api/setup.php
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

define('DB_HOST', 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com');
define('DB_PORT', 4000);
define('DB_USER', '2z6DTRFFH7F1ueo.root');
define('DB_PASS', 'JYHv7KEyMpJTte5C');
define('DB_NAME', 'resumeai_db');

try {
    $caFiles = [
        'D:/xampp/apache/bin/curl-ca-bundle.crt',
        'D:/xampp/perl/vendor/lib/Mozilla/CA/cacert.pem',
        'D:/xampp/php/extras/ssl/cacert.pem',
        'C:/xampp/apache/bin/curl-ca-bundle.crt',
        'C:/xampp/perl/vendor/lib/Mozilla/CA/cacert.pem',
        'C:/xampp/php/extras/ssl/cacert.pem',
        __DIR__ . '/cacert.pem'
    ];
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
    ];
    foreach ($caFiles as $f) {
        if (file_exists($f)) {
            $options[PDO::MYSQL_ATTR_SSL_CA] = $f;
            break;
        }
    }

    // 1. Connect to MySQL server without DB
    $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4", DB_USER, DB_PASS, $options);

    // 2. Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `" . DB_NAME . "`");

    // Drop any broken table handles
    $pdo->exec("DROP TABLE IF EXISTS `job_applications`");
    $pdo->exec("DROP TABLE IF EXISTS `resumes`");
    $pdo->exec("DROP TABLE IF EXISTS `jobs`");
    $pdo->exec("DROP TABLE IF EXISTS `users`");

    // 3. Create users table
    $pdo->exec("CREATE TABLE `users` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 4. Create resumes table
    $pdo->exec("CREATE TABLE `resumes` (
        `id` VARCHAR(100) NOT NULL PRIMARY KEY,
        `user_id` VARCHAR(100) NOT NULL,
        `title` VARCHAR(255) NOT NULL DEFAULT 'Untitled Resume',
        `theme` VARCHAR(50) DEFAULT 'modern',
        `theme_color` VARCHAR(50) DEFAULT '#4f46e5',
        `data` LONGTEXT NOT NULL,
        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 5. Create jobs table
    $pdo->exec("CREATE TABLE `jobs` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 6. Create job applications table
    $pdo->exec("CREATE TABLE `job_applications` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    echo json_encode([
        'success' => true,
        'message' => 'ResumeAI MySQL Database & Tables initialized successfully!',
        'database' => DB_NAME,
        'tables' => ['users', 'resumes', 'jobs', 'job_applications']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Setup failed: ' . $e->getMessage()
    ]);
}

<?php
/**
 * Database Connection & Global Configuration
 * ResumeAI Backend API
 */

// Enable CORS for frontend requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database credentials with environment variable support (fallback to TiDB Cloud Live Serverless MySQL)
define('DB_HOST', getenv('DB_HOST') ?: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com');
define('DB_PORT', getenv('DB_PORT') ?: 4000);
define('DB_USER', getenv('DB_USER') ?: '2z6DTRFFH7F1ueo.root');
define('DB_PASS', getenv('DB_PASS') ?: 'JYHv7KEyMpJTte5C');
define('DB_NAME', getenv('DB_NAME') ?: 'resumeai_db');

/**
 * Returns a PDO connection instance
 */
function getDbConnection() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            // Search for available SSL CA certificates (for Windows / XAMPP / Linux / Cloud)
            $caFiles = [
                '/etc/ssl/certs/ca-certificates.crt', // Standard Debian/Ubuntu/Render/Docker
                '/etc/pki/tls/certs/ca-bundle.crt',   // CentOS/RHEL/Fedora
                'D:/xampp/apache/bin/curl-ca-bundle.crt',
                'D:/xampp/perl/vendor/lib/Mozilla/CA/cacert.pem',
                'D:/xampp/php/extras/ssl/cacert.pem',
                'C:/xampp/apache/bin/curl-ca-bundle.crt',
                'C:/xampp/perl/vendor/lib/Mozilla/CA/cacert.pem',
                'C:/xampp/php/extras/ssl/cacert.pem',
                __DIR__ . '/cacert.pem'
            ];
            foreach ($caFiles as $f) {
                if (file_exists($f)) {
                    $options[PDO::MYSQL_ATTR_SSL_CA] = $f;
                    break;
                }
            }
            $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;

            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit();
        }
    }
    return $pdo;
}

/**
 * Helper to read JSON request body
 */
function getRequestBody() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

/**
 * Helper to send standardized JSON responses
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

<?php
/**
 * ResumeAI Backend API Entrypoint & Health Check
 */

require_once __DIR__ . '/db.php';

$pdo = null;
$dbConnected = false;
$dbError = null;

try {
    $pdo = getDbConnection();
    if ($pdo) {
        $dbConnected = true;
    }
} catch (Exception $e) {
    $dbError = $e->getMessage();
}

sendResponse([
    'service' => 'ResumeAI Backend REST API',
    'status' => 'online',
    'timestamp' => date('c'),
    'database' => [
        'connected' => $dbConnected,
        'host' => DB_HOST,
        'database' => DB_NAME,
        'error' => $dbError
    ],
    'endpoints' => [
        'auth' => '/auth.php?action=register | login | sync',
        'resumes' => '/resumes.php (GET, POST, DELETE)',
        'applications' => '/applications.php (GET, POST)',
        'jobs' => '/jobs.php (GET, POST)',
        'setup' => '/setup.php (GET)'
    ]
]);

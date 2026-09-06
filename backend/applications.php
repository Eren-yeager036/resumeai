<?php
/**
 * Job Applications API
 * Endpoints:
 *   GET  /applications.php?userId=...
 *   POST /applications.php
 */

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['userId'] ?? null;
    if ($userId) {
        $stmt = $pdo->prepare("SELECT * FROM job_applications WHERE user_id = ? ORDER BY submitted_at DESC");
        $stmt->execute([$userId]);
    } else {
        $stmt = $pdo->query("SELECT * FROM job_applications ORDER BY submitted_at DESC");
    }

    $apps = $stmt->fetchAll();
    sendResponse($apps);
}

if ($method === 'POST') {
    $body = getRequestBody();
    $id = $body['id'] ?? ('app_' . time() . '_' . substr(md5(uniqid()), 0, 4));
    $userId = $body['userId'] ?? $body['user_id'] ?? 'guest';
    $jobId = $body['jobId'] ?? $body['job_id'] ?? '';
    $jobTitle = $body['jobTitle'] ?? $body['job_title'] ?? 'Role';
    $company = $body['company'] ?? 'Company';
    $applicantName = $body['applicantName'] ?? $body['applicant_name'] ?? 'Applicant';
    $email = $body['email'] ?? '';
    $resumeId = $body['resumeId'] ?? $body['resume_id'] ?? null;
    $matchScore = intval($body['matchScore'] ?? $body['match_score'] ?? 0);
    $status = $body['status'] ?? 'Submitted';

    $stmt = $pdo->prepare("
        INSERT INTO job_applications (id, user_id, job_id, job_title, company, applicant_name, email, resume_id, match_score, status, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            match_score = VALUES(match_score)
    ");
    $stmt->execute([$id, $userId, $jobId, $jobTitle, $company, $applicantName, $email, $resumeId, $matchScore, $status]);

    sendResponse([
        'success' => true,
        'status' => 'success',
        'storage' => 'mysql',
        'id' => $id
    ]);
}

sendResponse(['success' => false, 'message' => 'Method not allowed'], 405);

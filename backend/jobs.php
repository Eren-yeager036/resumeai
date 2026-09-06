<?php
/**
 * Jobs API
 * Endpoints:
 *   GET  /jobs.php
 *   POST /jobs.php
 */

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM jobs ORDER BY created_at DESC");
    $jobs = $stmt->fetchAll();
    
    $result = array_map(function($j) {
        $j['skills'] = json_decode($j['skills'], true) ?? [];
        return $j;
    }, $jobs);

    sendResponse($result);
}

if ($method === 'POST') {
    $body = getRequestBody();
    $id = $body['id'] ?? ('job_' . time() . '_' . substr(md5(uniqid()), 0, 4));
    $title = $body['title'] ?? 'Software Engineer';
    $company = $body['company'] ?? 'Tech Corp';
    $location = $body['location'] ?? 'Remote';
    $type = $body['type'] ?? 'Full-time';
    $salary = $body['salary'] ?? 'Competitive';
    $experience = $body['experience'] ?? 'Entry Level';
    $description = $body['description'] ?? '';
    $skills = is_array($body['skills'] ?? null) ? json_encode($body['skills']) : ($body['skills'] ?? '[]');
    $applyUrl = $body['apply_url'] ?? $body['applyUrl'] ?? '';

    $stmt = $pdo->prepare("
        INSERT INTO jobs (id, title, company, location, type, salary, experience, description, skills, apply_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([$id, $title, $company, $location, $type, $salary, $experience, $description, $skills, $applyUrl]);

    sendResponse([
        'success' => true,
        'message' => 'Job created successfully',
        'id' => $id
    ], 201);
}

sendResponse(['success' => false, 'message' => 'Method not allowed'], 405);

<?php
/**
 * Resumes API
 * Endpoints:
 *   GET    /resumes.php?userId=...
 *   GET    /resumes.php?id=...
 *   POST   /resumes.php
 *   DELETE /resumes.php?id=...&userId=...
 */

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// 1. Fetch resumes
if ($method === 'GET') {
    if (!empty($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM resumes WHERE id = ? LIMIT 1");
        $stmt->execute([$_GET['id']]);
        $row = $stmt->fetch();
        if ($row) {
            $row['data'] = json_decode($row['data'], true);
            sendResponse(['success' => true, 'resume' => $row]);
        } else {
            sendResponse(['success' => false, 'message' => 'Resume not found'], 404);
        }
    }

    $userId = $_GET['userId'] ?? 'guest';
    $stmt = $pdo->prepare("SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC");
    $stmt->execute([$userId]);
    $resumes = $stmt->fetchAll();

    $result = array_map(function($r) {
        return [
            'id' => $r['id'],
            'userId' => $r['user_id'],
            'user_id' => $r['user_id'],
            'title' => $r['title'],
            'theme' => $r['theme'],
            'themeColor' => $r['theme_color'],
            'theme_color' => $r['theme_color'],
            'data' => json_decode($r['data'], true) ?? [],
            'updatedAt' => $r['updated_at'],
            'createdAt' => $r['created_at']
        ];
    }, $resumes);

    sendResponse($result);
}

// 2. Create or Update Resume
if ($method === 'POST') {
    $body = getRequestBody();
    $userId = $body['userId'] ?? $body['user_id'] ?? 'guest';
    $id = $body['id'] ?? ('resume_' . time() . '_' . substr(md5(uniqid()), 0, 4));
    $title = $body['title'] ?? 'Untitled Resume';
    $theme = $body['theme'] ?? 'modern';
    $themeColor = $body['themeColor'] ?? $body['theme_color'] ?? '#4f46e5';
    $dataJson = is_array($body['data'] ?? null) ? json_encode($body['data']) : ($body['data'] ?? '{}');

    // Ensure user exists first if foreign key
    $userStmt = $pdo->prepare("INSERT IGNORE INTO users (uid, name, email) VALUES (?, ?, ?)");
    $userStmt->execute([$userId, 'User', $userId . '@example.com']);

    $stmt = $pdo->prepare("
        INSERT INTO resumes (id, user_id, title, theme, theme_color, data, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            theme = VALUES(theme),
            theme_color = VALUES(theme_color),
            data = VALUES(data),
            updated_at = NOW()
    ");
    $stmt->execute([$id, $userId, $title, $theme, $themeColor, $dataJson]);

    sendResponse([
        'success' => true,
        'status' => 'success',
        'storage' => 'mysql',
        'resumeId' => $id
    ]);
}

// 3. Delete Resume
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        sendResponse(['success' => false, 'message' => 'Resume ID required'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM resumes WHERE id = ?");
    $stmt->execute([$id]);

    sendResponse([
        'success' => true,
        'status' => 'success',
        'message' => 'Resume deleted successfully'
    ]);
}

sendResponse(['success' => false, 'message' => 'Method not allowed'], 405);

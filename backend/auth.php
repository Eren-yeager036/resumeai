<?php
/**
 * Authentication API (Register, Login, Sync Profile)
 * Endpoint: POST /auth.php?action=register | login | sync
 */

require_once __DIR__ . '/db.php';

$action = $_GET['action'] ?? '';
$pdo = getDbConnection();
$data = getRequestBody();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'register') {
        $name = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';
        $uid = $data['uid'] ?? ('usr_' . time() . '_' . substr(md5(uniqid()), 0, 6));
        $photoUrl = $data['photoURL'] ?? "https://api.dicebear.com/7.x/avataaars/svg?seed=" . urlencode($email);

        if (empty($name) || empty($email) || empty($password)) {
            sendResponse(['success' => false, 'message' => 'Name, Email and Password are required.'], 400);
        }

        if (strlen($password) < 6) {
            sendResponse(['success' => false, 'message' => 'Password must be at least 6 characters.'], 400);
        }

        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            sendResponse(['success' => false, 'message' => 'An account with this email address already exists. Please sign in.'], 409);
        }

        // Hash user password securely
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $insert = $pdo->prepare("INSERT INTO users (uid, name, email, password, photo_url) VALUES (?, ?, ?, ?, ?)");
        $insert->execute([$uid, $name, $email, $hashedPassword, $photoUrl]);

        sendResponse([
            'success' => true,
            'message' => 'Account registered successfully.',
            'user' => [
                'uid' => $uid,
                'name' => $name,
                'email' => $email,
                'photoURL' => $photoUrl
            ]
        ], 201);
    }

    if ($action === 'login') {
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            sendResponse(['success' => false, 'message' => 'Email and Password are required.'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            sendResponse(['success' => false, 'message' => 'No account found with this email. Please create an account first.'], 404);
        }

        // Verify password against stored hash
        if (!empty($user['password'])) {
            $isMatch = password_verify($password, $user['password']) || ($password === $user['password']);
            if (!$isMatch) {
                sendResponse(['success' => false, 'message' => 'Incorrect password. Please check and try again.'], 401);
            }
        } else {
            // If user had no password yet, securely set their password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $update = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
            $update->execute([$hashedPassword, $user['id']]);
        }

        sendResponse([
            'success' => true,
            'message' => 'Login successful.',
            'user' => [
                'uid' => $user['uid'],
                'name' => $user['name'],
                'email' => $user['email'],
                'photoURL' => $user['photo_url']
            ]
        ]);
    }

    if ($action === 'sync') {
        $uid = $data['uid'] ?? '';
        $name = $data['name'] ?? '';
        $email = strtolower(trim($data['email'] ?? ''));
        $photoUrl = $data['photoURL'] ?? '';

        if (!empty($uid) && !empty($email)) {
            $stmt = $pdo->prepare("INSERT INTO users (uid, name, email, photo_url) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), photo_url = VALUES(photo_url)");
            $stmt->execute([$uid, $name, $email, $photoUrl]);
            sendResponse(['success' => true, 'message' => 'Profile synced']);
        }
        sendResponse(['success' => false, 'message' => 'Invalid data'], 400);
    }
}

sendResponse(['success' => false, 'message' => 'Invalid request'], 400);


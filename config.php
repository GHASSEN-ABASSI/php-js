<?php
$host = 'localhost';
$dbname = 'gestion_contacts';
$user = 'root';
$pass = '';

// Configuration avancée
ini_set('upload_max_filesize', '5M');
ini_set('post_max_size', '6M');
date_default_timezone_set('Europe/Paris');

define('UPLOAD_DIR', 'uploads/');
define('DEFAULT_AVATAR', UPLOAD_DIR . 'default.png');

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    if (!file_exists(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

} catch(PDOException $e) {
    error_log("DB Error: " . $e->getMessage());
    die(json_encode(['status' => 'error', 'message' => 'Database connection failed']));
}
?>
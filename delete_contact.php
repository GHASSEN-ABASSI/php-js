<?php
require 'config.php';

try {
    $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
    if(!$id) throw new Exception('ID invalide');

    $stmt = $pdo->prepare("SELECT avatar FROM contacts WHERE id = ?");
    $stmt->execute([$id]);
    $avatar = $stmt->fetchColumn();

    if($avatar && $avatar !== DEFAULT_AVATAR && file_exists($avatar)) {
        unlink($avatar);
    }

    $stmt = $pdo->prepare("DELETE FROM contacts WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['status' => 'success']);

} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
<?php
require 'config.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if(!$id) die(json_encode(['status' => 'error', 'message' => 'ID invalide']));

try {
    $stmt = $pdo->prepare("SELECT * FROM contacts WHERE id = ?");
    $stmt->execute([$id]);
    $contact = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if(!$contact) throw new Exception('Contact introuvable');
    
    $contact['avatar'] = str_replace(UPLOAD_DIR, '', $contact['avatar']);
    echo json_encode($contact);

} catch(Exception $e) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
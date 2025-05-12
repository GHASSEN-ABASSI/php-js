<?php
require 'config.php';

$search = isset($_GET['search']) ? "%".trim($_GET['search'])."%" : "%";

try {
    $stmt = $pdo->prepare("SELECT * FROM contacts 
        WHERE name LIKE ? 
        ORDER BY created_at DESC");
    $stmt->execute([$search]);
    
    $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Conversion chemin absolu en relatif
    foreach($contacts as &$contact) {
        $contact['avatar'] = str_replace(UPLOAD_DIR, '', $contact['avatar']);
    }
    
    echo json_encode($contacts);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur de recherche'
    ]);
}
?>
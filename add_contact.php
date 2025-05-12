<?php
require 'config.php';

try {
    $avatar = DEFAULT_AVATAR;
    
    if(isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedType = finfo_file($fileInfo, $_FILES['avatar']['tmp_name']);
        finfo_close($fileInfo);

        $allowedTypes = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp'
        ];

        if(!array_key_exists($detectedType, $allowedTypes)) {
            throw new Exception('Type de fichier non supporté');
        }

        $filename = uniqid('avatar_') . '.' . $allowedTypes[$detectedType];
        $destination = UPLOAD_DIR . $filename;
        
        if(!move_uploaded_file($_FILES['avatar']['tmp_name'], $destination)) {
            throw new Exception('Erreur lors de l\'upload');
        }
        $avatar = $destination;
    }

    $data = [
        filter_input(INPUT_POST, 'name', FILTER_SANITIZE_FULL_SPECIAL_CHARS),
        filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_FULL_SPECIAL_CHARS),
        filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL),
        filter_input(INPUT_POST, 'category', FILTER_SANITIZE_FULL_SPECIAL_CHARS),
        $avatar
    ];

    // Vérification email unique
    $stmt = $pdo->prepare("SELECT id FROM contacts WHERE email = ?");
    $stmt->execute([$data[2]]);
    if($stmt->fetch()) throw new Exception('Email déjà utilisé');

    $stmt = $pdo->prepare("INSERT INTO contacts 
        (name, phone, email, category, avatar)
        VALUES (?, ?, ?, ?, ?)");
    
    $stmt->execute($data);

    echo json_encode([
        'status' => 'success',
        'contact' => [
            'id' => $pdo->lastInsertId(),
            'name' => $data[0],
            'phone' => $data[1],
            'email' => $data[2],
            'category' => $data[3],
            'avatar' => $avatar
        ]
    ]);

} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
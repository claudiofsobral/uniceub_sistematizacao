<?php

header('Access-Control-Allow-Origin: https://cfsobral.github.io');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Método não permitido."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$selecionados = $_POST['selecionados'] ?? [];

if (!is_array($selecionados)) {
    $selecionados = [$selecionados];
}

if (empty($selecionados)) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Nenhum agendamento selecionado."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $sql = "DELETE FROM agendamentos WHERE id = :id";
    $stmt = $pdo->prepare($sql);

    foreach ($selecionados as $id) {
        $id = (int) $id;

        if ($id > 0) {
            $stmt->execute([
                ':id' => $id
            ]);
        }
    }

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Agendamento(s) cancelado(s) com sucesso!"
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro ao cancelar agendamento."
    ], JSON_UNESCAPED_UNICODE);
}

exit;
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

$medico = trim($_POST['medico'] ?? '');
$especialidade = trim($_POST['especialidade'] ?? '');
$nome = trim($_POST['nome'] ?? '');
$cpf = preg_replace('/\D/', '', $_POST['cpf'] ?? '');
$data = trim($_POST['data'] ?? '');

if ($medico === '' || $especialidade === '' || $nome === '' || $cpf === '' || $data === '') {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Todos os campos são obrigatórios."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (strlen($cpf) !== 11) {
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "O CPF deve conter exatamente 11 números."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $sql = "INSERT INTO agendamentos (medico, especialidade, nome, cpf, data_consulta)
            VALUES (:medico, :especialidade, :nome, :cpf, :data)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':medico' => $medico,
        ':especialidade' => $especialidade,
        ':nome' => $nome,
        ':cpf' => $cpf,
        ':data' => $data
    ]);

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Consulta agendada com sucesso!"
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    if ($e->getCode() == '23505') {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Já existe um agendamento para este CPF com este médico e esta especialidade."
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "sucesso" => false,
            "mensagem" => "Erro ao agendar consulta."
        ], JSON_UNESCAPED_UNICODE);
    }
}

exit;
?>
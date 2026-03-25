<?php

header('Access-Control-Allow-Origin: https://claudiofsobral.github.io');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "erro" => "Método não permitido."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$cpf = preg_replace('/\D/', '', $_GET['cpf'] ?? '');

if ($cpf === '' || strlen($cpf) !== 11) {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $sql = "SELECT id, medico, especialidade, nome, cpf, data_consulta
            FROM agendamentos
            WHERE cpf = :cpf
            ORDER BY data_consulta";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':cpf' => $cpf
    ]);

    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $saida = array_map(function ($row) {
        return [
            "id" => $row['id'],
            "medico" => $row['medico'],
            "especialidade" => $row['especialidade'],
            "nome" => $row['nome'],
            "cpf" => $row['cpf'],
            "data" => $row['data_consulta']
        ];
    }, $resultados);

    echo json_encode($saida, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode([
        "erro" => "Erro ao consultar agendamento."
    ], JSON_UNESCAPED_UNICODE);
}

exit;
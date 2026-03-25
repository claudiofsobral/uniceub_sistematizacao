<?php

$host = getenv("DB_HOST");
$port = getenv("DB_PORT") ?: "5432";
$db   = getenv("DB_NAME");
$user = getenv("DB_USER");
$pass = getenv("DB_PASSWORD");

if (!$host || !$db || !$user || $pass === false) {
    die("Erro de configuração: variáveis de ambiente do banco não definidas.");
}

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erro de conexão: " . $e->getMessage());
}
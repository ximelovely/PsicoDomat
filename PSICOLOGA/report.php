<?php
header('Content-Type: application/json; charset=UTF-8');

// ————————————————
// 1) DATOS DE CONEXIÓN:
// ————————————————
$dbDriver = 'mysql'; 
$dbHost   = 'localhost';
$dbName   = 'PsicoDomat';    // nombre de la base
$dbUser   = 'TU_USUARIO';
$dbPass   = 'TU_CONTRASEÑA';

if ($dbDriver === 'mysql') {
    $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
} else {
    // para SQL Server usando el driver PDO_SQLSRV
    $dsn = "sqlsrv:Server={$dbHost};Database={$dbName}";
}

try {
    $pdo = new PDO(
        $dsn,
        $dbUser,
        $dbPass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
    exit;
}

// ————————————————
// 2) Parámetros de consulta
// ————————————————
$year  = isset($_GET['year'])  ? intval($_GET['year'])  : intval(date('Y'));
$month = isset($_GET['month']) ? intval($_GET['month']) : intval(date('n'));

$start = sprintf('%04d-%02d-01', $year, $month);
// último día del mes
$end   = date('Y-m-t', strtotime($start));
// hoy, para distinguir vistos vs por ver
$today = date('Y-m-d');

try {
    // ————————————————
    // 3) Conteo: pacientes vistos (EstadoCita=1 y fecha ≤ hoy)
    // ————————————————
    $stmt = $pdo->prepare("
      SELECT COUNT(*) AS cnt
      FROM Citas
      WHERE Fecha BETWEEN :start AND :end
        AND EstadoCita = 1
        AND Fecha <= :today
    ");
    $stmt->execute([
      ':start' => $start,
      ':end'   => $end,
      ':today' => $today
    ]);
    $seen = (int)$stmt->fetchColumn();

    // ————————————————
    // 4) Conteo: pacientes por ver (EstadoCita=1 y fecha > hoy)
    // ————————————————
    $stmt = $pdo->prepare("
      SELECT COUNT(*) AS cnt
      FROM Citas
      WHERE Fecha BETWEEN :start AND :end
        AND EstadoCita = 1
        AND Fecha > :today
    ");
    $stmt->execute([
      ':start' => $start,
      ':end'   => $end,
      ':today' => $today
    ]);
    $upcoming = (int)$stmt->fetchColumn();

    // ————————————————
    // 5) Motivo de consulta: agrupa por Servicios.Descripcion
    // ————————————————
    $stmt = $pdo->prepare("
      SELECT sv.Descripcion AS motivo, COUNT(*) AS cnt
      FROM Citas c
      JOIN Servicios sv
        ON c.ID_Servicio = sv.ID_Servicio
      WHERE c.Fecha BETWEEN :start AND :end
        AND c.EstadoCita = 1
      GROUP BY sv.Descripcion
    ");
    $stmt->execute([':start'=>$start, ':end'=>$end]);
    $motiveCounts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $motiveCounts[$row['motivo']] = (int)$row['cnt'];
    }

    // ————————————————
    // 6) Pacientes por sucursal: agrupa por Sucursales.Nombre
    // ————————————————
    $stmt = $pdo->prepare("
      SELECT s.Nombre AS sucursal, COUNT(*) AS cnt
      FROM Citas c
      JOIN Sucursales s
        ON c.ID_Sucursal = s.ID_Sucursal
      WHERE c.Fecha BETWEEN :start AND :end
        AND c.EstadoCita = 1
      GROUP BY s.Nombre
    ");
    $stmt->execute([':start'=>$start, ':end'=>$end]);
    $branchCounts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $branchCounts[$row['sucursal']] = (int)$row['cnt'];
    }

    // ————————————————
    // 7) Devolver JSON
    // ————————————————
    echo json_encode([
      'seen'         => $seen,
      'upcoming'     => $upcoming,
      'motiveCounts' => $motiveCounts,
      'branchCounts' => $branchCounts,
    ], JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
      'error' => 'Error en consulta: '.$e->getMessage()
    ]);
    exit;
}

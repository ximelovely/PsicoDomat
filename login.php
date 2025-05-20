<?php
header('Content-Type: application/json');

// Configuración de la conexión (ajusta estos valores)
$serverName = "localhost\\SQLEXPRESS"; // o tu instancia de SQL Server
$connectionInfo = array(
    "Database" => "PSICODOMAT_BASEDATOS",
    "UID" => "tu_usuario",
    "PWD" => "tu_contraseña",
    "CharacterSet" => "UTF-8"
);

$conn = sqlsrv_connect($serverName, $connectionInfo);

if (!$conn) {
    die(json_encode(['success' => false, 'message' => 'Error de conexión: '.print_r(sqlsrv_errors(), true)]));
}

$telefono = $_POST['telefono'] ?? '';
$password = $_POST['password'] ?? '';

// Consulta segura con parámetros
$sql = "SELECT u.ID_Usuario, u.Nombre, u.Apellido, u.ID_Rol, r.Nombre as RolNombre 
        FROM Usuarios u
        JOIN Roles r ON u.ID_Rol = r.ID_Rol
        WHERE u.Telefono = ? AND u.Contraseña = ?";
$params = array($telefono, $password);
$stmt = sqlsrv_query($conn, $sql, $params);

if ($stmt === false) {
    die(json_encode(['success' => false, 'message' => 'Error en la consulta: '.print_r(sqlsrv_errors(), true)]));
}

if (sqlsrv_has_rows($stmt)) {
    $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
    
    // Determinar redirección basada en el rol
    $redirect = ($row['ID_Rol'] == 1) ? 'psicologa/calendario.html' : 'paciente/agenda.html';
    
    echo json_encode([
        'success' => true,
        'redirect' => $redirect,
        'user' => [
            'id' => $row['ID_Usuario'],
            'nombre' => $row['Nombre'],
            'apellido' => $row['Apellido'],
            'rol' => $row['RolNombre']
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Teléfono o contraseña incorrectos']);
}

sqlsrv_close($conn);
?>
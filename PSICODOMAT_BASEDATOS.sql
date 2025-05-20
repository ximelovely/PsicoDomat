/*CREACI�N DE TABLAS*/
/*Creaci�n de roles*/
CREATE TABLE Roles (
    ID_Rol INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) NOT NULL UNIQUE, -- 'Psic�logo', 'Paciente'
);

/*Tabla de usuarios*/
CREATE TABLE Usuarios (
    ID_Usuario INT PRIMARY KEY IDENTITY(1,1),
    ID_Rol INT FOREIGN KEY REFERENCES Roles(ID_Rol),
    Nombre NVARCHAR(100) NOT NULL,
    Apellido NVARCHAR(100) NOT NULL,
    Telefono NVARCHAR(20) NOT NULL UNIQUE,
    FechaNacimiento DATE,
    CedulaProfesional NVARCHAR(20) NULL, -- Solo para psicólogos
    Descripcion NVARCHAR(MAX) NULL, -- Solo para psicólogos
	Contraseña NVARCHAR(255) NOT NULL
);

/*Tabla de sucursales*/
CREATE TABLE Sucursales (
    ID_Sucursal INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NOT NULL,
    Direccion NVARCHAR(255) NOT NULL,
    CostoMXN DECIMAL(10,2) NOT NULL,
    CostoUSD DECIMAL(10,2) NOT NULL,
    HoraInicio NVARCHAR(10) NOT NULL,
    HoraFin NVARCHAR(10) NOT NULL,
);
SELECT *FROM Sucursales

/*Tabla de sucursal mensual*/
CREATE TABLE SucursalMensual (
    ID_Asignacion INT PRIMARY KEY IDENTITY(1,1),
    ID_Sucursal INT FOREIGN KEY REFERENCES Sucursales(ID_Sucursal),
    Mes INT NOT NULL CHECK (Mes BETWEEN 1 AND 12),
    Año INT NOT NULL,
    UNIQUE(Mes, Año) -- Solo una sucursal por mes/año
);

/*Tabla de servicios proporcionados*/
CREATE TABLE Servicios (
    ID_Servicio INT PRIMARY KEY IDENTITY(1,1),
    Descripcion NVARCHAR(100) NOT NULL,
);

/*Tabla de días no laborables*/
CREATE TABLE DiasNoLaborables (
    ID_DiaNoLaborable INT PRIMARY KEY IDENTITY(1,1),
    Fecha DATE NOT NULL UNIQUE,
    Descripcion NVARCHAR(255),
    Recurrente BIT DEFAULT 0 -- Para días que se repiten cada año
);

/*Tabla cat�logo de horas*/
CREATE TABLE CatalogoHoras (
    ID_Hora INT PRIMARY KEY IDENTITY(1,1),
    ID_Sucursal INT FOREIGN KEY REFERENCES Sucursales(ID_Sucursal),
    Hora VARCHAR(10) NOT NULL,
    UNIQUE(ID_Sucursal, Hora) -- Evita duplicados de horarios por sucursal
);
Select *fROM CatalogoHoras

/*Tabla citas*/
CREATE TABLE Citas (
    ID_Cita INT PRIMARY KEY IDENTITY(1,1),
    Fecha DATE NOT NULL,
    Hora INT NOT NULL FOREIGN KEY REFERENCES CatalogoHoras(ID_Hora),
    ID_Servicio INT FOREIGN KEY REFERENCES Servicios(ID_Servicio),
    ID_UsuarioPaciente INT FOREIGN KEY REFERENCES Usuarios(ID_Usuario),
    ID_UsuarioPsicologo INT FOREIGN KEY REFERENCES Usuarios(ID_Usuario),
    ID_Sucursal INT FOREIGN KEY REFERENCES Sucursales(ID_Sucursal),
	EstadoCita BIT NOT NULL, --1 es agendada, 0 es cancelada
    UNIQUE(Fecha, Hora, ID_UsuarioPaciente), -- Un paciente no puede tener 2 citas a la misma hora
    UNIQUE(Fecha, Hora, ID_UsuarioPsicologo), -- Un psic�logo no puede tener 2 citas a la misma hora
    UNIQUE(Fecha, Hora, ID_Sucursal) -- Una sucursal no puede tener 2 citas a la misma hora
);

/*INSERTAR DATOS*/
-- Insertar roles
INSERT INTO Roles (Nombre) VALUES 
	('Psicólogo'),
	('Paciente');

/*Ingresar psicóloga*/
INSERT INTO Usuarios (ID_Rol, Nombre, Apellido, Telefono, FechaNacimiento, CedulaProfesional, Descripcion, Contraseña)
VALUES
    -- Psicóloga principal
    (1, 'Marcela', 'Ibarra', '8112394678', '1980-05-15', '3921767', 
	'Soy la Lic. Marcela Ibarra y cuento con más de 13 años de experiencia ofreciendo terapia psicológica con enfoque cognitivo conductual a adultos y parejas tanto en instituciones públicas como privadas. Te invito a aprender a vivir con calidad desarrollando nuevas habilidades de uso personal, siendo ti mismo.',
	'Xime2005');

-- Insertar pacientes
INSERT INTO Usuarios (ID_Rol, Nombre, Apellido, Telefono, FechaNacimiento, CedulaProfesional, Descripcion, Contraseña)
VALUES 
	(2, 'Angely', 'Cruz', '8119762169', '2005-10-02', NULL, NULL, 'Ximena321'),
    (2, 'Carlos', 'Martínez', '8123456789', '1985-03-10', NULL, NULL, 'CarlosM85'),
    (2, 'Luisa', 'Fernández', '8176543210', '1995-11-25', NULL, NULL, 'LuisaF95'),
	(2, 'María', 'Gómez', '8112345678', '1990-07-15', NULL, NULL, 'MariaG90'),
	(2, 'Javier', 'López', '8156781234', '1988-04-22', NULL, NULL, 'JavierL88'),
	(2, 'Ana', 'Rodríguez', '8198765432', '2000-12-05', NULL, NULL, 'AnaR00'),
	(2, 'Pedro', 'Sánchez', '8145678901', '1975-09-30', NULL, NULL, 'PedroS75'),
	(2, 'Sofía', 'Hernández', '8134567890', '1998-02-18', NULL, NULL, 'SofiaH98'),
	(2, 'Diego', 'Pérez', '8123456709', '1992-06-14', NULL, NULL, 'DiegoP92'),
	(2, 'Valeria', 'García', '8167890123', '2003-08-27', NULL, NULL, 'ValeriaG03'),
	(2, 'Ricardo', 'Torres', '8189012345', '1980-05-11', NULL, NULL, 'RicardoT80');

-- Insertar sucursales
INSERT INTO Sucursales (Nombre, Direccion, CostoMXN, CostoUSD, HoraInicio, HoraFin)
VALUES 
	('Monterrey', 'Av No Reelección 501, Monterrey', 599.00, 0.00, '12:00', '18:00'),
	('Houston', '4914 Bissonnet St, Bellaire', 0.00, 50.00, '09:00', '15:00');

-- Insertar horarios disponibles
-- Monterrey (cada hora desde las 12pm hasta las 5pm)
INSERT INTO CatalogoHoras (ID_Sucursal, Hora)
VALUES 
	(1, '12:00'), (1, '13:00'), (1, '14:00'),
	(1, '15:00'), (1, '16:00'), (1, '17:00');

-- Houston (cada hora desde las 9am hasta las 5pm)
INSERT INTO CatalogoHoras (ID_Sucursal, Hora)
VALUES 
	(2, '09:00'), (2, '10:00'), (2, '11:00'),
	(2, '12:00'), (2, '13:00'), (2, '14:00');

-- Insertar servicios
INSERT INTO Servicios (Descripcion)
VALUES 
	('Terapia individual'),
	('Terapia de pareja'),
	('Terapia familiar');

-- Insertar 10 citas de ejemplo
INSERT INTO Citas (Fecha, Hora, ID_Servicio, ID_UsuarioPaciente, ID_UsuarioPsicologo, ID_Sucursal, EstadoCita)
VALUES
    -- Citas en Monterrey
    ('2024-06-10', (SELECT ID_Hora FROM CatalogoHoras WHERE ID_Sucursal = 1 AND Hora = '12:00'), 1, 2, 1, 1, 1),
    ('2024-06-10', (SELECT ID_Hora FROM CatalogoHoras WHERE ID_Sucursal = 1 AND Hora = '13:00'), 1, 3, 1, 1, 1),
    ('2024-06-12', (SELECT ID_Hora FROM CatalogoHoras WHERE ID_Sucursal = 1 AND Hora = '14:00'), 3, 4, 1, 1, 1),
    ('2024-06-12', (SELECT ID_Hora FROM CatalogoHoras WHERE ID_Sucursal = 1 AND Hora = '15:00'), 1, 5, 1, 1, 1),
    ('2024-06-14', (SELECT ID_Hora FROM CatalogoHoras WHERE ID_Sucursal = 1 AND Hora = '16:00'), 2, 6, 1, 1, 1),
    
    -- Citas en Houston
    ('2024-07-01', (SELECT ID_Hora FROM CatalogoHoras WHERE ID_Sucursal = 2 AND Hora = '09:00'), 1, 7, 1, 2, 1),
    ('2024-07-01', (SELECT ID_Hora FROM CatalogoHoras WHERE ID_Sucursal = 2 AND Hora = '10:00'), 1, 8, 1, 2, 1),
    ('2024-07-03', (SELECT ID_Hora FROM CatalogoHoras WHERE ID_Sucursal = 2 AND Hora = '11:00'), 3, 9, 1, 2, 1),
    ('2024-07-03', (SELECT ID_Hora FROM CatalogoHoras WHERE ID_Sucursal = 2 AND Hora = '12:00'), 1, 10, 1, 2, 1),
    ('2024-07-05', (SELECT ID_Hora FROM CatalogoHoras WHERE ID_Sucursal = 2 AND Hora = '13:00'), 2, 11, 1, 2, 1);

SELECT 
    c.ID_Cita,
    c.Fecha,
    ch.Hora,
    p.Nombre + ' ' + p.Apellido AS Paciente,
    s.Nombre AS Sucursal,
    sv.Descripcion AS Servicio,
    CASE WHEN c.EstadoCita = 1 THEN 'Agendada' ELSE 'Cancelada' END AS Estado
FROM 
    Citas c
    JOIN CatalogoHoras ch ON c.Hora = ch.ID_Hora
    JOIN Usuarios p ON c.ID_UsuarioPaciente = p.ID_Usuario
    JOIN Sucursales s ON c.ID_Sucursal = s.ID_Sucursal
    JOIN Servicios sv ON c.ID_Servicio = sv.ID_Servicio
ORDER BY 
    c.Fecha, ch.Hora;
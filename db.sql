-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: bxn7jcxpv6ooxtj4i1vt-mysql.services.clever-cloud.com:3306
-- Generation Time: Nov 14, 2024 at 12:49 AM
-- Server version: 8.0.22-13
-- PHP Version: 8.2.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bxn7jcxpv6ooxtj4i1vt`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`u85hulfz3w5pfdw7`@`%` PROCEDURE `crear_usuario` (IN `p_idPersona` INT, IN `p_nombre` VARCHAR(255), IN `p_password` VARCHAR(255), IN `p_tipo` VARCHAR(255))   BEGIN
    IF EXISTS (SELECT 1 FROM usuario WHERE nombre = p_nombre) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe un usuario con ese nombre.';
    END IF;

    -- Verificar si ya existe un usuario con el mismo idPersona
    IF EXISTS (SELECT 1 FROM usuario WHERE idPersona = p_idPersona) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ya existe un usuario asociado a esa persona.';
    END IF;
    INSERT INTO usuario (idPersona, nombre, password, tipo) 
    VALUES (p_idPersona, p_nombre, p_password, p_tipo);

END$$

CREATE DEFINER=`u85hulfz3w5pfdw7`@`%` PROCEDURE `generarTurnos` (IN `p_idAgenda` INT, IN `p_hora_inicio` TIME, IN `p_hora_fin` TIME, IN `p_fecha_inicio` DATE, IN `p_fecha_fin` DATE, IN `p_dia_semana` ENUM('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'), IN `p_duracion_turno` INT)   BEGIN
    DECLARE v_fecha DATE;
    DECLARE v_hora_actual TIME;
    DECLARE v_dia_actual INT;

    SET v_fecha = p_fecha_inicio;
    WHILE v_fecha <= p_fecha_fin DO
        SET v_dia_actual = DAYOFWEEK(v_fecha);
        IF v_dia_actual = CASE p_dia_semana
            WHEN 'LUNES' THEN 2
            WHEN 'MARTES' THEN 3
            WHEN 'MIERCOLES' THEN 4
            WHEN 'JUEVES' THEN 5
            WHEN 'VIERNES' THEN 6
            WHEN 'SABADO' THEN 7
            END THEN
            SET v_hora_actual = p_hora_inicio;
            WHILE v_hora_actual < p_hora_fin DO
                INSERT INTO turno (idAgenda, idEstadoTurno, fecha, hora_inicio, hora_fin)
                VALUES (
                    p_idAgenda,
                    1, 
                    v_fecha,
                    v_hora_actual,
                    ADDTIME(v_hora_actual, SEC_TO_TIME(p_duracion_turno * 60))
                );
                SET v_hora_actual = ADDTIME(v_hora_actual, SEC_TO_TIME(p_duracion_turno * 60));
            END WHILE;
        END IF;
        SET v_fecha = DATE_ADD(v_fecha, INTERVAL 1 DAY);
    END WHILE;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `agenda`
--

CREATE TABLE `agenda` (
  `ID` int NOT NULL,
  `idEspecialidadMedico` int DEFAULT NULL,
  `idSucursal` int DEFAULT NULL,
  `sobreturnoMax` int DEFAULT NULL,
  `duracionTurno` int DEFAULT NULL,
  `dia_semana` enum('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agenda`
--

INSERT INTO `agenda` (`ID`, `idEspecialidadMedico`, `idSucursal`, `sobreturnoMax`, `duracionTurno`, `dia_semana`, `estado`) VALUES
(1, 1, 1, 2, 10, 'MARTES', 1),
(2, 2, 3, 2, 10, 'VIERNES', 1),
(3, 2, 4, 2, 10, 'SABADO', 1),
(4, 1, 3, 2, 20, 'SABADO', 1);

-- --------------------------------------------------------

--
-- Table structure for table `clasificacion`
--

CREATE TABLE `clasificacion` (
  `uniqueID` int NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `idAgenda` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dia_no_laborales`
--

CREATE TABLE `dia_no_laborales` (
  `ID` int NOT NULL,
  `fecha` date DEFAULT NULL,
  `descripcion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `especialidad`
--

CREATE TABLE `especialidad` (
  `ID` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `especialidad`
--

INSERT INTO `especialidad` (`ID`, `nombre`) VALUES
(1, 'Cardiología'),
(2, 'Dermatología'),
(3, 'Endocrinología'),
(4, 'Gastroenterología'),
(5, 'Geriatría'),
(6, 'Hematología'),
(7, 'Inmunología'),
(8, 'Nefrología'),
(9, 'Neumología'),
(10, 'Neurología'),
(11, 'Oftalmología'),
(12, 'Oncología'),
(13, 'Otorrinolaringología'),
(14, 'Pediatría'),
(15, 'Psiquiatría'),
(16, 'Reumatología'),
(17, 'Traumatología'),
(18, 'Urología'),
(19, 'Alergología'),
(20, 'Anestesiología'),
(21, 'Cirugía General'),
(22, 'Cirugía Plástica'),
(23, 'Ginecología'),
(24, 'Medicina Interna'),
(25, 'Obstetricia'),
(26, 'Radiología'),
(27, 'Medicina Familiar'),
(28, 'Nutriología'),
(29, 'Kinesiología'),
(30, 'Fonoaudiología');

-- --------------------------------------------------------

--
-- Table structure for table `estadoturno`
--

CREATE TABLE `estadoturno` (
  `ID` int NOT NULL,
  `descripcion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estadoturno`
--

INSERT INTO `estadoturno` (`ID`, `descripcion`) VALUES
(1, 'libre'),
(2, 'reservado'),
(3, 'pendiente'),
(4, 'atendido'),
(5, 'confirmado');

-- --------------------------------------------------------

--
-- Table structure for table `horario`
--

CREATE TABLE `horario` (
  `ID` int NOT NULL,
  `idAgenda` int DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `estado` enum('disponible','libre','reservado') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `horario`
--

INSERT INTO `horario` (`ID`, `idAgenda`, `hora_inicio`, `hora_fin`, `estado`, `fecha_inicio`, `fecha_fin`) VALUES
(8, 1, '18:40:00', '19:40:00', 'libre', '2024-11-13', '2024-11-20'),
(9, 2, '10:00:00', '11:00:00', 'libre', '2024-11-13', '2024-11-30'),
(10, 4, '22:47:00', '23:47:00', 'libre', '2024-11-23', '2024-11-30');

-- --------------------------------------------------------

--
-- Table structure for table `lista_de_espera`
--

CREATE TABLE `lista_de_espera` (
  `ID` int NOT NULL,
  `idPaciente` int DEFAULT NULL,
  `idAgenda` int DEFAULT NULL,
  `fecha_registro` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medico`
--

CREATE TABLE `medico` (
  `ID` int NOT NULL,
  `idPersona` int DEFAULT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_general_ci DEFAULT 'inactivo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medico`
--

INSERT INTO `medico` (`ID`, `idPersona`, `estado`) VALUES
(1, 10, 'activo'),
(2, 11, 'inactivo'),
(3, 12, 'inactivo'),
(4, 13, 'inactivo'),
(5, 14, 'inactivo'),
(18, 8, 'inactivo');

-- --------------------------------------------------------

--
-- Table structure for table `medico_especialidad`
--

CREATE TABLE `medico_especialidad` (
  `ID` int NOT NULL,
  `idMedico` int DEFAULT NULL,
  `idEspecialidad` int DEFAULT NULL,
  `matricula` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medico_especialidad`
--

INSERT INTO `medico_especialidad` (`ID`, `idMedico`, `idEspecialidad`, `matricula`) VALUES
(1, 1, 1, '12345'),
(2, 1, 5, '12123'),
(3, 4, 1, '1234');

-- --------------------------------------------------------

--
-- Table structure for table `medico_sucursal`
--

CREATE TABLE `medico_sucursal` (
  `ID` int NOT NULL,
  `medico_id` int DEFAULT NULL,
  `sucursal_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `obrasocial`
--

CREATE TABLE `obrasocial` (
  `ID` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `obrasocial`
--

INSERT INTO `obrasocial` (`ID`, `nombre`) VALUES
(1, 'DOSEP'),
(2, 'PAMI'),
(3, 'OSDE'),
(4, 'OSPAT'),
(5, 'OSECAC'),
(6, 'OSPRERA'),
(7, 'IOMA'),
(8, 'OSUTHGRA'),
(9, 'OSPEDYC'),
(10, 'NINGUNA');

-- --------------------------------------------------------

--
-- Table structure for table `paciente`
--

CREATE TABLE `paciente` (
  `ID` int NOT NULL,
  `idPersona` int DEFAULT NULL,
  `fotoDni` blob,
  `idObraSocial` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `paciente`
--

INSERT INTO `paciente` (`ID`, `idPersona`, `fotoDni`, `idObraSocial`) VALUES
(1, 15, 0x433a5c66616b65706174685c53637265656e73686f745f372e706e67, 1),
(2, 16, 0x433a5c66616b65706174685c53637265656e73686f745f372e706e67, 7),
(3, 17, 0x433a5c66616b65706174685c53637265656e73686f745f372e706e67, 8),
(4, 18, 0x433a5c66616b65706174685c53637265656e73686f745f372e706e67, 5),
(5, 19, 0x433a5c66616b65706174685c53637265656e73686f745f372e706e67, 3);

-- --------------------------------------------------------

--
-- Table structure for table `persona`
--

CREATE TABLE `persona` (
  `ID` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `apellido` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dni` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mail` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `persona`
--

INSERT INTO `persona` (`ID`, `nombre`, `apellido`, `dni`, `mail`, `telefono`) VALUES
(1, 'Valentin', 'Gimenez', '11111111', 'uno@correo.com', '1111111111'),
(2, 'Roberta', 'Vallejos', '22222222', 'dos@gmail.com', '2222222222'),
(3, 'Fernando', 'Fernandez', '33333333', 'tres@gmail.com', '3333333333'),
(4, 'Juan', 'Pérez', '12345678', 'juan.perez@example.com', '2612345678'),
(5, 'María', 'Gómez', '23456789', 'maria.gomez@example.com', '2612345679'),
(6, 'Carlos', 'Rodríguez', '34567890', 'carlos.rodriguez@example.com', '2612345680'),
(7, 'Laura', 'López', '45678901', 'laura.lopez@example.com', '2612345681'),
(8, 'José', 'Martínez', '56789012', 'jose.martinez@example.com', '2612345682'),
(9, 'Ana', 'Sánchez', '67890123', 'ana.sanchez@example.com', '2612345683'),
(10, 'PEDRO', 'GARCÍA', '78901234', 'pedro.garcia@example.com', '2612345692'),
(11, 'SOFÍA', 'ROMERO', '89012345', 'sofia.romero@example.com', '2612345685'),
(12, 'LUIS', 'TORRES', '90123456', 'luis.torres@example.com', '2612345686'),
(13, 'LUCÍA', 'MOLINA', '12345679', 'lucia.molina@example.com', '2612345687'),
(14, 'FERNANDO', 'SILVA', '23456780', 'ernando.silva@example.com', '2612345688'),
(15, 'VALENTINA', 'FLORES', '34567891', 'valentina.flores@example.com', '2612345689'),
(16, 'MIGUEL', 'ACOSTA', '45678902', 'miguel.acosta@example.com', '2612345690'),
(17, 'MARTINA', 'RIVAS', '56789013', 'martina.rivas@example.com', '2612345691'),
(18, 'DIEGO', 'CASTRO', '67890124', 'diego.castro@example.com', '2612345692'),
(19, 'GABRIELA', 'VEGA', '78901235', 'gabriela.vega@example.com', '2612345693');

-- --------------------------------------------------------

--
-- Table structure for table `sucursal`
--

CREATE TABLE `sucursal` (
  `ID` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sucursal`
--

INSERT INTO `sucursal` (`ID`, `nombre`, `direccion`, `telefono`) VALUES
(1, 'Sucursal A', 'Calle Falsa 123', '555-1234'),
(2, 'Sucursal B', 'Avenida Siempre Viva 456', '555-5678'),
(3, 'Sucursal C', 'Calle del Sol 789', '555-9876'),
(4, 'Sucursal D', 'Calle del aaa 123', '555-5432');

-- --------------------------------------------------------

--
-- Table structure for table `turno`
--

CREATE TABLE `turno` (
  `ID` int NOT NULL,
  `idAgenda` int DEFAULT NULL,
  `idPaciente` int DEFAULT NULL,
  `idEstadoTurno` int DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `tipo` enum('sobreturno','normal') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `motivo_consulta` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `turno`
--

INSERT INTO `turno` (`ID`, `idAgenda`, `idPaciente`, `idEstadoTurno`, `fecha`, `hora_inicio`, `hora_fin`, `tipo`, `motivo_consulta`) VALUES
(19, 1, 1, 2, '2024-11-19', '18:40:00', '18:50:00', 'normal', NULL),
(20, 1, 1, 2, '2024-11-19', '18:50:00', '19:00:00', 'normal', NULL),
(21, 1, NULL, 1, '2024-11-19', '19:00:00', '19:10:00', NULL, NULL),
(22, 1, NULL, 1, '2024-11-19', '19:10:00', '19:20:00', NULL, NULL),
(23, 1, NULL, 1, '2024-11-19', '19:20:00', '19:30:00', NULL, NULL),
(24, 1, NULL, 1, '2024-11-19', '19:30:00', '19:40:00', NULL, NULL),
(25, 2, NULL, 1, '2024-11-15', '10:00:00', '10:10:00', NULL, NULL),
(26, 2, NULL, 1, '2024-11-15', '10:10:00', '10:20:00', NULL, NULL),
(27, 2, NULL, 1, '2024-11-15', '10:20:00', '10:30:00', NULL, NULL),
(28, 2, NULL, 1, '2024-11-15', '10:30:00', '10:40:00', NULL, NULL),
(29, 2, NULL, 1, '2024-11-15', '10:40:00', '10:50:00', NULL, NULL),
(30, 2, NULL, 1, '2024-11-15', '10:50:00', '11:00:00', NULL, NULL),
(31, 2, NULL, 1, '2024-11-22', '10:00:00', '10:10:00', NULL, NULL),
(32, 2, NULL, 1, '2024-11-22', '10:10:00', '10:20:00', NULL, NULL),
(33, 2, NULL, 1, '2024-11-22', '10:20:00', '10:30:00', NULL, NULL),
(34, 2, NULL, 1, '2024-11-22', '10:30:00', '10:40:00', NULL, NULL),
(35, 2, NULL, 1, '2024-11-22', '10:40:00', '10:50:00', NULL, NULL),
(36, 2, NULL, 1, '2024-11-22', '10:50:00', '11:00:00', NULL, NULL),
(37, 2, NULL, 1, '2024-11-29', '10:00:00', '10:10:00', NULL, NULL),
(38, 2, NULL, 1, '2024-11-29', '10:10:00', '10:20:00', NULL, NULL),
(39, 2, NULL, 1, '2024-11-29', '10:20:00', '10:30:00', NULL, NULL),
(40, 2, NULL, 1, '2024-11-29', '10:30:00', '10:40:00', NULL, NULL),
(41, 2, NULL, 1, '2024-11-29', '10:40:00', '10:50:00', NULL, NULL),
(42, 2, NULL, 1, '2024-11-29', '10:50:00', '11:00:00', NULL, NULL),
(43, 4, NULL, 1, '2024-11-23', '22:47:00', '23:07:00', NULL, NULL),
(44, 4, NULL, 1, '2024-11-23', '23:07:00', '23:27:00', NULL, NULL),
(45, 4, NULL, 1, '2024-11-23', '23:27:00', '23:47:00', NULL, NULL),
(46, 4, NULL, 1, '2024-11-30', '22:47:00', '23:07:00', NULL, NULL),
(47, 4, NULL, 1, '2024-11-30', '23:07:00', '23:27:00', NULL, NULL),
(48, 4, NULL, 1, '2024-11-30', '23:27:00', '23:47:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

CREATE TABLE `usuario` (
  `ID` int NOT NULL,
  `idPersona` int DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo` enum('secretaria','paciente','admin') COLLATE utf8mb4_general_ci NOT NULL,
  `nombre` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`ID`, `idPersona`, `password`, `tipo`, `nombre`) VALUES
(1, 3, '$2b$10$n9kI05lvCw/dgx.Zgayz9.Le.1Jtg1/iSl.4XsKGy6D30cW8EuWNm', 'admin', 'admin'),
(2, 1, '$2b$10$veK6wrlXIfZTeBgVRPEVZ..vyzhKlF.o0xmd.N45PyAdA8dQbJlIe', 'paciente', 'paciente'),
(3, 2, '$2b$10$Luthw8Esv/HUrStoiQU.aebvCs1dmU8a9Yl420320qJnP8Oci5WX.', 'secretaria', 'secretaria');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agenda`
--
ALTER TABLE `agenda`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idEspecialidadMedico` (`idEspecialidadMedico`),
  ADD KEY `idSucursal` (`idSucursal`);

--
-- Indexes for table `clasificacion`
--
ALTER TABLE `clasificacion`
  ADD PRIMARY KEY (`uniqueID`),
  ADD KEY `idAgenda` (`idAgenda`);

--
-- Indexes for table `dia_no_laborales`
--
ALTER TABLE `dia_no_laborales`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `especialidad`
--
ALTER TABLE `especialidad`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `estadoturno`
--
ALTER TABLE `estadoturno`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `horario`
--
ALTER TABLE `horario`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idAgenda` (`idAgenda`);

--
-- Indexes for table `lista_de_espera`
--
ALTER TABLE `lista_de_espera`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idPaciente` (`idPaciente`),
  ADD KEY `idAgenda` (`idAgenda`);

--
-- Indexes for table `medico`
--
ALTER TABLE `medico`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idPersona` (`idPersona`);

--
-- Indexes for table `medico_especialidad`
--
ALTER TABLE `medico_especialidad`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idMedico` (`idMedico`),
  ADD KEY `idEspecialidad` (`idEspecialidad`);

--
-- Indexes for table `medico_sucursal`
--
ALTER TABLE `medico_sucursal`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `medico_id` (`medico_id`),
  ADD KEY `sucursal_id` (`sucursal_id`);

--
-- Indexes for table `obrasocial`
--
ALTER TABLE `obrasocial`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idPersona` (`idPersona`),
  ADD KEY `idObraSocial` (`idObraSocial`);

--
-- Indexes for table `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `turno`
--
ALTER TABLE `turno`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idAgenda` (`idAgenda`),
  ADD KEY `idPaciente` (`idPaciente`),
  ADD KEY `idEstadoTurno` (`idEstadoTurno`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idPersona` (`idPersona`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agenda`
--
ALTER TABLE `agenda`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `clasificacion`
--
ALTER TABLE `clasificacion`
  MODIFY `uniqueID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dia_no_laborales`
--
ALTER TABLE `dia_no_laborales`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `especialidad`
--
ALTER TABLE `especialidad`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `estadoturno`
--
ALTER TABLE `estadoturno`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `horario`
--
ALTER TABLE `horario`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `lista_de_espera`
--
ALTER TABLE `lista_de_espera`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medico`
--
ALTER TABLE `medico`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `medico_especialidad`
--
ALTER TABLE `medico_especialidad`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `medico_sucursal`
--
ALTER TABLE `medico_sucursal`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `obrasocial`
--
ALTER TABLE `obrasocial`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `paciente`
--
ALTER TABLE `paciente`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `persona`
--
ALTER TABLE `persona`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `sucursal`
--
ALTER TABLE `sucursal`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `turno`
--
ALTER TABLE `turno`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `agenda`
--
ALTER TABLE `agenda`
  ADD CONSTRAINT `agenda_ibfk_1` FOREIGN KEY (`idEspecialidadMedico`) REFERENCES `medico_especialidad` (`ID`),
  ADD CONSTRAINT `agenda_ibfk_2` FOREIGN KEY (`idSucursal`) REFERENCES `sucursal` (`ID`);

--
-- Constraints for table `clasificacion`
--
ALTER TABLE `clasificacion`
  ADD CONSTRAINT `clasificacion_ibfk_1` FOREIGN KEY (`idAgenda`) REFERENCES `agenda` (`ID`);

--
-- Constraints for table `horario`
--
ALTER TABLE `horario`
  ADD CONSTRAINT `horario_ibfk_1` FOREIGN KEY (`idAgenda`) REFERENCES `agenda` (`ID`);

--
-- Constraints for table `lista_de_espera`
--
ALTER TABLE `lista_de_espera`
  ADD CONSTRAINT `lista_de_espera_ibfk_1` FOREIGN KEY (`idPaciente`) REFERENCES `paciente` (`ID`),
  ADD CONSTRAINT `lista_de_espera_ibfk_2` FOREIGN KEY (`idAgenda`) REFERENCES `agenda` (`ID`);

--
-- Constraints for table `medico`
--
ALTER TABLE `medico`
  ADD CONSTRAINT `medico_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`ID`);

--
-- Constraints for table `medico_especialidad`
--
ALTER TABLE `medico_especialidad`
  ADD CONSTRAINT `medico_especialidad_ibfk_1` FOREIGN KEY (`idMedico`) REFERENCES `medico` (`ID`),
  ADD CONSTRAINT `medico_especialidad_ibfk_2` FOREIGN KEY (`idEspecialidad`) REFERENCES `especialidad` (`ID`);

--
-- Constraints for table `medico_sucursal`
--
ALTER TABLE `medico_sucursal`
  ADD CONSTRAINT `medico_sucursal_ibfk_1` FOREIGN KEY (`medico_id`) REFERENCES `medico` (`ID`),
  ADD CONSTRAINT `medico_sucursal_ibfk_2` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursal` (`ID`);

--
-- Constraints for table `paciente`
--
ALTER TABLE `paciente`
  ADD CONSTRAINT `paciente_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`ID`),
  ADD CONSTRAINT `paciente_ibfk_2` FOREIGN KEY (`idObraSocial`) REFERENCES `obrasocial` (`ID`);

--
-- Constraints for table `turno`
--
ALTER TABLE `turno`
  ADD CONSTRAINT `turno_ibfk_1` FOREIGN KEY (`idAgenda`) REFERENCES `agenda` (`ID`),
  ADD CONSTRAINT `turno_ibfk_2` FOREIGN KEY (`idPaciente`) REFERENCES `paciente` (`ID`),
  ADD CONSTRAINT `turno_ibfk_3` FOREIGN KEY (`idEstadoTurno`) REFERENCES `estadoturno` (`ID`);

--
-- Constraints for table `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`idPersona`) REFERENCES `persona` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

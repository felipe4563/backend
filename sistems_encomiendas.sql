-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-10-2025 a las 07:17:16
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistems_encomiendas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encomienda`
--

CREATE TABLE `encomienda` (
  `id_encomienda` int(11) NOT NULL,
  `numero_guia` varchar(50) NOT NULL,
  `id_secretaria` int(11) DEFAULT NULL,
  `id_conductor` int(11) DEFAULT NULL,
  `id_remitente` int(11) DEFAULT NULL,
  `id_consignatorio` int(11) DEFAULT NULL,
  `id_sucursal_origen` int(11) DEFAULT NULL,
  `id_sucursal_destino` int(11) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `fecha` datetime DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `valor_declarado` decimal(10,2) DEFAULT NULL,
  `tarifa` decimal(10,2) DEFAULT NULL,
  `monto_empresa` decimal(10,2) DEFAULT 0.00,
  `monto_conductor` decimal(10,2) DEFAULT 0.00,
  `qr_path` varchar(255) DEFAULT NULL,
  `estado_actual` enum('EN OFICINAS DE ORIGEN','ASIGNADO A CONDUCTOR','EN TRÁNSITO','EN OFICINAS DE DESTINO','ENTREGADO') DEFAULT 'EN OFICINAS DE ORIGEN',
  `comprobante_url` varchar(255) DEFAULT NULL,
  `pin` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `encomienda`
--

INSERT INTO `encomienda` (`id_encomienda`, `numero_guia`, `id_secretaria`, `id_conductor`, `id_remitente`, `id_consignatorio`, `id_sucursal_origen`, `id_sucursal_destino`, `fecha_registro`, `fecha`, `descripcion`, `valor_declarado`, `tarifa`, `monto_empresa`, `monto_conductor`, `qr_path`, `estado_actual`, `comprobante_url`, `pin`) VALUES
(1, '120-COC-SAN-001', 2, 3, 2, 8, 1, 2, '2025-09-08 19:50:24', '2025-09-08 15:50:24', 'Documentos urgentes', 500.00, 50.00, 12.50, 37.50, '/qrcodes/120-COC-SAN-001.png', 'EN TRÁNSITO', NULL, NULL),
(2, '120-COC-SAN-002', 2, 3, 9, 8, 1, 2, '2025-09-08 20:03:14', '2025-09-08 16:03:14', 'Documentos importantes ', 500.00, 50.00, 12.50, 37.50, '/qrcodes/120-COC-SAN-002.png', 'EN TRÁNSITO', NULL, NULL),
(3, '120-COC-SAN-003', 2, 3, 9, 8, 1, 2, '2025-09-08 20:04:51', '2025-09-08 16:04:51', 'Documentos importantes ', 500.00, 50.00, 12.50, 37.50, '/qrcodes/120-COC-SAN-003.png', 'EN TRÁNSITO', NULL, NULL),
(4, '120-COC-SAN-004', 2, 3, 2, 8, 1, 2, '2025-09-08 20:14:58', '2025-09-08 16:14:58', 'Documentos importantes prueba 3', 100.00, 50.00, 12.50, 37.50, '/qrcodes/120-COC-SAN-004.png', 'EN TRÁNSITO', NULL, NULL),
(5, '120-COC-SAN-005', 2, 3, 2, 8, 1, 2, '2025-09-08 20:20:59', '2025-09-08 16:20:59', 'Documentos importantes prueba 3', 100.00, 50.00, 12.50, 37.50, '/qrcodes/120-COC-SAN-005.png', 'EN TRÁNSITO', NULL, NULL),
(6, '120-COC-SAN-006', 2, 3, 1, 3, 1, 2, '2025-09-08 20:28:31', '2025-09-08 16:28:31', 'prueba 1', 100.00, 10.00, 2.50, 7.50, '/qrcodes/120-COC-SAN-006.png', 'EN TRÁNSITO', NULL, NULL),
(7, '120-COC-SAN-007', 2, 3, 1, 10, 1, 2, '2025-09-08 20:41:24', '2025-09-08 16:41:24', 'caja de cositas', 100.00, 10.00, 2.50, 7.50, '/qrcodes/120-COC-SAN-007.png', 'ENTREGADO', NULL, NULL),
(8, '120-COC-COC-001', 2, 3, 1, 10, 1, 1, '2025-09-08 20:46:52', '2025-09-08 16:46:52', 'Caja c****** pa mujer ', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-COC-001.png', 'EN TRÁNSITO', NULL, NULL),
(9, '120-COC-SAN-008', 2, 3, 1, 10, 1, 2, '2025-09-08 21:08:27', '2025-09-08 17:08:27', 'prueba 272', 1000.00, 100.00, 25.00, 75.00, '/qrcodes/120-COC-SAN-008.png', 'EN TRÁNSITO', NULL, NULL),
(10, '120-COC-SAN-009', 2, 6, 1, 10, 1, 2, '2025-09-08 21:11:54', '2025-09-08 17:11:54', 'caja de perfumes', 1000.00, 100.00, 25.00, 75.00, '/qrcodes/120-COC-SAN-009.png', 'ASIGNADO A CONDUCTOR', NULL, NULL),
(11, '120-COC-SAN-010', 2, 6, 1, 10, 1, 2, '2025-09-08 21:16:01', '2025-09-08 17:16:01', 'caja de perfumes', 1000.00, 100.00, 25.00, 75.00, '/qrcodes/120-COC-SAN-010.png', 'ASIGNADO A CONDUCTOR', NULL, NULL),
(12, '120-COC-SAN-011', 2, 3, 1, 10, 1, 2, '2025-09-08 21:16:32', '2025-09-08 17:16:32', 'caja de perfumes', 1000.00, 100.00, 25.00, 75.00, '/qrcodes/120-COC-SAN-011.png', 'EN TRÁNSITO', NULL, NULL),
(13, '120-COC-COC-002', 2, 3, 10, 1, 1, 1, '2025-09-08 21:19:33', '2025-09-08 17:19:33', 'caja de ropa', 100.00, 10.00, 2.50, 7.50, '/qrcodes/120-COC-COC-002.png', 'EN TRÁNSITO', NULL, NULL),
(14, '120-COC-COC-003', 2, 3, 1, 10, 1, 1, '2025-09-09 11:55:15', '2025-09-09 07:55:15', 'caja re perfumes', 100.00, 10.00, 2.50, 7.50, '/qrcodes/120-COC-COC-003.png', 'ENTREGADO', NULL, NULL),
(15, '120-SAN-SAN-001', 12, 3, 13, 1, 2, 2, '2025-09-09 16:07:19', '2025-09-09 12:07:19', 'Caja de raquetas', 100.00, 15.00, 3.75, 11.25, '/qrcodes/120-SAN-SAN-001.png', 'EN TRÁNSITO', NULL, NULL),
(16, '120-COC-SAN-012', 2, 3, 1, 14, 1, 2, '2025-09-09 17:18:16', '2025-09-09 13:18:16', 'caja de cables', 1500.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-012.png', 'ENTREGADO', NULL, NULL),
(17, '120-COC-COC-004', 16, 17, 19, 20, 1, 1, '2025-09-09 18:25:39', '2025-09-09 14:25:39', 'Caja de masitas', 12.00, 8.00, 2.00, 6.00, '/qrcodes/120-COC-COC-004.png', 'EN TRÁNSITO', NULL, NULL),
(18, '120-COC-SAN-013', 16, 17, 15, 17, 1, 2, '2025-09-09 18:26:05', '2025-09-09 14:26:05', 'Caja con dinero', 1000.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-013.png', 'EN OFICINAS DE DESTINO', NULL, NULL),
(19, '120-COC-COC-005', 16, 17, 19, 20, 1, 1, '2025-09-09 18:26:11', '2025-09-09 14:26:11', 'Caja de masitas', 12.00, 8.00, 2.00, 6.00, '/qrcodes/120-COC-COC-005.png', 'EN TRÁNSITO', NULL, NULL),
(20, '120-COC-COC-006', 2, NULL, 1, 3, 1, 1, '2025-09-11 22:16:11', '2025-09-11 18:16:11', 'caja de ropas', 1000.00, 100.00, 25.00, 75.00, '/qrcodes/120-COC-COC-006.png', 'EN OFICINAS DE ORIGEN', NULL, NULL),
(21, '120-COC-COC-007', 16, NULL, 1, 22, 1, 1, '2025-09-16 22:13:24', '2025-09-16 18:13:24', 'caja de refresco', 1000.00, 10.00, 2.50, 7.50, '/qrcodes/120-COC-COC-007.png', 'EN OFICINAS DE ORIGEN', NULL, '8162'),
(22, '120-COC-SAN-014', 16, NULL, 1, 22, 1, 2, '2025-09-17 01:08:24', '2025-09-16 21:08:24', 'caja de hojas de tamaño carta', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-014.png', 'EN OFICINAS DE ORIGEN', NULL, '8422'),
(23, '120-COC-SAN-015', 16, 3, 1, 1, 1, 2, '2025-09-17 01:16:01', '2025-09-16 21:16:01', 'caja de hojas', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-015.png', 'EN TRÁNSITO', NULL, '9346'),
(24, '120-COC-SAN-016', 16, 3, 1, 1, 1, 2, '2025-09-17 01:19:29', '2025-09-16 21:19:29', 'caja de hojas 2', 100.00, 10.00, 2.50, 7.50, '/qrcodes/120-COC-SAN-016.png', 'ASIGNADO A CONDUCTOR', NULL, '1248'),
(25, '120-COC-SAN-017', 16, 3, 1, 22, 1, 2, '2025-09-17 01:30:04', '2025-09-16 21:30:04', 'caja de hojas', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-017.png', 'ASIGNADO A CONDUCTOR', NULL, '1205'),
(26, '120-COC-SAN-018', 16, 3, 1, 22, 1, 2, '2025-09-17 01:48:30', '2025-09-16 21:48:30', 'caja de zapatos', 100.00, 10.00, 2.50, 7.50, '/qrcodes/120-COC-SAN-018.png', 'EN TRÁNSITO', NULL, '6161'),
(27, '120-COC-SAN-019', 16, 3, 1, 1, 1, 2, '2025-09-17 03:25:47', '2025-09-16 23:25:47', 'caja de ropa', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-019.png', 'EN TRÁNSITO', NULL, '5862'),
(28, '120-COC-SAN-020', 16, 3, 1, 22, 1, 2, '2025-09-17 03:41:04', '2025-09-16 23:41:04', 'paqute con ropas', 1000.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-020.png', 'EN OFICINAS DE DESTINO', NULL, '7283'),
(29, '120-COC-SAN-021', 16, 3, 9, 24, 1, 2, '2025-09-17 03:56:12', '2025-09-16 23:56:12', 'caja de libros ', 100.00, 15.00, 3.75, 11.25, '/qrcodes/120-COC-SAN-021.png', 'ASIGNADO A CONDUCTOR', NULL, '7693'),
(30, '120-COC-SAN-022', 16, 3, 9, 25, 1, 2, '2025-09-17 03:58:54', '2025-09-16 23:58:54', 'caja de libros ', 100.00, 15.00, 3.75, 11.25, '/qrcodes/120-COC-SAN-022.png', 'EN TRÁNSITO', NULL, '6511'),
(31, '120-COC-SAN-023', 16, 3, 25, 1, 1, 2, '2025-09-17 04:01:15', '2025-09-17 00:01:15', 'caja de ropas ', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-023.png', 'EN OFICINAS DE DESTINO', NULL, '8247'),
(32, '120-COC-SAN-024', 16, 3, 25, 1, 1, 2, '2025-09-17 04:20:26', '2025-09-17 00:20:26', 'caja de ropas v2', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-024.png', 'ENTREGADO', NULL, '3768'),
(33, '120-COC-SAN-025', 16, 3, 1, 25, 1, 2, '2025-09-17 04:30:36', '2025-09-17 00:30:36', 'caja de ropas de marca', 200.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-025.png', 'EN OFICINAS DE DESTINO', NULL, '3404'),
(34, '120-COC-SAN-026', 16, 3, 22, 1, 1, 2, '2025-09-17 05:40:36', '2025-09-17 01:40:36', 'cartones', 100.00, 10.00, 2.50, 7.50, '/qrcodes/120-COC-SAN-026.png', 'ENTREGADO', NULL, '8329'),
(35, '120-COC-SAN-027', 16, 3, 1, 1, 1, 2, '2025-09-17 16:43:59', '2025-09-17 12:43:59', 'Caja de ropas ', 100.00, 10.00, 2.50, 7.50, '/qrcodes/120-COC-SAN-027.png', 'ENTREGADO', NULL, '8165'),
(36, '120-COC-SAN-028', 16, 3, 1, 15, 1, 2, '2025-09-17 18:42:32', '2025-09-17 14:42:32', 'paquete de hojas ', 100.00, 15.00, 3.75, 11.25, '/qrcodes/120-COC-SAN-028.png', 'ENTREGADO', NULL, '5381'),
(37, '120-COC-SAN-029', 16, 3, 1, 26, 1, 2, '2025-09-17 19:13:43', '2025-09-17 15:13:43', 'Caja de repuestos.', 500.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-029.png', 'ENTREGADO', NULL, '3877'),
(38, '120-COC-SAN-030', 16, NULL, 1, 1, 1, 2, '2025-09-19 00:53:14', '2025-09-18 20:53:14', 'caja de documentos importantes ', 100.00, 15.00, 3.75, 11.25, '/qrcodes/120-COC-SAN-030.png', 'EN OFICINAS DE ORIGEN', NULL, '2339'),
(39, '120-COC-SAN-031', 16, NULL, 27, 1, 1, 2, '2025-09-19 00:56:40', '2025-09-18 20:56:40', 'juegos de xbox, ps4, nintendo', 1000.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-031.png', 'EN OFICINAS DE ORIGEN', NULL, '4094'),
(40, '120-COC-SAN-032', 16, NULL, 27, 1, 1, 2, '2025-09-19 01:02:24', '2025-09-18 21:02:24', 'caja de juegos de nintendo, Ps4', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-032.png', 'EN OFICINAS DE ORIGEN', NULL, '6532'),
(41, '120-COC-SAN-033', 16, NULL, 27, 1, 1, 2, '2025-09-19 01:04:53', '2025-09-18 21:04:53', 'caja de juegos de nintendo, Ps4', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-033.png', 'EN OFICINAS DE ORIGEN', NULL, '3029'),
(42, '120-COC-SAN-034', 16, NULL, 27, 1, 1, 2, '2025-09-19 01:05:57', '2025-09-18 21:05:57', 'caja de juegos de nintendo, Ps4, Ps5', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-034.png', 'EN OFICINAS DE ORIGEN', NULL, '7464'),
(43, '120-COC-SAN-035', 16, NULL, 1, 27, 1, 2, '2025-09-19 01:07:37', '2025-09-18 21:07:37', 'caja de juegos de nintendo, Ps4, Ps5', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-035.png', 'EN OFICINAS DE ORIGEN', NULL, '2436'),
(44, '120-COC-SAN-036', 16, NULL, 1, 27, 1, 2, '2025-09-19 01:08:00', '2025-09-18 21:08:00', 'caja de juegos de nintendo, Ps4, Ps5, colchas', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-036.png', 'EN OFICINAS DE ORIGEN', NULL, '6900'),
(45, '120-COC-SAN-037', 16, NULL, 1, 27, 1, 2, '2025-09-19 01:18:48', '2025-09-18 21:18:48', 'caja de juegos de nintendo, Ps4, Ps5, colchas, cajas', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-COC-SAN-037.png', 'EN OFICINAS DE ORIGEN', NULL, '8730'),
(46, '120-COC-SAN-038', 16, NULL, 1, 28, 1, 2, '2025-09-19 01:21:27', '2025-09-18 21:21:27', 'Caja de creatina', 100.00, 15.00, 3.75, 11.25, '/qrcodes/120-COC-SAN-038.png', 'EN OFICINAS DE ORIGEN', NULL, '7396'),
(47, '120-SAN-COC-001', 23, 3, 1, 1, 2, 1, '2025-09-23 16:15:07', '2025-09-23 12:15:07', 'caja de regalos ', 100.00, 15.00, 3.75, 11.25, '/qrcodes/120-SAN-COC-001.png', 'ASIGNADO A CONDUCTOR', NULL, '8035'),
(48, '120-SAN-COC-002', 23, 3, 1, 1, 2, 1, '2025-09-23 16:15:53', '2025-09-23 12:15:53', 'caja de regalos ', 100.00, 15.00, 3.75, 11.25, '/qrcodes/120-SAN-COC-002.png', 'ASIGNADO A CONDUCTOR', NULL, '5245'),
(49, '120-SAN-COC-003', 23, 3, 26, 1, 2, 1, '2025-09-23 16:21:26', '2025-09-23 12:21:26', 'caja de computadoras partes', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-SAN-COC-003.png', 'ASIGNADO A CONDUCTOR', NULL, '4957'),
(56, '120-ENT-COC-001', 30, NULL, 1, 1, 3, 1, '2025-09-27 12:05:14', '2025-09-27 08:05:14', 'caja de ropa', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-ENT-COC-001.png', 'EN OFICINAS DE ORIGEN', NULL, '4255'),
(57, '120-ENT-COC-002', 31, 21, 1, 32, 3, 1, '2025-09-27 15:32:17', '2025-09-27 11:32:17', '1 caja de galletas\n2 bolsas de papas\n1 caja de hojas', 3000.00, 60.00, 15.00, 45.00, '/qrcodes/120-ENT-COC-002.png', 'ASIGNADO A CONDUCTOR', NULL, '7632'),
(58, '120-ENT-COC-003', 31, 21, 1, 32, 3, 1, '2025-09-27 15:33:02', '2025-09-27 11:33:02', '1 caja de galletas\n2 bolsas de papas\n1 caja de hojas', 3000.00, 60.00, 15.00, 45.00, '/qrcodes/120-ENT-COC-003.png', 'ASIGNADO A CONDUCTOR', NULL, '9313'),
(59, '120-COC-SAN-039', 16, 3, 1, 1, 1, 2, '2025-09-27 15:34:30', '2025-09-27 11:34:30', 'caja de herramienda', 100.00, 30.00, 7.50, 22.50, '/qrcodes/120-COC-SAN-039.png', 'ASIGNADO A CONDUCTOR', NULL, '9799'),
(60, '120-ENT-COC-004', 31, 21, 1, 32, 3, 1, '2025-09-27 15:34:57', '2025-09-27 11:34:57', '1 caja de galletas\n2 bolsas de papas\n1 caja de hojas', 3000.00, 60.00, 15.00, 45.00, '/qrcodes/120-ENT-COC-004.png', 'ASIGNADO A CONDUCTOR', NULL, '2932'),
(61, '120-ENT-SAN-001', 31, 3, 1, 32, 3, 2, '2025-09-27 16:05:55', '2025-09-27 12:05:55', '2 cajas de hojas bond', 1000.00, 40.00, 10.00, 30.00, '/qrcodes/120-ENT-SAN-001.png', 'ENTREGADO', NULL, '6711'),
(62, '120-ENT-SAC-001', 16, 3, 1, 1, 1, 6, '2025-10-01 06:57:13', '2025-10-01 02:57:13', 'caja de celular', 1000.00, 20.00, 5.00, 15.00, '/qrcodes/120-ENT-SAC-001.png', 'ASIGNADO A CONDUCTOR', NULL, '1916'),
(63, '120-COC-ENT-001', 33, NULL, 1, 1, 12, 11, '2025-10-02 18:24:48', '2025-10-02 14:24:48', 'caja de ropas', 1000.00, 100.00, 10.00, 90.00, '/qrcodes/120-COC-ENT-001.png', 'EN OFICINAS DE ORIGEN', NULL, '7520'),
(65, '120-COC-ENT-002', 33, NULL, 1, 1, 12, 11, '2025-10-02 18:27:41', '2025-10-02 14:27:41', 'cja de mantenimiento', 1000.00, 20.00, 2.00, 18.00, '/qrcodes/120-COC-ENT-002.png', 'EN OFICINAS DE ORIGEN', NULL, '8817'),
(66, '120-CAM-COC-SAN-001', 33, NULL, 1, 1, 12, 13, '2025-10-02 18:47:45', '2025-10-02 14:47:45', 'caja de comida', 100.00, 20.00, 2.00, 18.00, '/qrcodes/120-CAM-COC-SAN-001.png', 'EN OFICINAS DE ORIGEN', NULL, '4940'),
(67, '120-MIN-ENT-LLA-001', 16, 3, 1, 1, 1, 10, '2025-10-02 18:50:10', '2025-10-02 14:50:10', 'caja de herramientas', 100.00, 20.00, 5.00, 15.00, '/qrcodes/120-MIN-ENT-LLA-001.png', 'ASIGNADO A CONDUCTOR', NULL, '3094');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_estado`
--

CREATE TABLE `historial_estado` (
  `id_historial` int(11) NOT NULL,
  `id_encomienda` int(11) DEFAULT NULL,
  `estado` enum('EN OFICINAS DE ORIGEN','ASIGNADO A CONDUCTOR','EN TRÁNSITO','EN OFICINAS DE DESTINO','ENTREGADO') DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp(),
  `registrado_por` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_estado`
--

INSERT INTO `historial_estado` (`id_historial`, `id_encomienda`, `estado`, `fecha`, `registrado_por`) VALUES
(1, 1, 'EN OFICINAS DE ORIGEN', '2025-09-08 19:50:25', 2),
(2, 2, 'EN OFICINAS DE ORIGEN', '2025-09-08 20:03:16', 2),
(3, 3, 'EN OFICINAS DE ORIGEN', '2025-09-08 20:04:52', 2),
(4, 4, 'EN OFICINAS DE ORIGEN', '2025-09-08 20:14:59', 2),
(5, 5, 'EN OFICINAS DE ORIGEN', '2025-09-08 20:21:01', 2),
(6, 6, 'EN OFICINAS DE ORIGEN', '2025-09-08 20:28:33', 2),
(7, 6, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:11', NULL),
(8, 5, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:11', NULL),
(9, 4, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:11', NULL),
(10, 3, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:11', NULL),
(11, 2, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:11', NULL),
(12, 1, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:11', NULL),
(13, 6, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:14', NULL),
(14, 5, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:14', NULL),
(15, 4, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:14', NULL),
(16, 3, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:14', NULL),
(17, 2, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:14', NULL),
(18, 1, 'ASIGNADO A CONDUCTOR', '2025-09-08 20:31:14', NULL),
(19, 7, 'EN OFICINAS DE ORIGEN', '2025-09-08 20:41:25', 2),
(20, 8, 'EN OFICINAS DE ORIGEN', '2025-09-08 20:46:53', 2),
(21, 9, 'EN OFICINAS DE ORIGEN', '2025-09-08 21:08:28', 2),
(22, 10, 'EN OFICINAS DE ORIGEN', '2025-09-08 21:11:56', 2),
(23, 11, 'EN OFICINAS DE ORIGEN', '2025-09-08 21:16:03', 2),
(24, 12, 'EN OFICINAS DE ORIGEN', '2025-09-08 21:16:33', 2),
(25, 13, 'EN OFICINAS DE ORIGEN', '2025-09-08 21:19:34', 2),
(26, 13, 'ASIGNADO A CONDUCTOR', '2025-09-08 21:47:49', 2),
(27, 12, 'ASIGNADO A CONDUCTOR', '2025-09-08 21:47:49', 2),
(28, 4, 'EN TRÁNSITO', '2025-09-09 06:44:33', NULL),
(29, 3, 'EN TRÁNSITO', '2025-09-09 06:45:04', NULL),
(30, 2, 'EN TRÁNSITO', '2025-09-09 06:45:19', NULL),
(31, 11, 'ASIGNADO A CONDUCTOR', '2025-09-09 06:45:43', 2),
(32, 10, 'ASIGNADO A CONDUCTOR', '2025-09-09 06:45:43', 2),
(33, 1, 'EN TRÁNSITO', '2025-09-09 06:46:30', NULL),
(34, 5, 'EN TRÁNSITO', '2025-09-09 06:46:45', NULL),
(35, 6, 'EN TRÁNSITO', '2025-09-09 06:46:57', NULL),
(36, 6, 'EN TRÁNSITO', '2025-09-09 06:47:51', NULL),
(37, 13, 'EN TRÁNSITO', '2025-09-09 11:34:09', NULL),
(38, 12, 'EN TRÁNSITO', '2025-09-09 11:34:23', NULL),
(39, 9, 'ASIGNADO A CONDUCTOR', '2025-09-09 11:41:08', 3),
(40, 8, 'ASIGNADO A CONDUCTOR', '2025-09-09 11:41:08', 3),
(41, 9, 'EN TRÁNSITO', '2025-09-09 11:45:55', NULL),
(42, 8, 'EN TRÁNSITO', '2025-09-09 11:46:22', NULL),
(43, 14, 'EN OFICINAS DE ORIGEN', '2025-09-09 11:55:16', 2),
(44, 14, 'ASIGNADO A CONDUCTOR', '2025-09-09 11:56:05', 2),
(45, 7, 'ASIGNADO A CONDUCTOR', '2025-09-09 11:56:05', 2),
(46, 7, 'EN TRÁNSITO', '2025-09-09 11:57:23', NULL),
(47, 14, 'EN TRÁNSITO', '2025-09-09 11:57:41', NULL),
(48, 7, 'EN OFICINAS DE DESTINO', '2025-09-09 14:31:50', NULL),
(49, 14, 'EN OFICINAS DE DESTINO', '2025-09-09 14:32:15', NULL),
(50, 15, 'EN OFICINAS DE ORIGEN', '2025-09-09 16:07:19', 12),
(51, 15, 'ASIGNADO A CONDUCTOR', '2025-09-09 16:09:24', 12),
(52, 15, 'EN TRÁNSITO', '2025-09-09 16:10:58', NULL),
(53, 16, 'EN OFICINAS DE ORIGEN', '2025-09-09 17:18:16', 2),
(54, 16, 'ASIGNADO A CONDUCTOR', '2025-09-09 17:20:31', 2),
(55, 16, 'EN TRÁNSITO', '2025-09-09 17:22:28', NULL),
(56, 16, 'EN OFICINAS DE DESTINO', '2025-09-09 17:24:55', NULL),
(57, 17, 'EN OFICINAS DE ORIGEN', '2025-09-09 18:25:39', 16),
(58, 18, 'EN OFICINAS DE ORIGEN', '2025-09-09 18:26:05', 16),
(59, 19, 'EN OFICINAS DE ORIGEN', '2025-09-09 18:26:11', 16),
(60, 19, 'ASIGNADO A CONDUCTOR', '2025-09-09 18:29:53', 16),
(61, 18, 'ASIGNADO A CONDUCTOR', '2025-09-09 18:29:53', 16),
(62, 17, 'ASIGNADO A CONDUCTOR', '2025-09-09 18:29:53', 16),
(63, 19, 'EN TRÁNSITO', '2025-09-09 18:33:18', NULL),
(64, 17, 'EN TRÁNSITO', '2025-09-09 18:35:07', NULL),
(65, 18, 'EN TRÁNSITO', '2025-09-09 18:35:41', NULL),
(66, 18, 'EN OFICINAS DE DESTINO', '2025-09-09 18:41:57', NULL),
(67, 18, 'EN OFICINAS DE DESTINO', '2025-09-09 18:42:48', NULL),
(68, 19, 'EN TRÁNSITO', '2025-09-09 18:42:53', NULL),
(69, 18, 'EN OFICINAS DE DESTINO', '2025-09-09 18:43:29', NULL),
(70, 20, 'EN OFICINAS DE ORIGEN', '2025-09-11 22:16:12', 2),
(71, 21, 'EN OFICINAS DE ORIGEN', '2025-09-16 22:13:24', 16),
(72, 22, 'EN OFICINAS DE ORIGEN', '2025-09-17 01:08:24', 16),
(73, 23, 'EN OFICINAS DE ORIGEN', '2025-09-17 01:16:01', 16),
(74, 24, 'EN OFICINAS DE ORIGEN', '2025-09-17 01:19:29', 16),
(75, 25, 'EN OFICINAS DE ORIGEN', '2025-09-17 01:30:04', 16),
(76, 24, 'ASIGNADO A CONDUCTOR', '2025-09-17 01:42:50', 16),
(77, 25, 'ASIGNADO A CONDUCTOR', '2025-09-17 01:42:50', 16),
(78, 26, 'EN OFICINAS DE ORIGEN', '2025-09-17 01:48:30', 16),
(79, 27, 'EN OFICINAS DE ORIGEN', '2025-09-17 03:25:47', 16),
(80, 28, 'EN OFICINAS DE ORIGEN', '2025-09-17 03:41:04', 16),
(81, 28, 'ASIGNADO A CONDUCTOR', '2025-09-17 03:45:30', 16),
(82, 27, 'ASIGNADO A CONDUCTOR', '2025-09-17 03:45:30', 16),
(83, 26, 'ASIGNADO A CONDUCTOR', '2025-09-17 03:45:30', 16),
(84, 23, 'ASIGNADO A CONDUCTOR', '2025-09-17 03:45:30', 16),
(85, 23, 'EN TRÁNSITO', '2025-09-17 03:47:42', NULL),
(86, 26, 'EN TRÁNSITO', '2025-09-17 03:47:58', NULL),
(87, 27, 'EN TRÁNSITO', '2025-09-17 03:49:12', NULL),
(88, 28, 'EN TRÁNSITO', '2025-09-17 03:49:27', NULL),
(89, 29, 'EN OFICINAS DE ORIGEN', '2025-09-17 03:56:14', 16),
(90, 30, 'EN OFICINAS DE ORIGEN', '2025-09-17 03:58:55', 16),
(91, 31, 'EN OFICINAS DE ORIGEN', '2025-09-17 04:01:17', 16),
(92, 32, 'EN OFICINAS DE ORIGEN', '2025-09-17 04:20:28', 16),
(93, 33, 'EN OFICINAS DE ORIGEN', '2025-09-17 04:30:38', 16),
(94, 34, 'EN OFICINAS DE ORIGEN', '2025-09-17 05:40:37', 16),
(95, 34, 'ASIGNADO A CONDUCTOR', '2025-09-17 05:50:05', 16),
(96, 34, 'EN TRÁNSITO', '2025-09-17 05:51:25', NULL),
(97, 34, 'EN OFICINAS DE DESTINO', '2025-09-17 05:52:51', NULL),
(98, 34, 'ENTREGADO', '2025-09-17 05:53:19', 23),
(99, 28, 'EN OFICINAS DE DESTINO', '2025-09-17 06:33:41', NULL),
(100, 33, 'ASIGNADO A CONDUCTOR', '2025-09-17 06:34:58', 16),
(101, 32, 'ASIGNADO A CONDUCTOR', '2025-09-17 06:34:58', 16),
(102, 33, 'EN TRÁNSITO', '2025-09-17 06:38:14', NULL),
(103, 32, 'EN TRÁNSITO', '2025-09-17 06:38:28', NULL),
(104, 32, 'EN OFICINAS DE DESTINO', '2025-09-17 06:39:57', NULL),
(105, 33, 'EN OFICINAS DE DESTINO', '2025-09-17 06:40:12', NULL),
(106, 32, 'ENTREGADO', '2025-09-17 09:43:11', 23),
(107, 35, 'EN OFICINAS DE ORIGEN', '2025-09-17 16:43:59', 16),
(108, 36, 'EN OFICINAS DE ORIGEN', '2025-09-17 18:42:32', 16),
(109, 36, 'ASIGNADO A CONDUCTOR', '2025-09-17 18:44:43', 16),
(110, 36, 'EN TRÁNSITO', '2025-09-17 18:46:14', NULL),
(111, 36, 'EN OFICINAS DE DESTINO', '2025-09-17 18:49:01', NULL),
(112, 36, 'ENTREGADO', '2025-09-17 18:55:37', 23),
(113, 37, 'EN OFICINAS DE ORIGEN', '2025-09-17 19:13:43', 16),
(114, 37, 'ASIGNADO A CONDUCTOR', '2025-09-17 19:18:32', 16),
(115, 35, 'ASIGNADO A CONDUCTOR', '2025-09-17 19:18:32', 16),
(116, 31, 'ASIGNADO A CONDUCTOR', '2025-09-17 19:18:32', 16),
(117, 37, 'EN TRÁNSITO', '2025-09-17 19:24:36', NULL),
(118, 31, 'EN TRÁNSITO', '2025-09-17 19:25:20', NULL),
(119, 35, 'EN TRÁNSITO', '2025-09-17 19:25:32', NULL),
(120, 37, 'EN OFICINAS DE DESTINO', '2025-09-17 19:26:31', NULL),
(121, 31, 'EN OFICINAS DE DESTINO', '2025-09-17 19:26:46', NULL),
(122, 35, 'EN OFICINAS DE DESTINO', '2025-09-17 19:27:00', NULL),
(123, 37, 'ENTREGADO', '2025-09-17 19:32:55', 23),
(124, 30, 'ASIGNADO A CONDUCTOR', '2025-09-17 19:37:59', 16),
(125, 29, 'ASIGNADO A CONDUCTOR', '2025-09-17 19:37:59', 16),
(126, 30, 'EN TRÁNSITO', '2025-09-17 19:40:59', NULL),
(127, 38, 'EN OFICINAS DE ORIGEN', '2025-09-19 00:53:14', 16),
(128, 39, 'EN OFICINAS DE ORIGEN', '2025-09-19 00:56:40', 16),
(129, 40, 'EN OFICINAS DE ORIGEN', '2025-09-19 01:02:24', 16),
(130, 41, 'EN OFICINAS DE ORIGEN', '2025-09-19 01:04:53', 16),
(131, 42, 'EN OFICINAS DE ORIGEN', '2025-09-19 01:05:57', 16),
(132, 43, 'EN OFICINAS DE ORIGEN', '2025-09-19 01:07:37', 16),
(133, 44, 'EN OFICINAS DE ORIGEN', '2025-09-19 01:08:00', 16),
(134, 45, 'EN OFICINAS DE ORIGEN', '2025-09-19 01:18:48', 16),
(135, 46, 'EN OFICINAS DE ORIGEN', '2025-09-19 01:21:27', 16),
(136, 47, 'EN OFICINAS DE ORIGEN', '2025-09-23 16:15:07', 23),
(137, 48, 'EN OFICINAS DE ORIGEN', '2025-09-23 16:15:53', 23),
(138, 49, 'EN OFICINAS DE ORIGEN', '2025-09-23 16:21:26', 23),
(139, 35, 'ENTREGADO', '2025-09-27 02:55:10', 23),
(140, 56, 'EN OFICINAS DE ORIGEN', '2025-09-27 12:05:14', 30),
(141, 57, 'EN OFICINAS DE ORIGEN', '2025-09-27 15:32:17', 31),
(142, 58, 'EN OFICINAS DE ORIGEN', '2025-09-27 15:33:02', 31),
(143, 59, 'EN OFICINAS DE ORIGEN', '2025-09-27 15:34:30', 16),
(144, 60, 'EN OFICINAS DE ORIGEN', '2025-09-27 15:34:57', 31),
(145, 60, 'ASIGNADO A CONDUCTOR', '2025-09-27 15:46:14', 31),
(146, 58, 'ASIGNADO A CONDUCTOR', '2025-09-27 15:46:14', 31),
(147, 57, 'ASIGNADO A CONDUCTOR', '2025-09-27 15:46:14', 31),
(148, 61, 'EN OFICINAS DE ORIGEN', '2025-09-27 16:05:55', 31),
(149, 61, 'ASIGNADO A CONDUCTOR', '2025-09-27 16:06:57', 31),
(150, 61, 'EN TRÁNSITO', '2025-09-27 16:16:22', NULL),
(151, 61, 'EN TRÁNSITO', '2025-09-27 16:16:24', NULL),
(152, 61, 'EN OFICINAS DE DESTINO', '2025-09-27 16:26:02', NULL),
(153, 61, 'ENTREGADO', '2025-09-27 16:31:45', 11),
(154, 49, 'ASIGNADO A CONDUCTOR', '2025-09-29 13:18:42', 23),
(155, 48, 'ASIGNADO A CONDUCTOR', '2025-09-29 13:18:42', 23),
(156, 47, 'ASIGNADO A CONDUCTOR', '2025-09-29 13:18:42', 23),
(157, 62, 'EN OFICINAS DE ORIGEN', '2025-10-01 06:57:13', 16),
(158, 63, 'EN OFICINAS DE ORIGEN', '2025-10-02 18:24:48', 33),
(159, 65, 'EN OFICINAS DE ORIGEN', '2025-10-02 18:27:41', 33),
(160, 66, 'EN OFICINAS DE ORIGEN', '2025-10-02 18:47:45', 33),
(161, 67, 'EN OFICINAS DE ORIGEN', '2025-10-02 18:50:10', 16),
(162, 67, 'ASIGNADO A CONDUCTOR', '2025-10-02 20:22:39', 16),
(163, 62, 'ASIGNADO A CONDUCTOR', '2025-10-02 20:22:39', 16),
(164, 59, 'ASIGNADO A CONDUCTOR', '2025-10-02 20:22:39', 16);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `manifiesto`
--

CREATE TABLE `manifiesto` (
  `id_manifiesto` int(11) NOT NULL,
  `numero_manifiesto` varchar(50) NOT NULL,
  `id_conductor` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `id_secretaria` int(11) DEFAULT NULL,
  `estado` enum('ASIGNADO','EN TRÁNSITO','ENTREGADO') DEFAULT 'ASIGNADO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `manifiesto`
--

INSERT INTO `manifiesto` (`id_manifiesto`, `numero_manifiesto`, `id_conductor`, `fecha`, `id_secretaria`, `estado`) VALUES
(1, 'MANI-023E5EAC', 3, '2025-09-08 16:31:11', 2, 'ASIGNADO'),
(2, 'MANI-B4E9D700', 3, '2025-09-08 16:31:14', 2, 'ASIGNADO'),
(3, 'MANI-A2F317C6', 3, '2025-09-08 17:47:49', 2, 'ASIGNADO'),
(4, 'MANI-DEE51858', 6, '2025-09-09 02:45:43', 2, 'ASIGNADO'),
(5, 'MANI-D457D5D7', 3, '2025-09-09 07:41:08', 3, 'ASIGNADO'),
(6, 'MANI-ACDEEC72', 3, '2025-09-09 07:56:05', 2, 'EN TRÁNSITO'),
(7, 'MANI-9F93C94F', 3, '2025-09-09 12:09:24', 12, 'EN TRÁNSITO'),
(8, 'MANI-9CD70488', 3, '2025-09-09 13:20:31', 2, 'EN TRÁNSITO'),
(9, 'MANI-CF9BF4AC', 17, '2025-09-09 14:29:53', 16, 'EN TRÁNSITO'),
(10, 'MANI-FC785D49', 3, '2025-09-16 21:42:50', 16, 'ASIGNADO'),
(11, 'MANI-6C3085D0', 3, '2025-09-16 23:45:30', 16, 'EN TRÁNSITO'),
(12, 'MANI-01E32D39', 3, '2025-09-17 01:50:05', 16, 'EN TRÁNSITO'),
(13, 'MANI-47B67FB9', 3, '2025-09-17 02:34:58', 16, 'EN TRÁNSITO'),
(14, 'MANI-26A081F4', 3, '2025-09-17 14:44:43', 16, 'EN TRÁNSITO'),
(15, 'MANI-8F6C3EC3', 3, '2025-09-17 15:18:32', 16, 'EN TRÁNSITO'),
(16, 'MANI-D8B07634', 3, '2025-09-17 15:37:59', 16, 'EN TRÁNSITO'),
(17, 'MANI-247F6EF0', 21, '2025-09-27 11:46:14', 31, 'ASIGNADO'),
(18, 'MANI-9F5D531D', 3, '2025-09-27 12:06:57', 31, 'EN TRÁNSITO'),
(19, 'MANI-624727C0', 3, '2025-09-29 09:18:42', 23, 'ASIGNADO'),
(20, 'MANI-89B2EB84', 3, '2025-10-02 16:22:39', 16, 'ASIGNADO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `manifiesto_encomienda`
--

CREATE TABLE `manifiesto_encomienda` (
  `id_manifiesto` int(11) NOT NULL,
  `id_encomienda` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `manifiesto_encomienda`
--

INSERT INTO `manifiesto_encomienda` (`id_manifiesto`, `id_encomienda`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(2, 6),
(3, 12),
(3, 13),
(4, 10),
(4, 11),
(5, 8),
(5, 9),
(6, 7),
(6, 14),
(7, 15),
(8, 16),
(9, 17),
(9, 18),
(9, 19),
(10, 24),
(10, 25),
(11, 23),
(11, 26),
(11, 27),
(11, 28),
(12, 34),
(13, 32),
(13, 33),
(14, 36),
(15, 31),
(15, 35),
(15, 37),
(16, 29),
(16, 30),
(17, 57),
(17, 58),
(17, 60),
(18, 61),
(19, 47),
(19, 48),
(19, 49),
(20, 59),
(20, 62),
(20, 67);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `persona`
--

CREATE TABLE `persona` (
  `id_persona` int(11) NOT NULL,
  `id_rol` int(11) DEFAULT NULL,
  `placa` varchar(20) DEFAULT NULL,
  `id_sucursal` int(11) DEFAULT NULL,
  `ci` varchar(20) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `contrasena` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `persona`
--

INSERT INTO `persona` (`id_persona`, `id_rol`, `placa`, `id_sucursal`, `ci`, `nombre`, `apellido`, `correo`, `celular`, `contrasena`, `activo`) VALUES
(1, 1, NULL, NULL, '9391668', 'Ruben', 'Felipe', 'ruben@entrerios.com', '+59174819122', '$2b$10$QksWmWgORtDwyVRHQu2mKukluvXfQMdGcIgNHah0L91Nw.edKnSwq', 1),
(2, 2, NULL, 1, '12345678', 'Judith', 'Herrera', 'judith@entrerios.com', '+59174819122', '$2b$10$4ieR492T9.W/d5XTG4ElA.CDOByrDrdP3tluNlknYGvqlEyUsKVpS', 1),
(3, 3, NULL, NULL, '12131415', 'Luis', 'Zambrana', 'luis@entrerios.com', '+59165302430', '$2b$10$.SWBovfWvULQ9N2VYDFF6OOQIEFrrpN8PJnRWjzCxfF7DhKUJQf/i', 1),
(4, 2, '', 1, '9328281', 'Carmen', 'Mejia', 'carmen@entrerios.com', '74800956', '$2b$10$wyiqQZ6Q3nirjvl.7L773ulJGdbeJT7oG9ZGxHWO8anToM1xwoWOq', 1),
(5, 2, '', 1, '9328281', 'Carmen', 'Mejia', 'carmen@entrerios.com', '74800956', '$2b$10$0Q4MgHmuTHzwX8IqxWHK7e68MsOJCodTNuGAljwCI2UIISaHe3iCO', 1),
(6, 3, '8978LLI', NULL, '9391668', 'Lucía', 'Mendez', 'lucia@entrerios.com', '68507270', '$2b$10$Z7E/RAoVENGLi7fPcPbeMOSPVmmb9k20J6mdOKaxSiVDBQwsQNQVq', 1),
(7, 3, '8737LLI', 1, '93916689', 'Maria', 'Villaroel', 'maria@entrerios.com', '74819122', '$2b$10$SBUYAS/l/7p.WCO7XcbA5emaQ.dPXncIKH69TqmXsXJEBV/2yhjle', 1),
(8, NULL, NULL, NULL, '87654321', 'Ana', 'Gómez', 'ana@example.com', '+59176495771', NULL, 1),
(9, NULL, NULL, NULL, '123456678', 'judith', 'Herrera', 'judith@gmail.com', '+59163846194', NULL, 1),
(10, NULL, NULL, NULL, '12969372', 'Yolanda', 'Aguirre', NULL, '+59164902557', NULL, 1),
(11, 2, '', 2, '63485890', 'Juana', 'Mamani', 'juana@entrerios.com', '63485890', '$2b$10$bEB/hICnho25z/Rr5o0fteV9rXcRl9ylGSI8h6OagAsBxYP4PyiBi', 1),
(12, 2, '', 2, '22232425', 'Silvia', 'Zarate', 'silvia@entrerios.com', '63411510', '$2b$10$Ep6sHRnc6aLfdOJZ//.C0Oi5U5hhEPI9QmdB9w.PY/Uud5MbHZffa', 1),
(13, NULL, NULL, NULL, '6820220', 'Juan', 'Bustamante', NULL, '+59175982895', NULL, 1),
(14, NULL, NULL, NULL, '7908686', 'Jhoel', 'Villarroel', 'jhoel@gmail.com', '+59169521488', NULL, 1),
(15, 1, '', NULL, '3134251', 'Miguel', 'Florido', 'miguel@entrerios.com', '+59167410049', '$2b$10$pCJTXasO6WNjlUAceqkZoeSw/FrgH5DrQKEFM1LbP0cd8OE5TCxEa', 1),
(16, 2, '', 1, '3757338', 'Dunia', 'Soliz', 'dunia@entrerios.com', '70726817', '$2b$10$w/rHaoqkoh.zCr79vK2hSeHoT8bUSysImvUp3zwVJyFoCr03WI1l.', 1),
(17, 3, '1234LIP', NULL, '5266057', 'Paula', 'Aquino', 'paula@entrerios.com', '+59172295977', '$2b$10$fYyinz2l.YvimJVtKrI32.f2chmVV5OJpgvxcklhsxilj1MqMUUb6', 1),
(18, 3, '3456788', NULL, '123456789', 'Rubencito', 'Felipe', 'otroruben@gmsil.com', '12345678', '$2b$10$L7HLFi/dmI4b3IqSm7kWceBbYtHcMpIZn.4.S8Htemte8WrcBZFiu', 1),
(19, NULL, NULL, NULL, '55555', 'Pablo', 'Perez', NULL, '+59177777777', NULL, 1),
(20, NULL, NULL, NULL, '33334', 'Yo', 'El', 'mi@gmail.com', '+59112121212', NULL, 1),
(21, 3, 'Rrrr456', NULL, '12345555', 'Rubencito', 'Perez', 'otroruben@gmail.com', '66666665', '$2b$10$Sf1tE6c0exJqzfSI0bkEYeFLQYfUK8RXJ...6vJ2AlRSPIgT9rhkm', 1),
(22, NULL, NULL, NULL, '9486084', 'Rodrigo', 'Valencia', 'rodrigo@gmail.com', '+59175953266', NULL, 1),
(23, 2, '', 2, '9486085', 'Jose', 'Valencia', 'jose@entrerios.com', '75953266', '$2b$10$byPGJ84K9Z9KYQPijMIcf.mpLDVCGbZY8RlPI7MfQKfKFI1ATievi', 1),
(24, NULL, NULL, NULL, '1234567890', 'Jhuly', 'Flores', NULL, '+59163885990', NULL, 1),
(25, NULL, NULL, NULL, '11223344', 'Jhuly', 'Flores', NULL, '+59163885920', NULL, 1),
(26, NULL, NULL, NULL, '13751750', 'Luis Federico', 'Castillo F', NULL, '+59165302430', NULL, 1),
(27, NULL, NULL, NULL, '60394280', 'Jose', 'Atora', NULL, '+59160394280', NULL, 1),
(28, NULL, NULL, NULL, '9516604', 'Fabricio', 'Balderrama', NULL, '+59162668053', NULL, 1),
(29, 2, '', 3, '2783678', 'Lucia', 'Aramayo', 'luciaa@entrerios.com', '74819133', '$2b$10$ijnaiw14KQaFiHxnPdb2AejgXgcDZldgtIdsy4/A/JR2AAP.JpHlu', 1),
(30, 2, '', 3, '9391667', 'Maria', 'Vargas', 'maria23@entrerios.com', '74819144', '$2b$10$pgAicFH3m9SXJ1Wm6q2G..phDRjTyYCfE.XqP0.7P8Inlijf5X.9a', 1),
(31, 2, '', 3, '93916678', 'Margarita', 'Mejia', 'margarita@entrerios.com', '78727327', '$2b$10$WzrezhNhy05Bkxaz6y02ROag7YEIlUq9NbQ5s2BO0Ywv1m32wTdfe', 1),
(32, NULL, NULL, NULL, '5222331', 'Ruben', 'Franco Medrano', NULL, '+59163840874', NULL, 1),
(33, 2, '', 12, '94938289', 'Yolanda', 'Aguirre', 'yolanda@entrerios.com', '64902557', '$2b$10$Oh3QEiSiCbiZyGMmdrCVae76L4le61CUEUygSJauPe0RDJkZYVoVO', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre`) VALUES
(1, 'Administrador'),
(2, 'Secretaria'),
(3, 'Conductor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sector_sucursal`
--

CREATE TABLE `sector_sucursal` (
  `id_sector` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `porcentaje_empresa` decimal(5,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sector_sucursal`
--

INSERT INTO `sector_sucursal` (`id_sector`, `nombre`, `porcentaje_empresa`) VALUES
(1, 'Minibuses', 25.00),
(2, 'Camiones', 10.00),
(3, 'Buses y Micros', 25.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sucursal`
--

CREATE TABLE `sucursal` (
  `id_sucursal` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `id_sector` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sucursal`
--

INSERT INTO `sucursal` (`id_sucursal`, `nombre`, `ubicacion`, `id_sector`) VALUES
(1, 'Entre Rios (dia)', 'Terminal', 1),
(2, 'Cochabamba', 'Parada Chapare', 1),
(3, 'Entre rios (noche)', 'Terminal ', 1),
(6, 'Sacaba', 'terminal', 1),
(7, 'Isarzama', 'terminal', 1),
(8, 'Manco Kapac', 'terminal', 1),
(9, 'Sucre', 'terminal', 1),
(10, 'Llallagua', 'terminal', 1),
(11, 'Entre Rios', 'terminal', 2),
(12, 'Cochabamba', 'terminal', 2),
(13, 'Santa Cruz', 'terminal', 2),
(14, 'Entre Rios Terminal Municipal', 'Terminal Municipal', 3),
(15, 'Entre Rios Terminal Cooperativa', 'Terminal Cooperativa', 3),
(16, 'Cochabamba', 'terminal', 3),
(17, 'Sacaba', 'terminal', 3),
(18, 'Sucre', 'Terminal', 3),
(19, 'Izarsama', 'terminal', 3),
(20, 'Rio blanco', 'terminal', 3),
(21, 'Manco Kapac', 'terminal', 3);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `encomienda`
--
ALTER TABLE `encomienda`
  ADD PRIMARY KEY (`id_encomienda`),
  ADD UNIQUE KEY `numero_guia` (`numero_guia`),
  ADD KEY `id_secretaria` (`id_secretaria`),
  ADD KEY `id_conductor` (`id_conductor`),
  ADD KEY `id_remitente` (`id_remitente`),
  ADD KEY `id_consignatorio` (`id_consignatorio`),
  ADD KEY `id_sucursal_origen` (`id_sucursal_origen`),
  ADD KEY `id_sucursal_destino` (`id_sucursal_destino`);

--
-- Indices de la tabla `historial_estado`
--
ALTER TABLE `historial_estado`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_encomienda` (`id_encomienda`),
  ADD KEY `registrado_por` (`registrado_por`);

--
-- Indices de la tabla `manifiesto`
--
ALTER TABLE `manifiesto`
  ADD PRIMARY KEY (`id_manifiesto`),
  ADD UNIQUE KEY `numero_manifiesto` (`numero_manifiesto`);

--
-- Indices de la tabla `manifiesto_encomienda`
--
ALTER TABLE `manifiesto_encomienda`
  ADD PRIMARY KEY (`id_manifiesto`,`id_encomienda`),
  ADD KEY `id_encomienda` (`id_encomienda`);

--
-- Indices de la tabla `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`id_persona`),
  ADD KEY `id_rol` (`id_rol`),
  ADD KEY `id_sucursal` (`id_sucursal`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `sector_sucursal`
--
ALTER TABLE `sector_sucursal`
  ADD PRIMARY KEY (`id_sector`);

--
-- Indices de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  ADD PRIMARY KEY (`id_sucursal`),
  ADD KEY `fk_sector` (`id_sector`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `encomienda`
--
ALTER TABLE `encomienda`
  MODIFY `id_encomienda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT de la tabla `historial_estado`
--
ALTER TABLE `historial_estado`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT de la tabla `manifiesto`
--
ALTER TABLE `manifiesto`
  MODIFY `id_manifiesto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `persona`
--
ALTER TABLE `persona`
  MODIFY `id_persona` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `sector_sucursal`
--
ALTER TABLE `sector_sucursal`
  MODIFY `id_sector` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `sucursal`
--
ALTER TABLE `sucursal`
  MODIFY `id_sucursal` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `encomienda`
--
ALTER TABLE `encomienda`
  ADD CONSTRAINT `encomienda_ibfk_1` FOREIGN KEY (`id_secretaria`) REFERENCES `persona` (`id_persona`),
  ADD CONSTRAINT `encomienda_ibfk_2` FOREIGN KEY (`id_conductor`) REFERENCES `persona` (`id_persona`),
  ADD CONSTRAINT `encomienda_ibfk_3` FOREIGN KEY (`id_remitente`) REFERENCES `persona` (`id_persona`),
  ADD CONSTRAINT `encomienda_ibfk_4` FOREIGN KEY (`id_consignatorio`) REFERENCES `persona` (`id_persona`),
  ADD CONSTRAINT `encomienda_ibfk_5` FOREIGN KEY (`id_sucursal_origen`) REFERENCES `sucursal` (`id_sucursal`),
  ADD CONSTRAINT `encomienda_ibfk_6` FOREIGN KEY (`id_sucursal_destino`) REFERENCES `sucursal` (`id_sucursal`);

--
-- Filtros para la tabla `historial_estado`
--
ALTER TABLE `historial_estado`
  ADD CONSTRAINT `historial_estado_ibfk_1` FOREIGN KEY (`id_encomienda`) REFERENCES `encomienda` (`id_encomienda`),
  ADD CONSTRAINT `historial_estado_ibfk_2` FOREIGN KEY (`registrado_por`) REFERENCES `persona` (`id_persona`);

--
-- Filtros para la tabla `manifiesto_encomienda`
--
ALTER TABLE `manifiesto_encomienda`
  ADD CONSTRAINT `manifiesto_encomienda_ibfk_1` FOREIGN KEY (`id_manifiesto`) REFERENCES `manifiesto` (`id_manifiesto`),
  ADD CONSTRAINT `manifiesto_encomienda_ibfk_2` FOREIGN KEY (`id_encomienda`) REFERENCES `encomienda` (`id_encomienda`);

--
-- Filtros para la tabla `persona`
--
ALTER TABLE `persona`
  ADD CONSTRAINT `persona_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  ADD CONSTRAINT `persona_ibfk_3` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`);

--
-- Filtros para la tabla `sucursal`
--
ALTER TABLE `sucursal`
  ADD CONSTRAINT `fk_sector` FOREIGN KEY (`id_sector`) REFERENCES `sector_sucursal` (`id_sector`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

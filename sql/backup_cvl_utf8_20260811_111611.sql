-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: cvl_psicologia
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alertas_desviacion`
--

DROP TABLE IF EXISTS `alertas_desviacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alertas_desviacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `asignacion_id` int(11) NOT NULL,
  `sesion_id` int(11) DEFAULT NULL,
  `tipo` enum('retraso','salto_meta','repeticion','fuera_programa','otro') NOT NULL,
  `descripcion` text NOT NULL,
  `detectada_por` int(11) DEFAULT NULL,
  `gravedad` enum('baja','media','alta','critica') DEFAULT 'media',
  `resuelta` tinyint(1) DEFAULT 0,
  `resuelta_por` int(11) DEFAULT NULL,
  `notas_resolucion` text DEFAULT NULL,
  `fecha_resolucion` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `asignacion_id` (`asignacion_id`),
  KEY `sesion_id` (`sesion_id`),
  KEY `detectada_por` (`detectada_por`),
  KEY `resuelta_por` (`resuelta_por`),
  KEY `idx_alertas_resuelta` (`resuelta`),
  KEY `idx_alertas_gravedad` (`gravedad`),
  CONSTRAINT `alertas_desviacion_ibfk_1` FOREIGN KEY (`asignacion_id`) REFERENCES `asignaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alertas_desviacion_ibfk_2` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `alertas_desviacion_ibfk_3` FOREIGN KEY (`detectada_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `alertas_desviacion_ibfk_4` FOREIGN KEY (`resuelta_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas_desviacion`
--

LOCK TABLES `alertas_desviacion` WRITE;
/*!40000 ALTER TABLE `alertas_desviacion` DISABLE KEYS */;
INSERT INTO `alertas_desviacion` VALUES (1,1,4,'repeticion','Paciente no logr?? dominar t??cnica de relajaci??n muscular. Necesita repetici??n o adaptaci??n.',4,'media',0,NULL,NULL,NULL,'2026-07-29 16:01:16'),(2,4,9,'repeticion','Resistencia a la activaci??n conductual en sesiones 3 y 4. Patr??n de evitaci??n.',5,'alta',1,2,'Acordado con Dra. Ruiz: modificar enfoque a activaci??n graduada m??s lenta, agregar sesi??n extra de activaci??n.','2026-02-15 06:00:00','2026-07-29 16:01:16'),(3,4,11,'retraso','Retraso de 1 semana en sesi??n 5 por agenda laboral. Posible factor de deserci??n.',5,'media',1,2,'Reprogramar sesiones a viernes en lugar de jueves.','2026-02-08 06:00:00','2026-07-29 16:01:16');
/*!40000 ALTER TABLE `alertas_desviacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones`
--

DROP TABLE IF EXISTS `asignaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asignaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paciente_id` int(11) NOT NULL,
  `psicologa_id` int(11) NOT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `programa_id` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin_estimada` date DEFAULT NULL,
  `fecha_fin_real` date DEFAULT NULL,
  `sesion_actual` int(11) DEFAULT 0,
  `estado` enum('en_curso','pausado','completado','desviado','cancelado') DEFAULT 'en_curso',
  `motivo_estado` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `programa_id` (`programa_id`),
  KEY `idx_asignaciones_estado` (`estado`),
  KEY `idx_asignaciones_psicologa` (`psicologa_id`),
  CONSTRAINT `asignaciones_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_ibfk_2` FOREIGN KEY (`psicologa_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_ibfk_3` FOREIGN KEY (`supervisor_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `asignaciones_ibfk_4` FOREIGN KEY (`programa_id`) REFERENCES `programas_terapeuticos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones`
--

LOCK TABLES `asignaciones` WRITE;
/*!40000 ALTER TABLE `asignaciones` DISABLE KEYS */;
INSERT INTO `asignaciones` VALUES (1,1,4,2,1,'2026-01-15','2026-04-15',NULL,5,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(2,4,4,2,1,'2026-02-01','2026-05-01',NULL,3,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(3,7,4,2,2,'2026-01-20','2026-05-20',NULL,8,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(4,2,5,2,2,'2026-01-10','2026-05-10',NULL,7,'desviado',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(5,5,5,3,3,'2026-02-15','2026-06-15',NULL,4,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(6,8,5,2,2,'2026-03-01','2026-07-01',NULL,2,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(7,3,6,2,4,'2026-01-05','2026-04-05',NULL,10,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(8,6,6,3,1,'2026-02-10','2026-05-10',NULL,6,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(9,9,6,2,1,'2026-03-10','2026-06-10',NULL,2,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(10,10,7,3,2,'2026-01-25','2026-05-25',NULL,9,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(11,11,7,2,3,'2026-02-20','2026-06-20',NULL,5,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(12,13,7,2,1,'2026-03-15','2026-06-15',NULL,1,'en_curso',NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16');
/*!40000 ALTER TABLE `asignaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calificaciones_psicologa`
--

DROP TABLE IF EXISTS `calificaciones_psicologa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `calificaciones_psicologa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `psicologa_id` int(11) NOT NULL,
  `supervisor_id` int(11) NOT NULL,
  `asignacion_id` int(11) DEFAULT NULL,
  `paciente_id` int(11) DEFAULT NULL,
  `categoria` varchar(50) NOT NULL,
  `calificacion` int(11) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `psicologa_id` (`psicologa_id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `asignacion_id` (`asignacion_id`),
  KEY `paciente_id` (`paciente_id`),
  CONSTRAINT `calificaciones_psicologa_ibfk_1` FOREIGN KEY (`psicologa_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_psicologa_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_psicologa_ibfk_3` FOREIGN KEY (`asignacion_id`) REFERENCES `asignaciones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `calificaciones_psicologa_ibfk_4` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calificaciones_psicologa`
--

LOCK TABLES `calificaciones_psicologa` WRITE;
/*!40000 ALTER TABLE `calificaciones_psicologa` DISABLE KEYS */;
/*!40000 ALTER TABLE `calificaciones_psicologa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cobros`
--

DROP TABLE IF EXISTS `cobros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cobros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paciente_id` int(11) DEFAULT NULL,
  `tipo` enum('sesion','taller','programa','venta_libros','gastos_talleres','otro') NOT NULL DEFAULT 'sesion',
  `concepto` varchar(255) DEFAULT NULL,
  `sesion_id` int(11) DEFAULT NULL,
  `taller_id` int(11) DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL DEFAULT 750.00,
  `metodo_pago` enum('efectivo','tarjeta_credito','tarjeta_debito','transferencia','otro') DEFAULT 'efectivo',
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `estado` enum('pagado','pendiente','cancelado') DEFAULT 'pagado',
  `observaciones` text DEFAULT NULL,
  `confirmado_psicologa` tinyint(1) DEFAULT 0,
  `confirmado_psicologa_id` int(11) DEFAULT NULL,
  `confirmado_psicologa_fecha` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `cobros_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `cobros_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cobros`
--

LOCK TABLES `cobros` WRITE;
/*!40000 ALTER TABLE `cobros` DISABLE KEYS */;
INSERT INTO `cobros` VALUES (1,11,'venta_libros','venta de libro ',NULL,NULL,750.00,'efectivo','2026-07-29',NULL,'pagado','as',0,NULL,NULL,4,'2026-07-29 16:02:18');
/*!40000 ALTER TABLE `cobros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `config_sat`
--

DROP TABLE IF EXISTS `config_sat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `config_sat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rfc` varchar(20) DEFAULT NULL,
  `razon_social` varchar(300) DEFAULT NULL,
  `regimen_fiscal` varchar(10) DEFAULT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `cer` text DEFAULT NULL,
  `key_enc` text DEFAULT NULL,
  `password_enc` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `finkok_username` varchar(100) DEFAULT NULL,
  `finkok_password_enc` text DEFAULT NULL,
  `serie_facturas` varchar(5) DEFAULT 'F',
  `logo` longtext DEFAULT NULL,
  `pac_produccion` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_config_sat_rfc` (`rfc`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `config_sat`
--

LOCK TABLES `config_sat` WRITE;
/*!40000 ALTER TABLE `config_sat` DISABLE KEYS */;
INSERT INTO `config_sat` VALUES (1,'TEST010101T23','TEST SA DE CV','601','64000','MIIC/DCCAeSgAwIBAgIKEAAAAAAAAAAAATANBgkqhkiG9w0BAQsFADA9MQswCQYDVQQGEwJNWDEWMBQGA1UEChMNVEVTVCBTQSBERSBDVjEWMBQGA1UEAxMNVEVTVDAxMDEwMVQyMzAeFw0yNjA4MDUyMzU0MDBaFw0yNzA4MDUyMzU0MDBaMD0xCzAJBgNVBAYTAk1YMRYwFAYDVQQKEw1URVNUIFNBIERFIENWMRYwFAYDVQQDEw1URVNUMDEwMTAxVDIzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuNz0LjzElYAHBBz9S+QE1FWlUTpcRjSlxp6kYVjH09wEvFA62NPYJvs6DUyr1L2stEEvkEyFvjch19U11T1m+89J/lqcrCzPaF/huvb09qxhrOQk/jeKnCUA62QdgdmBXsW6V6ZVls9Dec/x/tsQIh7S9e80Q/4dDZJk3mvnkgeuB9eF2+OkHESLdD1rHu1bztr+/ZxqBqtN5Rdr9TzLF90+nOnH8LXtjOUQbMd0Xl5JOwRJKi3H+iy0xvpViZafsLcLe1iYt/e8gttCNZBXxCT8jagFDVjgzwsToStBvM7HoU+OEcK41JXSiGBUQ2jY8QswV5RVkfuRdA71tRoztwIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQCU3GO3tql4zDRM3wt1zs47S3j4Uks+9leKPyBSOMxcXNZUENrDJczuCU2Hx0d2IXy6L4/PL9bvbnvUav0ar/wMj2Q4iB6V60Eay608CDsBaQaZwCnREUJTKh11jBqJB36uZcHWdcMLwtbu7IgHQ2+h2g5ZxA7ImqU7WM3MHNKTPsjgC9gFD7Sfw+7qP3zSmLGl3MVX+FR7y0w9emwhC+StDD2I8ZHW9G+VbN72K6qZgjRO2M7RCrFX4wXiHEm0YXF3KEV3MSCeXE5J8laGAMa7hMKPyROCwCTaF/jrVp0dp/Nqbr73XntZmA9C4BR/PwSpGLXI9j884weVVMtG+ZNj','gg7v/Og2pa0kpJS1PEP0N+f60+tInvkaRSOR8sXWKyTjNxANWBogh0V7PliUF8+RoR+Qr1Sy8SQknIOdrDlpJQ3wSntb2P2ckKLcVCiy9odHT+jcS0LQRPp1Utx3n3h0e5jkcEDxIJ+nEVgiaKD4cWEK7PYb7XK3IzjZCieyqkFR8pUKACaz8AjpmQrnUOmD975xLw3nnGKYYAeA5BK9VA3bkm4h5NSRnfNlCjY/+geYtdtGqwVI5QQFqCdJErWlNh8zsc3M9fiNqxBFOSlLR+P+e3R7owefY8XqCu1arITwAfyVwu5/vKJL2SQzNirCoNprOe8PEMit7XDTKiQwXfhGGYg2FI4SWUgpsrZ8InaWweMo/do8AHjLLSrZm8NnkIErBSiSWn9RDJ3yDZArjd312AiP92ADtoFCLa0jgtFOqTMvDlyIw+cFGS5ppuc15cwnEGs7tvXIZuu9SB6lrdB72deaIX9EEPC8jW4F0I+L067wN57oiQQZcO4rIwcFHwwZ0Yl20cZUCeqENpUNEAHg2fPS28blyTRSGnc6bRtBef+v/rdg1kXbZWMHzp4UAsKV6B2Oxl13y+mvZzVppuGyJbidy+BH5J37cYxdFR4iTLrBrGd3ooy5bZCh0AnvsQ8z+QSrqZn3LAgxYpNLhMh46F3TbpbXl9uL8vcA3yggu1RqQOp8YOCS2Cnk12oN5EM7I45QWyHm0/hQx2R0volla3T7paL+ryPSEu6eOWnxRTXdROASkyeo+F/pLjbtbn8s1CQDJCI8K1QKsgJUFrBWnIhq9rNUBTmV730MOHriuKzvQ14fzLnmziW5zBDc15Qh84h1rL5CrOyOeFNMfu+X2dYvF/nOH6jh6Gfg4SWFpWc5mWnwf9sf4Zz5GZh6QM5nV1k2ITSH9xxOpkFSS+/KJtc3x73nH/V/pqX6QzpVl+/G0h60w0Ah/29JefCU53RH8dB9ZY1ma2Soq+MlWGVK3FJnV3IoEBolC8b/jHJgv3nzXlmGUhEHdsPRwjpo0DKSnAN7obZlDIqEKYVBffRcwZ6rLF/+nuMG3eRQwyAsdILwKfx0uwR0wk3t5XOyHIEFK1ZlgI+PTC4YxsBDoE8KdtCKyCt6Ok7rFxnfUa/4v+g8y9tBJn7Va7Gpexg3oXLnza2KgmIsNOqkdgDjXCmmGhZeDxCL+I1tGO7c30fy1zFytpj8gLsp1C4n0wV4qTFiXgw+OnFzIxlhJ/44woPmFE3HiLdfAf9/qlELXurmU5ui9L29UQzII7/hWemXtOoaT3OM/m5iypSV7K8x7Jm80Az25zfPka0a7b4jXEVRnS5fg+Ef0BLhsnr73P3JpXfsUIw66r2tAlSgnWNG1aogMvdz8FOtbpNzi8CTEYvXl2j2DzHNrriYk3GANwP6O2UH6R+u66cgc8wOXIFcZudoc7GjzO8LvMorTIGRLXXgwZR0r6XVYShK5sqiHHClSMWLmGq032Zwu0xcKcqC495Dy79Y25cXW2JluS3I5HwDVzQBHP6ISQO2YzDn7OqW7wKiaVWZttHJyYORel3PEXPsjIBh97LuGY1AVaY2SXadwUBvjWA5G+Qu+7HP4nl76e003R6v1AyGKgErwwZUrPwnkWZWjUpTzZP3X0lJ8dVUCzYa8Gg2W/XokmrxXHN5IvPT/uaRwUg1u5eXSyW/HIFYVNA3swSA4/ubUeyd6IbeRGhcfXuCsE3N5O6WtxWKaDJc3frrhgwJBk9pYs8RLfIYDJnPMFak9OcJnppVxSllnUaPB4hhHyYAQyV5XitdUcveywOJOQd0e4QPuF7S84cj9Kt5/yiGWXWPaxlZAo1rZXtugYQgwZbedNMZjBrznoIF0RXycjZtuvnbFY1CW8AShCFBzIOgIYsgUaKG0LbfADRK2d+31uurF+9whb8ATfIcVaMturMkE3lGy1dtwlrmseRpX++MQyf8EA21af2xXjrCZHUbDhwHC9JLgkjTrhP8sWYcW0IjBhdDbjplxQYMprcDWRur3AJn01cmr4v53gBVfnF5JlpAanH3g1hr1UNkI+hqqtnN36HfaEE87kwuYxZjE2fLF3Sn93ZomwjHtRprWp/TshlJol8wHsbz9l5KmydcF+RHA5gparZEfMe/1R66oSXJQozHXtbEEEIYeZuTLfsGfgEYOiraCrVvDlIK8V9JLcnXYSh4d6D+fXlNMnTUAEC9So6VG3u0kWfF+V4y5NlA2uPrZzMVwKZcvokmbBYYlG41SPwv+yLgyWBn2lA4klCIbBO/n00TGXgQe7NQk1wOaWuYCFPwivkCn57kmclY7uK5t+dHhAjp5qerRfgsxrKuwhzALO9zHZ/8lSn1d90eEAajA0tlVoaPF/NczYF2paYbgeTfC0OvZQ9IXeJvVotLw/yuF6yIRdAH9Wgc2S/4DE99aqMOaNpZoXjglOqxz4Y5nxnZjwfZ3qTjNdwoS6xuVZZC9Eob','HdEnyhQ32yd8ttj24Jgag2Ltj9Zzid2NjJKOOtORj2zEoRnwNw==',NULL,'2026-08-06 00:20:43','pruebas@finkok.com','S9vCI2Sh4mzhWX0a5kNA1g0j6+I7ltArI+9ighEq/K5B6bPa7A==','F',NULL,0);
/*!40000 ALTER TABLE `config_sat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_cambios`
--

DROP TABLE IF EXISTS `historial_cambios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_cambios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tabla_afectada` varchar(50) NOT NULL,
  `registro_id` int(11) NOT NULL,
  `accion` enum('crear','editar','eliminar','reasignar') NOT NULL,
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `usuario_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `historial_cambios_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_cambios`
--

LOCK TABLES `historial_cambios` WRITE;
/*!40000 ALTER TABLE `historial_cambios` DISABLE KEYS */;
INSERT INTO `historial_cambios` VALUES (1,'asignaciones',4,'editar','{\"estado\": \"en_curso\"}','{\"estado\": \"desviado\"}',5,'2026-07-29 16:01:16'),(2,'sesiones',11,'editar','{\"fecha_programada\": \"2026-02-07\"}','{\"fecha_programada\": \"2026-02-14\", \"estado\": \"reprogramada\"}',5,'2026-07-29 16:01:16'),(3,'alertas_desviacion',2,'editar','{\"resuelta\": false}','{\"resuelta\": true, \"notas_resolucion\": \"Acordado: activaci??n graduada m??s lenta\"}',2,'2026-07-29 16:01:16');
/*!40000 ALTER TABLE `historial_cambios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `libros`
--

DROP TABLE IF EXISTS `libros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `libros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) DEFAULT 0,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `libros`
--

LOCK TABLES `libros` WRITE;
/*!40000 ALTER TABLE `libros` DISABLE KEYS */;
INSERT INTO `libros` VALUES (1,'Manual de Terapia Cognitivo-Conductual','Dr. Juan Pérez',350.00,10,'Guía completa de TCC para profesionales',1,'2026-07-29 16:04:23'),(2,'Cuaderno de Trabajo para la Ansiedad','Lic. María García',180.00,15,'Ejercicios prácticos para pacientes con ansiedad',1,'2026-07-29 16:04:23'),(3,'Mindfulness para la Vida Diaria','Dra. Laura Martínez',250.00,8,'Técnicas de mindfulness aplicadas',1,'2026-07-29 16:04:23'),(4,'Diario de Emociones','Equipo CVL',120.00,20,'Cuaderno para registro de emociones diarias',1,'2026-07-29 16:04:23'),(5,'Guía de Autoayuda para la Depresión','Dr. Roberto Sánchez',200.00,12,'Estrategias basadas en activación conductual',1,'2026-07-29 16:04:23');
/*!40000 ALTER TABLE `libros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metas_programa`
--

DROP TABLE IF EXISTS `metas_programa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `metas_programa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `programa_id` int(11) NOT NULL,
  `sesion_numero` int(11) NOT NULL,
  `titulo` varchar(300) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` enum('evaluacion','intervencion','seguimiento','cierre') NOT NULL,
  `orden` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_programa_sesion` (`programa_id`,`sesion_numero`),
  CONSTRAINT `metas_programa_ibfk_1` FOREIGN KEY (`programa_id`) REFERENCES `programas_terapeuticos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metas_programa`
--

LOCK TABLES `metas_programa` WRITE;
/*!40000 ALTER TABLE `metas_programa` DISABLE KEYS */;
INSERT INTO `metas_programa` VALUES (1,1,1,'Evaluaci??n inicial y rapport','Historia cl??nica completa, escala de ansiedad (GAD-7), establecer alianza terap??utica','evaluacion',1,'2026-07-29 16:01:16'),(2,1,2,'Psicoeducaci??n sobre ansiedad','Explicar modelo de ansiedad, ciclo de ansiedad, normalizar experiencia','intervencion',2,'2026-07-29 16:01:16'),(3,1,3,'T??cnicas de relajaci??n I','Respiraci??n diafragm??tica, relajaci??n muscular progresiva de Jacobson','intervencion',3,'2026-07-29 16:01:16'),(4,1,4,'T??cnicas de relajaci??n II','Consolidaci??n de relajaci??n, mindfulness b??sico, pr??ctica en sesi??n','intervencion',4,'2026-07-29 16:01:16'),(5,1,5,'Reestructuraci??n cognitiva I','Identificaci??n de pensamientos autom??ticos, distorsiones cognitivas comunes','intervencion',5,'2026-07-29 16:01:16'),(6,1,6,'Reestructuraci??n cognitiva II','Cuestionamiento socr??tico, creaci??n de pensamientos alternativos balanceados','intervencion',6,'2026-07-29 16:01:16'),(7,1,7,'Exposici??n gradual I','Dise??o de jerarqu??a de exposici??n, primera exposici??n con jerarqu??a baja','intervencion',7,'2026-07-29 16:01:16'),(8,1,8,'Exposici??n gradual II','Progresi??n en jerarqu??a, manejo de ansiedad anticipatoria','intervencion',8,'2026-07-29 16:01:16'),(9,1,9,'Exposici??n gradual III','Exposici??n a situaciones de jerarqu??a alta, consolidaci??n','intervencion',9,'2026-07-29 16:01:16'),(10,1,10,'Prevenci??n de reca??das I','Identificaci??n de factores de riesgo, plan de acci??n temprana','seguimiento',10,'2026-07-29 16:01:16'),(11,1,11,'Prevenci??n de reca??das II','Ensayo conductual de situaciones de riesgo, refuerzo de habilidades','seguimiento',11,'2026-07-29 16:01:16'),(12,1,12,'Consolidaci??n de habilidades','Repaso de todas las t??cnicas, aplicar a situaciones reales del paciente','seguimiento',12,'2026-07-29 16:01:16'),(13,1,13,'Evaluaci??n de progreso','Aplicar GAD-7 final, comparar con l??nea base, discutir avances','seguimiento',13,'2026-07-29 16:01:16'),(14,1,14,'Cierre y plan de mantenimiento','Plan de auto-cuidado, se??ales de alarma, criteria de reconsulta','cierre',14,'2026-07-29 16:01:16'),(15,2,1,'Evaluaci??n inicial PHQ-9','Aplicar PHQ-9, historia de depresi??n, evaluar ideaci??n suicida, rapport','evaluacion',1,'2026-07-29 16:01:16'),(16,2,2,'Psicoeducaci??n depresiva','Modelo cognitivo de depresi??n, ciclo depresivo, mitos y realidades','intervencion',2,'2026-07-29 16:01:16'),(17,2,3,'Activaci??n conductual I','Monitoreo de actividad, agenda de placer y maestr??a, activaci??n gradual','intervencion',3,'2026-07-29 16:01:16'),(18,2,4,'Activaci??n conductual II','Meta de actividad, romper patrones de evitaci??n, ritmo actividad-descanso','intervencion',4,'2026-07-29 16:01:16'),(19,2,5,'Rutina de autocuidado','Higiene de sue??o, alimentaci??n, ejercicio, estructura diaria','intervencion',5,'2026-07-29 16:01:16'),(20,2,6,'Pensamientos autom??ticos','Identificaci??n de pensamientos depresivos, registro de pensamientos','intervencion',6,'2026-07-29 16:01:16'),(21,2,7,'Reestructuraci??n cognitiva','Distorsiones cognitivas en depresi??n, pensamiento alternativo','intervencion',7,'2026-07-29 16:01:16'),(22,2,8,'Creencias centrales','Identificar creencias nucleares sobre uno mismo, el mundo, el futuro','intervencion',8,'2026-07-29 16:01:16'),(23,2,9,'Resoluci??n de problemas','T??cnica de resoluci??n de problemas, afrontamiento activo vs pasivo','intervencion',9,'2026-07-29 16:01:16'),(24,2,10,'Asertividad b??sica','Comunicaci??n asertiva, decir no, expresar necesidades','intervencion',10,'2026-07-29 16:01:16'),(25,2,11,'Relaciones sociales','Red de apoyo, aislamiento social, reconexi??n gradual','seguimiento',11,'2026-07-29 16:01:16'),(26,2,12,'Manejo del estr??s','T??cnicas de relajaci??n, mindfulness, autocuidado avanzado','seguimiento',12,'2026-07-29 16:01:16'),(27,2,13,'Prevenci??n de reca??das I','Factores de vulnerabilidad, plan de acci??n temprana','seguimiento',13,'2026-07-29 16:01:16'),(28,2,14,'Prevenci??n de reca??das II','Ensayo de afrontamiento, simular situaciones de riesgo','seguimiento',14,'2026-07-29 16:01:16'),(29,2,15,'Evaluaci??n PHQ-9 final','Comparar con l??nea base, discutir progreso, fortalezas identificadas','seguimiento',15,'2026-07-29 16:01:16'),(30,2,16,'Cierre y plan mantenci??n','Plan de bienestar, se??ales de alarma, recursos de apoyo','cierre',16,'2026-07-29 16:01:16'),(31,3,1,'Evaluaci??n y rapport TOC','Aplicar Y-BOCS, historia del TOC, identificar obsesiones y rituales','evaluacion',1,'2026-07-29 16:01:16'),(32,3,2,'Psicoeducaci??n TOC','Modelo obsesivo-compulsivo, ciclo del TOC, importancia de E/PR','intervencion',2,'2026-07-29 16:01:16'),(33,3,3,'Jerarquizaci??n de rituales','Crear lista de rituales, clasificar por intensidad, establecer jerarqu??a','intervencion',3,'2026-07-29 16:01:16'),(34,3,4,'Exposici??n I - Nivel bajo','Primera exposici??n con prevenci??n de respuesta, nivel bajo de la jerarqu??a','intervencion',4,'2026-07-29 16:01:16'),(35,3,5,'Exposici??n II - Nivel bajo-medio','Consolidar exposici??n, manejar ansiedad, registrar SUDS','intervencion',5,'2026-07-29 16:01:16'),(36,3,6,'Exposici??n III - Nivel medio','Progresi??n en jerarqu??a, tolerancia a la incertidumbre','intervencion',6,'2026-07-29 16:01:16'),(37,3,7,'Exposici??n IV - Nivel medio-alto','Exposici??n a pensamientos obsesivos m??s desafiantes','intervencion',7,'2026-07-29 16:01:16'),(38,3,8,'Exposici??n V - Nivel alto','Situaciones de mayor ansiedad, consolidar t??cnicas','intervencion',8,'2026-07-29 16:01:16'),(39,3,9,'Exposici??n VI - Nivel m??ximo','Nivel m??s alto de la jerarqu??a, manejo de crisis','intervencion',9,'2026-07-29 16:01:16'),(40,3,10,'Reestructuraci??n de creencias','Creencias disfuncionales sobre responsabilidad, sobreestimaci??n de amenaza','intervencion',10,'2026-07-29 16:01:16'),(41,3,11,'Tolerancia a la incertidumbre','Ejercicios de tolerancia, manejo de dudas y certeza','intervencion',11,'2026-07-29 16:01:16'),(42,3,12,'Mindfulness para TOC','Defusi??n cognitiva, observar pensamientos sin reaccionar','seguimiento',12,'2026-07-29 16:01:16'),(43,3,13,'Prevenci??n de reca??das TOC','Identificar gatillos, plan de acci??n temprana, mantenimiento E/PR','seguimiento',13,'2026-07-29 16:01:16'),(44,3,14,'Consolidaci??n y pr??ctica','Aplicar en situaciones cotidianas, refuerzo de logros','seguimiento',14,'2026-07-29 16:01:16'),(45,3,15,'Evaluaci??n Y-BOCS final','Comparar con l??nea base, evaluar mejor??a cl??nica significativa','seguimiento',15,'2026-07-29 16:01:16'),(46,3,16,'Cierre y mantenimiento','Plan de exposici??n aut??noma, recursos, criteria de reconsulta','cierre',16,'2026-07-29 16:01:16'),(47,4,1,'Evaluaci??n del duelo','Historia de la p??rdida, inventario de duelo, evaluar duelo complicado','evaluacion',1,'2026-07-29 16:01:16'),(48,4,2,'Psicoeducaci??n sobre duelo','Fases del duelo, normalizar reacciones, mitos del duelo','intervencion',2,'2026-07-29 16:01:16'),(49,4,3,'Procesamiento de la p??rdida','Narrativa de la relaci??n, significado de la persona fallecida','intervencion',3,'2026-07-29 16:01:16'),(50,4,4,'Expresi??n emocional','Permitir y facilitar la expresi??n de emociones (tristeza, rabia, culpa)','intervencion',4,'2026-07-29 16:01:16'),(51,4,5,'Manejo de la culpa','Diferenciar culpa racional e irracional, auto-perd??n','intervencion',5,'2026-07-29 16:01:16'),(52,4,6,'Cambios en la identidad','Re-definici??n del rol, nuevas identidades, adaptaci??n','intervencion',6,'2026-07-29 16:01:16'),(53,4,7,'Red de apoyo social','Identificar apoyo disponible, fortalecer conexiones','intervencion',7,'2026-07-29 16:01:16'),(54,4,8,'Rituales y conmemoraci??n','Rituales saludables, fechas significativas, memoria constructiva','seguimiento',8,'2026-07-29 16:01:16'),(55,4,9,'Reconstrucci??n del significado','Buscar sentido, crecimiento post-traum??tico, nuevas metas','seguimiento',9,'2026-07-29 16:01:16'),(56,4,10,'Integraci??n de la p??rdida','Incorporar la p??rdida en la vida, relaci??n continua saludable','seguimiento',10,'2026-07-29 16:01:16'),(57,4,11,'Plan de futuro','Nuevos proyectos, reconexi??n con la vida, esperanza','seguimiento',11,'2026-07-29 16:01:16'),(58,4,12,'Cierre y seguimiento','Evaluaci??n final, plan de autocuidado, recursos de apoyo','cierre',12,'2026-07-29 16:01:16');
/*!40000 ALTER TABLE `metas_programa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas_paciente`
--

DROP TABLE IF EXISTS `notas_paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notas_paciente` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paciente_id` int(11) NOT NULL,
  `asignacion_id` int(11) DEFAULT NULL,
  `autor_id` int(11) NOT NULL,
  `autor_rol` varchar(50) DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `contenido` text NOT NULL,
  `calificacion` int(11) DEFAULT NULL,
  `paso_tratamiento` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `asignacion_id` (`asignacion_id`),
  KEY `autor_id` (`autor_id`),
  CONSTRAINT `notas_paciente_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notas_paciente_ibfk_2` FOREIGN KEY (`asignacion_id`) REFERENCES `asignaciones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notas_paciente_ibfk_3` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas_paciente`
--

LOCK TABLES `notas_paciente` WRITE;
/*!40000 ALTER TABLE `notas_paciente` DISABLE KEYS */;
/*!40000 ALTER TABLE `notas_paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `observaciones_supervision`
--

DROP TABLE IF EXISTS `observaciones_supervision`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `observaciones_supervision` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sesion_id` int(11) NOT NULL,
  `supervisor_id` int(11) NOT NULL,
  `observacion` text NOT NULL,
  `tipo` enum('general','tecnica','correccion','apoyo') DEFAULT 'general',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sesion_id` (`sesion_id`),
  KEY `supervisor_id` (`supervisor_id`),
  CONSTRAINT `observaciones_supervision_ibfk_1` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `observaciones_supervision_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `observaciones_supervision`
--

LOCK TABLES `observaciones_supervision` WRITE;
/*!40000 ALTER TABLE `observaciones_supervision` DISABLE KEYS */;
INSERT INTO `observaciones_supervision` VALUES (1,4,2,'Buen manejo del rapport. Para la sesi??n de relajaci??n, considerar alternativas: yoga suave, visualizaci??n guiada, o t??cnicas de aterrizaje. No insistir en relajaci??n muscular si no le funciona.','tecnica','2026-07-29 16:01:16'),(2,9,2,'La resistencia de Carlos es esperable en hombres con depresi??n. Considerar enfoque m??s brief y orientado a acci??n. Involucrar a la esposa puede ser un recurso. Agenda para revisar caso en supervisi??n.','tecnica','2026-07-29 16:01:16'),(3,11,2,'El retraso puede indicar falta de compromiso o factores externos. Explorar con paciente el significado del abandono de tareas. No asumir resistencia.','general','2026-07-29 16:01:16'),(4,16,3,'Excelente progreso de Sof??a. El duelo se est?? procesando de forma saludable. La sesi??n de culpa fue particularmente productiva.','apoyo','2026-07-29 16:01:16');
/*!40000 ALTER TABLE `observaciones_supervision` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pacientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `fecha_nac` date DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `motivo_consulta` text DEFAULT NULL,
  `diagnostico_inicial` text DEFAULT NULL,
  `observaciones_generales` text DEFAULT NULL,
  `estado` enum('activo','pausado','finalizado','derivado') DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pacientes_estado` (`estado`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (1,'Laura','Fernández','1990-05-15','555-1001','laura.f@email.com',NULL,'Ansiedad generalizada y ataques de pánico','Trastorno de Ansiedad Generalizada (F41.1)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(2,'Carlos','Mendoza','1985-08-22','555-1002','carlos.m@email.com',NULL,'Depresión post-parto','Episodio Depresivo Mayor (F32.1)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(3,'Sofía','Gutiérrez','1992-11-03','555-1003',NULL,NULL,'Duelo por pérdida familiar','Reacción ante duelo patológico (F43.2)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(4,'Miguel','Torres','1988-02-14','555-1004','miguel.t@email.com',NULL,'Fobias sociales y evitación','Fobia Social (F40.1)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(5,'Isabella','Ramírez','1995-07-30','555-1005',NULL,NULL,'Trastorno obsesivo-compulsivo','TOC (F42)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(6,'Andrés','Castillo','1982-12-18','555-1006','andres.c@email.com',NULL,'Burnout laboral y estrés crónico','Burnout (Z73.0)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(7,'Valentina','Reyes','1993-04-25','555-1007',NULL,NULL,'Problemas de autoestima y asertividad','Trastorno de personalidad dependiente (F60.7)',NULL,'activo','2026-07-29 16:01:16','2026-07-29 16:01:16'),(8,'Roberto','Vargas','1979-09-10','555-1008','roberto.v@email.com',NULL,'Adicción a sustancias','Trastorno por uso de sustancias (F10.20)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(9,'Luciana','Medina','1991-01-28','555-1009',NULL,NULL,'Insomnio y dificultades de sueño','Insomnio primario (F51.0)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(10,'Gabriel','Flores','1987-06-12','555-1010','gabriel.f@email.com',NULL,'Trauma postraumático','TEPT (F43.10)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(11,'Daniela','Aguilar','1994-03-08','555-1011',NULL,NULL,'Trastorno alimenticio','Anorexia nerviosa (F50.01)',NULL,'activo','2026-07-29 16:01:16','2026-07-29 16:01:16'),(12,'Martín','Herrera','1986-10-20','555-1012','martin.h@email.com',NULL,'Dificultades en relaciones de pareja','Problemas de relación conyugal (Z63.0)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(13,'Natalia','Cruz','1990-08-05','555-1013',NULL,NULL,'Crisis de ansiedad recurrente','Trastorno de pánico (F41.0)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(14,'Felipe','Ortega','1983-04-17','555-1014','felipe.o@email.com',NULL,'Depresión crónica','Distimia (F34.1)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(15,'Camila','Santos','1996-12-01','555-1015',NULL,NULL,'Problemas de conducta en adolescentes','Trastorno desafiador (F91.3)',NULL,'activo','2026-07-29 16:01:16','2026-07-29 16:01:16'),(16,'Alejandro','Peña','1989-07-22','555-1016','alejandro.p@email.com',NULL,'Estrés post-traumático laboral','TEPT (F43.10)',NULL,'pausado','2026-07-29 16:01:16','2026-08-11 17:15:36'),(17,'Patricia','Luna','1984-11-14','555-1017',NULL,NULL,'Trastorno bipolar','Trastorno Bipolar I (F31.1)',NULL,'activo','2026-07-29 16:01:16','2026-07-29 16:01:16'),(18,'Sebastián','Cortés','1997-02-28','555-1018','sebas.c@email.com',NULL,'Ansiedad por separación','Trastorno de ansiedad por separación (F93.0)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(19,'Mariana','Delgado','1991-05-09','555-1019',NULL,NULL,'Depresión y baja motivación','Episodio Depresivo Mayor recurrente (F33.1)',NULL,'activo','2026-07-29 16:01:16','2026-08-11 17:15:36'),(20,'Ricardo','Soto','1980-09-30','555-1020','ricardo.s@email.com',NULL,'Duelo no resuelto','Reacción ante duelo (F43.2)',NULL,'finalizado','2026-07-29 16:01:16','2026-08-11 17:15:36');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `programas_terapeuticos`
--

DROP TABLE IF EXISTS `programas_terapeuticos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `programas_terapeuticos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `total_sesiones` int(11) NOT NULL CHECK (`total_sesiones` between 12 and 16),
  `created_by` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `programas_terapeuticos_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `programas_terapeuticos`
--

LOCK TABLES `programas_terapeuticos` WRITE;
/*!40000 ALTER TABLE `programas_terapeuticos` DISABLE KEYS */;
INSERT INTO `programas_terapeuticos` VALUES (1,'Programa Ansiedad Generalizada','Tratamiento integral para TAG con t??cnicas cognitivo-conductuales, relajaci??n y exposici??n gradual',14,1,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(2,'Programa Depresi??n','Programa de activaci??n conductual, reestructuraci??n cognitiva y prevenci??n de reca??das para episodios depresivos',16,1,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(3,'Programa TOC','Exposici??n y prevenci??n de respuesta (E/PR), psicoeducaci??n y gesti??n de rituales',16,1,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(4,'Programa Duelo','Fases del duelo, procesamiento emocional, reconstrucci??n del significado y adaptaci??n',12,1,1,'2026-07-29 16:01:16','2026-07-29 16:01:16');
/*!40000 ALTER TABLE `programas_terapeuticos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reglas_clinica`
--

DROP TABLE IF EXISTS `reglas_clinica`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reglas_clinica` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `seccion` varchar(50) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `actualizado_por` int(11) DEFAULT NULL,
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `actualizado_por` (`actualizado_por`),
  CONSTRAINT `reglas_clinica_ibfk_1` FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reglas_clinica`
--

LOCK TABLES `reglas_clinica` WRITE;
/*!40000 ALTER TABLE `reglas_clinica` DISABLE KEYS */;
INSERT INTO `reglas_clinica` VALUES (1,'financieras','Reglas Financieras','[\"Costo por sesi??n: $750 MXN (tarifa ??nica para todos los pacientes)\",\"Distribuci??n del pago: 50% Psic??loga / 25% Propietario / 25% Supervisora\",\"Gastos fijos mensuales: $180,000 MXN (renta, servicios, n??mina administrativa)\",\"Meta de ocupaci??n: 100% ??? 1,100 sesiones/mes (275/semana)\",\"Facturaci??n: Todos los gastos de caja chica y entregas de dinero requieren factura/comprobante\",\"Firma digital: Requerida para autorizar gastos y entregas de dinero (password)\",\"Autorizaci??n: Solo supervisora/l??der puede autorizar gastos y entregas\"]',NULL,'2026-07-29 16:01:12','2026-07-29 16:01:12'),(2,'sesiones','Reglas de Sesiones y Programas','[\"Duraci??n del programa: 12 a 16 sesiones por programa terap??utico\",\"Confirmaci??n doble: La psic??loga confirma la sesi??n ??? se crea cobro autom??tico en recepci??n con estado confirmado por psic??loga\",\"Detecci??n de desviaciones: El sistema detecta retrasos, saltos de meta, repeticiones y sesiones fuera de programa\",\"Recordatorio autom??tico: Se env??a correo 24h antes de cada sesi??n con fecha y recordatorio de pago ($750 MXN)\",\"Corte de caja: Diario al cerrar recepci??n\",\"Entregas de dinero: Solicitante y receptor no pueden ser la misma persona\"]',NULL,'2026-07-29 16:01:12','2026-07-29 16:01:12'),(3,'accesos','Reglas de Acceso y Roles','[\"Psic??loga: Solo ve SUS pacientes asignados. No accede a Dashboard, Recepci??n, Mercadeo, Talleres ni Admin\",\"Supervisora/L??der: Acceso total. Ve todos los pacientes, puede agregar comentarios visibles para la psic??loga\",\"Recepcionista: Solo accede a Recepci??n (cobros, entregas, caja chica, citas)\",\"Mercadeo y Talleres: Solo accesibles por supervisora/l??der\",\"Biometr??a: Login por huella digital (WebAuthn) disponible para acceso r??pido\",\"Contrase??a por psic??loga: Cada psic??loga tiene su propio login para acceder a su panel\"]',NULL,'2026-07-29 16:01:12','2026-07-29 16:01:12'),(4,'evaluacion','Reglas de Evaluaci??n','[\"Cuestionario inicial: 123 preguntas en 13 secciones ??? aplica a TODOS los pacientes nuevos\",\"Trastornos alimenticios: Incluye screening psicol??gico de trastornos de la conducta alimentaria\",\"Dictado por voz: Disponible en todas las notas cl??nicas (Web Speech API, es-MX)\",\"Fotograf??a: Se captura foto del paciente al registrar (c??mara integrada)\",\"Archivos permitidos: PDF, DOC, DOCX, JPG, JPEG, PNG para evaluaciones y facturas\"]',NULL,'2026-07-29 16:01:12','2026-07-29 16:01:12'),(5,'asignacion','Asignaci??n y Tratamiento','[\"Una psic??loga por paciente: Cada paciente es asignado a UNA psic??loga por programa activo\",\"M??ltiples tratamientos: Un paciente puede tener varios programas asignados (ansiedad + pareja, etc.)\",\"Progreso: Se mide por sesiones completadas / total del programa (barra de progreso visible)\",\"Estados: Activo, inactivo, completado. Solo pacientes activos ven en panel de psic??loga\"]',NULL,'2026-07-29 16:01:12','2026-07-29 16:01:12'),(6,'derechos','Derechos del Paciente','[\"Confidencialidad: La informaci??n cl??nica solo es accesible para su psic??loga, supervisora y recepcionista (cobros)\",\"Historial cl??nico: El paciente tiene acceso a ver su historial completo de sesiones y notas\",\"Reprogramaci??n: Puede reprogramar sesiones con anticipaci??n razonable\",\"Recordatorios: Recibe correo de recordatorio 24h antes de cada sesi??n con costo\",\"Evaluaci??n inicial: Se realiza cuestionario completo al iniciar tratamiento (123 preguntas)\"]',NULL,'2026-07-29 16:01:12','2026-07-29 16:01:12'),(7,'obligaciones','Obligaciones del Paciente','[\"Pago puntual: $750 MXN por sesi??n, debe pagarse antes o el d??a de la sesi??n\",\"Asistencia: Cancelar con al menos 24h de anticipaci??n. No presentarse sin aviso afecta el tratamiento\",\"Compromiso: Completar el programa completo (12-16 sesiones) para mejores resultados\",\"Veracidad: Proporcionar informaci??n veraz en el cuestionario inicial y durante el tratamiento\"]',NULL,'2026-07-29 16:01:12','2026-07-29 16:01:12'),(8,'flujo','Flujo del Paciente','[\"1. Registro: Recepcionista registra datos personales, motivo de consulta y captura foto\",\"2. Cuestionario: Paciente completa 123 preguntas de evaluaci??n inicial\",\"3. Asignaci??n: Supervisora asigna psic??loga, programa y supervisor\",\"4. Tratamiento: 12-16 sesiones con seguimiento, notas y confirmaci??n doble\",\"5. Seguimiento: Supervisora monitorea progreso, agrega comentarios y detecta desviaciones\",\"6. Alta: Programa completado. Paciente pasa a historial\"]',NULL,'2026-07-29 16:01:12','2026-07-29 16:01:12');
/*!40000 ALTER TABLE `reglas_clinica` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesiones`
--

DROP TABLE IF EXISTS `sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sesiones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `asignacion_id` int(11) NOT NULL,
  `numero_sesion` int(11) NOT NULL,
  `fecha_programada` date NOT NULL,
  `fecha_real` date DEFAULT NULL,
  `meta_id` int(11) DEFAULT NULL,
  `estado` enum('programada','completada','reprogramada','cancelada') DEFAULT 'programada',
  `duracion_minutos` int(11) DEFAULT NULL,
  `temas_trabajados` text DEFAULT NULL,
  `observaciones_psicologa` text DEFAULT NULL,
  `observaciones_supervisor` text DEFAULT NULL,
  `desviacion` tinyint(1) DEFAULT 0,
  `motivo_desviacion` text DEFAULT NULL,
  `tipo_desviacion` enum('retraso','salto_meta','repeticion','fuera_programa','ninguna') DEFAULT 'ninguna',
  `confirmada_psicologa` tinyint(1) DEFAULT 0,
  `confirmada_fecha` datetime DEFAULT NULL,
  `archivo_url` varchar(500) DEFAULT NULL,
  `archivo_nombre` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asignacion_sesion` (`asignacion_id`,`numero_sesion`),
  KEY `meta_id` (`meta_id`),
  KEY `idx_sesiones_estado` (`estado`),
  KEY `idx_sesiones_fecha` (`fecha_programada`),
  CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`asignacion_id`) REFERENCES `asignaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sesiones_ibfk_2` FOREIGN KEY (`meta_id`) REFERENCES `metas_programa` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesiones`
--

LOCK TABLES `sesiones` WRITE;
/*!40000 ALTER TABLE `sesiones` DISABLE KEYS */;
INSERT INTO `sesiones` VALUES (1,1,1,'2026-01-15','2026-01-15',1,'completada',50,'Historia cl??nica, GAD-7 = 16 (severo), rapport','Paciente colaboradora, buena alianza',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(2,1,2,'2026-01-22','2026-01-22',2,'completada',45,'Modelo de ansiedad, ciclo ansioso','Comprende bien el modelo, muestra inter??s',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(3,1,3,'2026-01-29','2026-02-05',3,'completada',50,'Respiraci??n diafragm??tica','Paciente enferma, reprogramada 1 semana',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(4,1,4,'2026-02-05','2026-02-05',4,'completada',55,'Relajaci??n muscular, mindfulness','No logr?? relajaci??n muscular, dificultad con body scan',NULL,1,'Paciente presenta dificultad significativa con relajaci??n muscular. Considerar repetir o adaptar t??cnica.','repeticion',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(5,1,5,'2026-02-12',NULL,5,'programada',NULL,'Reestructuraci??n cognitiva I',NULL,NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(6,4,1,'2026-01-10','2026-01-10',15,'completada',55,'Evaluaci??n PHQ-9 = 18 (moderado-severo), rapport','Paciente masculino con dificultad para expresar emociones',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(7,4,2,'2026-01-17','2026-01-17',16,'completada',50,'Psicoeducaci??n depresiva','Esposa presente en las ??ltimas 10 min, inter??s en participar',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(8,4,3,'2026-01-24','2026-01-24',17,'completada',45,'Activaci??n conductual','Paciente resistente a activaci??n, prefiere solo hablar',NULL,1,'Paciente evita tareas asignadas. Resistencia a la activaci??n conductual. Considerar intervenci??n sobre resistencia.','repeticion',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(9,4,4,'2026-01-31','2026-01-31',18,'completada',50,'Activaci??n conductual II','Mejor disposici??n, complet?? parcialmente la tarea',NULL,1,'Tarea completada solo al 40%. Necesita m??s tiempo en activaci??n conductual.','repeticion',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(10,4,5,'2026-02-07','2026-02-14',19,'completada',55,'Rutina de autocuidado','Paciente una semana atrasado, agenda saturada por trabajo',NULL,1,'Retraso de 1 semana. Agenda laboral complicada. Considerar reestructurar horario.','retraso',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(11,4,6,'2026-02-14','2026-02-14',20,'completada',45,'Pensamientos autom??ticos','Avanz?? r??pido en identificaci??n, buen insight',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(12,4,7,'2026-02-21',NULL,21,'programada',NULL,'Reestructuraci??n cognitiva',NULL,NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(13,7,1,'2026-01-05','2026-01-05',43,'completada',60,'Evaluaci??n, inventario de duelo, rapport profundo','Paciente con duelo por madre, 3 meses de p??rdida',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(14,7,2,'2026-01-12','2026-01-12',44,'completada',50,'Fases del duelo, normalizaci??n','Llor?? mucho, catharsis importante',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(15,7,3,'2026-01-19','2026-01-19',45,'completada',55,'Narrativa de relaci??n con madre','Recuerdos positivos, v??nculo fuerte',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(16,7,4,'2026-01-26','2026-01-26',46,'completada',50,'Expresi??n emocional, rabia','Descubri?? rabia hacia padre por ausencia',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(17,7,5,'2026-02-02','2026-02-02',47,'completada',45,'Manejo de culpa','Culpa por no estar en el momento del deceso',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(18,7,6,'2026-02-09','2026-02-09',48,'completada',50,'Cambio de rol, identidad','Se siente perdida sin su madre como referente',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(19,7,7,'2026-02-16','2026-02-16',49,'completada',50,'Red de apoyo, reconexi??n','Reconect?? con hermana, apoyo mutuo',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(20,7,8,'2026-02-23','2026-02-23',50,'completada',45,'Rituales, conmemoraci??n saludable','Cre?? ritual propio de visita al cementerio',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(21,7,9,'2026-03-02','2026-03-02',51,'completada',55,'Significado, crecimiento','Habla de \"herencia emocional\" de su madre',NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(22,7,10,'2026-03-09',NULL,52,'programada',NULL,'Integraci??n de la p??rdida',NULL,NULL,0,NULL,'ninguna',0,NULL,NULL,NULL,'2026-07-29 16:01:16','2026-07-29 16:01:16');
/*!40000 ALTER TABLE `sesiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_factura`
--

DROP TABLE IF EXISTS `solicitudes_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `solicitudes_factura` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paciente_id` int(11) DEFAULT NULL,
  `paciente_nombre` varchar(200) DEFAULT NULL,
  `solicitado_por` int(11) DEFAULT NULL,
  `concepto` varchar(500) NOT NULL,
  `cantidad` decimal(10,4) DEFAULT 1.0000,
  `unidad` varchar(50) DEFAULT 'SERVICIO',
  `clave_prod_serv` varchar(20) DEFAULT '85121706',
  `clave_unidad` varchar(10) DEFAULT 'E48',
  `subtotal` decimal(12,2) NOT NULL,
  `iva` decimal(12,2) DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL,
  `rfc_receptor` varchar(13) NOT NULL DEFAULT 'XAXX010101000',
  `razon_social_receptor` varchar(300) NOT NULL,
  `regimen_fiscal_receptor` varchar(10) DEFAULT '616',
  `uso_cfdi` varchar(3) DEFAULT 'S01',
  `forma_pago` varchar(2) DEFAULT '01',
  `metodo_pago` varchar(3) DEFAULT 'PUE',
  `estado` enum('pendiente','aprobada','rechazada','timbrada','error') DEFAULT 'pendiente',
  `comentario_supervisora` text DEFAULT NULL,
  `validada_por` int(11) DEFAULT NULL,
  `validada_en` datetime DEFAULT NULL,
  `uuid` varchar(64) DEFAULT NULL,
  `serie` varchar(10) DEFAULT NULL,
  `folio` int(11) DEFAULT NULL,
  `fecha_timbrado` datetime DEFAULT NULL,
  `xml_path` varchar(500) DEFAULT NULL,
  `pdf_path` varchar(500) DEFAULT NULL,
  `error_timbrado` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sol_factura_estado` (`estado`),
  KEY `idx_sol_factura_created` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_factura`
--

LOCK TABLES `solicitudes_factura` WRITE;
/*!40000 ALTER TABLE `solicitudes_factura` DISABLE KEYS */;
INSERT INTO `solicitudes_factura` VALUES (1,NULL,NULL,NULL,'Servicio de psicologia',1.0000,'SERVICIO','85121706','E48',1000.00,160.00,1160.00,'XAXX010101000','PUBLICO EN GENERAL','616','S01','01','PUE','error',NULL,1,'2026-08-05 18:12:53',NULL,'F',1,NULL,NULL,NULL,'Faltan credenciales de Finkok. Configúralas en Administración > Configuración SAT.','2026-08-06 00:09:38','2026-08-06 00:13:02'),(2,NULL,NULL,NULL,'Sesion prueba flujo completo',1.0000,'SESION','85121706','E48',1000.00,160.00,1160.00,'XAXX010101000','PUBLICO EN GENERAL','616','S01','01','PUE','error','Prueba flujo completo',1,'2026-08-05 18:21:21',NULL,'F',2,NULL,NULL,NULL,'Respuesta vacía de Finkok','2026-08-06 00:21:11','2026-08-06 00:21:29');
/*!40000 ALTER TABLE `solicitudes_factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `talleres`
--

DROP TABLE IF EXISTS `talleres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `talleres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tema` varchar(255) DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `lugar` varchar(255) DEFAULT NULL,
  `instructor` varchar(255) DEFAULT NULL,
  `capacidad` int(11) DEFAULT 0,
  `inscritos` int(11) DEFAULT 0,
  `estado` enum('activo','completado','cancelado') DEFAULT 'activo',
  `publico_objetivo` text DEFAULT NULL,
  `materiales` text DEFAULT NULL,
  `resultado` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `talleres_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `talleres`
--

LOCK TABLES `talleres` WRITE;
/*!40000 ALTER TABLE `talleres` DISABLE KEYS */;
INSERT INTO `talleres` VALUES (1,'Taller de PsicoNutrición','Taller de PsicoNutrición con 50% de descuento por el 22° Aniversario del Centro en CdMx. Precio: $499 MXN más IVA. Grupos limitados a 25 personas. Para mayor información enviar mensaje WA al 55-5418-0137.','PsicoNutrición','2026-08-03','10:00:00','14:00:00','Centro VivirLibre.org, Cerro del Cubilete #145, Col. Campestre Churubusco, Coyoacán CP 04200, Cd.Mx.',NULL,25,0,'activo','Público general interesado en la relación entre alimentación y salud emocional',NULL,NULL,NULL,'2026-08-11 16:43:06');
/*!40000 ALTER TABLE `talleres` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` enum('psicologa','lider','supervisor') NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuarios_rol` (`rol`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'carmen.ruiz@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Carmen','Ruiz','555-0100','lider',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(2,'roberto.martin@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Roberto','Mart??n','555-0101','supervisor',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(3,'elena.vargas@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Elena','Vargas','555-0102','supervisor',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(4,'ana.garcia@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Ana','Garc??a','555-0201','psicologa',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(5,'maria.lopez@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Mar??a','L??pez','555-0202','psicologa',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(6,'laura.perez@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Laura','P??rez','555-0203','psicologa',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(7,'jose.hernandez@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Jos??','Hern??ndez','555-0204','psicologa',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(8,'sofia.morales@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Sof??a','Morales','555-0205','psicologa',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(9,'diego.ramirez@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Diego','Ram??rez','555-0206','psicologa',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(10,'valeria.torres@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Valeria','Torres','555-0207','psicologa',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(11,'fernando.diaz@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Fernando','D??az','555-0208','psicologa',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(12,'camila.rios@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Camila','R??os','555-0209','psicologa',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16'),(13,'pablo.silva@clinica.com','$2b$10$QZu0CKM060Sk.iZP1hiVOex/wgPC1PbPt5i.u0lrwmSpjlufe67jy','Pablo','Silva','555-0210','psicologa',NULL,1,'2026-07-29 16:01:16','2026-07-29 16:01:16');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-11 11:16:11

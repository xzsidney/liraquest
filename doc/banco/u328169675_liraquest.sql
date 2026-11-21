-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 21/11/2026 às 22:50
-- Versão do servidor: 11.8.9-MariaDB-log
-- Versão do PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `u328169675_liraquest`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_members`
--

CREATE TABLE `family_members` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `pin` varchar(10) DEFAULT NULL,
  `role` enum('ADMIN','PARENT','CHILD') NOT NULL DEFAULT 'CHILD',
  `hero_nickname` varchar(100) NOT NULL,
  `class_code` varchar(50) NOT NULL DEFAULT 'guardiao_do_lar',
  `skin_code` varchar(50) NOT NULL DEFAULT 'default',
  `level` int(11) NOT NULL DEFAULT 1,
  `xp` int(11) NOT NULL DEFAULT 0,
  `adventure_energy` int(11) NOT NULL DEFAULT 10,
  `family_tokens` int(11) NOT NULL DEFAULT 0,
  `gold` int(11) NOT NULL DEFAULT 50,
  `streak_days` int(11) NOT NULL DEFAULT 1,
  `str` int(11) NOT NULL DEFAULT 10,
  `agi` int(11) NOT NULL DEFAULT 10,
  `con` int(11) NOT NULL DEFAULT 10,
  `int` int(11) NOT NULL DEFAULT 10,
  `cha` int(11) NOT NULL DEFAULT 10,
  `luk` int(11) NOT NULL DEFAULT 10,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_members`
--

INSERT INTO `family_members` (`id`, `family_id`, `name`, `email`, `password`, `pin`, `role`, `hero_nickname`, `class_code`, `skin_code`, `level`, `xp`, `adventure_energy`, `family_tokens`, `gold`, `streak_days`, `str`, `agi`, `con`, `int`, `cha`, `luk`, `is_active`, `created_at`, `updated_at`) VALUES
('75f85660-78b9-4088-b3f9-4a777c8b0b69', 'd58f49ed-d0f9-4e26-b9c5-6961225b36bd', 'Jennifer Lira', NULL, NULL, '1234', 'CHILD', 'Valquíria Jennifer', 'artifice_criativo', 'valquiria_jennifer', 1, 0, 10, 0, 50, 1, 10, 12, 10, 14, 10, 10, 1, '2026-11-21 20:20:28', '2026-11-21 20:20:28'),
('9b860b64-0b1f-4f6e-a7ff-bfef773e0f26', 'd58f49ed-d0f9-4e26-b9c5-6961225b36bd', 'Sidney Lira', 'sidney@liraquest.com', '$2b$10$PrwwrEsfzfOkTI8R1DSEiu40Hvd5FPJG6KYDp0r4l6Ld0LRIY4zyq', NULL, 'ADMIN', 'Paladino Sidney', 'guardiao_do_lar', 'paladino_lira', 1, 0, 10, 10, 100, 1, 14, 10, 12, 10, 12, 10, 1, '2026-11-21 20:20:28', '2026-11-21 20:20:28'),
('c2be01d8-1ce0-438e-813e-c571e94d9a72', 'eab6c7aa-0e87-4127-bf8f-e8137e7937c8', 'Sidney LII', 'xzsidney@yahoo.com.br', '$2b$10$PrwwrEsfzfOkTI8R1DSEiu40Hvd5FPJG6KYDp0r4l6Ld0LRIY4zyq', NULL, 'PARENT', 'Sidney LII', 'guardiao_do_lar', 'default', 1, 0, 10, 0, 50, 1, 10, 10, 10, 10, 10, 10, 1, '2026-11-21 21:26:58', '2026-11-21 21:26:58'),
('d3f9dd3e-3e7b-41d0-9c55-dde5997a1d6e', 'd58f49ed-d0f9-4e26-b9c5-6961225b36bd', 'Paulo Lira', NULL, NULL, '1234', 'CHILD', 'Sir Paulinho', 'rastreador_veloz', 'rastreador_paulo', 1, 0, 10, 0, 50, 1, 10, 14, 10, 10, 10, 12, 1, '2026-11-21 20:20:28', '2026-11-21 20:20:28'),
('f9d5ec1a-2312-4392-8bc0-ff31304d2523', 'd58f49ed-d0f9-4e26-b9c5-6961225b36bd', 'Elaine Lira', 'elaine@liraquest.com', '$2b$10$PrwwrEsfzfOkTI8R1DSEiu40Hvd5FPJG6KYDp0r4l6Ld0LRIY4zyq', NULL, 'PARENT', 'Mestra Elaine', 'guardiao_da_harmonia', 'mestra_harmonia', 1, 0, 10, 10, 100, 1, 10, 10, 12, 12, 14, 10, 1, '2026-11-21 20:20:28', '2026-11-21 20:20:28');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `family_members`
--
ALTER TABLE `family_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_family_member_email` (`email`),
  ADD KEY `family_id` (`family_id`);

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `family_members`
--
ALTER TABLE `family_members`
  ADD CONSTRAINT `family_members_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

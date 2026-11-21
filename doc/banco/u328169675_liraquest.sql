-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 21/11/2026 às 19:43
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
-- Estrutura para tabela `battles`
--

CREATE TABLE `battles` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `monster_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('IN_PROGRESS','VICTORY','DEFEAT') NOT NULL DEFAULT 'IN_PROGRESS',
  `battle_log` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`battle_log`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `characters`
--

CREATE TABLE `characters` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `gender` enum('MALE','FEMALE','OTHER') NOT NULL DEFAULT 'MALE',
  `avatar_type` enum('PHOTO','SPRITE') NOT NULL DEFAULT 'SPRITE',
  `avatar_value` varchar(255) NOT NULL DEFAULT 'default_hero',
  `current_class_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `gold` int(11) DEFAULT 0,
  `is_in_infirmary` tinyint(1) DEFAULT 0,
  `infirmary_until` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `characters`
--

INSERT INTO `characters` (`id`, `user_id`, `name`, `gender`, `avatar_type`, `avatar_value`, `current_class_id`, `gold`, `is_in_infirmary`, `infirmary_until`, `created_at`, `updated_at`) VALUES
('5f45cbc5-6df6-4721-bfac-7c49d1a745f0', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Testes', 'MALE', 'SPRITE', 'hero_warrior', '3036c7eb-83bf-4dbf-bf75-0d851c084efd', 458, 0, NULL, '2026-08-31 12:22:12', '2026-09-03 14:41:18'),
('6752320c-afcb-4a94-ab5c-a43f965edb0f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', 'Sid', 'MALE', 'SPRITE', 'hero_warrior', '6cacfc3a-d5fa-4860-bc50-c2c2bcf91359', 154, 0, NULL, '2026-08-31 21:05:21', '2026-11-17 01:23:02'),
('6ebe38a6-a5d6-478b-90b4-ce2446466a2c', '74ced466-eded-45b3-8fe5-db993e71bb4f', 'Miyuki', 'FEMALE', 'SPRITE', 'hero_mage', '34b41dbe-c51b-441a-8aa5-49512d8c814d', 186, 0, NULL, '2026-09-05 01:36:14', '2026-09-05 01:43:30'),
('7a46af9e-3296-4823-9597-d6eb7cdcd761', 'c6e55de6-969f-4572-b97c-e93b872afdcf', 'Mestra Elaine', 'FEMALE', 'SPRITE', 'guardia_harmonia', 'b5ae65dc-800e-46f3-b28d-af9d7f334162', 50, 0, NULL, '2026-11-21 19:40:41', '2026-11-21 19:40:41'),
('84d190d8-a545-4bb5-bf70-94e4f3c2079b', '40058126-1471-4c26-945c-1f329a49a2be', 'Valquíria Jennifer', 'FEMALE', 'SPRITE', 'artifice_criativa', '3036c7eb-83bf-4dbf-bf75-0d851c084efd', 50, 0, NULL, '2026-11-21 19:40:42', '2026-11-21 19:40:42'),
('9249946b-0397-40e5-9cea-34e2d6373a5a', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', 'Sid', 'MALE', 'SPRITE', 'hero_warrior', 'fede86d8-0db2-4c7d-a6bc-0e4b869146cf', 1538, 0, NULL, '2026-08-31 21:07:17', '2026-09-05 16:29:10'),
('a6ed1804-63df-495d-9727-efd68260d554', '70d3b59f-e6d2-4903-9409-d832753a7c09', 'Paladino Sidney', 'MALE', 'SPRITE', 'paladino_lira', '6cacfc3a-d5fa-4860-bc50-c2c2bcf91359', 50, 0, NULL, '2026-11-21 19:40:41', '2026-11-21 19:40:41'),
('aa75380d-1840-4f00-ab83-75bd1f171399', 'f85ea042-b0b0-484c-be2b-3ea9b0503b6b', 'Sir Paulinho', 'MALE', 'SPRITE', 'rastreador_veloz', 'c9d49be2-a865-49fa-8c4b-5093a9844c27', 50, 0, NULL, '2026-11-21 19:40:41', '2026-11-21 19:40:41');

-- --------------------------------------------------------

--
-- Estrutura para tabela `character_attributes`
--

CREATE TABLE `character_attributes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `character_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `attribute_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `base_value` int(11) NOT NULL DEFAULT 10,
  `bonus_value` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `str` int(11) DEFAULT 10,
  `agi` int(11) DEFAULT 10,
  `con` int(11) DEFAULT 10,
  `int` int(11) DEFAULT 10,
  `cha` int(11) DEFAULT 10,
  `luk` int(11) DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `character_attributes`
--

INSERT INTO `character_attributes` (`id`, `character_id`, `attribute_id`, `base_value`, `bonus_value`, `created_at`, `updated_at`, `str`, `agi`, `con`, `int`, `cha`, `luk`) VALUES
('053d3d9b-991d-4279-9169-e65f0a498c57', '9249946b-0397-40e5-9cea-34e2d6373a5a', '968e523c-9388-4d6f-8dd8-5226291af798', 10, 0, '2026-08-31 21:07:17', '2026-08-31 21:07:17', 10, 10, 10, 10, 10, 10),
('0fa05ea8-8695-4120-9b10-816391957ac9', '9249946b-0397-40e5-9cea-34e2d6373a5a', '9290cb75-0ba5-4162-9d99-04a8dff201c3', 10, 0, '2026-08-31 21:07:17', '2026-08-31 21:07:17', 10, 10, 10, 10, 10, 10),
('1c260d19-8917-42a7-8856-5edab658bb53', '7a46af9e-3296-4823-9597-d6eb7cdcd761', '9290cb75-0ba5-4162-9d99-04a8dff201c3', 16, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 10, 10, 12, 14, 16, 10),
('1e46f4cb-e824-4c18-bd88-36b43efa7935', '9249946b-0397-40e5-9cea-34e2d6373a5a', '6d672c01-90a4-4284-9ada-82e7d18022e0', 10, 2, '2026-08-31 21:07:17', '2026-08-31 21:07:17', 10, 10, 10, 10, 10, 10),
('1e4d607a-0222-4c7c-8eb7-1fca3f409c8f', 'a6ed1804-63df-495d-9727-efd68260d554', '45bfdec1-f79d-43c4-adbd-e388e408c383', 10, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 15, 10, 16, 12, 12, 10),
('2054c5ab-c518-4324-b980-c24eeca56276', '7a46af9e-3296-4823-9597-d6eb7cdcd761', '6d672c01-90a4-4284-9ada-82e7d18022e0', 10, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 10, 10, 12, 14, 16, 10),
('2a26498e-4857-439e-a346-385b5f5b3a4b', '6752320c-afcb-4a94-ab5c-a43f965edb0f', '45bfdec1-f79d-43c4-adbd-e388e408c383', 10, 0, '2026-08-31 21:05:21', '2026-08-31 21:05:21', 10, 10, 10, 10, 10, 10),
('2ad8f11b-048b-4460-8798-ae0a3c65fc6f', 'a6ed1804-63df-495d-9727-efd68260d554', '35acc574-ce1a-480d-89d1-e7007f712ed4', 15, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 15, 10, 16, 12, 12, 10),
('320ffb92-fe80-44df-acab-354412897f97', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', '99bd150a-c228-4b14-9f1d-528ff4ce2301', 10, 6, '2026-09-05 01:36:14', '2026-09-05 01:43:30', 10, 10, 10, 10, 10, 10),
('388d090a-28fd-41d4-a8e0-57b39684a87b', '84d190d8-a545-4bb5-bf70-94e4f3c2079b', '45bfdec1-f79d-43c4-adbd-e388e408c383', 10, 0, '2026-11-21 19:40:42', '2026-11-21 19:40:42', 14, 11, 12, 16, 11, 10),
('3f7a72f9-a33c-4113-9747-38221b74daaf', 'aa75380d-1840-4f00-ab83-75bd1f171399', '9290cb75-0ba5-4162-9d99-04a8dff201c3', 10, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 12, 16, 11, 10, 10, 14),
('3f8e8a1d-c963-4c3f-8e7f-cc033b2dcca7', '9249946b-0397-40e5-9cea-34e2d6373a5a', '99bd150a-c228-4b14-9f1d-528ff4ce2301', 10, 21, '2026-08-31 21:07:17', '2026-09-05 16:29:10', 10, 10, 10, 10, 10, 10),
('41d824ac-a576-46e7-b99a-d916e1ff8bcb', 'aa75380d-1840-4f00-ab83-75bd1f171399', '99bd150a-c228-4b14-9f1d-528ff4ce2301', 10, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 12, 16, 11, 10, 10, 14),
('421a3f91-a7d7-421f-8697-d61a0b2c0bfb', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', '6d672c01-90a4-4284-9ada-82e7d18022e0', 10, 0, '2026-09-05 01:36:14', '2026-09-05 01:36:14', 10, 10, 10, 10, 10, 10),
('49e96abb-4bf3-4cd6-a4b9-d7b70fca337a', '84d190d8-a545-4bb5-bf70-94e4f3c2079b', '35acc574-ce1a-480d-89d1-e7007f712ed4', 14, 0, '2026-11-21 19:40:42', '2026-11-21 19:40:42', 14, 11, 12, 16, 11, 10),
('4bc9e68e-973b-47b5-9843-f54583b90661', '6752320c-afcb-4a94-ab5c-a43f965edb0f', '9290cb75-0ba5-4162-9d99-04a8dff201c3', 10, 0, '2026-08-31 21:05:21', '2026-08-31 21:05:21', 10, 10, 10, 10, 10, 10),
('50fdcb0a-0421-4378-a1cd-e3b7652f19d8', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', '968e523c-9388-4d6f-8dd8-5226291af798', 10, 0, '2026-08-31 12:22:12', '2026-08-31 12:22:12', 10, 10, 10, 10, 10, 10),
('51da22d3-3e18-48e2-a2c5-954dda5d74d7', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', '968e523c-9388-4d6f-8dd8-5226291af798', 10, 2, '2026-09-05 01:36:14', '2026-09-05 01:36:14', 10, 10, 10, 10, 10, 10),
('5453e07b-9a9e-4251-90c0-b833ed1f5722', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', '99bd150a-c228-4b14-9f1d-528ff4ce2301', 10, 2, '2026-08-31 12:22:12', '2026-08-31 12:22:12', 10, 10, 10, 10, 10, 10),
('569d2524-a50e-4bbe-a90b-c921eedef416', '84d190d8-a545-4bb5-bf70-94e4f3c2079b', '6d672c01-90a4-4284-9ada-82e7d18022e0', 11, 0, '2026-11-21 19:40:42', '2026-11-21 19:40:42', 14, 11, 12, 16, 11, 10),
('64ad0371-26fa-483e-a60a-60efeef1393e', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', '6d672c01-90a4-4284-9ada-82e7d18022e0', 10, 0, '2026-08-31 12:22:12', '2026-08-31 12:22:12', 10, 10, 10, 10, 10, 10),
('6f671b77-541a-4420-b53a-ff25edf0d97d', '6752320c-afcb-4a94-ab5c-a43f965edb0f', '35acc574-ce1a-480d-89d1-e7007f712ed4', 10, 2, '2026-08-31 21:05:21', '2026-08-31 21:05:21', 10, 10, 10, 10, 10, 10),
('71d610d3-5d42-4551-a36c-bd86017f3806', 'a6ed1804-63df-495d-9727-efd68260d554', '9290cb75-0ba5-4162-9d99-04a8dff201c3', 12, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 15, 10, 16, 12, 12, 10),
('8de47d2e-4c89-4a00-895f-395656d76384', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', '9290cb75-0ba5-4162-9d99-04a8dff201c3', 10, 0, '2026-09-05 01:36:14', '2026-09-05 01:36:14', 10, 10, 10, 10, 10, 10),
('920fb959-b83f-4f25-a11c-5669b91249ae', '7a46af9e-3296-4823-9597-d6eb7cdcd761', '35acc574-ce1a-480d-89d1-e7007f712ed4', 10, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 10, 10, 12, 14, 16, 10),
('92b38258-e6b8-47e8-a72f-40c1a552270d', '7a46af9e-3296-4823-9597-d6eb7cdcd761', '45bfdec1-f79d-43c4-adbd-e388e408c383', 10, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 10, 10, 12, 14, 16, 10),
('9a27730f-33bc-4dfb-a44b-166eb9ab5f97', '84d190d8-a545-4bb5-bf70-94e4f3c2079b', '9290cb75-0ba5-4162-9d99-04a8dff201c3', 11, 0, '2026-11-21 19:40:42', '2026-11-21 19:40:42', 14, 11, 12, 16, 11, 10),
('a4c169c3-ef9b-483d-b5b6-a6b6b121c50a', '6752320c-afcb-4a94-ab5c-a43f965edb0f', '6d672c01-90a4-4284-9ada-82e7d18022e0', 10, 0, '2026-08-31 21:05:21', '2026-08-31 21:05:21', 10, 10, 10, 10, 10, 10),
('ac1f0864-f5f8-4155-8a34-d04d910f8859', 'aa75380d-1840-4f00-ab83-75bd1f171399', '6d672c01-90a4-4284-9ada-82e7d18022e0', 16, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 12, 16, 11, 10, 10, 14),
('ae9356a9-a612-4192-86c9-21ece574aba3', '84d190d8-a545-4bb5-bf70-94e4f3c2079b', '968e523c-9388-4d6f-8dd8-5226291af798', 12, 0, '2026-11-21 19:40:42', '2026-11-21 19:40:42', 14, 11, 12, 16, 11, 10),
('b729d5bc-0c41-450f-8888-de62dfe9db0f', 'a6ed1804-63df-495d-9727-efd68260d554', '6d672c01-90a4-4284-9ada-82e7d18022e0', 10, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 15, 10, 16, 12, 12, 10),
('b73bfa32-0c32-46cc-8712-c7fb1314cc84', '6752320c-afcb-4a94-ab5c-a43f965edb0f', '968e523c-9388-4d6f-8dd8-5226291af798', 10, 3, '2026-08-31 21:05:21', '2026-08-31 21:05:21', 10, 10, 10, 10, 10, 10),
('c4fbb51b-5413-4cc9-ab50-40b4c82d2764', 'aa75380d-1840-4f00-ab83-75bd1f171399', '35acc574-ce1a-480d-89d1-e7007f712ed4', 12, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 12, 16, 11, 10, 10, 14),
('c59841cd-340d-4b89-9071-ccb0403f3425', '9249946b-0397-40e5-9cea-34e2d6373a5a', '45bfdec1-f79d-43c4-adbd-e388e408c383', 10, 3, '2026-08-31 21:07:17', '2026-08-31 21:07:17', 10, 10, 10, 10, 10, 10),
('ce0538c7-b074-48d7-92a4-7974584a04ea', '9249946b-0397-40e5-9cea-34e2d6373a5a', '35acc574-ce1a-480d-89d1-e7007f712ed4', 10, 4, '2026-08-31 21:07:17', '2026-09-05 16:28:02', 10, 10, 10, 10, 10, 10),
('cfe5db18-9ad5-493d-bb11-ed1d5771e8d8', '7a46af9e-3296-4823-9597-d6eb7cdcd761', '968e523c-9388-4d6f-8dd8-5226291af798', 12, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 10, 10, 12, 14, 16, 10),
('d51ea711-3ced-497d-b691-0c7baa761dcb', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', '9290cb75-0ba5-4162-9d99-04a8dff201c3', 10, 0, '2026-08-31 12:22:12', '2026-08-31 12:22:12', 10, 10, 10, 10, 10, 10),
('d5550f96-7258-440e-8d3a-17079b816fe1', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', '35acc574-ce1a-480d-89d1-e7007f712ed4', 10, 0, '2026-09-05 01:36:14', '2026-09-05 01:36:14', 10, 10, 10, 10, 10, 10),
('db119b46-1a16-4e1c-a1b1-0b7d68dcbe5a', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', '35acc574-ce1a-480d-89d1-e7007f712ed4', 10, 3, '2026-08-31 12:22:12', '2026-08-31 12:22:12', 10, 10, 10, 10, 10, 10),
('dd0080f6-0cc8-43dc-a644-7a1e60931daf', 'a6ed1804-63df-495d-9727-efd68260d554', '99bd150a-c228-4b14-9f1d-528ff4ce2301', 12, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 15, 10, 16, 12, 12, 10),
('de6f2379-1ad0-43ab-a99f-061d1c5295a0', '6752320c-afcb-4a94-ab5c-a43f965edb0f', '99bd150a-c228-4b14-9f1d-528ff4ce2301', 10, 2, '2026-08-31 21:05:21', '2026-09-04 14:03:59', 10, 10, 10, 10, 10, 10),
('df6c94b8-ede2-4ce9-a9ce-902a313cadc0', 'aa75380d-1840-4f00-ab83-75bd1f171399', '45bfdec1-f79d-43c4-adbd-e388e408c383', 14, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 12, 16, 11, 10, 10, 14),
('e25fddb5-3775-490f-84a5-6997ae4b9bee', 'a6ed1804-63df-495d-9727-efd68260d554', '968e523c-9388-4d6f-8dd8-5226291af798', 16, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 15, 10, 16, 12, 12, 10),
('e6c5dc54-86f6-43cf-98fd-440d0e6c468b', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', '45bfdec1-f79d-43c4-adbd-e388e408c383', 10, 0, '2026-09-05 01:36:14', '2026-09-05 01:36:14', 10, 10, 10, 10, 10, 10),
('e9aac74a-d276-4486-8d60-97e8fcf34ab7', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', '45bfdec1-f79d-43c4-adbd-e388e408c383', 10, 0, '2026-08-31 12:22:12', '2026-08-31 12:22:12', 10, 10, 10, 10, 10, 10),
('ec2bb2ed-461a-4dbf-8b7d-f44cf6c3d127', '7a46af9e-3296-4823-9597-d6eb7cdcd761', '99bd150a-c228-4b14-9f1d-528ff4ce2301', 14, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 10, 10, 12, 14, 16, 10),
('f83fb7ac-7abc-4584-a4cf-ad50fedb978c', '84d190d8-a545-4bb5-bf70-94e4f3c2079b', '99bd150a-c228-4b14-9f1d-528ff4ce2301', 16, 0, '2026-11-21 19:40:42', '2026-11-21 19:40:42', 14, 11, 12, 16, 11, 10),
('fa135be2-b71c-45a5-8a10-86f68efc4976', 'aa75380d-1840-4f00-ab83-75bd1f171399', '968e523c-9388-4d6f-8dd8-5226291af798', 11, 0, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 12, 16, 11, 10, 10, 14);

-- --------------------------------------------------------

--
-- Estrutura para tabela `character_classes`
--

CREATE TABLE `character_classes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `character_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `class_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `level` int(11) NOT NULL DEFAULT 1,
  `xp` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `character_classes`
--

INSERT INTO `character_classes` (`id`, `character_id`, `class_id`, `level`, `xp`, `created_at`, `updated_at`) VALUES
('3002ee24-e881-426f-989e-65935aa28798', '6752320c-afcb-4a94-ab5c-a43f965edb0f', '6cacfc3a-d5fa-4860-bc50-c2c2bcf91359', 2, 91, '2026-08-31 21:05:21', '2026-11-17 01:23:03'),
('39cfdd93-5571-4319-aace-89c9e92b4413', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', '34b41dbe-c51b-441a-8aa5-49512d8c814d', 2, 109, '2026-09-05 01:36:14', '2026-09-05 01:43:30'),
('4373d50f-7a04-48a1-b3aa-9a1fb690fbae', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'fede86d8-0db2-4c7d-a6bc-0e4b869146cf', 6, 593, '2026-08-31 21:07:17', '2026-09-05 16:29:10'),
('a72c420e-6de0-4c74-9525-ff5ded94e517', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', '3036c7eb-83bf-4dbf-bf75-0d851c084efd', 4, 2, '2026-08-31 12:22:12', '2026-09-03 14:41:18');

-- --------------------------------------------------------

--
-- Estrutura para tabela `character_inventory`
--

CREATE TABLE `character_inventory` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `character_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `item_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `is_equipped` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `character_skills`
--

CREATE TABLE `character_skills` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `character_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `skill_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_equipped` tinyint(1) DEFAULT 0,
  `unlocked_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `character_skills`
--

INSERT INTO `character_skills` (`id`, `character_id`, `skill_id`, `is_equipped`, `unlocked_at`, `created_at`, `updated_at`) VALUES
('10c54785-c1a9-4f39-b8c7-32a58181833e', '9249946b-0397-40e5-9cea-34e2d6373a5a', '3320a8a7-e3a8-4e26-baec-ab135909e5e3', 1, '2026-08-31 21:07:17', '2026-08-31 21:07:17', '2026-08-31 21:07:17'),
('2831874d-ed59-4927-8ae3-6a8a3232ae94', '6752320c-afcb-4a94-ab5c-a43f965edb0f', '683250f9-37f8-4efc-b320-e803832e415e', 1, '2026-08-31 21:05:21', '2026-08-31 21:05:21', '2026-08-31 21:05:21'),
('3fbe1963-b08b-4f0a-b984-200c99ecc7e1', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', 'e262fa2f-5164-4ec7-974d-62207c2555dc', 1, '2026-09-05 01:36:14', '2026-09-05 01:36:14', '2026-09-05 01:36:14'),
('5a38b145-8f5c-4fc3-af9f-e65fc3908447', '6752320c-afcb-4a94-ab5c-a43f965edb0f', 'ce31511a-1119-4026-bcff-c72ecafbddb8', 1, '2026-08-31 21:05:21', '2026-08-31 21:05:21', '2026-08-31 21:05:21'),
('66fde2f1-96b4-485d-bde8-3e22242b1fc7', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', '1d2317b1-f0c7-497e-8316-f5d4467eaa09', 1, '2026-09-05 01:36:14', '2026-09-05 01:36:14', '2026-09-05 01:36:14'),
('cbafe622-3a29-418f-b07a-4b939b218b1a', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', '2e34f1cf-7f5f-4eb5-b65c-9b112823d7a0', 1, '2026-08-31 12:22:12', '2026-08-31 12:22:12', '2026-08-31 12:22:12'),
('ffe4b2be-6c66-4168-a9f6-a762d4f71b9e', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', 'c01dd339-3ebc-4405-b161-6e09bdd08164', 1, '2026-09-05 01:36:14', '2026-09-05 01:36:14', '2026-09-05 01:36:14');

-- --------------------------------------------------------

--
-- Estrutura para tabela `definition_attributes`
--

CREATE TABLE `definition_attributes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `combat_role` varchar(255) NOT NULL,
  `real_life_role` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `definition_attributes`
--

INSERT INTO `definition_attributes` (`id`, `code`, `name`, `description`, `combat_role`, `real_life_role`, `created_at`, `updated_at`) VALUES
('35acc574-ce1a-480d-89d1-e7007f712ed4', 'str', 'Força', 'Poder físico, capacidade de carga e impacto corpo a corpo.', 'Dano físico corpo a corpo, quebra de escudos e empurrão no grid.', 'Desafios de esforço físico, carregar peso e tarefas pesadas de casa.', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('45bfdec1-f79d-43c4-adbd-e388e408c383', 'luk', 'Sorte', 'Fortuna, intuição e acontecimentos improváveis.', 'Chance de acerto crítico e sobrevivência milagrosa a golpes fatais.', 'Taxa de drop de itens raros, recompensas surpresa e gincanas.', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('6d672c01-90a4-4284-9ada-82e7d18022e0', 'agi', 'Agilidade', 'Velocidade, reflexos e destreza manual.', 'Iniciativa na ordem de turnos, esquiva/evasão e dano à distância.', 'Reflexos rápidos, atividades esportivas e tarefas com tempo limite.', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('9290cb75-0ba5-4162-9d99-04a8dff201c3', 'cha', 'Carisma', 'Empatia, liderança e capacidade de inspiração.', 'Eficiência de auras, cura, buffs em aliados e descontos no reino.', 'Empatia, cooperação familiar, gentileza e comunicação.', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('968e523c-9388-4d6f-8dd8-5226291af798', 'con', 'Constituição', 'Vigor, resistência física e perseverança.', 'Pontos de vida máximos (HP) e resistência a efeitos negativos.', 'Vigor, saúde, hábitos consistentes e foco prolongado (Timer AFK).', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('99bd150a-c228-4b14-9f1d-528ff4ce2301', 'int', 'Inteligência', 'Capacidade analítica, raciocínio lógico e conhecimento.', 'Dano mágico arcano, reserva máxima de MP e eficiência de táticas.', 'Estudos, leitura, lições de casa e resolução de problemas.', '2026-08-31 02:35:30', '2026-08-31 02:35:30');

-- --------------------------------------------------------

--
-- Estrutura para tabela `definition_classes`
--

CREATE TABLE `definition_classes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `primary_attribute_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `secondary_attribute_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `combat_role` varchar(100) NOT NULL,
  `real_life_focus` varchar(255) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `definition_classes`
--

INSERT INTO `definition_classes` (`id`, `code`, `name`, `description`, `primary_attribute_id`, `secondary_attribute_id`, `combat_role`, `real_life_focus`, `icon`, `created_at`, `updated_at`) VALUES
('3036c7eb-83bf-4dbf-bf75-0d851c084efd', 'artifice_criativo', 'Artífice Criativo', 'O inventor habilidoso que constrói geringonças e controla o campo.', '35acc574-ce1a-480d-89d1-e7007f712ed4', '99bd150a-c228-4b14-9f1d-528ff4ce2301', 'Invocador / Controle', 'Artes, desenhos, montagens e consertos caseiros.', 'tool', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('34b41dbe-c51b-441a-8aa5-49512d8c814d', 'sabio_estrategista', 'Sábio Estrategista', 'O mestre dos estudos e feitiços que decifra fraquezas dos monstros.', '99bd150a-c228-4b14-9f1d-528ff4ce2301', '968e523c-9388-4d6f-8dd8-5226291af798', 'Mago / Dano Mágico', 'Estudos, leitura, lições de casa e notas altas.', 'book', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('6cacfc3a-d5fa-4860-bc50-c2c2bcf91359', 'guardiao_do_lar', 'Guardião do Lar', 'O protetor incansável da casa que absorve impacto e protege os irmãos.', '968e523c-9388-4d6f-8dd8-5226291af798', '35acc574-ce1a-480d-89d1-e7007f712ed4', 'Tanque / Protetor', 'Arrumação pesada, limpeza do quarto e cuidado do espaço comum.', 'shield', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('b5ae65dc-800e-46f3-b28d-af9d7f334162', 'guardiao_da_harmonia', 'Guardião da Harmonia', 'A alma carismática que cura feridas, traz paz e inspira a família.', '9290cb75-0ba5-4162-9d99-04a8dff201c3', '99bd150a-c228-4b14-9f1d-528ff4ce2301', 'Curandeiro / Suporte', 'Autocuidado, cooperação com os pais e gentileza no dia a dia.', 'heart', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('c9d49be2-a865-49fa-8c4b-5093a9844c27', 'rastreador_veloz', 'Rastreador Veloz', 'O atleta ágil que ataca com extrema velocidade e esquiva de perigos.', '6d672c01-90a4-4284-9ada-82e7d18022e0', '45bfdec1-f79d-43c4-adbd-e388e408c383', 'Dano Físico / Esquiva', 'Esportes, recados rápidos e brincadeiras ativas.', 'zap', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('fede86d8-0db2-4c7d-a6bc-0e4b869146cf', 'aventureiro_oportunista', 'Aventureiro Oportunista', 'O atirador sortudo que arrisca tudo por golpes críticos devastadores.', '45bfdec1-f79d-43c4-adbd-e388e408c383', '6d672c01-90a4-4284-9ada-82e7d18022e0', 'Crítico / Longo Alcance', 'Jogos de tabuleiro, novos desafios e missões surpresa.', 'dice', '2026-08-31 02:35:30', '2026-08-31 02:35:30');

-- --------------------------------------------------------

--
-- Estrutura para tabela `definition_items`
--

CREATE TABLE `definition_items` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('WEAPON','ARMOR','ACCESSORY','POTION','REAL_WORLD') NOT NULL DEFAULT 'WEAPON',
  `price_gold` int(11) NOT NULL DEFAULT 10,
  `stat_bonuses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`stat_bonuses`)),
  `icon` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `definition_items`
--

INSERT INTO `definition_items` (`id`, `code`, `name`, `description`, `type`, `price_gold`, `stat_bonuses`, `icon`, `created_at`, `updated_at`) VALUES
('231ad761-8653-4b44-b03b-51669ab5786c', 'item_escudo_bronze', 'Escudo de Bronze', 'Escudo resistente que eleva a Constituição e sobrevivência.', 'ARMOR', 40, '{\"con\":3}', 'bronze_shield', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('d50ad174-586e-45ba-9557-5d2d5a492ee8', 'item_livro_antigo', 'Tomo do Estudioso', 'Páginas repletas de anotações úteis que expandem a Inteligência.', 'ACCESSORY', 35, '{\"int\":2}', 'scholar_book', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('e5b59b38-84cf-4047-8076-af39adaa9f0d', 'item_recompensa_cinema', 'Vale Cinema com Pipoca', 'Recompensa do Mundo Real: Uma ida ao cinema com a família!', 'REAL_WORLD', 200, '{}', 'ticket', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('e8672ad8-329b-4194-9b03-41ed24986fe3', 'item_pocao_vida', 'Poção de Vigor', 'Restaura 40 pontos de vida instantaneamente em batalha.', 'POTION', 15, '{}', 'health_potion', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('ffa525b7-4726-4163-b416-88468c05f0f4', 'item_espada_madeira', 'Espada de Treino', 'Uma espada leve entalhada em carvalho. Aumenta a Força.', 'WEAPON', 30, '{\"str\":2}', 'wooden_sword', '2026-08-31 02:35:30', '2026-08-31 02:35:30');

-- --------------------------------------------------------

--
-- Estrutura para tabela `definition_monsters`
--

CREATE TABLE `definition_monsters` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_boss` tinyint(1) DEFAULT 0,
  `max_hp` int(11) NOT NULL DEFAULT 100,
  `attack_power` int(11) NOT NULL DEFAULT 15,
  `defense` int(11) NOT NULL DEFAULT 5,
  `speed` int(11) NOT NULL DEFAULT 10,
  `xp_reward` int(11) DEFAULT 50,
  `gold_reward` int(11) DEFAULT 20,
  `sprite_key` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `definition_monsters`
--

INSERT INTO `definition_monsters` (`id`, `code`, `name`, `description`, `is_boss`, `max_hp`, `attack_power`, `defense`, `speed`, `xp_reward`, `gold_reward`, `sprite_key`, `created_at`, `updated_at`) VALUES
('4ddcf178-b4c2-4316-9a06-837d523e5ba4', 'boss_procrastinacao', 'Gólem da Procrastinação', 'Chefe Colossal que tenta fazer os heróis deixarem tudo para amanhã!', 1, 350, 28, 12, 6, 250, 100, 'boss_golem', '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('b140768c-b74f-490e-a057-5c6f761299eb', 'mob_desorganizacao', 'Gosma da Desorganização', 'Uma criatura viscosa nascida de roupas espalhadas pelo chão.', 0, 80, 12, 4, 8, 40, 15, 'slime_mess', '2026-08-31 02:35:30', '2026-08-31 02:35:30');

-- --------------------------------------------------------

--
-- Estrutura para tabela `definition_mz_characters`
--

CREATE TABLE `definition_mz_characters` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(60) NOT NULL,
  `name` varchar(100) NOT NULL,
  `box_name` varchar(120) NOT NULL,
  `has_super_hero` tinyint(1) NOT NULL DEFAULT 0,
  `has_zombie_hero` tinyint(1) NOT NULL DEFAULT 0,
  `has_boss_enemy` tinyint(1) NOT NULL DEFAULT 0,
  `boss_health` int(11) DEFAULT NULL,
  `boss_ability` text DEFAULT NULL,
  `profiles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`profiles`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `definition_mz_characters`
--

INSERT INTO `definition_mz_characters` (`id`, `code`, `name`, `box_name`, `has_super_hero`, `has_zombie_hero`, `has_boss_enemy`, `boss_health`, `boss_ability`, `profiles`, `created_at`, `updated_at`) VALUES
('00265836-e20f-4d41-906e-1ee269f30cff', 'lizard', 'Lizard', 'Expansão: Clash of the Sinister Six', 1, 1, 1, 4, 'Each time he is eliminated by a Devour Attack, spawn him in the same Zone during the next End Phase.', '{\"super_hero\":{\"attack\":{\"name\":\"Fangs and Claws\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Lesser Regeneration : At the start of each of your Turns, you Heal 1 Wound or gain 1 Poder.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Hero Spawn\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Chomp : Once during your Turn, you may perform 1 free Devour Attack. This Attack rolls only 1 die (no bonuses possible), scoring a number of Hits equal to your Hunger level if successful.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Each time he is eliminated by a Devour Attack, spawn him in the same Zone during the next End Phase.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:36:07'),
('0115405c-f85f-4619-8790-4da9d7601adb', 'invisible_woman', 'Invisible Woman', 'Marvel Zombies fantastic 4 Under siege', 1, 1, 1, 4, 'Her Zone cannot be targeted by Attacks from Zombie Heroes outside her Zone.', '{\"super_hero\":{\"attack\":{\"name\":\"Psionic Blast\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Invisibility : Each time you perform a Move Action, you may spend 1 Poder. If you do, you ignore Enemies and may move 1 Super Hero in your Zone along with you.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Psionic Blast\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Invisibility : Each time you perform a Move Action, you may increase Hunger. If you do, you ignore Enemies and may move 1 Zombie Hero in your Zone along with you.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Her Zone cannot be targeted by Attacks from Zombie Heroes outside her Zone.\"}}', '2026-10-21 22:26:55', '2026-11-07 22:35:14'),
('0171694f-5db2-46ed-94b3-2d649057928a', 'nightcrawler', 'Nightcrawler', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:37:12'),
('01ef5499-3c85-447c-bd54-122c80089bbd', 'gamora', 'Gamora', 'Marvel Zombies Gardians of the galaxy set', 1, 1, 1, 3, 'Once per activation, roll a die after she attacks. On a 4+, she performs 1 free Attack.', '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Critical Strike : When attacking, each die result of 6 count as 2 hits against a single Enemy.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Godslayer\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Critical Strike : When attacking with Godslayer, each roll of 6 deals 2 Hits to a single Enemy.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Once per activation, roll a die after she attacks. On a 4+, she performs 1 free Attack.\"}}', '2026-10-21 22:26:55', '2026-11-07 22:35:26'),
('03ee4c8c-0837-4d8b-b107-cc2c819760be', 'iron_man', 'Iron Man', 'Marvel Zombies Core Box', 1, 1, 1, 4, 'Can attack from 2 Zones away. If his Zone is attacked but he is not eliminated, move him 1 Zone away and the attacker suffers 1 Wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Repulsor\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Missile Barrage : When attacking with Repulsor, you may spend 1 Poder to replace your base Dice with 1 die for each Enemy in the Zone (before any bonuses), ignoring Zombie Heroes for this Attack.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Range\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Repulsor Blast : After attacking with Missile Wave, you may push all Enemies in that Zone into an adjacent Zone.\",\"red\":\"+1 action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Can attack from 2 Zones away. If his Zone is attacked but he is not eliminated, move him 1 Zone away and the attacker suffers 1 Wound.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:57'),
('06f325b2-8cee-4906-9b5b-2943c1fb9b89', 'mister_fantastic', 'Mister Fantastic', 'Marvel Zombies fantastic 4 Under siege', 1, 1, 1, 3, 'Instead of moving, if there are any Zombies Heroes in his Line of Sight, he spend his Action moving them ALL into his Zone.', '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"6\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Elongation : When attacking with Elastic Punches, you may spend any amount of * to gain that much additional Range. This Attack doesn\'t require Line of Sight, being able to go around corners but not through walls.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Elastic Punches\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Elongation : Elastic Punches gain additionnal Range equal to your Hunger level. This Attack doesn\'t require Line of Sight, being able to go around corners but not through walls.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Instead of moving, if there are any Zombies Heroes in his Line of Sight, he spend his Action moving them ALL into his Zone.\"}}', '2026-10-21 22:26:55', '2026-11-07 22:35:13'),
('0a390b1c-a866-4fe6-91d7-18a71d7fa045', 'vulture', 'Vulture', 'Expansão: Clash of the Sinister Six', 1, 1, 1, 3, 'Remove 2 Tropper within Range 1 when he activates (if possible). For each Trooper removed, he performs +1 Action this Activation.', '{\"super_hero\":{\"attack\":{\"name\":\"Wing Slash\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Flying Slash : Each time you perform a Move Action, eliminate 1 Walker in 1 Zone you entered or left.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Wing Slash\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Power Sapper : Once during your Turn, when you eliminate a Guard or Super Hero, you may perform 1 free Action.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Remove 2 Tropper within Range 1 when he activates (if possible). For each Trooper removed, he performs +1 Action this Activation.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:36:06'),
('0a4ce6ba-ed36-419b-8ff0-b55c0af9cf08', 'agent_coulson', 'Agent Coulson', 'Promos Exclusivas', 1, 0, 1, 2, 'Last in Target Priority. Spawns with 2 Specialists. All Specialists in his Zone gain +1 Toughness.', '{\"super_hero\":{\"attack\":{\"name\":\"S.H.I.E.L.D. Rifle\",\"range\":\"Range\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Tactical Reposition : Once during your Turn, you may spend 1 * so you or another Super Hero within Range 2 can perform 1 free Move Action. Then, resume your Turn.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":2,\"ability\":\"Last in Target Priority. Spawns with 2 Specialists. All Specialists in his Zone gain +1 Toughness.\"}}', '2026-11-07 22:37:41', '2026-11-07 22:37:41'),
('0e37f30a-fde1-473b-8263-da9dfd501bb2', 'thanos', 'Thanos', 'Marvel Zombies HYDRA Resurection', 0, 1, 1, 5, 'Spawns with Infinity Stones : Blue: 1 / Yellow : 2 / Orange : 3 / Red : 4. Gains 1 additional infinity Stone at the start of each Enemy Phase. If he has all 6 Stones, the players lose at the end of the Player Phase.', '{\"zombie_hero\":{\"attack\":{\"name\":\"Power Stone\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"10\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Mind Stone : Once during your Turn, you may increase Hunger to search the Zombie Trait deck for 1 Trait card. Then, shuffle the deck.\",\"red\":\"Space Stone : +1 Action and move +1 Zone per Move.\"}},\"boss_enemy\":{\"health\":5,\"ability\":\"Spawns with Infinity Stones : Blue: 1 / Yellow : 2 / Orange : 3 / Red : 4. Gains 1 additional infinity Stone at the start of each Enemy Phase. If he has all 6 Stones, the players lose at the end of the Player Phase.\"}}', '2026-10-21 22:26:55', '2026-11-07 22:35:38'),
('0f918c00-84a1-4cda-8509-127c4a2f90ec', 'kingpin', 'Kingpin', 'Marvel Zombies Stretch goal box', 1, 1, 1, 3, 'He is last in Target Priority. Spawn 2 Guards with him. Guards within Range 1 of him have +1 Toughness.', '{\"super_hero\":{\"attack\":{\"name\":\"Cane and Fist\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"The Boss : Once during your Turn, you may have 1 other super Hero within Range 2 perform 1 free Attack Action. You gain 1 XP for each Enemy this eliminates. Then, resume your Turn.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Cane and Fist\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Zombie Boss : Once during your Turn, you may have 1 other Zombie Hero within Range 2 perform 1 free Attack Action. You gain 1 XP for each Enemy this eliminates. Then, resume your Turn.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"He is last in Target Priority. Spawn 2 Guards with him. Guards within Range 1 of him have +1 Toughness.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:36:57'),
('115d735e-43bf-4dbb-bd6e-3c1482307ad3', 'venom', 'Venom', 'Caixa Base: Marvel Zombies', 1, 1, 1, 4, 'When he is eliminated, take this card as a Bystander. While you have it, your Attacks roll +1 die. If it is ever discarded, roll a die. On a 4+, suffer 2 Wounds.', '{\"super_hero\":{\"attack\":{\"name\":\"Rending Claws\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Symbiotic Enhancement : Once during your Turn, Enemies suffer -1 Toughness against your Rending Claws Attack (min 1). During each End Phase, heal 1 Health.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Rending Claws\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Symbiotic Control : Once during your Turn, Enemies suffer -1 Toughness against your Rending Claws Attack (min 1). While Ravenous, you may suffer 1 Wound to perform Action as usual.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"When he is eliminated, take this card as a Bystander. While you have it, your Attacks roll +1 die. If it is ever discarded, roll a die. On a 4+, suffer 2 Wounds.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:55'),
('149f3972-54f3-479d-8a75-048378abe58b', 'jessica_jones', 'Jessica Jones', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:36:55'),
('16436a30-5cb3-411d-91d8-23c4ccdd5ea4', 'nana', 'Nana', 'Expansão: Sentinel Strike', 1, 0, 1, 4, 'Zombies Heroes starting their Turn within Range 1 lose 1 Action. When Nana would be eliminated, roll a die. On a 5+, it is not eliminated.', '{\"super_hero\":{\"attack\":{\"name\":\"Energy Beam\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Protection Protocol : You have 5 Health. When Enemies move into an adjacent Zone containing a Super Hero, you may spend 1 Poder to move into that Zone, ignoring Enemies.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Zombies Heroes starting their Turn within Range 1 lose 1 Action. When Nana would be eliminated, roll a die. On a 5+, it is not eliminated.\"}}', '2026-11-07 22:35:52', '2026-11-07 22:35:52'),
('16b68591-da05-4ce6-bd96-4ecb73ca02ab', 'quicksilver', 'Quicksilver', 'Marvel Zombies HYDRA Resurection', 1, 1, 1, 3, 'Each time a Rush or Extra Activation card is drawn, he moves 2 Zones. If a Zombie Hero leaves his Zone, he moves with them.', '{\"super_hero\":{\"attack\":{\"name\":\"Rapid punches\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Super Speed : Once during your Turn, when you perform a Move Action, you ignore Enemies and may spend any amount of *. For each * spent, move +1 Zone.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Rapid Punches\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Super Speed : Once during your Turn, when you perform a Move Action, you ignore Enemies and may increase Hunger by any amount. Move +1 Zone for each Hunger Lever increased\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Each time a Rush or Extra Activation card is drawn, he moves 2 Zones. If a Zombie Hero leaves his Zone, he moves with them.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:43'),
('1b785045-7207-4063-aab1-ef167c566537', 'cyclops', 'Cyclops', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 3, 'His Attacks target the farthest Zombie Hero\'s Zone in Line of Sight, as well as all intervening Zones (including his own).', '{\"super_hero\":{\"attack\":{\"name\":\"Optic Blast\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Focused Shot : When you Attack with Optic Blast, you may spend 1 Poder to gain +1 Range and ignore Target Priority.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Optic Blast\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Focused Shot : When attacking with Optic Blast, you may increase Hunger to gain +1 Range and ignore Target Priority.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"His Attacks target the farthest Zombie Hero\'s Zone in Line of Sight, as well as all intervening Zones (including his own).\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:08'),
('1bb690ff-ad7b-4508-a89d-72bf723d69d8', 'rocket', 'Rocket', 'Marvel Zombies Gardians of the galaxy set', 1, 1, 1, 3, 'Spawns with 2 Specialists. He and all Specialists within Range 1 can attack from 1 Zone away.', '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Overload Shot : Before attacking, you may spend any amount of *. If you do, roll only 1 die (no bonuses possible). A successful roll deal a number of Hit equal to the * spent.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Gonna Need That Brain : Whenever another Zombie Hero within Range 2 discard a Zombie Trait, you may gain that Trait.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Spawns with 2 Specialists. He and all Specialists within Range 1 can attack from 1 Zone away.\"}}', '2026-10-21 22:26:55', '2026-11-07 22:35:28'),
('1eb4b504-cb0e-47d5-b015-e7dbb6bb4798', 'carnage', 'Carnage', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:36:30'),
('1f9a814f-512f-4b90-87a0-68923ec0db43', 'spider_man', 'Spider-Man', 'Caixa Base: Marvel Zombies', 1, 0, 1, 4, 'Spawns in the closest zone with a Zombie Hero.', '{\"super_hero\":{\"attack\":{\"name\":\"Acrobatics\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Web-Shooters : Once during each Enemy Phase, When the Enemies in a Zone of your choice within Range 2 would move, you may spend 2 Poderes to prevent them from moving.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Spawns in the closest zone with a Zombie Hero.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:48'),
('211a385a-e266-4b80-8387-668149a55411', 'human_torch', 'Human Torch', 'Marvel Zombies fantastic 4 Under siege', 1, 1, 1, 3, 'Zombie Heroes ending their Turn in his Zone suffer 1 Wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Flame on!\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Pyrogenesis : Each time an Enemy moves into your Zone, you may spend up to 3 Poderes to deal that many Hits to that Enemy.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Flame On!\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"A Warm Meal : Each time you eliminate a Super Hero with Flame On!, you may decrease Hunger by 1 and draw 1 Zombie Trait.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Zombie Heroes ending their Turn in his Zone suffer 1 Wound.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:35:15'),
('2288e21e-e120-4521-8f21-1f8fa305db41', 'black_panther', 'Black Panther', 'Caixa Base: Marvel Zombies', 1, 0, 1, 4, 'Performs a number of Actions per Activation equal to 1 plus the highest Danger Level among the Zombie Heroes (2 to 5 actions).', '{\"super_hero\":{\"attack\":{\"name\":\"Vibranium Claws\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Hard slash : Before attacking with Vibranium Claws, you may spend 1 Poder to have ennemies suffer -1 Thougness (to a minimum of 1) and may reroll any dice.\",\"red\":\"+1 action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Performs a number of Actions per Activation equal to 1 plus the highest Danger Level among the Zombie Heroes (2 to 5 actions).\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:53'),
('28c1f804-b080-4fe2-b67a-07a2528bcad1', 'scarlet_witch', 'Scarlet Witch', 'Caixa Base: Marvel Zombies', 1, 1, 1, 3, 'Zombie Heroes in her Zone must reroll all Hits.', '{\"super_hero\":{\"attack\":{\"name\":\"Hex Blast\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Manipulate Probablity : After attacking, you may spend 1 Poder to reroll ALL dice\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Hex Blast\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Alternate Timelines : Once during your Turn, you may increase Hunger by any amount. For each level increased, 1 Zombie Hero may draw 1 Zombie Trait. Then, roll a die. On a 5+, each Zombie Hero who gained a Trait increases Hunger by 1.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Zombie Heroes in her Zone must reroll all Hits.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:50'),
('293c4829-14bb-4ad2-83b7-edf9d919df23', 'deadpool', 'Deadpool', 'Caixa Base: Marvel Zombies', 1, 1, 1, 4, 'Unless he has been devoured, each time he is eliminated spawn him on the First Spawn Point during the next End Phase.', '{\"super_hero\":{\"attack\":{\"name\":\"Dual Katanas\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Yeah, I Count as a Hero! : Once during your Turn, you may spend 1 Poder to draw 1 Heroic Trait. Each time you eliminate a Zombie Hero, draw 1 Heroic Trait.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Dual Katanas\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Adapting to the Hunger : Once during your Turn, you may increase Hunger to draw 1 Zombie Trait.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Unless he has been devoured, each time he is eliminated spawn him on the First Spawn Point during the next End Phase.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:55'),
('2ab4642d-f581-4afd-b8c1-8866c5b34c78', 'captain_america', 'Captain America', 'Caixa Base: Marvel Zombies', 1, 1, 1, 4, 'Troopers and Guards activating within Range 1 perform +1 Action.', '{\"super_hero\":{\"attack\":{\"name\":\"Vibranium Shield\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|230x230px\",\"yellow\":\"-\",\"orange\":\"I Can Do This All Day : Once during your Turn, you may spend 1 Poder to perform 1 free Move Action, or spend 3 Poderes to heal 1 Wound.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Vibranium Shield\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Shield Block : Each time Enemies attack your Zone, before assinging Wounds, roll 1 die for each Wound. On a 5+ Prevent that Wound.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Troopers and Guards activating within Range 1 perform +1 Action.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:54'),
('2ae4d0a6-c011-4e94-9b17-5b8bdf21e7c9', 'kitty_pryde', 'Kitty Pryde', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:36:59'),
('2cb9a556-78cf-44ca-b481-78e43f2ce1a7', 'wong', 'Wong', 'Promos Exclusivas', 1, 0, 1, 3, 'Last in Target Priority. When he spawns, roll a die and place it on this card, representing a Mystic Shield. Each time a Hit is allocated to his Zone, reduce the Shield by 1. Enemies in his Zone cannot be allocated Hits until the Shield is eliminated.', '{\"super_hero\":{\"attack\":{\"name\":\"Martial Arts\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Kamar-Taj Technique : Each time you attack with Martial Arts, you may spend 1 * to have your Attack roll only a single die (no bonuses possible) but gain +2 to the die result. If successful, it deals 3 Hits.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Last in Target Priority. When he spawns, roll a die and place it on this card, representing a Mystic Shield. Each time a Hit is allocated to his Zone, reduce the Shield by 1. Enemies in his Zone cannot be allocated Hits until the Shield is eliminated.\"}}', '2026-11-07 22:37:43', '2026-11-07 22:37:43'),
('2d329086-b444-4526-86eb-64453210f7fe', 'psylocke', 'Psylocke', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 3, 'Zombie Heroes within Range 1 must increase Hunger by an additional +1 to use Zombie Traits.', '{\"super_hero\":{\"attack\":{\"name\":\"Psionic Blade\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Psychic Bolt : Once during your Turn, you may automatically eliminate 1 Walker or Runner within Range 1.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Psionic Blade\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Psychic bolt : Once during your Turn, you may automatically eliminate 1 Trooper or Specialist within Range 1.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Zombie Heroes within Range 1 must increase Hunger by an additional +1 to use Zombie Traits.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:10'),
('2d7a2e4b-a1cb-49e3-9be0-67977ebb4ad7', 'elektra', 'Elektra', 'Marvel Zombies stretch goals box', 1, 1, 1, 3, 'Whenever an Extra Activation card is drawn, all Zombie Heroes within Range 2 suffer 1 Wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Baton Sai\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Woman Without Fear : Before attacking with Baton Sai, you may spend 1 Poder to eliminated 1 Brute in the target Zone OR score +1 Hit against a Zombie Hero.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Dual Sai\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Critical Strike : When attacking with Dual Sai, each roll of 6 deals 2 Hits to a single Enemy.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Whenever an Extra Activation card is drawn, all Zombie Heroes within Range 2 suffer 1 Wound.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:36:41'),
('2f1add40-e913-499f-a19c-88168136153a', 'green_goblin', 'Green Goblin', 'Expansão: Clash of the Sinister Six', 1, 1, 1, 3, 'Instead of attacking, he deals 1 Wound to each Zombie Hero in his Zone, then moves 1 Zone away.', '{\"super_hero\":{\"attack\":{\"name\":\"Pumpkin Bomb\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Goblin Glider : Once during your Turn, you may spend 1 Poder when moving to move +1 Zone, ignoring Enemies.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Pumpkin Bomb\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Goblin Glider : Once during your Turn, you may increase Hunger when moving to move +1 Zone, ignoring Enemies.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Instead of attacking, he deals 1 Wound to each Zombie Hero in his Zone, then moves 1 Zone away.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:36:03'),
('314bfefa-b02b-40e4-bee8-cc55102ba9fe', 'captain_marvel', 'Captain Marvel', 'Caixa Base: Marvel Zombies', 1, 1, 1, 4, 'If a Zombie Hero enters a Zone with a Bystander, immediately place her in that Zone. All Zombie Heroes there suffer 1 wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Mighty Punches\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Energy Focus : Enemies suffer -1 Toughness (min. 1) against your Mighty Punches Attack. When Attacking with Mighty Punches, you may spend 1 Poder to gain +1 Range.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Mighty Punches\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Energy Blast : Each time you attack with Mighty Punches, you may eliminate 1 Trooper or Specialist in your Zone.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"If a Zombie Hero enters a Zone with a Bystander, immediately place her in that Zone. All Zombie Heroes there suffer 1 wound.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:58'),
('345dfd03-b1c9-4559-9c73-8ab58d8d92d5', 'thor', 'Thor', 'Caixa Base: Marvel Zombies', 1, 1, 1, 5, 'His attacks deals 2 Wounds.', '{\"super_hero\":{\"attack\":{\"name\":\"Mjolnir\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Hammer Throw : When attacking, you may spend 1 Poder to have Mjolnir gain +1 Range, or spend 2 Poderes to have Mjolnir gain +2 Range.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Imitation Hammer\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Not Worthy, Still Strong : Enemies suffer -1 Toughness (min. 1) against your Attacks. Each time a Super Hero ends their Move within Range 1, you may increase Hunger to perform 1 free Imitation Hammer Attack with Range 0-1.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":5,\"ability\":\"His attacks deals 2 Wounds.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:49'),
('3a5577c6-5e28-4945-98d1-d96b3848d82e', 'groot', 'Groot', 'Marvel Zombies Gardians of the galaxy set', 1, 0, 0, NULL, NULL, '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"I am Groot! : You have 4 health. Once during each Round, you may prevent 1 Wound you would suffer.\",\"red\":\"+1 Action\"}}}', '2026-10-21 22:26:55', '2026-11-07 22:35:27'),
('3bd71c4b-76f5-43d2-8596-820f507cd52a', 'electro', 'Electro', 'Expansão: Clash of the Sinister Six', 1, 1, 1, 3, 'His Attacks wound all Zombies Heroes in his Zone, as well as in all Zones with Zombies Heroes adjacent to it, and all Zones with Zombies Heroes adjacent to those Zones, and so on.', '{\"super_hero\":{\"attack\":{\"name\":\"Electric Bolts\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Arcing Bolt : Each time you Attack with Electric Bolts, you may eliminate 1 additional Walker or Runner within Range 1 of the target Zone.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Electric Bolts\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Arcing Bolt : Each time you attack with Electric Bolts, you may automatically eliminate 1 Trooper or Specialist, within Range 1\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"His Attacks wound all Zombies Heroes in his Zone, as well as in all Zones with Zombies Heroes adjacent to it, and all Zones with Zombies Heroes adjacent to those Zones, and so on.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:36:05'),
('3c8bdbcb-3cda-46e5-8a09-f44cc63006ca', 'bullseye', 'Bullseye', 'Marvel Zombies stretch goals box', 1, 1, 1, 3, 'His attacks have unlimited Range (but still require Line of Sight).', '{\"super_hero\":{\"attack\":{\"name\":\"Dual Sai\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Worthy Target : Zombies Heroes have -1 toughness (min. 1) against your Dual Sai Attacks. Each time you eliminate a Zombie Hero, perform 1 free Action.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Throwing Knives\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"I Never Miss! : You ignore Target Priority when attacking with Throwing Knives. After rolling, you may increase Hunger to reroll any misses.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"His attacks have unlimited Range (but still require Line of Sight).\"}}', '2026-10-21 22:26:57', '2026-11-07 22:36:26'),
('3e71488d-5f40-4cb6-abef-15108fbd4cf1', 'rhino', 'Rhino', 'Caixa Base: Marvel Zombies', 1, 1, 1, 4, 'If he enters a Zone with Zombie Heroes, they each suffer 1 Wound. Whenever a Rush! Spawn card is drawn, he moves 1 Zone.', '{\"super_hero\":{\"attack\":{\"name\":\"Horn\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Gore : Once during your Turn, you may spend up to 2 Poderes. For each * spent, deal 1 Hit to 1 Enemy in your Zone (both may be allocated to the same Enemy).\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Horn\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Undead Hide : Once per Round, when you would suffer a Wound, you may instead increase your Hunger by 1.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"If he enters a Zone with Zombie Heroes, they each suffer 1 Wound. Whenever a Rush! Spawn card is drawn, he moves 1 Zone.\"}}', '2026-11-07 22:36:01', '2026-11-07 22:36:01'),
('40c1a639-80fe-4829-a686-33a22bdd3d34', 'silver_surfer', 'Silver Surfer', 'Expansão: Galactus the Devourer', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:56', '2026-11-07 22:36:12'),
('415d0d76-34fb-445e-bbb1-d803cd034736', 'iceman', 'Iceman', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 3, 'Zombie Heroes within Range 1 must spend 1 extra Action to perform a Move Action.', '{\"super_hero\":{\"attack\":{\"name\":\"Ice Beams\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Ice Slide : Once during your Turn, you may spend 1 Poder to have yourself or another Super Hero within Range 1 perform 1 free Move Action.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Ice Beams\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Ice Slide : Once during your Turn, you may perform 1 free Move Action and move +1 Zone. (You stop if you enter a Zone with Enemies)\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Zombie Heroes within Range 1 must spend 1 extra Action to perform a Move Action.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:06'),
('435cfcec-b92a-41e9-98f5-1e85286f62ac', 'scorpion', 'Scorpion', 'Expansão: Clash of the Sinister Six', 1, 1, 1, 3, 'Can attack from 1 Zone away. Each time he attacks, roll a die. On a 4-5, he deals 2 Wounds among the targeted Zombie Heroes. On a 6, he deals 3 Wounds.', '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Impale : Once during your Turn, you may spend 1 Poder to automatically eliminate 1 Walker or Runner within Range 1, or spend 2 Poderes to eliminate 1 Brute.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Skewer and Devour : After attacking with Scorpion\'s Tail, you may move 1 Enemy from the target Zone into your Zone. Then, perform 1 free Devour Attack targeting that Enemy. They suffer -1 Toughness against this Attack (min. 1)\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Can attack from 1 Zone away. Each time he attacks, roll a die. On a 4-5, he deals 2 Wounds among the targeted Zombie Heroes. On a 6, he deals 3 Wounds.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:35:57'),
('43e9b537-e0d4-48cd-bedf-ab666cf4b1bb', 'sentinel_nana', 'Sentinel (Nana)', 'Expansão: Sentinel Strike', 1, 0, 1, 7, 'Protocolo de Extermínio: Move-se 2 zonas por turno e esmaga o solo ao entrar na zona dos heróis, causando 1 ferimento automático a todos.', '{\"super_hero\":{\"attack\":{\"name\":\"Canhão Repulsor Sentinela\",\"range\":\"0-2\",\"dice\":4,\"accuracy\":3},\"skills\":{\"blue\":\"Diretiva de Proteção: Pode gastar 1 Poder para interceptar projéteis direcionados a mutantes aliados.\",\"yellow\":\"+1 Ação\",\"orange\":\"Feixe Concussivo: Empurra todos os inimigos atingidos 1 zona para trás.\",\"red\":\"Purga Tática: Dispara uma rajada contínua de laser que atinge 2 zonas consecutivas.\"}},\"zombie_hero\":null,\"boss_enemy\":{\"health\":7,\"ability\":\"Protocolo de Extermínio: Move-se 2 zonas por turno e esmaga o solo ao entrar na zona dos heróis, causando 1 ferimento automático a todos.\"}}', '2026-10-21 22:26:55', '2026-10-21 22:26:55'),
('4410da88-c7b3-451c-8cf5-102f8e84a942', 'doctor_strange', 'Doctor Strange', 'Caixa Base: Marvel Zombies', 1, 1, 1, 3, 'Acts as a Spawn Point during each Enemy Phase.', '{\"super_hero\":{\"attack\":{\"name\":\"Mystic Bolts\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Precognition : Once during each Enemy Phase, when a Spawn card is drawn, you may spend 2 Poderes to discard that card and draw a new one.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Mystic Bolts\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Precognition : Once during each Enemy Phase, when a Spawn card is drawn, you may increase Hunger to discard that card and draw a new one.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Acts as a Spawn Point during each Enemy Phase.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:51'),
('46f50715-60ec-41f7-8f82-da763ad53fbb', 'miles_morales', 'Miles Morales', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:37:06'),
('4a44dd8e-f1d8-4a6d-a435-212cf4d70e3a', 'sandman', 'Sandman', 'Expansão: Clash of the Sinister Six', 1, 0, 1, 4, 'Ignores walls when moving (does not trigger spawns when entering closed buildings). Does not lower Hunger when devoured.', '{\"super_hero\":{\"attack\":{\"name\":\"Sand Fists\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Body Manipulation : Once during your Turn, when attacking with Sand Fists, you may spend 1 Poder to gain 1 of the following effects, or 2 Poderes to gain both : +1 Range Enemies suffer -1 Thougness. (min 1)\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Ignores walls when moving (does not trigger spawns when entering closed buildings). Does not lower Hunger when devoured.\"}}', '2026-11-07 22:35:59', '2026-11-07 22:35:59'),
('4a7adacc-3230-4df2-be47-659cc872333d', 'star_lord', 'Star Lord', 'Marvel Zombies Gardians of the galaxy set', 1, 1, 1, 3, 'Zombie Heroes activating within Line of Sight lose 1 Action.', '{\"super_hero\":{\"attack\":{\"name\":\"Laser Pistols\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Boosters : Once during your Turn, you may spend 1 Poder to perform 1 Move Action, moving up to 3 Zones. You do not ignore Enemies.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Boosters : Once during your Turn, you may spend 1 Action to perform 1 move Action, moving up to 3 Zones. You do not ignore Enemies.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Zombie Heroes activating within Line of Sight lose 1 Action.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:35:33'),
('4d52794e-a64c-4e8d-9b18-b0b92ab63f9a', 'colossus', 'Colossus', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 4, 'A successful Attack only eliminates him if another Super Hero in his Zone spends 2 Poderes.', '{\"super_hero\":{\"attack\":{\"name\":\"Pummeling Fists\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Tough as Steel : Once during each Enemy Phase, you may ignore 1 Wound you would receive.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Pummeling Fists\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Tough as Steel : Once during each Enemy Phase, you may ignore 1 Wound you would receive.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"A successful Attack only eliminates him if another Super Hero in his Zone spends 2 Poderes.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:00'),
('4eff9ee6-de28-449d-8171-8fc7c37dca5f', 'vision', 'Vision', 'Marvel Zombies HYDRA Resurection', 1, 0, 1, 3, 'Can attack from 1 Zone away, not requiring Line of Sight and ignoring walls.', '{\"super_hero\":{\"attack\":{\"name\":\"Energy Beams\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Adaptive Strategy : When drawing Heroic Traits, you may draw 2 and select 1, shuffling the other into the Traits deck.\",\"red\":\"+1 action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Can attack from 1 Zone away, not requiring Line of Sight and ignoring walls.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:42'),
('4fc6e7a5-a3fa-4ae0-9d41-180b8857c58d', 'ghost_rider', 'Ghost Rider', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:36:48'),
('52788c52-5dc8-4016-a986-706720dda8ae', 'black_cat', 'Black Cat', 'Expansão: Clash of the Sinister Six', 1, 1, 1, 3, 'Zombie Heroes suffer -1 to dice results when attacking her Zone. If that Attack roll 1 or more bite(1), they suffer 1 Wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Martial Arts\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Bad Luck : Once per Enemy Phase, when Enemies in a Zone of your choice within Range 1 would activate, you may spend 1 Poder. If you do, before they activate, roll 3 dice. For each 4+, deal 1 Hit to 1 Enemy in that Zone, ignoring Target Priority.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Cat Claws\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Bad Luck : Once per Enemy Phase, when Enemies move into a Zone within Range 1, you may increase Hunger by any number to eliminate the same number of Troopers in that Zone.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Zombie Heroes suffer -1 to dice results when attacking her Zone. If that Attack roll 1 or more bite(1), they suffer 1 Wound.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:36:00'),
('533081bd-71ee-42f9-9dd9-7213ad809a86', 'spider_man_special_artist', 'Spider-Man (Special Artist Edition)', 'Expansão: Artist\'s Special Edition Set', 1, 0, 1, 4, 'Cada vez que um Herói Zumbi entrar em uma Zona com um Transeunte, role um dado. Com um resultado de 5 ou mais, faça surgir 1 Super-Herói nessa Zona.', '{\"super_hero\":{\"attack\":{\"name\":\"Acrobacias\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"Lançadores de Teia: Uma vez durante cada Fase Inimiga, quando os inimigos em uma Zona de sua escolha dentro do Alcance 2 se moveriam, você pode gastar 2 Poderes para impedi-los de se mover.\",\"yellow\":\"+1 Ação\",\"orange\":\"Sentido Aranha: Sempre que inimigos surgirem dentro do Alcance 2, antes de qualquer Investida, você pode gastar 1 Poder para realizar 1 Ação de Ataque ou Movimento gratuita.\",\"red\":\"Jogador de Equipe: Uma vez durante o seu turno, você pode fazer com que 1 outro Super-Herói dentro do Alcance 2 realize 1 Ação gratuita. Em seguida, retome o seu turno.\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Cada vez que um Herói Zumbi entrar em uma Zona com um Transeunte, role um dado. Com um resultado de 5 ou mais, faça surgir 1 Super-Herói nessa Zona.\"}}', '2026-10-21 22:42:19', '2026-10-21 22:42:19'),
('55bb52b7-90ff-4de9-a9d2-afeadfbfa044', 'spider_man_heroes_resistance', 'Spider-Man (Heroes\' Resistance)', 'Caixa: Marvel Zombies: Heroes\' Resistance', 1, 0, 0, NULL, NULL, '{\"super_hero\":{\"attack\":{\"name\":\"Acrobacias\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"Resgate Heroico: Uma vez durante o seu turno, você pode gastar 1 Poder para mover 1 Transeunte ou 1 Super-Herói de 1 Zona adjacente para a sua Zona.\",\"yellow\":\"+1 Ação\",\"orange\":\"Lançadores de Teia: Uma vez durante cada Fase Inimiga, quando os inimigos em uma Zona de sua escolha dentro do Alcance 2 se moveriam, você pode gastar 1 Poder para impedi-los de se mover.\",\"red\":\"Sentido Aranha: Sempre que inimigos surgirem dentro do Alcance 2, antes de qualquer Investida, você pode realizar 1 Ação de Ataque ou Movimento gratuita.\"}}}', '2026-10-21 22:42:19', '2026-10-21 22:42:19'),
('58012927-9157-4cfb-b7c4-cbeeb36282a3', 'crossbones', 'Crossbones', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-11-07 22:36:32', '2026-11-07 22:36:32'),
('5ee0061e-c03f-4d23-ab90-58e3160482b7', 'professor_x', 'Professor X', 'Expansão: Sentinel Strike', 1, 1, 1, 3, 'Each Zombie Hero must roll a die at the end of each of their turns. On a 5+, they suffer 1 Wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Mind Bolt\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Telepathic Guidance : Once during your Turn, you may allow 1 other Super Hero to perform 1 free Move or Power-Up Action. Then, resume your Turn.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Mind Bolt\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Telepathic Hunting : Once during your Turn, you may allow 1 other Zombie Hero to perform 1 free Move Action, or move any 1 Bystander 1 Zone in any direction you choose.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Each Zombie Hero must roll a die at the end of each of their turns. On a 5+, they suffer 1 Wound.\"}}', '2026-10-21 22:26:55', '2026-11-07 22:35:53'),
('5f49b73b-2630-4771-8a57-5077473d0f8d', 'moon_knight', 'Moon Knight', 'Marvel Zombies stretch goals box', 1, 1, 1, 4, 'Ativa na fase dos inimigos e executa suas habilidades de zumbi.', '{\"super_hero\":{\"attack\":{\"name\":\"Crescent Darts\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Charging Throw: Once during your Turn, after completing a Move Action, you may spend 1 Poder to perform 1 free Crescent Darts Attack targeting your Zone.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Crescent Darts\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Personality Shift: Each time you devour a Bystander or Enemy, roll a die. On a 1, increase Hunger by 3. On a 2-4, draw 1 Zombie Trait. On a 5-6, perform a Free Action.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Ativa na fase dos inimigos e executa suas habilidades de zumbi.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:37:07'),
('678fe7ba-6f8e-4d2c-be41-6e90fccbc828', 'red_skull', 'Red Skull', 'Marvel Zombies Hydra Resurrection', 1, 0, 1, 5, 'At the end of each Enemy Phase, spawn 2 Hydra Soldiers in his Zone.', '{\"super_hero\":{\"attack\":{\"name\":\"Cosmic Cube\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Teleport : Once during your Turn, you may spend 1 Poder to select 1 Bystander or Super Hero within Range 2 and move them 1 Zone, ignoring Enemies.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":5,\"ability\":\"At the end of each Enemy Phase, spawn 2 Hydra Soldiers in his Zone.\"}}', '2026-11-07 22:35:51', '2026-11-07 22:35:51');
INSERT INTO `definition_mz_characters` (`id`, `code`, `name`, `box_name`, `has_super_hero`, `has_zombie_hero`, `has_boss_enemy`, `boss_health`, `boss_ability`, `profiles`, `created_at`, `updated_at`) VALUES
('67c1e2d0-886e-4d7a-89d6-499dbbb05e4d', 'wolverine', 'Wolverine', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 3, 'If he is eliminated by a non-Devour Attack, lay his model on its side. During his next Activation he stands back up and performs no Actions.', '{\"super_hero\":{\"attack\":{\"name\":\"Adamantium Claws\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Grizzled : Once during your Turn, you may spend 1 Poder to heal 1 Wound OR suffer 1 Wound to gain 4 Poderes.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Hero Spawn\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Undead Rage : When attacking with Adamantium Claws, add +1 to your dice results if you are wounded. For each roll of 6, roll +1 die. These dice may generate additional dice.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"If he is eliminated by a non-Devour Attack, lay his model on its side. During his next Activation he stands back up and performs no Actions.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:02'),
('6e190522-1fff-451c-ae6e-e86ed2e09c8a', 'shang_chi', 'Shang-Chi', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:37:20'),
('6e5772d5-c25e-4fd7-986f-e9717aaa3e88', 'doctor_octopus', 'Doctor Octopus', 'Expansão: Clash of the Sinister Six', 1, 1, 1, 3, 'Can attack from 1 Zone away. If his Zone is attacked but he is not eliminated, the attacker is moved 1 Zone away and suffers 1 Wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Tentacles\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Genius Mastermind : Once during your Turn, you or another Super Hero within Range 2 may draw 1 heroic Trait\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Tentacles\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Undead Intellect : Once during your Turn, you or another Zombie Hero within Range 2 may draw 1 Zombie Trait.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Can attack from 1 Zone away. If his Zone is attacked but he is not eliminated, the attacker is moved 1 Zone away and suffers 1 Wound.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:36:08'),
('6e87b5dc-2667-4ba5-9729-fbef3d360f0b', 'winter_soldier', 'Winter Soldier', 'Marvel Zombies stretch goals box', 1, 1, 1, 4, 'Ativa na fase dos inimigos e executa suas habilidades de zumbi.', '{\"super_hero\":{\"attack\":{\"name\":\"Combat Blade\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Assassinate : Each time you attack with Combat Blade, you may automatically eliminate 1 Walker or Runner in your Zone.\",\"red\":\"+1 action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Spear\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Assassin\'s Reflexes : Each time you eliminate an Enemy or Bystander with a Devour Attack, you may also eliminate 1 Trooper in your Zone.\",\"red\":\"+1 action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Ativa na fase dos inimigos e executa suas habilidades de zumbi.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:37:27'),
('74904af5-8904-4e17-9b34-ab386a28fe3e', 'rogue', 'Rogue', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 4, 'While in her Zone, Zombie Heroes lose all Skills.', '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Knockout Punch : All Enemies suffer -1 Toughness (min 1) against your Mighty Punches Attack. Once during your Turn, you may perform 1 free Open Door Action.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Mighty Punches\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Undead Strength : All Enemies suffer -1 Toughness (min. 1) against your Attacks. Once during your Turn, you may perform 1 free Open Door Action.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"While in her Zone, Zombie Heroes lose all Skills.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:01'),
('7715bf94-c5ba-49c9-bfc3-99dddd87363f', 'luke_cage', 'Luke Cage', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:37:02'),
('7850e100-1f9f-41f7-b1dd-c44653dd8248', 'daredevil_elektra', 'Daredevil Elektra', 'Marvel Zombies stretch goals box', 1, 1, 1, 3, 'Whenever an Extra Activation card is drawn, all Zombie Heroes within Range 2 suffer 1 Wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Baton Sai\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Woman Without Fear : Before attacking with Baton Sai, you may spend 1 Poder to eliminated 1 Brute in the target Zone OR score +1 Hit against a Zombie Hero.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Dual Sai\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Critical Strike : When attacking with Dual Sai, each roll of 6 deals 2 Hits to a single Enemy.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Whenever an Extra Activation card is drawn, all Zombie Heroes within Range 2 suffer 1 Wound.\"}}', '2026-11-07 22:36:18', '2026-11-07 22:36:18'),
('80739a5c-afd5-4db7-a301-61ee564c85da', 'hulk', 'Hulk', 'Caixa Base: Marvel Zombies', 1, 1, 1, 5, 'Can only be eliminated by Devour Attacks.', '{\"super_hero\":{\"attack\":{\"name\":\"Ability : Smash!!!\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Gamma Rage : You have 5 Health. At the start of each of your Turns, gains 1 Poder for each Wound you have suffered.\",\"red\":\"+1 action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Hero Spawn\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Strongest One There Is! : Enemies have -1 Toughness against your Attacks (to a minimum of 1). Unless using Thunderclap, you may reroll any dice if there is a Super Hero in your Zone.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":5,\"ability\":\"Can only be eliminated by Devour Attacks.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:59'),
('86174865-01aa-4914-8d5a-dfde81f4a8fc', 'beast', 'Beast', 'Marvel Zombies Stretch goal box', 1, 1, 1, 3, 'Attacking his Zone at Range 0 suffers -1 to dice results. If his Zone is attacked but he is not eliminated, move him 1 Zone away.', '{\"super_hero\":{\"attack\":{\"name\":\"Claw Swipe\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Genius Intellect : Once during your Turn, you or another Super Hero within Range 2 may draw 1 Heroic Trait.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Claw Swipe\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Zombie Genius : Once during your Turn, you or another Zombie Hero within Range 2 may draw 1 Zombie Trait.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Attacking his Zone at Range 0 suffers -1 to dice results. If his Zone is attacked but he is not eliminated, move him 1 Zone away.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:36:21'),
('86530aa7-d8b6-44f5-b143-1141d3d67244', 'namor', 'Namor', 'Marvel Zombies fantastic 4 Under siege', 1, 1, 1, 5, 'Performs a number of Actions per Activation equal to 1 plus the number of wounded Zombie Heroes in the game (max. 4 Actions).', '{\"super_hero\":{\"attack\":{\"name\":\"Deep Crush\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Vestigial Wings : You ignore Enemies when moving. You may spend 1 Poder when moving to move +1 Zone\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Crush\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Vestigial Wings : You ignore Enemies when moving. If your Hunger Level is 3 or more, move +1 Zone per Move Action\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":5,\"ability\":\"Performs a number of Actions per Activation equal to 1 plus the number of wounded Zombie Heroes in the game (max. 4 Actions).\"}}', '2026-10-21 22:26:57', '2026-11-07 22:35:21'),
('8d5e7b6a-ec87-427e-bd3a-30ab1ff7e379', 'old_man_logan', 'Old Man Logan', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 3, 'If he is eliminated by a non-Devour Attack, lay his model on its side. During his next Activation he stands back up and performs no Actions.', '{\"super_hero\":{\"attack\":{\"name\":\"Adamantium Claws\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Grizzled : Once during your Turn, you may spend 1 Poder to heal 1 Wound OR suffer 1 Wound to gain 4 Poderes.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Hero Spawn\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Undead Rage : When attacking with Adamantium Claws, add +1 to your dice results if you are wounded. For each roll of 6, roll +1 die. These dice may generate additional dice.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"If he is eliminated by a non-Devour Attack, lay his model on its side. During his next Activation he stands back up and performs no Actions.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:36:19'),
('968b2e18-6433-4857-a196-50868630293b', 'nova', 'Nova', 'Marvel Zombies Gardians of the galaxy set', 1, 1, 1, 4, 'Spawns with a number of Troopers according to the highest Danger Level among Zombie Heroes : Blue : 2 / Yellow : 3 / Orange : 4 / Red : 5', '{\"super_hero\":{\"attack\":{\"name\":\"Nova Shots\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Forcefield : Each time Enemies attack your Zone, you may spend 1 Poder. If you do, before assigning Wounds, roll 1 die for each Wound. On a 5+, prevent that wound.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Cosmic Awareness : Each time Enemies spawns within Range 1, before any Rush, you may perform 1 free Nova Shots Attack.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Spawns with a number of Troopers according to the highest Danger Level among Zombie Heroes : Blue : 2 / Yellow : 3 / Orange : 4 / Red : 5\"}}', '2026-10-21 22:26:57', '2026-11-07 22:35:32'),
('9998b5ec-c427-4b7f-8638-128d56d6c425', 'drax', 'Drax', 'Marvel Zombies Gardians of the galaxy set', 1, 1, 1, 4, 'Performs +1 Action for each Zombie Hero at Hunger level 3-4 within Range 2 when he activates.', '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Tyrant Hunter : Each time you would suffer Wounds from Brutes, roll a die. On a 3+, prevent those Wounds. Brutes suffer -1 Toughness (minimum 1) against your Dual Knives Attacks.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Tyrant Devourer : When devouring, you may reroll any misses if there is a Guard or a Super Hero in your Zone. Each time you devour a Guard or a Super Hero, draw 1 Zombie Trait.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Performs +1 Action for each Zombie Hero at Hunger level 3-4 within Range 2 when he activates.\"}}', '2026-10-21 22:26:55', '2026-11-07 22:35:29'),
('9eed0895-90ad-4e91-804a-006cb91765ef', 'old_man_hawkeye', 'Old Man Hawkeye', 'Marvel Zombies HYDRA Resurection', 1, 1, 1, 3, 'Can attack from 3 Zones away. After he attacks, roll a die. On a 5+, he performs a free Attack. This free Attack may trigger further free Attacks.', '{\"super_hero\":{\"attack\":{\"name\":\"Bow & Arrow\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Covering Fire : Once during each other Super Hero\'s turn, if they are within Range 2, after they completed an Attack, you may eliminate 1 Walker in their Zone.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Arrows\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Expert Marksman : You ingore Target Priority. Each time you attack with Arrows, you may increase Hunger by 1 to increase Range by 1.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Can attack from 3 Zones away. After he attacks, roll a die. On a 5+, he performs a free Attack. This free Attack may trigger further free Attacks.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:36:15'),
('9f829f7b-08f5-4681-ad44-9fc2b83222a8', 'mysterio', 'Mysterio', 'Caixa Base: Marvel Zombies', 1, 1, 1, 3, 'Zombie Heroes must spend +1 Action whenever they attacks his Zone.', '{\"super_hero\":{\"attack\":{\"name\":\"Hand-to-Hand\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Illusionary Foes : During your Turn, you may spend 1 Action and 1 Poder to select 1 Zone within Range 2. Eliminate 2 Walkers or Runners there. If there is a Brute or Zombie Hero in that Zone, eliminate 1 additional Walker or Runner there.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Hand-to-Hand\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Illusionary Enemy : Once during your Turn, you may spend 1 Action and increase Hunger to select 1 Enemy within Range 1. That Enemy suffers 1 Hit for each other Enemy in their Zone.\",\"red\":\"+1 action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Zombie Heroes must spend +1 Action whenever they attacks his Zone.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:56'),
('a683b71d-c9e8-4256-bbc7-16d4799deb02', 'gambit', 'Gambit', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:36:44'),
('ad44c73e-8957-4ebb-98c8-64c85cd22b39', 'wasp', 'Wasp', 'Caixa Base: Marvel Zombies', 1, 1, 1, 3, 'Attacks against her Zone always have Accuracy 5+.', '{\"super_hero\":{\"attack\":{\"name\":\"Ability\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Diminutive Size : Ignore target priority when attacking. Do not spend extra actions when leaving Zones with enemies.\",\"red\":\"+1 action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Diminutive Size : You may ignore Target Priority when attacking with either Wasp\'s Sting or Devour.\",\"red\":\"+1 action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Attacks against her Zone always have Accuracy 5+.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:56'),
('b171a98b-d920-42a1-a655-0172cdd0b22e', 'morbius', 'Morbius', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:37:09'),
('b49a9260-155e-4d30-920b-68d9746f0cd3', 'baron_zemo', 'Baron Zemo', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:36:20'),
('b4a81d40-4ba7-410a-92a2-dd0a9f5079b7', 'loki', 'Loki', 'Marvel Zombies HYDRA Resurection', 1, 1, 1, 4, 'If his Zone is attacked, but he is not eliminated, spawn 1 Trooper there. Then, move Loki 1 Zone away.', '{\"super_hero\":{\"attack\":{\"name\":\"Scepter\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Not Who You Expected : Once during your turn, you may spend 1 Poder to select 1 Super Hero or Bystander within Range 2. Switch the positions of Loki and that Super Hero/Bystander.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Scepter\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Shapeshift : At the end of your Turn, if there are no Enemies in your Zone, you may have all Enemies ignore you during the next Enemy Phase.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"If his Zone is attacked, but he is not eliminated, spawn 1 Trooper there. Then, move Loki 1 Zone away.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:48'),
('b7d678be-c928-4e02-b207-b5f5e33a402f', 'spider_woman', 'Spider-Woman', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:37:21'),
('bac69a30-d672-4d0c-9dcb-e5e736294df7', 'blade', 'Blade', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:36:25'),
('bb80d84d-10a5-45cc-abe6-cd8d25eeaeb2', 'mantis', 'Mantis', 'Marvel Zombies Gardians of the galaxy set', 1, 1, 1, 3, 'Zombie Heroes within Range 1 are considered Ravenous at Hunger 3.', '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Meditate : Once during your Turn, you may gain 1 Poder or draw 1 Heroic Trait\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Combat Reflexes : Each time Enemies move into your Zone, you may increase Hunger to perform 1 free Martial Arts Attack.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Zombie Heroes within Range 1 are considered Ravenous at Hunger 3.\"}}', '2026-11-07 22:35:30', '2026-11-07 22:35:30'),
('bd57eaa4-b033-45c1-80b2-40a83b601ad6', 'emma_frost', 'Emma Frost', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:36:43'),
('be9ca9b8-deef-41a7-b44f-a34612295c9c', 'magneto', 'Magneto', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 3, 'When he activates, move all Zombie Heroes within Range 2 into his Zone.', '{\"super_hero\":{\"attack\":{\"name\":\"Shrapnel\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Crush : Once during your Turn, you may spend 1 Poder to automatically eliminate 1 Walker or Runner, or 2 Poderes to eliminate 1 Brute, in a Zone within Range 1.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Shrapnel\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Magnetic Pull : Once during your Turn, you may increase Hunger to select 1 Bystander, Enemy, or Zombie Hero within Range 2 and move them into your Zone.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"When he activates, move all Zombie Heroes within Range 2 into his Zone.\"}}', '2026-11-07 22:35:03', '2026-11-07 22:35:03'),
('beca033e-49fa-4961-9c14-0b4cbf4b5992', 'ms_marvel', 'Ms. Marvel', 'Caixa Base: Marvel Zombies', 1, 1, 1, 3, 'Can Attack Zombie Heroes from 3 Zones away, regardless of Lines of Sight (walls still block it).', '{\"super_hero\":{\"attack\":{\"name\":\"Ability\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Grab : Once during your Turn, you may spend 1 Poder to select 1 Bystander or Super Hero within Range 1 and move them into your Zone, ignoring Enemies.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Oversized Fist\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Grab : Once during your Turn, you may increase Hunger to select 1 Bystander, Enemy, or Zombie Hero within Range 1 and move them into your Zone.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Can Attack Zombie Heroes from 3 Zones away, regardless of Lines of Sight (walls still block it).\"}}', '2026-10-21 22:26:56', '2026-11-07 22:34:52'),
('c0079bc0-aa30-4449-ac3b-f7d632e981d6', 'doctor_doom', 'Doctor Doom', 'Marvel Zombies fantastic 4 Under siege', 1, 1, 1, 5, 'During each End Phase, shuffle all Extra Activation, Rush, and Special Action Spawn cards back into the deck.', '{\"super_hero\":{\"attack\":{\"name\":\"Lightning\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Behold the Might of Doom : Each time you eliminate a Zombie Hero, draw 1 Heroic Trait. Once during your Turn, you may discard 1 Heroic Trait to gain 2 Poderes.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Lightning\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Doom Does Not Yield!!! : Each time you eliminate a Super Hero, draw 1 Zombie Trait. During your Turn, you may discard 2 Zombie Traits to reduce your Hunger by any amount.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":5,\"ability\":\"During each End Phase, shuffle all Extra Activation, Rush, and Special Action Spawn cards back into the deck.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:35:18'),
('c333b8e6-e85b-4895-835a-3230db4591c7', 'giant_man', 'Giant-Man', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:57', '2026-11-07 22:36:48'),
('c5247285-de0a-472a-8434-ac9d79b59696', 'sabretooth', 'Sabretooth', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 4, 'Zombie Heroes attacking in his Zone suffer 1 Wound for each 1 result.', '{\"super_hero\":{\"attack\":{\"name\":\"Feral Claws\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Claw Frenzy : When attacking with Feral Claws, for each roll of 6, roll +1 die. These dice may generate additional dice.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Feral Claws\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Claw Frenzy : When attacking with Feral Claws (after any rerolls), for each roll of 6, roll +1 die. These dice may generate additional dice.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Zombie Heroes attacking in his Zone suffer 1 Wound for each 1 result.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:12'),
('c7c73865-2a46-4dd2-a31b-ee073e189b0b', 'hawkeye', 'Hawkeye', 'Marvel Zombies HYDRA Resurection', 1, 1, 1, 3, 'Can attack from 3 Zones away. After he attacks, roll a die. On a 5+, he performs a free Attack. This free Attack may trigger further free Attacks.', '{\"super_hero\":{\"attack\":{\"name\":\"Bow & Arrow\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Covering Fire : Once during each other Super Hero\'s turn, if they are within Range 2, after they completed an Attack, you may eliminate 1 Walker in their Zone.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Arrows\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Expert Marksman : You ingore Target Priority. Each time you attack with Arrows, you may increase Hunger by 1 to increase Range by 1.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Can attack from 3 Zones away. After he attacks, roll a die. On a 5+, he performs a free Attack. This free Attack may trigger further free Attacks.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:45'),
('cab004b2-1e34-4867-8e28-f647cb6e52ce', 'the_thing', 'The Thing', 'Marvel Zombies fantastic 4 Under siege', 1, 1, 1, 5, 'Each time he would be eliminated, roll a die. On a 5+, he is not eliminated.', '{\"super_hero\":{\"attack\":{\"name\":\"Pulverize\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Toughness and Willpower : You have 5 Health. When you would suffer a Wound, you may discard 1 Heroic Trait to ignore it.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Pulverize\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Rock Solid : Enemies suffer -1 Toughness against your Attacks (min 1). While Ravenous, you cannot suffer Wounds from Troopers or Specialists.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":5,\"ability\":\"Each time he would be eliminated, roll a die. On a 5+, he is not eliminated.\"}}', '2026-10-21 22:26:55', '2026-11-07 22:35:16'),
('cbad2b58-d5ad-43e4-9d35-313a17031b09', 'black_bolt', 'Black Bolt', 'Marvel Zombies fantastic 4 Under siege', 1, 1, 1, 4, 'Zombie Heroes within Range 2 and in Line of Sight lose their Skills beyond Blue Level.', '{\"super_hero\":{\"attack\":{\"name\":\"Particle Shot\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Particle Channel : Each time you attack with Particle Shot, you may automatically eliminate 1 Walker or Runner in the targeted Zone.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Particle Shot\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Medusa\'s Lash : Each time you attack with Particle Shot, you may automatically eliminate 1 Trooper or Specialist in the Target Zone.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Zombie Heroes within Range 2 and in Line of Sight lose their Skills beyond Blue Level.\"}}', '2026-10-21 22:26:57', '2026-11-07 22:35:22'),
('cf90b5fc-067c-4402-947e-c9c718ed416e', 'multiple_man', 'Multiple Man', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:58', '2026-11-07 22:37:31'),
('cffac2cb-24b7-456d-a2af-8f7373f424eb', 'mystique', 'Mystique', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 3, 'Each time she activates, draw a Super Hero card. That is the ability she has until the start of the next Enemy Phase. At that point, reshuffle the extra card back into the Super Hero deck.', '{\"super_hero\":{\"attack\":{\"name\":\"Adaptative Weapons\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Shapeshift : At the end of your Turn, if there are no Enemies in your Zone, you may spend 1 Poder. If you do, Enemies ignore you during the next Enemy Phase.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Adaptative Weapons\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Shapeshift : At the end of your Turn, if there are no Enemies in your Zone, you may increase Hunger to have all Enemies ignore you during the next Enemy Phase.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Each time she activates, draw a Super Hero card. That is the ability she has until the start of the next Enemy Phase. At that point, reshuffle the extra card back into the Super Hero deck.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:05'),
('d425cd0c-ce7f-434c-a62e-3fe0689135d0', 'black_knight', 'Black Knight', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-11-07 22:36:24', '2026-11-07 22:36:24'),
('d984c84b-4327-4004-aa9e-dda95ebfc535', 'super_skrull', 'Super Skrull', 'Marvel Zombies fantastic 4 Under siege', 1, 1, 1, 4, 'Can attack from 1 Zone away. If his Zone is attacked but he is not eliminated, the attacker suffers 1 Wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Cosmic mimicry\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Elongation : When attacking with cosmic Mimicry, you may spend any amount of * to gain that much additional Range. This Attack doesn\'t require Line of Sight, being able to go around corners but not through walls.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Cosmic Mimicry\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":3},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Elongation : Cosmic Mimicry gain additionnal Range equal to your Hunger level. This Attack doesn\'t require Line of Sight, being able to go around corners but not through walls.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Can attack from 1 Zone away. If his Zone is attacked but he is not eliminated, the attacker suffers 1 Wound.\"}}', '2026-10-21 22:26:55', '2026-11-07 22:35:17'),
('dd0dbbe2-3662-4c20-aae2-a2e7d637853a', 'marshall_bullseye', 'Marshall Bullseye', 'Marvel Zombies stretch goals box', 1, 1, 1, 3, 'His attacks have unlimited Range (but still require Line of Sight).', '{\"super_hero\":{\"attack\":{\"name\":\"Dual Sai\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Worthy Target : Zombies Heroes have -1 toughness (min. 1) against your Dual Sai Attacks. Each time you eliminate a Zombie Hero, perform 1 free Action.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Throwing Knives\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"I Never Miss! : You ignore Target Priority when attacking with Throwing Knives. After rolling, you may increase Hunger to reroll any misses.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"His attacks have unlimited Range (but still require Line of Sight).\"}}', '2026-11-07 22:36:16', '2026-11-07 22:36:16'),
('e32c1008-a5a4-4cf4-b2ba-89e0273e1b16', 'dark_phoenix', 'Dark Phoenix', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 4, 'Each time she is eliminated, spawn her on the First Spawn Point during the next End Phase.', '{\"super_hero\":{\"attack\":{\"name\":\"Psychic Bolts\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Telekinesis : Once during your Turn, you may spend 1 Poder to have yourself or another Super Hero within Range 1 perform 1 free Move Action.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Psychic bolts\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Telekinesis : Once during your Turn, you may select 1 Bystander, Enemy or Zombie Hero within Range 2 and move them 1 Zone.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Each time she is eliminated, spawn her on the First Spawn Point during the next End Phase.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:09'),
('e76c9a05-b180-4e02-b7f9-5f06b22bb105', 'homem_aranha', 'Homem-Aranha', 'Caixa Base: Marvel Zombies', 1, 0, 1, 4, 'Cada vez que um Herói Zumbi entrar em uma Zona com um Espectador, role um dado. Com um resultado de 5 ou mais, faça surgir 1 Super-Herói nessa Zona.', '{\"super_hero\":{\"attack\":{\"name\":\"Acrobacias\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"Estilingue de Teia : Uma vez durante o seu turno, você pode gastar 1 Poder para se mover até 2 zonas, ignorando inimigos.\",\"yellow\":\"+1 ação\",\"orange\":\"Lançadores de Teia : Uma vez durante cada Fase Inimiga, quando os Inimigos em uma Zona de sua escolha dentro do Alcance 2 se moveriam, você pode gastar 1 Poder para impedi-los de se mover.\",\"red\":\"Sentido Aranha : Sempre que inimigos surgirem dentro do Alcance 2, antes de qualquer Investida, você pode realizar 1 Ação de Ataque ou Movimento gratuita.\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Cada vez que um Herói Zumbi entrar em uma Zona com um Espectador, role um dado. Com um resultado de 5 ou mais, faça surgir 1 Super-Herói nessa Zona.\"}}', '2026-10-21 22:44:56', '2026-10-21 22:44:56'),
('ed515f64-8e7e-4bd3-aeb3-5a92c67ebe3b', 'she_hulk', 'She-Hulk', 'Marvel Zombies HYDRA Resurection', 1, 1, 1, 4, 'Has +1 Move Action per Activation. Her Attacks deal 2 Wounds.', '{\"super_hero\":{\"attack\":{\"name\":\"Gamma Punches\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Gamma Strength : You have 5 health. When attacking with Gamma Punches, you may spend 2 Poderes. If you do, roll only 1 die (no bonuses possible). A successful roll scores 4 Hits against a single Enemy.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Gamma Punches\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Gamma Strength : Enemies have -1 Toughness against your Attacks (to a minimum of 1). Once during your Turn, you may perform 1 free Open Door Action.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Has +1 Move Action per Activation. Her Attacks deal 2 Wounds.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:41'),
('edb66233-7ac1-45b2-af2c-4b299fd6ed18', 'black_widow', 'Black Widow', 'Marvel Zombies HYDRA Resurection', 1, 1, 1, 3, 'Spawns in the Zone with the last Zombie Hero that activated, then rolls 1 die. On a 4+, they suffer 1 Wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Assassinate : Each time you attack with Widow\'s bite, you may eliminate 1 Walker or Runner in the targeted Zone.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Quick Bite : Each time you attack with Widow\'s Bite, you may eliminate 1 Trooper or Specialist in your Zone and reduce Hunger by 1.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Spawns in the Zone with the last Zombie Hero that activated, then rolls 1 die. On a 4+, they suffer 1 Wound.\"}}', '2026-11-07 22:35:39', '2026-11-07 22:35:39'),
('f014cf41-91fa-4858-bb6a-5a1acd134f63', 'storm', 'Storm', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 3, 'She attacks from Range 1, dealing 1 Wound to ALL Zombie Heroes within Range 1 each time she attacks.', '{\"super_hero\":{\"attack\":{\"name\":\"Lightning Bolt\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Gust : Once during your Turn, you may spend 1 Poder and select a Zone within Range 1. Move all Enemies in that Zone into a Zone adjacent to it.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Lightning Bolt\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Gust : Once during your Turn, you may increase Hunger and select a Zone within Range 1. Move all Enemies in that Zone into a Zone adjacent to it.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"She attacks from Range 1, dealing 1 Wound to ALL Zombie Heroes within Range 1 each time she attacks.\"}}', '2026-11-07 22:35:04', '2026-11-07 22:35:04'),
('f0ab9dd1-9473-4683-9902-1e44eced99d0', 'nebula', 'Nebula', 'Marvel Zombies Gardians of the galaxy set', 1, 1, 1, 3, 'Can attack from 1 Zone away. When eliminated, 1 Zombie Hero in her Zone suffers 1 Wound.', '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Sniper : You ignore Target Priority. Before attacking with Targeting Rifle, you may spend any amount of * to gain that much additional Range.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Killing Strike: Before attacking with Electro-Staff, you may choose to roll only 1 die (no bonuses possible). Add +2 to the die results. A successful roll deals a number of Hits equals to your Hunger level.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Can attack from 1 Zone away. When eliminated, 1 Zombie Hero in her Zone suffers 1 Wound.\"}}', '2026-11-07 22:35:31', '2026-11-07 22:35:31'),
('f1c57acf-fb1a-4db2-bc55-07c89d9b19ef', 'kraven', 'Kraven', 'Caixa Base: Marvel Zombies', 1, 1, 1, 3, 'When moving and attacking, he exclusively targets the Zombie Hero with the most XP. If that Hero activates within Range 2, they Lose 1 Action.', '{\"super_hero\":{\"attack\":{\"name\":\"Spear\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Choice Prey : If there\'s a Zombie Hero within Range 2 at the start of your Turn, you may perform 1 free Power-Up Action. You may reroll any misses when attacking Zones containing Zombie Heroes.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"When moving and attacking, he exclusively targets the Zombie Hero with the most XP. If that Hero activates within Range 2, they Lose 1 Action.\"},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Choice Prey : When you activate, if there are any Super Heroes within Range 2, you may draw 1 Zombie Trait. You may reroll any misses when attacking Zones containing Super Heroes.\",\"red\":\"+1 Action\"}}}', '2026-10-21 22:26:57', '2026-11-07 22:35:58'),
('fad14573-6290-40ed-a612-a5cd4e9b755b', 'falcon', 'Falcon', 'Marvel Zombies HYDRA Resurection', 1, 1, 1, 3, 'When he spawns, he immediately moves up to 2 Zones, if possible. Ranged Attacks against his Zone suffer -1 to dice results.', '{\"super_hero\":{\"attack\":{\"name\":\"Ataque Padrão\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Redwing Scouting : Once during each Enemy Phase, before drawing a Spawn card, you may spend 1 Poder. If you do, draw 2 Spawn cards instead, choose 1, and discard the other.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Devour\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Redwing companion : You may reroll 1 die each time you Attack. Each time an Enemy or Bystander within Range 1 is Devoured, you may reduce Hunger by 1.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"When he spawns, he immediately moves up to 2 Zones, if possible. Ranged Attacks against his Zone suffer -1 to dice results.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:44'),
('fcb930ba-49c8-407c-a5c1-8ebc913731f8', 'juggernaut', 'Juggernaut', 'Marvel Zombies X-men Resistance core box', 1, 1, 1, 4, 'Ativa na fase dos inimigos e executa suas habilidades de zumbi.', '{\"super_hero\":{\"attack\":{\"name\":\"Body Slam\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Know Who I Am? : You have 5 Health. Once during your Turn, you may spend 1 Poder to perform 1 free Move Action and 1 free Open Door Action.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Body Slam\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Undead Stamina : Once during your Turn, you may increase Hunger to perform 1 free Melee Attack or Move Action.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":4,\"ability\":\"Ativa na fase dos inimigos e executa suas habilidades de zumbi.\"}}', '2026-10-21 22:26:56', '2026-11-07 22:35:07'),
('fd5eb876-9b16-4af2-ad03-afc7854967c9', 'war_machine', 'War Machine', 'Caixa Promocional: Kickstarter Promos', 0, 0, 0, NULL, NULL, '{}', '2026-10-21 22:26:58', '2026-11-07 22:37:25'),
('fdd1e2ce-bdb3-478a-9a0d-df833a2a8c9f', 'daredevil', 'Daredevil', 'Marvel Zombies stretch goals box', 1, 1, 1, 3, 'After a Bystander is devoured, Daredevil immediately performs 2 Actions.', '{\"super_hero\":{\"attack\":{\"name\":\"Baton Strike\",\"range\":\"0\",\"dice\":3,\"accuracy\":4},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Know Fear : Whenever you eliminate a Brute or a Zombie Hero, you may draw 1 Hero Trait.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"After a Bystander is devoured, Daredevil immediately performs 2 Actions.\"},\"zombie_hero\":{\"attack\":{\"name\":\"Baton Rush\",\"range\":\"Melee\",\"dice\":3,\"accuracy\":1},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Beatdown : When attacking with Baton Rush, for each roll of 6, roll +1 die. These dice may generate additional dice.\",\"red\":\"+1 Action\"}}}', '2026-10-21 22:26:57', '2026-11-07 22:36:14'),
('ffc6b923-0398-43ee-9d27-2d2c755baa32', 'ant_man', 'Ant-Man', 'Marvel Zombies HYDRA Resurection', 1, 1, 1, 3, 'Always last in Target Priority. His Attacks target all Zombie Heroes in his Zone.', '{\"super_hero\":{\"attack\":{\"name\":\"Bio-electric Blast\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"5\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Diminutive Size : You ignore Target Priority. Do not spend extra Actions when leaving Zones with Enemies.\",\"red\":\"+1 Action\"}},\"zombie_hero\":{\"attack\":{\"name\":\"Giant Fists\",\"range\":\"Distance\",\"dice\":3,\"accuracy\":2},\"skills\":{\"blue\":\"rowspan=\\\"8\\\" style=\\\"width: 20%;\\\" |center|200px\",\"yellow\":\"-\",\"orange\":\"Giant Size, Giant Hunger : You move +1 Zone per Move Action. Your Devour Attack rolls +2 dice and may eliminate multiple Enemies.\",\"red\":\"+1 Action\"}},\"boss_enemy\":{\"health\":3,\"ability\":\"Always last in Target Priority. His Attacks target all Zombie Heroes in his Zone.\"}}', '2026-11-07 22:35:40', '2026-11-07 22:35:40');

-- --------------------------------------------------------

--
-- Estrutura para tabela `definition_skills`
--

CREATE TABLE `definition_skills` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) NOT NULL,
  `class_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tier` int(11) NOT NULL DEFAULT 1,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `mana_cost` int(11) DEFAULT 0,
  `cooldown_turns` int(11) DEFAULT 0,
  `required_skill_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `xp_cost_to_unlock` int(11) DEFAULT 100,
  `damage_multiplier` float DEFAULT 1,
  `heal_amount` int(11) DEFAULT 0,
  `effect_type` varchar(50) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `animation_id` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `definition_skills`
--

INSERT INTO `definition_skills` (`id`, `code`, `class_id`, `tier`, `name`, `description`, `mana_cost`, `cooldown_turns`, `required_skill_id`, `xp_cost_to_unlock`, `damage_multiplier`, `heal_amount`, `effect_type`, `icon`, `animation_id`, `created_at`, `updated_at`) VALUES
('0e01d605-1f8c-4ef3-8a82-4464aa5d6946', 'skill_charging_star', '6cacfc3a-d5fa-4860-bc50-c2c2bcf91359', 3, 'Charging Star', 'Investida supersônica com barreira de vibranium. Causa alto dano e concede postura defensiva.', 35, 3, NULL, 100, 2.3, 0, 'CHARGE_SHIELD', '🚀', 4, '2026-09-04 21:32:27', '2026-09-04 21:32:27'),
('1d2317b1-f0c7-497e-8316-f5d4467eaa09', 'skill_optic_blast', '34b41dbe-c51b-441a-8aa5-49512d8c814d', 1, 'Optic Blast', 'Disparo concentrado de feixe de laser pelo visor em linha reta. Alto dano mágico contínuo.', 15, 1, NULL, 100, 1.55, 0, 'LASER_BEAM', '🔴', 2, '2026-09-04 21:32:27', '2026-09-04 21:32:27'),
('2e34f1cf-7f5f-4eb5-b65c-9b112823d7a0', 'skill_torre_sucata', '3036c7eb-83bf-4dbf-bf75-0d851c084efd', 1, 'Torre de Sucata', 'Monta uma torreta mecânica que dispara contra o inimigo automaticamente.', 25, 3, NULL, 100, 1.2, 0, 'SUMMON', 'turret', 1, '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('3320a8a7-e3a8-4e26-baec-ab135909e5e3', 'skill_disparo_certeiro', 'fede86d8-0db2-4c7d-a6bc-0e4b869146cf', 1, 'Disparo Certeiro', 'Tiro de precisão à distância com chance dobrada de acerto crítico.', 15, 1, NULL, 100, 1.6, 0, 'CRITICAL_SHOT', 'bullseye', 2, '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('4b863d52-d4cf-40e8-a86d-11d4625695ca', 'skill_shield_slash', '6cacfc3a-d5fa-4860-bc50-c2c2bcf91359', 1, 'Shield Slash', 'Arremesso giratório do escudo de vibranium. Ignora 30% da armadura inimiga.', 15, 1, NULL, 100, 1.5, 0, 'PROJECTILE_PHYSICAL', '🛡️', 1, '2026-09-04 21:32:27', '2026-09-04 21:32:27'),
('683250f9-37f8-4efc-b320-e803832e415e', 'skill_postura_firme', '6cacfc3a-d5fa-4860-bc50-c2c2bcf91359', 1, 'Postura Firme', 'Reduz o dano sofrido no próximo turno e atrai a atenção dos inimigos.', 10, 1, NULL, 100, 0.5, 0, 'TAUNT', 'firm_stance', 1, '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('8f157594-0e4d-4f9a-84d3-29b889c6e5b0', 'skill_gene_splice', '34b41dbe-c51b-441a-8aa5-49512d8c814d', 3, 'Gene Splice', 'Gancho aéreo devastador envolto por uma cápsula de plasma vermelho com alta taxa crítica.', 35, 3, NULL, 100, 2.4, 0, 'PLASMA_UPPERCUT', '⚡', 3, '2026-09-04 21:32:27', '2026-09-04 21:32:27'),
('ae593ce8-00fe-48da-8f1f-2bd0417d93b7', 'skill_stars_stripes', '6cacfc3a-d5fa-4860-bc50-c2c2bcf91359', 2, 'Stars & Stripes', 'Gancho ascendente com escudo e rastro de poeira estelar. 45% de chance de atordoar (Stun).', 25, 2, NULL, 100, 1.9, 0, 'STUN_ATTACK', '⭐', 3, '2026-09-04 21:32:27', '2026-09-04 21:32:27'),
('c01dd339-3ebc-4405-b161-6e09bdd08164', 'skill_analise_tatica', '34b41dbe-c51b-441a-8aa5-49512d8c814d', 1, 'Análise Tática', 'Analisa fraquezas do chefe, concedendo dano extra a todos no próximo turno.', 15, 3, NULL, 100, 0, 0, 'BUFF_TEAM_DAMAGE', 'tactical_eye', 1, '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('ce31511a-1119-4026-bcff-c72ecafbddb8', 'skill_muralha_domestica', '6cacfc3a-d5fa-4860-bc50-c2c2bcf91359', 1, 'Muralha Doméstica', 'Cria uma barreira protetora que absorve dano direcionado aos aliados.', 15, 2, NULL, 100, 0, 0, 'SHIELD', 'shield_barrier', 1, '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('cf34e020-65ce-41d3-971d-1c20c1369a68', 'skill_optic_sweep', '34b41dbe-c51b-441a-8aa5-49512d8c814d', 2, 'Optic Sweep', 'Varredura óptica rasteira que atinge o solo levantando faíscas e atrasando o turno do adversário.', 25, 2, NULL, 100, 1.8, 0, 'GROUND_BEAM', '🔻', 5, '2026-09-04 21:32:27', '2026-09-04 21:32:27'),
('d2e01bfd-4cfb-4d96-b146-8792160b3c21', 'skill_ataque_relampago', 'c9d49be2-a865-49fa-8c4b-5093a9844c27', 1, 'Ataque Relâmpago', 'Golpe ultrarrápido com chance de acertar duas vezes seguidas.', 15, 1, NULL, 100, 1.4, 0, 'PHYSICAL_DAMAGE', 'lightning_strike', 3, '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('e262fa2f-5164-4ec7-974d-62207c2555dc', 'skill_raio_conhecimento', '34b41dbe-c51b-441a-8aa5-49512d8c814d', 1, 'Raio de Conhecimento', 'Disparo mágico elemental concentrado de longo alcance.', 20, 1, NULL, 100, 1.8, 0, 'MAGIC_DAMAGE', 'arcane_bolt', 2, '2026-08-31 02:35:30', '2026-08-31 02:35:30'),
('f5469738-3815-4a97-be06-5f4dab2dbc72', 'skill_abraco_revitalizante', 'b5ae65dc-800e-46f3-b28d-af9d7f334162', 1, 'Abraço Revitalizante', 'Restaura a saúde de um aliado ferido com energia acolhedora.', 20, 2, NULL, 100, 0, 50, 'HEAL', 'healing_heart', 1, '2026-08-31 02:35:30', '2026-08-31 02:35:30');

-- --------------------------------------------------------

--
-- Estrutura para tabela `definition_tasks`
--

CREATE TABLE `definition_tasks` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `slug` varchar(100) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('DOMESTIC','STUDY','HEALTH','CREATIVE','SOCIAL') NOT NULL DEFAULT 'DOMESTIC',
  `difficulty` enum('EASY','MEDIUM','HARD') NOT NULL DEFAULT 'EASY',
  `allowed_profile` enum('ALL','CHILD_ONLY','ADULT_ONLY') NOT NULL DEFAULT 'ALL',
  `reward_xp` int(11) NOT NULL DEFAULT 10,
  `reward_gold` int(11) NOT NULL DEFAULT 5,
  `reward_energy` int(11) NOT NULL DEFAULT 1,
  `estimated_time` varchar(50) DEFAULT NULL,
  `requires_proof` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `definition_tasks`
--

INSERT INTO `definition_tasks` (`id`, `slug`, `name`, `description`, `category`, `difficulty`, `allowed_profile`, `reward_xp`, `reward_gold`, `reward_energy`, `estimated_time`, `requires_proof`, `created_at`, `updated_at`) VALUES
('0a16bc93-4e02-41ee-bd96-e7e0b3a29279', 'aprender-algo-novo', 'Aprender Algo Novo', 'Assistir a um vídeo educativo, tutorial ou curso por pelo menos 30 minutos.', 'STUDY', 'MEDIUM', 'ALL', 50, 30, 2, '30 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('0de0b963-f450-4406-b7c1-ad90dc0eff89', 'escovar-dentes', 'Escovar os Dentes (3x ao dia)', 'Escovar os dentes após o café, almoço e jantar.', 'HEALTH', 'EASY', 'ALL', 10, 5, 1, '5 min', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('107d594a-0bc7-4140-bcb8-bcda85b5e976', 'momento-familia', 'Participar de um Momento em Família', 'Jogar um jogo de tabuleiro, assistir a um filme ou fazer uma atividade juntos.', 'SOCIAL', 'MEDIUM', 'ALL', 50, 30, 2, '30-60 min', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('144320b6-7de6-49e4-9912-cf14471288c6', 'ligar-parente', 'Ligar ou Mandar Mensagem para um Parente', 'Entrar em contato com avós, tios ou primos de forma carinhosa.', 'SOCIAL', 'MEDIUM', 'ALL', 35, 20, 2, '15 min', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('1c5b9647-62cc-4e3a-9bc2-94b5a1d4dcab', 'artesanato-peca', 'Concluir uma Peça de Artesanato', 'Finalizar uma peça artesanal completa (crochê, pintura, bijuteria, etc.).', 'CREATIVE', 'HARD', 'ADULT_ONLY', 130, 90, 4, '60+ min', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('23c3369d-4fd7-4e1b-bb36-502aab3a59bb', 'alimentar-pet', 'Abastecer Água e Ração do Pet', 'Lavar e encher os potinhos de comida e água do animal de estimação.', 'DOMESTIC', 'EASY', 'ALL', 15, 10, 1, '5-10 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('25dbb528-6185-4414-8568-97d049e1b13d', 'passar-pano-casa', 'Passar Pano no Chão da Casa', 'Utilizar balde e rodo/mop em todas as áreas comuns (sala, cozinha e corredores).', 'DOMESTIC', 'HARD', 'ALL', 100, 70, 4, '40-60 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('3005948a-ebd6-486f-bda3-0646093a4aa0', 'beber-agua', 'Beber Água ao Longo do Dia', 'Consumir pelo menos 1,5 litro de água durante o dia.', 'HEALTH', 'EASY', 'ALL', 15, 8, 1, 'Dia inteiro', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('30b5abb9-2444-4fa7-9d8a-37f4390efc3a', 'ler-20min', 'Ler por 20 Minutos', 'Ler qualquer livro, revista ou artigo educativo por pelo menos 20 minutos seguidos.', 'STUDY', 'EASY', 'ALL', 30, 15, 1, '20 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('3e9a56b8-eb83-47a6-8ef6-d3daf334c69c', 'regar-plantas', 'Regar as Plantas da Casa', 'Colocar a quantidade certa de água nos vasos da sala ou varanda.', 'DOMESTIC', 'EASY', 'ALL', 15, 5, 1, '5-10 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('41ff792e-fb1c-40e8-9ca1-310f435b8286', 'revisar-caderno', 'Revisar o Caderno do Dia', 'Ler e organizar as anotações feitas em sala de aula no dia.', 'STUDY', 'EASY', 'CHILD_ONLY', 20, 10, 1, '15-20 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('4485131b-a081-4a18-919c-f4b66fd73b13', 'roupa-suja-no-cesto', 'Roupa Suja no Cesto', 'Colocar as roupas do dia no cesto apropriado, sem deixar nenhuma peça no chão.', 'DOMESTIC', 'EASY', 'ALL', 10, 5, 1, '5 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('44b7194a-a0bf-4111-94e3-a96e45f5f961', 'lavar-quintal', 'Lavar o Quintal ou Garagem', 'Varrer folhas secas, jogar água e esfregar o piso com vassoura pesada.', 'DOMESTIC', 'HARD', 'ALL', 120, 85, 4, '45-60 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('53cbe771-654b-4a5e-b1ae-072a4e9fb643', 'limpar-poeira', 'Limpar a Poeira dos Móveis', 'Passar pano seco ou espanador nas mesas, estantes e bancadas de toda a casa.', 'DOMESTIC', 'MEDIUM', 'ALL', 30, 15, 2, '15-20 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('5dd66c28-9c57-4ee9-92c3-0ac98bf9c6ba', 'pedir-desculpa', 'Pedir Desculpa Quando Errar', 'Reconhecer um erro e pedir desculpa sincera à pessoa afetada.', 'SOCIAL', 'EASY', 'ALL', 20, 10, 1, '—', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('5e496456-eadb-4458-8cc2-7847bb9391bb', 'desenhar', 'Desenhar ou Colorir', 'Criar um desenho ou colorir uma ilustração por pelo menos 20 minutos.', 'CREATIVE', 'MEDIUM', 'ALL', 40, 25, 2, '20-30 min', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('60ad91e1-2a3a-4453-bb1f-80ee9a602dc2', 'limpar-banheiro', 'Higienização do Banheiro', 'Limpar pia, espelho, recolher o lixo e higienizar o vaso sanitário.', 'DOMESTIC', 'HARD', 'ALL', 120, 80, 4, '30-45 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('62b8a54b-737a-440f-b932-3caa8158b760', 'preparar-refeicao', 'Preparar uma Refeição Familiar', 'Cozinhar um prato completo para a família (ex: omelete, massa, salada, lanche).', 'DOMESTIC', 'HARD', 'ADULT_ONLY', 110, 75, 4, '40-60 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('685a7c2e-7edb-4cf3-be72-20e1ec590aed', 'projeto-criativo-completo', 'Concluir um Projeto Criativo', 'Finalizar um projeto de arte, design, música ou escrita do início ao fim.', 'CREATIVE', 'HARD', 'ALL', 120, 80, 4, '60+ min', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('6beb1eb7-f392-4b8d-8a8b-4b3a9828fcfe', 'projeto-escolar', 'Concluir um Projeto Escolar', 'Finalizar uma etapa importante de um trabalho escolar ou apresentação.', 'STUDY', 'HARD', 'CHILD_ONLY', 130, 90, 4, '60+ min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('6d420174-69cd-4775-b1a4-1875d9a4f599', 'limpeza-quarto', 'Limpeza Geral do Quarto', 'Varrer, passar pano no chão, organizar guarda-roupa, trocar roupa de cama e tirar o lixo.', 'DOMESTIC', 'HARD', 'ALL', 100, 70, 4, '45-60 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('7da32d8b-4496-48a0-aed4-73d254d1b57e', 'montar-projeto-manual', 'Fazer um Projeto Manual', 'Montar, construir ou criar algo com materiais artísticos (Lego, argila, recorte, colagem).', 'CREATIVE', 'MEDIUM', 'ALL', 50, 30, 2, '30 min', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('82b8702e-c8d4-453b-8c98-533a46b0973d', 'arrumar-mochila', 'Arrumar a Mochila da Escola', 'Conferir os cadernos do dia seguinte, estojo e garrafinha de água.', 'DOMESTIC', 'EASY', 'CHILD_ONLY', 15, 5, 1, '5-10 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('8952066a-2d5a-4c70-aa42-809be509dd27', 'dormir-no-horario', 'Dormir no Horário Combinado', 'Estar na cama com as luzes apagadas no horário combinado pela família.', 'HEALTH', 'EASY', 'CHILD_ONLY', 20, 10, 1, '—', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('8c19e08c-25c4-45d5-9eeb-fa6bf9605f63', 'caminhar', 'Dar uma Caminhada', 'Caminhar pelo bairro por pelo menos 20 minutos.', 'HEALTH', 'MEDIUM', 'ALL', 40, 25, 2, '20-30 min', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('938abae6-6fce-435f-8ffd-63adc2d2e38d', 'lavar-louca-completa', 'Lavar a Louça Completa', 'Lavar, secar e guardar todas as panelas, travessas e pratos da refeição familiar.', 'DOMESTIC', 'HARD', 'ALL', 90, 60, 4, '30-45 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('9b55f2ea-6906-4727-a0f6-6de7308c7d9a', 'comer-verdura', 'Comer Verdura ou Fruta na Refeição', 'Incluir legume, verdura ou fruta em pelo menos uma refeição do dia.', 'HEALTH', 'MEDIUM', 'ALL', 30, 20, 2, '—', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('a2c185b2-94ab-478c-9411-243319e30fcd', 'estudar-prova', 'Estudar para uma Prova', 'Sessão de estudo de pelo menos 45 minutos focada em uma prova ou avaliação.', 'STUDY', 'HARD', 'CHILD_ONLY', 120, 80, 4, '45-60 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('a51c769c-2475-4025-8f57-98bea4d32b5d', 'tirar-lixo', 'Tirar o Lixo da Casa', 'Amarrar os sacos de lixo (banheiro/cozinha) e colocar na lixeira principal.', 'DOMESTIC', 'MEDIUM', 'ALL', 30, 15, 2, '10-15 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('a88436fd-1448-475e-a7a1-339ca1239296', 'praticar-esporte', 'Praticar um Esporte ou Atividade Física', '30 minutos de qualquer atividade física: jogar bola, andar de bike, dançar, academia.', 'HEALTH', 'MEDIUM', 'ALL', 60, 35, 2, '30 min', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('a8a48ba1-3b8e-4f58-9007-e4fb688a9dec', 'varrer-comodo', 'Varrer um Cômodo', 'Passar a vassoura no quarto ou na sala e recolher a sujeira com a pá.', 'DOMESTIC', 'MEDIUM', 'ALL', 35, 20, 2, '15-20 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('ae1a8467-fa01-4d82-875d-6b560b8a9a1f', 'guardar-compras', 'Ajudar a Guardar as Compras', 'Retirar itens das sacolas e organizar mantimentos na despensa e geladeira.', 'DOMESTIC', 'MEDIUM', 'ALL', 40, 25, 2, '15-20 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('b6242336-6e10-4980-9ad0-c71f535881f2', 'arrumar-cama', 'Arrumar a Própria Cama', 'Esticar o lençol, ajeitar o cobertor e posicionar os travesseiros corretamente.', 'DOMESTIC', 'EASY', 'ALL', 10, 5, 1, '5 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('c3d51185-4f23-4333-8ef7-e0231041ed42', 'varal-completo', 'Estender e Recolher Varal Completo', 'Tirar roupas da máquina, estender no varal e dobrar todas quando secarem.', 'DOMESTIC', 'HARD', 'ALL', 80, 50, 4, '30-45 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('c69c94cd-49cc-414c-b785-ed76f3751e87', 'fazer-licao', 'Fazer a Lição de Casa', 'Concluir todas as tarefas escolares do dia antes do jantar.', 'STUDY', 'MEDIUM', 'CHILD_ONLY', 60, 35, 2, '30-45 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('d946dbc0-b030-4343-842a-1ae2dfe7b91a', 'estudar-materia', 'Estudar uma Matéria', 'Focar em uma disciplina escolar por pelo menos 30 minutos usando o Foco do Herói.', 'STUDY', 'MEDIUM', 'CHILD_ONLY', 70, 40, 2, '30 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('dc177a2b-b13b-4d33-b164-b5d8ab575389', 'recolher-brinquedos', 'Recolher os Brinquedos', 'Guardar brinquedos e jogos espalhados na caixa ou estante organizada.', 'DOMESTIC', 'EASY', 'ALL', 10, 5, 1, '5-10 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('e3fb6b08-41e0-46c4-87da-216841e2cc3d', 'guardar-roupas', 'Guardar as Roupas Dobradas', 'Organizar as peças limpas nas gavetas e pendurar itens em cabides.', 'DOMESTIC', 'MEDIUM', 'ALL', 35, 20, 2, '15-20 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('eede7bf3-8d9a-489f-9016-c4fda831f88d', 'ajudar-familiar', 'Ajudar um Familiar Sem Ser Pedido', 'Identificar uma necessidade de alguém da família e ajudar espontaneamente.', 'SOCIAL', 'EASY', 'ALL', 25, 15, 1, 'Variável', 1, '2026-08-31 15:24:07', '2026-08-31 15:24:07'),
('fbffc1e2-6582-4d79-b79a-a479aa3feb27', 'colocar-tirar-prato', 'Colocar/Tirar o Prato da Mesa', 'Levar prato, copos e talheres usados para a pia após a refeição.', 'DOMESTIC', 'EASY', 'ALL', 15, 5, 1, '5 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('ff58b014-92d6-48d1-aed5-0518b8c2b53f', 'lavar-louca-leve', 'Lavar a Louça Leve', 'Lavar copos, pratos e talheres (sem facas afiadas) e organizar no escorredor.', 'DOMESTIC', 'MEDIUM', 'ALL', 40, 25, 2, '20-30 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06'),
('ffca98ad-22fd-4135-b813-84b367320cab', 'passear-cachorro', 'Passear com o Cachorro', 'Dar uma volta no quarteirão com o pet, recolhendo os dejetos adequadamente.', 'DOMESTIC', 'MEDIUM', 'ALL', 45, 30, 2, '20-30 min', 1, '2026-08-31 15:24:06', '2026-08-31 15:24:06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `events`
--

CREATE TABLE `events` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `families`
--

CREATE TABLE `families` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `invite_code` varchar(10) NOT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `families`
--

INSERT INTO `families` (`id`, `name`, `invite_code`, `created_by`, `created_at`, `updated_at`) VALUES
('0846e533-43b6-4fb7-adf0-5f0394606efb', 'Clã Sidney P Lira', 'LIRA-EVJA', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '2026-08-31 21:07:03', '2026-08-31 21:07:03'),
('1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Clã Guardião Sidney (Pai)', 'LIRA-KZNP', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-08-31 16:29:37', '2026-08-31 16:29:37'),
('230c7fb5-8f12-4128-89f7-8cd190be97ba', 'Clã Mestre Administrador (Sidney)', 'LIRA-1KPW', '6e462a8b-7384-45bc-a584-188fb64bced4', '2026-11-17 17:11:21', '2026-11-17 17:11:21'),
('734a4466-fb90-4c2f-9ac6-71e52c0e08eb', 'Clã Jennifer Nayla', 'LIRA-SQYR', '74ced466-eded-45b3-8fe5-db993e71bb4f', '2026-08-31 22:16:43', '2026-08-31 22:16:43'),
('807e34e4-5ffd-42d9-a9e5-5385aa920d95', 'Clã Lira', 'LIRA-2026', '70d3b59f-e6d2-4903-9409-d832753a7c09', '2026-11-21 19:40:41', '2026-11-21 19:40:41'),
('9f372106-e2b2-450e-9cf7-48a3c9e91b59', 'Clã Jovem Herói Davi (Filho)', 'LIRA-DVYP', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '2026-08-31 16:14:25', '2026-08-31 16:14:25'),
('cfb90d98-ad76-4638-9ecf-cf7adf7b750e', 'Clã Elaine', 'LIRA-5GY4', 'b3128978-89c1-49a4-ac21-56732fa78eda', '2026-08-31 19:37:00', '2026-08-31 19:37:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_bills`
--

CREATE TABLE `family_bills` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(150) NOT NULL,
  `category` enum('ENERGY','WATER','INTERNET','HOUSING','SUPERMARKET','STREAMING','EDUCATION','HEALTH','OTHER') NOT NULL DEFAULT 'OTHER',
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `due_date` date NOT NULL,
  `status` enum('PENDING','PAID','OVERDUE') NOT NULL DEFAULT 'PENDING',
  `paid_at` datetime DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT 'PIX',
  `barcode_or_pix` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_bills`
--

INSERT INTO `family_bills` (`id`, `family_id`, `created_by`, `title`, `category`, `amount`, `due_date`, `status`, `paid_at`, `payment_method`, `barcode_or_pix`, `notes`, `created_at`, `updated_at`) VALUES
('5c0206d0-35ce-418e-aea7-787de484d51b', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '🛒 Supermercado do Mês (Abastecimento)', 'SUPERMARKET', 820.50, '2026-11-15', 'PAID', '2026-11-17 03:47:13', 'Cartão de Débito', NULL, 'Compras essenciais de despensa já liquidadas.', '2026-11-17 03:47:13', '2026-11-17 03:47:13'),
('ae23606b-fb36-4b2e-b8de-a803285b020c', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '🏡 Condomínio / Manutenção do Lar', 'HOUSING', 450.00, '2026-12-02', 'PENDING', NULL, 'PIX', NULL, 'Taxa condominial e reserva de obras.', '2026-11-17 03:47:13', '2026-11-17 03:47:13'),
('db605837-f819-4387-aa84-72365cb82319', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '💡 Conta de Energia Elétrica', 'ENERGY', 245.80, '2026-11-22', 'PENDING', NULL, 'PIX', NULL, 'Chave PIX da concessionária salva no app do banco.', '2026-11-17 03:47:13', '2026-11-17 03:47:13'),
('dee2d361-f841-46de-bf49-cc06248365e5', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '🌐 Internet Fibra Óptica 500 Mega', 'INTERNET', 129.90, '2026-11-27', 'PENDING', NULL, 'Boleto', NULL, 'Débito automático ou pagamento via código de barras.', '2026-11-17 03:47:13', '2026-11-17 03:47:13');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_characters`
--

CREATE TABLE `family_characters` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `class_code` varchar(50) NOT NULL DEFAULT 'guardiao_do_lar',
  `level` int(11) NOT NULL DEFAULT 1,
  `xp` int(11) NOT NULL DEFAULT 0,
  `skin_code` varchar(100) NOT NULL DEFAULT 'default',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_characters`
--

INSERT INTO `family_characters` (`id`, `user_id`, `family_id`, `class_code`, `level`, `xp`, `skin_code`, `created_at`, `updated_at`) VALUES
('7a46af9e-3296-4823-9597-d6eb7cdcd761', 'c6e55de6-969f-4572-b97c-e93b872afdcf', '807e34e4-5ffd-42d9-a9e5-5385aa920d95', 'guardiao_da_harmonia', 1, 0, 'guardia_harmonia', '2026-11-21 19:40:41', '2026-11-21 19:40:41'),
('84d190d8-a545-4bb5-bf70-94e4f3c2079b', '40058126-1471-4c26-945c-1f329a49a2be', '807e34e4-5ffd-42d9-a9e5-5385aa920d95', 'artifice_criativo', 1, 0, 'artifice_criativa', '2026-11-21 19:40:42', '2026-11-21 19:40:42'),
('a6ed1804-63df-495d-9727-efd68260d554', '70d3b59f-e6d2-4903-9409-d832753a7c09', '807e34e4-5ffd-42d9-a9e5-5385aa920d95', 'guardiao_do_lar', 1, 0, 'paladino_lira', '2026-11-21 19:40:41', '2026-11-21 19:40:41'),
('aa75380d-1840-4f00-ab83-75bd1f171399', 'f85ea042-b0b0-484c-be2b-3ea9b0503b6b', '807e34e4-5ffd-42d9-a9e5-5385aa920d95', 'rastreador_veloz', 1, 0, 'rastreador_veloz', '2026-11-21 19:40:41', '2026-11-21 19:40:41');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_child_vaults`
--

CREATE TABLE `family_child_vaults` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `character_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `saved_gold` int(11) NOT NULL DEFAULT 0,
  `allowance_balance_brl` decimal(10,2) NOT NULL DEFAULT 0.00,
  `gold_to_brl_rate` decimal(6,2) NOT NULL DEFAULT 10.00,
  `goal_title` varchar(150) DEFAULT 'Meu Sonho / Brinquedo',
  `goal_amount_brl` decimal(10,2) NOT NULL DEFAULT 50.00,
  `total_withdrawn_brl` decimal(10,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_child_vaults`
--

INSERT INTO `family_child_vaults` (`id`, `family_id`, `user_id`, `character_id`, `saved_gold`, `allowance_balance_brl`, `gold_to_brl_rate`, `goal_title`, `goal_amount_brl`, `total_withdrawn_brl`, `notes`, `created_at`, `updated_at`) VALUES
('0e5d5ea9-0370-4ece-b017-a4561f2e06b8', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '6752320c-afcb-4a94-ab5c-a43f965edb0f', 0, 0.00, 10.00, 'Lego Millennium Falcon', 120.00, 0.00, NULL, '2026-11-17 03:47:13', '2026-11-17 03:47:14'),
('3f212f90-af56-4c08-9bae-b7553e8d128a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', 0, 0.00, 10.00, 'Meu Sonho / Brinquedo / Jogo', 50.00, 0.00, NULL, '2026-11-17 03:47:14', '2026-11-17 03:47:14'),
('af421c53-0fbd-4d29-afd7-1dced58ceea9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', '6ebe38a6-a5d6-478b-90b4-ce2446466a2c', 0, 0.00, 10.00, 'Meu Sonho / Brinquedo / Jogo', 50.00, 0.00, NULL, '2026-11-17 03:47:13', '2026-11-17 03:47:13'),
('f4215a29-8466-478e-8eef-df022b0a84f4', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 0, 0.00, 10.00, 'Meu Sonho / Brinquedo / Jogo', 50.00, 0.00, NULL, '2026-11-17 03:47:14', '2026-11-17 03:47:14');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_clan_vaults`
--

CREATE TABLE `family_clan_vaults` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('TRIP','RENOVATION','PURCHASE','EXPERIENCE','SAVINGS','OTHER') NOT NULL DEFAULT 'TRIP',
  `icon` varchar(30) NOT NULL DEFAULT '?️',
  `target_amount` decimal(10,2) NOT NULL DEFAULT 1000.00,
  `current_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `target_tasks` int(11) NOT NULL DEFAULT 0,
  `current_tasks` int(11) NOT NULL DEFAULT 0,
  `target_date` date DEFAULT NULL,
  `status` enum('ACTIVE','ACHIEVED','PAUSED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_clan_vaults`
--

INSERT INTO `family_clan_vaults` (`id`, `family_id`, `created_by`, `title`, `description`, `category`, `icon`, `target_amount`, `current_amount`, `target_tasks`, `current_tasks`, `target_date`, `status`, `created_at`, `updated_at`) VALUES
('1ca227f6-b651-416a-a22a-fedf93408df5', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', 'Viagem de Férias do Clã (Praia / Parque Temático)', 'Meta coletiva familiar para descanso, praia, atrações e momentos inesquecíveis juntos!', 'TRIP', '🏖️🎢', 3000.00, 2170.00, 500, 360, '2027-02-15', 'ACTIVE', '2026-11-17 03:47:13', '2026-11-17 03:47:13');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_dungeon_actions`
--

CREATE TABLE `family_dungeon_actions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `scene_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `action_number` int(11) NOT NULL DEFAULT 1,
  `title` varchar(255) NOT NULL,
  `attribute_code` varchar(20) NOT NULL,
  `difficulty_dc` int(11) NOT NULL DEFAULT 12,
  `success_text` text NOT NULL,
  `failure_text` text NOT NULL,
  `failure_damage` int(11) NOT NULL DEFAULT 10,
  `bonus_gold` int(11) NOT NULL DEFAULT 0,
  `success_scene_code` varchar(50) DEFAULT NULL,
  `failure_scene_code` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_dungeon_actions`
--

INSERT INTO `family_dungeon_actions` (`id`, `scene_id`, `action_number`, `title`, `attribute_code`, `difficulty_dc`, `success_text`, `failure_text`, `failure_damage`, `bonus_gold`, `success_scene_code`, `failure_scene_code`, `created_at`, `updated_at`) VALUES
('03727c67-a601-4a6e-9b41-6dad0641a6ae', 'ffde7237-d34e-4e5c-ba2a-d8af70cab170', 2, 'Esquivar-se agilmente dos destroços giratórios', 'agi', 11, 'Acrobacias perfeitas! Você se desvia de cadeiras e caixas no ar e chega ao centro!', 'Um cabide de madeira atinge sua perna e rasga sua calça de armadura (-12 HP)!', 12, 7, 'duelo_goblin', 'piso_brinquedos', '2026-09-04 14:25:51', '2026-09-04 15:10:15'),
('0441297f-1105-422f-96e1-24e67c6dca1b', '75a1287e-148c-48f9-b2fb-50360a6e9839', 1, 'Arremeter com ombro heróico e romper o batente fragilizado', 'con', 11, 'Com a rigidez do seu escudo de proteção, a madeira estala e você atravessa o portal!', 'O impacto afeta seu ombro e você recua dolorido com a porta intacta (-12 HP)!', 12, 6, 'piso_brinquedos', 'nevoa_poeira', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('09dc2581-2b62-4d1e-8fcd-af735442d36d', '747ff633-64ea-474a-908d-62a4ffe7b06c', 1, 'Sincronizar os ponteiros dourados do baú com o ritmo do coração', 'con', 13, 'Harmonia absoluta! As trancas estalam em ritmo perfeito e o baú se abre reluzindo!', 'Um estalo de mola bate nas suas unhas, mas a tampa finalmente cede (-10 HP)!', 10, 25, NULL, NULL, '2026-09-04 15:10:17', '2026-09-04 15:10:17'),
('0edfb72b-41d9-4783-bb32-a0e2210e3bcc', '41dd4567-a3c5-4c28-b8f2-4c0d27156133', 3, 'Focar na satisfação do dever cumprido e avançar focado', 'int', 13, 'Sua clareza mental neutraliza o feitiço psicológico da procrastinação com sabedoria!', 'Pensamentos de adiamento nublam sua mente e você cambaleia no chão úmido (-15 HP)!', 15, 11, 'pendulos_ampulheta', 'fosso_desculpas', '2026-09-04 14:25:53', '2026-09-04 15:10:17'),
('0f44fdc8-b139-4441-a647-b24d32580288', '1ddf9e7a-d858-4e03-be3e-f5d65e5badc9', 3, 'Confiar na sorte e saltar com fé no fluxo dos ventos', 'luk', 12, 'Uma brisa repentina ergue um enorme atlas bem sob os seus pés, levando você ao topo!', 'O vento cessa no momento crucial e você colide contra a coluna central da torre (-14 HP)!', 14, 10, 'confronto_devorador', 'sala_pergaminhos', '2026-09-04 14:25:52', '2026-09-04 15:10:16'),
('1658bcd7-daaf-444f-b52d-ed0c877485f5', '75a1287e-148c-48f9-b2fb-50360a6e9839', 3, 'Contar com a sorte e chutar a maçaneta no ângulo exato do mecanismo', 'luk', 11, 'Que pontaria genial! O pedaço de gazua solta a engrenagem e a porta abre com um estalo!', 'O chute rebate e nada acontece exceto mais dor no seu tornozelo (-12 HP)!', 12, 7, 'sala_arrombada', 'piso_brinquedos', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('1eae64da-d5ab-4ccd-803d-c9ba027746fb', '16a17ebd-4777-43e1-8f07-65d201a9f9fd', 3, 'Fingir uma voz amiga dizendo ser o entregador de suprimentos', 'cha', 10, 'Enganados pela sua encenação, os goblins abrem o ferrolho curiosos e caem na sua armadilha!', 'Eles reconhecem o truque e despejam água com sabão escorregadio pela fresta (-12 HP)!', 12, 8, 'sala_arrombada', 'piso_brinquedos', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('1fe48024-ef07-42d2-a8dd-f5211f82b526', 'ff5749c1-8437-406a-8263-2664ced931d5', 2, 'Citar uma poesia harmoniosa para pacificar as palavras', 'cha', 11, 'Ao declamar versos de bravura, as letras se encantam com sua voz e voltam dóceis aos livros!', 'Você esquece a rima no meio da frase e as palavras rebeldes ferroam seus braços (-12 HP)!', 12, 9, 'confronto_devorador', 'confronto_devorador', '2026-09-04 14:25:53', '2026-09-04 15:10:16'),
('23235111-37a2-44a4-8e17-2568a0840eae', 'db69edbd-5ff3-404d-a9ac-4cc16b8fb5bc', 2, 'Examinar o mecanismo de contrapeso das engrenagens', 'agi', 12, 'Seus dedos rápidos encontram a trava de emergência e destrancam a porta mecanicamente!', 'Uma das engrenagens range e prende sua luva nas correntes de tração (-12 HP)!', 12, 7, 'escadaria_livros', 'sala_pergaminhos', '2026-09-04 14:25:52', '2026-09-04 15:10:16'),
('24f9fee6-30de-4bab-ab78-63937c579e51', '722e31a8-a08c-4b2b-81ff-40bbfc935061', 2, 'Utilizar sua empatia e espírito de liderança familiar', 'cha', 12, 'O baú reconhece o coração nobre de um herói que valoriza o saber e se abre com deferência!', 'A energia é intensa demais e descarrega um pulso eletrostático no seu peito (-10 HP)!', 10, 18, NULL, NULL, '2026-09-04 14:25:53', '2026-09-04 14:25:53'),
('29cc78c7-46f4-4ca9-ad4f-834c3f633c25', '1ddf9e7a-d858-4e03-be3e-f5d65e5badc9', 2, 'Ler os títulos em latim para pisar apenas nos livros estáveis', 'int', 11, 'Você nota que os tratados de Astronomia possuem aterrissagem estável e sobe tranquilamente!', 'Você confunde um tomo de Levitação com um de Queda Livre e despenca alguns metros (-14 HP)!', 14, 9, 'confronto_devorador', 'sala_pergaminhos', '2026-09-04 14:25:52', '2026-09-04 15:10:16'),
('2fe2122e-9480-48bf-9fbf-40ca5129cd2e', '6f7a00eb-6568-477f-bd87-fd4867b08748', 3, 'Erguer a tampa de carvalho maciço com vigor heróico', 'con', 10, 'Seus músculos firmes sustentam o peso da tampa de chumbo e revelam o fabuloso tesouro!', 'A tampa é incrivelmente pesada e machuca sua mão antes de abrir completamente (-8 HP)!', 8, 12, NULL, NULL, '2026-09-04 14:25:52', '2026-09-04 14:25:52'),
('320e467c-f6b1-456f-b83d-32c04670a3ed', 'ed56ec62-2c83-48ab-8088-f2dcc6b8e865', 3, 'Bater o cabo da espada para assustar as sombras com eco estrondoso', 'str', 11, 'As vibrações sonoras dispersam a poeira e põem as criaturinhas para correr!', 'O golpe na pedra machuca seu pulso e atrai mais poeira mágica (-12 HP)!', 12, 6, 'sala_arrombada', 'piso_brinquedos', '2026-09-04 15:10:15', '2026-09-04 15:10:15'),
('3b660297-bc59-4dd1-922a-9b4bd3979816', '16a17ebd-4777-43e1-8f07-65d201a9f9fd', 1, 'Utilizar uma viga pesada de madeira como alavanca e forçar a fresta', 'str', 11, 'Com um esforço muscular titânico, a alavanca estoura a barra de contenção e a porta cede!', 'A viga racha ao meio sob a pressão, estilhaçando madeira no seu peitoral (-12 HP)!', 12, 6, 'nevoa_poeira', 'piso_brinquedos', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('3de36d59-72e5-4caa-a4e1-519cc3c828b8', 'e8f6a2b7-8cdc-4987-b9f6-acf95414f7d4', 3, 'Inteligência: Procurar uma chave escondida ao redor da região', 'int', 9, 'Investigando com olhar atento o batente superior, seus dedos encontram a Chave de Latão Secreta!', 'Ao mexer numa tábua solta, você esbarra num gatilho oculto que dispara uma nuvem de pó nos seus olhos (-10 HP)!', 10, 8, 'sala_chave_mestra', 'armadilha_poeira', '2026-09-04 14:25:51', '2026-09-04 15:10:14'),
('3fb350ed-cd99-49a9-9b7c-3875f551eb0e', '377af57d-1583-4ca6-b3d8-e11bbc48dcb7', 3, 'Reclamar o tesouro em nome da vitória da disciplina familiar', 'cha', 14, 'A voz de quem venceu a procrastinação faz o cofre se abrir em reverência épica!', 'A glória é conquistada com sangue e suor, celebrando o triunfo definitivo (-12 HP)!', 12, 24, NULL, NULL, '2026-09-04 14:25:54', '2026-09-04 14:25:54'),
('40d9b821-c173-4b10-a9eb-d890cea80617', '6444f056-5d35-4ba2-84ee-ef02d8cd6850', 1, 'Saltar de viga em viga pelo madeiramento do teto', 'agi', 11, 'Você pula com leveza felina entre os caibros e aterrissa do outro lado sem tocar no piso!', 'Seu pé escorrega e você aterrissa em cheio sobre um bloco pontiagudo de quina viva (-12 HP)!', 12, 8, 'duelo_goblin', 'duelo_goblin', '2026-09-04 14:25:52', '2026-09-04 15:10:15'),
('44b734eb-27fe-4f24-a63a-7529c3fb2e41', '16a17ebd-4777-43e1-8f07-65d201a9f9fd', 2, 'Tentar se esgueirar ágil por um duto de ventilação no teto', 'agi', 11, 'Você pula na viga superior, remove a grade do duto e desce silenciosamente atrás das linhas inimigas!', 'A grade de metal se solta de mau jeito e despenca na sua cabeça (-12 HP)!', 12, 7, 'sala_infiltrada', 'nevoa_poeira', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('4b8ced82-fccc-474d-82df-b9c1fda1549e', '41dd4567-a3c5-4c28-b8f2-4c0d27156133', 2, 'Saltar sobre pedras secas antes que o lodo se expanda', 'agi', 14, 'Com velocidade supersônica, você quica sobre as pedras pontiagudas sem tocar no pântano!', 'Uma pedra cede sob sua bota e você afunda até o joelho no pântano sonolento (-15 HP)!', 15, 9, 'pendulos_ampulheta', 'fosso_desculpas', '2026-09-04 14:25:53', '2026-09-04 15:10:17'),
('5067924e-f68a-40a6-a368-af6e3edb21e5', '609f4747-7edb-4303-8b09-f8d5d679d941', 3, 'Confiar na sorte e encontrar a rachadura oculta do vidro', 'luk', 13, 'Seus olhos batem exatamente no ponto fraco da estrutura, desmontando o espelho com um toque leve!', 'Você toca no lugar errado e um choque de desânimo invade sua espinha (-15 HP)!', 15, 11, NULL, NULL, '2026-09-04 14:25:54', '2026-09-04 14:25:54'),
('55e1a151-6aab-4ed0-95ab-6897354e0394', '4946bdc0-f7c9-4355-b389-733e027eeecd', 2, 'Desviar com fintas elétricas e fazê-lo martelar a própria base', 'agi', 14, 'Você esquiva no último segundo! O monstro acerta os próprios joelhos e se desintegra!', 'A areia mágica prende seus pés e você recebe uma rajada de estilhaços de rocha (-18 HP)!', 18, 14, 'bau_rubi_tempo', 'bau_rubi_tempo', '2026-09-04 15:10:17', '2026-09-04 15:10:17'),
('58eab3f4-34d9-4099-b01f-c2ae7863d778', 'bfa8ea43-ff58-47f8-886c-e947870c5c68', 2, 'Escalar a parede de rocha íngreme usando a força dos braços', 'str', 14, 'Músculo sobre rocha! Você sobe pelas frestas de pedra como um alpinista de elite!', 'Uma pedra se desprende e você despenca de volta ao fundo do fosso (-15 HP)!', 15, 11, 'confronto_tita', 'confronto_tita', '2026-09-04 15:10:17', '2026-09-04 15:10:17'),
('5f0f74c8-5027-43e3-8753-4ad6d24a0013', 'db69edbd-5ff3-404d-a9ac-4cc16b8fb5bc', 1, 'Responder com convicção: \"A Luz!\" (Canalizar faísca arcana)', 'int', 11, 'As letras brilham em dourado radiante! A resposta está correta e os pesados ferrolhos se abrem!', 'Sua voz titubeia na resposta; uma fagulha de rejeição mágica queima sua túnica (-12 HP)!', 12, 8, 'escadaria_livros', 'sala_pergaminhos', '2026-09-04 14:25:52', '2026-09-04 15:10:16'),
('624eebcc-2732-4156-8141-d63e4fe52fb0', '414256a1-54fe-42aa-8a1f-2749e4939090', 2, 'Arremessar seu escudo como um bumerangue contra o grupo', 'str', 11, 'O escudo bate em cadeia e derruba todos os capangas, limpando o caminho direto para o chefe!', 'O escudo bate na parede e ricocheteia raspando no seu braço (-10 HP)!', 10, 7, 'duelo_goblin', 'nevoa_poeira', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('63a8c6e4-ec6a-450d-9044-8e0825659983', '76b569b1-cac5-4a14-82fe-f4c2596791d6', 1, 'Investir com corte firme e decepar o espanador sombrio', 'str', 12, 'Seu golpe certeiro corta o cabo do espanador mágico! O goblin cai de costas em desespero!', 'O monstro salta ágil e chicoteia seu peito com pó cáustico (-14 HP)!', 14, 10, 'bau_tesouro_goblin', 'bau_tesouro_goblin', '2026-09-04 14:25:52', '2026-09-04 15:10:15'),
('71c2f053-9c0e-442f-9ac8-6597b97b3336', '747ff633-64ea-474a-908d-62a4ffe7b06c', 3, 'Apostar na bênção do destino e girar a chave mística', 'luk', 12, 'A sorte dos heróis sorri radiante e o tesouro se revela com abundância régia!', 'A chave dá um tranco forte no seu punho antes de girar totalmente (-10 HP)!', 10, 22, NULL, NULL, '2026-09-04 15:10:17', '2026-09-04 15:10:17'),
('797119ea-5c74-4c26-859c-efa70584846b', 'a7200f90-2e4d-4a8e-8584-4ec003e3297f', 2, 'Invocar o apoio dos guardiões familiares para iluminar o caminho', 'cha', 10, 'Uma aura de bravura protege seus passos e as sombras de desordem se dissolvem!', 'Uma lufada de vento gélido apaga suas tochas e gela seu peito (-10 HP)!', 10, 8, 'duelo_goblin', 'piso_brinquedos', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('7a643414-ff1f-436e-8f33-3d08ea526d71', '722e31a8-a08c-4b2b-81ff-40bbfc935061', 1, 'Resolver a equação rúnica de abertura dos arcanos', 'int', 11, 'Brilhante! A equação se completa e as trancas deslizam com uma chuva de estrelas azuis!', 'O circuito mágico dá um estalo na sua mão antes de abrir a tampa de cristal (-10 HP)!', 10, 20, NULL, NULL, '2026-09-04 14:25:53', '2026-09-04 14:25:53'),
('7afe486f-1dd5-4f00-abac-5efddb8edd48', 'e8f6a2b7-8cdc-4987-b9f6-acf95414f7d4', 1, 'Físico: Dar um potente chute na porta para arrombá-la', 'str', 10, 'BOOM! O chute despedaça o trinco com violência heróica! A porta se escancara e você invade a sala num estrondo épico!', 'O chute bate em cheio na viga de ferro com um baque surdo! A porta não abre e você torce o pé dolorosamente (-10 HP)!', 10, 5, 'sala_arrombada', 'porta_travada_alerta', '2026-09-04 14:25:51', '2026-09-04 15:10:13'),
('7d7e8bcb-943c-442f-a279-d6f6232196fb', '3be9bfa3-390d-4d9d-b10a-02b646278942', 3, 'Deslizar pelo chão úmido no momento em que as lâminas sobem', 'agi', 14, 'Um slide espetacular rente ao piso de pedra leva você até o outro lado ileso!', 'O chão áspero segura sua túnica e você raspa o joelho na pedra afiada (-16 HP)!', 16, 11, 'confronto_tita', 'fosso_desculpas', '2026-09-04 14:25:53', '2026-09-04 15:10:17'),
('85aaf40f-6b4a-4bf3-8c91-30bb0d2068e7', '377af57d-1583-4ca6-b3d8-e11bbc48dcb7', 1, 'Sincronizar as três engrenagens mestre no segundo exato', 'int', 13, 'Perfeição matemática! O baú explode em confetes de luz dourada e fanfarras reais!', 'O mecanismo dá um recuo na sua mão, mas a trava se rompe revelando o ouro (-12 HP)!', 12, 25, NULL, NULL, '2026-09-04 14:25:54', '2026-09-04 14:25:54'),
('86d2ec4a-49f9-47b5-b60d-2a98e46b0f18', '609f4747-7edb-4303-8b09-f8d5d679d941', 1, 'Quebrar a ilusão com a voz da verdade e honra familiar', 'cha', 13, '\"Primeiro o dever, depois o lazer!\". O espelho de mentiras racha e explode em pó de vidro inofensivo!', 'A dúvida penetra seu coração e uma rajada de vidro encantado corta seus braços (-15 HP)!', 15, 12, NULL, NULL, '2026-09-04 14:25:54', '2026-09-04 14:25:54'),
('8712d9bd-a790-48a3-8a89-1e84789c6ebd', '7bba0235-3db9-4659-91b9-f84f66d699e3', 2, 'Lançar um feitiço de luz ofuscante para desorientar as criaturas', 'int', 10, 'Um clarão mágico irrompe no sótão, cegando os goblins e permitindo sua aproximação decisiva!', 'O feitiço faísca na sua mão e queima as pontas dos seus dedos (-10 HP)!', 10, 9, 'duelo_goblin', 'nevoa_poeira', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('8a6a3f19-f25b-490b-96d4-2f7bdc3a5f2d', '2b8f9369-9afe-45fb-9c62-2e414c155e3f', 1, 'Lançar um enigma lógico irrespondível para paralisá-lo', 'int', 12, '\"O que tem raiz mas não é árvore, sobe sem andar e cai sem chorar?\". O monstro entra em curto-circuito e cai!', 'O monstro engole seu enigma e sopra uma rajada de páginas em chamas na sua direção (-16 HP)!', 16, 12, 'bau_tomo_ancestral', 'bau_tomo_ancestral', '2026-09-04 14:25:53', '2026-09-04 15:10:16'),
('8bc05c68-adfe-4fa3-9af9-5530f1d9c048', 'ff5749c1-8437-406a-8263-2664ced931d5', 1, 'Conjurar um escudo de foco e concentração inabalável', 'con', 12, 'Sua mente disciplinada repele o enxame de dispersão! As letras recuam ordenadas!', 'O turbilhão de letras penetra sua defesa mental, causando tontura e dor de cabeça (-12 HP)!', 12, 8, 'confronto_devorador', 'confronto_devorador', '2026-09-04 14:25:53', '2026-09-04 15:10:16'),
('9a757a09-5222-45a9-9b66-74df2bdeab04', '75a1287e-148c-48f9-b2fb-50360a6e9839', 2, 'Desmontar as dobradiças externas usando raciocínio lógico', 'int', 10, 'Você percebe que os pinos da dobradiça estão expostos e os remove com maestria cirúrgica!', 'O pino de ferro escapa e prende seu dedo na calha enferrujada (-12 HP)!', 12, 8, 'sala_infiltrada', 'nevoa_poeira', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('9bc5feb4-e611-4f70-be6b-bdd9e5fe3ff5', 'bfa8ea43-ff58-47f8-886c-e947870c5c68', 3, 'Confiar na determinação e arremessar um gancho no escuro', 'luk', 13, 'O gancho se prende com firmeza em uma raiz e você sobe triunfante ao piso superior!', 'O gancho volta solto e acerta seu ombro com o peso do chumbo (-15 HP)!', 15, 12, 'confronto_tita', 'confronto_tita', '2026-09-04 15:10:17', '2026-09-04 15:10:17'),
('9c0ca7a0-25d6-47ec-ba1c-b269607572fb', '414256a1-54fe-42aa-8a1f-2749e4939090', 3, 'Aproveitar o choque geral e disparar em velocidade heróica', 'agi', 10, 'Você corta o salão em zigue-zague veloz antes que qualquer um deles consiga reagir!', 'Você tropeça numa vassoura velha caída no chão durante a corrida rápida (-10 HP)!', 10, 6, 'duelo_goblin', 'piso_brinquedos', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('9d21d151-323c-46e7-ae04-23f8c6ac51a9', 'da4ee5fc-3854-44d0-9ad6-4e2377878269', 1, 'Atacar com sequência de golpes rápidos antes que ele erga os braços', 'agi', 14, 'Sua velocidade impressionante atinge os pontos vitais do titã antes que ele reaja! Ele tomba de joelhos!', 'O titã desce uma mão pesada como pedra sobre o seu escudo, afundando você na rocha (-18 HP)!', 18, 15, NULL, NULL, '2026-09-04 14:25:54', '2026-09-04 14:25:54'),
('9e50cb7f-673f-4c86-941f-a85a6cd0bc2c', '377af57d-1583-4ca6-b3d8-e11bbc48dcb7', 2, 'Girar a chave mestra com destreza impecável', 'agi', 13, 'Suas mãos firmes abrem a fechadura em um milésimo de segundo sem nenhum atrito!', 'A mola mestre arranha seu punho, mas a tampa voa revelando o tesouro imperial (-12 HP)!', 12, 22, NULL, NULL, '2026-09-04 14:25:54', '2026-09-04 14:25:54'),
('a4147522-84eb-475b-93d7-a98822cc000b', '76b569b1-cac5-4a14-82fe-f4c2596791d6', 2, 'Efetuar rolamento rápido e encurralá-lo pelas costas', 'agi', 11, 'Em fração de segundo você ressurge atrás da pilha de malas e prende o goblin sob sua capa!', 'Ele percebe seu movimento e empurra uma pilha de caixas nas suas costelas (-14 HP)!', 14, 9, 'bau_tesouro_goblin', 'bau_tesouro_goblin', '2026-09-04 14:25:52', '2026-09-04 15:10:15'),
('ab94cba3-c494-4f13-aebe-8ddd3328cf19', 'ed56ec62-2c83-48ab-8088-f2dcc6b8e865', 2, 'Usar sua capa para filtrar o ar e correr no sentido do vento', 'agi', 10, 'Com reflexo veloz, você protege a respiração e encontra a saída da nuvem sem percalços!', 'A capa se enrola no seu pescoço e você tropeça num baú de ferro (-12 HP)!', 12, 7, 'sala_infiltrada', 'nevoa_poeira', '2026-09-04 15:10:15', '2026-09-04 15:10:15'),
('b4d97b7e-6b02-4fb5-8dcc-05f90d824ea7', '4946bdc0-f7c9-4355-b389-733e027eeecd', 3, 'Canalizar a determinação dos deveres cumpridos e dissipar a ilusão', 'con', 13, 'Sua disciplina espiritual brilha como ouro e derrete a forma física do Titã em segundos!', 'A aura de letargia o envolve e drena seu ar antes de você conseguir se libertar (-18 HP)!', 18, 16, 'bau_rubi_tempo', 'bau_rubi_tempo', '2026-09-04 15:10:17', '2026-09-04 15:10:17'),
('b8a541ea-22ea-491d-8b05-147ab8dda567', '722e31a8-a08c-4b2b-81ff-40bbfc935061', 3, 'Sustentar os selos de proteção com vigor corporal', 'con', 12, 'Sua resistência heróica dissipa os últimos resquícios da maldição e liberta os tesouros!', 'O esforço consome suas energias, mas a vitória é consumada com bravura (-10 HP)!', 10, 15, NULL, NULL, '2026-09-04 14:25:53', '2026-09-04 14:25:53'),
('ba45f542-b4bf-47c9-8916-0be8fbdb324b', 'ffde7237-d34e-4e5c-ba2a-d8af70cab170', 3, 'Entoar o lema de ordem da família para acalmar a magia', 'cha', 10, 'O poder das suas palavras harmoniosas faz a desordem mágica desabar no chão inerte!', 'O vento engole suas palavras e uma rajada sufocante entra em sua garganta (-12 HP)!', 12, 8, 'duelo_goblin', 'piso_brinquedos', '2026-09-04 14:25:51', '2026-09-04 15:10:15'),
('ba64f09e-0afa-477c-9db5-f0afb88bf0e6', '747ff633-64ea-474a-908d-62a4ffe7b06c', 2, 'Alinhar as três gemas de rubi que refratam a luz do dia', 'int', 12, 'A luz solar se concentra num raio vermelho intenso que desfaz os lacres de pedra!', 'O reflexo do laser queima a ponta da sua luva de couro antes de abrir o baú (-10 HP)!', 10, 24, NULL, NULL, '2026-09-04 15:10:17', '2026-09-04 15:10:17'),
('bb773e18-7bbb-4236-8aec-4aa3f4587648', '6444f056-5d35-4ba2-84ee-ef02d8cd6850', 3, 'Puxar uma pesada passadeira de veludo para forrar o chão', 'str', 11, 'Com força muscular exemplar, você estica o tapete cobrindo todas as armadilhas!', 'O tapete rasga e uma tachinha afiada fura a sola de couro de sua bota (-12 HP)!', 12, 7, 'duelo_goblin', 'duelo_goblin', '2026-09-04 14:25:52', '2026-09-04 15:10:15'),
('bbc46704-1c9b-4251-8d80-5729528f7a23', '7bba0235-3db9-4659-91b9-f84f66d699e3', 1, 'Desarmar furtivamente as linhas de armadilhas antes de avançar', 'agi', 10, 'Seus passos de pluma cortam os fios de alarme um a um. O caminho está seguro!', 'Seu cotovelo encosta num sino de bronze que emite uma badalada estridente (-10 HP)!', 10, 8, 'duelo_goblin', 'piso_brinquedos', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('bd628476-7555-4aa5-87a8-c56172c84e99', '76b569b1-cac5-4a14-82fe-f4c2596791d6', 3, 'Proclamar a Ordem da Casa: \"Aqui a Preguiça Não Tem Vez!\"', 'cha', 11, 'A energia moral da sua voz quebra a maldição do monstro! Ele encolhe e foge pelo telhado!', 'Ele gargalha da sua ordem e lança uma onda de choque de poeira sufocante (-14 HP)!', 14, 10, 'bau_tesouro_goblin', 'bau_tesouro_goblin', '2026-09-04 14:25:52', '2026-09-04 15:10:15'),
('be1b93d2-fd6f-4570-88b8-04e6c788d13a', '3be9bfa3-390d-4d9d-b10a-02b646278942', 1, 'Calcular a cadência dos pêndulos e atravessar no tempo exato', 'int', 13, 'Cronometragem perfeita! Você passa como uma sombra entre as lâminas no milissegundo certo!', 'O cálculo falha por um instante e a haste de bronze acerta suas costelas (-16 HP)!', 16, 12, 'confronto_tita', 'fosso_desculpas', '2026-09-04 14:25:53', '2026-09-04 15:10:17'),
('bf44709b-e440-4fa4-ba4d-be51685af7e3', '2b8f9369-9afe-45fb-9c62-2e414c155e3f', 3, 'Aproveitar a brecha de ataque e cegá-lo com pó rúnico', 'luk', 12, 'Um golpe de pura sorte acerta os olhos da fera, fazendo-a tropeçar da balaustrada!', 'O pó sopra de volta nos seus olhos e você recebe uma chicotada de pergaminho (-16 HP)!', 16, 11, 'bau_tomo_ancestral', 'bau_tomo_ancestral', '2026-09-04 14:25:53', '2026-09-04 15:10:16'),
('c06a2bee-26db-4416-bb9e-9fcc162ec6dc', '2b8f9369-9afe-45fb-9c62-2e414c155e3f', 2, 'Investir com a espada encantada direto no coração de papiro', 'str', 13, 'Seu corte heroico perfura o núcleo arcano da criatura, libertando todas as letras aprisionadas!', 'A mandíbula de madeira do monstro golpeia seu escudo com violência estarrecedora (-16 HP)!', 16, 10, 'bau_tomo_ancestral', 'bau_tomo_ancestral', '2026-09-04 14:25:53', '2026-09-04 15:10:16'),
('cd561190-4629-4cd8-9d0a-6b23377e904a', 'db69edbd-5ff3-404d-a9ac-4cc16b8fb5bc', 3, 'Forçar as duas batentes de bronze com ombro firme', 'str', 13, 'Com um urro de determinação, você supera a trava arcaica na força bruta!', 'O bronze encantado repele seu impacto com uma onda de choque reverberante (-12 HP)!', 12, 6, 'escadaria_livros', 'sala_pergaminhos', '2026-09-04 14:25:52', '2026-09-04 15:10:16'),
('ce353851-1746-4460-a9c8-c75781890dc9', '41dd4567-a3c5-4c28-b8f2-4c0d27156133', 1, 'Rejeitar a preguiça com um grito de disciplina e marcha férrea', 'con', 13, 'Sua vontade de aço corta a letargia! Suas pernas rasgam o lodo com vigor inabalável!', 'A gosma roxa suga sua energia vital, drenando seu vigor com um torpor gélido (-15 HP)!', 15, 10, 'pendulos_ampulheta', 'fosso_desculpas', '2026-09-04 14:25:53', '2026-09-04 15:10:17'),
('d26477ea-3d6a-4700-be38-344852259e65', 'ff5749c1-8437-406a-8263-2664ced931d5', 3, 'Mover-se em zigue-zague veloz esquivando dos pingos de tinta', 'agi', 13, 'Com reflexos de campeão, você dribla cada gota e alcança o outro lado intacto!', 'Uma saraivada de tinta mágica queima sua bochecha antes de você conseguir se abrigar (-12 HP)!', 12, 7, 'confronto_devorador', 'confronto_devorador', '2026-09-04 14:25:53', '2026-09-04 15:10:16'),
('d4f56279-7231-4a3f-b5bc-14edde255ca8', '414256a1-54fe-42aa-8a1f-2749e4939090', 1, 'Rugir um grito de guerra intimidador para paralisá-los de medo', 'cha', 10, 'Sua presença majestosa e voz trovejante faz os monstrinhos soltarem tudo e fugirem apavorados!', 'O grito sai desafinado e as criaturas percebem sua hesitação, jogando cinzas quentes em você (-10 HP)!', 10, 8, 'duelo_goblin', 'piso_brinquedos', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('d6ccea19-21e6-483b-b464-765f8b3290c7', '1ddf9e7a-d858-4e03-be3e-f5d65e5badc9', 1, 'Saltar com agilidade e ritmo impecável de capa em capa', 'agi', 12, 'Leve como uma pluma, você corre sobre os livros voadores sem fazê-los oscilar nem um centímetro!', 'Um tomo fecha de repente! Você perde o equilíbrio e raspa as pernas na beirada de pedra (-14 HP)!', 14, 8, 'confronto_devorador', 'sala_pergaminhos', '2026-09-04 14:25:52', '2026-09-04 15:10:16'),
('da59be5f-262d-4bc4-ac01-a2b4f445cbf6', 'da4ee5fc-3854-44d0-9ad6-4e2377878269', 3, 'Aparar o impacto do golpe do gigante com resistência suprema', 'con', 15, 'Como uma fortaleza viva, você não recua nenhum milímetro e contra-ataca derrubando o colosso!', 'O impacto colossal quebra sua postura e atira você contra os pilares do salão (-18 HP)!', 18, 14, NULL, NULL, '2026-09-04 14:25:54', '2026-09-04 14:25:54'),
('dc1c24b8-87c0-4a15-9f2e-9ad3bbfd10f6', 'ed56ec62-2c83-48ab-8088-f2dcc6b8e865', 1, 'Resistir ao sufocamento e avançar às cegas com o peito aberto', 'con', 11, 'Pulmões heróicos! Você ignora a ardência, rompe a fumaça e ganha terreno limpo!', 'A tosse violenta dobra seus joelhos e o ar rarefeito drena sua força (-12 HP)!', 12, 6, 'piso_brinquedos', 'nevoa_poeira', '2026-09-04 15:10:15', '2026-09-04 15:10:15'),
('e2af5f8b-9ef3-46fd-90b5-01070134f843', 'e8f6a2b7-8cdc-4987-b9f6-acf95414f7d4', 2, 'Destreza: Utilizar ferramentas de gazua para arrombar em silêncio', 'agi', 10, 'Click! Com mãos precisas e ágeis, os pinos de bronze cedem e o trinco desliza sem nenhum rangido!', 'Crack! A gazua entorta e quebra no interior do miolo, trancando a fechadura e machucando seus dedos (-10 HP)!', 10, 5, 'sala_infiltrada', 'fechadura_quebrada', '2026-09-04 14:25:51', '2026-09-04 15:10:13'),
('e3541d2e-ae80-4e64-978e-f350ad20c809', '7bba0235-3db9-4659-91b9-f84f66d699e3', 3, 'Golpear o baú principal de surpresa com sua arma', 'str', 11, 'O ataque certeiro quebra a fortaleza de bagunça e derruba as sentinelas em pânico!', 'Você erra o golpe nas sombras e acerta um cano de ferro que estremece seus braços (-10 HP)!', 10, 7, 'duelo_goblin', 'nevoa_poeira', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('e6a21348-9639-4a52-a3dd-62afb68314b1', 'bfa8ea43-ff58-47f8-886c-e947870c5c68', 1, 'Silenciar os ecos com um grito de motivação e dever familiar', 'cha', 13, 'Sua convicção pura faz os fantasmas covardes se calarem e desaparecerem no nada!', 'As desculpas sussurram na sua orelha e paralisam sua vontade momentaneamente (-15 HP)!', 15, 10, 'confronto_tita', 'confronto_tita', '2026-09-04 15:10:17', '2026-09-04 15:10:17'),
('e94acbe5-e52b-4602-bd0c-8bf78e455a79', '6f7a00eb-6568-477f-bd87-fd4867b08748', 1, 'Decifrar as três runas do cadeado ancestral', 'int', 10, 'As runas brilham em azul safira! O ferrolho desliza suavemente com um tilintar harmonioso!', 'Um choque mágico menor atinge suas pontas dos dedos, mas a fechadura cede (-8 HP)!', 8, 15, NULL, NULL, '2026-09-04 14:25:52', '2026-09-04 14:25:52'),
('eed160ec-a796-425a-91f8-f8cb4e3e085c', '3be9bfa3-390d-4d9d-b10a-02b646278942', 2, 'Usar o escudo pesado para bloquear a lateral de uma lâmina', 'str', 14, 'Com força hercúlea você desvia o pêndulo e abre espaço seguro para passar!', 'O impacto violento do pêndulo entorta a empunhadura do seu escudo (-16 HP)!', 16, 10, 'confronto_tita', 'fosso_desculpas', '2026-09-04 14:25:53', '2026-09-04 15:10:17'),
('ef6f63d8-5c63-4f4f-bd6b-3ef8cc4c5b8a', '4946bdc0-f7c9-4355-b389-733e027eeecd', 1, 'Desferir um golpe demolidor no ponto fraco do peito de rocha', 'str', 14, 'CRASH! Seu golpe despedaça a carcaça de preguiça do monstro, que desaba em pó inofensivo!', 'O martelo de areia do Titã golpeia o chão e a onda sísmica arremessa você na parede (-18 HP)!', 18, 15, 'bau_rubi_tempo', 'bau_rubi_tempo', '2026-09-04 15:10:17', '2026-09-04 15:10:17'),
('f1777d51-25a5-4b82-bfd2-ac7a1818c911', '6f7a00eb-6568-477f-bd87-fd4867b08748', 2, 'Utilizar a Gazua da Sorte girando os pinos de metal', 'luk', 9, 'Click! Um estalo triunfal ecoa no sótão e a tampa se abre de par em par com brilho dourado!', 'A gazua entorta, forçando você a puxar a trava na marra com um arranhão no braço (-8 HP)!', 8, 15, NULL, NULL, '2026-09-04 14:25:52', '2026-09-04 14:25:52'),
('f1f8aef5-28a4-431c-93d7-9b39ccdd6e06', '6444f056-5d35-4ba2-84ee-ef02d8cd6850', 2, 'Traçar uma rota geométrica segura pelas lacunas do assoalho', 'int', 10, 'Com raciocínio tático impecável, você caminha como um mestre de xadrez sem encostar em nada!', 'Uma rodinha de patins solta faz seu calcanhar deslizar bruscamente (-12 HP)!', 12, 8, 'duelo_goblin', 'duelo_goblin', '2026-09-04 14:25:52', '2026-09-04 15:10:15'),
('f42ab4ae-d0c6-4629-b072-cf8b67365562', 'a7200f90-2e4d-4a8e-8584-4ec003e3297f', 3, 'Avançar com passos calculados e recolher moedas antigas no chão', 'luk', 10, 'Além de passar incólume pelas defesas, você encontra um punhado de moedas de ouro reluzentes!', 'Você pisa num assoalho falso e sua perna cai num buraco até o quadril (-10 HP)!', 10, 12, 'duelo_goblin', 'piso_brinquedos', '2026-09-04 15:10:15', '2026-09-04 15:10:15'),
('f5d3624a-4414-4cf5-a30f-177648605d79', '609f4747-7edb-4303-8b09-f8d5d679d941', 2, 'Arremessar sua arma com toda a força contra o vidro', 'str', 14, 'A arma voa com fúria destrutiva e despedaça a ilusão em mil pedaços!', 'A arma ricocheteia no vidro mágico e atinge seu joelho na volta (-15 HP)!', 15, 10, NULL, NULL, '2026-09-04 14:25:54', '2026-09-04 14:25:54'),
('f6d40c20-0cbf-449f-8e19-2f4e3a8a3822', 'ffde7237-d34e-4e5c-ba2a-d8af70cab170', 1, 'Marchar contra o vendaval com determinação inabalável', 'con', 11, 'Sua firmeza inquebrável corta o vórtice ao meio! A tempestade se dissipa!', 'Um livro antigo voa em alta velocidade e acerta seu peito com força (-12 HP)!', 12, 7, 'duelo_goblin', 'piso_brinquedos', '2026-09-04 14:25:51', '2026-09-04 15:10:15'),
('fb6dc74d-edfb-4e31-a612-280fe207f08c', 'a7200f90-2e4d-4a8e-8584-4ec003e3297f', 1, 'Consultar os mapas do sótão antigos para neutralizar as armadilhas', 'int', 10, 'Com os planos na mente, você desativa os mecanismos do sótão e segue em linha reta ao mestre!', 'Um erro de leitura aciona uma estante que cai na sua direção de surpresa (-10 HP)!', 10, 10, 'duelo_goblin', 'nevoa_poeira', '2026-09-04 15:10:14', '2026-09-04 15:10:14'),
('fbe88f0b-1727-4e47-bdb8-3b95c4f8c373', 'da4ee5fc-3854-44d0-9ad6-4e2377878269', 2, 'Alvejar a engrenagem central do peito com precisão letal', 'int', 14, 'Você identifica a mola-mestra do monstro e desfere um golpe fatal, fazendo o colosso desmoronar!', 'O colosso dispara uma onda de areia estagnada que fustiga sua pele dolorosamente (-18 HP)!', 18, 16, NULL, NULL, '2026-09-04 14:25:54', '2026-09-04 14:25:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_dungeon_adventures`
--

CREATE TABLE `family_dungeon_adventures` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `cover_icon` varchar(50) NOT NULL DEFAULT '?',
  `difficulty_level` enum('EASY','MEDIUM','HARD') NOT NULL DEFAULT 'MEDIUM',
  `energy_cost` int(11) NOT NULL DEFAULT 5,
  `base_gold_reward` int(11) NOT NULL DEFAULT 50,
  `base_xp_reward` int(11) NOT NULL DEFAULT 80,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_dungeon_adventures`
--

INSERT INTO `family_dungeon_adventures` (`id`, `code`, `title`, `description`, `cover_icon`, `difficulty_level`, `energy_cost`, `base_gold_reward`, `base_xp_reward`, `is_active`, `created_at`, `updated_at`) VALUES
('d1d4afde-bfea-42ec-9328-26a5c2808405', 'covil_goblin_poeira', 'O Covil do Goblin da Poeira', 'Um redemoinho de sujeira e bagunça tomou conta do sótão ancestral da mansão. O Goblin da Poeira escondeu pertences valiosos entre pilhas de desordem. Suas escolhas definirão caminhos completamente diferentes pela masmorra!', '🧹', 'EASY', 5, 45, 70, 1, '2026-09-04 14:25:51', '2026-09-04 15:10:13'),
('e752cb6d-6794-4e3d-8415-59457b7c88e0', 'catacumbas_procrastinacao', 'As Catacumbas da Procrastinação Eterna', 'Um labirinto subterrâneo onde o tempo passa devagar e uma gosma mágica chamada \"Depois Eu Faço\" tenta prender os heróis no sono eterno. O Titã da Procrastinação guarda o tesouro dos minutos perdidos!', '⏳', 'HARD', 5, 75, 110, 1, '2026-09-04 14:25:53', '2026-09-04 14:25:53'),
('ec24c4a8-5847-4d28-8d91-e7cf4898f011', 'torre_devorador_paginas', 'A Torre do Devorador de Páginas', 'No alto da biblioteca flutuante do reino, o Devorador de Páginas está roendo os segredos dos livros de conhecimento e lições escolares. Decifre os enigmas arcanos, prove sua inteligência e salve a sabedoria da família!', '📚', 'MEDIUM', 5, 60, 90, 1, '2026-09-04 14:25:52', '2026-09-04 14:25:52');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_dungeon_runs`
--

CREATE TABLE `family_dungeon_runs` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `character_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `adventure_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `status` enum('IN_PROGRESS','VICTORY','DEFEAT') NOT NULL DEFAULT 'IN_PROGRESS',
  `final_hp` int(11) NOT NULL DEFAULT 30,
  `choices_log` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`choices_log`)),
  `rewards_collected` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rewards_collected`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_dungeon_runs`
--

INSERT INTO `family_dungeon_runs` (`id`, `user_id`, `character_id`, `adventure_id`, `status`, `final_hp`, `choices_log`, `rewards_collected`, `created_at`, `updated_at`) VALUES
('00b8c067-1ba3-409e-bef5-8fd6231d6eb9', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'IN_PROGRESS', 30, '[]', '{}', '2026-09-04 15:16:26', '2026-09-04 15:16:26'),
('190ea125-05bb-45af-86af-15c09faaa0fe', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'VICTORY', 36, '[{\"action\":{\"id\":\"3de36d59-72e5-4caa-a4e1-519cc3c828b8\",\"scene_id\":\"e8f6a2b7-8cdc-4987-b9f6-acf95414f7d4\",\"action_number\":3,\"title\":\"Inteligência: Procurar uma chave escondida ao redor da região\",\"attribute_code\":\"int\",\"difficulty_dc\":9,\"success_text\":\"Investigando com olhar atento o batente superior, seus dedos encontram a Chave de Latão Secreta!\",\"failure_text\":\"Ao mexer numa tábua solta, você esbarra num gatilho oculto que dispara uma nuvem de pó nos seus olhos (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":8,\"success_scene_code\":\"sala_chave_mestra\",\"failure_scene_code\":\"armadilha_poeira\",\"createdAt\":\"2026-09-04T14:25:51.000Z\",\"updatedAt\":\"2026-09-04T15:10:14.000Z\"},\"d20\":18,\"mod\":8,\"total\":26,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"797119ea-5c74-4c26-859c-efa70584846b\",\"scene_id\":\"a7200f90-2e4d-4a8e-8584-4ec003e3297f\",\"action_number\":2,\"title\":\"Invocar o apoio dos guardiões familiares para iluminar o caminho\",\"attribute_code\":\"cha\",\"difficulty_dc\":10,\"success_text\":\"Uma aura de bravura protege seus passos e as sombras de desordem se dissolvem!\",\"failure_text\":\"Uma lufada de vento gélido apaga suas tochas e gela seu peito (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":8,\"success_scene_code\":\"duelo_goblin\",\"failure_scene_code\":\"piso_brinquedos\",\"createdAt\":\"2026-09-04T15:10:14.000Z\",\"updatedAt\":\"2026-09-04T15:10:14.000Z\"},\"d20\":16,\"mod\":0,\"total\":16,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"63a8c6e4-ec6a-450d-9044-8e0825659983\",\"scene_id\":\"76b569b1-cac5-4a14-82fe-f4c2596791d6\",\"action_number\":1,\"title\":\"Investir com corte firme e decepar o espanador sombrio\",\"attribute_code\":\"str\",\"difficulty_dc\":12,\"success_text\":\"Seu golpe certeiro corta o cabo do espanador mágico! O goblin cai de costas em desespero!\",\"failure_text\":\"O monstro salta ágil e chicoteia seu peito com pó cáustico (-14 HP)!\",\"failure_damage\":14,\"bonus_gold\":10,\"success_scene_code\":\"bau_tesouro_goblin\",\"failure_scene_code\":\"bau_tesouro_goblin\",\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T15:10:15.000Z\"},\"d20\":4,\"mod\":1,\"total\":5,\"isSuccess\":false,\"damageTaken\":14},{\"action\":{\"id\":\"f1777d51-25a5-4b82-bfd2-ac7a1818c911\",\"scene_id\":\"6f7a00eb-6568-477f-bd87-fd4867b08748\",\"action_number\":2,\"title\":\"Utilizar a Gazua da Sorte girando os pinos de metal\",\"attribute_code\":\"luk\",\"difficulty_dc\":9,\"success_text\":\"Click! Um estalo triunfal ecoa no sótão e a tampa se abre de par em par com brilho dourado!\",\"failure_text\":\"A gazua entorta, forçando você a puxar a trava na marra com um arranhão no braço (-8 HP)!\",\"failure_damage\":8,\"bonus_gold\":15,\"success_scene_code\":null,\"failure_scene_code\":null,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":10,\"mod\":1,\"total\":11,\"isSuccess\":true,\"damageTaken\":0}]', '{\"gold\":76,\"xp\":70,\"attribute_boosted\":\"Inteligência\"}', '2026-09-04 17:14:38', '2026-09-04 17:14:55'),
('1bd7ee39-e9c0-4a52-b459-588240820b24', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'VICTORY', 24, '[{\"action\":{\"id\":\"7afe486f-1dd5-4f00-abac-5efddb8edd48\",\"scene_id\":\"e8f6a2b7-8cdc-4987-b9f6-acf95414f7d4\",\"action_number\":1,\"title\":\"Erguer e remover a pilha de caixas pesadas\",\"attribute_code\":\"str\",\"difficulty_dc\":10,\"success_text\":\"Com um esforço muscular exemplar, você levanta o baú de ferro e desobstrui o corredor sem fazer barulho!\",\"failure_text\":\"A caixa escorrega de suas mãos e desaba sobre o seu pé, causando um baque doloroso (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":5,\"createdAt\":\"2026-09-04T14:25:51.000Z\",\"updatedAt\":\"2026-09-04T14:25:51.000Z\"},\"d20\":19,\"mod\":0,\"total\":19,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"f6d40c20-0cbf-449f-8e19-2f4e3a8a3822\",\"scene_id\":\"ffde7237-d34e-4e5c-ba2a-d8af70cab170\",\"action_number\":1,\"title\":\"Prender a respiração e marchar firme contra o vórtice\",\"attribute_code\":\"con\",\"difficulty_dc\":10,\"success_text\":\"Seus pulmões de ferro e determinação inabalável atravessam o vendaval cinzento sem vacilar!\",\"failure_text\":\"O pó asfixiante entra no seu peito, provocando uma crise de tosse violenta (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":5,\"createdAt\":\"2026-09-04T14:25:51.000Z\",\"updatedAt\":\"2026-09-04T14:25:51.000Z\"},\"d20\":10,\"mod\":0,\"total\":10,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"40d9b821-c173-4b10-a9eb-d890cea80617\",\"scene_id\":\"6444f056-5d35-4ba2-84ee-ef02d8cd6850\",\"action_number\":1,\"title\":\"Saltar de viga em viga pelo teto com destreza física\",\"attribute_code\":\"agi\",\"difficulty_dc\":11,\"success_text\":\"Você salta acrobaticamente entre os caibros do teto, pousando com leveza do outro lado!\",\"failure_text\":\"O salto fica curto! Você cai de pé sobre um bloco pontiagudo de quina viva (-12 HP)!\",\"failure_damage\":12,\"bonus_gold\":6,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":9,\"mod\":1,\"total\":10,\"isSuccess\":false,\"damageTaken\":12},{\"action\":{\"id\":\"63a8c6e4-ec6a-450d-9044-8e0825659983\",\"scene_id\":\"76b569b1-cac5-4a14-82fe-f4c2596791d6\",\"action_number\":1,\"title\":\"Investir bravamente com sua arma e cortar o espanador\",\"attribute_code\":\"str\",\"difficulty_dc\":12,\"success_text\":\"Seu golpe certeiro decepa a haste do espanador mágico! O goblin cai de costas, apavorado!\",\"failure_text\":\"O monstro desvia rápido e atinge seu peitoral com uma rajada de fumaça cinzenta (-14 HP)!\",\"failure_damage\":14,\"bonus_gold\":10,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":8,\"mod\":0,\"total\":8,\"isSuccess\":false,\"damageTaken\":14},{\"action\":{\"id\":\"e94acbe5-e52b-4602-bd0c-8bf78e455a79\",\"scene_id\":\"6f7a00eb-6568-477f-bd87-fd4867b08748\",\"action_number\":1,\"title\":\"Decifrar as três runas do cadeado ancestral\",\"attribute_code\":\"int\",\"difficulty_dc\":10,\"success_text\":\"As runas brilham em azul safira! O ferrolho desliza suavemente com um tilintar harmonioso!\",\"failure_text\":\"Um choque mágico menor atinge suas pontas dos dedos, mas a fechadura cede (-8 HP)!\",\"failure_damage\":8,\"bonus_gold\":15,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":9,\"mod\":8,\"total\":17,\"isSuccess\":true,\"damageTaken\":0}]', '{\"gold\":70,\"xp\":70,\"attribute_boosted\":\"Força\"}', '2026-09-04 14:58:20', '2026-09-04 14:58:33'),
('1c404371-f08f-4cf1-a732-ece6b01e8d35', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'VICTORY', 6, '[{\"action\":{\"id\":\"3de36d59-72e5-4caa-a4e1-519cc3c828b8\",\"scene_id\":\"e8f6a2b7-8cdc-4987-b9f6-acf95414f7d4\",\"action_number\":3,\"title\":\"Analisar o centro de gravidade e retirar a caixa-chave\",\"attribute_code\":\"int\",\"difficulty_dc\":9,\"success_text\":\"Sua mente lógica identifica exatamente qual caixa sustenta o monte. Ao puxá-la, a pilha se acomoda suavemente!\",\"failure_text\":\"O cálculo falha e uma chuva de livros antigos despenca na sua cabeça (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":8,\"createdAt\":\"2026-09-04T14:25:51.000Z\",\"updatedAt\":\"2026-09-04T14:25:51.000Z\"},\"d20\":19,\"mod\":5,\"total\":24,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"03727c67-a601-4a6e-9b41-6dad0641a6ae\",\"scene_id\":\"ffde7237-d34e-4e5c-ba2a-d8af70cab170\",\"action_number\":2,\"title\":\"Entoar o hino de honra da família para soprar o medo\",\"attribute_code\":\"cha\",\"difficulty_dc\":10,\"success_text\":\"Sua voz melodiosa ressoa com luz acolhedora; a poeira encantada se dissipa ante a pureza do hino!\",\"failure_text\":\"Sua voz treme com o frio da sala, atraindo uma rajada de vento acre na sua face (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":6,\"createdAt\":\"2026-09-04T14:25:51.000Z\",\"updatedAt\":\"2026-09-04T14:25:51.000Z\"},\"d20\":4,\"mod\":0,\"total\":4,\"isSuccess\":false,\"damageTaken\":10},{\"action\":{\"id\":\"f1f8aef5-28a4-431c-93d7-9b39ccdd6e06\",\"scene_id\":\"6444f056-5d35-4ba2-84ee-ef02d8cd6850\",\"action_number\":2,\"title\":\"Desenhar uma rota lógica memorizando as lacunas do piso\",\"attribute_code\":\"int\",\"difficulty_dc\":10,\"success_text\":\"Com precisão analítica, você traça a rota perfeita e caminha com passos milimétricos sem risco!\",\"failure_text\":\"Uma distração momentânea faz seu pé escorregar sobre uma rodinha de carrinho (-12 HP)!\",\"failure_damage\":12,\"bonus_gold\":7,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":2,\"mod\":5,\"total\":7,\"isSuccess\":false,\"damageTaken\":12},{\"action\":{\"id\":\"a4147522-84eb-475b-93d7-a98822cc000b\",\"scene_id\":\"76b569b1-cac5-4a14-82fe-f4c2596791d6\",\"action_number\":2,\"title\":\"Efetuar rolamento rápido e flanquear a criatura pelas costas\",\"attribute_code\":\"agi\",\"difficulty_dc\":11,\"success_text\":\"Em um piscar de olhos você reaparece atrás do monstro e o encurrala com seu escudo de luz!\",\"failure_text\":\"O goblin antecipa seu movimento e joga um tapete de poeira nos seus olhos (-14 HP)!\",\"failure_damage\":14,\"bonus_gold\":8,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":5,\"mod\":1,\"total\":6,\"isSuccess\":false,\"damageTaken\":14},{\"action\":{\"id\":\"e94acbe5-e52b-4602-bd0c-8bf78e455a79\",\"scene_id\":\"6f7a00eb-6568-477f-bd87-fd4867b08748\",\"action_number\":1,\"title\":\"Decifrar as três runas do cadeado ancestral\",\"attribute_code\":\"int\",\"difficulty_dc\":10,\"success_text\":\"As runas brilham em azul safira! O ferrolho desliza suavemente com um tilintar harmonioso!\",\"failure_text\":\"Um choque mágico menor atinge suas pontas dos dedos, mas a fechadura cede (-8 HP)!\",\"failure_damage\":8,\"bonus_gold\":15,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":17,\"mod\":5,\"total\":22,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"e94acbe5-e52b-4602-bd0c-8bf78e455a79\",\"scene_id\":\"6f7a00eb-6568-477f-bd87-fd4867b08748\",\"action_number\":1,\"title\":\"Decifrar as três runas do cadeado ancestral\",\"attribute_code\":\"int\",\"difficulty_dc\":10,\"success_text\":\"As runas brilham em azul safira! O ferrolho desliza suavemente com um tilintar harmonioso!\",\"failure_text\":\"Um choque mágico menor atinge suas pontas dos dedos, mas a fechadura cede (-8 HP)!\",\"failure_damage\":8,\"bonus_gold\":15,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":15,\"mod\":5,\"total\":20,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"e94acbe5-e52b-4602-bd0c-8bf78e455a79\",\"scene_id\":\"6f7a00eb-6568-477f-bd87-fd4867b08748\",\"action_number\":1,\"title\":\"Decifrar as três runas do cadeado ancestral\",\"attribute_code\":\"int\",\"difficulty_dc\":10,\"success_text\":\"As runas brilham em azul safira! O ferrolho desliza suavemente com um tilintar harmonioso!\",\"failure_text\":\"Um choque mágico menor atinge suas pontas dos dedos, mas a fechadura cede (-8 HP)!\",\"failure_damage\":8,\"bonus_gold\":15,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":5,\"mod\":5,\"total\":10,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"e94acbe5-e52b-4602-bd0c-8bf78e455a79\",\"scene_id\":\"6f7a00eb-6568-477f-bd87-fd4867b08748\",\"action_number\":1,\"title\":\"Decifrar as três runas do cadeado ancestral\",\"attribute_code\":\"int\",\"difficulty_dc\":10,\"success_text\":\"As runas brilham em azul safira! O ferrolho desliza suavemente com um tilintar harmonioso!\",\"failure_text\":\"Um choque mágico menor atinge suas pontas dos dedos, mas a fechadura cede (-8 HP)!\",\"failure_damage\":8,\"bonus_gold\":15,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":12,\"mod\":5,\"total\":17,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"f1777d51-25a5-4b82-bfd2-ac7a1818c911\",\"scene_id\":\"6f7a00eb-6568-477f-bd87-fd4867b08748\",\"action_number\":2,\"title\":\"Utilizar a Gazua da Sorte girando os pinos de metal\",\"attribute_code\":\"luk\",\"difficulty_dc\":9,\"success_text\":\"Click! Um estalo triunfal ecoa no sótão e a tampa se abre de par em par com brilho dourado!\",\"failure_text\":\"A gazua entorta, forçando você a puxar a trava na marra com um arranhão no braço (-8 HP)!\",\"failure_damage\":8,\"bonus_gold\":15,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":4,\"mod\":1,\"total\":5,\"isSuccess\":false,\"damageTaken\":8}]', '{\"gold\":113,\"xp\":70,\"attribute_boosted\":\"Inteligência\"}', '2026-09-04 14:45:02', '2026-09-04 14:46:55'),
('1e18f45e-4678-4610-8008-3db4a6e97d43', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'IN_PROGRESS', 30, '[]', '{}', '2026-09-04 15:14:24', '2026-09-04 15:14:24'),
('6f6edcca-344e-4506-a5da-bce1089b28ac', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'IN_PROGRESS', 30, '[]', '{}', '2026-09-04 14:47:47', '2026-09-04 14:47:47'),
('ad85c2f2-a629-41f7-add1-fb445da22d04', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'VICTORY', 50, '[{\"action\":{\"id\":\"7afe486f-1dd5-4f00-abac-5efddb8edd48\",\"scene_id\":\"e8f6a2b7-8cdc-4987-b9f6-acf95414f7d4\",\"action_number\":1,\"title\":\"Físico: Dar um potente chute na porta para arrombá-la\",\"attribute_code\":\"str\",\"difficulty_dc\":10,\"success_text\":\"BOOM! O chute despedaça o trinco com violência heróica! A porta se escancara e você invade a sala num estrondo épico!\",\"failure_text\":\"O chute bate em cheio na viga de ferro com um baque surdo! A porta não abre e você torce o pé dolorosamente (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":5,\"success_scene_code\":\"sala_arrombada\",\"failure_scene_code\":\"porta_travada_alerta\",\"createdAt\":\"2026-09-04T14:25:51.000Z\",\"updatedAt\":\"2026-09-04T15:10:13.000Z\"},\"d20\":15,\"mod\":1,\"total\":16,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"9c0ca7a0-25d6-47ec-ba1c-b269607572fb\",\"scene_id\":\"414256a1-54fe-42aa-8a1f-2749e4939090\",\"action_number\":3,\"title\":\"Aproveitar o choque geral e disparar em velocidade heróica\",\"attribute_code\":\"agi\",\"difficulty_dc\":10,\"success_text\":\"Você corta o salão em zigue-zague veloz antes que qualquer um deles consiga reagir!\",\"failure_text\":\"Você tropeça numa vassoura velha caída no chão durante a corrida rápida (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":6,\"success_scene_code\":\"duelo_goblin\",\"failure_scene_code\":\"piso_brinquedos\",\"createdAt\":\"2026-09-04T15:10:14.000Z\",\"updatedAt\":\"2026-09-04T15:10:14.000Z\"},\"d20\":17,\"mod\":1,\"total\":18,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"bd628476-7555-4aa5-87a8-c56172c84e99\",\"scene_id\":\"76b569b1-cac5-4a14-82fe-f4c2596791d6\",\"action_number\":3,\"title\":\"Proclamar a Ordem da Casa: \\\"Aqui a Preguiça Não Tem Vez!\\\"\",\"attribute_code\":\"cha\",\"difficulty_dc\":11,\"success_text\":\"A energia moral da sua voz quebra a maldição do monstro! Ele encolhe e foge pelo telhado!\",\"failure_text\":\"Ele gargalha da sua ordem e lança uma onda de choque de poeira sufocante (-14 HP)!\",\"failure_damage\":14,\"bonus_gold\":10,\"success_scene_code\":\"bau_tesouro_goblin\",\"failure_scene_code\":\"bau_tesouro_goblin\",\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T15:10:15.000Z\"},\"d20\":20,\"mod\":0,\"total\":20,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"2fe2122e-9480-48bf-9fbf-40ca5129cd2e\",\"scene_id\":\"6f7a00eb-6568-477f-bd87-fd4867b08748\",\"action_number\":3,\"title\":\"Erguer a tampa de carvalho maciço com vigor heróico\",\"attribute_code\":\"con\",\"difficulty_dc\":10,\"success_text\":\"Seus músculos firmes sustentam o peso da tampa de chumbo e revelam o fabuloso tesouro!\",\"failure_text\":\"A tampa é incrivelmente pesada e machuca sua mão antes de abrir completamente (-8 HP)!\",\"failure_damage\":8,\"bonus_gold\":12,\"success_scene_code\":null,\"failure_scene_code\":null,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":15,\"mod\":0,\"total\":15,\"isSuccess\":true,\"damageTaken\":0}]', '{\"gold\":78,\"xp\":70,\"attribute_boosted\":\"Força\"}', '2026-09-04 15:47:17', '2026-09-04 15:48:56'),
('b82a83a5-8603-47b7-933b-157e32eac986', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'ec24c4a8-5847-4d28-8d91-e7cf4898f011', 'VICTORY', 16, '[{\"action\":{\"id\":\"cd561190-4629-4cd8-9d0a-6b23377e904a\",\"scene_id\":\"db69edbd-5ff3-404d-a9ac-4cc16b8fb5bc\",\"action_number\":3,\"title\":\"Forçar as duas batentes de bronze com ombro firme\",\"attribute_code\":\"str\",\"difficulty_dc\":13,\"success_text\":\"Com um urro de determinação, você supera a trava arcaica na força bruta!\",\"failure_text\":\"O bronze encantado repele seu impacto com uma onda de choque reverberante (-12 HP)!\",\"failure_damage\":12,\"bonus_gold\":6,\"success_scene_code\":\"escadaria_livros\",\"failure_scene_code\":\"sala_pergaminhos\",\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T15:10:16.000Z\"},\"d20\":11,\"mod\":1,\"total\":12,\"isSuccess\":false,\"damageTaken\":12},{\"action\":{\"id\":\"8bc05c68-adfe-4fa3-9af9-5530f1d9c048\",\"scene_id\":\"ff5749c1-8437-406a-8263-2664ced931d5\",\"action_number\":1,\"title\":\"Conjurar um escudo de foco e concentração inabalável\",\"attribute_code\":\"con\",\"difficulty_dc\":12,\"success_text\":\"Sua mente disciplinada repele o enxame de dispersão! As letras recuam ordenadas!\",\"failure_text\":\"O turbilhão de letras penetra sua defesa mental, causando tontura e dor de cabeça (-12 HP)!\",\"failure_damage\":12,\"bonus_gold\":8,\"success_scene_code\":\"confronto_devorador\",\"failure_scene_code\":\"confronto_devorador\",\"createdAt\":\"2026-09-04T14:25:53.000Z\",\"updatedAt\":\"2026-09-04T15:10:16.000Z\"},\"d20\":6,\"mod\":0,\"total\":6,\"isSuccess\":false,\"damageTaken\":12},{\"action\":{\"id\":\"c06a2bee-26db-4416-bb9e-9fcc162ec6dc\",\"scene_id\":\"2b8f9369-9afe-45fb-9c62-2e414c155e3f\",\"action_number\":2,\"title\":\"Investir com a espada encantada direto no coração de papiro\",\"attribute_code\":\"str\",\"difficulty_dc\":13,\"success_text\":\"Seu corte heroico perfura o núcleo arcano da criatura, libertando todas as letras aprisionadas!\",\"failure_text\":\"A mandíbula de madeira do monstro golpeia seu escudo com violência estarrecedora (-16 HP)!\",\"failure_damage\":16,\"bonus_gold\":10,\"success_scene_code\":\"bau_tomo_ancestral\",\"failure_scene_code\":\"bau_tomo_ancestral\",\"createdAt\":\"2026-09-04T14:25:53.000Z\",\"updatedAt\":\"2026-09-04T15:10:16.000Z\"},\"d20\":17,\"mod\":1,\"total\":18,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"b8a541ea-22ea-491d-8b05-147ab8dda567\",\"scene_id\":\"722e31a8-a08c-4b2b-81ff-40bbfc935061\",\"action_number\":3,\"title\":\"Sustentar os selos de proteção com vigor corporal\",\"attribute_code\":\"con\",\"difficulty_dc\":12,\"success_text\":\"Sua resistência heróica dissipa os últimos resquícios da maldição e liberta os tesouros!\",\"failure_text\":\"O esforço consome suas energias, mas a vitória é consumada com bravura (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":15,\"success_scene_code\":null,\"failure_scene_code\":null,\"createdAt\":\"2026-09-04T14:25:53.000Z\",\"updatedAt\":\"2026-09-04T14:25:53.000Z\"},\"d20\":5,\"mod\":0,\"total\":5,\"isSuccess\":false,\"damageTaken\":10}]', '{\"gold\":70,\"xp\":90,\"attribute_boosted\":\"Força\"}', '2026-09-05 16:27:45', '2026-09-05 16:28:02'),
('c01771b1-577c-4a35-85c9-ef3e058a9e48', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'IN_PROGRESS', 30, '[]', '{}', '2026-09-04 15:25:02', '2026-09-04 15:25:02'),
('de750808-873a-4235-9ba2-82d202ce6db4', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'VICTORY', 40, '[{\"action\":{\"id\":\"7afe486f-1dd5-4f00-abac-5efddb8edd48\",\"scene_id\":\"e8f6a2b7-8cdc-4987-b9f6-acf95414f7d4\",\"action_number\":1,\"title\":\"Erguer e remover a pilha de caixas pesadas\",\"attribute_code\":\"str\",\"difficulty_dc\":10,\"success_text\":\"Com um esforço muscular exemplar, você levanta o baú de ferro e desobstrui o corredor sem fazer barulho!\",\"failure_text\":\"A caixa escorrega de suas mãos e desaba sobre o seu pé, causando um baque doloroso (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":5,\"createdAt\":\"2026-09-04T14:25:51.000Z\",\"updatedAt\":\"2026-09-04T14:25:51.000Z\"},\"d20\":20,\"mod\":0,\"total\":20,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"ba45f542-b4bf-47c9-8916-0be8fbdb324b\",\"scene_id\":\"ffde7237-d34e-4e5c-ba2a-d8af70cab170\",\"action_number\":3,\"title\":\"Procurar às cegas uma fresta com corrente de ar puro\",\"attribute_code\":\"luk\",\"difficulty_dc\":11,\"success_text\":\"O destino sorri! Sua mão encontra um alçapão de ventilação que sopra ar fresco e limpa o salão!\",\"failure_text\":\"Você tateia no escuro e esbarra numa viga de sustentação com o joelho (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":7,\"createdAt\":\"2026-09-04T14:25:51.000Z\",\"updatedAt\":\"2026-09-04T14:25:51.000Z\"},\"d20\":6,\"mod\":1,\"total\":7,\"isSuccess\":false,\"damageTaken\":10},{\"action\":{\"id\":\"f1f8aef5-28a4-431c-93d7-9b39ccdd6e06\",\"scene_id\":\"6444f056-5d35-4ba2-84ee-ef02d8cd6850\",\"action_number\":2,\"title\":\"Desenhar uma rota lógica memorizando as lacunas do piso\",\"attribute_code\":\"int\",\"difficulty_dc\":10,\"success_text\":\"Com precisão analítica, você traça a rota perfeita e caminha com passos milimétricos sem risco!\",\"failure_text\":\"Uma distração momentânea faz seu pé escorregar sobre uma rodinha de carrinho (-12 HP)!\",\"failure_damage\":12,\"bonus_gold\":7,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":6,\"mod\":8,\"total\":14,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"63a8c6e4-ec6a-450d-9044-8e0825659983\",\"scene_id\":\"76b569b1-cac5-4a14-82fe-f4c2596791d6\",\"action_number\":1,\"title\":\"Investir bravamente com sua arma e cortar o espanador\",\"attribute_code\":\"str\",\"difficulty_dc\":12,\"success_text\":\"Seu golpe certeiro decepa a haste do espanador mágico! O goblin cai de costas, apavorado!\",\"failure_text\":\"O monstro desvia rápido e atinge seu peitoral com uma rajada de fumaça cinzenta (-14 HP)!\",\"failure_damage\":14,\"bonus_gold\":10,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":20,\"mod\":0,\"total\":20,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"e94acbe5-e52b-4602-bd0c-8bf78e455a79\",\"scene_id\":\"6f7a00eb-6568-477f-bd87-fd4867b08748\",\"action_number\":1,\"title\":\"Decifrar as três runas do cadeado ancestral\",\"attribute_code\":\"int\",\"difficulty_dc\":10,\"success_text\":\"As runas brilham em azul safira! O ferrolho desliza suavemente com um tilintar harmonioso!\",\"failure_text\":\"Um choque mágico menor atinge suas pontas dos dedos, mas a fechadura cede (-8 HP)!\",\"failure_damage\":8,\"bonus_gold\":15,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":16,\"mod\":8,\"total\":24,\"isSuccess\":true,\"damageTaken\":0}]', '{\"gold\":82,\"xp\":70,\"attribute_boosted\":\"Força\"}', '2026-09-04 14:49:34', '2026-09-04 14:49:58'),
('f152dcc0-b8f4-420a-b1e2-c7f31d4762f6', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'IN_PROGRESS', 30, '[]', '{}', '2026-09-04 16:12:16', '2026-09-04 16:12:16'),
('fd5ae851-a240-4eee-a90c-4e4cfdf27434', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 'VICTORY', 18, '[{\"action\":{\"id\":\"7afe486f-1dd5-4f00-abac-5efddb8edd48\",\"scene_id\":\"e8f6a2b7-8cdc-4987-b9f6-acf95414f7d4\",\"action_number\":1,\"title\":\"Erguer e remover a pilha de caixas pesadas\",\"attribute_code\":\"str\",\"difficulty_dc\":10,\"success_text\":\"Com um esforço muscular exemplar, você levanta o baú de ferro e desobstrui o corredor sem fazer barulho!\",\"failure_text\":\"A caixa escorrega de suas mãos e desaba sobre o seu pé, causando um baque doloroso (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":5,\"createdAt\":\"2026-09-04T14:25:51.000Z\",\"updatedAt\":\"2026-09-04T14:25:51.000Z\"},\"d20\":7,\"mod\":0,\"total\":7,\"isSuccess\":false,\"damageTaken\":10},{\"action\":{\"id\":\"ba45f542-b4bf-47c9-8916-0be8fbdb324b\",\"scene_id\":\"ffde7237-d34e-4e5c-ba2a-d8af70cab170\",\"action_number\":3,\"title\":\"Procurar às cegas uma fresta com corrente de ar puro\",\"attribute_code\":\"luk\",\"difficulty_dc\":11,\"success_text\":\"O destino sorri! Sua mão encontra um alçapão de ventilação que sopra ar fresco e limpa o salão!\",\"failure_text\":\"Você tateia no escuro e esbarra numa viga de sustentação com o joelho (-10 HP)!\",\"failure_damage\":10,\"bonus_gold\":7,\"createdAt\":\"2026-09-04T14:25:51.000Z\",\"updatedAt\":\"2026-09-04T14:25:51.000Z\"},\"d20\":14,\"mod\":1,\"total\":15,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"f1f8aef5-28a4-431c-93d7-9b39ccdd6e06\",\"scene_id\":\"6444f056-5d35-4ba2-84ee-ef02d8cd6850\",\"action_number\":2,\"title\":\"Desenhar uma rota lógica memorizando as lacunas do piso\",\"attribute_code\":\"int\",\"difficulty_dc\":10,\"success_text\":\"Com precisão analítica, você traça a rota perfeita e caminha com passos milimétricos sem risco!\",\"failure_text\":\"Uma distração momentânea faz seu pé escorregar sobre uma rodinha de carrinho (-12 HP)!\",\"failure_damage\":12,\"bonus_gold\":7,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":17,\"mod\":4,\"total\":21,\"isSuccess\":true,\"damageTaken\":0},{\"action\":{\"id\":\"63a8c6e4-ec6a-450d-9044-8e0825659983\",\"scene_id\":\"76b569b1-cac5-4a14-82fe-f4c2596791d6\",\"action_number\":1,\"title\":\"Investir bravamente com sua arma e cortar o espanador\",\"attribute_code\":\"str\",\"difficulty_dc\":12,\"success_text\":\"Seu golpe certeiro decepa a haste do espanador mágico! O goblin cai de costas, apavorado!\",\"failure_text\":\"O monstro desvia rápido e atinge seu peitoral com uma rajada de fumaça cinzenta (-14 HP)!\",\"failure_damage\":14,\"bonus_gold\":10,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":11,\"mod\":0,\"total\":11,\"isSuccess\":false,\"damageTaken\":14},{\"action\":{\"id\":\"2fe2122e-9480-48bf-9fbf-40ca5129cd2e\",\"scene_id\":\"6f7a00eb-6568-477f-bd87-fd4867b08748\",\"action_number\":3,\"title\":\"Erguer a tampa de carvalho maciço com vigor heróico\",\"attribute_code\":\"con\",\"difficulty_dc\":10,\"success_text\":\"Seus músculos firmes sustentam o peso da tampa de chumbo e revelam o fabuloso tesouro!\",\"failure_text\":\"A tampa é incrivelmente pesada e machuca sua mão antes de abrir completamente (-8 HP)!\",\"failure_damage\":8,\"bonus_gold\":12,\"createdAt\":\"2026-09-04T14:25:52.000Z\",\"updatedAt\":\"2026-09-04T14:25:52.000Z\"},\"d20\":6,\"mod\":0,\"total\":6,\"isSuccess\":false,\"damageTaken\":8}]', '{\"gold\":59,\"xp\":70,\"attribute_boosted\":\"Inteligência\"}', '2026-09-04 14:43:16', '2026-09-04 14:44:37');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_dungeon_scenes`
--

CREATE TABLE `family_dungeon_scenes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `adventure_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `step_order` int(11) NOT NULL DEFAULT 1,
  `scene_code` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `narrative_text` text NOT NULL,
  `scene_icon` varchar(50) DEFAULT '?️',
  `scene_image_url` varchar(255) DEFAULT NULL,
  `is_final_scene` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_dungeon_scenes`
--

INSERT INTO `family_dungeon_scenes` (`id`, `adventure_id`, `step_order`, `scene_code`, `title`, `narrative_text`, `scene_icon`, `scene_image_url`, `is_final_scene`, `created_at`, `updated_at`) VALUES
('16a17ebd-4777-43e1-8f07-65d201a9f9fd', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 2, 'porta_travada_alerta', 'Alarme Soado: O Sótão em Alerta', 'A porta permaneceu imóvel e o estrondo alertou os habitantes do covil. Do outro lado da fresta, você escuta passos apressados e uma voz estridente sussurrando: \"Tem alguém tentando invadir! Preparem as armadilhas de poeira!\". Você precisa agir rápido!', '🚨', '/assets/dungeons/scenes/covil_porta_travada.jpg', 0, '2026-09-04 15:10:14', '2026-09-04 16:48:09'),
('1ddf9e7a-d858-4e03-be3e-f5d65e5badc9', 'ec24c4a8-5847-4d28-8d91-e7cf4898f011', 2, 'escadaria_livros', 'A Escadaria dos Tomos Flutuantes', 'O interior da torre é um abismo espiral sem chão fixo. Para subir, você precisa saltar sobre grossos livros de feitiços que flutuam no ar ao sabor de ventos mágicos inconstantes.', '📖', '/assets/dungeons/torre_devorador_paginas.jpg', 0, '2026-09-04 14:25:52', '2026-09-04 16:48:09'),
('2b8f9369-9afe-45fb-9c62-2e414c155e3f', 'ec24c4a8-5847-4d28-8d91-e7cf4898f011', 4, 'confronto_devorador', 'O Duelo contra o Devorador de Páginas', 'No topo da cúpula, uma fera monstruosa feita de capas de couro, pergaminhos rasgados e dentes de penas afiadas mastiga enciclopédias: é o Devorador de Páginas! Seus olhos brilham com a preguiça intelectual dos maus estudantes.', '🐉', '/assets/dungeons/torre_devorador_paginas.jpg', 0, '2026-09-04 14:25:53', '2026-09-04 16:48:09'),
('377af57d-1583-4ca6-b3d8-e11bbc48dcb7', 'e752cb6d-6794-4e3d-8415-59457b7c88e0', 5, 'bau_tempo_conquistado', 'O Cofre do Tempo Conquistado', 'O titã desmancha em areia dourada e os relógios voltam a funcionar harmoniosamente! Diante de você ergue-se o Baú Dourado da Vitória Suprema, lacrado com engrenagens de ouro maciço.', '🏆', '/assets/dungeons/catacumbas_procrastinacao.jpg', 1, '2026-09-04 14:25:54', '2026-09-04 16:48:09'),
('3be9bfa3-390d-4d9d-b10a-02b646278942', 'e752cb6d-6794-4e3d-8415-59457b7c88e0', 2, 'pendulos_ampulheta', 'O Corredor dos Pêndulos de Areia', 'O teto desta galeria estreita é guarnecido por gigantescas lâminas em forma de ampulhetas que oscilam em ritmo descompassado. Um aviso diz: \"Quem perde tempo, perde a vida\".', '⏱️', '/assets/dungeons/catacumbas_procrastinacao.jpg', 0, '2026-09-04 14:25:53', '2026-09-04 16:48:09'),
('414256a1-54fe-42aa-8a1f-2749e4939090', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 2, 'sala_arrombada', 'Invasão Triunfal: A Sala Assustada', 'A porta se estilhaça e você entra com ímpeto na sala! Várias sombras de poeira e servos goblins param imediatamente o que estavam fazendo, boquiabertos e com os olhos arregalados encarando você em choque!', '💥', '/assets/dungeons/scenes/covil_sala_arrombada.jpg', 0, '2026-09-04 15:10:14', '2026-09-04 16:48:09'),
('41dd4567-a3c5-4c28-b8f2-4c0d27156133', 'e752cb6d-6794-4e3d-8415-59457b7c88e0', 1, 'catacumbas_entrada', 'O Pântano do \"Depois Eu Faço\"', 'Ao descer os degraus de pedra úmida, seus pés afundam em um lodo roxo pegajoso. Vozes sussurram no ar: \"Descanse um pouco... Para que fazer agora? Deixe para amanhã...\". Seus membros começam a ficar pesados como chumbo.', '🕳️', '/assets/dungeons/catacumbas_procrastinacao.jpg', 0, '2026-09-04 14:25:53', '2026-09-04 16:48:09'),
('4946bdc0-f7c9-4355-b389-733e027eeecd', 'e752cb6d-6794-4e3d-8415-59457b7c88e0', 4, 'confronto_tita', 'O Confronto com o Titã da Procrastinação', 'No salão central, ergue-se uma estátua colossal viva de rocha escura e areia movediça: o Titã da Procrastinação! Ele segura um martelo em formato de ampulheta que esmaga os segundos.', '🗿', '/assets/dungeons/catacumbas_procrastinacao.jpg', 0, '2026-09-04 15:10:17', '2026-09-04 16:48:09'),
('609f4747-7edb-4303-8b09-f8d5d679d941', 'e752cb6d-6794-4e3d-8415-59457b7c88e0', 3, 'espelho_desculpas', 'O Espelho das Mil Desculpas', 'Uma barreira translúcida de vidro encantado reflete sua imagem, mas seu reflexo mente dizendo: \"Você já trabalhou demais hoje... Você merece rolar feeds e jogar videogame por 6 horas sem parar...\".', '🪞', '/assets/dungeons/catacumbas_procrastinacao.jpg', 0, '2026-09-04 14:25:54', '2026-09-04 16:48:09'),
('6444f056-5d35-4ba2-84ee-ef02d8cd6850', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 3, 'piso_brinquedos', 'O Campo de Armadilhas Pontiagudas', 'O piso foi semeado com blocos triangulares pontiagudos, brinquedos de ponta e peças afiadas. Pisar em falso aqui é garantia de dor aguda e perda de fôlego!', '🧩', '/assets/dungeons/scenes/covil_sala_arrombada.jpg', 0, '2026-09-04 14:25:51', '2026-09-04 16:48:09'),
('6f7a00eb-6568-477f-bd87-fd4867b08748', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 5, 'bau_tesouro_goblin', 'A Câmara do Baú de Pinho Dourado', 'Com a desordem vencida, raios de sol atravessam a clarabóia do sótão iluminando um magnífico Baú de Pinho talhado com runas de ouro. O baú contém as relíquias do lar resgatadas da escuridão!', '👑', '/assets/dungeons/scenes/covil_bau_tesouro.jpg', 1, '2026-09-04 14:25:52', '2026-09-04 16:48:09'),
('722e31a8-a08c-4b2b-81ff-40bbfc935061', 'ec24c4a8-5847-4d28-8d91-e7cf4898f011', 5, 'bau_tomo_ancestral', 'O Santuário do Baú Arcano', 'Com o Devorador derrotado, os tomos da sabedoria voltam às estantes reluzindo em harmonia. No centro do tablado surge o Baú de Safira da Sabedoria, trancado com um segredo matemático reluzente.', '💎', '/assets/dungeons/torre_devorador_paginas.jpg', 1, '2026-09-04 14:25:53', '2026-09-04 16:48:09'),
('747ff633-64ea-474a-908d-62a4ffe7b06c', 'e752cb6d-6794-4e3d-8415-59457b7c88e0', 5, 'bau_rubi_tempo', 'A Câmara do Baú de Rubi Cronológico', 'O tempo volta a correr com leveza e serenidade. Na ponta de um pedestal de mármore branco surge o lendário Baú de Rubi, que guarda os minutos preciosos devolvidos à sua família!', '💎', '/assets/dungeons/catacumbas_procrastinacao.jpg', 1, '2026-09-04 15:10:17', '2026-09-04 16:48:09'),
('75a1287e-148c-48f9-b2fb-50360a6e9839', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 2, 'fechadura_quebrada', 'Tranca Danificada: O Desafio dos Ecos', 'A gazua se partiu no miolo e a fechadura travou de vez! Pequenos sinos de metal presos na porta badalam freneticamente, e um jato de fumaça acre começa a vazar pela fechadura emperrada!', '🔒', '/assets/dungeons/scenes/covil_porta_travada.jpg', 0, '2026-09-04 15:10:14', '2026-09-04 16:48:09'),
('76b569b1-cac5-4a14-82fe-f4c2596791d6', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 4, 'duelo_goblin', 'O Duelo contra o Goblin da Poeira', 'Empoleirado em uma montanha de malas antigas, surge o chefe do covil: o Goblin da Poeira! Olhos amarelos zombeteiros, ele brande um espanador negro que dispara lufadas de fumaça cinzenta. \"Ninguém limpa o meu reino da bagunça!\", berra ele!', '👾', '/assets/dungeons/scenes/covil_duelo_goblin.jpg', 0, '2026-09-04 14:25:52', '2026-09-04 16:48:09'),
('7bba0235-3db9-4659-91b9-f84f66d699e3', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 2, 'sala_infiltrada', 'Infiltração Furtiva: Posição de Emboscada', 'A porta destravou sem ruído. Você entra como uma sombra escorregadia no sótão escuro. Os goblins estão concentrados empilhando caixas velhas e nem notaram sua presença!', '🕵️', '/assets/dungeons/scenes/covil_sala_arrombada.jpg', 0, '2026-09-04 15:10:14', '2026-09-04 16:48:09'),
('a7200f90-2e4d-4a8e-8584-4ec003e3297f', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 2, 'sala_chave_mestra', 'O Corredor Secreto da Chave Dourada', 'A chave dourada girou como manteiga! Em vez de entrar no corredor barulhento, você descobriu um atalho secreto pelas paredes do sótão, ladeado por estantes de livros e relíquias de família intactas.', '🗝️', '/assets/dungeons/scenes/covil_sotao_entrada.jpg', 0, '2026-09-04 15:10:14', '2026-09-04 16:48:09'),
('bfa8ea43-ff58-47f8-886c-e947870c5c68', 'e752cb6d-6794-4e3d-8415-59457b7c88e0', 3, 'fosso_desculpas', 'O Fosso das Desculpas Esfarrapadas', 'Você cai em um poço onde ecos de desculpas ressoam infinitamente: \"Estou cansado\", \"Amanhã eu começo\", \"Hoje não dá tempo\". Fantasmas da preguiça puxam sua capa para baixo.', '👻', '/assets/dungeons/catacumbas_procrastinacao.jpg', 0, '2026-09-04 15:10:17', '2026-09-04 16:48:09'),
('da4ee5fc-3854-44d0-9ad6-4e2377878269', 'e752cb6d-6794-4e3d-8415-59457b7c88e0', 4, 'tita_procrastinacao', 'A Batalha contra o Titã da Procrastinação', 'O chão treme quando emerge o colosso: o Titã da Procrastinação! Uma criatura colossal feita de relógios parados, cobertores pesados e teias de aranha. Ele atira raios de cansaço que tentam colocá-lo para dormir para sempre!', '🗿', '/assets/dungeons/catacumbas_procrastinacao.jpg', 0, '2026-09-04 14:25:54', '2026-09-04 16:48:09'),
('db69edbd-5ff3-404d-a9ac-4cc16b8fb5bc', 'ec24c4a8-5847-4d28-8d91-e7cf4898f011', 1, 'portao_biblioteca', 'O Portal dos Enigmas Gravados', 'Você chega diante do enorme portal de bronze da Torre do Saber. Na porta, letras brilhantes formam uma charada: \"Quanto mais você tem de mim, menos você vê no escuro. Quem sou eu?\". Três fechaduras mágicas aguardam sua resposta.', '🚪', '/assets/dungeons/torre_devorador_paginas.jpg', 0, '2026-09-04 14:25:52', '2026-09-04 16:48:09'),
('e8f6a2b7-8cdc-4987-b9f6-acf95414f7d4', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 1, 'sotao_entrada', 'A Porta Misteriosa do Sótão', 'Você chega diante da imponente porta de madeira reforçada que dá acesso ao sótão esquecido. Ela está trancada e barulhos abafados de sussurros vêm do interior. Como você decide superá-la?', '🚪', '/assets/dungeons/scenes/covil_sotao_entrada.jpg', 0, '2026-09-04 14:25:51', '2026-09-04 16:48:08'),
('ed56ec62-2c83-48ab-8088-f2dcc6b8e865', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 2, 'armadilha_poeira', 'A Nuvem Asfixiante de Poeira', 'O pó cinzento entrou em seus olhos e pulmões! Uma cortina de poeira mágica obscurece tudo ao redor, e risadinhas estridentes zombam da sua tosse descontrolada.', '🌫️', '/assets/dungeons/scenes/covil_porta_travada.jpg', 0, '2026-09-04 15:10:15', '2026-09-04 16:48:09'),
('ff5749c1-8437-406a-8263-2664ced931d5', 'ec24c4a8-5847-4d28-8d91-e7cf4898f011', 3, 'sala_pergaminhos', 'O Labirinto das Letras Vivas', 'Você chega a um salão forrado de estantes infinitas. As letras fugiram das páginas e formam enxames de tinta que rodopiam como vespas. Quem for atingido esquece o que acabou de estudar!', '📜', '/assets/dungeons/torre_devorador_paginas.jpg', 0, '2026-09-04 14:25:53', '2026-09-04 16:48:09'),
('ffde7237-d34e-4e5c-ba2a-d8af70cab170', 'd1d4afde-bfea-42ec-9328-26a5c2808405', 3, 'nevoa_poeira', 'O Salão do Vórtice Sombrio', 'Um redemoinho cinzento gira furiosamente no centro do cômodo. Objetos esquecidos flutuam no vórtice, ameaçando atingir quem se aproxima!', '🌪️', '/assets/dungeons/covil_goblin_poeira.jpg', 0, '2026-09-04 14:25:51', '2026-09-04 16:48:09');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_events`
--

CREATE TABLE `family_events` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `event_time` varchar(10) DEFAULT '12:00',
  `category` enum('BIRTHDAY','FAMILY_OUTING','MEETING','PARTY','SPECIAL_LUNCH','OTHER') NOT NULL DEFAULT 'FAMILY_OUTING',
  `icon` varchar(30) NOT NULL DEFAULT '?',
  `color` varchar(20) NOT NULL DEFAULT '#f59e0b',
  `is_recurring_yearly` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_events`
--

INSERT INTO `family_events` (`id`, `family_id`, `created_by`, `title`, `description`, `event_date`, `event_time`, `category`, `icon`, `color`, `is_recurring_yearly`, `is_active`, `created_at`, `updated_at`) VALUES
('90081ec0-b1ea-4e32-91bd-db33634acec7', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '🌳🚴‍♂️ Passeio no Parque & Piquenique', 'Manhã ao ar livre, caminhada, pedalada e lanche especial sob a sombra das árvores.', '2026-11-22', '09:30', 'FAMILY_OUTING', '🌳', '#10b981', 0, 1, '2026-11-17 03:47:12', '2026-11-17 03:47:12'),
('d04e2a32-cd1b-428a-877f-1e8fec888a14', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '🎂 Aniversário Real da Casa', 'Celebração com bolo, salgadinhos e entrega de bênçãos e presentes reais.', '2026-12-07', '18:00', 'BIRTHDAY', '🎂', '#f59e0b', 1, 1, '2026-11-17 03:47:12', '2026-11-17 03:47:12'),
('e04ef918-a99d-4e93-bb5b-cc471c05dba8', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '🍕🎲 Noite da Pizza & Jogos do Clã', 'Rodízio caseiro e partidas no Salão de Jogos com toda a família reunida.', '2026-11-20', '20:00', 'FAMILY_OUTING', '🍕', '#ec4899', 0, 1, '2026-11-17 03:47:12', '2026-11-17 03:47:12');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_meals`
--

CREATE TABLE `family_meals` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `meal_date` date NOT NULL,
  `meal_type` enum('cafe','almoco','lanche','jantar','ceia') NOT NULL,
  `title` varchar(255) NOT NULL,
  `cooking_notes` text DEFAULT NULL,
  `routine_mode` enum('certinho','flexivel') NOT NULL DEFAULT 'certinho',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_meals`
--

INSERT INTO `family_meals` (`id`, `family_id`, `meal_date`, `meal_type`, `title`, `cooking_notes`, `routine_mode`, `created_at`, `updated_at`) VALUES
('0d0f2b8e-bd0c-49ae-9582-6fce3c393818', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-17', 'jantar', 'Peito de Frango Grelhado com Purê Dourado e Brócolis', 'Frango marinado no limão e ervas finas. Purê de mandioquinha sem leite gorduroso e brócolis no vapor.', 'certinho', '2026-11-17 01:23:02', '2026-11-17 01:23:04'),
('19a12e30-8726-413d-a0a9-5950757cd549', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-20', 'jantar', 'Peito de Frango Grelhado com Purê Dourado e Brócolis', 'Frango marinado no limão e ervas finas. Purê de mandioquinha sem leite gorduroso e brócolis no vapor.', 'certinho', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('19b22d82-243b-4ebc-a11f-309c57fc4edc', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-18', 'almoco', 'Patinho Moído com Cenoura Invisível & Arroz', 'Zero óleo. Cebola e alho batidos no mixer. Cenoura ralada ultrafina cozida no vapor que se desmancha no molho.', 'certinho', '2026-11-18 14:22:33', '2026-11-18 15:28:55'),
('296581ba-1b6d-4fdb-a5d2-00525e748fd2', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-19', 'lanche', 'Iogurte Natural com Maçã & Canela', 'Maçã em cubinhos finos com canela em pó para adoçar naturalmente.', 'certinho', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('3cf1448a-1ca2-4c0b-ab00-3b70d6776312', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-17', 'almoco', 'Patinho Moído Especial com Cenoura Invisível & Purê', 'Zero óleo, cebola batida no mixer, cenoura ralada bem fina', 'certinho', '2026-11-17 01:23:02', '2026-11-17 01:23:04'),
('4a8da4ff-64ea-49f6-be3f-08c1fb30f3a2', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-19', 'cafe', 'Ovos Mexidos Dourados com Aveia & Fruta', 'Fogo baixo, sem óleo. Polvilhar canela na fruta.', 'certinho', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('4bfb4a24-2e27-4a59-b01b-1bf44d22a150', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-19', 'almoco', 'Patinho Moído com Cenoura Invisível & Arroz', 'Zero óleo. Cebola e alho batidos no mixer. Cenoura ralada ultrafina cozida no vapor que se desmancha no molho.', 'certinho', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('5a61a36a-c956-4a01-b5a9-12bc8d0375aa', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-20', 'ceia', 'Chá de Ervas Nobres & Mix de Castanhas', 'Água fervente infusão de 5 minutos. Servir morno para acalmar.', 'certinho', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('5dc76d6f-e12c-4547-b47e-a8f09c28df61', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-20', 'cafe', 'Ovos Mexidos Dourados com Aveia & Fruta', 'Fogo baixo, sem óleo. Polvilhar canela na fruta.', 'certinho', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('5ecef6a4-043f-4617-9a67-dd8f1a6ca191', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-17', 'almoco', 'Patinho Moído com Cenoura Invisível & Arroz', 'Zero óleo. Cebola e alho batidos no mixer. Cenoura ralada ultrafina cozida no vapor que se desmancha no molho.', 'certinho', '2026-11-17 01:23:02', '2026-11-17 01:23:04'),
('68e68cbf-1026-4b10-bdb9-3c9920b96d08', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-18', 'cafe', 'Ovos Mexidos Dourados com Aveia & Fruta', 'Fogo baixo, sem óleo. Polvilhar canela na fruta.', 'certinho', '2026-11-18 14:22:33', '2026-11-18 15:28:55'),
('7ebe41da-6030-415a-983e-e70b2065074c', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-19', 'jantar', 'Peito de Frango Grelhado com Purê Dourado e Brócolis', 'Frango marinado no limão e ervas finas. Purê de mandioquinha sem leite gorduroso e brócolis no vapor.', 'certinho', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('83680fdd-5aed-475d-b37a-78841ed25dcd', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-18', 'ceia', 'Chá de Ervas Nobres & Mix de Castanhas', 'Água fervente infusão de 5 minutos. Servir morno para acalmar.', 'certinho', '2026-11-18 14:22:33', '2026-11-18 15:28:55'),
('87e4be70-93a8-4369-8ffb-5a8dabe9038f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-19', 'ceia', 'Chá de Ervas Nobres & Mix de Castanhas', 'Água fervente infusão de 5 minutos. Servir morno para acalmar.', 'certinho', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('98396e89-bc8a-44b0-a459-979a826b49ce', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-18', 'lanche', 'Iogurte Natural com Maçã & Canela', 'Maçã em cubinhos finos com canela em pó para adoçar naturalmente.', 'certinho', '2026-11-18 14:22:33', '2026-11-18 15:28:55'),
('9cfd5e0a-6e6a-482f-a465-cc92357b91eb', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-17', 'ceia', 'Chá de Ervas Nobres & Mix de Castanhas', 'Água fervente infusão de 5 minutos. Servir morno para acalmar.', 'certinho', '2026-11-17 01:23:02', '2026-11-17 01:23:04'),
('c535ad7b-78b6-4cc8-b447-2fa8349d3109', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-17', 'cafe', 'Ovos Mexidos Dourados com Aveia & Fruta', 'Fogo baixo, sem óleo. Polvilhar canela na fruta.', 'certinho', '2026-11-17 01:23:02', '2026-11-17 01:23:04'),
('d7d2da47-4a89-450d-bfda-3690b1356220', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-20', 'lanche', 'Iogurte Natural com Maçã & Canela', 'Maçã em cubinhos finos com canela em pó para adoçar naturalmente.', 'certinho', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('e9a7324c-6e55-40bc-aead-263611d22459', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-17', 'lanche', 'Iogurte Natural com Maçã & Canela', 'Maçã em cubinhos finos com canela em pó para adoçar naturalmente.', 'certinho', '2026-11-17 01:23:02', '2026-11-17 01:23:04'),
('ebdcceae-1e92-48fa-912b-08862b4c1b73', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-20', 'almoco', 'Patinho Moído com Cenoura Invisível & Arroz', 'Zero óleo. Cebola e alho batidos no mixer. Cenoura ralada ultrafina cozida no vapor que se desmancha no molho.', 'certinho', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('f7d9f9a7-d592-40dd-9707-4b2aca7e9a7b', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '2026-11-18', 'jantar', 'Peito de Frango Grelhado com Purê Dourado e Brócolis', 'Frango marinado no limão e ervas finas. Purê de mandioquinha sem leite gorduroso e brócolis no vapor.', 'certinho', '2026-11-18 14:22:33', '2026-11-18 15:28:55');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_meal_checkins`
--

CREATE TABLE `family_meal_checkins` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `meal_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `character_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `meal_date` date NOT NULL,
  `meal_type` varchar(50) NOT NULL DEFAULT 'almoco',
  `status` enum('no_horario','atrasado','faltou') NOT NULL DEFAULT 'no_horario',
  `xp_awarded` int(11) NOT NULL DEFAULT 0,
  `gold_awarded` int(11) NOT NULL DEFAULT 0,
  `penalty_note` text DEFAULT NULL,
  `validated_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_meal_checkins`
--

INSERT INTO `family_meal_checkins` (`id`, `meal_id`, `family_id`, `user_id`, `character_id`, `meal_date`, `meal_type`, `status`, `xp_awarded`, `gold_awarded`, `penalty_note`, `validated_by`, `created_at`, `updated_at`) VALUES
('e840044f-837a-4209-b0a8-e2aad7b9c424', NULL, '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '6752320c-afcb-4a94-ab5c-a43f965edb0f', '2026-11-17', 'almoco', 'faltou', 0, 0, 'Não quis almoçar no horário', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-11-17 01:23:03', '2026-11-17 01:23:03');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_meal_items`
--

CREATE TABLE `family_meal_items` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `meal_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity_grams` varchar(100) DEFAULT '100g',
  `category` varchar(50) NOT NULL DEFAULT 'proteina',
  `health_tags` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_meal_items`
--

INSERT INTO `family_meal_items` (`id`, `meal_id`, `name`, `quantity_grams`, `category`, `health_tags`, `created_at`, `updated_at`) VALUES
('0f580e6e-f569-4945-89a8-c1fe8377fe89', '4a8da4ff-64ea-49f6-be3f-08c1fb30f3a2', 'Ovos Caipiras', '2 unidades', 'proteina', 'energia,vesicula_segura', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('1308490f-1efd-485c-9955-33e5137f0602', '68e68cbf-1026-4b10-bdb9-3c9920b96d08', 'Aveia em Flocos Finos', '30g', 'carboidrato', 'fibras,baixo_indice_glicemico', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('13782f76-5522-47d4-a0cb-9ceb6593b784', '5dc76d6f-e12c-4547-b47e-a8f09c28df61', 'Ovos Caipiras', '2 unidades', 'proteina', 'energia,vesicula_segura', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('1e8549ea-8f23-4b05-aa9b-1e90efb47187', '296581ba-1b6d-4fdb-a5d2-00525e748fd2', 'Maçã Vermelha Picadinha', '1 unidade', 'fruta', 'fibras', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('2213bbec-2451-492a-bf7e-8664770df08d', 'c535ad7b-78b6-4cc8-b447-2fa8349d3109', 'Banana Prata', '1 unidade', 'fruta', 'potassio', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('234e34b7-2ac7-4db4-9d01-5f71e06de5fa', 'd7d2da47-4a89-450d-bfda-3690b1356220', 'Maçã Vermelha Picadinha', '1 unidade', 'fruta', 'fibras', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('2736aec4-9040-48a5-b4d0-fddc3eaefb26', '5ecef6a4-043f-4617-9a67-dd8f1a6ca191', 'Salada Verde Refrescante', 'À vontade', 'salada', 'antioxidante', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('2da8f35a-f434-4dba-807c-80ce71185e32', 'c535ad7b-78b6-4cc8-b447-2fa8349d3109', 'Aveia em Flocos Finos', '30g', 'carboidrato', 'fibras,baixo_indice_glicemico', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('2f2cf836-636a-43ff-8cb9-81eea358a26f', '9cfd5e0a-6e6a-482f-a465-cc92357b91eb', 'Castanhas do Pará', '15g', 'oleaginosa', 'selenio', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('314deb6f-4662-4f61-b13f-b3f8a569899d', '3cf1448a-1ca2-4c0b-ab00-3b70d6776312', 'Arroz Integral', '80g', 'carboidrato', 'baixo_indice_glicemico', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('350f7197-6177-4e3d-951e-21950ec23e1f', '7ebe41da-6030-415a-983e-e70b2065074c', 'Filé de Peito de Frango', '140g', 'proteina', 'pre_operatorio,vesicula_segura', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('367c61a4-ecdb-4403-b939-25a49936eb1b', '5a61a36a-c956-4a01-b5a9-12bc8d0375aa', 'Chá de Camomila & Erva Doce', '200ml', 'bebida', 'sono_reparador', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('3b7a6430-4413-4f53-9a8b-c6e0ae32c221', '5ecef6a4-043f-4617-9a67-dd8f1a6ca191', 'Cenoura Invisível no Molho', '60g', 'legume', 'vitaminas', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('3f6692da-232c-4331-b396-500543f13867', '7ebe41da-6030-415a-983e-e70b2065074c', 'Brócolis Ninja no Vapor', '80g', 'legume', 'antiinflamatorio', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('3fa84587-02fa-4504-a596-23d6e2079f2c', '83680fdd-5aed-475d-b37a-78841ed25dcd', 'Castanhas do Pará', '15g', 'oleaginosa', 'selenio', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('421779a7-3579-4b73-a9f7-ff0b866125ae', '19b22d82-243b-4ebc-a11f-309c57fc4edc', 'Salada Verde Refrescante', 'À vontade', 'salada', 'antioxidante', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('43417aa5-24a5-4fc6-a4fd-5d855bfa3037', '4a8da4ff-64ea-49f6-be3f-08c1fb30f3a2', 'Aveia em Flocos Finos', '30g', 'carboidrato', 'fibras,baixo_indice_glicemico', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('45aa05b6-bb2e-4ebf-8a45-50c443faa881', '4bfb4a24-2e27-4a59-b01b-1bf44d22a150', 'Salada Verde Refrescante', 'À vontade', 'salada', 'antioxidante', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('47aa01e2-6f48-451a-9d3c-7898e0166eb4', 'e9a7324c-6e55-40bc-aead-263611d22459', 'Iogurte Natural Desnatado', '170g', 'proteina', 'probioticos,leve', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('4836f960-8a5c-46cb-a1e7-81b355a1e1fe', '5dc76d6f-e12c-4547-b47e-a8f09c28df61', 'Aveia em Flocos Finos', '30g', 'carboidrato', 'fibras,baixo_indice_glicemico', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('5084761c-98ea-42f3-9807-8d23b4d8ed5e', 'ebdcceae-1e92-48fa-912b-08862b4c1b73', 'Salada Verde Refrescante', 'À vontade', 'salada', 'antioxidante', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('5328e589-8ad0-4a28-9164-96a4e9d06620', '0d0f2b8e-bd0c-49ae-9582-6fce3c393818', 'Purê de Mandioquinha Leve', '100g', 'carboidrato', 'digestao_facil', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('53dbc3f9-eab9-45a9-9540-f31f1db7cd65', '87e4be70-93a8-4369-8ffb-5a8dabe9038f', 'Castanhas do Pará', '15g', 'oleaginosa', 'selenio', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('544e2aac-0d19-4fbd-bbf6-b6424f30a6e6', 'ebdcceae-1e92-48fa-912b-08862b4c1b73', 'Cenoura Invisível no Molho', '60g', 'legume', 'vitaminas', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('6874c9b7-c0b0-4689-9fde-d0df01b46720', '9cfd5e0a-6e6a-482f-a465-cc92357b91eb', 'Chá de Camomila & Erva Doce', '200ml', 'bebida', 'sono_reparador', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('690ecd7a-31ba-433c-b830-b86dd13f5695', '68e68cbf-1026-4b10-bdb9-3c9920b96d08', 'Ovos Caipiras', '2 unidades', 'proteina', 'energia,vesicula_segura', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('6e4390ce-bd1b-4b20-9909-9fa32cf0e83d', '0d0f2b8e-bd0c-49ae-9582-6fce3c393818', 'Filé de Peito de Frango', '140g', 'proteina', 'pre_operatorio,vesicula_segura', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('6e665085-b5e0-4ed8-9c73-11a52a5dbfc4', '19b22d82-243b-4ebc-a11f-309c57fc4edc', 'Patinho Bovino Moído', '150g', 'proteina', 'ferro,vesicula_segura', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('7473a490-6c0c-4c7d-8c06-fedf52bd2476', '3cf1448a-1ca2-4c0b-ab00-3b70d6776312', 'Salada Verde', 'À vontade', 'salada', 'antioxidante', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('783ae09a-cc5e-43e8-ae53-31fada5b8a80', '4a8da4ff-64ea-49f6-be3f-08c1fb30f3a2', 'Banana Prata', '1 unidade', 'fruta', 'potassio', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('7fc39f75-beb0-404f-9e98-b1576e2ef485', '5dc76d6f-e12c-4547-b47e-a8f09c28df61', 'Banana Prata', '1 unidade', 'fruta', 'potassio', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('81296127-8aa4-4f4d-9755-d694a3c414c9', 'f7d9f9a7-d592-40dd-9707-4b2aca7e9a7b', 'Purê de Mandioquinha Leve', '100g', 'carboidrato', 'digestao_facil', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('8454d7ba-bebd-42ba-a17c-7b929bb3d7f8', '0d0f2b8e-bd0c-49ae-9582-6fce3c393818', 'Brócolis Ninja no Vapor', '80g', 'legume', 'antiinflamatorio', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('878a8e37-7541-496d-9795-f8929805f7ce', '7ebe41da-6030-415a-983e-e70b2065074c', 'Purê de Mandioquinha Leve', '100g', 'carboidrato', 'digestao_facil', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('96e30f4d-688a-4952-9bab-d0eb80bca71a', 'f7d9f9a7-d592-40dd-9707-4b2aca7e9a7b', 'Brócolis Ninja no Vapor', '80g', 'legume', 'antiinflamatorio', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('9d33aa15-6654-4eff-a792-23d698135343', '98396e89-bc8a-44b0-a459-979a826b49ce', 'Maçã Vermelha Picadinha', '1 unidade', 'fruta', 'fibras', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('ab0bfa65-ba2d-4775-8ac6-91d9c0031b87', '19a12e30-8726-413d-a0a9-5950757cd549', 'Filé de Peito de Frango', '140g', 'proteina', 'pre_operatorio,vesicula_segura', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('b29f7429-cf3d-4d2e-97cd-1784f28e3054', '5ecef6a4-043f-4617-9a67-dd8f1a6ca191', 'Patinho Bovino Moído', '150g', 'proteina', 'ferro,vesicula_segura', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('b429aad6-9823-4aa9-8f3b-2239ab62f4c2', 'e9a7324c-6e55-40bc-aead-263611d22459', 'Maçã Vermelha Picadinha', '1 unidade', 'fruta', 'fibras', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('b77e189a-2b0c-4c91-841f-a62211ae1b34', '4bfb4a24-2e27-4a59-b01b-1bf44d22a150', 'Arroz Integral Cozido', '80g', 'carboidrato', 'baixo_indice_glicemico', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('b89860b8-6ff3-401a-b700-400a1796e992', 'c535ad7b-78b6-4cc8-b447-2fa8349d3109', 'Ovos Caipiras', '2 unidades', 'proteina', 'energia,vesicula_segura', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('bfbd2070-fa7b-4d84-a53a-fc369731f74e', '296581ba-1b6d-4fdb-a5d2-00525e748fd2', 'Iogurte Natural Desnatado', '170g', 'proteina', 'probioticos,leve', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('c66aeb98-04f0-47a9-8bbc-eb7b17b76db4', '5ecef6a4-043f-4617-9a67-dd8f1a6ca191', 'Arroz Integral Cozido', '80g', 'carboidrato', 'baixo_indice_glicemico', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('c8c54dee-3f66-4e4e-84ed-62ea8a3e6c3b', '83680fdd-5aed-475d-b37a-78841ed25dcd', 'Chá de Camomila & Erva Doce', '200ml', 'bebida', 'sono_reparador', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('cc361432-66f3-4f8a-b743-abcbf916e1f9', '98396e89-bc8a-44b0-a459-979a826b49ce', 'Iogurte Natural Desnatado', '170g', 'proteina', 'probioticos,leve', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('d1c25887-31e8-450b-b349-f4df141b9057', '19b22d82-243b-4ebc-a11f-309c57fc4edc', 'Arroz Integral Cozido', '80g', 'carboidrato', 'baixo_indice_glicemico', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('d3e9edeb-654d-4be0-9978-34d7d099653d', 'd7d2da47-4a89-450d-bfda-3690b1356220', 'Iogurte Natural Desnatado', '170g', 'proteina', 'probioticos,leve', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('d601a99f-db39-4bc8-a18c-a41a8dfb5871', 'f7d9f9a7-d592-40dd-9707-4b2aca7e9a7b', 'Filé de Peito de Frango', '140g', 'proteina', 'pre_operatorio,vesicula_segura', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('e0a66346-1658-438a-97a9-61048541b6ec', '87e4be70-93a8-4369-8ffb-5a8dabe9038f', 'Chá de Camomila & Erva Doce', '200ml', 'bebida', 'sono_reparador', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('e2f8db4b-df5e-4211-8bfa-fd2c1d483751', '19b22d82-243b-4ebc-a11f-309c57fc4edc', 'Cenoura Invisível no Molho', '60g', 'legume', 'vitaminas', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('e5373966-5dba-4736-9a9c-1addfa948712', 'ebdcceae-1e92-48fa-912b-08862b4c1b73', 'Patinho Bovino Moído', '150g', 'proteina', 'ferro,vesicula_segura', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('e581d22d-22cd-45b6-9b67-afa4f913de33', '68e68cbf-1026-4b10-bdb9-3c9920b96d08', 'Banana Prata', '1 unidade', 'fruta', 'potassio', '2026-11-18 14:22:33', '2026-11-18 14:22:33'),
('e61332e0-0753-47dd-9f8f-4d6701bda3b7', '19a12e30-8726-413d-a0a9-5950757cd549', 'Purê de Mandioquinha Leve', '100g', 'carboidrato', 'digestao_facil', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('e9d959d4-e6c9-4c6f-a609-2d808bfec716', '3cf1448a-1ca2-4c0b-ab00-3b70d6776312', 'Patinho Moído', '150g', 'proteina', 'vesicula_segura', '2026-11-17 01:23:02', '2026-11-17 01:23:02'),
('f0346427-e3e1-43e8-a714-015344c1b224', 'ebdcceae-1e92-48fa-912b-08862b4c1b73', 'Arroz Integral Cozido', '80g', 'carboidrato', 'baixo_indice_glicemico', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('f3279a5a-8a00-472c-a7bf-125a859390d9', '4bfb4a24-2e27-4a59-b01b-1bf44d22a150', 'Cenoura Invisível no Molho', '60g', 'legume', 'vitaminas', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('f335a4b9-5bb6-4006-8346-5ac3f415b5a9', '5a61a36a-c956-4a01-b5a9-12bc8d0375aa', 'Castanhas do Pará', '15g', 'oleaginosa', 'selenio', '2026-11-20 14:23:46', '2026-11-20 14:23:46'),
('f9b37f29-4177-4b4a-8a62-350f859645a7', '4bfb4a24-2e27-4a59-b01b-1bf44d22a150', 'Patinho Bovino Moído', '150g', 'proteina', 'ferro,vesicula_segura', '2026-11-19 15:06:56', '2026-11-19 15:06:56'),
('fb5ef860-7c51-4b6c-a9be-5221e6bc1381', '19a12e30-8726-413d-a0a9-5950757cd549', 'Brócolis Ninja no Vapor', '80g', 'legume', 'antiinflamatorio', '2026-11-20 14:23:46', '2026-11-20 14:23:46');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_meal_schedules`
--

CREATE TABLE `family_meal_schedules` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `meal_type` enum('cafe','almoco','lanche','jantar','ceia') NOT NULL,
  `scheduled_time` varchar(10) NOT NULL DEFAULT '12:00',
  `routine_mode` enum('certinho','flexivel') NOT NULL DEFAULT 'certinho',
  `alert_minutes_before` int(11) NOT NULL DEFAULT 15,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_meal_schedules`
--

INSERT INTO `family_meal_schedules` (`id`, `family_id`, `meal_type`, `scheduled_time`, `routine_mode`, `alert_minutes_before`, `is_active`, `created_at`, `updated_at`) VALUES
('07a0d1b2-7320-4048-8d65-9722cac7c33f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'lanche', '16:00', 'certinho', 15, 1, '2026-11-17 01:23:02', '2026-11-18 15:28:55'),
('126df314-12d5-4d19-8784-e994e1595b39', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'jantar', '19:30', 'certinho', 20, 1, '2026-11-17 01:23:02', '2026-11-18 15:28:55'),
('b533242d-30bb-469e-97b5-d6d40794cbc5', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'almoco', '12:00', 'certinho', 20, 1, '2026-11-17 01:23:02', '2026-11-18 15:28:55'),
('d09a8511-ce89-485c-8a6e-54644b9f5036', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'ceia', '21:30', 'certinho', 10, 1, '2026-11-17 01:23:02', '2026-11-18 15:28:55'),
('eb20b9e6-1d93-4181-add6-d13c6296e459', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'cafe', '07:30', 'certinho', 15, 1, '2026-11-17 01:23:02', '2026-11-18 15:28:55');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_members`
--

CREATE TABLE `family_members` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `role_in_family` enum('GUARDIAN','MEMBER') NOT NULL DEFAULT 'MEMBER',
  `joined_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_members`
--

INSERT INTO `family_members` (`id`, `family_id`, `user_id`, `role_in_family`, `joined_at`, `created_at`, `updated_at`) VALUES
('08eccf31-e4a0-4ee5-a326-c5e671ace2a3', '807e34e4-5ffd-42d9-a9e5-5385aa920d95', 'c6e55de6-969f-4572-b97c-e93b872afdcf', 'GUARDIAN', '2026-11-21 19:40:41', '2026-11-21 19:40:41', '2026-11-21 19:40:41'),
('17a8422f-1fbb-4a86-8d0e-267931de6a07', '807e34e4-5ffd-42d9-a9e5-5385aa920d95', '40058126-1471-4c26-945c-1f329a49a2be', 'MEMBER', '2026-11-21 19:40:42', '2026-11-21 19:40:42', '2026-11-21 19:40:42'),
('1d4d27ab-eba5-47a8-b843-6a1f59545bfb', '807e34e4-5ffd-42d9-a9e5-5385aa920d95', 'f85ea042-b0b0-484c-be2b-3ea9b0503b6b', 'MEMBER', '2026-11-21 19:40:41', '2026-11-21 19:40:41', '2026-11-21 19:40:41'),
('234c226d-64f1-4449-b660-6ef6a4b9cb77', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'MEMBER', '2026-08-31 16:14:25', '2026-08-31 16:14:25', '2026-08-31 16:32:58'),
('3497461c-8c3b-46c4-b200-861abfa49b2f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', 'MEMBER', '2026-08-31 21:07:03', '2026-08-31 21:07:03', '2026-08-31 21:07:03'),
('45c38b9a-f8f9-4be6-b756-b366066d1c1f', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', 'MEMBER', '2026-11-17 17:11:21', '2026-11-17 17:11:21', '2026-11-17 17:11:21'),
('72ec18a1-c641-4e4b-9eca-609ada353adf', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', 'GUARDIAN', '2026-08-31 16:29:37', '2026-08-31 16:29:37', '2026-08-31 16:29:37'),
('784f25a3-5ea9-41b0-ba6d-db0a18b116ad', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', 'MEMBER', '2026-08-31 22:16:43', '2026-08-31 22:16:43', '2026-08-31 22:16:43'),
('938936d9-6bcb-48df-beb7-b0bd3368c855', '807e34e4-5ffd-42d9-a9e5-5385aa920d95', '70d3b59f-e6d2-4903-9409-d832753a7c09', 'GUARDIAN', '2026-11-21 19:40:41', '2026-11-21 19:40:41', '2026-11-21 19:40:41'),
('fb88e248-7705-4af3-9e9a-d82a87c68db3', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', 'MEMBER', '2026-08-31 19:37:00', '2026-08-31 19:37:00', '2026-08-31 19:37:00');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_polls`
--

CREATE TABLE `family_polls` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `status` enum('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
  `closes_at` datetime DEFAULT NULL,
  `winner_option_id` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_polls`
--

INSERT INTO `family_polls` (`id`, `family_id`, `created_by`, `title`, `description`, `options`, `status`, `closes_at`, `winner_option_id`, `created_at`, `updated_at`) VALUES
('1b0ac726-9d85-473d-8e3e-7a795542c9fb', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', 'Qual será o grande passeio da família neste fim de semana?', 'Votação aberta para todos os heróis e guardiões do clã escolherem a melhor aventura.', '[{\"id\":\"opt_1\",\"title\":\"Parque Ecológico & Piquenique\",\"description\":\"Trilha verde, ar puro, patinete e lanche ao ar livre\",\"icon\":\"🌳\"},{\"id\":\"opt_2\",\"title\":\"Cinema & Sessão Pipoca\",\"description\":\"Filme novo em tela gigante com balde de pipoca e refrigerante\",\"icon\":\"🍿\"},{\"id\":\"opt_3\",\"title\":\"Pizzaria ou Hamburgueria Artesanal\",\"description\":\"Noite saborosa com rodízio e direito à sobremesa nobre\",\"icon\":\"🍕\"}]', 'OPEN', '2026-11-22 03:47:12', NULL, '2026-11-17 03:47:12', '2026-11-17 03:47:12');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_poll_votes`
--

CREATE TABLE `family_poll_votes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `poll_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `option_id` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_poll_votes`
--

INSERT INTO `family_poll_votes` (`id`, `poll_id`, `user_id`, `option_id`, `created_at`, `updated_at`) VALUES
('4362f56f-e2e0-4a1e-b59f-c292068beb20', '1b0ac726-9d85-473d-8e3e-7a795542c9fb', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', 'opt_1', '2026-11-17 03:47:13', '2026-11-17 03:47:13');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_push_subscriptions`
--

CREATE TABLE `family_push_subscriptions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `endpoint` text NOT NULL,
  `p256dh` text NOT NULL,
  `auth` varchar(255) NOT NULL,
  `user_agent` varchar(255) DEFAULT '',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_push_subscriptions`
--

INSERT INTO `family_push_subscriptions` (`id`, `family_id`, `user_id`, `endpoint`, `p256dh`, `auth`, `user_agent`, `is_active`, `created_at`, `updated_at`) VALUES
('139b7c2f-e1b6-4c0d-9865-61a7708e0862', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', 'https://fcm.googleapis.com/fcm/send/dhj8JZqCtaA:APA91bGhrXNhmqdVE23SBNsBVymyC9FNprXeuiRktCoK3W7p-0dYryAtnPHM3lIGASWMQRK9037iQNSPaRbLOwVaeb09Rb4Fh58q2Lrg-vsAVO80jmOjwwoso5SJMyEDYmWvG008wpJy', 'BBqb3S8x932Mz4DMk7qKfrbSzwzaA88RE_Sg-Ubk9VI3wmlvBpsaiJKbGu9_ngWIKhNzfbvVmuu-2YCILGr3JSI', '8n8WCo91-OAqqHZubpZFHw', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', 1, '2026-11-18 14:52:19', '2026-11-18 14:52:19'),
('a8f6088c-652a-4398-b933-0f5960e80102', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', 'https://fcm.googleapis.com/fcm/send/eRnA1yj28vc:APA91bEm0y75XpuQh0sptJAtUSMCiKnmXg_DG23WTfMlDpNR7qTMuASCEexWS8toT34sBCViPo6eGW0q9IzX0Cp8WtR3YLAORvGujXc57JsCAO273ggRqwKk41GyB7qmjlcUBEcIC_js', 'BGxyc2EiGGN6LkmcVKBqqnGu4DyI0ddDwUblfg3rvEb8CAhS0OX1EQNGom8lavMaGJvcJaT44quqvf6VxiNoH7U', '2YQDJGnusKky3Drjzz4DWg', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36', 1, '2026-11-18 15:30:02', '2026-11-18 15:30:02');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_quiz_options`
--

CREATE TABLE `family_quiz_options` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `question_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `option_text` varchar(255) NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_quiz_options`
--

INSERT INTO `family_quiz_options` (`id`, `question_id`, `option_text`, `is_correct`, `created_at`, `updated_at`) VALUES
('08d85c4b-58c1-4a4b-b7fa-bd9a96db062a', '5fc5acca-f50c-484f-8909-d21af9f3079f', 'Baleia', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('0e47d574-be8a-49db-9aac-2b029abad8fa', 'f7bb5905-ddd9-42e7-96f9-af2a69c97154', '√2/2', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('0e4de430-e3d8-4cba-ba62-aba150ccf9fa', '853fc293-94f4-4609-bc7d-4b125d952cab', '4', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('12b09725-c4cd-42a9-a4f3-6d2e61c71b18', 'f7bb5905-ddd9-42e7-96f9-af2a69c97154', '1/2', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('15bb3a7e-eee0-40ef-92e5-0a183b19520c', '4bbb64a6-2b21-44f0-b941-c0e7e947efbf', 'Canberra', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('1b509e5f-32bb-48f2-9d90-74f220f5a78e', 'db692a23-528f-4e65-99e0-e9848ad2d9eb', '12', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('1ce67f60-b5fa-4312-a2c3-5c5be6cbfdfc', '51448b94-b93b-46e2-9275-1a4742f59b6a', 'Aluísio Azevedo', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('206b706f-24c8-4e97-864c-20b612c10aa9', '74753b90-0b2a-4f9c-8753-93a5323dc73d', '16', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('20e44665-9030-49b0-a72b-195e096a108e', 'b4b7aca0-a84d-40ff-b10c-331c301f57d9', 'SMTP (porta 25)', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('268ed5ec-5a07-4ea8-99ee-fd85e80266e3', '986e4864-fafc-4614-bfba-b8eb33f1be54', 'Troféos', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('2b98a081-7f70-4e45-994e-ddd4e7e7ae9f', '910818ec-a49e-4fc6-a264-0e980c168eb0', 'Forte', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('2fa52aca-097d-4bc7-acc4-8175b8cf28f5', 'b4b7aca0-a84d-40ff-b10c-331c301f57d9', 'SSH (porta 22)', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('35716db5-f9f3-47ef-b2c6-18c9b05170b0', '74753b90-0b2a-4f9c-8753-93a5323dc73d', '12', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('36e4ec8f-a16a-4ea3-b5ba-20a6aa492682', '74c95be4-25d3-4cfc-84ad-03bbf0e83274', '64', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('37a2c2e7-a4bf-40db-b095-b36304058f8d', 'a0328830-b3b3-4103-ad5c-864f742a96c3', 'Hipérbole', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('38eb69af-5af4-4ff8-ab1c-bef06f9f4b27', '51e4a0c5-24cd-49ce-85bc-53c5fae8cf96', '3x³ - 5', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('3a6f871d-6136-4998-a0a3-906bc3884c63', '5fc5acca-f50c-484f-8909-d21af9f3079f', 'Polvo', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('3a8a682d-7953-4fbc-a2f3-6000205659b6', '6f7d6414-7cc8-4f65-93e9-a72be9d592df', '43', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('3b7f85ef-910e-47e3-bb01-6b6fe11564fa', 'a0328830-b3b3-4103-ad5c-864f742a96c3', 'Metáfora', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('3c599b36-b29a-4a1c-8c02-ac2149f6af78', '62cfd46f-e9fa-47f3-930e-26ab4c6a572d', 'A maioria dos computadores não é rápida', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('3d9e4857-4f27-4041-8735-e9b0ea3b4ff4', 'faf95791-4712-4a0c-b7d0-a86b31c5503a', 'Marte', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('41314d1d-eb27-433a-ac08-115a8259b917', '0640e2df-4b6b-472f-a6b8-b40c18d7dea3', 'Pilha (Stack)', 1, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('435be172-3ca2-416f-b11d-0dc4637beb44', '51e4a0c5-24cd-49ce-85bc-53c5fae8cf96', '3x² - 5', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('4b933336-b1c3-434e-af2e-1425eeb7cf50', 'db692a23-528f-4e65-99e0-e9848ad2d9eb', '4', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('4eab832d-f76b-4928-a0ef-b71a4c970fa9', '842e63bb-0923-4c7f-a52d-b0c12868cda2', 'Lisossomo', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('4f8eef63-5121-425a-b6ae-2be658ab54b8', '0640e2df-4b6b-472f-a6b8-b40c18d7dea3', 'Grafo Conexo', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('501f772c-5740-48a1-b835-82c3384f2c22', 'f08e5d7e-5bbd-4feb-853f-970d87e7c8a6', '1/12', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('52f99493-620e-4c29-9b8e-df605fae211b', 'a0328830-b3b3-4103-ad5c-864f742a96c3', 'Ironia', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('54304d56-874c-4963-84f7-0364904fb902', '842e63bb-0923-4c7f-a52d-b0c12868cda2', 'Ribossomo', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('547989c9-52f2-4ce5-8b87-db0c4c85b264', '842e63bb-0923-4c7f-a52d-b0c12868cda2', 'Mitocôndria', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('571de159-af3d-478e-8e82-a8584a8cac80', '0640e2df-4b6b-472f-a6b8-b40c18d7dea3', 'Árvore Binária', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('574da76a-48dc-44b1-a00e-690972766b30', 'c00c72eb-b6dd-415c-b1db-bbe6e4a3ff6b', 'Gás Carbônico (CO₂)', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('5a46c078-72b1-42d3-8b26-650792432233', '5bd6e6ba-0bcf-4356-859c-c5ad90ae1663', 'O saldo total de reservas cambiais em dólares', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('5bb2bfb1-0bab-41c6-9aab-3058050d974b', '4bbb64a6-2b21-44f0-b941-c0e7e947efbf', 'Auckland', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('5d385fc9-c707-4f2e-bbbb-25210a074c48', 'f9c44a4a-6c8a-4dd3-88d6-fa415152cb3a', '1500', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('5e6ae3f1-da20-475f-9e05-e3e2eedb1363', '74c95be4-25d3-4cfc-84ad-03bbf0e83274', '48', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('63c8dedc-c6aa-4934-ac6a-dfa34d8ec765', '74753b90-0b2a-4f9c-8753-93a5323dc73d', '14', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('6a987999-c353-416a-a7d7-a0d8d1bcbdf9', '0640e2df-4b6b-472f-a6b8-b40c18d7dea3', 'Fila (Queue)', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('6c4b1c1a-022d-4b1e-9661-b44265825e37', '51e4a0c5-24cd-49ce-85bc-53c5fae8cf96', 'x² - 5', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('73011459-1af9-4111-9595-a9d8e3e45ed0', '51448b94-b93b-46e2-9275-1a4742f59b6a', 'Machado de Assis', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('7a1dcaca-cd57-4426-8fa9-9e0e423c89cb', 'b4b7aca0-a84d-40ff-b10c-331c301f57d9', 'FTP (porta 21)', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('7bab12cc-c28a-44cb-8be8-24e22e457424', '4bbb64a6-2b21-44f0-b941-c0e7e947efbf', 'Melbourne', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('8001abf4-8e1c-4246-8736-da0351bf7128', '74c95be4-25d3-4cfc-84ad-03bbf0e83274', '56', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('8a98f7f2-c0da-45eb-99a5-3544f261744c', '5bd6e6ba-0bcf-4356-859c-c5ad90ae1663', 'A receita de impostos arrecadada pelo governo federal', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('8bfa6805-7f41-4b11-9b9f-b6c8fdafa0c4', '51e4a0c5-24cd-49ce-85bc-53c5fae8cf96', '3x² - 5x', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('8ecee872-a8a1-4930-8fce-9438aea65fd1', '62cfd46f-e9fa-47f3-930e-26ab4c6a572d', 'Nenhum computador é rápido', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('8f0cb0d6-7b12-4ade-968b-cb2169bb6fce', 'f08e5d7e-5bbd-4feb-853f-970d87e7c8a6', '1/6', 1, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('90700b3b-485e-4e0e-b916-2766c01e080a', '5bd6e6ba-0bcf-4356-859c-c5ad90ae1663', 'A riqueza média por habitante descontada a inflação', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('907114a5-3b31-4dcc-b9e5-c86b0733a660', '910818ec-a49e-4fc6-a264-0e980c168eb0', 'Medroso', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('918f6b91-e480-4b22-b28d-5413dba1f1bb', 'faf95791-4712-4a0c-b7d0-a86b31c5503a', 'Terra', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('94035717-f36e-4ebb-add9-ced05d2672d0', '51448b94-b93b-46e2-9275-1a4742f59b6a', 'Castro Alves', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('94d4aa95-2a64-41be-bd17-0d0ab6f26ada', '1679ea48-0043-4af1-8e75-40601641b203', '14', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('953e977a-6d1c-4664-b32c-3eae0e46fe2e', 'c00c72eb-b6dd-415c-b1db-bbe6e4a3ff6b', 'Hélio (He)', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('966fe03f-0ffb-4239-8c5e-90956af11d04', '1679ea48-0043-4af1-8e75-40601641b203', '16', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('97853efc-fbe1-4b2d-8c37-4c7bc43022cb', '986e4864-fafc-4614-bfba-b8eb33f1be54', 'Troféis', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('980e0b51-21ff-481f-af1b-3676ac957b35', 'c549ca90-e95f-4947-8fb2-3a946619d4a5', 'Permanecer em repouso', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('a0a7bc8c-3d7d-47b0-8d9c-87915200897b', '842e63bb-0923-4c7f-a52d-b0c12868cda2', 'Complexo de Golgi', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('a20e6dfa-fe43-4b2d-80c5-13a25ff43f45', 'c549ca90-e95f-4947-8fb2-3a946619d4a5', 'Girar em torno do centro', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('a253885c-3abd-48e1-9b4e-8459e3516628', '74c95be4-25d3-4cfc-84ad-03bbf0e83274', '54', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('a75e65c7-9ffe-45f2-a5c2-3f2fe0d444fa', '1679ea48-0043-4af1-8e75-40601641b203', '15', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('a9674d5e-75df-47e4-a025-0c0e0af2a2b9', '62cfd46f-e9fa-47f3-930e-26ab4c6a572d', 'Todos os computadores são lentos', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('abdca6cb-d482-4cb2-a9c1-a48b582f5204', '853fc293-94f4-4609-bc7d-4b125d952cab', '3', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('b04d25e3-bc6b-4424-9435-1d43b1375a63', '6f7d6414-7cc8-4f65-93e9-a72be9d592df', '33', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('b29d44d2-f8ab-4f1e-bf1f-8b3369964ba3', 'f9c44a4a-6c8a-4dd3-88d6-fa415152cb3a', '1808', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('b3b177e1-f23f-48fe-b69d-1809d12df00a', '853fc293-94f4-4609-bc7d-4b125d952cab', '5', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('b41a5b45-3d7a-430d-9341-1f9b2010aba9', '4bbb64a6-2b21-44f0-b941-c0e7e947efbf', 'Sydney', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('b60d032c-f161-46bd-a0ac-22cdc7dad485', 'a0328830-b3b3-4103-ad5c-864f742a96c3', 'Metonímia', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('b6fb1037-1430-4e9c-a7f4-02fad4948b53', 'f08e5d7e-5bbd-4feb-853f-970d87e7c8a6', '1/8', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('bf836c74-5887-47f0-8f49-b0d9044c1061', 'db692a23-528f-4e65-99e0-e9848ad2d9eb', '6', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('c18e76f1-dc1a-47c1-aa55-94523bf97d7c', 'f08e5d7e-5bbd-4feb-853f-970d87e7c8a6', '7/36', 0, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('c3fe2fe4-7f61-4a65-af22-10ee1f000a66', '5fc5acca-f50c-484f-8909-d21af9f3079f', 'Tartaruga', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('c4acfe77-6384-4ebd-8758-e90607a6edc5', '51448b94-b93b-46e2-9275-1a4742f59b6a', 'José de Alencar', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('c677444d-574a-46c4-8870-83ea31e46eea', 'b4b7aca0-a84d-40ff-b10c-331c301f57d9', 'HTTPS (porta 443)', 1, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('c71711a2-fd8e-4e0e-a7b5-170014168956', 'f7bb5905-ddd9-42e7-96f9-af2a69c97154', '1', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('c9a4f1d1-14e7-4812-9c6e-03542ee91f89', 'f9c44a4a-6c8a-4dd3-88d6-fa415152cb3a', '1822', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('cbad3641-97e5-43ff-a9e7-625047ddb6ac', 'f9c44a4a-6c8a-4dd3-88d6-fa415152cb3a', '1889', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('cfd0131d-2613-4908-b120-c534405164be', '62cfd46f-e9fa-47f3-930e-26ab4c6a572d', 'Existe ao menos um computador que não é rápido', 1, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('d068b095-4c13-4e09-a5a6-5928f4de0bb8', '986e4864-fafc-4614-bfba-b8eb33f1be54', 'Trofeuzes', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('d0b7115f-fe1d-4fab-b441-ede6514525db', '1679ea48-0043-4af1-8e75-40601641b203', '18', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('d515e4c4-88df-46ca-941e-a59de4d8cd43', 'faf95791-4712-4a0c-b7d0-a86b31c5503a', 'Júpiter', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('d669c35e-05a4-46cb-9295-028ec70df042', '5bd6e6ba-0bcf-4356-859c-c5ad90ae1663', 'A soma de todos os bens e serviços finais produzidos', 1, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('d84a36a6-ba54-4649-914a-33d4b12033d0', 'c549ca90-e95f-4947-8fb2-3a946619d4a5', 'Acelerar espontaneamente', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('daf4c794-16dc-4c66-bf3e-bb8f55e10655', '910818ec-a49e-4fc6-a264-0e980c168eb0', 'Esperto', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('ddc0acdf-e3ab-4309-9465-bfb67767bdb7', '910818ec-a49e-4fc6-a264-0e980c168eb0', 'Bravo', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('df51cf24-1b80-4e24-864c-10e97f38ab50', '6f7d6414-7cc8-4f65-93e9-a72be9d592df', '41', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('e252a890-2469-42cd-907b-0eda3a42a1ab', 'c00c72eb-b6dd-415c-b1db-bbe6e4a3ff6b', 'Oxigênio (O₂)', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('e2b8ee79-6743-41e3-9de1-bb00b22fcc4c', '5fc5acca-f50c-484f-8909-d21af9f3079f', 'Tubarão', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('e56f466d-44f0-49ed-8851-431b6ef114e1', '853fc293-94f4-4609-bc7d-4b125d952cab', '10', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('e8d61f90-2adc-4f83-977b-f6c4720593ef', 'db692a23-528f-4e65-99e0-e9848ad2d9eb', '8', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('e9841f5f-2025-4227-980d-36289636d08c', '74753b90-0b2a-4f9c-8753-93a5323dc73d', '11', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('eafbcf1f-4c05-4048-b7d1-9bdf31b97448', '6f7d6414-7cc8-4f65-93e9-a72be9d592df', '45', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('eb0ee75c-1299-47a2-86a3-ea1bc67ec9eb', 'faf95791-4712-4a0c-b7d0-a86b31c5503a', 'Saturno', 0, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('ecaafd27-0f56-4e57-8b6c-054ccb9321c7', 'f7bb5905-ddd9-42e7-96f9-af2a69c97154', '√3/2', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('ed71a17f-305d-4fcc-a484-4c46adc0b408', 'c00c72eb-b6dd-415c-b1db-bbe6e4a3ff6b', 'Nitrogênio (N₂)', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('fae6d9da-3db4-4aec-ba28-87cd02017bbf', '986e4864-fafc-4614-bfba-b8eb33f1be54', 'Troféus', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('ff05932f-e61b-42b2-835c-e9eead5c1f96', 'c549ca90-e95f-4947-8fb2-3a946619d4a5', 'Perder massa', 0, '2026-09-04 00:48:45', '2026-09-04 00:48:45');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_quiz_questions`
--

CREATE TABLE `family_quiz_questions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `question_text` text NOT NULL,
  `discipline` varchar(50) NOT NULL DEFAULT 'geral',
  `education_stage` enum('fundamental_1','fundamental_2','ensino_medio','superior') NOT NULL DEFAULT 'fundamental_1',
  `school_year` varchar(50) DEFAULT NULL,
  `difficulty_level` int(11) NOT NULL DEFAULT 1,
  `explanation` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_quiz_questions`
--

INSERT INTO `family_quiz_questions` (`id`, `question_text`, `discipline`, `education_stage`, `school_year`, `difficulty_level`, `explanation`, `is_active`, `created_at`, `updated_at`) VALUES
('0640e2df-4b6b-472f-a6b8-b40c18d7dea3', 'Na ciência da computação, qual estrutura de dados opera sob o princípio LIFO (Last-In, First-Out)?', 'logica_geral', 'superior', 'faculdade', 6, 'Uma Pilha (Stack) é LIFO, onde o último elemento inserido é o primeiro a ser removido.', 1, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('1679ea48-0043-4af1-8e75-40601641b203', 'Complete a sequência lógica: 3, 6, 9, 12, ___', 'matematica', 'fundamental_1', '2_ao_4_ano', 1, 'A sequência cresce de 3 em 3. 12 + 3 = 15.', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('4bbb64a6-2b21-44f0-b941-c0e7e947efbf', 'Qual é a capital da Austrália?', 'geografia', 'fundamental_2', '6_ao_8_ano', 4, 'Canberra é a capital federal da Austrália, embora Sydney e Melbourne sejam mais populosas.', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('51448b94-b93b-46e2-9275-1a4742f59b6a', 'Quem é o autor da obra-prima do Realismo brasileiro \"Dom Casmurro\"?', 'portugues', 'ensino_medio', '2_ao_3_ano_medio', 4, 'Machado de Assis publicou Dom Casmurro em 1899 narrando a história de Bentinho e Capitu.', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('51e4a0c5-24cd-49ce-85bc-53c5fae8cf96', 'Qual é a derivada de f(x) = x³ - 5x + 4 em relação a x?', 'matematica', 'superior', 'faculdade', 7, 'Pela regra da potência: d/dx(xⁿ) = n·xⁿ⁻¹. Logo f\'(x) = 3x² - 5.', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('5bd6e6ba-0bcf-4356-859c-c5ad90ae1663', 'O que mede o PIB (Produto Interno Bruto) de uma nação?', 'geral', 'superior', 'faculdade', 7, 'O PIB é a soma de todos os bens e serviços finais produzidos em um país em dado período.', 1, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('5fc5acca-f50c-484f-8909-d21af9f3079f', 'Qual animal abaixo é um mamífero aquático?', 'ciencias', 'fundamental_1', '2_ao_4_ano', 2, 'A baleia e o golfinho respiram ar por pulmões e amamentam seus filhotes.', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('62cfd46f-e9fa-47f3-930e-26ab4c6a572d', 'Na lógica proposicional, a negação de \"Todos os computadores são rápidos\" é:', 'logica_geral', 'superior', 'faculdade', 7, 'A negação do quantificador universal \"Todo A é B\" é o particular \"Pelo menos um A não é B\".', 1, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('6f7d6414-7cc8-4f65-93e9-a72be9d592df', 'Quanto é 25 + 18?', 'matematica', 'fundamental_1', '1_ao_3_ano', 1, '25 + 18 = 43 (25 + 10 = 35, 35 + 8 = 43).', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('74753b90-0b2a-4f9c-8753-93a5323dc73d', 'Qual é a raiz quadrada de 144?', 'matematica', 'fundamental_2', '6_ao_8_ano', 3, '12 × 12 = 144, logo a raiz quadrada de 144 é 12.', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('74c95be4-25d3-4cfc-84ad-03bbf0e83274', 'Quanto é 7 × 8?', 'matematica', 'fundamental_1', '3_ao_5_ano', 2, '7 vezes 8 é igual a 56 (tabuada do 7 e do 8).', 1, '2026-09-04 00:48:43', '2026-09-04 00:48:43'),
('842e63bb-0923-4c7f-a52d-b0c12868cda2', 'Qual organela celular é a principal responsável pela produção de ATP?', 'ciencias', 'ensino_medio', '1_ano_medio', 5, 'A mitocôndria realiza o ciclo de Krebs e a cadeia respiratória fosforilativa.', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('853fc293-94f4-4609-bc7d-4b125d952cab', 'Qual é o valor de log₁₀(10.000)?', 'matematica', 'ensino_medio', '2_ao_3_ano_medio', 6, '10⁴ = 10.000, logo log₁₀(10.000) = 4.', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('910818ec-a49e-4fc6-a264-0e980c168eb0', 'Qual é o antônimo da palavra \"CORAJOSO\"?', 'portugues', 'fundamental_1', '1_ao_3_ano', 1, 'Antônimo é a palavra de sentido oposto. O oposto de corajoso é medroso ou covarde.', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('986e4864-fafc-4614-bfba-b8eb33f1be54', 'Qual é o plural correto da palavra \"TROFÉU\"?', 'portugues', 'fundamental_1', '3_ao_5_ano', 3, 'Palavras terminadas em ditongo oral como \"troféu\" fazem plural com \"s\": troféus.', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('a0328830-b3b3-4103-ad5c-864f742a96c3', '\"Seus olhos eram faróis na noite escura.\" Que figura de linguagem está presente?', 'portugues', 'fundamental_2', '8_ao_9_ano', 4, 'Metáfora é uma comparação implícita, sem o uso de conectivos comparativos como \"como\".', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('b4b7aca0-a84d-40ff-b10c-331c301f57d9', 'Qual protocolo de rede adiciona criptografia TLS/SSL sobre o protocolo HTTP tradicional?', 'logica_geral', 'superior', 'faculdade', 6, 'HTTPS (HyperText Transfer Protocol Secure) criptografa a comunicação entre cliente e servidor.', 1, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('c00c72eb-b6dd-415c-b1db-bbe6e4a3ff6b', 'Qual gás é essencial para a respiração humana celular?', 'ciencias', 'fundamental_2', '6_ao_8_ano', 3, 'O oxigênio (O₂) é utilizado pelas mitocôndrias na respiração celular aeróbica.', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('c549ca90-e95f-4947-8fb2-3a946619d4a5', 'De acordo com a 1ª Lei de Newton (Inércia), um corpo em repouso tende a:', 'ciencias', 'ensino_medio', '1_ao_3_ano_medio', 5, 'A matéria resiste à alteração de seu estado de movimento se a força resultante for nula.', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('db692a23-528f-4e65-99e0-e9848ad2d9eb', 'Qual é o valor de x na equação: 2x + 6 = 18?', 'matematica', 'fundamental_2', '7_ao_9_ano', 4, '2x = 18 - 6 => 2x = 12 => x = 6.', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44'),
('f08e5d7e-5bbd-4feb-853f-970d87e7c8a6', 'Qual é a probabilidade de se obter soma 7 no lançamento de dois dados perfeitos de 6 faces?', 'matematica', 'superior', 'faculdade', 8, 'São 6 combinações favoráveis (1+6, 2+5, 3+4, 4+3, 5+2, 6+1) em 36 possíveis: 6/36 = 1/6.', 1, '2026-09-04 00:48:46', '2026-09-04 00:48:46'),
('f7bb5905-ddd9-42e7-96f9-af2a69c97154', 'Qual é o valor do seno de 30°?', 'matematica', 'ensino_medio', '1_ao_2_ano_medio', 5, 'Pela tabela dos ângulos notáveis da trigonometria, sen(30°) = 1/2 = 0,5.', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('f9c44a4a-6c8a-4dd3-88d6-fa415152cb3a', 'Em que ano ocorreu a Proclamação da Independência do Brasil?', 'historia', 'fundamental_2', '7_ao_9_ano', 3, 'Dom Pedro I proclamou a independência às margens do riacho Ipiranga em 7 de setembro de 1822.', 1, '2026-09-04 00:48:45', '2026-09-04 00:48:45'),
('faf95791-4712-4a0c-b7d0-a86b31c5503a', 'Qual é o maior planeta do nosso Sistema Solar?', 'ciencias', 'fundamental_1', '3_ao_5_ano', 2, 'Júpiter é o maior planeta do Sistema Solar, sendo um gigante gasoso.', 1, '2026-09-04 00:48:44', '2026-09-04 00:48:44');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_rewards`
--

CREATE TABLE `family_rewards` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `token_cost` int(11) NOT NULL DEFAULT 20,
  `category` enum('GASTRONOMY','ENTERTAINMENT','OUTING','GIFT','PRIVILEGE') NOT NULL DEFAULT 'ENTERTAINMENT',
  `icon` varchar(20) NOT NULL DEFAULT '?',
  `allowed_profile` enum('ALL','CHILD','PARENT') NOT NULL DEFAULT 'ALL',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_rewards`
--

INSERT INTO `family_rewards` (`id`, `family_id`, `created_by`, `title`, `description`, `token_cost`, `category`, `icon`, `allowed_profile`, `is_active`, `created_at`, `updated_at`) VALUES
('062cda1b-235c-42d1-87a3-6835eb698863', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Rodada de Sorvete / Açaí', 'Passeio até a sorveteria para saborear sua sobremesa preferida.', 15, 'GASTRONOMY', '🍦', 'ALL', 1, '2026-08-31 19:33:49', '2026-08-31 19:33:49'),
('292723bd-90ab-45b7-b4ec-1f2c0fac694d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Noite da Pizza em Família', 'Você escolhe o sabor da pizza na sexta-feira ou sábado!', 40, 'GASTRONOMY', '🍕', 'ALL', 1, '2026-08-31 19:33:49', '2026-08-31 19:33:49'),
('2ea197dd-d59c-44b8-b632-e5db24ecd111', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Comprar um Livro ou Quadrinho Novo', 'Escolha um novo livro ou HQ para expandir sua estante.', 45, 'GIFT', '📚', 'ALL', 1, '2026-08-31 19:33:49', '2026-08-31 19:33:49'),
('536766d9-0a96-406b-83b4-3960e467a204', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '1h Extra de Videogame / Telas', 'Tempo extra de diversão nos seus jogos e aplicativos favoritos.', 20, 'ENTERTAINMENT', '🎮', 'CHILD', 1, '2026-08-31 19:33:49', '2026-08-31 19:33:49'),
('56ac107f-69bd-4f60-8b0c-efa954803e7f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Passeio no Parque ou Praia', 'Dia especial de lazer ao ar livre, andar de bicicleta ou praia.', 30, 'OUTING', '🏖️', 'ALL', 1, '2026-08-31 19:33:49', '2026-08-31 19:33:49'),
('6d0b417d-d36d-4562-b342-61f6803bb16d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Noite do Hambúrguer Artesanal', 'Lanches especiais com batata frita e refrigerante em família.', 35, 'GASTRONOMY', '🍔', 'ALL', 1, '2026-08-31 19:33:49', '2026-08-31 19:33:49'),
('81c7a397-df2c-4135-83ce-41566508d4f8', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Folga de 1 Tarefa Doméstica', 'Vale folga de lavar a louça ou arrumar a mesa hoje!', 25, 'PRIVILEGE', '🎲', 'CHILD', 1, '2026-08-31 19:33:49', '2026-08-31 19:33:49'),
('91f56ae4-102f-4459-bd05-d5207b08db00', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Dormir até mais tarde no Sábado', 'Acordar na hora que quiser sem hora marcada ou despertador.', 15, 'PRIVILEGE', '🛌', 'ALL', 1, '2026-08-31 19:33:49', '2026-08-31 19:33:49'),
('b13b6018-7af0-4c6c-9b65-ba26bd990d19', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Vale Futebol com os Amigos', 'Liberar a pelada do fim de semana com a turma ou assistir ao jogão juntos!', 25, 'OUTING', '⚽', 'ALL', 1, '2026-08-31 19:33:49', '2026-08-31 19:33:49'),
('ca0efb1a-2395-4abf-813a-b7e53e5ba2e8', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Escolher o Filme do Fim de Semana', 'Você manda no controle remoto e escolhe o filme com direito a pipoca.', 15, 'ENTERTAINMENT', '🎬', 'ALL', 1, '2026-08-31 19:33:49', '2026-08-31 19:33:49');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_reward_redemptions`
--

CREATE TABLE `family_reward_redemptions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reward_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `token_cost` int(11) NOT NULL,
  `status` enum('PENDING','APPROVED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `reviewed_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_shopping_items`
--

CREATE TABLE `family_shopping_items` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` varchar(100) DEFAULT '1 un',
  `category` enum('mensal_abastecimento','semanal_feira') NOT NULL DEFAULT 'semanal_feira',
  `is_purchased` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_shopping_items`
--

INSERT INTO `family_shopping_items` (`id`, `family_id`, `name`, `quantity`, `category`, `is_purchased`, `created_at`, `updated_at`) VALUES
('0f551de5-a916-4d10-87d7-f3614a03f66d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Ovos Caipiras Grandes', '2 cartelas (60 un)', 'mensal_abastecimento', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('21eb67af-283e-414b-ae67-ff292f0bbaca', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Aveia em Flocos Finos', '1 kg', 'mensal_abastecimento', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('2d70a7b9-e64f-45e1-b203-ea223486e3cd', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Alface Americana Hidropônica', '2 pés', 'semanal_feira', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('326b1f3f-d508-481b-b889-54bc6fe51c31', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Mandioquinha / Batata Baroa', '1 kg', 'semanal_feira', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('594a5980-00a4-4fd5-bba8-c752aaf5b3d8', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Arroz Integral Agulhinha', '5 kg', 'mensal_abastecimento', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('67e39cd2-324f-4c2f-8ffa-760b19699bbf', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Cenouras Frescas Crocantes', '1 kg', 'semanal_feira', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('81b3dc7b-7675-4f7f-9069-e0b274248f69', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Azeite de Oliva Extra Virgem', '500 ml', 'mensal_abastecimento', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('ad0f63b2-889a-4f4f-8428-9721102023e0', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Filé de Peito de Frango', '3 kg', 'mensal_abastecimento', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('af3029e0-7ef6-41e8-8904-d381384fc4d0', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Banana Prata Madura', '1 dúzia', 'semanal_feira', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('b06cabc9-1b7c-4196-bb7d-fd6e48b7b5e9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Patinho Bovino Moído Fresco', '2 kg', 'mensal_abastecimento', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('c480c07b-b005-4ea2-89e7-a0afff927423', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Limão Taiti para Marinadas', '1 kg', 'semanal_feira', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('cf1aaf70-5c40-4135-8a3c-9c6ffd4505cf', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Brócolis Ninja Teste', '2 un', 'semanal_feira', 1, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('f1493eec-bcf6-4aec-949f-5eb6a84a937e', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Brócolis Ninja Orgânico', '2 maços', 'semanal_feira', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03'),
('f8e83e9d-429f-488c-9a7d-177dcd76075a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'Maçãs Gala Vermelhas', '1 kg', 'semanal_feira', 0, '2026-11-17 01:23:03', '2026-11-17 01:23:03');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_users`
--

CREATE TABLE `family_users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('ADMIN','PARENT','CHILD') NOT NULL DEFAULT 'CHILD',
  `phone` varchar(30) DEFAULT NULL,
  `school_or_work` varchar(150) DEFAULT NULL,
  `profile_photo_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `hero_nickname` varchar(100) DEFAULT NULL,
  `pin` varchar(10) DEFAULT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_users`
--

INSERT INTO `family_users` (`id`, `name`, `email`, `password`, `role`, `phone`, `school_or_work`, `profile_photo_url`, `created_at`, `updated_at`, `hero_nickname`, `pin`, `family_id`) VALUES
('40058126-1471-4c26-945c-1f329a49a2be', 'Jennifer Lira', 'jennifer@liraquest.com', '$2b$10$Ejj8NX2qfBVdS.9ReNhmBOiMkYdLEPQw2/5HeR1/aXbWU.1Iunj06', 'CHILD', NULL, NULL, NULL, '2026-11-21 19:40:42', '2026-11-21 19:40:42', 'Valquíria Jennifer', '1234', '807e34e4-5ffd-42d9-a9e5-5385aa920d95'),
('61f4c226-505e-4ed7-8de8-4ad2dc210fc2', 'Guardião Sidney (Pai)', 'pai@liraquest.com', '$2b$10$emvgxv5CoF6.a6M.x4Z5de12bNoz.icd9o8anSOG.p2GfLsznd54K', 'PARENT', '11967003082', 'Trabalho / Família', '/uploads/profiles/ff099777-bf58-42fa-aa33-8b3978d91e27.png', '2026-08-31 02:35:30', '2026-11-17 15:45:32', NULL, NULL, NULL),
('6e462a8b-7384-45bc-a584-188fb64bced4', 'Mestre Administrador (Sidney)', 'admin@liraquest.com', '$2b$10$a5Alg9DiVkRCft5eg4UTyuR0NaU9bk6dFribLgP5swdMSxluB04zK', 'ADMIN', '11967003082', 'Desenvolvimento LiraQuest', NULL, '2026-08-31 02:35:30', '2026-11-17 15:45:32', NULL, NULL, NULL),
('70d3b59f-e6d2-4903-9409-d832753a7c09', 'Sidney Lira', 'sidney@liraquest.com', '$2b$10$Ejj8NX2qfBVdS.9ReNhmBOiMkYdLEPQw2/5HeR1/aXbWU.1Iunj06', 'ADMIN', NULL, NULL, NULL, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 'Paladino Sidney', NULL, '807e34e4-5ffd-42d9-a9e5-5385aa920d95'),
('74ced466-eded-45b3-8fe5-db993e71bb4f', 'Jennifer Nayla', 'xzjennifernayla@gmail.com', '$2b$10$gnljHvM/v2dgtK.DRIgXcuzafE4k4vyZke0wzvPKHAZ8NrA2Og.oG', 'CHILD', NULL, NULL, '/uploads/profiles/de513b31-6479-4e1f-80c1-16742679128c.jpg', '2026-08-31 22:16:43', '2026-09-02 00:16:34', NULL, NULL, NULL),
('b3128978-89c1-49a4-ac21-56732fa78eda', 'Elaine', 'elaine-ati@hotmail.com', '$2b$10$UOAujLSK0nrkSU0Xalfu2Ot6WnvKtDK8SWi5HO/G21rd9kxFbmUVi', 'PARENT', NULL, NULL, NULL, '2026-08-31 19:37:00', '2026-08-31 19:37:00', NULL, NULL, NULL),
('bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', 'Sidney P Lira', 'xzsidney@yahoo.com.br', '$2b$10$emvgxv5CoF6.a6M.x4Z5de12bNoz.icd9o8anSOG.p2GfLsznd54K', 'PARENT', '11967003082', NULL, '/uploads/profiles/1316e43c-d358-49bc-b5e0-af3b290b396f.png', '2026-08-31 21:07:02', '2026-11-17 17:14:42', NULL, NULL, NULL),
('c6e55de6-969f-4572-b97c-e93b872afdcf', 'Elaine Lira', 'elaine@liraquest.com', '$2b$10$Ejj8NX2qfBVdS.9ReNhmBOiMkYdLEPQw2/5HeR1/aXbWU.1Iunj06', 'PARENT', NULL, NULL, NULL, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 'Mestra Elaine', NULL, '807e34e4-5ffd-42d9-a9e5-5385aa920d95'),
('eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 'Paulo Henrique Lira', 'paulo@liragames.com.br', '$2b$10$emvgxv5CoF6.a6M.x4Z5de12bNoz.icd9o8anSOG.p2GfLsznd54K', 'CHILD', NULL, 'Escola Reino do Saber - 8º Ano', '/uploads/profiles/47f6416a-6f47-4c1c-bd92-0d30fa8f908c.png', '2026-08-31 02:35:30', '2026-11-17 16:06:21', NULL, NULL, NULL),
('f85ea042-b0b0-484c-be2b-3ea9b0503b6b', 'Paulo Lira', 'paulo@liraquest.com', '$2b$10$Ejj8NX2qfBVdS.9ReNhmBOiMkYdLEPQw2/5HeR1/aXbWU.1Iunj06', 'CHILD', NULL, NULL, NULL, '2026-11-21 19:40:41', '2026-11-21 19:40:41', 'Sir Paulinho', '1234', '807e34e4-5ffd-42d9-a9e5-5385aa920d95');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_whatsapp_configs`
--

CREATE TABLE `family_whatsapp_configs` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `group_id_or_phone` varchar(255) DEFAULT '',
  `is_connected` tinyint(1) NOT NULL DEFAULT 0,
  `notify_meals` tinyint(1) NOT NULL DEFAULT 1,
  `notify_hydration` tinyint(1) NOT NULL DEFAULT 1,
  `session_data` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_whatsapp_configs`
--

INSERT INTO `family_whatsapp_configs` (`id`, `family_id`, `group_id_or_phone`, `is_connected`, `notify_meals`, `notify_hydration`, `session_data`, `created_at`, `updated_at`) VALUES
('54e40320-2fa0-4652-adf7-2112a8db8af5', '0846e533-43b6-4fb7-adf0-5f0394606efb', '5511967003082', 1, 1, 1, '{\"connected_at\":\"2026-11-17T12:29:20.835Z\",\"device\":\"WhatsApp Web do Papai\",\"simulated\":true,\"meta_phone_number_id\":\"1388667777672355\",\"meta_access_token\":\"EAAVPdb6vZCG4BTHyvHajnz0rLOPPM2sz5fCF0BqVQj2ErnHLyO13jE8rKGOOzS27OgAOY9x5GnfvnjVuqXiJs23GnpchWgdrxZC85MxgMZCdGPUa1QYyeg4g6wycTZBVOKZAi8zFdN8RWsGwNltWGSExxssNfCZBCrD75ZBttZCKAKg1L3NhFC3fjGZCRGxJZCHrh5uKVbcv7u4EheEIrZAZBSvNLDxztaZAA5pdKkcoxShZBZCnGfo21KgHzpIPlRK5cnTmxABkOLeA59tEwFiBZANAV4V1RgZDZD\"}', '2026-11-17 12:29:20', '2026-11-17 17:14:42'),
('caf1d773-3573-438f-8ec5-44fa43796cc6', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '5511967003082', 1, 1, 1, '{\"meta_phone_number_id\":\"1388667777672355\",\"meta_access_token\":\"EAAVPdb6vZCG4BTHyvHajnz0rLOPPM2sz5fCF0BqVQj2ErnHLyO13jE8rKGOOzS27OgAOY9x5GnfvnjVuqXiJs23GnpchWgdrxZC85MxgMZCdGPUa1QYyeg4g6wycTZBVOKZAi8zFdN8RWsGwNltWGSExxssNfCZBCrD75ZBttZCKAKg1L3NhFC3fjGZCRGxJZCHrh5uKVbcv7u4EheEIrZAZBSvNLDxztaZAA5pdKkcoxShZBZCnGfo21KgHzpIPlRK5cnTmxABkOLeA59tEwFiBZANAV4V1RgZDZD\"}', '2026-11-17 17:14:42', '2026-11-17 17:14:42'),
('cd7b7b2b-c643-46f9-9141-5c9333aeff89', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '5511967003082', 0, 1, 1, '{\"connected_at\":\"2026-11-17T14:27:08.794Z\",\"device\":\"WhatsApp Celular Guardião (Sidney)\",\"simulated\":true,\"meta_phone_number_id\":\"1388667777672355\",\"meta_access_token\":\"EAAVPdb6vZCG4BTHyvHajnz0rLOPPM2sz5fCF0BqVQj2ErnHLyO13jE8rKGOOzS27OgAOY9x5GnfvnjVuqXiJs23GnpchWgdrxZC85MxgMZCdGPUa1QYyeg4g6wycTZBVOKZAi8zFdN8RWsGwNltWGSExxssNfCZBCrD75ZBttZCKAKg1L3NhFC3fjGZCRGxJZCHrh5uKVbcv7u4EheEIrZAZBSvNLDxztaZAA5pdKkcoxShZBZCnGfo21KgHzpIPlRK5cnTmxABkOLeA59tEwFiBZANAV4V1RgZDZD\"}', '2026-11-17 14:10:01', '2026-11-17 18:08:31');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_zombi_campaigns`
--

CREATE TABLE `family_zombi_campaigns` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `code` varchar(60) NOT NULL,
  `title` varchar(150) NOT NULL,
  `subtitle` varchar(200) DEFAULT NULL,
  `premise_hero` text NOT NULL,
  `premise_zombie` text NOT NULL,
  `current_mission_number` int(11) NOT NULL DEFAULT 1,
  `active_mode` enum('HERO','ZOMBIE') NOT NULL DEFAULT 'HERO',
  `campaign_state` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`campaign_state`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_zombi_campaigns`
--

INSERT INTO `family_zombi_campaigns` (`id`, `code`, `title`, `subtitle`, `premise_hero`, `premise_zombie`, `current_mission_number`, `active_mode`, `campaign_state`, `is_active`, `created_at`, `updated_at`) VALUES
('bfb80014-0d59-48ea-9d5a-2d6a1c07aa03', 'o_sinal_do_fim_do_mundo', 'Campanha: O Sinal do Fim do Mundo', 'Sistema Investigativo Carmen Sandiego + Fort Hendrix (5 Capítulos)', 'O vírus não é um acidente terreno; é um feromônio cósmico desenhado para converter populações em biomassa e chamar devoradores cósmicos. Os Heróis Zumbis mais inteligentes mantiveram memórias técnicas e estão erguendo um Farol Quântico Suborbital para atrair a Entidade Devoradora. Não há cura: a única saída dos Heróis Vivos é cegar a Terra, desligar a rede de energia, destruir as lentes de foco atmosférico e implodir o transmissor central antes da chegada da entidade.', 'A Fome não é uma maldição — é um chamado estelar! Nossas mentes retiveram o conhecimento técnico necessário para erguer o Farol Quântico Suborbital e atrair a Entidade Cósmica até a Terra. Quando o Devorador de Mundos pousar, teremos biomassa divina e carne cósmica infinita para nos banquetearmos pela eternidade! Precisamos defender e ativar cada etapa do projeto contra a S.H.I.E.L.D. e os últimos heróis vivos.', 5, 'HERO', '{\"missions\":{\"1\":{\"completedTokens\":[],\"flags\":[]},\"2\":{\"completedTokens\":[],\"flags\":[]},\"3\":{\"completedTokens\":[],\"flags\":[]},\"4\":{\"completedTokens\":[],\"flags\":[]},\"5\":{\"completedTokens\":[],\"flags\":[]}},\"legacy_items\":[]}', 1, '2026-10-21 21:40:06', '2026-11-07 22:49:32');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_zombi_missions`
--

CREATE TABLE `family_zombi_missions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `campaign_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `mission_number` int(11) NOT NULL,
  `code` varchar(60) NOT NULL,
  `title` varchar(150) NOT NULL,
  `location_name` varchar(180) NOT NULL,
  `rulebook_map_code` varchar(30) NOT NULL,
  `tiles_needed` varchar(120) NOT NULL,
  `map_image_url` varchar(255) DEFAULT NULL,
  `setup_notes` text DEFAULT NULL,
  `lore_hero` text NOT NULL,
  `lore_zombie` text NOT NULL,
  `inventory_badges` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`inventory_badges`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_zombi_missions`
--

INSERT INTO `family_zombi_missions` (`id`, `campaign_id`, `mission_number`, `code`, `title`, `location_name`, `rulebook_map_code`, `tiles_needed`, `map_image_url`, `setup_notes`, `lore_hero`, `lore_zombie`, `inventory_badges`, `created_at`, `updated_at`) VALUES
('03ad42cf-417c-400b-8f24-0556210a50e1', 'bfb80014-0d59-48ea-9d5a-2d6a1c07aa03', 5, 'M05_O_FAROL_NAS_NUVENS', 'CAPÍTULO 5: O CLÍMAX – O FAROL NAS NUVENS', 'Plataforma de Lançamento no Topo da Torre Oscorp', 'MZ5 (Pág. 29)', '2V, 3V, 4V, 5R, 8R, 9V', '', 'Monte os 6 tiles (5R, 4V / 9V, 3V / 2V, 8R) conforme a Missão MZ5 (pág. 29). A área demarcada à direita representa o núcleo superior do Farol.', '\"A Entidade Cósmica já entrou na borda do sistema solar; sombras colossais cobrem as estrelas e a atmosfera queima em um tom púrpuro apocalíptico. Os heróis zumbis sobreviventes juntaram os restos do transmissor no topo da torre e estão canalizando a própria energia vital para acender a centelha final! Desarmem os 3 Pilares de Plasma, derrotem o General Zumbi Líder e detonem o Pulso Eletromagnético (EMP) no coração do farol!\"', '\"O céu arde em púrpura e a silhueta colossal de Galactus se desenha entre os planetas! Estamos no topo da Torre Oscorp canalizando nossa própria energia vital nos 3 Pilares de Plasma para acender a centelha final. Os últimos Super-Heróis Vivos trouxeram uma bomba de Pulso Eletromagnético (EMP) para apagar nosso farol. Defendam os pilares, esmaguem o líder humano e iniciem o Banquete Eterno!\"', '[{\"key\":\"has_log\",\"label\":\"📡 Frequência do Dispositivo EMP\"},{\"key\":\"has_key\",\"label\":\"⚡ Pilares de Plasma 1 e 2 Desarmados (000)\"},{\"key\":\"has_power\",\"label\":\"🔋 3º Pilar de Plasma Desativado\"},{\"key\":\"has_transponder\",\"label\":\"💥 General Derrotado & EMP Armado\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('1d1a19ba-75b5-4e5b-9f57-f8c164279e3e', 'bfb80014-0d59-48ea-9d5a-2d6a1c07aa03', 4, 'M04_O_SILO_BLINDADO', 'CAPÍTULO 4: O SILO BLINDADO', 'Instalação Militar Fortificada / Base Subterrânea da Hydra', 'MZ4 (Pág. 28)', '1R, 2V, 3R, 4R, 5R, 6V, 7R, 8V, 9V', '', 'Monte o mapa grande 3x3 (9 tiles: 3R, 9V, 6V / 7R, 4R, 5R / 2V, 8V, 1R) conforme a Missão MZ4 (pág. 28). Posicione os 6 Tokens nos objetivos indicados.', '\"Para lançar a ogiva de sinalizador suborbital que ativará o farol nos céus, os zumbis tomaram um silo de lançamento blindado da Hydra. A base está lacrada com portas de titânio e sistemas de defesa automatizados que atiram em qualquer ser com batimentos cardíacos! Precisamos caçar os cartões Alfa e Beta dos oficiais, desligar as torretas automáticas e retirar a ogiva primária do poço do míssil!\"', '\"Este silo subterrâneo da Hydra guarda o foguete que levará nosso sinalizador para fora da atmosfera! As torretas automáticas da base ainda estão ativas e os sobreviventes tentam trancar o poço de lançamento. Vamos arrancar os cartões Alfa e Beta dos comandantes, assumir o controle das defesas e preparar a ogiva!\"', '[{\"key\":\"has_log\",\"label\":\"📑 Planta Subterrânea da Hydra\"},{\"key\":\"has_key\",\"label\":\"💳 Cartões Alfa & Beta (Código 880)\"},{\"key\":\"has_power\",\"label\":\"🔫 Torretas Automáticas Desativadas\"},{\"key\":\"has_transponder\",\"label\":\"🚀 Ogiva Suborbital Sabotada\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('7b4b5595-955b-497d-8f83-15033d091032', 'bfb80014-0d59-48ea-9d5a-2d6a1c07aa03', 1, 'M01_O_PRIMEIRO_ECO', 'CAPÍTULO 1: O PRIMEIRO ECO', 'Perímetro Urbano e Antena de Retransmissão Local', 'MZ1 (Pág. 24)', '3R, 5R, 8R, 9V', '/zombi/img/map_mz1.png', 'Monte os tiles 3R, 5R, 8R e 9V conforme a Missão MZ1 (pág. 24). Posicione os Tokens numerados de 1 a 6 nas zonas correspondentes aos objetivos e salas do mapa.', '\"O céu de Manhattan emite um zumbido grave de baixa frequência e um brilho violeta anômalo. Captamos uma transmissão nas frequências da S.H.I.E.L.D., mas não é socorro: é uma sequência binária de telemetria apontada para o espaço profundo! Uma torre de micro-ondas modificada está sendo defendida no quarteirão. Precisamos acessar o servidor térreo, cortar o transformador da rua e arrancar o Cristal Frequencial do líder inimigo!\"', '\"O primeiro harmônico do nosso Farol já ecoa na ionosfera! Mas os agentes da S.H.I.E.L.D. ativaram travas de bloqueio no servidor térreo e tentam cortar a força da nossa antena de micro-ondas. Precisamos destravar a telemetria, sobrecarregar o transformador a nosso favor e garantir o Cristal Frequencial antes que a resistência feche o cerco!\"', '[{\"key\":\"has_log\",\"label\":\"📑 Telemetria do Servidor\"},{\"key\":\"has_key\",\"label\":\"🔑 Código de Modulação (739)\"},{\"key\":\"has_power\",\"label\":\"⚡ Transformador Controlado\"},{\"key\":\"has_transponder\",\"label\":\"💎 Cristal Frequencial & 3 Coordenadas\"}]', '2026-10-21 21:40:06', '2026-10-21 21:40:06'),
('b2263b85-dca8-4760-8027-718dc148bca3', 'bfb80014-0d59-48ea-9d5a-2d6a1c07aa03', 3, 'M03_OS_OLHOS_DOS_VIGILANTES', 'CAPÍTULO 3: OS OLHOS DOS VIGILANTES', 'Antigo Observatório / Laboratório de Óptica Espacial', 'MZ3 (Pág. 26)', '1V, 3R, 5R, 6R, 7V, 8R', '', 'Monte os 6 tiles (7V, 1V, 5R, 6R, 3R, 8R) conforme a Missão MZ3 (pág. 26). O edifício superior representa a Cúpula do Observatório.', '\"Mesmo sem a energia total da usina, os infectados instalaram três grandes espelhos de colimação — lentes quânticas de alta precisão — no topo do laboratório astronômico para focar o pulso luminoso em direção à órbita da Lua. Se essas lentes alinharem, o farol se tornará visível para além da Via Láctea! Precisamos recuperar os diários de calibração, quebrar os mecanismos dos espelhos e derrotar o Guardião das passarelas!\"', '\"No topo do Observatório repousam os Três Olhos Quânticos! Quando alinharmos os espelhos de colimação com a órbita lunar, nosso chamado atravessará a galáxia. Os heróis vivos e o Mago Supremo tentam selar a cúpula para cegar nossas lentes. Vamos tomar os códigos de calibração e alinhar os espelhos!\"', '[{\"key\":\"has_log\",\"label\":\"🔭 Diários de Calibração Óptica\"},{\"key\":\"has_key\",\"label\":\"🪞 Espelhos 1 e 2 Sabotados (912)\"},{\"key\":\"has_power\",\"label\":\"⚙️ Giroscópio do 3º Espelho Destravado\"},{\"key\":\"has_transponder\",\"label\":\"💥 Lentes Quânticas Destruídas / Guardião Vencido\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('e1b566b6-1e7f-4206-b079-10bad3a8a9f1', 'bfb80014-0d59-48ea-9d5a-2d6a1c07aa03', 2, 'M02_A_BATERIA_DE_SANGUE', 'CAPÍTULO 2: A BATERIA DE SANGUE', 'Complexo Industrial / Subestação de Energia', 'MZ2 (Pág. 25)', '1R, 2V, 4V, 5V, 6V, 7R', '', 'Monte os 6 tiles (4V, 2V, 7R, 1R, 6V, 5V) conforme a Missão MZ2 (pág. 25). Posicione os 6 Tokens de investigação nas salas dos bunkers e geradores.', '\"Os dados revelam que o transmissor precisa de uma carga brutal para perfurar a atmosfera. Os infectados invadiram uma usina de reatores e a converteram em uma câmara biomecânica: estão usando contêineres de biomassa para catalisar um reator de matéria escura! Precisamos infiltrar sem disparar as sirenes, purgar os 3 conduítes orgânicos e sobrecarregar o núcleo antes que o tempo acabe!\"', '\"Nossa usina biomecânica está quase pronta! Os contêineres de biomassa pulsarão energia suficiente para rasgar a ionosfera. Mas esquadrões de contenção invadiram as galerias para fechar nossas válvulas orgânicas. Precisamos pressurizar os conduítes e proteger o Núcleo de Matéria Escura!\"', '[{\"key\":\"has_log\",\"label\":\"📑 Mapa de Pressão dos Bunkers\"},{\"key\":\"has_key\",\"label\":\"🧪 Conduítes Alfa & Beta Purgados\"},{\"key\":\"has_power\",\"label\":\"🔧 Terceiro Conduíte & Válvula Mestre\"},{\"key\":\"has_transponder\",\"label\":\"☢️ Sequência de Colapso do Reator Ativa\"}]', '2026-10-21 21:40:06', '2026-10-21 21:40:06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `family_zombi_tokens`
--

CREATE TABLE `family_zombi_tokens` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `mission_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `token_number` int(11) NOT NULL,
  `token_role` varchar(60) NOT NULL,
  `title` varchar(150) NOT NULL,
  `tile_location` varchar(120) DEFAULT NULL,
  `crop_image_url` varchar(255) DEFAULT NULL,
  `initial_status` enum('AVAILABLE','LOCKED') NOT NULL DEFAULT 'AVAILABLE',
  `requires_flags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`requires_flags`)),
  `lock_banner_text` varchar(255) DEFAULT NULL,
  `unlock_action_label` varchar(120) DEFAULT NULL,
  `room_desc_hero` text NOT NULL,
  `room_desc_zombie` text NOT NULL,
  `modal_lore_hero` text NOT NULL,
  `modal_lore_zombie` text NOT NULL,
  `actions_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`actions_json`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `family_zombi_tokens`
--

INSERT INTO `family_zombi_tokens` (`id`, `mission_id`, `token_number`, `token_role`, `title`, `tile_location`, `crop_image_url`, `initial_status`, `requires_flags`, `lock_banner_text`, `unlock_action_label`, `room_desc_hero`, `room_desc_zombie`, `modal_lore_hero`, `modal_lore_zombie`, `actions_json`, `created_at`, `updated_at`) VALUES
('003b02a2-e622-43c0-b2f8-3ef38afedf0b', 'b2263b85-dca8-4760-8027-718dc148bca3', 6, 'Extração / Conclusão', 'Passarela de Evacuação do Domo', 'Zona EXIT • Extremo Norte', '', 'LOCKED', '[\"has_transponder\"]', '🔒 Requisito Final: Resolver o confronto da Cúpula Principal (Token 3).', 'Deixar o Observatório!', 'A escadaria externa que desce da colina do observatório rumo à base subterrânea.', 'O caminho rumo ao Silo Blindado da Hydra para o lançamento suborbital.', 'Os espelhos foram destruídos! Frustrados na superfície, os zumbis tomaram um Silo de Mísseis da Hydra para lançar uma ogiva sinalizadora direto na estratosfera!', 'Com o alinhamento calculado, vamos tomar o Silo Blindado da Hydra e lançar a ogiva de sinalização diretamente para o espaço!', '[{\"type\":\"direct\",\"title_hero\":\"Concluir Capítulo 3 e Rumar ao Silo Blindado!\",\"title_zombie\":\"Concluir Capítulo 3 e Invadir o Silo da Hydra!\",\"subtitle\":\"Todos os heróis na Zona de Saída sem inimigos.\",\"grants_flags\":[\"mission_complete\"],\"outcome_title_hero\":\"🏆 VITÓRIA NO CAPÍTULO 3: CEGANDO OS VIGILANTES!\",\"outcome_title_zombie\":\"🏆 VITÓRIA NO CAPÍTULO 3: OLHOS ABERTOS NO COSMOS!\",\"outcome_desc_hero\":\"As lentes caíram! Preparem-se para infiltrar a base militar no <strong>Capítulo 4: O Silo Blindado</strong>!\",\"outcome_desc_zombie\":\"As estrelas nos ouvem! Avancem para o <strong>Capítulo 4: O Silo Blindado</strong>!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('023f6745-049a-47f0-ae48-d1453c8c6ed4', '1d1a19ba-75b5-4e5b-9f57-f8c164279e3e', 5, 'Interruptor de Mapa', 'Terminal Central das Torretas Automáticas', 'Tile 6V • Sala de Controle Nordeste', '', 'AVAILABLE', '[]', '', 'Hackear Torretas (Token 5)', 'Metralhadoras automatizadas no teto rastreiam qualquer sinal de batimento cardíaco.', 'Canhões de contenção programados para fuzilar qualquer biomassa infectada perto do silo.', 'Desligar o servidor central de defesa apaga os lasers vermelhos que bloqueiam o corredor do Poço do Míssil.', 'Reprogramar as torretas faz com que elas parem de alvejar nossa horda e virem contra os soldados da S.H.I.E.L.D.!', '[{\"type\":\"direct\",\"title_hero\":\"Desativar Sistema de Defesa Automatizado\",\"title_zombie\":\"Inverter Alvo das Torretas contra os Humanos\",\"subtitle\":\"Desbloqueia o caminho seguro até o Poço do Míssil (Token 3).\",\"grants_flags\":[\"has_power\"],\"outcome_title_hero\":\"🔫 Torretas Desligadas! Corredor Seguro!\",\"outcome_title_zombie\":\"🔫 Defesas da Base Dominadas!\",\"outcome_desc_hero\":\"As metralhadoras recolhem para o teto! O acesso ao <strong>Poço do Míssil (Token 3)</strong> está livre. Use o código <strong>880</strong> lá!\",\"outcome_desc_zombie\":\"As torretas agora trabalham para nós! Elimine gratuitamente até 2 Troopers em qualquer zona do mapa e avance para o <strong>Token 3 (Código 880)</strong>!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('05e1e9e7-5876-493d-b594-0a3c52df52c4', '7b4b5595-955b-497d-8f83-15033d091032', 6, 'Extração / Conclusão', 'Perímetro de Extração & Coordenadas', 'Zona EXIT • Fim do Quarteirão', '', 'LOCKED', '[\"has_transponder\"]', '🔒 Requisito Final: Coletar o Cristal Frequencial & Coordenadas no Token 3.', 'Escapar com as 3 Coordenadas!', 'O corredor de evacuação leva para fora do bairro em colapso. Só podemos sair com o Cristal Frequencial e as coordenadas.', 'A rota para o Complexo Industrial (Capítulo 2). Precisamos levar o Cristal sintonizado conosco!', 'Com o modulador quântico arrancado e a antena local apagada, o registro aponta para um Complexo Industrial onde uma \"Bateria de Sangue\" está sendo carregada!', 'O Primeiro Eco foi disparado! Mas para furar a atmosfera terrestre, precisamos marchar até a Subestação Industrial e ativar a Bateria de Sangue!', '[{\"type\":\"direct\",\"title_hero\":\"Concluir Capítulo 1 e Avançar para A Bateria de Sangue!\",\"title_zombie\":\"Concluir Capítulo 1 e Marchar para A Bateria de Sangue!\",\"subtitle\":\"Requer que não haja inimigos na Zona de Saída no tabuleiro.\",\"grants_flags\":[\"mission_complete\"],\"outcome_title_hero\":\"🏆 VITÓRIA NO CAPÍTULO 1: O PRIMEIRO ECO!\",\"outcome_title_zombie\":\"🏆 VITÓRIA NO CAPÍTULO 1: SINAL ECOANDO!\",\"outcome_desc_hero\":\"Vocês apagaram a antena local e decodificaram as coordenadas seguintes! Preparem-se para o <strong>Capítulo 2: A Bateria de Sangue</strong>!\",\"outcome_desc_zombie\":\"A telemetria inicial foi enviada ao espaço! Agora vamos alimentar o reator no <strong>Capítulo 2: A Bateria de Sangue</strong>!\"}]', '2026-10-21 21:40:06', '2026-10-21 21:40:06'),
('0e1541bb-cbab-4694-85ba-b3648def4568', 'b2263b85-dca8-4760-8027-718dc148bca3', 3, 'Clímax / Gatekeeper', 'Cúpula Principal & Passarela do Guardião', 'Tile 7V • Santuário Norte', '', 'LOCKED', '[\"has_key\",\"has_power\"]', '🔒 Requisitos: Espelhos 1 e 2 (Token 2) + Giroscópio do 3º Espelho (Token 5).', 'Digitar [912] & Encarar o Guardião', 'A grande abóbada aberta para o céu estrelado, onde o Guardião patrulha a lente mestra.', 'O domo astronômico onde o Doutor Estranho / Guardião Vivo tenta selar nosso feixe espacial.', 'Ao digitar 912, as portas da cúpula se abrem! Um Herói Zumbi extremamente ágil salta das passarelas superiores para proteger o último espelho!', 'A abóbada se abre com o código 912! O Guardião Supremo lança feitiços de contenção para tentar quebrar nossa lente principal!', '[{\"type\":\"keypad\",\"keypad_code\":\"912\",\"title_hero\":\"Digitar [912], Destruir a Lente Mestra e Enfrentar o Guardião!\",\"title_zombie\":\"Digitar [912], Selar o Foco Lunar e Devorar o Guardião!\",\"subtitle\":\"Desbloqueia o confronto da Cúpula e libera a rota de extração!\",\"grants_flags\":[\"has_transponder\"],\"outcome_title_hero\":\"💥 LENTES DESTRUÍDAS! O GUARDIÃO ATACA!\",\"outcome_title_zombie\":\"🌕 FOCO LUNAR ATINGIDO! DERROTEM O GUARDIÃO!\",\"outcome_desc_hero\":\"Você estilhaça o último espelho de colimação! O raio para a Lua se apaga, mas os dados indicam que os zumbis tomaram um <strong>Silo de Mísseis da Hydra</strong>! <strong>Coloque 1 Super-Herói Inimigo</strong> na Cúpula e abram caminho até a Saída (Token 6)!\",\"outcome_desc_zombie\":\"O pulso luminoso atingiu a Lua! Mas os humanos tentam lançar uma ogiva a partir de um <strong>Silo da Hydra</strong>. Derrotem o Guardião na Cúpula e avancem para a Saída (Token 6)!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('1e33476a-b9db-4b23-8e2c-2256a610c226', '7b4b5595-955b-497d-8f83-15033d091032', 1, 'Ponto de Triagem (Livre)', 'Servidor do Térreo Comercial', 'Tile 8R • Recepção do Prédio', '', 'AVAILABLE', '[]', '', 'Investigar Token 1', 'Racks de servidores piscando em luz violeta. Cabos coaxiais grossos sobem pelo poço do elevador até o terraço.', 'Terminais da S.H.I.E.L.D. bloqueando o envio da nossa telemetria espacial. O cheiro de humanos assustados ainda paira no ar.', 'Os monitores exibem pacotes de dados suborbitais. Alguém com intelecto brilhante reprogramou a rede local da S.H.I.E.L.D. para servir de guia estelar.', 'Os humanos deixaram protocolos de bloqueio ativos. Mas os registros mostram exatamente onde eles esconderam o estabilizador e como o transformador da rua opera.', '[{\"type\":\"direct\",\"title_hero\":\"Gastar 1 Ação para decodificar quem alimenta o sinal\",\"title_zombie\":\"Gastar 1 Ação para rastrear os protocolos de bloqueio\",\"subtitle\":\"Extrai pistas vitais estilo Carmen Sandiego sobre o quarteirão.\",\"grants_flags\":[\"has_log\"],\"outcome_title_hero\":\"📡 Pista Obtida: Rota do Sinal Identificada!\",\"outcome_title_zombie\":\"🧠 Pista Obtida: Sabotagem Humana Mapeada!\",\"outcome_desc_hero\":\"O log revela duas travas: o <strong>Código de Acesso ao Terraço</strong> foi guardado no <em>Escritório de Criptografia (Token 2)</em>, enquanto a antena é alimentada pelo <em>Transformador de Rua (Token 5)</em>. Cuidado: há um furgão blindado instável no beco sul (Token 4)!\",\"outcome_desc_zombie\":\"Os arquivos apontam que a chave de sintonia está trancada no <em>Escritório dos Fundos (Token 2)</em> e que precisamos dominar o <em>Transformador da Rua (Token 5)</em> para estabilizar a Torre de Micro-ondas (Token 3)!\"}]', '2026-10-21 21:40:06', '2026-10-21 21:40:06'),
('217c8e46-c0d5-450e-be08-64df2d96edec', '03ad42cf-417c-400b-8f24-0556210a50e1', 2, 'Investigação & Teste', 'Pilares de Transmissão Norte & Sul', 'Tile 5R • Terraço Noroeste', '', 'AVAILABLE', '[]', '', 'Desarmar Pilares 1 e 2 (Token 2)', 'Duas colunas de plasma disparando raios púrpuras contínuos em direção às nuvens.', 'Os dois primeiros emissores que rasgam as nuvens com o chamado da Fome.', 'Cada pilar exige que o herói mantenha os circuitos em curto sem ser interrompido pelas descargas psíquicas.', 'Canalizar sua própria bioenergia nos pilares exige suportar a radiação cósmica.', '[{\"type\":\"dice\",\"title_hero\":\"Colapsar Pilares de Plasma 1 e 2 (Teste 1d6)\",\"title_zombie\":\"Injetar Energia Vital nos Pilares 1 e 2 (Teste 1d6)\",\"subtitle\":\"4-6: Pilares Dominados (+5 XP) | 2-3: Descarga (1 Dano) | 1: Onda Psíquica!\",\"grants_flags\":[\"has_key\"],\"dice_outcomes\":{\"high\":{\"title\":\"⚡ Pilares 1 e 2 Neutralizados! (Código 000)\",\"desc_hero\":\"Os dois feixes se apagam! O herói ganha +5 XP e confirma o código de anulação: <strong>000</strong>.\",\"desc_zombie\":\"Os dois feixes brilham com força total! Ganhe +5 XP e código de ignição: <strong>000</strong>.\"},\"mid\":{\"title\":\"⚡ Arco de Plasma! (Código 000)\",\"desc_hero\":\"Você desativa os pilares (<strong>000</strong>) e ganha +5 XP, mas sofre 1 Ferimento pela radiação.\",\"desc_zombie\":\"Você ativa os pilares (<strong>000</strong>) e ganha +5 XP, mas sofre 1 Ferimento pelo esforço.\"},\"low\":{\"title\":\"🧠 Onda Psíquica do General!\",\"desc_hero\":\"O General Líder projeta um ataque mental: sofra 1 Ferimento e compre 1 Carta de Spawn, mas os pilares caem (<strong>000</strong>)!\",\"desc_zombie\":\"Contra-ataque dos heróis vivos: sofra 1 Ferimento e compre 1 Carta de Spawn, mas os pilares estão acesos (<strong>000</strong>)!\"}}}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('2fc2a40a-84da-4b03-ae9d-3eb4ef8fb675', '03ad42cf-417c-400b-8f24-0556210a50e1', 3, 'Clímax / Gatekeeper', 'Coração do Farol & O General Líder', 'Tile 4V/3V • Câmara Central da Oscorp', '', 'LOCKED', '[\"has_key\",\"has_power\"]', '🔒 Requisitos: Pilares 1 e 2 (Token 2) + 3º Pilar de Plasma (Token 5).', 'Digitar [000] • BATALHA FINAL!', 'O epicentro do Farol Quântico, onde o General Zumbi Líder flutua envolto em chamas cósmicas.', 'O altar de transmissão onde o líder dos Heróis Vivos tenta instalar a bomba EMP.', 'As portas blindadas da Oscorp se abrem após o código 000! O General Zumbi Líder ergue os olhos famintos enquanto a sombra da Entidade Cósmica paira sobre a Terra!', 'O código 000 abre o núcleo! O último Campeão dos Heróis Vivos ergue sua arma final para tentar impedir nossa ascensão cósmica!', '[{\"type\":\"keypad\",\"keypad_code\":\"000\",\"title_hero\":\"Digitar [000], Enfrentar o General Zumbi e Armar o EMP!\",\"title_zombie\":\"Digitar [000], Esmagar o Campeão Humano e Acender o Farol!\",\"subtitle\":\"Inicia a Batalha Final da Campanha!\",\"grants_flags\":[\"has_transponder\"],\"outcome_title_hero\":\"⚔️ BATALHA FINAL: O GENERAL DO FIM DO MUNDO!\",\"outcome_title_zombie\":\"⚔️ BATALHA FINAL: O ÚLTIMO DEFENSOR DA TERRA!\",\"outcome_desc_hero\":\"<strong>REGRA DE CHEFE FINAL:</strong> Coloque o Super-Herói Zumbi mais poderoso na câmara (ele possui <strong>+2 de Resistência/Toughness</strong> extra)! O dispositivo EMP está armado no coração do farol! Derrotem o General e corram para o Ponto de Detonação (Token 6)!\",\"outcome_desc_zombie\":\"<strong>REGRA DE CHEFE FINAL:</strong> Coloque o Super-Herói Vivo mais forte na câmara (com <strong>+2 de Resistência/Toughness</strong> extra) + 2 Guards! Derrotem o defensor humano e avancem para o Ponto de Ascensão (Token 6)!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('4e7ad034-ecf1-4a78-96cb-92d24955852a', '1d1a19ba-75b5-4e5b-9f57-f8c164279e3e', 3, 'Clímax / Gatekeeper', 'Poço do Míssil & Ogiva Suborbital', 'Tile 3R • Silo Noroeste', '', 'LOCKED', '[\"has_key\",\"has_power\"]', '🔒 Requisitos: Cartões Alfa/Beta (Token 2) + Desativar Torretas (Token 5).', 'Digitar [880] & Acessar Ogiva', 'A imensa comporta circular do silo de lançamento onde o foguete suborbital aponta para o céu.', 'A plataforma de ignição onde a ogiva do sinalizador aguarda a sequência final.', 'Com os Cartões Alfa e Beta inseridos e as torretas desligadas, digite [880] para abrir a escotilha da ogiva e arrancar o núcleo do transmissor!', 'Digite [880] para abrir a câmara do míssil! Os heróis vivos sabotaram os propulsores líquidos, então teremos que levar o núcleo da ogiva até o topo do Arranha-Céu (Capítulo 5)!', '[{\"type\":\"keypad\",\"keypad_code\":\"880\",\"title_hero\":\"Digitar [880] e Retirar a Ogiva Primária do Míssil!\",\"title_zombie\":\"Digitar [880] e Resgatar o Núcleo da Ogiva para a Superfície!\",\"subtitle\":\"Sabota o lançamento do silo e prepara o confronto final nas nuvens!\",\"grants_flags\":[\"has_transponder\"],\"outcome_title_hero\":\"🚀 OGIVA RETIRADA! ALERTA MÁXIMO NO SILO!\",\"outcome_title_zombie\":\"🚀 NÚCLEO RESGATADO! RUMO AO TOPO DO ARRANHA-CÉU!\",\"outcome_desc_hero\":\"Você desarma o míssil! Mas o General Zumbi escapa com as peças reservas para o topo do Arranha-Céu mais alto da cidade! <strong>Compre 1 Carta de Spawn em cada ponto ativo</strong> e fujam pela Rampa Norte (Token 6)!\",\"outcome_desc_zombie\":\"Os propulsores do míssil foram sabotados, mas você resgatou o Núcleo Quântico! Vamos subir ao topo do Arranha-Céu (Capítulo 5) e acender o farol com nossa própria energia vital! Avancem para a Saída (Token 6)!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('5bdbeaef-4ba1-47c6-9d1d-cfe64cf6638c', '7b4b5595-955b-497d-8f83-15033d091032', 4, 'Armadilha de Ganância', 'Furgão Blindado Tombado', 'Tile 9V • Beco dos Destroços', '', 'AVAILABLE', '[]', '', 'Avaliar Risco (Token 4)', 'Um transporte médico da S.H.I.E.L.D. lacrado com correntes e aviso de risco biológico.', 'Um furgão blindado cheirando a plasma fresco, mas cercado de minas de concussão.', 'As portas traseiras estão presas por uma trava pressurizada. Pode haver estimulantes médicos intactos ou uma armadilha deixada na evacuação.', 'Há bolsas de sangue e amostras lá dentro, mas sensores laser da S.H.I.E.L.D. piscam sob o chassi.', '[{\"type\":\"dice\",\"title_hero\":\"Arrombar Trava Pressurizada (Push Your Luck - 1d6)\",\"title_zombie\":\"Rasgar a Lataria Blindada (Push Your Luck - 1d6)\",\"subtitle\":\"4-6: Cura + 5 XP | 2-3: +1 Carta de Traço mas sofre 1 Dano | 1: Explosão!\",\"grants_flags\":[],\"dice_outcomes\":{\"high\":{\"title\":\"💉 Sorte Grande! Suprimentos Intactos!\",\"desc_hero\":\"Você encontra kits de nanorreparo Stark! O herói recupera até 2 de Vida e ganha +5 XP!\",\"desc_zombie\":\"Bolsas de biomassa pura! O herói reduz sua Fome para 0 (ou recupera 1 de Vida) e ganha +5 XP!\"},\"mid\":{\"title\":\"💥 Estilhaços na Abertura!\",\"desc_hero\":\"Você pega 1 Carta de Traço e +3 XP, mas o vapor pressurizado causa 1 Ferimento ao herói.\",\"desc_zombie\":\"Você pega 1 Carta de Traço Zumbi e +3 XP, mas a mina de choque causa 1 Ferimento.\"},\"low\":{\"title\":\"☣️ ARMADILHA SONORA E QUÍMICA!\",\"desc_hero\":\"Gás corrosivo! Todos na zona sofrem 1 Ferimento e 1 Carta de Spawn é comprada imediatamente!\",\"desc_zombie\":\"Granada de luz e som! Sofra 1 Ferimento e coloque 3 Troopers na rua adjacente!\"}}}]', '2026-10-21 21:40:06', '2026-10-21 21:40:06'),
('5e1fc252-53a6-43f0-95eb-11c359da8ce2', '03ad42cf-417c-400b-8f24-0556210a50e1', 4, 'Armadilha de Ganância', 'Cápsula de Emergência da Torre', 'Tile 9V • Sala de Segurança', '', 'AVAILABLE', '[]', '', 'Tentar a Sorte (Token 4)', 'Um armário blindado de emergência de Norman Osborn com soros experimentais.', 'Um cilindro de Fórmula Duende que pode turbinar seus músculos mortos.', 'A Fórmula Duende pode dar força sobre-humana para a batalha final ou causar um colapso orgânico.', 'Ingerir o composto químico pode curar todas as feridas ou explodir em chamas verdes.', '[{\"type\":\"dice\",\"title_hero\":\"Usar Composto Experimental Osborn (Risco 1d6)\",\"title_zombie\":\"Devorar Cilindro da Fórmula Duende (Risco 1d6)\",\"subtitle\":\"4-6: Cura Total + 2 Traços | 1-3: Bomba de Abóbora!\",\"grants_flags\":[],\"dice_outcomes\":{\"high\":{\"title\":\"🟢 Poder Máximo para o Clímax!\",\"desc_hero\":\"O herói recupera toda a Vida, ganha +5 XP e compra 2 Cartas de Traço!\",\"desc_zombie\":\"Fome zerada, Vida totalmente recuperada, +5 XP e 2 Cartas de Traço Zumbi!\"},\"mid\":{\"title\":\"🧪 Reação Instável!\",\"desc_hero\":\"Recupere 1 de Vida e compre 1 Carta de Traço, mas gere 1 Carta de Spawn.\",\"desc_zombie\":\"Zere a Fome e compre 1 Carta de Traço, mas gere 1 Carta de Spawn.\"},\"low\":{\"title\":\"🎃 Armadilha de Bomba de Abóbora!\",\"desc_hero\":\"Explosão no armário! Sofra 1 Ferimento e compre 1 Carta de Spawn!\",\"desc_zombie\":\"Chamas verdes! Sofra 1 Ferimento e compre 1 Carta de Spawn!\"}}}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('60d5e400-08b9-4610-a586-1a5cb8b34ebd', 'b2263b85-dca8-4760-8027-718dc148bca3', 1, 'Ponto de Triagem (Livre)', 'Recepção do Observatório', 'Tile 3R/8R • Pátio Sul', '', 'AVAILABLE', '[]', '', 'Vasculhar Recepção (Token 1)', 'Mapas celestes rasgados e lunetas quebradas apontadas para a anomalia violeta no céu.', 'Cálculos astronômicos rabiscados nas paredes indicando o ângulo orbital da Lua.', 'Os registros do astrônomo-chefe mostram como as três lentes da cúpula estão interligadas.', 'As anotações mostram a sequência exata para travar o foco das lentes em direção ao espaço profundo.', '[{\"type\":\"direct\",\"title_hero\":\"Ler Diários de Calibração Óptica\",\"title_zombie\":\"Absorver Cálculos de Alinhamento Sidéreo\",\"subtitle\":\"Entrega as pistas sobre os mecanismos dos espelhos e o código da cúpula.\",\"grants_flags\":[\"has_log\"],\"outcome_title_hero\":\"🔭 Pista Obtida: Segredo da Cúpula!\",\"outcome_title_zombie\":\"🌌 Pista Obtida: Coordenadas Lunares!\",\"outcome_desc_hero\":\"O diário revela: <em>\\\"Os controles dos Espelhos 1 e 2 ficam na Biblioteca (Token 2) e o Giroscópio Equatorial no Anexo Leste (Token 5). O código da Cúpula Central (Token 3) é <strong>912</strong>.\\\"</em>\",\"outcome_desc_zombie\":\"Anotação obtida: <em>\\\"Ative os Espelhos 1 e 2 na Biblioteca (Token 2) e o Giroscópio no Anexo (Token 5). Depois use o código <strong>912</strong> na Cúpula (Token 3)!\\\"</em>\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('67351305-15a5-4234-a80e-ba343442380f', '1d1a19ba-75b5-4e5b-9f57-f8c164279e3e', 2, 'Investigação & Teste', 'Corredor dos Oficiais (Cartões Alfa & Beta)', 'Tile 7R/4R • Bunkers Centrais', '', 'AVAILABLE', '[]', '', 'Caçar Cartões (Token 2)', 'Corredor blindado onde dois oficiais zumbificados da Hydra vagam com os cartões pendurados no pescoço.', 'Barricada interna onde os oficiais da Hydra guardam as chaves magnéticas Alfa e Beta.', 'Para recuperar ambos os cartões sem ser encurralado nos corredores estreitos, é preciso um ataque rápido e coordenado.', 'Avance sobre os oficiais para arrancar os cartões magnéticos Alfa e Beta e o código de lançamento.', '[{\"type\":\"dice\",\"title_hero\":\"Abater Oficiais eTomar Cartões Alfa & Beta (Teste 1d6)\",\"title_zombie\":\"Devorar Comandantes e Pegar Cartões Alfa & Beta (Teste 1d6)\",\"subtitle\":\"4-6: Captura Limpa | 2-3: Reforços de Guardas | 1: Contra-ataque!\",\"grants_flags\":[\"has_key\"],\"dice_outcomes\":{\"high\":{\"title\":\"💳 Cartões Alfa e Beta Recuperados! (Código 880)\",\"desc_hero\":\"Golpe preciso! Você recolhe os dois cartões com o código <strong>880</strong> e ganha +5 XP!\",\"desc_zombie\":\"Refeição dupla! Zere a Fome, ganhe +5 XP e pegue os cartões com o código <strong>880</strong>!\"},\"mid\":{\"title\":\"💳 Cartões Obtidos sob Fogo Cruzado! (Código 880)\",\"desc_hero\":\"Você pega os cartões (<strong>880</strong>), mas o combate atrai 2 Guards para a zona adjacente!\",\"desc_zombie\":\"Você pega os cartões (<strong>880</strong>), mas 2 Specialists da S.H.I.E.L.D. surgem no corredor!\"},\"low\":{\"title\":\"💥 Granada de Concussão do Oficial!\",\"desc_hero\":\"O oficial detona uma granada ao cair! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas os cartões (<strong>880</strong>) são seus!\",\"desc_zombie\":\"Armadilha explosiva! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas os cartões (<strong>880</strong>) foram coletados!\"}}}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('6871d469-cf11-49c7-b6db-c42398114d3c', '7b4b5595-955b-497d-8f83-15033d091032', 2, 'Investigação & Teste', 'Escritório de Criptografia', 'Tile 8R • Sala dos Fundos', '', 'AVAILABLE', '[]', '', 'Inspecionar Token 2', 'Mesas reviradas e um terminal militar protegido por firewall biométrico e sensores acústicos.', 'Um terminal tático zumbindo com as credenciais de acesso à plataforma da antena.', 'Na tela rachada, o protocolo de contenção exige extração manual do código de segurança sem disparar o alarme do quarteirão.', 'O console guarda a sequência numérica que libera o acesso blindado à base da antena no metrô/terraço.', '[{\"type\":\"dice\",\"title_hero\":\"Hackear o Servidor para extrair o Código (Teste 1d6)\",\"title_zombie\":\"Arrancar o Módulo de Memória com a Senha (Teste 1d6)\",\"subtitle\":\"4-6: Sucesso limpo | 2-3: Sucesso com Spawn | 1: Alarme Crítico (+1 para Herói Tecnológico)\",\"grants_flags\":[\"has_key\"],\"dice_outcomes\":{\"high\":{\"title\":\"🔓 Sucesso Pleno! Código [ 7 - 3 - 9 ] Obtido!\",\"desc_hero\":\"Você burlou o sistema em silêncio absoluto! Descobriu a senha da comporta da antena: <strong>739</strong>. Ganhe +5 XP!\",\"desc_zombie\":\"Sua mente faminta decifrou o padrão instantaneamente! Senha obtida: <strong>739</strong>. Ganhe +5 XP!\"},\"mid\":{\"title\":\"⚠️ Código [ 7 - 3 - 9 ] Extraído com Curto-Circuito!\",\"desc_hero\":\"Você conseguiu a senha <strong>739</strong>, mas o painel explodiu em faíscas: compre 1 Carta de Spawn imediata no ponto mais próximo!\",\"desc_zombie\":\"Você arrancou o código <strong>739</strong>, mas a sirene local tocou: coloque 2 Troopers da S.H.I.E.L.D. na zona de Spawn mais próxima!\"},\"low\":{\"title\":\"🚨 FALHA CRÍTICA: Alarme de Contenção!\",\"desc_hero\":\"Choque elétrico! O herói sofre 1 de Dano e 1 Carta de Spawn é comprada, mas o código <strong>739</strong> pisca na tela queimada antes de apagar.\",\"desc_zombie\":\"Descarga de choque da S.H.I.E.L.D.! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas você memoriza o código <strong>739</strong>!\"}}},{\"type\":\"direct\",\"title_hero\":\"Vasculhar Gavetas de Suprimentos (Ação Secundária)\",\"title_zombie\":\"Farejar Esconderijo sob a Mesa (Ação Secundária)\",\"subtitle\":\"Busca rápida por recursos extras na sala.\",\"grants_flags\":[],\"outcome_title_hero\":\"🧰 Kit Tático Encontrado!\",\"outcome_title_zombie\":\"🩸 Rastro de Adrenalina!\",\"outcome_desc_hero\":\"Você encontra munição incendiária improvisada: compre 1 Carta de Traço (Trait) grátis para o seu herói!\",\"outcome_desc_zombie\":\"O cheiro de medo revigora seus sentidos: compre 1 Carta de Traço Zumbi (Zombie Trait) grátis!\"}]', '2026-10-21 21:40:06', '2026-10-21 21:40:06'),
('703d3df4-3c9e-45f4-bb23-2a84e7080c21', '1d1a19ba-75b5-4e5b-9f57-f8c164279e3e', 4, 'Armadilha de Ganância', 'Arsenal Experimental da Hydra', 'Tile 2V • Depósito Sudoeste', '', 'AVAILABLE', '[]', '', 'Arrombar Arsenal (Token 4)', 'Caixas blindadas com protótipos de armas de energia tesseract e munição pesada.', 'Câmaras de estimulação neural da Hydra que multiplicam a ferocidade em combate.', 'O cofre de armas tem um sensor de sobrecarga. Se abrir corretamente, o grupo ganha poder de fogo devastador.', 'Os injetores de adrenalina sintética podem dar ações extras ou fritar seus nervos.', '[{\"type\":\"dice\",\"title_hero\":\"Destravar Cofre de Armas da Hydra (Risco 1d6)\",\"title_zombie\":\"Quebrar Câmara de Estimulação (Risco 1d6)\",\"subtitle\":\"4-6: +2 Traços e +5 XP | 1-3: Descarga de Plasma!\",\"grants_flags\":[],\"dice_outcomes\":{\"high\":{\"title\":\"🔫 Protótipo Tesseract Equipado!\",\"desc_hero\":\"Armamento pesado! Compre 2 Cartas de Traço e ganhe +5 XP!\",\"desc_zombie\":\"Fúria Sintética! Compre 2 Cartas de Traço Zumbi e ganhe +5 XP!\"},\"mid\":{\"title\":\"⚡ Curto no Cofre!\",\"desc_hero\":\"Ganhe 1 Carta de Traço, mas sofra 1 Ferimento.\",\"desc_zombie\":\"Ganhe 1 Carta de Traço Zumbi, mas sofra 1 Ferimento.\"},\"low\":{\"title\":\"💥 Explosão de Munição!\",\"desc_hero\":\"Todos na sala sofrem 1 Ferimento e 1 Carta de Spawn é comprada!\",\"desc_zombie\":\"Todos na sala sofrem 1 Ferimento e 1 Carta de Spawn é comprada!\"}}}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('7464831e-3338-4b6c-b05d-24d1735a5100', '03ad42cf-417c-400b-8f24-0556210a50e1', 6, 'Extração / Conclusão', 'Detonação do EMP & Desfecho da Terra', 'Zona EXIT • Plataforma Leste', '', 'LOCKED', '[\"has_transponder\"]', '🔒 Requisito Final: Armar o EMP e derrotar o General no Token 3.', 'DETONAR EMP E CONCLUIR CAMPANHA!', 'O heliporto de extração de onde acionaremos o detonador remoto do Pulso Eletromagnético.', 'O parapeito da torre de onde contemplaremos a descida da Entidade Cósmica.', 'Com o General derrotado e todos os heróis na plataforma de extração, você aperta o gatilho do Pulso Eletromagnético (EMP)!', 'Com os últimos defensores humanos derrotados e a bomba EMP destruída, o feixe púrpuro perfura as estrelas!', '[{\"type\":\"direct\",\"title_hero\":\"💥 DETONAR PULSO ELETROMAGNÉTICO (EMP) — SALVAR A TERRA!\",\"title_zombie\":\"🌌 DISPARAR O FAROL QUÂNTICO — INICIAR O BANQUETE CÓSMICO!\",\"subtitle\":\"Finaliza a Campanha de 5 Capítulos!\",\"grants_flags\":[\"mission_complete\",\"campaign_complete\"],\"outcome_title_hero\":\"🏆 FIM DA CAMPANHA: A TERRA ESTÁ INVISÍVEL E SALVA!\",\"outcome_title_zombie\":\"🏆 FIM DA CAMPANHA: O BANQUETE ETERNO COMEÇOU!\",\"outcome_desc_hero\":\"Uma onda azul de pulso eletromagnético varre Manhattan, implodindo o Farol Quântico e apagando todas as luzes do continente! No espaço profundo, a sombra colossal da Entidade perde o rastro do feromônio e passa direto pela órbita terrestre, desaparecendo na escuridão do cosmos. Vocês venceram a campanha <strong>O Sinal do Fim do Mundo</strong>!\",\"outcome_desc_zombie\":\"O raio púrpura rasga o céu noturno! As nuvens se abrem e a Entidade Cósmica pousa sobre o horizonte, trazendo consigo mundos inteiros e carne divina inesgotável. A Fome dos Marvel Zombies finalmente encontrou um banquete digno da eternidade! Vocês venceram a campanha <strong>O Sinal do Fim do Mundo</strong>!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('753cf833-872b-4374-af4e-119a20458bbc', 'e1b566b6-1e7f-4206-b079-10bad3a8a9f1', 2, 'Investigação & Teste', 'Galeria dos Conduítes Alfa & Beta', 'Tile 7R • Corredor Oeste', '', 'AVAILABLE', '[]', '', 'Cortar Conduítes (Token 2)', 'Tubos translúcidos pulsando com energia carmesim e cabos de alta voltagem.', 'As artérias principais que alimentam os capacitores da usina.', 'Romper os dois primeiros conduítes exige precisão para que o fluido cáustico não dispare as sirenes de emergência.', 'Precisamos destravar o bombeamento máximo sem romper as juntas de contenção.', '[{\"type\":\"dice\",\"title_hero\":\"Purgar Conduítes Alfa e Beta (Teste 1d6)\",\"title_zombie\":\"Pressurizar Conduítes Alfa e Beta (Teste 1d6)\",\"subtitle\":\"4-6: Purga Silenciosa | 2-3: Sirene Parcial | 1: Vazamento Tóxicos\",\"grants_flags\":[\"has_key\"],\"dice_outcomes\":{\"high\":{\"title\":\"🧪 Conduítes 1 e 2 Desativados em Silêncio!\",\"desc_hero\":\"Corte cirúrgico! Nenhum alarme disparou e o herói ganha +5 XP.\",\"desc_zombie\":\"Pressão estabilizada no máximo! O herói ganha +5 XP.\"},\"mid\":{\"title\":\"🚨 Conduítes Cortados, mas a Sirene Tocou!\",\"desc_hero\":\"O alarme ecoa no setor: compre 1 Carta de Spawn imediata! (+5 XP)\",\"desc_zombie\":\"As sirenes da S.H.I.E.L.D. disparam: compre 1 Carta de Spawn imediata! (+5 XP)\"},\"low\":{\"title\":\"☣️ Explosão de Fluido Catalisador!\",\"desc_hero\":\"O tubo estoura! O herói sofre 1 Ferimento e compra 1 Carta de Spawn, mas o conduíte é destruído.\",\"desc_zombie\":\"Recuo de pressão! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas o fluxo é liberado.\"}}}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('867cbab9-571b-49a5-a2cc-25797f7040e2', '03ad42cf-417c-400b-8f24-0556210a50e1', 1, 'Ponto de Triagem (Livre)', 'Convés de Telemetria & Carga EMP', 'Tile 2V/9V • Ala Sudoeste', '', 'AVAILABLE', '[]', '', 'Calibrar EMP (Token 1)', 'O vento uiva sob o céu violeta. Aqui está o console que calibra nossa bomba portátil de Pulso Eletromagnético (EMP).', 'Antenas secundárias onde sincronizamos nossos sinais vitais com a frequência do Devorador de Mundos.', 'O computador indica que o escudo do General Líder é sustentado por três nós de plasma espalhados pelo terraço.', 'Os sensores mostram que precisamos ativar os três nós de plasma para abrir a câmara de ignição final.', '[{\"type\":\"direct\",\"title_hero\":\"Sincronizar Bomba EMP e Localizar os 3 Pilares de Plasma\",\"title_zombie\":\"Sintonizar Frequência Cósmica nos 3 Pilares de Plasma\",\"subtitle\":\"Mapeia os nós de plasma e revela o código de anulação zero.\",\"grants_flags\":[\"has_log\"],\"outcome_title_hero\":\"📡 Bomba EMP Pronta para o Ataque Final!\",\"outcome_title_zombie\":\"🌌 Harmonia Cósmica Sintonizada!\",\"outcome_desc_hero\":\"Pista Final: Desarme os <strong>Pilares de Plasma 1 e 2 (Token 2)</strong> e o <strong>3º Pilar (Token 5)</strong> para derrubar a barreira da <em>Câmara do Farol (Token 3)</em>! O código de detonação EMP no núcleo é <strong>000</strong>!\",\"outcome_desc_zombie\":\"Pista Final: Carregue os <strong>Pilares de Plasma 1 e 2 (Token 2)</strong> e o <strong>3º Pilar (Token 5)</strong> para abrir a <em>Câmara do Farol (Token 3)</em>! O código de ignição final é <strong>000</strong>!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('8971de2b-4095-4315-a280-61bdfa42a3c5', 'e1b566b6-1e7f-4206-b079-10bad3a8a9f1', 6, 'Extração / Conclusão', 'Elevador de Fuga da Subestação', 'Zona EXIT • Saída Norte', '', 'LOCKED', '[\"has_transponder\"]', '🔒 Requisito Final: Iniciar a Sobrecarga do Reator no Token 3.', 'Fugir antes da Explosão!', 'A saída de emergência da usina, tremendo com as explosões subterrâneas.', 'Passagem para a superfície em direção ao Observatório Astronômico.', 'O complexo inteiro colapsa em chamas violetas atrás de vocês! Atrasamos a carga principal, mas os zumbis já instalaram espelhos de colimação no Antigo Observatório!', 'A usina cumpriu seu papel antes de explodir! Agora precisamos alinhar os espelhos quânticos no Observatório (Capítulo 3)!', '[{\"type\":\"direct\",\"title_hero\":\"Escapar da Usina e Ir para o Capítulo 3!\",\"title_zombie\":\"Sair da Usina e Avançar para o Capítulo 3!\",\"subtitle\":\"Todos os heróis na Zona de Saída sem inimigos.\",\"grants_flags\":[\"mission_complete\"],\"outcome_title_hero\":\"🏆 VITÓRIA NO CAPÍTULO 2: REATOR DESTRUÍDO!\",\"outcome_title_zombie\":\"🏆 VITÓRIA NO CAPÍTULO 2: BATERIA CARREGADA!\",\"outcome_desc_hero\":\"Vocês destruíram a Bateria de Sangue! Próximo destino: <strong>Capítulo 3: Os Olhos dos Vigilantes</strong>!\",\"outcome_desc_zombie\":\"A energia foi transmitida! Próximo destino: <strong>Capítulo 3: Os Olhos dos Vigilantes</strong>!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('90a15187-fd04-4850-9c6b-1be91e0547a7', 'e1b566b6-1e7f-4206-b079-10bad3a8a9f1', 3, 'Clímax / Gatekeeper', 'Câmara do Reator de Matéria Escura', 'Tile 6V • Bunker Blindado Sul', '', 'LOCKED', '[\"has_key\",\"has_power\"]', '🔒 Requisitos: Purgar Conduítes Alfa/Beta (Token 2) + Cortar 3º Conduíte (Token 5).', 'Digitar [404] & Sobrecarregar Reator', 'No centro da câmara blindada, uma esfera de matéria escura gira alimentada pela biomassa.', 'O coração da Bateria de Sangue! Pronto para enviar o pulso energético para as lentes do Observatório.', 'Com as três linhas orgânicas cortadas, o painel central aceita o código de colapso [404]. Assim que ativado, o complexo inteiro começará a desmoronar!', 'Com os três conduítes em carga máxima, digite [404] para disparar o feixe de energia para o Observatório antes que a usina exploda!', '[{\"type\":\"keypad\",\"keypad_code\":\"404\",\"title_hero\":\"Digitar Código [404] para Iniciar Colapso do Núcleo!\",\"title_zombie\":\"Digitar Código [404] para Disparar a Carga e Evacuar!\",\"subtitle\":\"Inicia a contagem regressiva de destruição da usina!\",\"grants_flags\":[\"has_transponder\"],\"outcome_title_hero\":\"☢️ COLAPSO INICIADO! CORRAM PARA A SAÍDA!\",\"outcome_title_zombie\":\"⚡ CARGA ENVIADA! REATOR EM SOBRECARGA!\",\"outcome_desc_hero\":\"O núcleo entra em fusão crítica! <strong>Regra de Pressão:</strong> Ao final de cada rodada até escapar pelo Token 6, coloque 2 Inimigos extras no ponto de Spawn mais próximo! Corram!\",\"outcome_desc_zombie\":\"O feixe de energia subiu para o Observatório! Mas o reator vai explodir: corram para a Saída (Token 6) enquanto tropas de elite tentam bloquear o caminho!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('9f01fecb-dbf2-4572-8664-af9831ee636d', 'b2263b85-dca8-4760-8027-718dc148bca3', 5, 'Interruptor de Mapa', 'Giroscópio Equatorial (3º Espelho)', 'Tile 6R • Anexo Leste', '', 'AVAILABLE', '[]', '', 'Travar Giroscópio (Token 5)', 'O contrapeso gigante que mantém a terceira lente apontada para o zênite.', 'O eixo rotacional que estabiliza a lente mestra da cúpula.', 'Soltar os pinos de travamento fará o terceiro espelho tombar sobre o próprio eixo.', 'Engatar a trava mestra fixará a abóbada na direção exata da Lua.', '[{\"type\":\"direct\",\"title_hero\":\"Soltar Pinos de Contrapeso do Giroscópio\",\"title_zombie\":\"Travar Eixo Equatorial na Posição Lunar\",\"subtitle\":\"Cumpre o requisito mecânico para abrir a Cúpula (Token 3).\",\"grants_flags\":[\"has_power\"],\"outcome_title_hero\":\"⚙️ Giroscópio Desarmado!\",\"outcome_title_zombie\":\"⚙️ Giroscópio Travado com Precisão!\",\"outcome_desc_hero\":\"A terceira lente perde a estabilidade e as comportas da <strong>Cúpula Principal (Token 3)</strong> destravam! Use o código <strong>912</strong> lá!\",\"outcome_desc_zombie\":\"O domo gira e se alinha! Agora vá até a <strong>Cúpula Principal (Token 3)</strong> e digite <strong>912</strong>!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('a510b24c-c72d-4868-a879-72c8ce76cdae', 'e1b566b6-1e7f-4206-b079-10bad3a8a9f1', 1, 'Ponto de Triagem (Livre)', 'Guarita de Controle Acústico', 'Tile 4V • Entrada Norte', '', 'AVAILABLE', '[]', '', 'Investigar Guarita (Token 1)', 'Sensores de movimento e monitores de pressão que vigiam as galerias industriais.', 'Painel de vigilância onde monitoramos a pressão sanguínea das tubulações do reator.', 'O mapa térmico mostra três linhas de alimentação orgânica bombeando energia para a câmara sul.', 'Os sensores mostram onde as travas de segurança humanas estão impedindo o fluxo máximo de biomassa.', '[{\"type\":\"direct\",\"title_hero\":\"Mapeamento Silencioso das Tubulações\",\"title_zombie\":\"Rastrear Válvulas de Pressão Orgânica\",\"subtitle\":\"Revela onde estão os conduítes e o código de purga térmica.\",\"grants_flags\":[\"has_log\"],\"outcome_title_hero\":\"🤫 Infiltração Furtiva Mapeada!\",\"outcome_title_zombie\":\"🩸 Fluxo da Bateria Localizado!\",\"outcome_desc_hero\":\"Pista obtida: Os <strong>Conduítes Alfa e Beta (Token 2)</strong> e a <strong>Válvula Mestre (Token 5)</strong> precisam ser cortados antes de acessar o <strong>Núcleo do Reator (Token 3)</strong>. Código de purga anotado no painel: <strong>404</strong>.\",\"outcome_desc_zombie\":\"Pista obtida: Ative os <strong>Conduítes Alfa e Beta (Token 2)</strong> e a <strong>Válvula Mestre (Token 5)</strong> usando o código <strong>404</strong> para liberar a carga total no <strong>Reator (Token 3)</strong>!\"}]', '2026-10-21 21:40:06', '2026-10-21 21:40:06'),
('aa324dcb-69e3-40fc-bf5f-2c61275e83d5', '1d1a19ba-75b5-4e5b-9f57-f8c164279e3e', 6, 'Extração / Conclusão', 'Rampa Blindada para a Superfície', 'Zona EXIT • Saída Norte', '', 'LOCKED', '[\"has_transponder\"]', '🔒 Requisito Final: Sabotar/Resgatar a Ogiva no Poço do Míssil (Token 3).', 'Subir para o Confronto Final!', 'A rampa de carga que leva de volta às ruas sob um céu púrpuro apocalíptico.', 'A saída da base rumo ao topo da Torre Oscorp para o grande clímax.', 'Ao sair do silo, vocês olham para cima: sombras colossais cobrem as estrelas! A Entidade Cósmica chegou à borda do sistema solar e os zumbis estão montando o transmissor final no topo da Torre Oscorp!', 'Olhem para o céu púrpuro: a sombra do Devorador de Mundos já cobre a Lua! Vamos subir ao topo da Torre Oscorp e acender o Farol nas Nuvens!', '[{\"type\":\"direct\",\"title_hero\":\"Avançar para o Capítulo Final: O Farol nas Nuvens!\",\"title_zombie\":\"Marchar para o Capítulo Final: O Banquete Cósmico!\",\"subtitle\":\"Todos os heróis na Zona de Saída sem inimigos.\",\"grants_flags\":[\"mission_complete\"],\"outcome_title_hero\":\"🏆 VITÓRIA NO CAPÍTULO 4: SILO NEUTRALIZADO!\",\"outcome_title_zombie\":\"🏆 VITÓRIA NO CAPÍTULO 4: NÚCLEO PRONTO!\",\"outcome_desc_hero\":\"Tudo se decide agora! Preparem-se para o <strong>Capítulo 5: O Clímax – O Farol nas Nuvens</strong>!\",\"outcome_desc_zombie\":\"A eternidade nos aguarda! Preparem-se para o <strong>Capítulo 5: O Clímax – O Farol nas Nuvens</strong>!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('adcc41ce-f42c-4abb-a35a-566afbe8a5cc', 'e1b566b6-1e7f-4206-b079-10bad3a8a9f1', 4, 'Armadilha de Ganância', 'Tanque de Estase Experimental', 'Tile 2V • Laboratório Leste', '', 'AVAILABLE', '[]', '', 'Examinar Tanque (Token 4)', 'Cilindros de vidro contendo soros regenerativos e sombras que se mexem no líquido.', 'Cápsulas contendo cobaias e mutagênicos concentrados de alto valor nutritivo.', 'Você pode drenar o tanque para obter o Soro de Regeneração, mas a cobaia presa lá dentro pode despertar.', 'Quebrar o vidro garante um banquete imediato, mas pode liberar gás criogênico.', '[{\"type\":\"dice\",\"title_hero\":\"Drenar Cápsula de Estase (Risco 1d6)\",\"title_zombie\":\"Devorar Cobaia da Cápsula (Risco 1d6)\",\"subtitle\":\"4-6: Cura Total + Traço | 1-3: Criatura liberta e 1 Ferimento!\",\"grants_flags\":[],\"dice_outcomes\":{\"high\":{\"title\":\"🧬 Soro Puro Extraído!\",\"desc_hero\":\"O herói recupera toda a Vida perdida e compra 1 Carta de Traço grátis!\",\"desc_zombie\":\"Banquete genético! Zere sua Fome, recupere 1 de Vida e ganhe +5 XP!\"},\"mid\":{\"title\":\"❄️ Vazamento Criogênico!\",\"desc_hero\":\"O vidro trinca: sofra 1 Ferimento, mas ganhe +5 XP.\",\"desc_zombie\":\"Vapor congelante: sofra 1 Ferimento, mas zere sua Fome!\"},\"low\":{\"title\":\"👹 A COBAIA DESPERTOU!\",\"desc_hero\":\"O cilindro explode! Sofra 1 Ferimento e compre 1 Carta de Spawn imediata!\",\"desc_zombie\":\"Um Guarda de Elite em armadura pesada sai da câmara! Coloque 2 Guards na sua zona!\"}}}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('b1e6da02-77dd-4eb8-af39-39c283d8130f', '03ad42cf-417c-400b-8f24-0556210a50e1', 5, 'Interruptor de Mapa', 'Terceiro Nó de Plasma & Escudo Defletor', 'Tile 3V/8R • Ala Leste da Oscorp', '', 'AVAILABLE', '[]', '', 'Desativar 3º Pilar (Token 5)', 'O último emissor de plasma que mantém a cúpula do General impenetrável.', 'O último condutor energético necessário para completar a tríade estelar.', 'Arrancar os cabos mestres deste pilar apagará o escudo defletor do coração do farol.', 'Conectar os cabos finais liberará o acesso ao trono de transmissão.', '[{\"type\":\"direct\",\"title_hero\":\"Sobrecarregar e Destruir o 3º Nó de Plasma\",\"title_zombie\":\"Ativar o 3º Nó de Plasma em Potência Máxima\",\"subtitle\":\"Cumpre o requisito final para abrir a Câmara do General (Token 3).\",\"grants_flags\":[\"has_power\"],\"outcome_title_hero\":\"🔋 Escudo Defletor do General Desfeito!\",\"outcome_title_zombie\":\"🔋 Tríade de Plasma Completa!\",\"outcome_desc_hero\":\"A barreira cai! Agora invadam o <strong>Coração do Farol (Token 3)</strong> usando o código <strong>000</strong>!\",\"outcome_desc_zombie\":\"O núcleo está aberto! Entrem no <strong>Coração do Farol (Token 3)</strong> e digitem <strong>000</strong>!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('b9c7cc26-404b-4ad5-b32b-ffbfc7236a2a', '1d1a19ba-75b5-4e5b-9f57-f8c164279e3e', 1, 'Ponto de Triagem (Livre)', 'Bunker de Inteligência da Hydra', 'Tile 1R • Ala Sudeste', '', 'AVAILABLE', '[]', '', 'Acessar Bunker (Token 1)', 'Mapas táticos com o símbolo do crânio vermelho e tentáculos cobrindo as paredes de concreto.', 'Centro de comando onde os oficiais da Hydra monitoravam o poço do míssil.', 'O sistema de segurança da Hydra exige dupla autenticação (Cartões Alfa e Beta) e o desligamento do protocolo de torretas.', 'Os terminais mostram onde os dois comandantes fugiram com os cartões de disparo.', '[{\"type\":\"direct\",\"title_hero\":\"Baixar Planta do Silo e Localização dos Oficiais\",\"title_zombie\":\"Farejar Rastro dos Oficiais da Hydra\",\"subtitle\":\"Localiza os portadores dos Cartões Alfa/Beta e a Sala de Controle das Torretas.\",\"grants_flags\":[\"has_log\"],\"outcome_title_hero\":\"🗺️ Pista Obtida: Protocolo Duplo da Hydra!\",\"outcome_title_zombie\":\"🩸 Pista Obtida: Presas Localizadas!\",\"outcome_desc_hero\":\"Os registros indicam: Os oficiais com os <strong>Cartões Alfa e Beta</strong> estão encurralados nos <em>Alojamentos Centrais (Token 2)</em>. As <strong>Torretas Automáticas</strong> são desligadas na <em>Sala de Controle Leste (Token 5)</em>. O código de abertura do Poço do Míssil (Token 3) é <strong>880</strong>!\",\"outcome_desc_zombie\":\"Os oficiais com os <strong>Cartões Alfa e Beta</strong> estão nos <em>Alojamentos (Token 2)</em>. Domine a <em>Sala de Controle das Torretas (Token 5)</em> e use o código <strong>880</strong> no <em>Poço do Míssil (Token 3)</em>!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('bf5ae511-d6f0-49fb-9d35-82361f37efb3', '7b4b5595-955b-497d-8f83-15033d091032', 3, 'Clímax / Gatekeeper', 'Estação da Antena & Cristal Frequencial', 'Tile 3R • Acesso Blindado', '/zombi/img/metro_crop.png', 'LOCKED', '[\"has_key\",\"has_power\"]', '🔒 Requisitos: Código de Modulação 739 (Token 2) + Transformador da Rua (Token 5).', 'Digitar Senha (739) & Invadir Antena', 'A escadaria blindada leva ao núcleo da antena de micro-ondas modificada com cabos alienígenas.', 'O coração do emissor local. Precisamos destrancar a comporta com o código 739 e derrotar o comandante inimigo!', 'A porta de contenção aceita o código 739! Lá dentro, um Herói Zumbi de Elite está conectado aos cabos de alta tensão sintonizando o Cristal Frequencial no próprio peito!', 'A comporta se abre após digitar 739! Um Super-Herói Vivo da resistência lidera um esquadrão tentando destruir nosso Cristal Frequencial!', '[{\"type\":\"keypad\",\"keypad_code\":\"739\",\"title_hero\":\"Digitar Código [739] no Painel e Confrontar o Sintonizador\",\"title_zombie\":\"Digitar Código [739] e Defender o Cristal Frequencial\",\"subtitle\":\"Abre a câmara principal, libera o Cristal e aciona o confronto de Chefe!\",\"grants_flags\":[\"has_transponder\"],\"outcome_title_hero\":\"⚡ BOSS ACIONADO: O Sintonizador da Antena!\",\"outcome_title_zombie\":\"🛡️ CONTRA-ATAQUE: Comandante da Resistência!\",\"outcome_desc_hero\":\"Você arranca o <strong>Cristal Frequencial</strong> e obtém o registro das outras <strong>3 Coordenadas do Sinal</strong>! Mas o impacto desperta a fúria do guardião: <strong>Coloque 1 Super-Herói Zumbi (Boss)</strong> nesta zona! Agora corram para a Saída (Token 6)!\",\"outcome_desc_zombie\":\"O <strong>Cristal Frequencial</strong> está sintonizado e as <strong>3 Coordenadas</strong> foram gravadas! Mas um <strong>Super-Herói Vivo + 2 Guards</strong> invadem a entrada para tentar impedi-los! Levem o cristal até a Saída (Token 6)!\"}]', '2026-10-21 21:40:06', '2026-10-21 21:40:06'),
('cf590b17-3a6d-4f98-a6c9-4b410dbd6bc0', '7b4b5595-955b-497d-8f83-15033d091032', 5, 'Interruptor de Mapa', 'Transformador de Alta Tensão', 'Tile 5R • Esquina Leste', '', 'AVAILABLE', '[]', '', 'Operar Transformador (Token 5)', 'Uma caixa de força industrial que alimenta os escudos da torre de micro-ondas.', 'O gerador de rua que canaliza megawatts para o nosso emissor suborbital.', 'Arcos voltaicos azuis saltam das bobinas. Cortar a alimentação aqui desativará a blindagem magnética da antena principal.', 'Redirecionar a carga máxima da rua destravará as comportas magnéticas da estação da antena.', '[{\"type\":\"direct\",\"title_hero\":\"Destruir o Transformador para apagar o Escudo da Antena\",\"title_zombie\":\"Sobrecarregar o Transformador para Energizar a Antena\",\"subtitle\":\"Cumpre o requisito de energia do Token 3 e altera o estado do mapa.\",\"grants_flags\":[\"has_power\"],\"outcome_title_hero\":\"⚡ Transformador Cortado! Blindagem Desativada!\",\"outcome_title_zombie\":\"⚡ Força Máxima Redirecionada!\",\"outcome_desc_hero\":\"Um clarão ilumina a rua quando as bobinas explodem! O escudo magnético da <strong>Estação da Antena (Token 3)</strong> caiu. Se já tiver o código do Token 2, avance para o Token 3!\",\"outcome_desc_zombie\":\"Os cabos rugem com energia púrpura! A trava elétrica da <strong>Estação da Antena (Token 3)</strong> está energizada e pronta para o código!\"}]', '2026-10-21 21:40:06', '2026-10-21 21:40:06'),
('e85e6218-9235-4785-a57e-616c84566c11', 'b2263b85-dca8-4760-8027-718dc148bca3', 2, 'Investigação & Teste', 'Biblioteca & Controle Óptico', 'Tile 5R • Ala Oeste', '', 'AVAILABLE', '[]', '', 'Sabotar Espelhos 1 e 2 (Token 2)', 'Alavancas hidráulicas que sustentam os dois primeiros espelhos de colimação.', 'Os servomotores que posicionam as duas primeiras lentes quânticas.', 'Desalinhar manualmente os dois espelhos exige força e precisão enquanto a estrutura vibra com energia cósmica.', 'Travar os dois espelhos na posição lunar exige sincronia perfeita dos motores.', '[{\"type\":\"dice\",\"title_hero\":\"Quebrar Engrenagens dos Espelhos 1 e 2 (Teste 1d6)\",\"title_zombie\":\"Alinhar Lentes Quânticas 1 e 2 (Teste 1d6)\",\"subtitle\":\"4-6: Sucesso Pleno | 2-3: Sucesso com Barulho | 1: Estilhaços de Cristal\",\"grants_flags\":[\"has_key\"],\"dice_outcomes\":{\"high\":{\"title\":\"🪞 Espelhos 1 e 2 Desalinhados com Sucesso!\",\"desc_hero\":\"O feixe violeta perde metade do foco! O herói ganha +5 XP e confirma a senha da cúpula: <strong>912</strong>.\",\"desc_zombie\":\"Duas lentes brilham em sintonia perfeita com a Lua! Ganhe +5 XP e senha confirmada: <strong>912</strong>.\"},\"mid\":{\"title\":\"🔔 Estrondo Metálico na Cúpula!\",\"desc_hero\":\"Os espelhos quebram com um estrondo: compre 1 Carta de Spawn imediata! (+5 XP, Senha: <strong>912</strong>)\",\"desc_zombie\":\"O barulho das engrenagens atrai patrulhas: compre 1 Carta de Spawn! (+5 XP, Senha: <strong>912</strong>)\"},\"low\":{\"title\":\"⚡ Reflexo de Feixe Quântico!\",\"desc_hero\":\"Um raio de luz queima a sala! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas os espelhos cedem (Senha: <strong>912</strong>).\",\"desc_zombie\":\"Descarga óptica! Sofra 1 Ferimento e compre 1 Carta de Spawn, mas as lentes travam no lugar (Senha: <strong>912</strong>).\"}}}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07'),
('f863f61b-19b7-47fd-b108-4b8168e418e2', 'b2263b85-dca8-4760-8027-718dc148bca3', 4, 'Armadilha de Ganância', 'Cofre de Relíquias do Santuário', 'Tile 1V • Câmara Lateral', '', 'AVAILABLE', '[]', '', 'Abrir Relrelicário (Token 4)', 'Um mostruário místico rachado contendo artefatos de proteção arcana.', 'Relíquias pulsando com energia dimensional que podem amplificar nossos poderes.', 'Quebrar o selo protetor pode conceder uma bênção arcana ou desencadear uma maldição defensiva.', 'Absorver a energia da relíquia pode fortalecer a horda ou queimar sua carne morta.', '[{\"type\":\"dice\",\"title_hero\":\"Quebrar Selo do Relicário (Risco 1d6)\",\"title_zombie\":\"Absorver Artefato Arcano (Risco 1d6)\",\"subtitle\":\"4-6: +2 Cartas de Traço e +5 XP | 1-3: Descarga Mística!\",\"grants_flags\":[],\"dice_outcomes\":{\"high\":{\"title\":\"✨ Bênção do Observador!\",\"desc_hero\":\"Energia pura! Compre 2 Cartas de Traço e ganhe +5 XP!\",\"desc_zombie\":\"Poder cósmico! Compre 2 Cartas de Traço Zumbi, zere a Fome e ganhe +5 XP!\"},\"mid\":{\"title\":\"🌀 Instabilidade Dimensional!\",\"desc_hero\":\"Você ganha 1 Carta de Traço, mas sofre 1 Ferimento.\",\"desc_zombie\":\"Você ganha 1 Carta de Traço Zumbi, mas aumenta a Fome em +1.\"},\"low\":{\"title\":\"⚡ Maldição de Contenção!\",\"desc_hero\":\"Armadilha arcana! Sofra 1 Ferimento e compre 1 Carta de Spawn!\",\"desc_zombie\":\"Chamas místicas! Sofra 1 Ferimento e compre 1 Carta de Spawn!\"}}}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07');
INSERT INTO `family_zombi_tokens` (`id`, `mission_id`, `token_number`, `token_role`, `title`, `tile_location`, `crop_image_url`, `initial_status`, `requires_flags`, `lock_banner_text`, `unlock_action_label`, `room_desc_hero`, `room_desc_zombie`, `modal_lore_hero`, `modal_lore_zombie`, `actions_json`, `created_at`, `updated_at`) VALUES
('f8ca3cc6-680f-4b91-b9bf-25df1d6e0154', 'e1b566b6-1e7f-4206-b079-10bad3a8a9f1', 5, 'Interruptor de Mapa', 'Terceiro Conduíte & Válvula Mestre', 'Tile 5V • Sala das Turbinas', '', 'AVAILABLE', '[]', '', 'Manobrar Válvula (Token 5)', 'A última linha de alimentação orgânica que sustenta o escudo térmico do reator.', 'A turbina secundária que completa a pressão necessária para o disparo.', 'Uma roda de ferro pesada controla a válvula mestre. Girá-la cortará a última artéria da Bateria de Sangue.', 'Travar a válvula no limite máximo liberará o acesso ao painel central do reator.', '[{\"type\":\"direct\",\"title_hero\":\"Fechar Válvula Mestre e Cortar 3º Conduíte\",\"title_zombie\":\"Abrir Válvula Mestre em Capacidade Total\",\"subtitle\":\"Libera o requisito de força para acessar o Reator (Token 3).\",\"grants_flags\":[\"has_power\"],\"outcome_title_hero\":\"🔧 Terceira Linha Orgânica Cortada!\",\"outcome_title_zombie\":\"🔧 Pressão Máxima Atingida!\",\"outcome_desc_hero\":\"As turbinas desaceleram e as trancas da <strong>Câmara do Reator (Token 3)</strong> se abrem! Use o código <strong>404</strong> no Token 3!\",\"outcome_desc_zombie\":\"A câmara principal (Token 3) está pronta! Digite <strong>404</strong> no Token 3 para concluir a carga!\"}]', '2026-10-21 21:40:07', '2026-10-21 21:40:07');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tasks`
--

CREATE TABLE `tasks` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `family_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `assigned_to` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `xp_reward` int(11) NOT NULL DEFAULT 50,
  `gold_reward` int(11) NOT NULL DEFAULT 10,
  `category` enum('DOMESTIC','STUDY','HEALTH','CREATIVE','SOCIAL','GERAL') DEFAULT 'GERAL',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `difficulty` enum('EASY','MEDIUM','HARD') NOT NULL DEFAULT 'MEDIUM',
  `energy_reward` int(11) NOT NULL DEFAULT 2,
  `token_reward` int(11) NOT NULL DEFAULT 0,
  `allowed_profile` enum('ALL','CHILD_ONLY','ADULT_ONLY') NOT NULL DEFAULT 'ALL',
  `requires_proof` tinyint(1) NOT NULL DEFAULT 1,
  `estimated_time` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tasks`
--

INSERT INTO `tasks` (`id`, `family_id`, `created_by`, `assigned_to`, `title`, `description`, `xp_reward`, `gold_reward`, `category`, `is_active`, `created_at`, `updated_at`, `difficulty`, `energy_reward`, `token_reward`, `allowed_profile`, `requires_proof`, `estimated_time`) VALUES
('01cbad0e-55cb-44e3-adc8-1657a2e252da', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Ajudar a Guardar as Compras', 'Retirar itens das sacolas e organizar mantimentos na despensa e geladeira.', 40, 25, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('030c3f10-e523-4e80-88d7-fa6cb7253f1d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Guardar as Roupas Dobradas', 'Organizar as peças limpas nas gavetas e pendurar itens em cabides.', 35, 20, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('03233d71-39f1-425b-9ba9-edaa5c6eb131', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Limpeza Geral do Quarto', 'Varrer, passar pano no chão, organizar guarda-roupa, trocar roupa de cama e tirar o lixo.', 100, 70, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('036759c1-4662-4562-946f-6009ec77e9d9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Estender e Recolher Varal Completo', 'Tirar roupas da máquina, estender no varal e dobrar todas quando secarem.', 80, 50, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('03d9d38e-5abf-4eb0-8065-eed6cc81416f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Beber Água ao Longo do Dia', 'Consumir pelo menos 1,5 litro de água durante o dia.', 15, 8, 'HEALTH', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, 'Dia inteiro'),
('0637e324-3c24-4656-9414-684a50110dea', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Lavar o Quintal ou Garagem', 'Varrer folhas secas, jogar água e esfregar o piso com vassoura pesada.', 120, 85, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('06a01757-d91c-440a-a32f-a74679d8322d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Lavar a Louça Leve', 'Lavar copos, pratos e talheres (sem facas afiadas) e organizar no escorredor.', 40, 25, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('085efaa0-86dc-467c-afb6-119d70d5bfa1', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Dar uma Caminhada', 'Caminhar pelo bairro por pelo menos 20 minutos.', 40, 25, 'HEALTH', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('0909b76a-37dd-4dfa-b5ef-a3a60fec8171', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Concluir um Projeto Escolar', 'Finalizar uma etapa importante de um trabalho escolar ou apresentação.', 130, 90, 'STUDY', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'CHILD_ONLY', 1, '60+ min'),
('09fd2e62-c317-4266-a822-6ee56acd1e8c', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Concluir um Projeto Criativo', 'Finalizar um projeto de arte, design, música ou escrita do início ao fim.', 120, 80, 'CREATIVE', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'ALL', 1, '60+ min'),
('0b3cda84-f3ce-44aa-9085-6686ecbf33bd', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Dormir no Horário Combinado', 'Estar na cama com as luzes apagadas no horário combinado pela família.', 20, 10, 'HEALTH', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'CHILD_ONLY', 1, '—'),
('0d76bc2f-f7e6-4988-b699-ad3fd32ca5fa', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Participar de um Momento em Família', 'Jogar um jogo de tabuleiro, assistir a um filme ou fazer uma atividade juntos.', 50, 30, 'SOCIAL', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '30-60 min'),
('0f20ef9b-e233-4273-bfff-e9760cfeb41e', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Praticar um Esporte ou Atividade Física', '30 minutos de qualquer atividade física: jogar bola, andar de bike, dançar, academia.', 60, 35, 'HEALTH', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('12728180-132e-422a-a9a4-d8b9a7afd467', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Concluir um Projeto Criativo', 'Finalizar um projeto de arte, design, música ou escrita do início ao fim.', 120, 80, 'CREATIVE', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'ALL', 1, '60+ min'),
('134eccbd-4d0f-4191-bfa1-1f9c75ae3a36', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Colocar/Tirar o Prato da Mesa', 'Levar prato, copos e talheres usados para a pia após a refeição.', 15, 5, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('13626de8-cb6f-45aa-a2a8-7b5f089c2969', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Tirar o Lixo da Casa', 'Amarrar os sacos de lixo (banheiro/cozinha) e colocar na lixeira principal.', 30, 15, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '10-15 min'),
('13de62a7-c90a-4556-88c9-51411f84e8a0', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Abastecer Água e Ração do Pet', 'Lavar e encher os potinhos de comida e água do animal de estimação.', 15, 10, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('1716a2a9-de9d-48e9-8da1-d687b6fab501', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Arrumar a Própria Cama', 'Esticar o lençol, ajeitar o cobertor e posicionar os travesseiros corretamente.', 10, 5, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('171e676f-6ede-482f-8d68-3dcad57afd95', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Fazer um Projeto Manual', 'Montar, construir ou criar algo com materiais artísticos (Lego, argila, recorte, colagem).', 50, 30, 'CREATIVE', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('176ef916-3f41-434f-959b-bd1c228c7d71', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Estudar para uma Prova', 'Sessão de estudo de pelo menos 45 minutos focada em uma prova ou avaliação.', 120, 80, 'STUDY', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'CHILD_ONLY', 1, '45-60 min'),
('1815b39d-46d3-4399-9544-a1be961b4bc5', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Estudar uma Matéria', 'Focar em uma disciplina escolar por pelo menos 30 minutos usando o Foco do Herói.', 70, 40, 'STUDY', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30 min'),
('183595c7-51b4-422b-8b54-a69dfe76ffb7', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Escovar os Dentes (3x ao dia)', 'Escovar os dentes após o café, almoço e jantar.', 10, 5, 'HEALTH', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('184ac53b-b487-40c0-bb8f-e8d7385fdb0f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Ajudar a Guardar as Compras', 'Retirar itens das sacolas e organizar mantimentos na despensa e geladeira.', 40, 25, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('1a856164-f059-4894-a09c-11cdde6a5951', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Estudar para uma Prova', 'Sessão de estudo de pelo menos 45 minutos focada em uma prova ou avaliação.', 120, 80, 'STUDY', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'CHILD_ONLY', 1, '45-60 min'),
('1b1f1fb5-13ca-47ea-91e0-9b8fc221ec96', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Escovar os Dentes (3x ao dia)', 'Escovar os dentes após o café, almoço e jantar.', 10, 5, 'HEALTH', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('1bcdd8d3-109c-4449-8dfe-4fc0ca6b037d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Dar uma Caminhada', 'Caminhar pelo bairro por pelo menos 20 minutos.', 40, 25, 'HEALTH', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('1bf2313a-6f0f-4cde-a92a-5c6bae72d781', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Abastecer Água e Ração do Pet', 'Lavar e encher os potinhos de comida e água do animal de estimação.', 15, 10, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('1c3feabd-5c5e-41b8-837c-197cc7faf937', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Lavar a Louça Leve', 'Lavar copos, pratos e talheres (sem facas afiadas) e organizar no escorredor.', 40, 25, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('1faaee50-d9c2-43f6-a62b-b434edd3a965', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Aprender Algo Novo', 'Assistir a um vídeo educativo, tutorial ou curso por pelo menos 30 minutos.', 50, 30, 'STUDY', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('1ff14e00-d3c9-4c96-9a21-a11a83193a82', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Varrer um Cômodo', 'Passar a vassoura no quarto ou na sala e recolher a sujeira com a pá.', 35, 20, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('1fff2a08-f46d-415d-b994-7fd1c01b360b', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Higienização do Banheiro', 'Limpar pia, espelho, recolher o lixo e higienizar o vaso sanitário.', 120, 80, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('20038d1d-98d8-47f7-a4c8-d4eaba9f361a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Estudar para uma Prova', 'Sessão de estudo de pelo menos 45 minutos focada em uma prova ou avaliação.', 120, 80, 'STUDY', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'CHILD_ONLY', 1, '45-60 min'),
('217d064c-fc3b-43d0-b0d4-ec7b23c54017', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Lavar a Louça Leve', 'Lavar copos, pratos e talheres (sem facas afiadas) e organizar no escorredor.', 40, 25, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('22599944-6af0-4b3a-9fed-39b36ed49797', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Passear com o Cachorro', 'Dar uma volta no quarteirão com o pet, recolhendo os dejetos adequadamente.', 45, 30, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('226abfd2-d886-4e6a-8752-06910fa51767', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Lavar a Louça Leve', 'Lavar copos, pratos e talheres (sem facas afiadas) e organizar no escorredor.', 40, 25, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('22fa59a9-b698-45a8-960a-7a8bc8b6725b', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Regar as Plantas da Casa', 'Colocar a quantidade certa de água nos vasos da sala ou varanda.', 15, 5, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('2408e399-ba42-460d-b9b7-945e311520e5', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Desenhar ou Colorir', 'Criar um desenho ou colorir uma ilustração por pelo menos 20 minutos.', 40, 25, 'CREATIVE', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('25e755a8-641f-432c-a29e-4123d3bad241', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Abastecer Água e Ração do Pet', 'Lavar e encher os potinhos de comida e água do animal de estimação.', 15, 10, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('264f6a91-126f-44df-a052-c9649a792670', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Recolher os Brinquedos', 'Guardar brinquedos e jogos espalhados na caixa ou estante organizada.', 10, 5, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('266e8ebf-a79c-4801-aa82-fed53a039fa4', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Pedir Desculpa Quando Errar', 'Reconhecer um erro e pedir desculpa sincera à pessoa afetada.', 20, 10, 'SOCIAL', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, '—'),
('272e342e-a7a4-4aa3-a62d-46dd63e23697', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Higienização do Banheiro', 'Limpar pia, espelho, recolher o lixo e higienizar o vaso sanitário.', 120, 80, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('28170417-0405-41fa-a5e1-fd728c1a7ee5', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Ler por 20 Minutos', 'Ler qualquer livro, revista ou artigo educativo por pelo menos 20 minutos seguidos.', 30, 15, 'STUDY', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, '20 min'),
('28fdafbe-ff72-4bef-906d-b784c0e22d66', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Arrumar a Mochila da Escola', 'Conferir os cadernos do dia seguinte, estojo e garrafinha de água.', 15, 5, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'CHILD_ONLY', 1, '5-10 min'),
('299385b6-bf19-4805-b7fb-f7d064ab4a48', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Ler por 20 Minutos', 'Ler qualquer livro, revista ou artigo educativo por pelo menos 20 minutos seguidos.', 30, 15, 'STUDY', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, '20 min'),
('29bdc883-20b9-40b7-b854-6f97ca444e11', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Roupa Suja no Cesto', 'Colocar as roupas do dia no cesto apropriado, sem deixar nenhuma peça no chão.', 10, 5, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('2a537eb1-8e1a-4fd4-9948-4741f6b26e03', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Desenhar ou Colorir', 'Criar um desenho ou colorir uma ilustração por pelo menos 20 minutos.', 40, 25, 'CREATIVE', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('2aeddce4-f068-4e00-b7b7-bc67e5459a5c', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Praticar um Esporte ou Atividade Física', '30 minutos de qualquer atividade física: jogar bola, andar de bike, dançar, academia.', 60, 35, 'HEALTH', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('2b05a155-74cb-46c4-ae3e-d96331221386', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Passar Pano no Chão da Casa', 'Utilizar balde e rodo/mop em todas as áreas comuns (sala, cozinha e corredores).', 100, 70, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'ALL', 1, '40-60 min'),
('2db7dd38-8db2-4fc6-8928-b04b753d4d78', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Concluir um Projeto Escolar', 'Finalizar uma etapa importante de um trabalho escolar ou apresentação.', 130, 90, 'STUDY', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'CHILD_ONLY', 1, '60+ min'),
('2e530268-2df6-44e9-bb1c-2ad11efd2f01', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Estudar para uma Prova', 'Sessão de estudo de pelo menos 45 minutos focada em uma prova ou avaliação.', 120, 80, 'STUDY', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'CHILD_ONLY', 1, '45-60 min'),
('3103345a-ec19-460c-84b9-076728ec475f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Lavar a Louça Leve', 'Lavar copos, pratos e talheres (sem facas afiadas) e organizar no escorredor.', 40, 25, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('324b218f-919f-470a-a14e-a5fe8c54e1e6', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Limpar a Poeira dos Móveis', 'Passar pano seco ou espanador nas mesas, estantes e bancadas de toda a casa.', 30, 15, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('32a54d3e-5669-4c99-a508-1f952c7292b5', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Pedir Desculpa Quando Errar', 'Reconhecer um erro e pedir desculpa sincera à pessoa afetada.', 20, 10, 'SOCIAL', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, '—'),
('33348898-dbd7-4794-aa1c-4eb2f0ae4758', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Passar Pano no Chão da Casa', 'Utilizar balde e rodo/mop em todas as áreas comuns (sala, cozinha e corredores).', 100, 70, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'ALL', 1, '40-60 min'),
('3505af25-2fc6-49b1-a569-52cd6a718b4b', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Arrumar a Própria Cama', 'Esticar o lençol, ajeitar o cobertor e posicionar os travesseiros corretamente.', 10, 5, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('3615b82f-a1e0-408c-9a55-653eaec05023', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Passear com o Cachorro', 'Dar uma volta no quarteirão com o pet, recolhendo os dejetos adequadamente.', 45, 30, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('36f95640-d65f-4d61-91b7-28fb05723762', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Comer Verdura ou Fruta na Refeição', 'Incluir legume, verdura ou fruta em pelo menos uma refeição do dia.', 30, 20, 'HEALTH', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '—'),
('37d640a3-509d-458e-aa48-1482fa5b3e9f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Passar Pano no Chão da Casa', 'Utilizar balde e rodo/mop em todas as áreas comuns (sala, cozinha e corredores).', 100, 70, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'ALL', 1, '40-60 min'),
('3857d043-4358-4b50-9be3-0d9d93b89639', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Lavar a Louça Completa', 'Lavar, secar e guardar todas as panelas, travessas e pratos da refeição familiar.', 90, 60, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('38d177c8-e869-429a-adbe-18600757b132', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Preparar uma Refeição Familiar', 'Cozinhar um prato completo para a família (ex: omelete, massa, salada, lanche).', 110, 75, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'ADULT_ONLY', 1, '40-60 min'),
('3af796a8-f665-44a5-b028-b0d616a11ec6', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Estudar para uma Prova', 'Sessão de estudo de pelo menos 45 minutos focada em uma prova ou avaliação.', 120, 80, 'STUDY', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'CHILD_ONLY', 1, '45-60 min'),
('3c426b86-6927-4327-af82-fb9f17319963', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Lavar a Louça Completa', 'Lavar, secar e guardar todas as panelas, travessas e pratos da refeição familiar.', 90, 60, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('3c585f86-843a-40f3-a943-3d64470f81fd', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Higienização do Banheiro', 'Limpar pia, espelho, recolher o lixo e higienizar o vaso sanitário.', 120, 80, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('3d58c750-e64b-4381-9368-7a5dfd7f0d05', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Ajudar um Familiar Sem Ser Pedido', 'Identificar uma necessidade de alguém da família e ajudar espontaneamente.', 25, 15, 'SOCIAL', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, 'Variável'),
('3dbc9823-1e1e-4e62-b60a-34a1f8274c74', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Dormir no Horário Combinado', 'Estar na cama com as luzes apagadas no horário combinado pela família.', 20, 10, 'HEALTH', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'CHILD_ONLY', 1, '—'),
('3e613f12-4765-4e84-b1aa-fd64c50ab88b', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Abastecer Água e Ração do Pet', 'Lavar e encher os potinhos de comida e água do animal de estimação.', 15, 10, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('3ee22697-97dc-42ed-9ce3-d5d35ca05df0', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Regar as Plantas da Casa', 'Colocar a quantidade certa de água nos vasos da sala ou varanda.', 15, 5, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('3f38b381-8940-4365-9661-8698b20100cd', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Comer Verdura ou Fruta na Refeição', 'Incluir legume, verdura ou fruta em pelo menos uma refeição do dia.', 30, 20, 'HEALTH', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '—'),
('4050daea-15c8-423e-81a1-270d3603fc8f', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Limpar a Poeira dos Móveis', 'Passar pano seco ou espanador nas mesas, estantes e bancadas de toda a casa.', 30, 15, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('41bf290c-0721-4b64-96ae-80797ce2daf4', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Aprender Algo Novo', 'Assistir a um vídeo educativo, tutorial ou curso por pelo menos 30 minutos.', 50, 30, 'STUDY', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('41d4a765-3aee-41af-967a-de3752c85836', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Fazer um Projeto Manual', 'Montar, construir ou criar algo com materiais artísticos (Lego, argila, recorte, colagem).', 50, 30, 'CREATIVE', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('41f4edaa-ed8a-483f-b66c-01a38887fb6a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Recolher os Brinquedos', 'Guardar brinquedos e jogos espalhados na caixa ou estante organizada.', 10, 5, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('435bfe08-01f6-4d62-9d66-810f3923d979', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Concluir um Projeto Criativo', 'Finalizar um projeto de arte, design, música ou escrita do início ao fim.', 120, 80, 'CREATIVE', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'ALL', 1, '60+ min'),
('44cb7a9d-a2d4-4cc5-93cf-8737055e49eb', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Varrer um Cômodo', 'Passar a vassoura no quarto ou na sala e recolher a sujeira com a pá.', 35, 20, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('455aea52-f612-4201-8fc8-65a3e5934c3a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Lavar a Louça Completa', 'Lavar, secar e guardar todas as panelas, travessas e pratos da refeição familiar.', 90, 60, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('456f25ea-c77d-4320-93a1-71c64d42b4cb', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Higienização do Banheiro', 'Limpar pia, espelho, recolher o lixo e higienizar o vaso sanitário.', 120, 80, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('484cda0c-f010-41a7-8d03-b708043d2976', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Beber Água ao Longo do Dia', 'Consumir pelo menos 1,5 litro de água durante o dia.', 15, 8, 'HEALTH', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, 'Dia inteiro'),
('49c0fa7f-b52e-4124-9ff9-df753d5bd79d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Passar Pano no Chão da Casa', 'Utilizar balde e rodo/mop em todas as áreas comuns (sala, cozinha e corredores).', 100, 70, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'ALL', 1, '40-60 min'),
('4ea99c19-65aa-4b33-98b3-1f1039d1c5d2', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Preparar uma Refeição Familiar', 'Cozinhar um prato completo para a família (ex: omelete, massa, salada, lanche).', 110, 75, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'ADULT_ONLY', 1, '40-60 min'),
('4fcb5c84-8fc6-4e39-ba1b-e8ac61a6114b', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Estudar uma Matéria', 'Focar em uma disciplina escolar por pelo menos 30 minutos usando o Foco do Herói.', 70, 40, 'STUDY', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30 min'),
('50211481-1bcb-4d97-bfbc-42e5ca416a7e', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Beber Água ao Longo do Dia', 'Consumir pelo menos 1,5 litro de água durante o dia.', 15, 8, 'HEALTH', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, 'Dia inteiro'),
('52af2e13-cc84-45c5-86ed-70abbe3cd516', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Ler por 20 Minutos', 'Ler qualquer livro, revista ou artigo educativo por pelo menos 20 minutos seguidos.', 30, 15, 'STUDY', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, '20 min'),
('5544a628-c520-473f-b1be-95d5c04d3c1e', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Pedir Desculpa Quando Errar', 'Reconhecer um erro e pedir desculpa sincera à pessoa afetada.', 20, 10, 'SOCIAL', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, '—'),
('557eff41-ecce-4127-9392-d53defc22b04', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Preparar uma Refeição Familiar', 'Cozinhar um prato completo para a família (ex: omelete, massa, salada, lanche).', 110, 75, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'ADULT_ONLY', 1, '40-60 min'),
('5720ea66-e8ab-45ee-870f-552475a1ad84', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Recolher os Brinquedos', 'Guardar brinquedos e jogos espalhados na caixa ou estante organizada.', 10, 5, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('58730a3f-37de-4abb-a39b-46fc009f4de9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Passear com o Cachorro', 'Dar uma volta no quarteirão com o pet, recolhendo os dejetos adequadamente.', 45, 30, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('5a754223-0f1f-43f7-b3e2-96d4a2308de8', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Escovar os Dentes (3x ao dia)', 'Escovar os dentes após o café, almoço e jantar.', 10, 5, 'HEALTH', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('5c5b21ff-38ac-44f8-8bf4-be225cbf711c', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Lavar o Quintal ou Garagem', 'Varrer folhas secas, jogar água e esfregar o piso com vassoura pesada.', 120, 85, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('5caf2032-3c29-43c6-a1f3-aa4ebfe0a264', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Tirar o Lixo da Casa', 'Amarrar os sacos de lixo (banheiro/cozinha) e colocar na lixeira principal.', 30, 15, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '10-15 min'),
('5d4ce86f-7038-41e9-9320-dc1c5c10dff9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Colocar/Tirar o Prato da Mesa', 'Levar prato, copos e talheres usados para a pia após a refeição.', 15, 5, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('5d7ecc8c-722e-4ace-8b16-10c4ddc7cf15', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Ligar ou Mandar Mensagem para um Parente', 'Entrar em contato com avós, tios ou primos de forma carinhosa.', 35, 20, 'SOCIAL', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '15 min'),
('5ff9d487-6441-4508-84ef-206d2e8859c3', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Estender e Recolher Varal Completo', 'Tirar roupas da máquina, estender no varal e dobrar todas quando secarem.', 80, 50, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('603de5ad-750a-40fb-b35f-88160e12ee58', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Desenhar ou Colorir', 'Criar um desenho ou colorir uma ilustração por pelo menos 20 minutos.', 40, 25, 'CREATIVE', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('617e3867-4bb1-4827-b700-75b971ec96e0', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Roupa Suja no Cesto', 'Colocar as roupas do dia no cesto apropriado, sem deixar nenhuma peça no chão.', 10, 5, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('61f5a175-08b8-4185-a135-6c0321c8afae', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Lavar o Quintal ou Garagem', 'Varrer folhas secas, jogar água e esfregar o piso com vassoura pesada.', 120, 85, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('62a92eb2-e1d6-4193-8e15-9a2fd9c53573', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Ajudar a Guardar as Compras', 'Retirar itens das sacolas e organizar mantimentos na despensa e geladeira.', 40, 25, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('63d99879-d13a-444a-b1ac-45c365770392', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Arrumar a Própria Cama', 'Esticar o lençol, ajeitar o cobertor e posicionar os travesseiros corretamente.', 10, 5, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('649a88e5-734d-42a9-9e11-638ec36fabc3', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Colocar/Tirar o Prato da Mesa', 'Levar prato, copos e talheres usados para a pia após a refeição.', 15, 5, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('65a522fd-8617-45d5-a609-54b6c7dd0f64', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Lavar o Quintal ou Garagem', 'Varrer folhas secas, jogar água e esfregar o piso com vassoura pesada.', 120, 85, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('66960fe4-2ebd-4f81-868b-5a0b734b7636', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Abastecer Água e Ração do Pet', 'Lavar e encher os potinhos de comida e água do animal de estimação.', 15, 10, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('691e34e1-80de-4754-9326-4eb975e4ec98', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Beber Água ao Longo do Dia', 'Consumir pelo menos 1,5 litro de água durante o dia.', 15, 8, 'HEALTH', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, 'Dia inteiro'),
('69ab412f-4314-45f0-9619-d55812630bac', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Pedir Desculpa Quando Errar', 'Reconhecer um erro e pedir desculpa sincera à pessoa afetada.', 20, 10, 'SOCIAL', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, '—'),
('6b7a2cc7-4805-4053-9c23-7160d11f05a9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Passar Pano no Chão da Casa', 'Utilizar balde e rodo/mop em todas as áreas comuns (sala, cozinha e corredores).', 100, 70, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'ALL', 1, '40-60 min'),
('6c4e9ae2-e95c-4ba3-ac84-a5488774a784', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Comer Verdura ou Fruta na Refeição', 'Incluir legume, verdura ou fruta em pelo menos uma refeição do dia.', 30, 20, 'HEALTH', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '—'),
('6cf45f4e-88db-4b98-aa5f-6be7b916ac9d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Ajudar um Familiar Sem Ser Pedido', 'Identificar uma necessidade de alguém da família e ajudar espontaneamente.', 25, 15, 'SOCIAL', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, 'Variável'),
('6de079c0-dd1d-4eef-907a-eb3d07b69921', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Fazer um Projeto Manual', 'Montar, construir ou criar algo com materiais artísticos (Lego, argila, recorte, colagem).', 50, 30, 'CREATIVE', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('6e1121f4-6909-48a0-9d0f-cc32a98699b9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Regar as Plantas da Casa', 'Colocar a quantidade certa de água nos vasos da sala ou varanda.', 15, 5, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('6eb5ada4-fe21-4cbb-8158-d92bdb721135', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Estender e Recolher Varal Completo', 'Tirar roupas da máquina, estender no varal e dobrar todas quando secarem.', 80, 50, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('6f2d083b-5f0e-45a3-a0e4-8dd7e19dbd23', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Dormir no Horário Combinado', 'Estar na cama com as luzes apagadas no horário combinado pela família.', 20, 10, 'HEALTH', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'CHILD_ONLY', 1, '—'),
('6fc00fd3-e618-4483-9bea-398cb5587fc9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Fazer a Lição de Casa', 'Concluir todas as tarefas escolares do dia antes do jantar.', 60, 35, 'STUDY', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30-45 min'),
('6fd30360-514e-4d59-a0b7-77f2f1417ea2', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Guardar as Roupas Dobradas', 'Organizar as peças limpas nas gavetas e pendurar itens em cabides.', 35, 20, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('702fa07e-57fe-494b-9fe5-7efd81c3b4b7', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Higienização do Banheiro', 'Limpar pia, espelho, recolher o lixo e higienizar o vaso sanitário.', 120, 80, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('73057ffd-163c-4a73-804c-cf0f558945f1', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Tirar o Lixo da Casa', 'Amarrar os sacos de lixo (banheiro/cozinha) e colocar na lixeira principal.', 30, 15, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '10-15 min'),
('732adce2-0a89-4963-9b60-9bb75dafc486', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Revisar o Caderno do Dia', 'Ler e organizar as anotações feitas em sala de aula no dia.', 20, 10, 'STUDY', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'CHILD_ONLY', 1, '15-20 min'),
('7765a3fc-6273-4376-8893-bc40390d136d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Concluir uma Peça de Artesanato', 'Finalizar uma peça artesanal completa (crochê, pintura, bijuteria, etc.).', 130, 90, 'CREATIVE', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'ADULT_ONLY', 1, '60+ min'),
('7779d376-6f3f-4327-bbf6-b4ef655243e7', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Limpeza Geral do Quarto', 'Varrer, passar pano no chão, organizar guarda-roupa, trocar roupa de cama e tirar o lixo.', 100, 70, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('7813e9ab-b1d1-48c7-8ec6-fc7ef7fa4273', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Guardar as Roupas Dobradas', 'Organizar as peças limpas nas gavetas e pendurar itens em cabides.', 35, 20, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('79efe0cc-987d-4ef4-92d8-e43afbdfcb40', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Roupa Suja no Cesto', 'Colocar as roupas do dia no cesto apropriado, sem deixar nenhuma peça no chão.', 10, 5, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('7a27e432-49a9-400b-9843-01714d4981de', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Comer Verdura ou Fruta na Refeição', 'Incluir legume, verdura ou fruta em pelo menos uma refeição do dia.', 30, 20, 'HEALTH', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '—'),
('7a584561-fde3-4cf2-adbc-db6eb3f88116', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Ajudar a Guardar as Compras', 'Retirar itens das sacolas e organizar mantimentos na despensa e geladeira.', 40, 25, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('7a799279-34c1-4b73-baef-bf5bcac2b91a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Arrumar a Própria Cama', 'Esticar o lençol, ajeitar o cobertor e posicionar os travesseiros corretamente.', 10, 5, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('7a8e082b-87d7-4743-ab9b-19bbebf12df6', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Concluir uma Peça de Artesanato', 'Finalizar uma peça artesanal completa (crochê, pintura, bijuteria, etc.).', 130, 90, 'CREATIVE', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'ADULT_ONLY', 1, '60+ min'),
('7af28a4e-79cd-4aa3-994a-4f35b57c1527', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Participar de um Momento em Família', 'Jogar um jogo de tabuleiro, assistir a um filme ou fazer uma atividade juntos.', 50, 30, 'SOCIAL', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '30-60 min'),
('7b567e7b-b8dd-4caa-98f2-40c1b9e3c15e', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Ajudar um Familiar Sem Ser Pedido', 'Identificar uma necessidade de alguém da família e ajudar espontaneamente.', 25, 15, 'SOCIAL', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, 'Variável'),
('7caf8504-2a74-4079-9135-d93590a3f8f3', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Lavar a Louça Completa', 'Lavar, secar e guardar todas as panelas, travessas e pratos da refeição familiar.', 90, 60, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('8143db9f-8f9d-44ef-8047-69e605a08760', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Guardar as Roupas Dobradas', 'Organizar as peças limpas nas gavetas e pendurar itens em cabides.', 35, 20, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('81cd104b-fdd2-4804-b042-1295d9f9e440', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Limpar a Poeira dos Móveis', 'Passar pano seco ou espanador nas mesas, estantes e bancadas de toda a casa.', 30, 15, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('836634c6-624b-4257-8e43-c94a943f5c73', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Ligar ou Mandar Mensagem para um Parente', 'Entrar em contato com avós, tios ou primos de forma carinhosa.', 35, 20, 'SOCIAL', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '15 min'),
('849a353a-b97e-417b-91c3-38f22c41ac15', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Concluir um Projeto Escolar', 'Finalizar uma etapa importante de um trabalho escolar ou apresentação.', 130, 90, 'STUDY', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'CHILD_ONLY', 1, '60+ min'),
('869b0f53-003a-4310-ad53-5db2d7f990b1', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Ligar ou Mandar Mensagem para um Parente', 'Entrar em contato com avós, tios ou primos de forma carinhosa.', 35, 20, 'SOCIAL', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '15 min'),
('88a5396b-1e17-416b-b6c5-5a9faf33fb8a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Concluir um Projeto Criativo', 'Finalizar um projeto de arte, design, música ou escrita do início ao fim.', 120, 80, 'CREATIVE', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'ALL', 1, '60+ min'),
('88d503a3-36d6-4e98-8bfb-a11d91e9d8bf', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Ler por 20 Minutos', 'Ler qualquer livro, revista ou artigo educativo por pelo menos 20 minutos seguidos.', 30, 15, 'STUDY', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, '20 min'),
('88e135cc-b944-4750-8eb7-de10c2f21fce', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Participar de um Momento em Família', 'Jogar um jogo de tabuleiro, assistir a um filme ou fazer uma atividade juntos.', 50, 30, 'SOCIAL', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '30-60 min'),
('88f34485-7999-44c6-98a8-a9d8bae7a418', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Colocar/Tirar o Prato da Mesa', 'Levar prato, copos e talheres usados para a pia após a refeição.', 15, 5, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('8bafaacd-c2d4-412a-a3f5-a14ef224da20', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Estudar uma Matéria', 'Focar em uma disciplina escolar por pelo menos 30 minutos usando o Foco do Herói.', 70, 40, 'STUDY', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30 min'),
('8c60ca01-75e0-49bc-9eac-f8a8e1d6838a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Estender e Recolher Varal Completo', 'Tirar roupas da máquina, estender no varal e dobrar todas quando secarem.', 80, 50, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('8dc08435-0af1-4626-a39e-661142d06ab2', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Beber Água ao Longo do Dia', 'Consumir pelo menos 1,5 litro de água durante o dia.', 15, 8, 'HEALTH', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, 'Dia inteiro'),
('8f71cbb4-a742-4236-b90b-e2f2c9b5def0', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Pedir Desculpa Quando Errar', 'Reconhecer um erro e pedir desculpa sincera à pessoa afetada.', 20, 10, 'SOCIAL', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, '—'),
('9213bd44-cc49-41e3-bcad-59e18e9cb27f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Arrumar a Mochila da Escola', 'Conferir os cadernos do dia seguinte, estojo e garrafinha de água.', 15, 5, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'CHILD_ONLY', 1, '5-10 min'),
('926b8dfd-5bbc-4482-90e8-3a7698fc3553', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Ajudar um Familiar Sem Ser Pedido', 'Identificar uma necessidade de alguém da família e ajudar espontaneamente.', 25, 15, 'SOCIAL', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, 'Variável'),
('982cc13a-01e2-463a-ac69-d3e0903c4c72', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Escovar os Dentes (3x ao dia)', 'Escovar os dentes após o café, almoço e jantar.', 10, 5, 'HEALTH', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('9b96601e-9770-4090-82e2-19e47c222b94', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Arrumar a Mochila da Escola', 'Conferir os cadernos do dia seguinte, estojo e garrafinha de água.', 15, 5, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'CHILD_ONLY', 1, '5-10 min'),
('9d786732-39a0-4e14-895a-45063f94607e', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Concluir um Projeto Criativo', 'Finalizar um projeto de arte, design, música ou escrita do início ao fim.', 120, 80, 'CREATIVE', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'ALL', 1, '60+ min'),
('9ef29284-f4b6-4014-8677-a5fc3de1c5dc', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Ajudar a Guardar as Compras', 'Retirar itens das sacolas e organizar mantimentos na despensa e geladeira.', 40, 25, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('9f05041c-aa35-454d-a6f8-70a19294b36f', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Lavar a Louça Leve', 'Lavar copos, pratos e talheres (sem facas afiadas) e organizar no escorredor.', 40, 25, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('a31e3c70-3ae4-4b74-9e5f-096f72cb8817', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Beber Água ao Longo do Dia', 'Consumir pelo menos 1,5 litro de água durante o dia.', 15, 8, 'HEALTH', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, 'Dia inteiro'),
('a32d4896-b439-49d3-83bf-1a90651cee5f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Dormir no Horário Combinado', 'Estar na cama com as luzes apagadas no horário combinado pela família.', 20, 10, 'HEALTH', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'CHILD_ONLY', 1, '—');
INSERT INTO `tasks` (`id`, `family_id`, `created_by`, `assigned_to`, `title`, `description`, `xp_reward`, `gold_reward`, `category`, `is_active`, `created_at`, `updated_at`, `difficulty`, `energy_reward`, `token_reward`, `allowed_profile`, `requires_proof`, `estimated_time`) VALUES
('a42cd322-1738-4c30-969c-7c1cc4bdc14c', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Varrer um Cômodo', 'Passar a vassoura no quarto ou na sala e recolher a sujeira com a pá.', 35, 20, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('a468bd19-c7c3-4a6d-86e5-bb9bb7e82a8d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Fazer um Projeto Manual', 'Montar, construir ou criar algo com materiais artísticos (Lego, argila, recorte, colagem).', 50, 30, 'CREATIVE', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('a58d375a-0bbf-4639-8b55-cb9b5bd25ebf', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Estudar uma Matéria', 'Focar em uma disciplina escolar por pelo menos 30 minutos usando o Foco do Herói.', 70, 40, 'STUDY', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30 min'),
('a5bbc17a-e940-41a0-be3e-d2b6ecbd2991', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Arrumar a Própria Cama', 'Esticar o lençol, ajeitar o cobertor e posicionar os travesseiros corretamente.', 10, 5, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('a6837071-0825-4c7d-ae33-72ed746645a6', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Lavar a Louça Completa', 'Lavar, secar e guardar todas as panelas, travessas e pratos da refeição familiar.', 90, 60, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('a6fa625e-9158-46a3-b7e9-382c9b301859', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Fazer um Projeto Manual', 'Montar, construir ou criar algo com materiais artísticos (Lego, argila, recorte, colagem).', 50, 30, 'CREATIVE', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('a8592fba-a8f3-45b5-bd08-9953946a560a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Pedir Desculpa Quando Errar', 'Reconhecer um erro e pedir desculpa sincera à pessoa afetada.', 20, 10, 'SOCIAL', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, '—'),
('aac443f9-6056-419c-b452-42ded9ce9adf', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Preparar uma Refeição Familiar', 'Cozinhar um prato completo para a família (ex: omelete, massa, salada, lanche).', 110, 75, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'ADULT_ONLY', 1, '40-60 min'),
('abc88440-8ce8-4260-9687-32083d165bad', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Ajudar um Familiar Sem Ser Pedido', 'Identificar uma necessidade de alguém da família e ajudar espontaneamente.', 25, 15, 'SOCIAL', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, 'Variável'),
('ac03fc4b-e233-42fd-9d2f-d17212640cb2', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Dormir no Horário Combinado', 'Estar na cama com as luzes apagadas no horário combinado pela família.', 20, 10, 'HEALTH', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'CHILD_ONLY', 1, '—'),
('ac263cdf-9f0d-4166-9513-001af475a0e9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Praticar um Esporte ou Atividade Física', '30 minutos de qualquer atividade física: jogar bola, andar de bike, dançar, academia.', 60, 35, 'HEALTH', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('ac4216ef-7ef9-4c7f-991c-22b1dc208c2b', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Participar de um Momento em Família', 'Jogar um jogo de tabuleiro, assistir a um filme ou fazer uma atividade juntos.', 50, 30, 'SOCIAL', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '30-60 min'),
('acd155c4-a993-4c94-a1f4-033b539bec62', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Guardar as Roupas Dobradas', 'Organizar as peças limpas nas gavetas e pendurar itens em cabides.', 35, 20, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('af2e5f19-7733-49a6-9bac-d615b20b73e6', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Revisar o Caderno do Dia', 'Ler e organizar as anotações feitas em sala de aula no dia.', 20, 10, 'STUDY', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'CHILD_ONLY', 1, '15-20 min'),
('afec4148-202c-4ac0-9b9f-8a4c17143ad1', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Dormir no Horário Combinado', 'Estar na cama com as luzes apagadas no horário combinado pela família.', 20, 10, 'HEALTH', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'CHILD_ONLY', 1, '—'),
('b004491d-4275-44e2-8e24-b5ca853adc3a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Escovar os Dentes (3x ao dia)', 'Escovar os dentes após o café, almoço e jantar.', 10, 5, 'HEALTH', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('b07afc92-0d07-488d-83d0-d96af1a82d75', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Praticar um Esporte ou Atividade Física', '30 minutos de qualquer atividade física: jogar bola, andar de bike, dançar, academia.', 60, 35, 'HEALTH', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('b1da00d2-e64f-4298-aa96-67a05dfb878b', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Desenhar ou Colorir', 'Criar um desenho ou colorir uma ilustração por pelo menos 20 minutos.', 40, 25, 'CREATIVE', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('b35d4762-aef3-4165-87d3-486760ba60d2', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Fazer a Lição de Casa', 'Concluir todas as tarefas escolares do dia antes do jantar.', 60, 35, 'STUDY', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30-45 min'),
('b3d9b63f-3674-4cbf-9251-577078a95431', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Limpar a Poeira dos Móveis', 'Passar pano seco ou espanador nas mesas, estantes e bancadas de toda a casa.', 30, 15, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('b50269ad-5b89-42e0-9684-098b55b2d9f6', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Arrumar a Mochila da Escola', 'Conferir os cadernos do dia seguinte, estojo e garrafinha de água.', 15, 5, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'CHILD_ONLY', 1, '5-10 min'),
('b87c60ec-d20c-46ec-8e8f-17960bf0e1b9', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Lavar a Louça Completa', 'Lavar, secar e guardar todas as panelas, travessas e pratos da refeição familiar.', 90, 60, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('b8a66eda-1fba-4941-8c19-4bb8feb8e397', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Roupa Suja no Cesto', 'Colocar as roupas do dia no cesto apropriado, sem deixar nenhuma peça no chão.', 10, 5, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('b964902a-4391-4e1c-bccd-3b9cd9951d58', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Dar uma Caminhada', 'Caminhar pelo bairro por pelo menos 20 minutos.', 40, 25, 'HEALTH', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('bab4c41f-e247-4d52-8035-68192f692777', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Concluir uma Peça de Artesanato', 'Finalizar uma peça artesanal completa (crochê, pintura, bijuteria, etc.).', 130, 90, 'CREATIVE', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'ADULT_ONLY', 1, '60+ min'),
('bb345dc9-79e4-4a96-a7a4-237ed1f47a11', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Participar de um Momento em Família', 'Jogar um jogo de tabuleiro, assistir a um filme ou fazer uma atividade juntos.', 50, 30, 'SOCIAL', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '30-60 min'),
('bc250b5f-0fe8-40bc-afad-694bdf7e9c22', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Revisar o Caderno do Dia', 'Ler e organizar as anotações feitas em sala de aula no dia.', 20, 10, 'STUDY', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'CHILD_ONLY', 1, '15-20 min'),
('bc2ca60c-1af5-4632-83c9-fc1f2a54af08', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Limpeza Geral do Quarto', 'Varrer, passar pano no chão, organizar guarda-roupa, trocar roupa de cama e tirar o lixo.', 100, 70, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('bc7b090b-6405-4449-a904-c6b5ea3c33b9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Concluir um Projeto Escolar', 'Finalizar uma etapa importante de um trabalho escolar ou apresentação.', 130, 90, 'STUDY', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'CHILD_ONLY', 1, '60+ min'),
('bd112a20-ac53-449d-be46-4cc05c346452', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Limpeza Geral do Quarto', 'Varrer, passar pano no chão, organizar guarda-roupa, trocar roupa de cama e tirar o lixo.', 100, 70, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('bda94234-e1e0-4b27-9536-aa84cd22c0e7', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Regar as Plantas da Casa', 'Colocar a quantidade certa de água nos vasos da sala ou varanda.', 15, 5, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('be4e7fad-4eca-475b-9a16-1c266b023194', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Escovar os Dentes (3x ao dia)', 'Escovar os dentes após o café, almoço e jantar.', 10, 5, 'HEALTH', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('bf59a0ed-1f39-4609-b56c-eceb6e4e57aa', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Ligar ou Mandar Mensagem para um Parente', 'Entrar em contato com avós, tios ou primos de forma carinhosa.', 35, 20, 'SOCIAL', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '15 min'),
('bf60fddc-5591-4540-b240-45160e7e166a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Concluir um Projeto Escolar', 'Finalizar uma etapa importante de um trabalho escolar ou apresentação.', 130, 90, 'STUDY', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'CHILD_ONLY', 1, '60+ min'),
('bfc92dc0-d70f-4ba6-b1e6-1ef129163b0d', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Varrer um Cômodo', 'Passar a vassoura no quarto ou na sala e recolher a sujeira com a pá.', 35, 20, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('c1545589-72ff-4ddf-8cae-6c382c59464d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Comer Verdura ou Fruta na Refeição', 'Incluir legume, verdura ou fruta em pelo menos uma refeição do dia.', 30, 20, 'HEALTH', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '—'),
('c2bb4cfa-65d2-4c68-a597-be21f55879d7', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Beijinho na Mãe de Boa noite!!!', 'Depois das 22:00  da um beijos de boa na Mãe, e pedir bença', 50, 15, 'SOCIAL', 1, '2026-09-02 00:11:32', '2026-09-02 00:11:32', 'EASY', 2, 15, 'ALL', 1, '15-20 min'),
('c327eebf-0bef-4a64-8917-539ad4e0f4bb', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Colocar/Tirar o Prato da Mesa', 'Levar prato, copos e talheres usados para a pia após a refeição.', 15, 5, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('c468f045-06ec-481c-bc4d-e6c588069e12', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Estudar uma Matéria', 'Focar em uma disciplina escolar por pelo menos 30 minutos usando o Foco do Herói.', 70, 40, 'STUDY', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30 min'),
('c71cbb2d-2c04-4369-beda-a4902ca90027', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Estudar uma Matéria', 'Focar em uma disciplina escolar por pelo menos 30 minutos usando o Foco do Herói.', 70, 40, 'STUDY', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30 min'),
('c7be4513-bd29-444c-b5ac-f856f203af39', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Passear com o Cachorro', 'Dar uma volta no quarteirão com o pet, recolhendo os dejetos adequadamente.', 45, 30, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('c806e31e-3af0-4b6b-ad19-af9890344f4d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Passar Pano no Chão da Casa', 'Utilizar balde e rodo/mop em todas as áreas comuns (sala, cozinha e corredores).', 100, 70, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'ALL', 1, '40-60 min'),
('c9d8445e-21e7-4d9d-b2f4-71517e6ff983', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Lavar o Quintal ou Garagem', 'Varrer folhas secas, jogar água e esfregar o piso com vassoura pesada.', 120, 85, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('cc2caf62-3c7d-4c15-aa4a-0cd43085878c', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Concluir um Projeto Escolar', 'Finalizar uma etapa importante de um trabalho escolar ou apresentação.', 130, 90, 'STUDY', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'CHILD_ONLY', 1, '60+ min'),
('cc45dd43-20b8-4a46-8791-707390c042d1', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Colocar/Tirar o Prato da Mesa', 'Levar prato, copos e talheres usados para a pia após a refeição.', 15, 5, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('cd61669c-647a-4d02-a682-d973df63cc8d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Tirar o Lixo da Casa', 'Amarrar os sacos de lixo (banheiro/cozinha) e colocar na lixeira principal.', 30, 15, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '10-15 min'),
('cde9e100-7870-4ec8-b594-afb1cee4d103', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Recolher os Brinquedos', 'Guardar brinquedos e jogos espalhados na caixa ou estante organizada.', 10, 5, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('ce332c1a-da53-4584-96e2-8c53386bf258', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Participar de um Momento em Família', 'Jogar um jogo de tabuleiro, assistir a um filme ou fazer uma atividade juntos.', 50, 30, 'SOCIAL', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '30-60 min'),
('ce390581-600e-4c43-b257-cb1f5d6e6d9f', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Ajudar um Familiar Sem Ser Pedido', 'Identificar uma necessidade de alguém da família e ajudar espontaneamente.', 25, 15, 'SOCIAL', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, 'Variável'),
('ce3b002e-03bc-4ef5-9289-b6727c19a90a', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Limpeza Geral do Quarto', 'Varrer, passar pano no chão, organizar guarda-roupa, trocar roupa de cama e tirar o lixo.', 100, 70, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('ce45dee1-c62c-4433-af0f-5f75caf913fe', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Ler por 20 Minutos', 'Ler qualquer livro, revista ou artigo educativo por pelo menos 20 minutos seguidos.', 30, 15, 'STUDY', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, '20 min'),
('d03048b0-00b8-4a03-864a-9237e32925a3', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Aprender Algo Novo', 'Assistir a um vídeo educativo, tutorial ou curso por pelo menos 30 minutos.', 50, 30, 'STUDY', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('d1103953-80d1-4b83-94b4-0cf2296c4c88', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Praticar um Esporte ou Atividade Física', '30 minutos de qualquer atividade física: jogar bola, andar de bike, dançar, academia.', 60, 35, 'HEALTH', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('d4cf4282-dad0-4b33-bd09-6816c313def0', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Revisar o Caderno do Dia', 'Ler e organizar as anotações feitas em sala de aula no dia.', 20, 10, 'STUDY', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'CHILD_ONLY', 1, '15-20 min'),
('d5b00ca0-b062-4a18-8ab0-b37b4030316c', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Estender e Recolher Varal Completo', 'Tirar roupas da máquina, estender no varal e dobrar todas quando secarem.', 80, 50, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('d656cbde-a7e3-4b3f-8d09-1ef712e1ab01', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Arrumar a Mochila da Escola', 'Conferir os cadernos do dia seguinte, estojo e garrafinha de água.', 15, 5, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'CHILD_ONLY', 1, '5-10 min'),
('d66db41d-b3e8-468f-b6eb-b54aee61c9d4', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Varrer um Cômodo', 'Passar a vassoura no quarto ou na sala e recolher a sujeira com a pá.', 35, 20, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('d693b67e-3538-4893-8728-ac243407fd9b', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Fazer a Lição de Casa', 'Concluir todas as tarefas escolares do dia antes do jantar.', 60, 35, 'STUDY', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30-45 min'),
('d69732a4-77f8-405e-9b86-e36240bf8e0d', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Passear com o Cachorro', 'Dar uma volta no quarteirão com o pet, recolhendo os dejetos adequadamente.', 45, 30, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('d6fa20d1-ef70-4981-920b-79f2a6ed69e9', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Regar as Plantas da Casa', 'Colocar a quantidade certa de água nos vasos da sala ou varanda.', 15, 5, 'DOMESTIC', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('d7b7732a-92d9-4e38-bea6-39fe42983642', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Dar uma Caminhada', 'Caminhar pelo bairro por pelo menos 20 minutos.', 40, 25, 'HEALTH', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('d7e9b6c6-ef0c-4da8-9221-26df4ae5b257', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Ligar ou Mandar Mensagem para um Parente', 'Entrar em contato com avós, tios ou primos de forma carinhosa.', 35, 20, 'SOCIAL', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '15 min'),
('d7f06ed3-33b4-4920-a8cc-aab4e84120db', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Fazer a Lição de Casa', 'Concluir todas as tarefas escolares do dia antes do jantar.', 60, 35, 'STUDY', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30-45 min'),
('d8b1b54f-6570-499b-b980-0785c7c46bf6', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Concluir um Projeto Criativo', 'Finalizar um projeto de arte, design, música ou escrita do início ao fim.', 120, 80, 'CREATIVE', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'ALL', 1, '60+ min'),
('d9e12b85-785a-4bf1-bfdb-97ca67c9dc63', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Tirar o Lixo da Casa', 'Amarrar os sacos de lixo (banheiro/cozinha) e colocar na lixeira principal.', 30, 15, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '10-15 min'),
('da41deb5-a73a-4577-95e7-b3111e9708c1', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Revisar o Caderno do Dia', 'Ler e organizar as anotações feitas em sala de aula no dia.', 20, 10, 'STUDY', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'CHILD_ONLY', 1, '15-20 min'),
('dab2297c-7757-466b-b021-dcf89ba7b519', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Fazer a Lição de Casa', 'Concluir todas as tarefas escolares do dia antes do jantar.', 60, 35, 'STUDY', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30-45 min'),
('db2fb562-9384-4e84-9839-c2da90566b22', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Lavar o Quintal ou Garagem', 'Varrer folhas secas, jogar água e esfregar o piso com vassoura pesada.', 120, 85, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('deb735c9-9f46-4d5b-82d4-e3cdac95aa33', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Estender e Recolher Varal Completo', 'Tirar roupas da máquina, estender no varal e dobrar todas quando secarem.', 80, 50, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('df8ff4c4-5e9c-4b24-8a7a-8e2835cc8eff', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Preparar uma Refeição Familiar', 'Cozinhar um prato completo para a família (ex: omelete, massa, salada, lanche).', 110, 75, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'ADULT_ONLY', 1, '40-60 min'),
('dfa03b08-2073-4f1e-ac12-c8d4a1d07cee', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Fazer um Projeto Manual', 'Montar, construir ou criar algo com materiais artísticos (Lego, argila, recorte, colagem).', 50, 30, 'CREATIVE', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('e1953617-a1f1-42d5-bb2b-dbcf45a3d302', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Regar as Plantas da Casa', 'Colocar a quantidade certa de água nos vasos da sala ou varanda.', 15, 5, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('e2420658-5d17-4167-b47e-51a16f7e2a74', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Arrumar a Mochila da Escola', 'Conferir os cadernos do dia seguinte, estojo e garrafinha de água.', 15, 5, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'CHILD_ONLY', 1, '5-10 min'),
('e2b499f0-b27e-4c36-a704-bfd1dcc3178b', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Limpeza Geral do Quarto', 'Varrer, passar pano no chão, organizar guarda-roupa, trocar roupa de cama e tirar o lixo.', 100, 70, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'ALL', 1, '45-60 min'),
('e3adf692-c8df-453f-a30b-354ab312639a', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Roupa Suja no Cesto', 'Colocar as roupas do dia no cesto apropriado, sem deixar nenhuma peça no chão.', 10, 5, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('e62362f2-e89b-48cf-a3d6-ce384c9d22a4', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Aprender Algo Novo', 'Assistir a um vídeo educativo, tutorial ou curso por pelo menos 30 minutos.', 50, 30, 'STUDY', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('e677b1c0-5a04-4207-bca6-891b48a5f672', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Desenhar ou Colorir', 'Criar um desenho ou colorir uma ilustração por pelo menos 20 minutos.', 40, 25, 'CREATIVE', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('e71a9dbb-70ce-4a14-a6ac-384cb7443ada', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Abastecer Água e Ração do Pet', 'Lavar e encher os potinhos de comida e água do animal de estimação.', 15, 10, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('e7e8a1d3-d6ab-4b82-8967-acd7f5652682', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Estudar para uma Prova', 'Sessão de estudo de pelo menos 45 minutos focada em uma prova ou avaliação.', 120, 80, 'STUDY', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'HARD', 4, 30, 'CHILD_ONLY', 1, '45-60 min'),
('e8eb87a0-e633-4fa3-a09f-82a5c3c5781e', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Roupa Suja no Cesto', 'Colocar as roupas do dia no cesto apropriado, sem deixar nenhuma peça no chão.', 10, 5, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('eddb8a4a-f2b1-4b11-ab6d-01197ee9c6c0', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Guardar as Roupas Dobradas', 'Organizar as peças limpas nas gavetas e pendurar itens em cabides.', 35, 20, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('eddbc76e-8bc3-465f-b46a-3d21175f2424', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Concluir uma Peça de Artesanato', 'Finalizar uma peça artesanal completa (crochê, pintura, bijuteria, etc.).', 130, 90, 'CREATIVE', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'HARD', 4, 30, 'ADULT_ONLY', 1, '60+ min'),
('ee1d5c50-3edf-4df8-97e7-5efd26b171a5', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Preparar uma Refeição Familiar', 'Cozinhar um prato completo para a família (ex: omelete, massa, salada, lanche).', 110, 75, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'HARD', 4, 30, 'ADULT_ONLY', 1, '40-60 min'),
('ee642767-26ea-4f04-b8f5-211150521c95', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Fazer a Lição de Casa', 'Concluir todas as tarefas escolares do dia antes do jantar.', 60, 35, 'STUDY', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'CHILD_ONLY', 1, '30-45 min'),
('f1b6c719-2a26-4d58-a396-317a8949153b', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Ler por 20 Minutos', 'Ler qualquer livro, revista ou artigo educativo por pelo menos 20 minutos seguidos.', 30, 15, 'STUDY', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, '20 min'),
('f245a073-70bb-48a9-bfec-37ed94549066', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Praticar um Esporte ou Atividade Física', '30 minutos de qualquer atividade física: jogar bola, andar de bike, dançar, academia.', 60, 35, 'HEALTH', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('f3a98bd8-ad9e-451d-855d-3705b5f753a6', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Arrumar a Própria Cama', 'Esticar o lençol, ajeitar o cobertor e posicionar os travesseiros corretamente.', 10, 5, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, '5 min'),
('f40f5122-8618-492c-843d-69efd24815a6', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Revisar o Caderno do Dia', 'Ler e organizar as anotações feitas em sala de aula no dia.', 20, 10, 'STUDY', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'EASY', 1, 5, 'CHILD_ONLY', 1, '15-20 min'),
('f46906a1-6e2e-45c8-8829-a866bc1cb324', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Dar uma Caminhada', 'Caminhar pelo bairro por pelo menos 20 minutos.', 40, 25, 'HEALTH', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('f4bccfa1-6899-4b25-9100-d6cce50aca87', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Limpar a Poeira dos Móveis', 'Passar pano seco ou espanador nas mesas, estantes e bancadas de toda a casa.', 30, 15, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('f4ca251d-ca6c-40ce-9fee-6970221a6b9f', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Ligar ou Mandar Mensagem para um Parente', 'Entrar em contato com avós, tios ou primos de forma carinhosa.', 35, 20, 'SOCIAL', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '15 min'),
('f4f1adab-63b1-4485-b060-173dc3eedc73', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Ajudar a Guardar as Compras', 'Retirar itens das sacolas e organizar mantimentos na despensa e geladeira.', 40, 25, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('f52c0fd3-fdfb-472d-9e50-38a73dc053d9', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Comer Verdura ou Fruta na Refeição', 'Incluir legume, verdura ou fruta em pelo menos uma refeição do dia.', 30, 20, 'HEALTH', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '—'),
('f5a2653f-034b-4954-9c01-4f76c92f2ed3', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Limpar a Poeira dos Móveis', 'Passar pano seco ou espanador nas mesas, estantes e bancadas de toda a casa.', 30, 15, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('f5bc0e23-1a03-492c-a196-09c05464d32e', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Aprender Algo Novo', 'Assistir a um vídeo educativo, tutorial ou curso por pelo menos 30 minutos.', 50, 30, 'STUDY', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('f7e8de53-e542-4e8e-8a6f-bcd24242ebbb', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Concluir uma Peça de Artesanato', 'Finalizar uma peça artesanal completa (crochê, pintura, bijuteria, etc.).', 130, 90, 'CREATIVE', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'ADULT_ONLY', 1, '60+ min'),
('f857d497-7f26-4103-82e2-837c2de04337', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Varrer um Cômodo', 'Passar a vassoura no quarto ou na sala e recolher a sujeira com a pá.', 35, 20, 'DOMESTIC', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '15-20 min'),
('f9782021-41eb-4d78-a650-ee8d4b3571ea', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Concluir uma Peça de Artesanato', 'Finalizar uma peça artesanal completa (crochê, pintura, bijuteria, etc.).', 130, 90, 'CREATIVE', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'HARD', 4, 30, 'ADULT_ONLY', 1, '60+ min'),
('f97b4a4d-96ef-44ca-86b7-66f4f83aeda7', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Recolher os Brinquedos', 'Guardar brinquedos e jogos espalhados na caixa ou estante organizada.', 10, 5, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'EASY', 1, 5, 'ALL', 1, '5-10 min'),
('fac029a6-b9fb-4c95-8d67-c3ad8592c573', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Desenhar ou Colorir', 'Criar um desenho ou colorir uma ilustração por pelo menos 20 minutos.', 40, 25, 'CREATIVE', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('faf415fd-d476-4021-ba86-d10998e0eb71', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', NULL, 'Higienização do Banheiro', 'Limpar pia, espelho, recolher o lixo e higienizar o vaso sanitário.', 120, 80, 'DOMESTIC', 1, '2026-08-31 21:07:03', '2026-08-31 21:07:03', 'HARD', 4, 30, 'ALL', 1, '30-45 min'),
('fb372407-4ec8-4321-8af7-429293736056', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', NULL, 'Dar uma Caminhada', 'Caminhar pelo bairro por pelo menos 20 minutos.', 40, 25, 'HEALTH', 1, '2026-08-31 16:29:37', '2026-08-31 16:29:37', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('fbf2e9dc-29f1-424e-abf4-97b3b0ee3c86', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', NULL, 'Aprender Algo Novo', 'Assistir a um vídeo educativo, tutorial ou curso por pelo menos 30 minutos.', 50, 30, 'STUDY', 1, '2026-08-31 16:14:25', '2026-08-31 16:32:58', 'MEDIUM', 2, 15, 'ALL', 1, '30 min'),
('fe56ff8f-eb1c-4d1d-8aff-7c3d08fcdfc2', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Tirar o Lixo da Casa', 'Amarrar os sacos de lixo (banheiro/cozinha) e colocar na lixeira principal.', 30, 15, 'DOMESTIC', 1, '2026-08-31 22:16:43', '2026-08-31 22:16:43', 'MEDIUM', 2, 15, 'ALL', 1, '10-15 min'),
('fe76bd8b-f669-495f-8262-b1b91060606a', '230c7fb5-8f12-4128-89f7-8cd190be97ba', '6e462a8b-7384-45bc-a584-188fb64bced4', NULL, 'Passear com o Cachorro', 'Dar uma volta no quarteirão com o pet, recolhendo os dejetos adequadamente.', 45, 30, 'DOMESTIC', 1, '2026-11-17 17:11:22', '2026-11-17 17:11:22', 'MEDIUM', 2, 15, 'ALL', 1, '20-30 min'),
('fe9f0af6-6fe8-4b7e-9aa9-d76ab23d1cff', '1fc802bf-498a-470c-9b1a-b6a1ce3b072f', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Recolher os Brinquedos', 'Guardar brinquedos e jogos espalhados na caixa ou estante organizada.', 10, 5, 'DOMESTIC', 1, '2026-08-31 19:37:00', '2026-08-31 19:37:00', 'EASY', 1, 5, 'ALL', 1, '5-10 min');

-- --------------------------------------------------------

--
-- Estrutura para tabela `task_submissions`
--

CREATE TABLE `task_submissions` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `task_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `character_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `proof_text` text DEFAULT NULL,
  `proof_photo_url` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `feedback` text DEFAULT NULL,
  `reviewed_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `task_submissions`
--

INSERT INTO `task_submissions` (`id`, `task_id`, `user_id`, `character_id`, `proof_text`, `proof_photo_url`, `status`, `feedback`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`) VALUES
('06917e94-0162-4063-b1a2-bc262d750e62', '030c3f10-e523-4e80-88d7-fa6cb7253f1d', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', 'OK VLBLBLBLBLBL', '/uploads/profiles/47f6416a-6f47-4c1c-bd92-0d30fa8f908c.png', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 16:45:47', '2026-09-01 16:45:23', '2026-09-01 16:45:47'),
('0ca5657e-ef54-4291-a6be-180104913759', '88d503a3-36d6-4e98-8bfb-a11d91e9d8bf', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Li livro da iskola', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:22:27', '2026-09-01 00:15:20', '2026-09-01 00:22:27'),
('208378ba-d2ae-4ca2-8b96-1620a96b6998', '1716a2a9-de9d-48e9-8da1-d687b6fab501', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Arrumei hoje de manhã okai', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:22:21', '2026-08-31 22:17:27', '2026-09-01 00:22:21'),
('21f5d174-d585-4442-844a-5e5c67fdf625', '869b0f53-003a-4310-ad53-5db2d7f990b1', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Amou né, beeijo', '/uploads/profiles/a56881ab-6ab9-4c56-b6b2-b0e16bbf5ab9.jpg', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:22:25', '2026-08-31 22:24:18', '2026-09-01 00:22:25'),
('230eab39-0701-4def-a2c0-916f9478eb84', '1bcdd8d3-109c-4449-8dfe-4fc0ca6b037d', 'b3128978-89c1-49a4-ac21-56732fa78eda', NULL, 'Andei 1000mts', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:22:20', '2026-08-31 19:38:25', '2026-09-01 00:22:20'),
('2d57258d-a56b-49f5-953b-d96eeaa2d5a2', 'f4ca251d-ca6c-40ce-9fee-6970221a6b9f', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Oi Sidney \nBye Sidney', '/uploads/profiles/29377673-79f4-4c91-b877-ff1c9a6b017a.jpg', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-03 14:41:24', '2026-09-02 00:15:02', '2026-09-03 14:41:24'),
('2eec19e7-d114-4a85-a0b2-8c8f9eb70f95', 'ce45dee1-c62c-4433-af0f-5f75caf913fe', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Eu li o livro de português na escola hoje', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-03 14:41:21', '2026-09-02 00:13:42', '2026-09-03 14:41:21'),
('3bc190ec-271e-4792-9760-d796bbe290b5', '79efe0cc-987d-4ef4-92d8-e43afbdfcb40', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', 'Fiz isso', NULL, 'APPROVED', 'Ótimo', 'b3128978-89c1-49a4-ac21-56732fa78eda', '2026-09-02 00:04:15', '2026-09-01 23:58:36', '2026-09-02 00:04:15'),
('3be13f56-9160-4003-82e2-d7b8fd8cdd48', '1c3feabd-5c5e-41b8-837c-197cc7faf937', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', 'Lavei de manhã', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-03 14:41:18', '2026-09-02 00:09:50', '2026-09-03 14:41:18'),
('43c2618a-5366-4207-b039-395458a2f7f2', '030c3f10-e523-4e80-88d7-fa6cb7253f1d', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Eu dobrei minhas roupas e guardei certinho igual a mamãe me ensinou', '/uploads/profiles/2afda608-d92b-47f2-82ba-7fe29e39212b.jpg', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:22:24', '2026-08-31 22:22:10', '2026-09-01 00:22:24'),
('4b8165a7-7ab2-40c1-b56f-59ef8135489a', '1716a2a9-de9d-48e9-8da1-d687b6fab501', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', 'Arrumei a cama de manhã', NULL, 'APPROVED', NULL, 'b3128978-89c1-49a4-ac21-56732fa78eda', '2026-09-01 23:58:47', '2026-09-01 23:57:19', '2026-09-01 23:58:47'),
('5a06ce33-6a4e-41cf-bba7-6052fad9ef30', 'f46906a1-6e2e-45c8-8829-a866bc1cb324', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Na escola eu fiquei andando com a Ana', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-03 14:41:17', '2026-09-02 00:08:10', '2026-09-03 14:41:17'),
('6a526ec8-0fe0-4aee-8b41-cb4b4d45f234', '6cf45f4e-88db-4b98-aa5f-6be7b916ac9d', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'A mamãe disse q n queria que eu enchesse a garrafinha de água dela, então eu ajudei NÃO enchendo, beeijo', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 23:56:50', '2026-09-01 23:54:20', '2026-09-01 23:56:50'),
('6af76320-b472-4585-88ac-cfa4f2392864', 'eddb8a4a-f2b1-4b11-ab6d-01197ee9c6c0', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Cheguei da escola e deixei arrumadinho', '/uploads/profiles/de513b31-6479-4e1f-80c1-16742679128c.jpg', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-03 14:41:25', '2026-09-02 00:16:35', '2026-09-03 14:41:25'),
('6e4bcff7-2077-4fa0-9332-8217a8180fcc', '06a01757-d91c-440a-a32f-a74679d8322d', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', 'Lavei a louça de manhã', NULL, 'APPROVED', 'Fez sua obrigação', 'b3128978-89c1-49a4-ac21-56732fa78eda', '2026-09-02 00:04:52', '2026-09-02 00:00:00', '2026-09-02 00:04:52'),
('7d1c3fdf-a890-4c51-b7e9-2f46523eda95', '01cbad0e-55cb-44e3-adc8-1657a2e252da', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', 'ok', '/uploads/profiles/7b230a81-1667-4457-91c7-b05272b50545.png', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:18:41', '2026-09-01 00:18:05', '2026-09-01 00:18:41'),
('88e0a4b5-d92d-4126-b845-980e64071f01', 'bf60fddc-5591-4540-b240-45160e7e166a', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', 'Fiz atividades da escola online', NULL, 'APPROVED', 'Parabéns', 'b3128978-89c1-49a4-ac21-56732fa78eda', '2026-09-02 00:04:31', '2026-09-01 23:59:28', '2026-09-02 00:04:31'),
('9bfecd72-328e-4a06-9ed7-54eb48014c22', '01cbad0e-55cb-44e3-adc8-1657a2e252da', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', '9249946b-0397-40e5-9cea-34e2d6373a5a', 'ok', '/uploads/profiles/1316e43c-d358-49bc-b5e0-af3b290b396f.png', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:19:23', '2026-09-01 00:19:15', '2026-09-01 00:19:23'),
('9dd1b79d-0bed-43f0-a29d-76cabb4f7112', '603de5ad-750a-40fb-b35f-88160e12ee58', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Desenhei na aula (dps q terminei a lição)', '/uploads/profiles/d6935e07-47c3-4f4e-b290-2781a371f45a.jpg', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:22:22', '2026-08-31 22:19:30', '2026-09-01 00:22:22'),
('a84c987d-1f92-450a-a1fc-692f64e40cb3', 'd656cbde-a7e3-4b3f-8d09-1ef712e1ab01', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Arrumei zim', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:22:23', '2026-08-31 22:20:54', '2026-09-01 00:22:23'),
('aa3236eb-ef04-41a5-80e5-5175ca62bfe5', '41bf290c-0721-4b64-96ae-80797ce2daf4', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Aprendi na escola okai', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-03 14:41:16', '2026-09-02 00:04:39', '2026-09-03 14:41:16'),
('c1ba6f5c-3510-4324-90d1-94bcb13ae6aa', 'f40f5122-8618-492c-843d-69efd24815a6', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Tô olhando okai, tive P.V, ED. Financeira, Português (n usei o caderno) e Ciências (n usei o caderno)', '/uploads/profiles/55d14891-e4fd-4e8e-bb40-5436d8f45654.jpg', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:22:26', '2026-08-31 22:26:01', '2026-09-01 00:22:26'),
('ca60ee79-a043-4101-a1c2-aaec34d3241f', '2408e399-ba42-460d-b9b7-945e311520e5', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Amou né', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-03 14:41:15', '2026-09-01 23:59:43', '2026-09-03 14:41:15'),
('ce67a434-23b8-4e17-9c79-7aeac7a35c59', 'e1953617-a1f1-42d5-bb2b-dbcf45a3d302', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Pedi pra chuvar regar as plantas da mamãe e ela veio, dnd', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-03 14:41:14', '2026-09-01 23:57:32', '2026-09-03 14:41:14'),
('cef0f314-d69b-4e07-b529-54f0bb513cf4', '22599944-6af0-4b3a-9fed-39b36ed49797', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Dei uma passeio até a escola com nosso ratinho de estimação (Paulinho)', NULL, 'REJECTED', 'Nao foi cachorro', 'b3128978-89c1-49a4-ac21-56732fa78eda', '2026-09-01 23:58:43', '2026-09-01 23:56:16', '2026-09-01 23:58:43'),
('da5265b6-a58f-4f6f-93f1-c666e53830e0', 'e2420658-5d17-4167-b47e-51a16f7e2a74', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Eu arrumei antes de irrr', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-03 14:41:22', '2026-09-02 00:13:58', '2026-09-03 14:41:22'),
('dd1fd86b-e4ae-485b-a1c3-ee4938118b61', '06a01757-d91c-440a-a32f-a74679d8322d', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Eu lavei, mandei a foto, beeijo', NULL, 'APPROVED', 'Parabéns', 'b3128978-89c1-49a4-ac21-56732fa78eda', '2026-09-02 00:00:03', '2026-09-01 23:58:34', '2026-09-02 00:00:03'),
('df6cbaab-e79e-4096-8402-be9482f1f9e3', '0f20ef9b-e233-4273-bfff-e9760cfeb41e', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', '5f45cbc5-6df6-4721-bfac-7c49d1a745f0', 'ok', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-08-31 16:36:56', '2026-08-31 16:14:28', '2026-08-31 16:36:56'),
('f5c4c096-6833-4b5a-b497-3346c2f1072d', '036759c1-4662-4562-946f-6009ec77e9d9', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, '.', NULL, 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 00:20:32', '2026-09-01 00:20:23', '2026-09-01 00:20:32'),
('f8bea02d-f50e-4159-8590-246ad27d2f74', '7caf8504-2a74-4079-9135-d93590a3f8f3', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Lavei, sequei, guardei, limpei a pia e sequei a pia', '/uploads/profiles/c1ca73d6-6645-41c5-817d-e29a81d946db.jpg', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-01 23:56:56', '2026-09-01 23:55:02', '2026-09-01 23:56:56'),
('fd5a1f68-2a06-4c31-9038-ff66958bf21c', 'bc250b5f-0fe8-40bc-afad-694bdf7e9c22', '74ced466-eded-45b3-8fe5-db993e71bb4f', NULL, 'Tive ciências, português, inglês e Tecnologia (obs: só usei o caderno de ciências pra escrever coisa hoje)', '/uploads/profiles/c51babee-c15a-4693-a342-1b55f9f9fd88.jpg', 'APPROVED', NULL, '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', '2026-09-03 14:41:20', '2026-09-02 00:13:20', '2026-09-03 14:41:20');

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_progress`
--

CREATE TABLE `user_progress` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `adventure_energy` int(11) DEFAULT 0,
  `family_tokens` int(11) DEFAULT 0,
  `tasks_done_total` int(11) DEFAULT 0,
  `tasks_done_today` int(11) DEFAULT 0,
  `streak_days` int(11) DEFAULT 0,
  `best_streak_days` int(11) DEFAULT 0,
  `last_active_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `user_progress`
--

INSERT INTO `user_progress` (`id`, `user_id`, `adventure_energy`, `family_tokens`, `tasks_done_total`, `tasks_done_today`, `streak_days`, `best_streak_days`, `last_active_date`, `created_at`, `updated_at`) VALUES
('3b127b38-ff95-4784-ae58-847fc037623a', 'bb0a43ca-9b40-4d74-b385-9bd9b4fb3f57', 2, 15, 1, 1, 1, 1, '2026-09-01', '2026-08-31 21:07:02', '2026-09-05 16:28:45'),
('4a698787-3abb-43e1-a412-7704166394f7', 'c6e55de6-969f-4572-b97c-e93b872afdcf', 10, 50, 0, 0, 1, 1, '2026-11-21', '2026-11-21 19:40:41', '2026-11-21 19:40:41'),
('6323e777-e738-479b-8a96-f0dd4ac2eac6', '74ced466-eded-45b3-8fe5-db993e71bb4f', 23, 240, 20, 9, 3, 3, '2026-09-03', '2026-08-31 22:16:43', '2026-09-05 01:43:13'),
('782d0194-891b-443b-9e9c-89b29c579608', '70d3b59f-e6d2-4903-9409-d832753a7c09', 10, 50, 0, 0, 1, 1, '2026-11-21', '2026-11-21 19:40:41', '2026-11-21 19:40:41'),
('8f0969f0-c1bc-4994-9c7d-58c524cc0780', 'eaf726c2-6af4-46bc-b41b-2550a1b5ba06', 16, 115, 8, 1, 4, 4, '2026-09-03', '2026-08-31 15:13:41', '2026-09-03 14:41:18'),
('b247fe01-cec0-49ad-998c-cdad95936f92', 'b3128978-89c1-49a4-ac21-56732fa78eda', 2, 15, 1, 1, 1, 1, '2026-09-01', '2026-08-31 19:37:00', '2026-09-01 00:22:20'),
('b42a496e-5530-4d23-b5c3-86ef2a014f53', '61f4c226-505e-4ed7-8de8-4ad2dc210fc2', 100, 0, 0, 0, 0, 0, NULL, '2026-08-31 15:13:41', '2026-11-17 01:23:02'),
('b44446f3-f817-4df8-bdcc-4832ae2492d1', '6e462a8b-7384-45bc-a584-188fb64bced4', 0, 0, 0, 0, 0, 0, NULL, '2026-08-31 15:13:41', '2026-08-31 15:13:41'),
('c7663462-6595-4ade-9312-a4beaebe1cfd', '40058126-1471-4c26-945c-1f329a49a2be', 10, 50, 0, 0, 1, 1, '2026-11-21', '2026-11-21 19:40:42', '2026-11-21 19:40:42'),
('d0b43811-f9c6-41c4-9f14-7d720225a325', 'f85ea042-b0b0-484c-be2b-3ea9b0503b6b', 10, 50, 0, 0, 1, 1, '2026-11-21', '2026-11-21 19:40:42', '2026-11-21 19:40:42');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `battles`
--
ALTER TABLE `battles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `monster_id` (`monster_id`);

--
-- Índices de tabela `characters`
--
ALTER TABLE `characters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_character` (`user_id`),
  ADD KEY `current_class_id` (`current_class_id`);

--
-- Índices de tabela `character_attributes`
--
ALTER TABLE `character_attributes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_character_attribute` (`character_id`,`attribute_id`),
  ADD KEY `attribute_id` (`attribute_id`);

--
-- Índices de tabela `character_classes`
--
ALTER TABLE `character_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_character_class` (`character_id`,`class_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Índices de tabela `character_inventory`
--
ALTER TABLE `character_inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `character_id` (`character_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Índices de tabela `character_skills`
--
ALTER TABLE `character_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_character_skill` (`character_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Índices de tabela `definition_attributes`
--
ALTER TABLE `definition_attributes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_attribute_code` (`code`);

--
-- Índices de tabela `definition_classes`
--
ALTER TABLE `definition_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_class_code` (`code`),
  ADD KEY `primary_attribute_id` (`primary_attribute_id`),
  ADD KEY `secondary_attribute_id` (`secondary_attribute_id`);

--
-- Índices de tabela `definition_items`
--
ALTER TABLE `definition_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_item_code` (`code`);

--
-- Índices de tabela `definition_monsters`
--
ALTER TABLE `definition_monsters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_monster_code` (`code`);

--
-- Índices de tabela `definition_mz_characters`
--
ALTER TABLE `definition_mz_characters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_mz_character_code` (`code`),
  ADD KEY `idx_mz_char_box` (`box_name`),
  ADD KEY `idx_mz_char_modes` (`has_super_hero`,`has_zombie_hero`,`has_boss_enemy`);

--
-- Índices de tabela `definition_skills`
--
ALTER TABLE `definition_skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_skill_code` (`code`),
  ADD KEY `class_id` (`class_id`);

--
-- Índices de tabela `definition_tasks`
--
ALTER TABLE `definition_tasks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_task_slug` (`slug`);

--
-- Índices de tabela `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`);

--
-- Índices de tabela `families`
--
ALTER TABLE `families`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_family_invite_code` (`invite_code`),
  ADD KEY `created_by` (`created_by`);

--
-- Índices de tabela `family_bills`
--
ALTER TABLE `family_bills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Índices de tabela `family_characters`
--
ALTER TABLE `family_characters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_family_character_user` (`user_id`),
  ADD KEY `family_id` (`family_id`);

--
-- Índices de tabela `family_child_vaults`
--
ALTER TABLE `family_child_vaults`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_family_child_vault` (`family_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `family_clan_vaults`
--
ALTER TABLE `family_clan_vaults`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Índices de tabela `family_dungeon_actions`
--
ALTER TABLE `family_dungeon_actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_action_scene_number` (`scene_id`,`action_number`);

--
-- Índices de tabela `family_dungeon_adventures`
--
ALTER TABLE `family_dungeon_adventures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_adventure_code` (`code`);

--
-- Índices de tabela `family_dungeon_runs`
--
ALTER TABLE `family_dungeon_runs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `character_id` (`character_id`),
  ADD KEY `adventure_id` (`adventure_id`),
  ADD KEY `idx_dungeon_runs_user_status` (`user_id`,`status`);

--
-- Índices de tabela `family_dungeon_scenes`
--
ALTER TABLE `family_dungeon_scenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_scene_adventure_step` (`adventure_id`,`step_order`);

--
-- Índices de tabela `family_events`
--
ALTER TABLE `family_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Índices de tabela `family_meals`
--
ALTER TABLE `family_meals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`);

--
-- Índices de tabela `family_meal_checkins`
--
ALTER TABLE `family_meal_checkins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meal_id` (`meal_id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `character_id` (`character_id`),
  ADD KEY `validated_by` (`validated_by`);

--
-- Índices de tabela `family_meal_items`
--
ALTER TABLE `family_meal_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `meal_id` (`meal_id`);

--
-- Índices de tabela `family_meal_schedules`
--
ALTER TABLE `family_meal_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`);

--
-- Índices de tabela `family_members`
--
ALTER TABLE `family_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `family_polls`
--
ALTER TABLE `family_polls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Índices de tabela `family_poll_votes`
--
ALTER TABLE `family_poll_votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_poll_user_vote` (`poll_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `family_push_subscriptions`
--
ALTER TABLE `family_push_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `family_quiz_options`
--
ALTER TABLE `family_quiz_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`);

--
-- Índices de tabela `family_quiz_questions`
--
ALTER TABLE `family_quiz_questions`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `family_rewards`
--
ALTER TABLE `family_rewards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Índices de tabela `family_reward_redemptions`
--
ALTER TABLE `family_reward_redemptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reward_id` (`reward_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `reviewed_by` (`reviewed_by`);

--
-- Índices de tabela `family_shopping_items`
--
ALTER TABLE `family_shopping_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`);

--
-- Índices de tabela `family_users`
--
ALTER TABLE `family_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_email` (`email`),
  ADD KEY `family_id` (`family_id`);

--
-- Índices de tabela `family_whatsapp_configs`
--
ALTER TABLE `family_whatsapp_configs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`);

--
-- Índices de tabela `family_zombi_campaigns`
--
ALTER TABLE `family_zombi_campaigns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_zombi_campaign_code` (`code`);

--
-- Índices de tabela `family_zombi_missions`
--
ALTER TABLE `family_zombi_missions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_zombi_mission_code` (`code`),
  ADD KEY `campaign_id` (`campaign_id`);

--
-- Índices de tabela `family_zombi_tokens`
--
ALTER TABLE `family_zombi_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mission_id` (`mission_id`);

--
-- Índices de tabela `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `family_id` (`family_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Índices de tabela `task_submissions`
--
ALTER TABLE `task_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_id` (`task_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `character_id` (`character_id`),
  ADD KEY `reviewed_by` (`reviewed_by`);

--
-- Índices de tabela `user_progress`
--
ALTER TABLE `user_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_progress` (`user_id`);

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `battles`
--
ALTER TABLE `battles`
  ADD CONSTRAINT `battles_ibfk_5` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `battles_ibfk_6` FOREIGN KEY (`monster_id`) REFERENCES `definition_monsters` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Restrições para tabelas `characters`
--
ALTER TABLE `characters`
  ADD CONSTRAINT `characters_ibfk_10` FOREIGN KEY (`current_class_id`) REFERENCES `definition_classes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `characters_ibfk_9` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `character_attributes`
--
ALTER TABLE `character_attributes`
  ADD CONSTRAINT `character_attributes_ibfk_7` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `character_classes`
--
ALTER TABLE `character_classes`
  ADD CONSTRAINT `character_classes_ibfk_10` FOREIGN KEY (`class_id`) REFERENCES `definition_classes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `character_classes_ibfk_9` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `character_inventory`
--
ALTER TABLE `character_inventory`
  ADD CONSTRAINT `character_inventory_ibfk_5` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `character_inventory_ibfk_6` FOREIGN KEY (`item_id`) REFERENCES `definition_items` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Restrições para tabelas `character_skills`
--
ALTER TABLE `character_skills`
  ADD CONSTRAINT `character_skills_ibfk_5` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `character_skills_ibfk_6` FOREIGN KEY (`skill_id`) REFERENCES `definition_skills` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Restrições para tabelas `definition_classes`
--
ALTER TABLE `definition_classes`
  ADD CONSTRAINT `definition_classes_ibfk_1` FOREIGN KEY (`primary_attribute_id`) REFERENCES `definition_attributes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `definition_classes_ibfk_2` FOREIGN KEY (`secondary_attribute_id`) REFERENCES `definition_attributes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Restrições para tabelas `definition_skills`
--
ALTER TABLE `definition_skills`
  ADD CONSTRAINT `definition_skills_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `definition_classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `families`
--
ALTER TABLE `families`
  ADD CONSTRAINT `families_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_bills`
--
ALTER TABLE `family_bills`
  ADD CONSTRAINT `family_bills_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_bills_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_characters`
--
ALTER TABLE `family_characters`
  ADD CONSTRAINT `family_characters_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_characters_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_child_vaults`
--
ALTER TABLE `family_child_vaults`
  ADD CONSTRAINT `family_child_vaults_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_child_vaults_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_clan_vaults`
--
ALTER TABLE `family_clan_vaults`
  ADD CONSTRAINT `family_clan_vaults_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_clan_vaults_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_dungeon_actions`
--
ALTER TABLE `family_dungeon_actions`
  ADD CONSTRAINT `family_dungeon_actions_ibfk_1` FOREIGN KEY (`scene_id`) REFERENCES `family_dungeon_scenes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_dungeon_runs`
--
ALTER TABLE `family_dungeon_runs`
  ADD CONSTRAINT `family_dungeon_runs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_dungeon_runs_ibfk_2` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `family_dungeon_runs_ibfk_3` FOREIGN KEY (`adventure_id`) REFERENCES `family_dungeon_adventures` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_dungeon_scenes`
--
ALTER TABLE `family_dungeon_scenes`
  ADD CONSTRAINT `family_dungeon_scenes_ibfk_1` FOREIGN KEY (`adventure_id`) REFERENCES `family_dungeon_adventures` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_events`
--
ALTER TABLE `family_events`
  ADD CONSTRAINT `family_events_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_events_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_meals`
--
ALTER TABLE `family_meals`
  ADD CONSTRAINT `family_meals_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_meal_checkins`
--
ALTER TABLE `family_meal_checkins`
  ADD CONSTRAINT `family_meal_checkins_ibfk_1` FOREIGN KEY (`meal_id`) REFERENCES `family_meals` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `family_meal_checkins_ibfk_2` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_meal_checkins_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_meal_checkins_ibfk_4` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `family_meal_checkins_ibfk_5` FOREIGN KEY (`validated_by`) REFERENCES `family_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_meal_items`
--
ALTER TABLE `family_meal_items`
  ADD CONSTRAINT `family_meal_items_ibfk_1` FOREIGN KEY (`meal_id`) REFERENCES `family_meals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_meal_schedules`
--
ALTER TABLE `family_meal_schedules`
  ADD CONSTRAINT `family_meal_schedules_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_members`
--
ALTER TABLE `family_members`
  ADD CONSTRAINT `family_members_ibfk_10` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_members_ibfk_9` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_polls`
--
ALTER TABLE `family_polls`
  ADD CONSTRAINT `family_polls_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_polls_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_poll_votes`
--
ALTER TABLE `family_poll_votes`
  ADD CONSTRAINT `family_poll_votes_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `family_polls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_poll_votes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_push_subscriptions`
--
ALTER TABLE `family_push_subscriptions`
  ADD CONSTRAINT `family_push_subscriptions_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_push_subscriptions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_quiz_options`
--
ALTER TABLE `family_quiz_options`
  ADD CONSTRAINT `family_quiz_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `family_quiz_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_rewards`
--
ALTER TABLE `family_rewards`
  ADD CONSTRAINT `family_rewards_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_rewards_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_reward_redemptions`
--
ALTER TABLE `family_reward_redemptions`
  ADD CONSTRAINT `family_reward_redemptions_ibfk_1` FOREIGN KEY (`reward_id`) REFERENCES `family_rewards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_reward_redemptions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `family_reward_redemptions_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `family_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_shopping_items`
--
ALTER TABLE `family_shopping_items`
  ADD CONSTRAINT `family_shopping_items_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_users`
--
ALTER TABLE `family_users`
  ADD CONSTRAINT `family_users_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_whatsapp_configs`
--
ALTER TABLE `family_whatsapp_configs`
  ADD CONSTRAINT `family_whatsapp_configs_ibfk_1` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_zombi_missions`
--
ALTER TABLE `family_zombi_missions`
  ADD CONSTRAINT `family_zombi_missions_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `family_zombi_campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `family_zombi_tokens`
--
ALTER TABLE `family_zombi_tokens`
  ADD CONSTRAINT `family_zombi_tokens_ibfk_1` FOREIGN KEY (`mission_id`) REFERENCES `family_zombi_missions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_7` FOREIGN KEY (`family_id`) REFERENCES `families` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_8` FOREIGN KEY (`created_by`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_9` FOREIGN KEY (`assigned_to`) REFERENCES `family_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `task_submissions`
--
ALTER TABLE `task_submissions`
  ADD CONSTRAINT `task_submissions_ibfk_10` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `task_submissions_ibfk_11` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_submissions_ibfk_12` FOREIGN KEY (`reviewed_by`) REFERENCES `family_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_submissions_ibfk_9` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `user_progress`
--
ALTER TABLE `user_progress`
  ADD CONSTRAINT `user_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `family_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

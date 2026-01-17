-- 旅游日记系统数据库初始化脚本
-- 创建时间: 2026-01-17

-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320) DEFAULT NULL,
  `loginMethod` varchar(64) DEFAULT NULL,
  `avatar` text,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `status` enum('active','disabled') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建日记表
CREATE TABLE IF NOT EXISTS `diaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `locationName` varchar(200) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `weather` varchar(50) DEFAULT NULL,
  `temperature` varchar(20) DEFAULT NULL,
  `status` enum('published','hidden','deleted') NOT NULL DEFAULT 'published',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `diaries_userId_idx` (`userId`),
  KEY `diaries_status_idx` (`status`),
  KEY `diaries_createdAt_idx` (`createdAt`),
  CONSTRAINT `diaries_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建日记图片表
CREATE TABLE IF NOT EXISTS `diary_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `diaryId` int NOT NULL,
  `imageUrl` text NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `diary_images_diaryId_idx` (`diaryId`),
  CONSTRAINT `diary_images_diaryId_fk` FOREIGN KEY (`diaryId`) REFERENCES `diaries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入测试数据（可选）
-- INSERT INTO `users` (`openId`, `name`, `email`, `role`) VALUES
-- ('test-user-001', '测试用户', 'test@example.com', 'user'),
-- ('test-admin-001', '管理员', 'admin@example.com', 'admin');

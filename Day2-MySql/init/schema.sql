CREATE DATABASE IF NOT EXISTS `szkolenie` /*!40100 COLLATE 'utf8mb4_0900_ai_ci' */;
USE `szkolenie`;
CREATE TABLE IF NOT EXISTS `files` (
                         `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
                         `name` VARCHAR(256) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
                         `path` VARCHAR(256) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
                         `pass` VARCHAR(256) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
                         `size` INT(10) NOT NULL DEFAULT '0',
                         `ext` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
                         `mimetype` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
                         `createdAt` DATETIME NOT NULL,
                         `updatedAt` DATETIME NOT NULL,
                         `deletedAt` DATETIME NOT NULL,
                         PRIMARY KEY (`id`) USING BTREE
)
    COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

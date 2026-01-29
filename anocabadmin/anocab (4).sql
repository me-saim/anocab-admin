-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 24, 2026 at 05:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `anocab`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_redeem_amount` (IN `p_m_number` VARCHAR(20), IN `p_amount` DECIMAL(10,2), OUT `p_status` VARCHAR(10), OUT `p_message` VARCHAR(255), OUT `p_order_id` VARCHAR(100))   BEGIN
    DECLARE v_user_id INT;
    DECLARE v_user_points DECIMAL(10, 2);
    DECLARE v_redeemable DECIMAL(10, 2);
    DECLARE v_order_id VARCHAR(100);
    
    -- Get user
    SELECT id, points INTO v_user_id, v_user_points
    FROM users WHERE m_number = p_m_number LIMIT 1;
    
    IF v_user_id IS NULL THEN
        SET p_status = 'false';
        SET p_message = 'User not found';
        SET p_order_id = '';
    ELSEIF p_amount < 500 THEN
        SET p_status = 'false';
        SET p_message = 'Minimum redeem amount is ₹500';
        SET p_order_id = '';
    ELSE
        -- Calculate redeemable amount
        SELECT redeemable_amount INTO v_redeemable
        FROM vw_user_redeemable_amount
        WHERE id = v_user_id;
        
        IF v_redeemable < p_amount THEN
            SET p_status = 'false';
            SET p_message = 'Insufficient redeemable amount';
            SET p_order_id = '';
        ELSE
            -- Generate order ID
            SET v_order_id = CONCAT('ACAB', UNIX_TIMESTAMP(), FLOOR(RAND() * 1000));
            
            -- Create redeem transaction
            INSERT INTO redeem_transactions (user_id, amount, order_id, status)
            VALUES (v_user_id, p_amount, v_order_id, 'pending');
            
            SET p_status = 'true';
            SET p_message = 'Amount redeemed successfully';
            SET p_order_id = v_order_id;
        END IF;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_scan_qr_code` (IN `p_m_number` VARCHAR(20), IN `p_qr_code` VARCHAR(255), IN `p_user_type` ENUM('regular_user','electrician','dealer'), OUT `p_status` VARCHAR(10), OUT `p_message` VARCHAR(255), OUT `p_points` DECIMAL(10,2))   BEGIN
    DECLARE v_user_id INT;
    DECLARE v_qr_id INT;
    DECLARE v_qr_points DECIMAL(10, 2);
    DECLARE v_already_scanned INT DEFAULT 0;
    
    -- Get user ID
    SELECT id INTO v_user_id FROM users WHERE m_number = p_m_number AND user_type = p_user_type LIMIT 1;
    
    IF v_user_id IS NULL THEN
        SET p_status = 'false';
        SET p_message = 'User not found';
        SET p_points = 0;
    ELSE
        -- Check if QR code exists and not scanned
        SELECT id, points, is_scanned INTO v_qr_id, v_qr_points, v_already_scanned
        FROM qr_codes 
        WHERE code = p_qr_code LIMIT 1;
        
        IF v_qr_id IS NULL THEN
            SET p_status = 'false';
            SET p_message = 'Invalid QR code';
            SET p_points = 0;
        ELSEIF v_already_scanned = 1 THEN
            SET p_status = 'false';
            SET p_message = 'QR code already scanned';
            SET p_points = 0;
        ELSE
            -- Check if user already scanned this QR
            SELECT COUNT(*) INTO v_already_scanned
            FROM qr_scans
            WHERE user_id = v_user_id AND qr_code_id = v_qr_id;
            
            IF v_already_scanned > 0 THEN
                SET p_status = 'false';
                SET p_message = 'You have already scanned this QR code';
                SET p_points = 0;
            ELSE
                -- Award points
                START TRANSACTION;
                
                -- Mark QR as scanned
                UPDATE qr_codes 
                SET is_scanned = 1, scanned_by = v_user_id, scanned_at = NOW()
                WHERE id = v_qr_id;
                
                -- Add points to user
                UPDATE users 
                SET points = points + v_qr_points
                WHERE id = v_user_id;
                
                -- Record scan
                INSERT INTO qr_scans (qr_code_id, user_id, points_awarded)
                VALUES (v_qr_id, v_user_id, v_qr_points);
                
                COMMIT;
                
                SET p_status = 'true';
                SET p_message = 'QR Scanned Successfully';
                SET p_points = v_qr_points;
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `role` enum('admin') DEFAULT 'admin',
  `status` tinyint(4) DEFAULT 1 COMMENT '1=Active, 0=Inactive',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `role`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(3, 'adminn', 'admin@anocab.com', 'admin123', 'Admin', 'User', 'admin', 1, '2025-12-13 03:02:30', '2025-12-12 18:18:04', '2025-12-13 03:02:30'),
(4, 'admin', 'admin@gmail.com', 'asd123', 'Admin', 'User', 'admin', 1, '2026-01-24 03:46:26', '2025-12-12 18:20:56', '2026-01-24 03:46:26');

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `img` varchar(500) DEFAULT NULL COMMENT 'Image URL',
  `type` tinyint(4) DEFAULT 1 COMMENT '1=News, 2=Blog, 3=Event',
  `status` tinyint(4) DEFAULT 1 COMMENT '1=Published, 0=Draft',
  `views` int(11) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL COMMENT 'Admin ID',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blogs`
--

INSERT INTO `blogs` (`id`, `title`, `description`, `img`, `type`, `status`, `views`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'New Offer!', 'now get things on very less price', 'http://localhost:5000/writable/uploads/img-1766027733345-939235193.jpg', 2, 1, 0, 4, '2025-12-18 03:15:33', '2025-12-18 03:15:33'),
(2, 'Crishmas discount offer', 'product discount offer product discount offer', 'http://localhost:5000/writable/uploads/img-1766162703738-673317766.png', 1, 1, 0, 4, '2025-12-19 16:45:04', '2025-12-19 16:45:04');

-- --------------------------------------------------------

--
-- Table structure for table `calculator_data`
--

CREATE TABLE `calculator_data` (
  `id` int(11) NOT NULL,
  `category` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` decimal(15,4) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `catalog`
--

CREATE TABLE `catalog` (
  `id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `link` varchar(500) NOT NULL COMMENT 'PDF/document URL',
  `file_type` varchar(50) DEFAULT 'pdf' COMMENT 'pdf, doc, etc.',
  `file_size` bigint(20) DEFAULT NULL COMMENT 'File size in bytes',
  `status` tinyint(4) DEFAULT 1 COMMENT '1=Active, 0=Inactive',
  `created_by` int(11) DEFAULT NULL COMMENT 'Admin ID',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int(11) NOT NULL,
  `order_id` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL,
  `redeem_transaction_id` int(11) DEFAULT NULL COMMENT 'Linked redeem transaction',
  `amount` decimal(10,2) NOT NULL,
  `subwallet_guid` varchar(255) DEFAULT NULL,
  `beneficiary_phone_no` varchar(20) NOT NULL,
  `checksum` varchar(500) DEFAULT NULL,
  `merchant_key` varchar(255) DEFAULT NULL,
  `status` enum('pending','success','failed','cancelled') DEFAULT 'pending',
  `gateway_response` text DEFAULT NULL COMMENT 'Full response from payment gateway',
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qr_codes`
--

CREATE TABLE `qr_codes` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL COMMENT 'QR code string',
  `product` text NOT NULL,
  `details` text NOT NULL,
  `points` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Points awarded for scanning',
  `is_scanned` tinyint(4) DEFAULT 0 COMMENT '0=Not scanned, 1=Scanned',
  `scanned_by` int(11) DEFAULT NULL COMMENT 'User ID who scanned it',
  `scanned_at` timestamp NULL DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL COMMENT 'Admin ID who created this QR code',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'Optional expiration date'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `qr_codes`
--

INSERT INTO `qr_codes` (`id`, `code`, `product`, `details`, `points`, `is_scanned`, `scanned_by`, `scanned_at`, `created_by`, `created_at`, `expires_at`) VALUES
(1, 'QR-1765763602641-GXGDAZBRU', 'orange', 'this is a fruit', 0.20, 0, NULL, NULL, 4, '2025-12-15 01:53:22', '2025-12-16 18:30:00'),
(2, 'QR-1765764159346-0-U4MJ4TUVJ', 'banana', 'this is a fruit ', 0.20, 0, NULL, NULL, 4, '2025-12-15 02:02:39', '2025-12-17 18:30:00'),
(3, 'QR-1765764159346-1-6HDNV2GYA', 'banana', 'this is a fruit ', 0.20, 0, NULL, NULL, 4, '2025-12-15 02:02:39', '2025-12-17 18:30:00'),
(4, 'QR-1765764159346-2-ZBUSB4SVH', 'banana', 'this is a fruit ', 0.20, 0, NULL, NULL, 4, '2025-12-15 02:02:39', '2025-12-17 18:30:00'),
(5, 'QR-1765764159346-3-4MV83UFXY', 'banana', 'this is a fruit ', 0.20, 0, NULL, NULL, 4, '2025-12-15 02:02:39', '2025-12-17 18:30:00'),
(6, 'QR-1765764159346-4-JPSC6NI80', 'banana', 'this is a fruit ', 0.20, 0, NULL, NULL, 4, '2025-12-15 02:02:39', '2025-12-17 18:30:00'),
(7, 'QR-1765764503808-0-LESSQOLS4', 'apple', 'this is a fruit', 1.00, 0, NULL, NULL, 4, '2025-12-15 02:08:23', '2025-12-18 18:30:00'),
(8, 'QR-1765764503809-1-4C23X8YN7', 'apple', 'this is a fruit', 1.00, 0, NULL, NULL, 4, '2025-12-15 02:08:23', '2025-12-18 18:30:00'),
(9, 'QR-1765764503809-2-GN63T7HYA', 'apple', 'this is a fruit', 1.00, 0, NULL, NULL, 4, '2025-12-15 02:08:23', '2025-12-18 18:30:00'),
(10, 'QR-1766162906933-0-0ZAF6WZ48', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:48:26', '2025-12-19 18:30:00'),
(11, 'QR-1766162906933-1-C1SB2RU9K', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:48:26', '2025-12-19 18:30:00'),
(12, 'QR-1766162906933-2-175OK1KLE', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:48:26', '2025-12-19 18:30:00'),
(13, 'QR-1766162906933-3-TROFTC15N', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:48:26', '2025-12-19 18:30:00'),
(14, 'QR-1766162906933-4-QZ6VP2LV1', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:48:26', '2025-12-19 18:30:00'),
(15, 'QR-1766162906933-5-3L2HJZV9S', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:48:26', '2025-12-19 18:30:00'),
(16, 'QR-1766162906933-6-SIO879H09', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:48:26', '2025-12-19 18:30:00'),
(17, 'QR-1766162906933-7-HZOVOL9AR', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:48:26', '2025-12-19 18:30:00'),
(18, 'QR-1766162906933-8-JIDFBT6X9', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:48:26', '2025-12-19 18:30:00'),
(19, 'QR-1766162906933-9-R189U7VOX', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:48:26', '2025-12-19 18:30:00'),
(20, 'QR-1766162946805-0-4QEOZ2ITY', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:49:06', '2025-12-19 18:30:00'),
(21, 'QR-1766162946805-1-VXKZZAS6Q', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:49:06', '2025-12-19 18:30:00'),
(22, 'QR-1766162946805-2-3O24EJ1R0', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:49:06', '2025-12-19 18:30:00'),
(23, 'QR-1766162946806-3-0YJNP330Z', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:49:06', '2025-12-19 18:30:00'),
(24, 'QR-1766162946806-4-A7EQ492K7', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:49:06', '2025-12-19 18:30:00'),
(25, 'QR-1766162946806-5-AJ6LGSMFX', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:49:06', '2025-12-19 18:30:00'),
(26, 'QR-1766162946806-6-I0489UNHF', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:49:06', '2025-12-19 18:30:00'),
(27, 'QR-1766162946806-7-04IBJR181', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:49:06', '2025-12-19 18:30:00'),
(28, 'QR-1766162946806-8-AJLVN35A0', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:49:06', '2025-12-19 18:30:00'),
(29, 'QR-1766162946806-9-B0MNRN5VX', 'AB Cable', 'Cable wire', 3.00, 0, NULL, NULL, 4, '2025-12-19 16:49:06', '2025-12-19 18:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `qr_scans`
--

CREATE TABLE `qr_scans` (
  `id` int(11) NOT NULL,
  `qr_code_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `points_awarded` decimal(10,2) NOT NULL DEFAULT 0.00,
  `scanned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `qr_scans`
--
DELIMITER $$
CREATE TRIGGER `trg_after_qr_scan` AFTER INSERT ON `qr_scans` FOR EACH ROW BEGIN
    UPDATE users 
    SET points = points + NEW.points_awarded
    WHERE id = NEW.user_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `redeem_transactions`
--

CREATE TABLE `redeem_transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL COMMENT 'Amount redeemed',
  `order_id` varchar(100) NOT NULL COMMENT 'Unique order ID (e.g., ACAB1234567890)',
  `status` enum('pending','processing','completed','failed','cancelled') DEFAULT 'pending',
  `payment_status` varchar(50) DEFAULT NULL COMMENT 'Payment gateway status',
  `checksum` varchar(500) DEFAULT NULL COMMENT 'Payment checksum hash',
  `remarks` text DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL COMMENT 'Admin ID who processed',
  `processed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `userID` int(11) NOT NULL COMMENT 'External user ID',
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `dob` date DEFAULT NULL,
  `m_number` varchar(20) NOT NULL COMMENT 'Mobile number (10 digits)',
  `gender` enum('Male','Female','Other') DEFAULT 'Male',
  `user_type` enum('regular_user','electrician','dealer') DEFAULT 'regular_user',
  `country_code` int(11) DEFAULT 91,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL COMMENT 'Hashed password',
  `city` varchar(255) DEFAULT NULL COMMENT 'City name',
  `status` tinyint(4) DEFAULT 0 COMMENT '0=Active, 1=Inactive, 2=Suspended',
  `points` decimal(10,2) DEFAULT 0.00 COMMENT 'User points/balance',
  `address` text DEFAULT NULL COMMENT 'For electricians and dealers',
  `pin_code` varchar(10) DEFAULT NULL COMMENT 'For electricians and dealers',
  `brand` varchar(100) DEFAULT NULL COMMENT 'For electricians only',
  `electrician_mobile` varchar(20) DEFAULT NULL COMMENT 'Additional mobile for electricians',
  `godown` varchar(255) DEFAULT NULL COMMENT 'For dealers only',
  `contact_person` varchar(255) DEFAULT NULL COMMENT 'For dealers only',
  `dealer_mobile` varchar(20) DEFAULT NULL COMMENT 'Additional mobile for dealers',
  `remark` text DEFAULT NULL COMMENT 'For dealers only',
  `created_by` int(11) DEFAULT NULL COMMENT 'Admin ID who created this user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL COMMENT 'Admin ID who last updated',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `userID`, `first_name`, `last_name`, `dob`, `m_number`, `gender`, `user_type`, `country_code`, `email`, `password`, `city`, `status`, `points`, `address`, `pin_code`, `brand`, `electrician_mobile`, `godown`, `contact_person`, `dealer_mobile`, `remark`, `created_by`, `created_at`, `updated_by`, `updated_at`) VALUES
(1, 1, 'shivam', 'sah', '2005-10-21', '9508570649', 'Male', 'regular_user', 91, 'shivam@gmail.com', '$2y$10$fHbgUeHMzET/m/WgnP7nb.aWNa6QfxV17J73DCF3pWV73iGfRHP..', 'jabalpur', 0, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-15 02:58:52', NULL, '2025-12-15 02:58:52'),
(2, 2, 'saim', 'dev', '2007-12-11', '9508570246', 'Male', 'electrician', 91, 'shivamm@gmail.com', '$2y$10$IuziaNJEKfWWZo6ETNiB4urKG1Edul7VBKjEkk0XV10AWuchYLvyK', 'bhopal', 0, 0.00, 'jabalpur,mahadhya pradesh', '482003', 'apple', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-15 03:18:00', NULL, '2025-12-15 03:18:00'),
(3, 3, 'suresh', 'upadhyay', '1995-12-23', '9999999991', 'Male', 'electrician', 91, 'suresh@gmail.com', '$2y$10$ceIZLhTjPOXP8EMWGgdlxO3nMx7JnZoOxYLiPr.W/7GTG0AJ.cAee', 'jabalpur', 0, 0.00, 'bhopal', '500049', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 02:37:35', NULL, '2025-12-18 02:37:35'),
(4, 4, 'raju', 'singh', '1999-11-03', '9999999992', 'Male', 'dealer', 91, 'raju@gmail.com', '$2y$10$x2MhMhl2FW1o4AZ7QlTf4uZTQfzdKZGqEtXUa.UZOTaE6o3yhxP7O', 'katani', 0, 0.00, 'katani,jabalpur', '451002', NULL, NULL, 'ilari', '9999999992', NULL, 'khush raho', NULL, '2025-12-18 02:45:22', NULL, '2025-12-18 02:45:22'),
(5, 5, 'ashish', 'tiwari', '2003-12-19', '9508570849', 'Male', 'electrician', 91, 'ashishu703@gmail.com', '$2y$10$csCZkEVZ.Rt2iLkaPQwKzeAFVX5J3bHWIcC1zwK.49zytCDsHQXfO', 'jabalpur', 0, 0.00, 'jharkhand,garhwa', '822120', 'refrigerator mechnic', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-19 16:38:05', NULL, '2025-12-19 16:38:05');

-- --------------------------------------------------------

--
-- Table structure for table `point_value_settings`
--

CREATE TABLE `point_value_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `points` int(11) NOT NULL COMMENT 'e.g., 10',
  `rupees` decimal(10,2) NOT NULL COMMENT 'e.g., 1.00',
  `is_active` tinyint(4) DEFAULT 1 COMMENT '1=Active, 0=Inactive',
  `created_by` int(11) DEFAULT NULL COMMENT 'Admin ID',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_dealers_by_city`
-- (See below for the actual view)
--
CREATE TABLE `vw_dealers_by_city` (
`id` int(11)
,`userID` int(11)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`m_number` varchar(20)
,`dealer_mobile` varchar(20)
,`email` varchar(255)
,`city` varchar(255)
,`address` text
,`pin_code` varchar(10)
,`godown` varchar(255)
,`contact_person` varchar(255)
,`remark` text
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_electricians_by_city`
-- (See below for the actual view)
--
CREATE TABLE `vw_electricians_by_city` (
`id` int(11)
,`userID` int(11)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`m_number` varchar(20)
,`electrician_mobile` varchar(20)
,`email` varchar(255)
,`city` varchar(255)
,`address` text
,`pin_code` varchar(10)
,`brand` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_qr_scan_history`
-- (See below for the actual view)
--
CREATE TABLE `vw_qr_scan_history` (
`id` int(11)
,`user_id` int(11)
,`m_number` varchar(20)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`code` varchar(255)
,`qr_points` decimal(10,2)
,`points_awarded` decimal(10,2)
,`scanned_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_user_details`
-- (See below for the actual view)
--
CREATE TABLE `vw_user_details` (
`id` int(11)
,`userID` int(11)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`dob` date
,`m_number` varchar(20)
,`gender` enum('Male','Female','Other')
,`user_type` enum('regular_user','electrician','dealer')
,`user_type_name` varchar(12)
,`email` varchar(255)
,`city` varchar(255)
,`points` decimal(10,2)
,`status` tinyint(4)
,`address` text
,`pin_code` varchar(10)
,`brand` varchar(100)
,`electrician_mobile` varchar(20)
,`godown` varchar(255)
,`contact_person` varchar(255)
,`dealer_mobile` varchar(20)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_user_redeemable_amount`
-- (See below for the actual view)
--
CREATE TABLE `vw_user_redeemable_amount` (
`id` int(11)
,`userID` int(11)
,`m_number` varchar(20)
,`total_points` decimal(10,2)
,`redeemed_amount` decimal(32,2)
,`redeemable_amount` decimal(33,2)
);

-- --------------------------------------------------------

--
-- Structure for view `vw_dealers_by_city`
--
DROP TABLE IF EXISTS `vw_dealers_by_city`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_dealers_by_city`  AS SELECT `u`.`id` AS `id`, `u`.`userID` AS `userID`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `u`.`m_number` AS `m_number`, `u`.`dealer_mobile` AS `dealer_mobile`, `u`.`email` AS `email`, `u`.`city` AS `city`, `u`.`address` AS `address`, `u`.`pin_code` AS `pin_code`, `u`.`godown` AS `godown`, `u`.`contact_person` AS `contact_person`, `u`.`remark` AS `remark` FROM `users` AS `u` WHERE `u`.`user_type` = 'dealer' AND `u`.`status` = 0 ;

-- --------------------------------------------------------

--
-- Structure for view `vw_electricians_by_city`
--
DROP TABLE IF EXISTS `vw_electricians_by_city`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_electricians_by_city`  AS SELECT `u`.`id` AS `id`, `u`.`userID` AS `userID`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `u`.`m_number` AS `m_number`, `u`.`electrician_mobile` AS `electrician_mobile`, `u`.`email` AS `email`, `u`.`city` AS `city`, `u`.`address` AS `address`, `u`.`pin_code` AS `pin_code`, `u`.`brand` AS `brand` FROM `users` AS `u` WHERE `u`.`user_type` = 'electrician' AND `u`.`status` = 0 ;

-- --------------------------------------------------------

--
-- Structure for view `vw_qr_scan_history`
--
DROP TABLE IF EXISTS `vw_qr_scan_history`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_qr_scan_history`  AS SELECT `qs`.`id` AS `id`, `qs`.`user_id` AS `user_id`, `u`.`m_number` AS `m_number`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `qc`.`code` AS `code`, `qc`.`points` AS `qr_points`, `qs`.`points_awarded` AS `points_awarded`, `qs`.`scanned_at` AS `scanned_at` FROM ((`qr_scans` `qs` join `users` `u` on(`qs`.`user_id` = `u`.`id`)) join `qr_codes` `qc` on(`qs`.`qr_code_id` = `qc`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `vw_user_details`
--
DROP TABLE IF EXISTS `vw_user_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_user_details`  AS SELECT `u`.`id` AS `id`, `u`.`userID` AS `userID`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `u`.`dob` AS `dob`, `u`.`m_number` AS `m_number`, `u`.`gender` AS `gender`, `u`.`user_type` AS `user_type`, CASE `u`.`user_type` WHEN 'regular_user' THEN 'Regular User' WHEN 'electrician' THEN 'Electrician' WHEN 'dealer' THEN 'Dealer' END AS `user_type_name`, `u`.`email` AS `email`, `u`.`city` AS `city`, `u`.`points` AS `points`, `u`.`status` AS `status`, `u`.`address` AS `address`, `u`.`pin_code` AS `pin_code`, `u`.`brand` AS `brand`, `u`.`electrician_mobile` AS `electrician_mobile`, `u`.`godown` AS `godown`, `u`.`contact_person` AS `contact_person`, `u`.`dealer_mobile` AS `dealer_mobile`, `u`.`created_at` AS `created_at`, `u`.`updated_at` AS `updated_at` FROM `users` AS `u` ;

-- --------------------------------------------------------

--
-- Structure for view `vw_user_redeemable_amount`
--
DROP TABLE IF EXISTS `vw_user_redeemable_amount`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_user_redeemable_amount`  AS SELECT `u`.`id` AS `id`, `u`.`userID` AS `userID`, `u`.`m_number` AS `m_number`, `u`.`points` AS `total_points`, coalesce(sum(`rt`.`amount`),0) AS `redeemed_amount`, `u`.`points`- coalesce(sum(`rt`.`amount`),0) AS `redeemable_amount` FROM (`users` `u` left join `redeem_transactions` `rt` on(`u`.`id` = `rt`.`user_id` and `rt`.`status` = 'completed')) GROUP BY `u`.`id`, `u`.`userID`, `u`.`m_number`, `u`.`points` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `calculator_data`
--
ALTER TABLE `calculator_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `catalog`
--
ALTER TABLE `catalog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `redeem_transaction_id` (`redeem_transaction_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `qr_codes`
--
ALTER TABLE `qr_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_is_scanned` (`is_scanned`),
  ADD KEY `idx_scanned_by` (`scanned_by`);

--
-- Indexes for table `qr_scans`
--
ALTER TABLE `qr_scans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_qr` (`user_id`,`qr_code_id`) COMMENT 'Prevent duplicate scans',
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_qr_code_id` (`qr_code_id`),
  ADD KEY `idx_scanned_at` (`scanned_at`);

--
-- Indexes for table `redeem_transactions`
--
ALTER TABLE `redeem_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userID` (`userID`),
  ADD UNIQUE KEY `m_number` (`m_number`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_m_number` (`m_number`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_city` (`city`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_electrician_mobile` (`electrician_mobile`),
  ADD KEY `idx_dealer_mobile` (`dealer_mobile`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `calculator_data`
--
ALTER TABLE `calculator_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `catalog`
--
ALTER TABLE `catalog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qr_codes`
--
ALTER TABLE `qr_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `qr_scans`
--
ALTER TABLE `qr_scans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `redeem_transactions`
--
ALTER TABLE `redeem_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `blogs`
--
ALTER TABLE `blogs`
  ADD CONSTRAINT `blogs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `catalog`
--
ALTER TABLE `catalog`
  ADD CONSTRAINT `catalog_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_transactions_ibfk_2` FOREIGN KEY (`redeem_transaction_id`) REFERENCES `redeem_transactions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `qr_codes`
--
ALTER TABLE `qr_codes`
  ADD CONSTRAINT `qr_codes_ibfk_1` FOREIGN KEY (`scanned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `qr_codes_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `qr_scans`
--
ALTER TABLE `qr_scans`
  ADD CONSTRAINT `qr_scans_ibfk_1` FOREIGN KEY (`qr_code_id`) REFERENCES `qr_codes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `qr_scans_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `redeem_transactions`
--
ALTER TABLE `redeem_transactions`
  ADD CONSTRAINT `redeem_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `redeem_transactions_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

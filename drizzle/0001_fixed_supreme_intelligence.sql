CREATE TABLE `lead_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordId` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('aberto','finalizado') NOT NULL DEFAULT 'aberto',
	`category` enum('empresa','individual') NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`companyName` varchar(255),
	`document` varchar(32) NOT NULL,
	`contact` varchar(320) NOT NULL,
	`region` varchar(160) NOT NULL,
	`coursesJson` text NOT NULL,
	`destination` enum('vendas','coordenacao') NOT NULL,
	`companyLogoUrl` text,
	`protocol` varchar(64) NOT NULL,
	`summary` text,
	CONSTRAINT `lead_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `lead_records_recordId_unique` UNIQUE(`recordId`)
);

CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`location` varchar(255) NOT NULL,
	`category` enum('Bikepark','Mountainbike','Skifahren','Laufen','Sonstiges') NOT NULL,
	`notes` text,
	`cost` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bucketItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(100),
	`priority` enum('High','Medium','Low') NOT NULL DEFAULT 'Medium',
	`completed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bucketItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`purchasePrice` int NOT NULL,
	`youthDayPrice` int NOT NULL,
	`adultDayPrice` int NOT NULL,
	`userGroup` enum('Youth','Adult') NOT NULL,
	`visits` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `passes_id` PRIMARY KEY(`id`)
);

CREATE TABLE chat (
	message_id int(11) NOT NULL auto_increment,
    posted_on datetime NOT NULL,
	user_name varchar(30) NOT NULL,
	message varchar(300) NOT NULL,
	color char(7) default '#000000',
	PRIMARY KEY(message_id)
); ENGINE=InnoDB;
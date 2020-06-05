use webcomputing;

create table users ( id INT PRIMARY KEY NOT NULL AUTO_INCREMENT, email VARCHAR(45) NOT NULL UNIQUE, hash VARCHAR(60) NOT NULL );

CREATE TABLE user (email VARCHAR, password VARCHAR, firstname VARCHAR, familyname VARCHAR, gender TINYINT, city VARCHAR, country VARCHAR, primary key(email));

CREATE TABLE loggedinusers (token VARCHAR, email VARCHAR);

CREATE TABLE messages (content VARCHAR, fromemail VARCHAR, toemail VARCHAR);

create table book(
	id serial primary key,
	title varchar(100),
	author varchar(100),
	cover_image text,
	note text,
	date date,
	rating integer
);

select *
from book

INSERT INTO book(title , author , cover_image , note , date , rating , summary) VALUES ($1 , $2 , $3 , $4 , $5 ,$6 , $7)

DELETE FROM book WHERE id = $1

SELECT * FROM book WHERE id = $1

UPDATE book SET note = $1, rating = $2 , summary = $3 WHERE id = $4

SELECT * FROM book WHERE id = $1
create table book(
	id serial primary key,
	title varchar(100),
	author varchar(100),
	cover_image text,
	note text,
	date date,
	rating integer
);



INSERT INTO book(title , author , cover_image , note , date , rating) VALUES ($1 , $2 , $3 , $4 , $5 ,$6)


select *
from book
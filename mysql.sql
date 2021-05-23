DROP TABLE IF EXISTS jobs;

CREATE TABLE IF NOT EXISTS jobs(

    id SERIAL PRIMARY KEY,
    title varchar(255),
    company varchar(255),
    location varchar(255),
    url varchar(255)

);
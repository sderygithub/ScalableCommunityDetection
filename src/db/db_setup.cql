//cqlsh
//scp -r -i ~/.ssh/insight-sebastien.pem /Users/sdery/GitHub/HararyProject/src/db/db_setup.cql namenode:~/graph_data/db_setup.cql

CREATE KEYSPACE playground WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 3};

USE playground;

CREATE TABLE email (id text, date text, time timestamp, fname text, lname text, message text, PRIMARY KEY ((id, date), time), ) WITH CLUSTERING ORDER BY (time DESC);

INSERT INTO email (id, date, time, fname, lname, message) VALUES ('ronak@insightdataengineering.com', '2015-09-01', '2015-09-01 10:03:00', 'Ronak', 'Nathani', 'Welcome to Insight!');
INSERT INTO email (id, date, time, fname, lname, message) VALUES ('ronak@insightdataengineering.com', '2015-09-01', '2015-09-01 12:10:00', 'Ronak', 'Nathani', 'We are sure you will build great things at Insight!');
INSERT INTO email (id, date, time, fname, lname, message) VALUES ('ronak@insightdataengineering.com', '2015-09-03', '2015-09-03 14:23:00', 'Ronak', 'Nathani', 'Very excited to work with you all');
INSERT INTO email (id, date, time, fname, lname, message) VALUES ('austin@insightdataengineering.com', '2015-09-01', '2015-09-01 10:13:00', 'Austin', 'Ouyang', 'Your goal is to become an awesome data engineer at a top tier company');
INSERT INTO email (id, date, time, fname, lname, message) VALUES ('austin@insightdataengineering.com', '2015-09-02', '2015-09-02 09:46:00', 'Austin', 'Ouyang', 'We have happy hours on every Friday!');
INSERT INTO email (id, date, time, fname, lname, message) VALUES ('austin@insightdataengineering.com', '2015-09-01', '2015-09-01 10:13:00', 'Austin', 'Ouyang', 'If you are stuck, ask us or your fellow Fellows.');
INSERT INTO email (id, date, time, fname, lname, message) VALUES ('david@insightdataengineering.com', '2015-09-01', '2015-09-01 11:00:00', 'David', 'Drummond', 'In the next 4 weeks, you will meet data teams from great companies.');

//SELECT * FROM email WHERE id = 'david@insightdataengineering.com' and date='2015-09-01' and time < '2015-09-01 14:00:00';

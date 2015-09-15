import scala.io.Source

for(line <- Source.fromPath("myfile.txt").getLines())
	val tokens = row.split(edgedelimiter).map(_.trim())
	
	INSERT INTO email (id, date, time, fname, lname, message) VALUES ('ronak@insightdataengineering.com', '2015-09-01', '2015-09-01 10:03:00', 'Ronak', 'Nathani', 'Welcome to Insight!');

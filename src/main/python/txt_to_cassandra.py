from cassandra.cluster import Cluster

sessionname = 'playground'

# Setup communication with C* cluster
cluster = Cluster()
session = cluster.connect(sessionname)

# Read edge file and insert into database
filename = "~/graph_data/dblp_ungraph_small.txt"
with open(filename) as txt_f:
	row = txt_f.readline().split(" ")
    session.execute("INSERT INTO cocktails (id, date, source, target) values ({}, ‘{}’, ‘{}’, ‘{}’)".format(row[0],row[1],row[2],row[3]))

session.shutdown();
cluster.shutdown();

#$SPARK_HOME/bin/pyspark --master spark://ip-172-31-14-93:7077
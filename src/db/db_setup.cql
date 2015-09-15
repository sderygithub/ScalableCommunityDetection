//cqlsh
//scp -r -i ~/.ssh/insight-sebastien.pem /Users/sdery/GitHub/HararyProject/src/db/db_setup.cql namenode:~/graph_data/db_setup.cql

CREATE KEYSPACE harary WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 3};

USE harary;

//The second column of in a compound primary key is known as the "clustering column." This is the column that determines the on-disk sort order of data within a partitioning key. Note that last part in italics, because it is important. 
//When you query your Stocks column family (table) by id, all "rows" of column values for that id will be returned, sorted by time. In Cassandra you can only specify order within a partitioning key (and not for your entire table), and your partitioning key is the first key listed in a compound primary key.

// Create yearly first-degree graph table
CREATE TABLE graph (source text, date text, target value, PRIMARY KEY (source, date)) WITH CLUSTERING ORDER BY (date DESC);

// Create yearly community table
CREATE TABLE community (source text, date text, community value, PRIMARY KEY (source, date)) WITH CLUSTERING ORDER BY (date DESC);


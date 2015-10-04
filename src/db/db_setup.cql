/* 
	Need to start Cassandra shell using the cqlsh command
 */

CREATE KEYSPACE harary WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 3};

USE harary;

//The second column of in a compound primary key is known as the "clustering column." This is the column that determines the on-disk sort order of data within a partitioning key. Note that last part in italics, because it is important. 
//When you query your Stocks column family (table) by id, all "rows" of column values for that id will be returned, sorted by time. In Cassandra you can only specify order within a partitioning key (and not for your entire table), and your partitioning key is the first key listed in a compound primary key.


CREATE TABLE graph (source text, 
date text, 
target set<text>, 
community text, 
community_member set<text>, 
node_degree text, PRIMARY KEY (source, date)) WITH CLUSTERING ORDER BY (date DESC);

// Community table
CREATE TABLE node_community_table (source bigint, community bigint, target set<bigint>, PRIMARY KEY (source, community)) WITH CLUSTERING ORDER BY (community DESC);

// author-community-table
CREATE TABLE node_community_table (source bigint, community bigint, target set<bigint>, PRIMARY KEY (source, community)) WITH CLUSTERING ORDER BY (community DESC);

// author-community-table
CREATE TABLE node_community_table (source bigint, community bigint, target set<bigint>, PRIMARY KEY (source, community)) WITH CLUSTERING ORDER BY (community DESC);

// publication-table
// How many publications does author X has
CREATE TABLE publication-table (
author_fullname text, 
pmid bigint, 
doi text, 
journal text,
title text,
abstract text,
keywords set<text>,
year_accepted bigint,
month_accepted bigint,
day_accepted bigint,
author_surname text,
author_givenname text,
PRIMARY KEY (author_fullname, pmid)) WITH CLUSTERING ORDER BY (community DESC);

CREATE TABLE author-publication-table (
author_id bigint, 
doi text,
journal text,
title text,
abstract text,
year_accepted bigint,
month_accepted bigint,
day_accepted bigint
PRIMARY KEY ((author_id), doi, year_accepted)) WITH CLUSTERING ORDER BY (community year_accepted);




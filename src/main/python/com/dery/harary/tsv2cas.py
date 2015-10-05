import com.datastax.spark.connector._
import com.datastax.spark.connector.cql._
import com.datastax.spark.connector.cql.CassandraConnector
from pyspark.sql import SQLContext

import ast

# TSV separated file
delimiter = '\t'

# Input file
filepath = 'hdfs://ec2-54-219-144-56.us-west-1.compute.amazonaws.com:9000/examples/data/pubmed_publication.tsv'

def filter_line(line):
	tokens = line.split(delimiter)
	if len(tokens) < 9:
		return False 
	if tokens[0] == "":
		return False
	if not tokens[4] == "":
		try:
			authors = ast.literal_eval(tokens[4].replace('"',''))
		except:
			return False
		authors = ast.literal_eval(tokens[4].replace('"',''))
		if len(authors) == 0:
			return False
	if not tokens[6] == "":
		date = ast.literal_eval(tokens[6].replace('"',''))
		if date[0] == None or date[1] == None or date[2] == None:
			return False
	return True

def keep_values(line):
	tokens = line.split(delimiter)
	doi = tokens[0]
	journal = tokens[1]
	title = tokens[3]
	authors = ast.literal_eval(tokens[4].replace('"',''))
	date = ast.literal_eval(tokens[6].replace('"',''))
	for a in authors:
		yield (a[0], doi, journal, title, date[2], date[1], date[0])

publications = sc.textFile(filepath).filter(lambda line: filter_line(line))\
	.flatMap(lambda line: keep_values(line))

publications.take(1)

#sql = SQLContext(sc)
#sql.read.format("org.apache.spark.sql.cassandra").load(table="author_publication_table", keyspace="harary")
#srdd = sqlCtx.inferSchema(publications)
#srdd.insertInto("author_publication_table", True)
#publications.saveToCassandra("harary", "author_publication_table", SomeColumns("author", "doi", "journal", "title", "year_accepted", "month_accepted", "day_accepted"));

#outputfile = 'hdfs://ec2-54-219-144-56.us-west-1.compute.amazonaws.com:9000/output/coauthorship_count.txt'
#coauthorship_count.saveAsTextFile(outputfile)


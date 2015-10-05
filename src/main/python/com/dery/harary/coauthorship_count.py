
# TSV separated file
delimiter = '\t'

# Input file
filepath = 'hdfs://ec2-54-219-144-56.us-west-1.compute.amazonaws.com:9000/examples/data/pubmed_coauthors.tsv'

def binome(row):
	row.replace(' ','_').lower()
	tokens = row.split(delimiter)
	return (tokens[0].replace('"','') + delimiter + tokens[1].replace('"',''), (1,1))

# Coauthorship count for pairs of individual
coauthorship_count = sc.textFile(filepath).filter(lambda line: len(line.split(delimiter)) == 3)\
	.map(lambda row: binome(row))\
	.reduceByKey(lambda x,y:x+y)\
	.map(lambda x:(x[1],x[0]))\
	.sortByKey(False) 

def triplify(row):
	names = row[1].split(delimiter)
	return (names[0], row[0])

max_count = coauthorship_count.map(lambda row:triplify(row))\
	.reduceByKey(max)

#bla_tup.saveToCassandra("harary", "node_community_table", SomeColumns("source", "target", "community"));

outputfile = 'hdfs://ec2-54-219-144-56.us-west-1.compute.amazonaws.com:9000/output/coauthorship_count.txt'
coauthorship_count.saveAsTextFile(outputfile)
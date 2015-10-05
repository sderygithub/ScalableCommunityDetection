import csv
import json
import ast
import time

#
#  Note that this code won't survive for large files on typical machines 
# 

# Necessary for large rows
csv.field_size_limit(2147483647)

# Input file
filepath = 'hdfs://ec2-54-219-144-56.us-west-1.compute.amazonaws.com:9000/examples/data/coauthors.tsv'
filepath = './coauthors.tsv'

# Output structure
authors = {}

# Count coauthorship
with open(filepath,'rb') as f:
    reader = csv.reader(f,delimiter='\t', quoting=csv.QUOTE_ALL)
    for row in reader:
		
		# Properties
		source = row[0]
		target = row[1]
		year = row[2]

		# Fill in the details
		if not source in authors:
			authors[source] = {}
		if not target in authors[source]:
			authors[source][target]['count'] = 1
		else
			authors[source][target] = authors[source][target] + 1

# Save to local files
with open('./weighted_coauthors') as outfile:
	json.dump(authors,outfile)

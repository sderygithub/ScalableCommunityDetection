import json
from cassandra.cluster import Cluster

import csv
import json
import ast
import time

# Necessary for large rows
csv.field_size_limit(2147483647)

# Input file
filepath = './pubmed_30.tsv'

# Establish contact with database
cluster = Cluster(contact_points=['54.219.144.56'],)
session = cluster.connect('harary')

with open(filepath,'rb') as f:
        reader = csv.reader(f,delimiter='\t', quoting=csv.QUOTE_ALL)
        for row in reader:
                # Get contributing countries
                doi = row[0].strip()
                journal = row[1].strip()
                title = row[2].strip()
                abstract = row[3].strip()
                
                date = ast.literal_eval(row[6])
                
                yearaccepted = int(date[2])
                monthaccepted = int(date[1])
                dayaccepted = int(date[0])

                # Look for node in database
				community_id = session.execute(
					"""
					INSERT INTO publication_table (doi, journal, title, yearaccepted, monthaccepted, dayaccepted)
					VALUES (%s, %s, %s, %s, %s, %s)
					""",
					(doi,journal,title,yearaccepted,monthaccepted,dayaccepted))


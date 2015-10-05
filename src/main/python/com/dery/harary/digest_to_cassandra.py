import csv
import json
import ast
import time

from cassandra.cluster import Cluster

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
                # Get Primary Key or skip
                doi = row[0].strip()
                if not doi == "":
                	
	                # All entries are necessaryfor our analytics
	                date = ast.literal_eval(row[6])
	                if sum([d == None for d in date]) == 0:
		                yearaccepted = int(date[2])
		                monthaccepted = int(date[1])
		                dayaccepted = int(date[0])

						# Optional properties
		                journal = row[1].strip()
		                title = row[2].strip()
		                abstract = row[3].strip()

		                # Note that you should use %s for all types of arguments, not just strings.
						community_id = session.execute(
							"""
							INSERT INTO yearly_publication_table (doi, journal, title, yearaccepted, monthaccepted, dayaccepted)
							VALUES (%s, %s, %s, %s, %s, %s)
							""",
							(doi,journal,title,yearaccepted,monthaccepted,dayaccepted))


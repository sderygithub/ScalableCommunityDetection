import csv
import json
import ast
import time

from cassandra.cluster import Cluster

import numpy
from pylab import *

# Necessary for large rows
csv.field_size_limit(2147483647)

# Input file
filepath = './pubmed_30.tsv'

# Establish contact with database
cluster = Cluster(contact_points=['54.219.144.56'],)
session = cluster.connect('harary')


def filter_line(tokens):
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

with open(filepath,'r') as f:
	reader = csv.reader(f, delimiter='\t', quoting=csv.QUOTE_ALL)
	for line in reader:
		if filter_line(line):
			doi = line[0]
			journal = line[1]
			title = line[3]
			authors = ast.literal_eval(line[4].replace('"',''))
			date = ast.literal_eval(line[6].replace('"',''))
			for a in authors:
				# Note that you should use %s for all types of arguments, not just strings.
				session.execute(
					"""
					INSERT INTO author_publication_table (doi, journal, title, yearaccepted, monthaccepted, dayaccepted)
					VALUES (%s, %s, %s, %s, %s, %s)
					""",
					(a[0], doi, journal, title, date[2], date[1], date[0]))


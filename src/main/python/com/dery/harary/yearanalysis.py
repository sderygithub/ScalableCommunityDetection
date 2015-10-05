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

years = range(2010,2014)
months = range(1,13)

monthly = numpy.zeros(shape=(len(years),len(months)))
for year_id in range(len(years)):
	for month in months:
		year = years[year_id]
		print 'SD> Year: %s, Month %s' % (year,month)
		# Note that you should use %s for all types of arguments, not just strings.
		rows = session.execute(
			"""
			SELECT COUNT(*) FROM yearly_publication_table WHERE yearaccepted = %s AND monthaccepted = %s ALLOW FILTERING;
			""",
			(year,month))
		monthly[year_id][month-1] = rows[0].count

	avg = monthly[year_id][:].mean(1)
	monthly[year_id][:] = monthly[year_id][:] - avg


avg = monthly.mean(0)


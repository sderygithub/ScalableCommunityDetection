import happybase

import imp
import happybase

from flask import Flask
from flask import render_template
from flask import request
app = Flask(__name__)
from cassandra.cluster import Cluster


@app.route("/")
def hello():
	return "Hello world!"

@app.route("/hbase/")
def hbase_test():
	# Cassandra uses 7000 for cluster communication 
	# (7001 if SSL is enabled)
	# 9160 for Thrift clients
	# 9042 for native protocol clients
	# and 7199 for JMX. 
	#connection = happybase.Connection(host='54.219.144.56', port=9160)
	#my_table = connection.table('gtest')
	#key6 = my_table.row(6)
	#return key6['target']

	cluster = Cluster()
	session = cluster.connect('demo')

if __name__ == "__main__":
    app.run(debug=True)
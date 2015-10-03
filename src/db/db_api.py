import happybase
import json
import imp

from flask import Flask
from flask import render_template
from flask import request

app = Flask(__name__)
from cassandra.cluster import Cluster


@app.route("/")
def hello():
	return "Hello world!"

@app.route("/largegraph/")
def graph_site():
	return render_template('largegraph.html')

@app.route("/hbase/")
def hbase_test():
	# Establish contact with database
	cluster = Cluster(contact_points=['54.219.144.56'],)
	session = cluster.connect('harary')
	result = session.execute("SELECT * FROM gtest")

	# Empty result scenario
	if result == None:
		return  {}

	# In extreme case, we force a drastic truncation
	if len(result) > 200000:
		print "SD> WARN: Excessive number of node (%i). Something is probably wrong.." % len(result)
		result = result[0:1000]

	node_index = 0
	edge_index = 0

		# Allocate enough for a typical number of supported community
	expected_number_of_nodes = 1000
	edges = [{'source':0, 'target':0} for k in range(expected_number_of_nodes * expected_number_of_nodes)]
	nodes = [{'index':0, 'community':0, 'x':0, 'y':0, 'size':10} for k in range(expected_number_of_nodes)]

	# Add all nodes
	for node in result:
		nodes[node_index]['index'] = node.source
		nodes[node_index]['community'] = node.community
		node_index = node_index + 1
		if node.target != None:
			# Add all edges
			for target in node.target:
				edges[edge_index]['source'] = node.source
				edges[edge_index]['target'] = target
				edge_index = edge_index + 1

	# Truncate excess
	nodes = nodes[0:node_index]
	edges = edges[0:edge_index]

	#with open("/Users/sdery/GitHub/HararyProject/website/static/graphs/dblp.json", 'w') as outfile:
	#	json.dump({'nodes': nodes, 'links': edges}, outfile)

	# Return json string
	return json.dumps({'nodes': nodes, 'links': edges})

if __name__ == "__main__":
    app.run(debug=True)

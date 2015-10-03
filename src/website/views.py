import json
import imp
import random

import numpy as np
import networkx as nx
from networkx.readwrite import json_graph
from scipy import sparse
import community

from flask import Flask
from flask import render_template
from flask import request
app = Flask(__name__)

from cassandra.cluster import Cluster

@app.route("/")
def hello():
	return render_template('index.html')

@app.route("/slides/")
def slides():
	return render_template('slides.html')

@app.route("/graphviz/")
def other_graph_site():
	return render_template('graphviz.html')

@app.route("/countryheatmap/")
def countryheatmap():
	# Read hard-coded world topology 
	wt_file = open('./static/data/world-topo-min.json','r')
	wt_json = json.load(wt_file)
	r = lambda: random.randint(0,9)
	# Fill in the color based on proper intensity map
	for geo in wt_json['objects']['countries']['geometries']:
		name = geo['properties']['name']
		geo['properties']['color'] = "#%i%i%i%i%i%i" % (r(),r(),r(),r(),r(),r())
	# Return json string
	return json.dumps(wt_json)

###############################
#   Attribute Panel Queries   #
###############################
@app.route("/community_properties/", methods=['POST', 'GET'])
def community_properties():
	default_return = [
						{'success': False },
						{'label': 'Number of Individuals', 'value': 0},
						{'label': 'Number of Citations', 'value': 0}, 
					 ]
	
	default_return[0]['success'] = True;
	for field_id in range(1,len(default_return)):
		default_return[field_id]['value'] = np.ceil(random.random() * 100);

	return json.dumps(default_return)
	
@app.route("/node_graph_properties/", methods=['POST', 'GET'])
def node_graph_properties():
	# Default return value
	default_return = [
						{'success': False },
						{'label': 'Degree', 'value': 0},
						{'label': 'Betweenness', 'value': 0},
						{'label': 'Closeness', 'value': 0},
						{'label': 'Page Rank', 'value': 0},
						{'label': 'Katz Centrality', 'value': 0},
					 ]

	default_return[0]['success'] = True;
	for field_id in range(1,len(default_return)):
		default_return[field_id]['value'] = np.ceil(random.random() * 100);

	return json.dumps(default_return)

@app.route("/node_salience_properties/", methods=['POST', 'GET'])
def node_salience_properties():
	# Default return value
	default_return = [
						{'success': False },
						{'label': 'Number of Publications', 'value': 0},
					  	{'label': 'Number of Individuals', 'value': 0},
					  	{'label': 'Number of Citations', 'value': 0}, 
					 ]
	
	default_return[0]['success'] = True;
	for field_id in range(1,len(default_return)):
		default_return[field_id]['value'] = np.ceil(random.random() * 100);

	return json.dumps(default_return)



@app.route("/community_graph_dummy/")
def community_graph():
	# Default return value
	default_return = {'nodes': [], 'edges': []}
	# Create a hundred dummy nodes for testing with sparse connections
	expected_number_of_nodes = 100
	t = sparse.csr_matrix(sparse.rand(expected_number_of_nodes,expected_number_of_nodes,0.01))
	# Node data
	nodes = [{'id':str(k), 'index':str(k), 'label':str(k), 'betweenness': random.random(), 'community':k, 'x':0, 'y':0, 'size':random.random() * 50} for k in range(expected_number_of_nodes)]
	# Sigma.js 
	#edges = [{'id': '0', 'source':'0', 'target':'0'} for k in range(expected_number_of_nodes * expected_number_of_nodes)]
	# D3
	edges = [{'source':100, 'target':1000, 'id': 0} for k in range(expected_number_of_nodes * expected_number_of_nodes)]
	# Not very pretty, but does the job..
	index = 0
	for x in range(expected_number_of_nodes):
		for y in range(expected_number_of_nodes):
			if t[x,y] != 0:
				edges[index]['id'] = index
				edges[index]['source'] = x
				edges[index]['target'] = y
				index = index + 1
	# Truncate excess
	edges = edges[0:index]
	# Return json formated graph
	return json.dumps({'nodes': nodes, 'edges': edges})


@app.route("/graph_analytics/")
def graph_analytics():
	# Default return value
	default_return = {'nodes': [], 'edges': []}

	# Establish contact with database
	cluster = Cluster(contact_points=['54.219.144.56'],)
	session = cluster.connect('harary')

	# Look for node in database
	communities = session.execute("SELECT community FROM community_table")
	if len(community) == 0:
		print "SD> WARN: Could not find any community in database"
		return default_return

	return default_return


@app.route("/hbase/", methods=['POST', 'GET'])
def hbase_test():

	# Default return value
	default_return = {'nodes': [], 'edges': []}

	# Input sanity checks
	search = request.args.get('search', '')
	if search == None or search == "":
		print "SD> WARN: Search query is empty"
		return default_return
	elif isinstance(search, str):
		if search.isdigit():
			search = int(search)
		else:
			print "SD> WARN: Search should be a digit"
			return default_return

	search_str = str(search)
	# Establish contact with database
	cluster = Cluster(contact_points=['54.219.144.56'],)
	session = cluster.connect('harary')

	# Look for node in database
	community_id = session.execute("SELECT community FROM node_community_table WHERE source = " + search_str)
	if len(community_id) == 0:
		print "SD> WARN: Could not find node " + search_str + " in database"
		return default_return

	community_str = str(community_id[0].community)
	print "SD> INFO: Node " + search_str + " was found in database with community " + community_str

	# Search for community members
	print "SD> INFO: Executing query: " + "SELECT * FROM node_community_table WHERE community = " + community_str + " ALLOW FILTERING"
	result = session.execute("SELECT * FROM node_community_table WHERE community = " + community_str + " ALLOW FILTERING;")
	print "SD> INFO: Query result: " + str(len(result)) + " members were found for community " + community_str

	# Empty result scenario
	if len(result) == 0:
		return default_return

	# Extreme cases are truncated for practicality
	max_number_of_nodes = 2000
	if len(result) > max_number_of_nodes:
		print "SD> WARN: Excessive number of node (%i). Something is probably wrong.." % len(result)
		result = result[0:max_number_of_nodes]

	node_index = 0
	edge_index = 0

	# Allocate the number of nodes
	expected_number_of_nodes = len(result)
	nodes = [{'id': '0', 'index':'0', 'label':'', 'community':0, 'x':0, 'y':0, 'size':10} for k in range(expected_number_of_nodes)]

	# Sigma.js
	# edges = [{'id': '0', 'source':'0', 'target':'0'} for k in range(expected_number_of_nodes * expected_number_of_nodes)]
	# D3
	edges = [{'source':100, 'target':1000, 'id': 0} for k in range(expected_number_of_nodes * expected_number_of_nodes)]
	
	# Filter for visualization
	def filter(x): return len(x.target) < 50

	# Map ID to linear range for D3
	keys = [r.source for r in result if filter(r)]
	values = range(len(keys))
	dictionary = dict(zip(keys, values))

	# Add all nodes
	for node in result:
		if filter(node):
			nodes[node_index]['id'] = str(dictionary[node.source])
			nodes[node_index]['index'] = str(node.source)
			nodes[node_index]['community'] = node.community
			nodes[node_index]['label'] = "Node: " + str(node.source)
			nodes[node_index]['x'] = random.random()
			nodes[node_index]['y'] = random.random()
			node_index = node_index + 1
			if node.target != None:
				# Add all edges
				for target in node.target:
					if target in keys:
						edges[edge_index]['source'] = dictionary[node.source]
						edges[edge_index]['target'] = dictionary[target]
						edges[edge_index]['id'] = str(edge_index)
						edge_index = edge_index + 1

	# Truncate excess
	nodes = nodes[0:node_index]
	edges = edges[0:edge_index]

	# Build graph from json
	G = json_graph.node_link_graph({'nodes': nodes, 'links': edges},False,True)
	DiG = nx.DiGraph(G)
	G = nx.Graph(G)
	
	# On the fly computation of properties on manageable sizes
	bet_cen = nx.betweenness_centrality(G)
	clo_cen = nx.closeness_centrality(G)
	eig_cen = nx.eigenvector_centrality(G)
	pr = nx.pagerank(DiG, alpha=0.9)
	deg = G.degree()
	com = community.best_partition(G)

	for node in nodes:
		node['betweenness'] = bet_cen[node['id']]
		node['closeness'] = clo_cen[node['id']]
		node['eigenvector'] = eig_cen[node['id']]
		node['pagerank'] = pr[node['id']]
		node['degree'] = deg[node['id']]
		node['community'] = com[node['id']]

	# Return json string
	return json.dumps({'nodes': nodes, 'edges': edges})

if __name__ == "__main__":
    app.run(debug=True)

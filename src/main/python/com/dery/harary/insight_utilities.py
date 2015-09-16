import os
import json
import random 

"""
# Converting a tuple text file into a Sigma compatible .json
# Input:	com_dblp_ungraph graph file
# Output: .json file at output_filepath
"""
def com_dblp_ungraph_to_json(filepath):

	# Get filename and such
	drive, path = os.path.splitdrive(filepath)
	path, filename = os.path.split(path)
	filename, ext = os.path.splitext(filename)

	# Initiate structure with rough estimates
	print "SD> Initiating structure"
	nodes = {}
	for i in xrange(600000):
		nodes[str(i)] =  {"id": "", "label": "", "x": 0, "y": 0, "size": 0}

	edges = [0] * 1200000
	for i in xrange(1200000):
		edges[i] =  {"id": "", "source": "", "target": 0}

	# Header goes to waste
	header = [input_file.readline() for x in range(4)]

	# Opening input file
	print "SD> Reading file %s" % filename
	input_file = open(filepath, 'r')

	# Read chunks instead of one line at a time
	chunk_idx = 1
	edge_count = 0
	node_count = 0
	while 1:
		print "SD> Reading chunk %i" % chunk_idx
		lines = input_file.readlines(10000)
		chunk_idx = chunk_idx + 1
		if chunk_idx == 5:
			break;
		if not lines:
			break;
		for line in lines:
			entry = line.rstrip().split("\t")
			
			# Add node
			for node in entry:
				if nodes[node]["size"] == 0:
					nodes[node]["id"] = node
					nodes[node]["label"] = node + "_label"
					nodes[node]["x"] = random.random()
					nodes[node]["y"] = random.random()
					nodes[node]["size"] = 3
					node_count = node_count + 1

			# Add edge
			edges[edge_count]["id"] = str(edge_count)
			edges[edge_count]["source"] = entry[0]
			edges[edge_count]["target"] = entry[1]
			edge_count = edge_count + 1

	# Trim 
	edges = edges[1:edge_count]
	edges = [edge for edge in edges if edge["source"] in nodes]
	edges = [edge for edge in edges if edge["target"] in nodes]
	nodes = [nodes[node] for node in nodes if nodes[node]["size"] > 0]

	print "Number of nodes: %i" % len(nodes) 
	print "Number of edges: %i" % len(edges)

	# Output file
	output_filepath = path + '/' + filename + '.json';
	print "SD> Saving output to %s" % output_filepath
	with open(output_filepath, 'w') as output_file:
		json.dump({"nodes": nodes, "edges": edges}, output_file)

	
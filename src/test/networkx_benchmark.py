import os
import time
import numpy as np
import networkx
import community

cwd = os.getcwd()

#filepath = cwd + '/facebook_combined-trim.txt'; edgedelimiter = " ";
filepath = cwd + '/com-dblp.ungraph-trim.txt'; edgedelimiter = "\t";
#filepath = cwd + '/soc-LiveJournal1-trim.txt'; edgedelimiter = "\t";
#filepath = cwd + '/web-Google-trim.txt'; edgedelimiter = "\t";
#filepath = cwd + '/com-amazon.ungraph-trim.txt';  edgedelimiter = "\t";

proc_start = time.clock()
algo_delta = 0

number_of_iterations = 10

print "SD> ==========================="
print "SD> INFO: NetworkX Benchmarking"
print "SD> ==========================="
print "SD> INFO: Reading file " + filepath + " ..."

with open(filepath, 'rb') as f:

	print "SD> INFO: Creating Networkx Graph..."
	G = NetworkX.edge file(filepath)

	print "SD> INFO: Run community detection algorithm"

	for iter in range(number_of_iterations):
		print iter
		algo_start = time.clock()
		
		# Clauset-Newman-Moore
		# At every step of the algorithm two communities that contribute maximum positive value to global modularity are merged
		C = community.best_partition(G)
		
		algo_stop = time.clock()
		algo_delta = algo_delta + algo_stop - algo_start

f.close()

proc_stop = time.clock()
proc_delta = proc_stop - proc_start

print "SD> INFO: Completed"
print "SD> ==========================="
print "SD> INFO: Results"
print "SD> INFO: Number of nodes: %i" % G.GetNodes()
print "SD> INFO: Number of edges: %i" % G.GetEdges()
print "SD> INFO: Algorithm Time Elapsed: %.5f seconds" % (algo_delta / number_of_iterations)
print "SD> INFO: Process Time Elapsed: %.5f seconds" % proc_delta

print "SD> ==========================="


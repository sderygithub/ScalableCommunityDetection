import os
import time
import numpy as np
import snap

cwd = os.getcwd()



#filepath = cwd + '/facebook_combined-trim.txt'; edgedelimiter = " ";
filepath = cwd + '/com-dblp.ungraph-trim.txt'; edgedelimiter = "\t";
#filepath = cwd + '/soc-LiveJournal1-trim.txt'; edgedelimiter = "\t";
#filepath = cwd + '/web-Google-trim.txt'; edgedelimiter = "\t";
#filepath = cwd + '/com-amazon.ungraph-trim.txt';  edgedelimiter = "\t";

proc_start = time.clock()
algo_delta = 0

print "SD> ==========================="
print "SD> INFO: SNAP Benchmarking"
print "SD> ==========================="
print "SD> INFO: Reading file " + filepath + " ..."
#with open(filepath, 'rb') as f:

print "SD> INFO: Creating Networkx Graph..."
G = snap.LoadEdgeList(snap.PUNGraph, filepath, 0, 1, edgedelimiter)

print "SD> INFO: Run community detection algorithm"

# Compute the required connected components 
CmtyV = snap.TCnComV()

for iter in range(10):
	print iter
	algo_start = time.clock()
	
	# Clauset-Newman-Moore
	# At every step of the algorithm two communities that contribute maximum positive value to global modularity are merged
	C = snap.CommunityCNM(G, CmtyV)
	
	algo_stop = time.clock()
	algo_delta = algo_delta + algo_stop - algo_start

#f.close()

proc_stop = time.clock()
proc_delta = proc_stop - proc_start

#nc = np.max([C[com] for com in C]) + 1

print "SD> INFO: Completed"
print "SD> ==========================="
print "SD> INFO: Results"
print "SD> INFO: Number of nodes: %i" % G.GetNodes()
print "SD> INFO: Number of edges: %i" % G.GetEdges()
print "SD> INFO: Algorithm Time Elapsed: %.5f seconds" % (algo_delta / 10.0)
print "SD> INFO: Process Time Elapsed: %.5f seconds" % proc_delta
#print "SD> INFO: Number of communities: %i " % nc

print "SD> ==========================="


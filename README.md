![alt tag](https://github.com/sderygithub/HararyProject/blob/master/doc/images/header.png)

## Graph Sight ##

####Extracting knowledge through community detection in massively large graphs####

An Insight Data Engineering Demonstration Project 
- by Sebastien Dery

### Overview ###

Networks are all around, with our position and connections within these networks deeply influencing the way we think and act. In what way and how much are hard questions to answer given the size and complexity of our relation with our surrounding. Can we identify sources of influences in specific network? Can we trace their evolution in time? These are example of questions central to this project.

In these 4 weeks, I implemented a decentralized distributed algorithm for community detection for massive networks (e.g. million nodes, billion edges). I further apply this enhanced capacity to the study of scientific communities in Biomedical Research through co-authorship networks.

**- Week 1**: Consider various alternatives for a project among which (Data mining tool of UN resolutions, scalable object recognition in images). Literature review of distributed processing.

**- Week 2**: Decide on graph processing using distributed system. Beginning of prototype and implementation in Scala.

**- Week 3**: Finalize algorithm and test using various graph size. Begin downloading PubMed data for use case scenario.

**- Week 4**: Front-end, interactive display and integration with PubMed data.

The GraphX system is Spark's implementation of the Google Pregel architecture. Essentially every node in a graph can be programmed as if it were executing its own MapReduce program. 
Further information on Spark GraphX can be found here:  [https://amplab.github.io/graphx/]()

### Algorithm ###

The literature is rich in approaches to the clustering problem. For this work, I focused on the concept of modularity; That is to say a higher ratio of internal versus external edges among a specific set of nodes (see following illustration).

![alt tag](https://github.com/sderygithub/HararyProject/blob/master/doc/images/modularity.png)

Optimization of this measure provides an generalizable framework for the discovery of communities using various node measurements.

### BenchMarking ###

Part of this project was devoted to obtaining a better understanding of this algorithm's scalability on a distributed system. To provide qualitative intuition, I further compared similar algorithm implemented in different package on graphs of increasing size.

#### NetworkX ####

#### SNAP ####

### Use Case ###

![alt tag](https://github.com/sderygithub/HararyProject/blob/master/doc/images/pubmed.jpg)



### Results ###
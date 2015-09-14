## Harary Project - Large Scale Community Detection in Graphs ##

An Insight Data Engineering Demonstration Project 
- by Sebastien Dery

### Overview ###

Networks are all around, with our position and connections within these networks deeply influencing the way we think and act. In what way and how much are hard questions to answer given the size and complexity of our relation with our surrounding. Can we identify sources of influences in specific network? Can we trace their evolution in time? These are example of questions central to this project.

In these 4 weeks, I investigated the implementation of a distributed algorithm measuring modularity in large-networks and applied it to Scientific Communities through Co-authorship networks.

The GraphX system is Spark's implementation of the Google Pregel architecture. Essentially every node in a graph can be programmed as if it were executing its own MapReduce program. Further information on Spark GraphX can be found here:  [https://amplab.github.io/graphx/]()



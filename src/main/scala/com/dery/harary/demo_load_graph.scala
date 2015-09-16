package com.dery.harary

import org.apache.spark.SparkContext
import org.apache.spark.SparkContext._
import org.apache.spark.rdd.RDD
import org.apache.spark._
import org.apache.spark.graphx._

/** 
 * Specify eventual command line options and their defaults
 *
 */
case class Config(
    input:String = "",
    output: String = "",
    master:String="local",
    appName:String="graphX analytic",
    jars:String="",
    sparkHome:String="",
    parallelism:Int = -1)

/**
 * Execute the louvain distributed community detection.
 * Requires an edge file and output directory in hdfs (local files for local mode only)
 */
object Main {

  def time[R](block: => R): R = {
    val t0 = System.nanoTime()
    val result = block    // call-by-name
    val t1 = System.nanoTime()
    println("Elapsed time: " + (t1 - t0) * 0.000000001 + " seconds")
    result
  }

  def main(args: Array[String]) {

    println("========================================")
    println("Simple Graph Application")
    println("- by Sebastien Dery")    
    println("========================================")

    var master = "spark://ip-172-31-14-93:7077"
    var jobname = "jobname"
    var sparkhome = "/usr/local/spark"

    var edgedelimiter = "\t"
    var properties:Seq[(String,String)]= Seq.empty[(String,String)]
    var parallelism, minProgress = -1
    var progressCounter = 2
    var ipaddress = false
    var outputdir = "hdfs://ec2-54-67-58-197.us-west-1.compute.amazonaws.com:9000/user/output"

    // Create the spark context
    var sc: SparkContext = null
    val conf = new SparkConf()
                .setAppName("Loading graph")
                .setMaster(master)
                .setSparkHome(sparkhome)   

    //println(s"sparkcontext = new SparkContext($master,$jobname,$sparkhome,$jars)")
    sc = new SparkContext(conf)
    //SparkContext(master,jobname,sparkhome,jars.split(","))

    //val filename = "hdfs://ec2-54-67-58-197.us-west-1.compute.amazonaws.com:9000/user/graph_data/com-dblp.ungraph_cleaned.txt"
    val filename = "hdfs://ec2-54-67-58-197.us-west-1.compute.amazonaws.com:9000/user/graph_data/dblp_ungraph_small.txt"

    println("SD> Loading graph from: " + filename)
    //val graph = GraphLoader.edgeListFile(sc, )

    // Read edges from a local file for testing purposes
    /*
    val edges: RDD[Edge[String]] =
      sc.textFile(filename).map { line =>
        val fields = line.split("\t")
        Edge(fields(0).toLong, fields(1).toLong, "Connected")
      }
    */
    /*
    val inputHashFunc = if (ipaddress) (id:String) => IpAddress.toLong(id) else (id:String) => id.toLong
    var edgeRDD = sc.textFile(filename, 3).map(row=> {
        val tokens = row.split(edgedelimiter).map(_.trim())
        tokens.length match {
          case 2 => {new Edge(inputHashFunc(tokens(0)),inputHashFunc(tokens(1)),1L) }
          case 3 => {new Edge(inputHashFunc(tokens(0)),inputHashFunc(tokens(1)),tokens(2).toLong)}
          case _ => {throw new IllegalArgumentException("SD> Invalid input line: "+row)}
        }
     })  

    // if the parallelism option was set map the input to the correct number of partitions,
    // otherwise parallelism will be based off number of HDFS blocks
    if (parallelism != -1 ) edgeRDD = edgeRDD.coalesce(parallelism,shuffle=true)
  
    val graph = Graph.fromEdges(edgeRDD, None)
  
    println("SD> INFO: Number of edges: " + graph.numEdges);
    println("SD> INFO: Number of vertices: " + graph.numVertices);
    */
  }
}
package com.dery.harary

import org.apache.spark.SparkConf
import org.apache.spark.SparkContext

//import com.datastax.spark.connector._
/*
cp spark-cassandra-connector-assembly-1.4.0-M3-SNAPSHOT.jar ~/hararyproject/lib/spark-cassandra-connector-assembly-1.4.0-M3-SNAPSHOT.jar
spark-submit --class demo_insert --master spark://ip-172-31-28-44:7077 --jars lib/spark-cassandra-connector-assembly-1.4.0-M3-SNAPSHOT.jar target/scala-2.10/hararyproject_2.10-1.0.jar
*/

object demo_insert {
    

    def main(args: Array[String]) {

        println("========================================")
        println("Simple Graph Application")
        println("- by Sebastien Dery")    
        println("========================================")


/*
        var AppName = "DemoInsert"
        var Master = "spark://ip-172-31-14-93:7077"
        //var sparkhome = "/usr/local/spark"

        val conf = new SparkConf(true)
            .setAppName(AppName)
            .setMaster(Master)
            .set("spark.cassandra.connection.native.port", "9042")
            .set("spark.cassandra.connection.rpc.port", "9160")
        
        //.set("spark.cassandra.connection.host", "127.0.0.1")

        val sc = new SparkContext(conf)
*/
        //val rdd = sc.cassandraTable("spark", "try")

        //val file_collect=rdd.collect()

        //file_collect.map(println(_))


        //val myTable = sc.cassandraTable[(Long, String)](“harary, “graph”)
 }
}
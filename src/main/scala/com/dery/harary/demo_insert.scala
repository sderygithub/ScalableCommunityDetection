import org.apache.spark.SparkConf
import org.apache.spark.SparkContext

import com.datastax.spark.connector._           //Imports basic rdd functions
import com.datastax.spark.connector.cql._

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

        var AppName = "DemoInsert"
        var Master = "spark://ip-172-31-28-44:7077"
        //var sparkhome = "/usr/local/spark"

        val conf = new SparkConf(true)
            .setAppName(AppName)
            .setMaster(Master)        

        println("SD> INFO: Initiating Spark Context")
        val sc = new SparkContext(conf)
        println("SD> INFO: Spark Context Initiated")

        println("SD> INFO: Initiating Cassandra Connector")
        val c = CassandraConnector(sc.getConf)
        println("SD> INFO: Cassandra Connector Initiated")

        //source text, date text, target set<text>, community text, community_member set<text>, node_degree text,
        val collection = sc.parallelize(Seq(("1", "1999", Set("24","343"),"2", Set("24"), "2")))
        collection.saveToCassandra("harary", "graph", SomeColumns("source", "date", "target", "community", "community_member", "node_degree"))
 }
}
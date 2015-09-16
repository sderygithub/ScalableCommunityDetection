import org.apache.spark.SparkConf
import org.apache.spark.SparkContext

import com.datastax.spark.connector._

var master = "spark://ip-172-31-14-93:7077"
//var sparkhome = "/usr/local/spark"

val conf = new SparkConf(true)
    .set("spark.cassandra.connection.host", "127.0.0.1").setAppName("DemoInsert").setMaster(master)
    .set("spark.cassandra.connection.native.port", "9042")
    .set("spark.cassandra.connection.rpc.port", "9160")

val sc = new SparkContext(conf)

val rdd = sc.cassandraTable("spark", "try")

val file_collect=rdd.collect()

file_collect.map(println(_))


//val myTable = sc.cassandraTable[(Long, String)](“harary, “graph”)

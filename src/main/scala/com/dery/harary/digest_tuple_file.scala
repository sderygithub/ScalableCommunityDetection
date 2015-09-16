/*import org.apache.spark.SparkConf
import org.apache.spark.SparkContext

import scala.io.Source

/**Configures Spark. */
val conf = new SparkConf(True)
    .set("spark.cassandra.connection.host", CassandraSeed)
    .set("spark.cleaner.ttl", SparkCleanerTtl.toString)
    .setMaster(SparkMaster)
    .setAppName(SparkAppName)

/** Connect to the Spark cluster: */
val sc = new SparkContext(conf);

for(line <- Source.fromPath("myfile.txt").getLines())
	val tokens = row.split(edgedelimiter).map(_.trim())
	INSERT INTO edge (id, source, target) VALUES (tokens(0), tokens(1));
*/
hdfs dfs -copyFromLocal ~/spark-examples/test.txt /user/test.txt

HOSTNAME = hostname

$SPARK_HOME/bin/pyspark --master spark://$HOSTNAME:7077 ~/hararyproject/src/main/python/txt_to_cassandra.py

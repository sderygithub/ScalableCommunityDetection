name := "hararyproject"

version := "1.0"

scalaVersion := "2.10.4"

libraryDependencies += "org.apache.spark" %% "spark-core" % "1.4.1" % "provided"

libraryDependencies += "org.apache.spark" %% "spark-graphx" % "1.4.1"

libraryDependencies += "com.datastax.spark" %% "spark-cassandra-connector" % "1.1.0"
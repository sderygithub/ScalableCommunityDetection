name := "hararyproject"

version := "1.0"

scalaVersion := "2.10.4"

libraryDependencies += "org.apache.spark" %% "spark-core" % "1.4.1" % "provided"

libraryDependencies += "org.apache.spark" %% "spark-graphx" % "1.4.1"

libraryDependencies += "com.datastax.spark" %% "spark-cassandra-connector" % "1.4.0-M3"

libraryDependencies += "com.github.scopt" %% "scopt" % "3.3.0"

resolvers += Resolver.sonatypeRepo("public")
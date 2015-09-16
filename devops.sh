
scp -o "StrictHostKeyChecking no" -i ~/.ssh/insight-sebastien.pem ~/.ssh/insight-sebastien.pem ubuntu@namenode:~/.ssh

sudo apt-get update
sudo apt-get install ssh rsync
ssh-keygen -f ~/.ssh/id_rsa -t rsa -P ""
sudo cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
ssh localhost

cat ~/.ssh/id_rsa.pub | ssh -o "StrictHostKeyChecking no" -i ~/.ssh/*.pem ubuntu@ec2-54-219-144-56.us-west-1.compute.amazonaws.com 'cat >> ~/.ssh/authorized_keys'

sudo apt-get update
sudo apt-get install openjdk-7-jdk

wget http://mirror.symnds.com/software/Apache/hadoop/common/hadoop-2.7.1/hadoop-2.7.1.tar.gz -P ~/Downloads
sudo tar zxvf ~/Downloads/hadoop-*.tar.gz -C /usr/local


cat ~/.ssh/id_rsa.pub | ssh -o "StrictHostKeyChecking no" -i ~/.ssh/*.pem ubuntu@ec2-54-219-169-153.us-west-1.compute.amazonaws.com 'cat >> ~/.ssh/authorized_keys'
cat ~/.ssh/id_rsa.pub | ssh -o "StrictHostKeyChecking no" -i ~/.ssh/*.pem ubuntu@ec2-54-219-169-177.us-west-1.compute.amazonaws.com 'cat >> ~/.ssh/authorized_keys'
cat ~/.ssh/id_rsa.pub | ssh -o "StrictHostKeyChecking no" -i ~/.ssh/*.pem ubuntu@ec2-54-219-169-157.us-west-1.compute.amazonaws.com 'cat >> ~/.ssh/authorized_keys'


<property>
   <name>fs.defaultFS</name>
   <value>hdfs://ec2-54-219-144-56.us-west-1.compute.amazonaws.com:9000</value>
</property>


sudo nano $HADOOP_HOME/etc/hadoop/yarn-site.xml
<property>
   <name>yarn.nodemanager.aux-services</name>
   <value>mapreduce_shuffle</value>
</property>
   
<property>
   <name>yarn.nodemanager.aux-services.mapreduce.shuffle.class</name>
   <value>org.apache.hadoop.mapred.ShuffleHandler</value>
</property>

<property>
   <name>yarn.resourcemanager.resource-tracker.address</name>
   <value>ec2-54-219-144-56.us-west-1.compute.amazonaws.com:8025</value>
</property>

<property>
   <name>yarn.resourcemanager.scheduler.address</name>
   <value>ec2-54-219-144-56.us-west-1.compute.amazonaws.com:8030</value>
</property>

<property>
   <name>yarn.resourcemanager.address</name>
   <value>ec2-54-219-144-56.us-west-1.compute.amazonaws.com:8050</value>
</property>


sudo nano $HADOOP_HOME/etc/hadoop/mapred-site.xml
<property>
   <name>mapreduce.jobtracker.address</name>
   <value>ec2-54-219-144-56.us-west-1.compute.amazonaws.com:54311</value>
</property>

<property>
   <name>mapreduce.framework.name</name>
   <value>yarn</value>
</property>


# NameNode Only
ec2-54-219-144-56.us-west-1.compute.amazonaws.com     ip-172-31-28-44
ec2-54-219-169-153.us-west-1.compute.amazonaws.com     ip-172-31-28-42
ec2-54-219-169-177.us-west-1.compute.amazonaws.com     ip-172-31-28-43
ec2-54-219-169-157.us-west-1.compute.amazonaws.com     ip-172-31-28-45


ip-172-31-28-42
ip-172-31-28-43
ip-172-31-28-45



# Spark
sudo chown -R ubuntu:ubuntu spark

export JAVA_HOME=/usr
export SPARK_PUBLIC_DNS="ec2-54-219-144-56.us-west-1.compute.amazonaws.com"
export SPARK_WORKER_CORES=$(echo $(nproc)*3 | bc)

export JAVA_HOME=/usr
export SPARK_PUBLIC_DNS="ec2-54-219-169-153.us-west-1.compute.amazonaws.com"
export SPARK_WORKER_CORES=$(echo $(nproc)*3 | bc)

export JAVA_HOME=/usr
export SPARK_PUBLIC_DNS="ec2-54-219-169-177.us-west-1.compute.amazonaws.com"
export SPARK_WORKER_CORES=$(echo $(nproc)*3 | bc)

export JAVA_HOME=/usr
export SPARK_PUBLIC_DNS="ec2-54-219-169-157.us-west-1.compute.amazonaws.com"
export SPARK_WORKER_CORES=$(echo $(nproc)*3 | bc)



echo ec2-54-219-169-153.us-west-1.compute.amazonaws.com | cat >> $SPARK_HOME/conf/slaves
echo ec2-54-219-169-177.us-west-1.compute.amazonaws.com | cat >> $SPARK_HOME/conf/slaves
echo ec2-54-219-169-157.us-west-1.compute.amazonaws.com | cat >> $SPARK_HOME/conf/slaves



seeds: ip-172-31-28-44, ip-172-31-28-42, ip-172-31-28-43, ip-172-31-28-45


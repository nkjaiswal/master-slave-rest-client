# master-slave-rest-client

In this project we have used master-slave architechture. Slaves dynamically register their URL or IDs to master and trigger master to assign jobs to it. Master respond back and send some jobs to the slaves. Once slave finishes with the jobs assigned to it it again trigger master and loop continues untill master has no task/job.

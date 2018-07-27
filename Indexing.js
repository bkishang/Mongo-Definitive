//create a database "mongodefinitve"
use mongodefinitve

//insert 100000 users for testing indexing
//Query:
for(i=0;i<1000000;i++){
  db.users.insert
   (
     {
       "i":i,
       "username":"user"+i,
        "age":Math.floor(Math.random()*120),
        "created":new Date()
      }
    );
  }

// query for a random username in users collection.
//use explain() to get the query Stats
db.users.find({"username":"user101"}).explain()

//Output: by defualt shows the queryplanner.
{
        "queryPlanner" : {
                "plannerVersion" : 1,
                "namespace" : "mongodefinitve.users",
                "indexFilterSet" : false,
                "parsedQuery" : {
                        "username" : {
                                "$eq" : "user101"
                        }
                },
                "winningPlan" : {
                        "stage" : "COLLSCAN",
                        "filter" : {
                                "username" : {
                                        "$eq" : "user101"
                                }
                        },
                        "direction" : "forward"
                },
                "rejectedPlans" : [ ]
        },
        "executionStats" : {
                "executionSuccess" : true,
                "nReturned" : 1,
                "executionTimeMillis" : 642,
                "totalKeysExamined" : 0,
                "totalDocsExamined" : 1000000,
                "executionStages" : {
                        "stage" : "COLLSCAN",
                        "filter" : {
                                "username" : {
                                        "$eq" : "user101"
                                }
                        },
                        "nReturned" : 1,
                        "executionTimeMillisEstimate" : 591,
                        "works" : 1000002,
                        "advanced" : 1,
                        "needTime" : 1000000,
                        "needYield" : 0,
                        "saveState" : 7829,
                        "restoreState" : 7829,
                        "isEOF" : 1,
                        "invalidates" : 0,
                        "direction" : "forward",
                        "docsExamined" : 1000000
                },
                "allPlansExecution" : [ ]
        },
        "serverInfo" : {
                "host" : "DESKTOP1",
                "port" : 27017,
                "version" : "4.0.0",
                "gitVersion" : "3b07af3d4f471ae89e8186d33bbb1d5259597d51"
        },
        "ok" : 1
}

//Analysis :
//The query has to perform a "COLLSCAN" as there are no indexes defined for this collection.
//"docsExamined" : 1000000 shows that all the documents in the collection are examined.

//Lets try to limit the query to 1 result, so that it stops after finding 1 result.
db.users.find({"username":"user101"}).limit(1).explain()
//Output:
{
        "queryPlanner" : {
                "plannerVersion" : 1,
                "namespace" : "mongodefinitve.users",
                "indexFilterSet" : false,
                "parsedQuery" : {
                        "username" : {
                                "$eq" : "user101"
                        }
                },
                "winningPlan" : {
                        "stage" : "LIMIT",
                        "limitAmount" : 1,
                        "inputStage" : {
                                "stage" : "COLLSCAN",
                                "filter" : {
                                        "username" : {
                                                "$eq" : "user101"
                                        }
                                },
                                "direction" : "forward"
                        }
                },
                "rejectedPlans" : [ ]
        },
        "executionStats" : {
                "executionSuccess" : true,
                "nReturned" : 1,
                "executionTimeMillis" : 0,
                "totalKeysExamined" : 0,
                "totalDocsExamined" : 102,
                "executionStages" : {
                        "stage" : "LIMIT",
                        "nReturned" : 1,
                        "executionTimeMillisEstimate" : 0,
                        "works" : 104,
                        "advanced" : 1,
                        "needTime" : 102,
                        "needYield" : 0,
                        "saveState" : 0,
                        "restoreState" : 0,
                        "isEOF" : 1,
                        "invalidates" : 0,
                        "limitAmount" : 1,
                        "inputStage" : {
                                "stage" : "COLLSCAN",
                                "filter" : {
                                        "username" : {
                                                "$eq" : "user101"
                                        }
                                },
                                "nReturned" : 1,
                                "executionTimeMillisEstimate" : 0,
                                "works" : 103,
                                "advanced" : 1,
                                "needTime" : 102,
                                "needYield" : 0,
                                "saveState" : 0,
                                "restoreState" : 0,
                                "isEOF" : 0,
                                "invalidates" : 0,
                                "direction" : "forward",
                                "docsExamined" : 102
                        }
                }
        },
        "serverInfo" : {
                "host" : "DESKTOP1",
                "port" : 27017,
                "version" : "4.0.0",
                "gitVersion" : "3b07af3d4f471ae89e8186d33bbb1d5259597d51"
        },
        "ok" : 1
}

//Analysis:
// Here the number of documents examined reduced to 102
//"docsExamined" : 102
//As we are looking for 102nd document in the collection i.e. "user101",the query stopped after finding the result.
// This is not going to find if we want to find "user900000" cause it has to scan 900001 documents to find the result.

//The solution for this problem is INDEXES.
//we can increase the performace of the query by creating an index on username key.
db.users.ensureIndex({"username":1})

//output: Index created on username field.
{
        "createdCollectionAutomatically" : false,
        "numIndexesBefore" : 1,
        "numIndexesAfter" : 2,
        "ok" : 1
}

//Now let us try the above query to find "user101" again and see the executionStats

db.users.find({"username":"user101"}).limit(1).explain("executionStats")

//Output:
{
        "queryPlanner" : {
                "plannerVersion" : 1,
                "namespace" : "mongodefinitve.users",
                "indexFilterSet" : false,
                "parsedQuery" : {
                        "username" : {
                                "$eq" : "user101"
                        }
                },
                "winningPlan" : {
                        "stage" : "LIMIT",
                        "limitAmount" : 1,
                        "inputStage" : {
                                "stage" : "FETCH",
                                "inputStage" : {
                                        "stage" : "IXSCAN",
                                        "keyPattern" : {
                                                "username" : 1
                                        },
                                        "indexName" : "username_1",
                                        "isMultiKey" : false,
                                        "multiKeyPaths" : {
                                                "username" : [ ]
                                        },
                                        "isUnique" : false,
                                        "isSparse" : false,
                                        "isPartial" : false,
                                        "indexVersion" : 2,
                                        "direction" : "forward",
                                        "indexBounds" : {
                                                "username" : [
                                                        "[\"user101\", \"user101\"]"
                                                ]
                                        }
                                }
                        }
                },
                "rejectedPlans" : [ ]
        },
        "executionStats" : {
                "executionSuccess" : true,
                "nReturned" : 1,
                "executionTimeMillis" : 27,
                "totalKeysExamined" : 1,
                "totalDocsExamined" : 1,
                "executionStages" : {
                        "stage" : "LIMIT",
                        "nReturned" : 1,
                        "executionTimeMillisEstimate" : 0,
                        "works" : 2,
                        "advanced" : 1,
                        "needTime" : 0,
                        "needYield" : 0,
                        "saveState" : 0,
                        "restoreState" : 0,
                        "isEOF" : 1,
                        "invalidates" : 0,
                        "limitAmount" : 1,
                        "inputStage" : {
                                "stage" : "FETCH",
                                "nReturned" : 1,
                                "executionTimeMillisEstimate" : 0,
                                "works" : 1,
                                "advanced" : 1,
                                "needTime" : 0,
                                "needYield" : 0,
                                "saveState" : 0,
                                "restoreState" : 0,
                                "isEOF" : 0,
                                "invalidates" : 0,
                                "docsExamined" : 1,
                                "alreadyHasObj" : 0,
                                "inputStage" : {
                                        "stage" : "IXSCAN",
                                        "nReturned" : 1,
                                        "executionTimeMillisEstimate" : 0,
                                        "works" : 1,
                                        "advanced" : 1,
                                        "needTime" : 0,
                                        "needYield" : 0,
                                        "saveState" : 0,
                                        "restoreState" : 0,
                                        "isEOF" : 0,
                                        "invalidates" : 0,
                                        "keyPattern" : {
                                                "username" : 1
                                        },
                                        "indexName" : "username_1",
                                        "isMultiKey" : false,
                                        "multiKeyPaths" : {
                                                "username" : [ ]
                                        },
                                        "isUnique" : false,
                                        "isSparse" : false,
                                        "isPartial" : false,
                                        "indexVersion" : 2,
                                        "direction" : "forward",
                                        "indexBounds" : {
                                                "username" : [
                                                        "[\"user101\", \"user101\"]"
                                                ]
                                        },
                                        "keysExamined" : 1,
                                        "seeks" : 1,
                                        "dupsTested" : 0,
                                        "dupsDropped" : 0,
                                        "seenInvalidated" : 0
                                }
                        }
                }
        },
        "serverInfo" : {
                "host" : "DESKTOP1",
                "port" : 27017,
                "version" : "4.0.0",
                "gitVersion" : "3b07af3d4f471ae89e8186d33bbb1d5259597d51"
        },
        "ok" : 1
}

// Here the query used index scan("stage" : "IXSCAN") instead of a Collection scan("stage" : "COLLSCAN").
//The total number of documents scanned became "1" (  "totalDocsExamined" : 1 )
//** An index can make dramatic differences in query times.But they have their price.
//Every write(insert,update,delete) will take longer for every index we add.

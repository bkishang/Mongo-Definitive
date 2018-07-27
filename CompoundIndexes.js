//Basically,an index keeps its values in a sorted order, so that it uses the index for sorting the documents.
//Let us suppose we have a collection of users. And an index is laready defined on "username".
//the existing index({"username":1}) won't be of any use for the below query.

db.users.find().sort({"age":1,"username":1})

//the above query first sorts the collection by "age" and then by "username".
//so the "username" is not much helpful.
//To optimise the above sort, we have to create an index on both fields.
db.users.ensureIndex({"age":1,"username":1})
//This is a compound index.
//A compund index is an index on more than one field.

//The above index is efficient for below queries also.
db.users.find({"age":21}).sort({"username":-1})
//First it queries for all the records with age 21 and need not to sort the records as they are already sorted by age and username.
db.users.find({"age":{"$gte":21,"$lte":30}})
//Thies is a mutli-value query. But as the documents are already sorted by age forst and then by username,

//But the below query is not efficient using the above index
db.users.find({"age":{"$gte":21,"$lte":30}}).sort({"username":1})

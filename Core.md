## Core Service:
### user-term-image-information.service.ts

**Variables:**
-	**userId** - value to identify user in database
-	**prevTermGeneralInfo/currTermGeneralInfo** - contains term info in the form that is returned from constructTermObj method
addZero: takes in a string that is the name of the image and add a zero to the start of the number portion of the image -- doing so would allow us to sort numbers in ascending order ( without this method the sort method would sort in the order 1,10,11,2…)

makeSingleRequest: this method issues a post request to the google cloud function ( that cloud function will eventually call the image matching alg); the parameters of the post request are the previous and current term id values


Method:
	Variables used:

Variables:

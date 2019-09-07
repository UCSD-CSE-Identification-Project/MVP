## GCP Functions Ravi:
### twoTerms:
This will be the function that gets called from our website. We will pass in two terms -- the previous and current term; we will get all the individual, group and iso images issue a post request ( 1 per image ) with the image name and the current term as payload values to the TWOTERMIMAGEMATCH.  -- the reason why we do this in a GCP function because the front end cannot handle that many post requests


### twoTermImageMatch:
The twoTermImageMatch GCP func goes to the findMatches method. findMatches then gets images we want to compare against from the currentTermID value; it creates some tuple values to store the images and some data about the images using constructSingleImage method; findMatches will then call compare_images to compare images from the previous and current term -- compare_images will return a value indicating how similar the images are. All information about the image comparison is updated in the database -- the matches are stored under the matches section of the image’s metadata. 


#### Compare_images:
- **Argument:**
    - **imageTermOne** -- the tuple object returned from constructSingleImage that has information about the image from the previous term 
    - **imageIdTermTwo** -- the id of the image from the currentTerm that we will compare to see if it is a match or not
    - **Database** -- the reference to the database
    
- **Flow:**
    - Get the image object for the current term image value -- and then read the image and get a matrix representing the image.
    - Resize the image so that when you are comparing again the image from the previous term that they have the same dimensions ( the reason why i choose 1080, 1920 is because most images are already that size and we would not waste precious time to resize it if it didnt need to be );
    - Then we compare the image and return the value to see how similar they are.  

#### constructSingleImage:
- **Argument:**
    - **imageIdVal** -- id of the image from the previous term ( can be for any term but we only use it for that)
    - **db** -- the reference to the database
    - **Tuple** -- the id of the image that you was passed in as an argument, the image represented as a matrix, and the grouping of the image
- **Flow:**
    - Get the image object from the database -> read the image via the imageURL and get a matrix representing the object -> resize to specific dimensions so that we can compare with the same size ( comparing image requires this ) -> then get the object grouping so that we know what grouping of images to compare against and then return a tuple with three values

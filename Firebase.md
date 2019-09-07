### How data is stored in firestore database:
- When a user is created they get assigned a unique userId (done by google firestore) that we then use to save data about that specific user

### A user object is composed of
1.	**Class_term** -- a mapping between the input a user writes to identify his/her term data when uploading to the id value of the term in the database


2.	**Email**


3.	**finishedLastRun** -- if they got to the end step(they were able to download the excel sheet )


4.	**lastUrl** -- the url of the last step they were on


5.	**lectureOrImageIndex** -- index of the lecture or image they were last on


6.	**Name** ?? xingyu


7.	**unserExistingPrev** ?? xingyu


### We then use unique id values for terms to identify them and use them in different steps:

### The term object is composed of:
**The (\*)\_image values are all mappings of name_of_image -> id_of_image_inDatabase**
1.	**All_image** -- all images of that term


2.	**group_images/ind_images/iso_images** -- ind, group or iso images determined from choosegrouping


3.	**Key_images** -- images that need to get answers for ( also determined in choose grouping) -- they are structured as one key image and under it are all the images with the same answers as the key image


4.	**Class_data** ?? xingyu


5.	**Results** ?? xingyu


### The image ids that we save in the term object, we store metadata of the image in image objects
### The image object is composed of:
1.	**Correct_answers:** the multiple choice of correct asnwers 


2.	**downloadURL:** url of where to get the image


3.	**Grouping:** if the image is Individual/Group/Iso


4.	**imageInGroup:** if this image is the key image, then what are the images that are in the same group as it ( what are the images that have the same answer as this image )


5.	**Matches:** will have an array as the value with the keys being term ids and the values being another array of currTermImageId -> the comparison value (to the image we are adding this value to)


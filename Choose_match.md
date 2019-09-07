## Choose Image matches Stage:
### Global var:
- **termMatching:** object that will hold all the information about the whole term


- **matchBar:** object that will hold all the information that is shown on screen


- **imagesFinished:** done selecting matches for all the steps


- **matchesFinished:** when current image have found matches


- **logoutEnabled:** true after user finishes ( havent implemented) 


- **curPic:** the subscription of the current image on screen ( gets update if image in the database gets updated) 


- **chooseToShowAll:** show all images 


- **prevTermName/currTermName:** names that the user inputted


- **prevTermURLS/currTermURLS:** all the urls of each term


- **getSummary:** boolean that helps show the matching summary


- **prevTermImageAnswer:** answer of the previous term image shown on screen


### Methods:
- **createMatchBarObj:** creates an object with fields to store information to show on screen


- **completeMatchBarObj:** populates the fields with information that will be shown on screen


- **createChooseMatchesTermObj:** will create an object that will hold information about the term as a whole ( ex. Names of all the images in the term object )


- **populateIdsOfMatches:**
    - **Argument:**
        - **imageKey:** the key (in the database ) of the image you want to get the match ids ( keys of the images that are matches ) for
    - **Flow:** gets the matches of the image from the database and sorts them in most likely ( to be a match) to least likely order

- **populateImageURLMatches:**
    - **Flow:** take the ids (value on how to identify image in database ) of the matches that you want to display and get their url 

- **imgClick:**
    - **Argument:**
        - **index:** the number of the image that was clicked
    - **Flow:** update the image that was selected to have a green border and change the image on the left side to be the image that was just clicked

- **updateImageWithMatch: **
    - **Argument:**
        - **imageId:** id of the image in the database
        - **matchId:** id of the match in the database
        - **matchTermId:** term value that the match belongs to
    - **Flow:** take the match and update the imageId in the database to reflect that it has matchId as a match from term, matchTermId.

- **updateCurrentTermImageWithAnswer:**
    - **Argument:**
        - **imageIdInDatabase:** id of image in database
        - **correctAnswer:** the correct answer of the image
    - **Flow:** after the user clicks on an image as the match and goes to the next image, we will take the answer from the previous term image ( correctAnswer ) and update the image in the current term with that answer (iamgeIdInDatabase). This works because they are matches and will have the same answer

- **nextImage:**
    - **Flow:** unsusbribe to the current picture on the screen because if you do not then you will keep getting updates for that image and cause memory leaks; then save the values of the matches and update the images with the matches and the answers as needed. If we are done with the answers, then we can just return, otherwise we create a new subscription to the next image to be displayed and update it accordingly.

- **populateImageWithoutMatch:**
    - **Flow:** show the user images ( individual if you are trying to find a match for an individual image, group for group, so on ) if the matching algorithm is taking too long -- called when the user clicks continue

- **showSummary:**
    - **Flow:** for each of the image in previous term, gets its key and id, then query the database to find its matching image in the current term, store all these matching pairs and render the pairs inside a virtualScroll. (If needs to be refreshed for the virtualScroll to render.)

- **storeSession:**
    - **Flow:** store important data into sessionStorage, other pages will load data from sessionStorage when they first load

- **Logout:**
    - **Flow:** redirects user to login page and saves the steps the user was at. First save data in localStorage, then save in Firebase.

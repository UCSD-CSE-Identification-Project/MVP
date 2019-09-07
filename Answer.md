## Choose answers page: 
### Note: the reason we only have previous term here is because we will automatically update the current term answers for the same questions after we complete the choose matches step

### Global Var: 
**boxValues:** options to show on the screen

**imagesFinished:** true if we finish answering all images -- false otherwise

**boxOnScreen:** the picture that is being shown on the screen and the metadata surrounding it

**prevTermAnswerObj:** the term data of the previous term specifically for the answers module

**currTermAnswerObj:** the term data of the current term specifically for the answers module

**startingIndex:** index of the image that you should start at (typically 0 but different if user logs out and logs back in)

**totalPrevImages:** number of previous term images

**totalCurrImages:** number of current term images

**canShowPreviousImage:** false if you are on the first image

### Methods:
**createChooseAnswersTermObj:**
- **Arguments:**
    - **imgNames:** all key images that were found in choosegrouping ( in the from of imageName -> imageId)
    - **loadedFromDatabase:** true if loaded from database
    - **termIdVal:** idVal of the term in database
    - **Index:** pic num you are on ( 0 if you are beginning from start)

- **Flow:** create object that will hold information about what image you are on, what the name/id of the image is etc

**createBoxObj:**
- **Flow:** create an object to hold the information displayed on screen, like what answer was clicked, the URL of the image displayed and the number of boxes choosen

**getKeyAndIsoImages:**
- **Arguments:**
    - **prevOrCurrentTerm:** will hold string ‘prev’ is previous term and ‘curr’ if current term
- **Flow:** gets the Key and Iso images from the general info service and returns them


**reverseKeyInAllImages:**
- **Arguments:** prevOrCurrentTerm
- **Flow:** Returns array in the form of arr["keyVal"] = "imageName" --- arr["kjsh2k3"] = "L123123Q_19" --- essentially swaps the keys and values 

**findNextImageToAnswerInPrevTerm:**
- **Flow:** loops through the sorted image names and find the first imgage that hasn't been answered

**setResetTermFinishVariables:**
- **Flow:** When the previous term is done answering questions then we set some variables to indicate that to various parts of the code ( ex. The HTML, the general info service etc )

**unwindTermFinishVariables:**
- **Flow:** when going back from a term finished page, set the variables back to original state.

**getImageURLsetInHTML:** 
- **Argument:**
    - **imageName:** name of the image LQ123
- **Flow:** gets the URL from the database

**updateSubGrouping:**
- **Arguments:**
    - **imageKeyInDatabase:** key of the image in the database
    - **correctAnswer:** the correct answer that the user choose in the checkboxes
- **Flow:** loops through all the images that have the same answer as the key image ( they have the same picture but they are just group vs individual ) and updates the answer online

**previousImage:**
- **Flow:** re-render the previous image onto the screen. (We are only choosing answers for the previous term) If this is the last image of the previous term, invoke unwindTermFinishVariables to unset finish variables. Always invoke getImageURLsetInHTML to render the image.

**nextImage:**
- **Flow:** Take the answer of the current image and update the database accordingly ( that current image and all of its subgrouping ). If we are done with answering all the images then move onto the next step, but if there are more images left to answer then create a box object and move onto the next picture. 

**boxChecked:**
- **Arguments:**
    - **isChecked:** true if user clicked an unclicked box ( false otherwise 0
- **Flow:** allows us to keep track of how many boxes the user has clicked ( this is so that the HTML can figure out if the user has clicked at least one box )

**storeSession:**
- **Flow:** store important data into sessionStorage, other pages will load data from sessionStorage when they first load

**Logout:**
- **Flow:** redirects user to login page and saves the steps the user was at. First save data in localStorage, then save in Firebase.


**unloadNotification:**
- **Flow:** whenever page refreshes or is about to be closed, it will always save important data into sessionStorage, shows a message in order to prevent user from closing the page without using the standard logout option.

**openDialog:**
- **Flow:** opens the guide of this page.

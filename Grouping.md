## Choose Grouping Stage:

### Global Variables:
**boxValues:** options that the user can click on the screen

**imagesFinished:** true if the term that is currently displayed is done grouping images -- false otherwise

**prevTermGrouping/currTermGrouping:** is the grouping object that will hold info like imageNames, lectureIndex etc. -- object returned from createChooseGroupingTermObject

**lenOfVirtualScroll:** length of the current lecture in the virtual scroll

**lectureOnScreenBoxList:** will hold the answer user clicks for every image in a lecture

**partOfTheSameSubPair:** if user clicks on answers in the order ( (1,ind) - (2,group) - (3,group) - (4,ind) ) the sub group of the first image will be 2,3 and the subgroup of the last image will be empty. The ind or group image not related to the previous question, will have the same answer as the sub-grouped images

**lectureName:** the prefix name of the lecture

**finishedCurrentTerm:** if the current term is done with the grouping stage

**lectureNum:** which lecture you are on

**whichTerm:** which term was it (prev or curr)

**termName:** name user enters for previous or current term

**prevNumLectures:** length of the number of lectures of the previous term

**currNumLectures:** length of the number of lectures of the current term

**canShowPreviousLecture:** if you are on the first lecture then you cannot go back

**allowReload:** helps remove browser warning when going to a previous lecture. When inside updatePageForPreviousLecture, set allowReload to true, then calling window.location reload() will not show that extra browser warning. Setting it back to false will bring back the warning when user tries to close the tab or refresh.

### Methods:
**createboxObj:** creates box object that is shown on the screen -- returns object array
- boxVal options will hold if ind, group, ignore
- Box will hold if img is not related to the previous image
- imageSourceURL - url of the image to be displayed, for which you will choose the option
- imgIndex - index of the image displayed 
**createChooseGroupingTermObj:**
- imageNames - all the names of images in the entire term
- lectureIndex - index of the lecture whose images are displayed
- lectureList - list of all the lectures for that term
- imageKeysSorted - sorted list of image names ( L01, L02…)
- termFinishedAnswering - done answering images for that term
- needGrouping - if the term needs grouping ( added so that if user has loaded a past term then they would skip this step, not needed for the current version )
- numImages - number of images for the current term

**populateLectureBoxList:**
- **Arguments:**
    - **lecInd** - index of the lecture you are currently on
- **Flow:** creates an array whose length is equivalent to the number of images needed to be displayed calls createBoxObj that many times

**toggleRestBoxes:**
Toggle all boxes to the right of the box that was selected to have the alternating pattern of (ind-group) either starting from ind-group or group-ind

**setResetTermFinishVariables:**
Method that is used to transition from previousTerm chooseGrouping -> currentTerm chooseGrouping -> navigation page of 
Once a term is done grouping, we update the database with the grouping of the images of that term

**unwindTermFinishVariables:**
- **Argument:**
    - **whichPosition:** indicates the previous button was clicked at which lecture.
- **Flow:** takes care of 2 scenarios where user wants to go back to a previous lecture: at the end of previous lecture, at the end of current lecture. if the user wants to go back when at the first lecture of the current term, it should find the last lecture of the previous term, reset the boolean variables and render the page; if the user wants to go back after finishing the current term, it should find the last lecture of the current term, reset the boolean variables and render the page.

**pushImageObjectToFirestore:**
- **Arguments:**
	- **boxVal:** the grouping of the image to be updated in the database
	- **Imagekey:** the key of the image that needs to have its boxval updated
- **Flow:** Update imgObj with boxVal in the images part of the database, and you find the image using the imageKey

**addGroupingOfImageToGenInfo**
- **Arguments:**
    - **termObjectKeysToNames:** object array where the key values are ids and the value is the image name ( ex. 1qrus23nl4ka -> LQ1 )
    - **lectureImageIds:** the ids of images for that specific lecture

- **Flow:** loop through all the answers (using the lectureOnScreenBoxList) for that lecture and get the corresponding id of that question in the database. Update the answer for that id in the database

**populateKeyValuesInService**
(come back here for first for loop -- cannot figure out what it is doing )??????????????
- **Arguments:**
    - **termObjectKeysToNames:** object array where the key values are ids and the value is the image name ( ex. 1qrus23nl4ka -> LQ1 )
    - **lectureImageIds:** the ids of images for that specific lecture

- **Flow:** updates the key image variable in the generalInfo service with all the key images of that lecture

**UpdateImageWithGrouping**
- **Arguments:**
    - **termObjectKeysToNames:** object array where the key values are ids and the value is the image name ( ex. 1qrus23nl4ka -> LQ1 )
    - **lectureImageIds:** the ids of images for that specific lecture
- **Flow:** Gets the first non-ignore question -> then if boxvalue is individual or is checkboxed to be true then we add the previous subgrouping to the database -> after the for loop we check to see if the last subgroup needs to be added to the database and add it if need be. The sub-group is non-key images ( key images are the individual or checkboxed images) and the key is used as an image to add the subgrouping to

**updatePageForPreviousLecture:**
- **Flow:** after a previous lecture button is clicked, it should update the page properly for each scenario. (1) When go back to the first lecture of previous term, the previous button should disappear, otherwise decrement lecture index and render the previous lecture. (2) If previous term is loaded from database, going back to the first lecture of the current term should also make the previous button disappear. (3) If going back from the first lecture of current term to the last lecture of the previous term, invoke unwindTermFinishVariables to reset the boolean variables. (4) If going back from the finish page to the last lecture of the current term, invoke unwindTermFinishVariables to reset the boolean variables. (5) Decrement lecture index and render the previous lecture.

**previousLecture:**
- **Flow:** called by clicking the previous button. Shows a dialog asking for confirmation, if confirmed then invoke updatePageForPreviousLecture and reload the page.

**nextLecture:**
- **Flow:** when a lecture is done choosing groups, invoke addGroupingOfImageToGenInfo to store grouping info into generalInfo. Then for each image of that lecture, invoke  pushImageObjectToFirestore to store each image’s option into database. Then invoke updateImageWithGrouping to store grouping information into “individual images.” So each individual image will have a list of “group images” that are related to it. According to different situations, increment lectureIndex or invoke setResetTermFinishVariables to finish a term’s grouping. If there are more lectures to be shown, it will select the proper lecture by invoking populateLectureBoxList. When the virtualScroll is updated, invoke scrollToIndex to reset the virtualScroll’s index and always show the first image.

**issueMatchingAlgorithm:**
Just calls the service method to issue matching algorithm : reason there is a method call here is because we only want to issue the matching alg when the user clicks finish and goes to the navigation page. 

**storeSession:**
- **Flow:** store important data into sessionStorage, other pages will load data from sessionStorage when they first load.

**Logout:**
- **Flow:** redirects user to login page and saves the steps the user was at. First save data in localStorage, then save in Firebase.

**unloadNotification:**
- **Flow:** when the page is to be refreshed or closed, save data into sessionStorage. The browser will either let it proceed or pop up a warning dialog depending on the value of allowReload.

**openDialog:**
- **Flow:** opens up a dialog with the guide of this page.

## Upload Stage:

### Global Variables:
-	**prevXmlFiles:** filenames in upload folder that are xml files - in previous term
-	**currXmlFiles:** filenames in upload folder that are xml files - in current term
-	**usePreexistTerm:** ( not in current version ) - used to indicate if user chooses an already uploaded term as the previous term
-	**prevTermName:** user input of prev term name
-	**currTermName:** user input of curr term name
-	**prevTermsCreated:** names of terms the user has already used (in past runs)
-	**sameCurrTermName:** set to true when user chooses name already used in past runs
-	**samePrevTermName:** set to true when user chooses name already used in past runs
-	**prevTermClickerFiles:** name of all the files that are in the previous term clicker folder
-	**currTermClickerFiles:** name of all the files that are in the current term clicker folder
-	**prevTermFinalExamFile:** final test scores of previous term
-	**finishedUpload:** boolean that is only set to true when upload is completely done
-	**allPastTermArray:** all names used previously as keys and (term objects) as values
-	**totalFilesPrevClicker:** number of previous term clicker files uploaded
-	**totalFilesPrevFinal:** number of final prev files uploaded -- should always be 1
-	**totalFilesPrev:** -- should always be totalFilesPrevClicker + totalFilesPrevFinal ( 1 )
-	**totalFilesCurr:** number of current term clicker files uploaded
-	**displayNumPrevFinal:** (== totalFilesPrevFinal) value that will be displayed in the HTML -- shouldnt be changed
-	**displayNumPrevClicker:** (== totalFilesPrevClicker) value that will be displayed in HTML -- shouldnt be changed
-	**displayNumCurrClicker:** (== totalFilesCurr ) value that will be displayed in HTML -- shouldnt be changed
-	**numFilePrev:** number of files uploaded in the previous term at a given time
-   **numFileCurr:** number of current term files uploaded at a given time
-	**allPercentageObservablePrevious:** percentage of previous term files that are uploaded
-	**allPercentageObservableCurrent:** percentage of current term files that are uploaded
-	**startSpinning:** start spinning when one of the terms is done uploading the images to storage to indicate we are now creating and adding term objects into the database
-	**stopSpinning:** stop spinning when both terms are done creating and adding term objects into the database
-	**submitButtonClicked:** boolean used to only allow user to click submit once

### Methods
- **checkPrevTermName:**
    - **Local Variables:** None
    - **Global Variables:** samePrevTermName, prevTermCreated, prevTermName
    - **Flow:** samePrevTermName set to false; check prevTermName to see if contained in array prevTermCreated -- if true then samePrevTermName set to true

- **checkCurrTermName:**
    - **Local Variables:** None
    - **Global Variables:** sameCurrTermName, currTermCreated, currTermName
    - **Flow:** sameCurrTermName set to false; check currTermName to see if contained in array prevTermCreated -- if true then sameCurrTermName set to true

- **tempStore:** 
    - **Arguments:**
        - **Event:**  the folder that was inputted by the user
        - **prevOrCurrentTerm:** ( == 0 if input file for previous term ) ( == 1 for curr Term)
        - **finalOrClicker:** ( == 0 if input file was final ) ( == 1 if input file was a clicker folder )
	- **Local Var:** None
	- **Global Var:** prevTermFinalExamFile, totalFilesPrevFinal, displayNumPrevFinal, prevTermClickerFiles, totalFilesPrevClicker, displayNumPrevClicker
	- **Flow:** we use this method just as a place hold the files we want to upload once the user clicks submit; if input file/folder is empty then we return and do nothing, otherwise we update the global variables to save the files, the length of the files (into two variables, one which we will modify and one that we just use to display in our HTML )

- **pairLectureImage:**
    - **Flow:** take the names of the xml files from previous and current terms, sort then and only get the first 3 weeks worth of lecture image names (that have images, bc sometimes not all lectures have images ) and the values of the variables in the service ( this.general.prevTermLectureImage, this.general.currTermLectureImage) to these image values. These variables will be used as the images in the choose-grouping step. 

- **uploadTermZip:**
    - **Arguments:**
        - **eventZipFile** - variable that holds all the files that we need up upload
        - **prevOrCurrentTerm** - 0 for prev, 1 for curr term
    - **Local variables:**
        - **allPercentage:** array of observables ( 1 for every files ) on what % of the file has been uploaded
    - **Flow:** this is the most complicated method in the current module;
        -	We create an empty term object that we upload to the database; we get the id of that term object and update a variable in the generalInfo service to hold its value
        -	We then update the user object in the database to hold the new mapping of termName ( that user inputted ) to termId 
        -	We then loop through eventZipFile and check file should be uploaded -- if it is a file that we won’t upload, then we subtract the totalFilesPrev/Curr number
        -	We then upload the file to the storage in the database ( the file path being userIdVal+termId+filename)
        -	When we upload we will get an observable telling us the percentage of the upload for the single file -- we append that to the allPercentage array
        -	We get the downloadURL of the file we uploaded once it is done uploading and then we check if we should create an image object in the database
        -	If we do create image object then we first create empty imageObject with just the url field filled and update that to the database. Once that single image is done updating we increment the number of numFilePrev/Curr to indicate we are done updating that object
        -	Once we are done updating the database with the image object, we save that image’s name into our generalInfo variables -- and also we update the term object with that single image
        -	If the file is not an image, it might be an xml -- if so then we just save the filename and increment numFilePrev/Curr
        -	We then wait for all the variables saved in allPercentage to finish uploading to storage -- once they are both done we will start a spinning bar to indicate we are updating the image objects in the database -- once we are done updating the IMAGE objects for BOTH terms in the database we will stop the spinning bar and proceed to the next step

- **onUpload:**
	- **Flow:** 
        - Method will be called when the user clicks on submit;
		- The first if method is for the case if the user is using a past-uploaded term as the  previous term. In that case we get the term object from the database and populate the service variables for all,ind,group,iso and key images
		- Else ( this will happen every time right now because currently we removed functionality to choose a past-uploaded term ) we get the clickerfiles+final file for previous term and the clicker files from the current term. We update the totalFilesPrev and totalFilesCurr respectively. We then call uploadTermZip to upload all the files from totalFilesPrev/Curr to firestore database


- **storeSession:**
    - **Flow:** store important data into sessionStorage, other pages will load data from sessionStorage when they first load

- **generateCsv:**
    - **Flow:** invokes pairLectureImage to pair up clicker image with corresponding lecture. Since this is called at the end of upload stage, invoke storeSession to store generalInfo so that the next stage can load it. Create and issue a Http post request to GCP, create a nametable for each quarter using the python script (nametable is used in the final process python script).

- **Logout:**
    - **Flow:** redirects user to login page and saves the steps the user was at. First save data in localStorage, then save in Firebase.

- **openDialog:**
    - **Flow:** opens the dialog box with the guide

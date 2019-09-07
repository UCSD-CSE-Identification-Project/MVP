## Processing Stage:
### Global var:
- **csvfile:** string that holds the content of corresponding_question.csv


- **startProcess:** boolean that indicates whether Processing has started


- **showSpinner:** boolean that indicates whether the spinner should show up


- **csvSpinner:** boolean that indicates whether it is generating corresponding_question.csv


- **finished:** boolean that indicates whether Processing has finished


### Methods:
- **openDialog:**
    - **Flow:** shows a piece of message in pop-up.html, after closing the dialog it will invoke process() to start processing in GCP.

- **process:**
    - **Flow:** sends a http get request to the cloud function with the proper headers set, after getting response it will stop the spinner and sets proper booleans.

- **ngOnInit:**
    - **Flow:** retrieve data saved in sessionStorage. Generate a csv file of all previous term images, with the correct answer of that question and the matched image from the current term, save it into a specific directory in Firebase.

- **changeName:**
    - **Argument:**
        - **name:** string of a question name
    - **Flow:** change the format of a question name into {LectureName}_Q{QuestionNumber}.

- **logout:**
    - **Flow:** copy important data into a termData object, save into localStorage, and then logout, which will also update user logout information in Firebase.

- **unloadNotification:**
    - **Flow:** whenever page refreshes or is about to be closed, it will always save important data into sessionStorage, shows a message in order to prevent user from closing the page without using the standard logout option.

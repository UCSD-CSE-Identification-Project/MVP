## Google cloud function Process:

### Note: declare imported packages inside requirements.txt

### TODO: fix random, seems not working correctly, change to post request

### Imported modules:
1. from flask import **make_response**: for sending response back to the front end
2. import **math** 
3. import **io**: for reading csv files from strings
4. import **pandas** as pd, **numpy** as np: for manipulating dataframes that contain data read from csv files
5. from google.cloud import **storage**: to connect to storage bucket that store all the csv files
6. from sklearn… import **scale**, **train_test_split**, (roc_curve, auc are currently not used), **SVC**; import **statsmodels.api** as sm: used to doing training and testing on the final model obtained
7. import **random**: to generate random numbers


### Entry point: process(request)

**process(request):**
- **Argument:**
    - **request:** the http request send from the front end, should contain arguments: course (not used), week (not used), elements (default to c), prevTermId (previous term id in Firebase), currTermId (current term id in Firebase), userId (user’s id in Firebase).
- **Flow:**
    - Part 1: data processing
        - Use the storage to connect to the storage bucket where all the files are stored in Firebase storage. This is equivalent to ‘/’ directory.
        - Validate request then get parameters, elements can contain more than just clicker, but this version is only using clickers.
        - Invoke load_final to get 2 dataframes that contain final score info of students in 2 terms.
        - Invoke pair_data to get the corresponding_questions.csv that contains previous term questions matched to current term questions, each question will have an unique question id.
        - Invoke load_filter_questions to load in clicker questions.
        - Invoke convert_to_universal_qid to give each clicker question a unique global id.
        - Invoke do_fill_NAs_to_6 on both prev and curr dataframes, fill NA to 6.
        - Remove questions that the other one doesn't have.
        - Invoke convert_responses_to_correctness_train_test to get a correctness column based on the clicker question responses.
        - Invoke merge_correctness to add up the clicker responses.
        - Invoke factorize_response, factorize clicker response.
        - Merge the dataframes with correctness based on anid. (see pandas merge)
        - Sort by anid, then invoke normalize_data to scale dataframes.
    - Part 2: data training
        - Match column names with the test set
        - Set a few flags and prepare to take the SVM path: invoke FindParameters to find the best set of values for training. Then feed the parameters into SVC and get the relationship between exam_total and other columns/factors.
    - Part 3: data testing/actual prediction (The lower 40% students will be considered failing)
        - Use the set of parameters get previously, invoke SVC to get a predicted model.
        - On the predicted model, invoke predict_proba to get probabilities of failing for current term students. (See predict_proba for more details)
        - Invoke AnalyzeConfidence to store the result as a csv file in Firebase storage.
        - Set necessary http headers and send the response back to front end.

- **load_final(bucket, userId, prevTermId, currTermId):**
    - **Argument:**
        - **bucket:** cloud storage bucket, need it to gain access to files
        - **userId:** user’s id stored in Firebase
        - **prevTermId:** previous term’s id stored in Firebase
        - **currTermId:** current term’s id stored in Firebase
    - **Flow:**
        - Construct the file path of previous term’s nametable.csv based on userId and prevTermId. Use bucket and pandas to read the csv file as a dataframe. Do the same for current term’s nametable.csv file.
        - For previous term, take out the anid and exam_total columns; for current term, take out the anid column and set an exam_total column to be 0s (since we are essentially predicting this column).
        - Scale the exam_total column of previous term’s dataframe, then invoke score_to_binary on it to set the exam_total column to 1s and 0s?????

- **score_to_binary(df):**
    - **Argument:**
        - **df:** the dataframe to be changed
    - **Flow:**
        - Find the fail score that divides the dataframe 40:60 (See pandas quantile).
        - Change exam_total column into 1s and 0s based on that fail score. (Categorize the list, but effect is trivial, see pandas Categorical).

- **pair_data(bucket, userId, prevTermId, currTermId):**
    - **Argument:**
        - **bucket:** cloud storage bucket, need it to gain access to files
        - **userId:** user’s id stored in Firebase
        - **prevTermId:** previous term’s id stored in Firebase
        - **currTermId:** current term’s id stored in Firebase
    - **Flow:**
        - Since for each previous and current terms pair, there is one match file, the file path of corresponding_questions file contain both the termIds. Construct the file path based on userId and both termIds. Then read the file into a dataframe.
        - Assign each question an unique global id, starting with q1, q2 and so on.
        - Rename the first column to qid and assign first column the new ids. (Not sure what the first column was before the change, better to double check before overwritting)

- **load_filter_questions(bucket, userId, prevTermId, currTermId, pairinfo):**
    - **Argument:**
        - **bucket:** cloud storage bucket, need it to gain access to files
        - **userId:** user’s id stored in Firebase
        - **prevTermId:** previous term’s id stored in Firebase
        - **currTermId:** current term’s id stored in Firebase
        - **pairinfo:** dataframe that contains previous term question and current term question pairs
    - **Flow:**
        - Construct file paths of data.csv files for each term based on userId and termId. Invoke load_data_with_anid for each term and get back the dataframe that contains that term’s clicker data.
        - If anid column contains null values, remove that row.
        - Convert anid column to be integers, and then sort the rows by anid.
        - Remove duplicate columns.

- **load_data_with_anid(fname, pairinfo, bucket, ID):**
    - **Argument:**
        - **fname:** file path of data.csv of the term
        - **pairinfo:** dataframe that contains previous term question and current term question pairs
        - **bucket:** cloud storage bucket, need it to gain access to files
        - **ID:** term’s id (the term that we are trying to download the data.csv from)
    - **Flow:**
        - Download the file into a dataframe.
        - Since pairinfo[ID] is a column of question names of that term (ID), list out the questions using list(pairinfo[ID]), and then add anid and exam_total, they will be the new dataframe column names that we want.
        - Extract a new dataframe containing target column names.

- **convert_to_universal_qid(pairinfo, train, test, course):**
    - **Argument:**
        - **pairinfo:** dataframe that contains previous term question and current term question pairs
        - **train:** the training dataframe
        - **test:** the testing dataframe
        - **course:** course name (deprecated)
    - **Flow:**
        - Drop both anid columns of the train and test dataframes. Invoke ProcessClickerQData to get processed train and test dataframes. Then add back the removed anid column for both dataframes.

- **ProcessClickerQData(pair, data, whichcolumn):**
    - **Argument:**
        - **pair:** dataframe that contains previous term question and current term question pairs
        - **data:** the previous or current term dataframe
        - **whichcolumn:** the column number of the pairinfo, which contains the clicker data of a term. (So get previous term data from [1], get current term data from [2])
    - **Flow:**
        - Get the universal question names from the first column of pairinfo.
        - For either the previous or current term, for each question in that term’s dataframe, first get its question name. If this question also appears in pairinfo (in that term’s column), get its index (or column number) in that term column, store this question name inside array “keep”, store the corresponding universal question name in array “new_name”.
        - Get all columns based on array “keep”, then change the column names to be the new question names, return this newly constructed dataframe.

- **convert_responses_to_correctness_train_test(course, train, test, pair):**
    - **Argument:**
        - **course:** course name (deprecated)
        - **train:** the training dataframe
        - **test:** the testing dataframe
        - **pair:** dataframe that contains previous term question and current term question pairs
    - **Flow:**
        - Both the train and test dataframes drop anid column, then for each one invoke convert_responses_to_correctness to get scaled dataframe.
        - Invoke change_columnnames to change clicker question names as QNAME_c to represent student correctness.
        - Get the anid column from the train dataframe and then concatenate with the scaled dataframe, for both the previous term and current term. (Check pandas concat for more info)

- **convert_responses_to_correctness(data, pair):**
    - **Argument:**
        - **data:** the dataframe that contains clicker data, anid column removed
        - **pair:** dataframe that contains previous term question and current term question pairs
    - **Flow:**
        - For each column of the dataframe, get its question name, then find the name’s index from pairinfo’s qid column, which is the row number of that question. Get correct answers (cans) from pairinfo using that row number.
        - Since cans can be multiple answers, which will be a number >= 10 in that case, we then separate cans and make sure correct answers will be an array, something like [1, 2, 3].
        - Get all student response of that question as resp.
        - If answer is correct, save a 1; if not answered, save a 0; if answer is incorrect, save a -1. Save this correctness column and overwrite the original clicker question column.

- **change_columnnames(df):**
    - **Argument:**
        - **df:** the scaled dataframe that is to be changed
    - **Flow:**
        - Append a “_c” to each old column name, and set these as the new column names.

- **merge_correctness(train, test):**
    - **Argument:**
        - **train:** the training dataframe
        - **test:** the testing dataframe
    - **Flow:**
        - Extract anid column for both train and test dataframes and save them, then drop the anid column in train and test dataframes, construct a new column “clicker”, which is just the mean value of all the rest columns, and then add that column to the saved anid column, and return the new dataframes.

- **factorize_responses(train, test):**
    - **Argument:**
        - **train:** the training dataframe
        - **test:** the testing dataframe
    - **Flow:**
        - Change each column of both dataframes to categories of [1, 2, 3, 4, 5, 6]. (Which doesn’t really change the value itself, just adds a category to each column). For more details, look at pandas Categorical & Series.

- **normalize_data(data):**
    - **Argument:**
        - **data:** the dataframe that is to be normalized
    - **Flow:**
        - For each column other than the anid column, scale that column. (For more details look at scale).

- **FindParameters(coursename, data):**
    - **Note:** using random number here might not perform the same as R, not tested thoroughly.
    - **Argument:**
        - **coursename:** name of the training course, deprecated
        - **data:** dataframe to train, should contain at least mean score of clickers and the final score.
    - **Flow:**
        - The goal of this function is to keep using different combination of parameters and get training results, among those pick the best parameters and return.
        - The values picked are directly copied from the R version, parameters are weight, cost, gamma.
        - Keep multiple dataframes to record the result of different traits, details will not be included here (as I also don’t know what they really meant).
        - Invoke create_validation_train_test2 to randomly generate 2 set of data, one used as the train set, one used as the test set, use k-fold validation to further improve the training accuracy. (see K-Fold validation for more details).
        - The method will find the best parameters and proceed to the actual prediction. (For each set of parameters invoke SVC to get all sort of validation data, see SVC for more details).

- **create_validation_train_test2(data, vmethod, seed):**
    - **Note:** using random number here might not perform the same as R, not tested thoroughly.
    - **Argument:**
        - **data:** the dataset to be separated
        - **vmethod:** validation method flag, default to be 0
        - **seed:** a pseudo random number generating seed
    - **Flow:**
        - Simply randomly separate the dataset into 2 train and test sets, size 1 to 2.

- **AnalyzeConfidence(bucket, userId, prevTermId, currTermId, pf_prob):**
    - **Argument:**
        - **bucket:** cloud storage bucket, need it to gain access to files
        - **userId:** user’s id stored in Firebase
        - **prevTermId:** previous term’s id stored in Firebase
        - **currTermId:** current term’s id stored in Firebase
        - **pf_prob:** predicted confidence pair, student match to fail probablity.
    - **Flow:**
        - Strip out the pairs from pf_prob, then create the dataframe, and write the dataframe as a csv file onto Firebase. This file will eventually be read by the web app at the last stage.

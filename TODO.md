### General:
- Have home screen
    - The purpose of this is to show previous runs and the current run (if the user logs back in after he/she logged out in the middle of a run)


-	Loading preexisting term data


- For all stages:
    - Have dropdown ( or anything else ) that will allow user to go back to specific question
    - More interactive instructions/guidelines
    - Pop up when you first go stage
    - Small walkthrough


- Auto matches shown -- please check if they are correct


- Check if images shown as matches for previous term arent literally from previous term image set and vice versa (ask if you do not understand)


### Choose-answers:
- Add interface type to return objects with type values defined


- Try to coalesce prevTermFinished and termfinishedAnswering into one variable


- Generalize code for any number of terms rather than 2 terms


- Remove service files from choose answers


- Make select answers into virtual scroll


- If the user loads a preexisting term, which if in the past was a current term, then it wont have all the questions answered -- only show images that need to be answered



### Choose-grouping:
- Check if can remove termFinishedAns and needGrouping


- Don't have virtual scroll after we are finished (non-priority)



### Choose-matches:
- Check populating image matches method in ngOninit and nextImage


- Add interface


- At the end: show matched pairs -- but allow for users to change matches


- While showing matches also show the answer to that match


- Have ability to change answer in that area


- Show summary -- don’t show all images (images after the first 3 weeks) when show summary is clicked


##### Change readme to have developer commands or docs — steps on how to reproduce the code


### Process:
- Process should make a post request, instead of get.


- unloadNotification should check dirty instead of always returning false, when user close tab it doesn’t save data into localStorage.


- Fix summary virtualscroll, it needs to be refreshed to show up.


### Result:
- Contact students after results


### GCP functions:
- Post request GCP function in Node

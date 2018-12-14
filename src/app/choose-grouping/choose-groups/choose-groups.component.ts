import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {forEach} from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-choose-groups',
  templateUrl: './choose-groups.component.html',
  styleUrls: ['./choose-groups.component.css']
})
export class ChooseGroupsComponent implements OnInit {
  boxValues = [{opt: 'Individual'}, {opt: 'Group'}, {opt: 'Isomorphic'}, {opt: 'Ignore'}];
  imageNames;
  imageIndex;
  imagesFinished; // if we finish reading all the images

  // new code
  allGroupedAnswers: FormArray;
  boxOne: FormGroup;
  boxTwo: FormGroup;
  boxThree: FormGroup;
  boxOneRadioClicked: boolean;
  boxTwoRadioClicked: boolean;
  boxThreeRadioClicked: boolean;
  disableBoxOne: boolean;
  disableBoxTwo: boolean;

  constructor(private fb: FormBuilder) {
    this.imageNames = this.getImageNames();
    this.imageIndex = 0;
    this.imagesFinished = false;
  }

  ngOnInit() {

    this.boxOne = this.fb.group({
     option: [''],
    });

    this.boxTwo = this.fb.group({
     option: [''],
    });

    this.boxThree = this.fb.group({
     option: [''],
    });

    this.allGroupedAnswers = this.fb.array([]);

  }

  // TODO DO THESE CASES ALSO WORK IF THE FIRST QUESTION IS IGNORE
  nextImage() {
    console.log(this.imageIndex);
    console.log(this.imageNames.length);
    if((this.imageNames.length - this.imageIndex) <= 3 ){
      this.imagesFinished = true;
      alert("inside" + this.imageIndex + this.imageNames.length);
      return;
    }
    // different scenarios
    const boxOneValue = this.boxOne.controls.option.value;
    const boxTwoValue = this.boxTwo.controls.option.value;
    const boxThreeValue = this.boxThree.controls.option.value;
    if( boxTwoValue === 'Individual' && ( boxThreeValue === 'Group' || boxThreeValue === 'Isomorphic') ){

      this.imageIndex += 1;

      this.allGroupedAnswers.push(this.boxOne);

      this.boxOne = this.boxTwo;
      this.boxTwo = this.boxThree;

      this.disableBoxOne = true;
      this.disableBoxTwo = true;

      this.boxThree = this.fb.group({
        option: [''],
      });
      this.boxThreeRadioClicked = false;

    }
    else if( ( boxTwoValue !== 'Individual' && boxThreeValue === 'Individual') ||
             ( boxTwoValue === 'Individual' && boxThreeValue === 'Individual') ) {
      this.imageIndex += 2;

      this.allGroupedAnswers.push(this.boxOne);
      this.allGroupedAnswers.push(this.boxTwo);

      this.boxOne = this.boxThree;
      this.disableBoxOne = true;
      this.disableBoxTwo = false;

      this.boxTwo = this.fb.group({
        option: [''],
      });
      this.boxTwoRadioClicked = false;

      this.boxThree = this.fb.group({
        option: [''],
      });
      this.boxThreeRadioClicked = false;

    }
    else{
      this.imageIndex += 3;

      this.allGroupedAnswers.push(this.boxOne);
      this.allGroupedAnswers.push(this.boxTwo);
      this.allGroupedAnswers.push(this.boxThree);

      this.disableBoxOne = false;
      this.disableBoxTwo = false;

      this.boxOne = this.fb.group({
        option: [''],
      });
      this.boxOneRadioClicked = false;

      this.boxTwo = this.fb.group({
        option: [''],
      });
      this.boxTwoRadioClicked = false;

      this.boxThree = this.fb.group({
        option: [''],
      });
      this.boxThreeRadioClicked = false;

    }
  }
  updateChecked(boxNum: number){
    // if(this.boxOne.controls.option)
    if( boxNum === 1 ){
      this.boxOneRadioClicked = true;
    }
    else if( boxNum === 2 ){
      this.boxTwoRadioClicked = true;
    }
    else if( boxNum === 3 ){
      this.boxThreeRadioClicked = true;
    }
  }

  // checkes if all the images are checked or if the unchecked ones are hidden
  allChecked(){
    const boxTwoHidden = this.imageIndex+2 >= this.imageNames.length;
    const boxThreeHidden = this.imageIndex+3 >= this.imageNames.length;

    return this.boxOneRadioClicked &&
          (this.boxTwoRadioClicked || boxTwoHidden) &&
          (this.boxThreeRadioClicked || boxThreeHidden);

  }
  getImageNames(){
    return ['https://www.catster.com/wp-content/uploads/2018/07/Savannah-cat-long-body-shot.jpg',
            'https://www.catster.com/wp-content/uploads/2017/08/Pixiebob-cat.jpg',
            'http://catsatthestudios.com/wp-content/uploads/2017/12/12920541_1345368955489850_5587934409579916708_n-2-960x410.jpg',
            'https://s.hswstatic.com/gif/ragdoll-cat.jpg',
            'http://www.cutestpaw.com/wp-content/uploads/2011/11/To-infinity-and-beyond.jpeg',
            'http://www.youloveit.com/uploads/posts/2017-03/1489320913_youloveit_com_hosico_cat01.jpg',
            'https://i.kinja-img.com/gawker-media/image/upload/s--kHrQ8nr7--/c_scale,f_auto,fl_progressive,q_80,w_800/18huxz4bvnfjbjpg.jpg',
            'https://timedotcom.files.wordpress.com/2018/08/new-zealand-cat-ban.jpg',
            'https://www.105.net/resizer/659/-1/true/1516801821090.jpg--cercasi_coccolatori_di_gatti_professionisti_in_irlanda_.jpg?1516801823000',
            'http://www.smashingphotoz.com/wp-content/uploads/2012/11/11_cat_photos.jpg',
            'https://www.thehappycatsite.com/wp-content/uploads/2017/05/cute1.jpg',
            'https://media.makeameme.org/created/javascript-javascript-everywhere.jpg'

          ];
  }

}

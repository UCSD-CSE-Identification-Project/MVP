import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {forEach} from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-choose-groups',
  templateUrl: './choose-groups.component.html',
  styleUrls: ['./choose-groups.component.css']
})
export class ChooseGroupsComponent implements OnInit {
  boxValues1 = [{opt: 'Individual'}, {opt: 'Group'}, {opt: 'Isomorphic'}, {opt: 'Ignore'}];
  boxValues2 = [{opt: 'Individual'}, {opt: 'Group'}, {opt: 'Isomorphic'}, {opt: 'Ignore'}];
  boxValues3 = [{opt: 'Individual'}, {opt: 'Group'}, {opt: 'Isomorphic'}, {opt: 'Ignore'}];
  myForm: FormGroup;
  mappedAnswers =  [{Individual: [0, false, 'Individual'], Group: [1, false, 'Group'], Isomorphic: [2, false, 'Isomorphic'], Ignore: [3, false, 'Ignore']},
                    {Individual: [0, false, 'Individual'], Group: [1, false, 'Group'], Isomorphic: [2, false, 'Isomorphic'], Ignore: [3, false, 'Ignore']},
                    {Individual: [0, false, 'Individual'], Group: [1, false, 'Group'], Isomorphic: [2, false, 'Isomorphic'], Ignore: [3, false, 'Ignore']}];
  imageNames;
  imageIndex;
  imagesFinished; // if we finish reading all the images
  constructor(private fb: FormBuilder) {
    this.imageNames = this.getImageNames();
    this.imageIndex = 0;
    this.imagesFinished = false;
  }

  ngOnInit() {
    this.myForm = this.fb.group({
      matches: this.fb.array([]),
    });
  }

  onChange(option: string, isChecked: boolean, box: number) {
    if ( isChecked && this.mappedAnswers[box][option][1] === false ) {
      this.mappedAnswers[box][option][1] = true;
    } else if (!isChecked && this.mappedAnswers[box][option][1] === true ) {
      this.mappedAnswers[box][option][1] = false;
    }

  }

  checked(option: string, box:number){
    return this.mappedAnswers[box][option][1];
  }
  nextImage() {
    var lastImage;
  
    for (let i = 0; i < 3; i++){
      const emailFormArray = <FormArray>this.myForm.get('matches') as FormArray;
      const curAnswers = [];
    
      Object.values(this.mappedAnswers[i]).forEach(function (value) {
        if ( value[1] === true) {
          curAnswers.push(value[2]);
          lastImage = value[2];
          value[1] = false;
        }
      });

      //if (emailFormArray.get(this.imageNames))
      emailFormArray.push(new FormControl([this.imageNames[this.imageIndex+i], curAnswers]));
    }

    if ((this.imageIndex+2) >= this.imageNames.length - 1) {
      this.imagesFinished = true;
      return;
    }

    // We need to change this line to incorporate different scenarios 
    if (lastImage === 'Individual') {
      this.imageIndex += 2;
    } else if (lastImage === 'Group'){
      this.imageIndex += 1;
    } else{
      this.imageIndex += 3;
    }
    
    

  }

  getImageNames() {
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

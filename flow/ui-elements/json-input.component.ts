import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
  selector: 'json-input',
  templateUrl: './json-input.html'
})
export class JsonInputComponent implements OnInit {
  jDataValue:any;
  jDataStr:string;
  inputTypeValue:string;

  @Input()
  label:string

  @Input()
  set inputType(val) {
    if(val) {
      this.inputTypeValue = val
    }else {
      this.inputTypeValue = "text"
    }
  }


  @Input()
  set jData(val) {
    console.dir(val)
    this.jDataStr = JSON.stringify(val);
   }

  @Output() jDataChange = new EventEmitter<any>();



  ngOnInit() {
  }

  constructor() {
    this.inputTypeValue = "text"
  }

  onChange(event) {

    try {
      this.jDataChange.emit(JSON.parse(event));
      console.dir(event);
    }catch (e) {


    }


  }



}

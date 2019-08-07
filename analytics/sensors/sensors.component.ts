import {Component,OnInit} from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {ThingsRegistryService} from "../../registry/registry.service";

@Component({
  selector: 'app-analytics-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {
  constructor(private registry:ThingsRegistryService) {

  }

  ngOnInit() {

  }

}

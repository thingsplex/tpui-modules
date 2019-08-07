import {Component,OnInit} from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {ThingsRegistryService} from "../../registry/registry.service";

@Component({
  selector: 'app-analytics-presence',
  templateUrl: './presence.component.html',
  styleUrls: ['./presence.component.css']
})
export class PresenceComponent implements OnInit {
  constructor(private registry:ThingsRegistryService) {

  }

  ngOnInit() {

  }

}

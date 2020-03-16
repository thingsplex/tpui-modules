import {Component,OnInit} from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {ThingsRegistryService} from "../../registry/registry.service";

@Component({
  selector: 'app-analytics-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {
  public query : string;
  constructor(private registry:ThingsRegistryService) {
    this.query = "SELECT mean(\"value\") AS \"mean_value\" FROM \"default_20w\".\"electricity_meter_power\" WHERE time > now()-1d GROUP BY time(60m),\"location_id\" FILL(previous)"
  }
  ngOnInit() {

  }

}

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
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.css']
})
export class EnergyComponent implements OnInit {
  public queryPower : string;
  public queryEnergy: string;
  constructor(private registry:ThingsRegistryService) {
   this.queryPower = "SELECT mean(\"value\") AS \"mean_value\" FROM \"default_20w\".\"electricity_meter_power\" WHERE time > now()-1d GROUP BY time(10m),\"location_id\" FILL(previous)"
  }
  ngOnInit() {

  }

}

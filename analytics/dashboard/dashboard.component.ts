import {Component,OnInit} from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {ThingsRegistryService} from "../../registry/registry.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public totalThings :number;
  public totalServices : number;
  public totalLocations :number;

  public totalFlows : number;
  public totalFlowNodes : number;
  public totalFlowTriggers : number;
  public totalFlowsExecuted :number;
  public totalFlowsFailed :number;
  public totalActiveFlows :number;

  public thingsByTechnology : number[];
  public thingsTechLabels : string[];

  public locationNames : string[] = [];
  public thingsPerLocation : number[]=[];

  constructor(private registry:ThingsRegistryService) {

  }

  ngOnInit() {
    this.thingsByTechnology = [3,6];
    this.thingsTechLabels = ["zwave","zigbee"];
    this.calculateDevicesPerLocation();
    if (this.registry.things == undefined) {
      return
    }
    this.totalThings = this.registry.things.length;
    this.totalServices = this.registry.services.length;
    this.totalLocations = this.registry.locations.length;

  }

  calculateDevicesPerLocation() {
    for (let loc of this.registry.locations) {
      let count = this.registry.getThingsForLocation(loc.id).length;
      this.locationNames.push(loc.alias+": "+count);
      this.thingsPerLocation.push(count);
    }
  }



}

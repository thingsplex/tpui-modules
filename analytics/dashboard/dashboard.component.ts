import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {ThingsRegistryService} from "../../registry/registry.service";
import {BACKEND_ROOT} from "../../../globals";
import {HttpClient, HttpParams} from "@angular/common/http";
import {SimplePieChartComponent} from "../charts/simple-pie-chart.component";
import {Subscription} from "rxjs";
import {AnalyticsSettingsService} from "../charts/settings.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @ViewChild('flowStateChart') flowStateChartRef: SimplePieChartComponent;
  @ViewChild('flowExecutionStatsChart') flowExecutionStatsRef: SimplePieChartComponent;
  @ViewChild('locationsChart') locationsChartRef: SimplePieChartComponent;
  @ViewChild('thingsByTechChart') thingsByTechChartRef: SimplePieChartComponent;
  @ViewChild('thingsByPowerChart') thingsByPowerChartRef: SimplePieChartComponent;


  public totalThings :number;
  public totalServices : number;
  public totalLocations :number;

  public totalFlows : number = 0;
  public totalFlowNodes : number = 0;
  public totalFlowTriggers : number;
  public totalFlowsExecuted :number;
  public totalFlowsFailed :number;
  public totalActiveFlows :number;

  public flowExecutionStats : number[] = [];
  public flowExecutionLabels : string[] = [];

  public flowStateStats : number[] = [];
  public flowStateLabels : string[] = [];


  public thingsByTechnology : number[];
  public thingsTechLabels : string[];

  public thingsByPower : number[] = [];
  public thingsPowerLabels : string[] = [];

  public locationNames : string[] = [];
  public thingsPerLocation : number[]=[];

  private registrySub: Subscription = null;

  constructor(private registry:ThingsRegistryService,private http:HttpClient,private settings:AnalyticsSettingsService ) {

  }

  ngOnInit() {
    console.log("Dashboard initialized");
    this.thingsByTechnology = [];
    this.thingsTechLabels = [];

    if (!this.registry.isRegistryInitialized()) {
      if (!this.registrySub) {
        this.registrySub = this.registry.registryState$.subscribe((state) => {
          if(state=="allLoaded") {
            this.calculateDevicesPerLocation();
            this.calculateThingsByType();
            this.calculateRegistryTotals();
            this.updateAllCharts();
          }
          console.log("new registry state = "+state);

        });
      }
    }else {
      this.calculateDevicesPerLocation();
      this.calculateThingsByType();
      this.calculateRegistryTotals();
    }
    this.calculateFlowStats();
  }

  ngOnDestroy() {
    if(this.registrySub)
      this.registrySub.unsubscribe();
  }

  updateAllCharts() {
    this.locationsChartRef.update();
    this.thingsByTechChartRef.update();
    this.thingsByPowerChartRef.update();
  }

  calculateRegistryTotals() {
    if (this.registry.things == undefined || this.registry.services == undefined || this.registry.locations == undefined) {
      return
    }
    this.totalThings = this.registry.things.length;
    this.totalServices = this.registry.services.length;
    this.totalLocations = this.registry.locations.length;
  }

  calculateDevicesPerLocation() {
    this.locationNames.splice(0,this.locationNames.length)
    this.thingsPerLocation.splice(0,this.thingsPerLocation.length)
    if (this.registry.locations == undefined)
      return;
    for (let loc of this.registry.locations) {
      let locObj = this.registry.getThingsForLocation(loc.id);
      if (locObj == undefined)
        continue;
      let count = locObj.length;
      this.locationNames.push(loc.alias+": "+count);
      this.thingsPerLocation.push(count);
    }
  }

  calculateThingsByType() {
    if (this.registry.things == undefined)
      return;
    let thingsByTech : any = {};
    let thingsByPower : any = {};
    for (let thing of this.registry.things) {
      if (thingsByTech[thing.comm_tech]==undefined)
        thingsByTech[thing.comm_tech] = 1 ;
      else
        thingsByTech[thing.comm_tech]++;  // power source

      if (thingsByPower[thing.power_source]==undefined)
        thingsByPower[thing.power_source] = 1 ;
      else
        thingsByPower[thing.power_source]++;  // power source
    }
    for (let t in thingsByTech) {
      this.thingsTechLabels.push(t+": "+thingsByTech[t]);
      this.thingsByTechnology.push(thingsByTech[t])
    }
    for (let t in thingsByPower) {
      this.thingsPowerLabels.push(t+": "+thingsByPower[t]);
      this.thingsByPower.push(thingsByPower[t])
    }
  }

  calculateFlowStats() {
      let flows : any;
      this.http.get(BACKEND_ROOT+'/fimp/flow/list', { } )
        .subscribe(result=>{
          flows = result;
          this.totalFlows = flows.length ;
          let flowsByState : any = {};
          let successCount = 0;
          let failedCount = 0;
          for(let n of flows) {
            this.totalFlowNodes += n.Stats.NumberOfNodes
            successCount += n.TriggerCounter-n.ErrorCounter;
            failedCount += n.ErrorCounter;


            if (flowsByState[n.State]==undefined)
              flowsByState[n.State] = 1 ;
            else
              flowsByState[n.State]++;  // power source
          }
          this.flowExecutionLabels.push("success: "+successCount);
          this.flowExecutionLabels.push("failed: "+failedCount);
          this.flowExecutionStats.push(successCount);
          this.flowExecutionStats.push(failedCount);


          for (let t in flowsByState) {
            this.flowStateLabels.push(t+": "+flowsByState[t]);
            this.flowStateStats.push(flowsByState[t]);
          }

          console.dir(this.flowExecutionLabels);
          console.dir(this.flowExecutionStats);

          console.dir(this.flowStateLabels);
          console.dir(this.flowStateStats);

          this.flowStateChartRef.update();
          this.flowExecutionStatsRef.update();

        });

  }




}

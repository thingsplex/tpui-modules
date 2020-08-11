import {Component,OnInit} from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {ThingsRegistryService} from "../../registry/registry.service";
import {AnalyticsSettingsService} from "../charts/settings.service";

@Component({
  selector: 'app-analytics-explore',
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.css']
})
export class EnergyComponent implements OnInit {
  selectedSensorTypes = [];
  timeFromNow :string = "1d";
  groupByTime :string = "1h";
  groupByTag  :string = "location_id";
  private _refreshRate :number = 60;
  gSize : number = 350;
  fillGaps : boolean = false;
  dataProcFunc : string = "mean";
  dataTransformFuncV : string = "";
  reloadSignal:boolean;
  intervalTimer:any;
  toTime :string = "";
  fromTime:string = "";
  set refreshRate(rate : number) {
    if (rate==-1)
      return;
    this._refreshRate = rate;
    if (this.intervalTimer!=undefined) {
      clearInterval(this.intervalTimer);
    }
    this.intervalTimer = setInterval(r=>this.reload(),this._refreshRate*1000);

  }
  get refreshRate():number {
    return this._refreshRate;
  }
  constructor(private registry:ThingsRegistryService,private settings:AnalyticsSettingsService) {
  }
  ngOnInit() {
    this.loadFromStorage();
  }

  reload() {
    if(this.reloadSignal)
      this.reloadSignal = false;
    else {
      this.reloadSignal = true;
    }
  }
  save() {
    this.saveToStorage()
  }

  fromDateChange(event) {
    if(event.value)
      this.fromTime = event.value.format("YYYY-MM-DDTHH:mm:ss")+"Z";
    else
      this.fromTime = "";
  }

  toDateChange(event) {
    if(event.value)
      this.toTime = event.value.format("YYYY-MM-DDTHH:mm:ss")+"Z";
    else
      this.toTime = "";
  }

  saveToStorage() {
    let configs = {};
    configs["selectedSensorTypes"] = this.selectedSensorTypes;
    configs["groupByTag"] = this.groupByTag;
    configs["groupByTime"] = this.groupByTime;
    configs["timeFromNow"] = this.timeFromNow;
    configs["gSize"] = this.gSize;
    configs["refreshRate"] = this.refreshRate;
    configs["fillGaps"] = this.fillGaps;
    configs["dataProcFunc"] = this.dataProcFunc;
    this.settings.updateDashboardConfigs("genericEnergy",configs);
    this.settings.save();
  }

  loadFromStorage():boolean {
    let configs = this.settings.getDashboardConfigs("genericEnergy");
    if (configs) {
      this.selectedSensorTypes = configs["selectedSensorTypes"];
      this.groupByTag = configs["groupByTag"];
      this.groupByTime = configs["groupByTime"];
      this.timeFromNow = configs["timeFromNow"];
      this.gSize = configs["gSize"];
      this.refreshRate = configs["refreshRate"];
      this.fillGaps = configs["fillGaps"];
      this.dataProcFunc = configs["dataProcFunc"];
      return true
    }
    return false;
  }

}

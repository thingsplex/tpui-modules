import {Component,OnInit} from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {ThingsRegistryService} from "../../registry/registry.service";
import {Subscription} from "rxjs";
import {AnalyticsSettingsService} from "../charts/settings.service";

@Component({
  selector: 'app-analytics-presence',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {
  public selectedActivityTypes :any[] = ["sensor_presence.evt.presence.report","sensor_contact.evt.open.report"];
  public listOfActivityTypes : any[] ; // {type:"sensor_temp.evt.sensor.report",name:"Temperature",isSelected:true}
  private lastRequestId : string ;
  private globalSub : Subscription;
  timeFromNow :string = "1d";
  groupByTime :string = "1h";
  groupByTag  :string = "location_id";
  private _refreshRate :number = 60;
  gSize : number = 350;
  fillGaps : boolean = false;
  dataProcFunc : string = "mean";
  reloadSignal:boolean;
  intervalTimer:any;
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
    this.listOfActivityTypes = [
      {type:"sensor_presence.evt.presence.report",name:"Motion intensity",isSelected:true},
      {type:"sensor_contact.evt.open.report",name:"Open/close reports",isSelected:true},
      {type:"out_bin_switch.evt.binary.report",name:"On/off reports",isSelected:false},
      {type:"out_lvl_switch.evt.binary.report",name:"Level-on/off change reports",isSelected:false},
      {type:"out_lvl_switch.evt.lvl.report",name:"Level change reports",isSelected:false},
      // {type:"scene_ctrl.evt.scene.report",name:"Scene/mode reports",isSelected:false},
    ];
    this.loadFromStorage();
    this.updateListOfActivityTypes();
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

  updateListOfActivityTypes() {
    for (let st of this.listOfActivityTypes) {
      let isSelected = false;
      for(let selSenT of this.selectedActivityTypes) {
        if (st.type == selSenT) {
          isSelected = true;
          break;
        }
      }
      st.isSelected = isSelected;
    }
  }

  saveToStorage() {
    let configs = {};
    configs["selectedActivityTypes"] = this.selectedActivityTypes;
    configs["groupByTag"] = this.groupByTag;
    configs["groupByTime"] = this.groupByTime;
    configs["timeFromNow"] = this.timeFromNow;
    configs["gSize"] = this.gSize;
    configs["refreshRate"] = this.refreshRate;
    configs["fillGaps"] = this.fillGaps;
    configs["dataProcFunc"] = this.dataProcFunc;
    this.settings.updateDashboardConfigs("genericActivity",configs);
    this.settings.save();
  }

  loadFromStorage():boolean {
    let configs = this.settings.getDashboardConfigs("genericActivity");
    if (configs) {
      this.selectedActivityTypes = configs["selectedActivityTypes"];
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

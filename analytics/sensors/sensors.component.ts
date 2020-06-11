import {Component, OnInit, ViewChild} from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {ThingsRegistryService} from "../../registry/registry.service";
import {FimpMessage, NewFimpMessageFromString} from "../../../fimp/Message";
import {FimpService} from "../../../fimp/fimp.service";
import {Subscription} from "rxjs";
import {LineChartComponent} from "../charts/line-chart.component";
import {AnalyticsSettingsService} from "../charts/settings.service";

var sensorTypeMap = {
  "sensor_temp.evt.sensor.report":"Temperature",
  "sensor_humid.evt.sensor.report":"Humidity",
  "sensor_lumin.evt.sensor.report":"Light",
  "sensor_co2.evt.sensor.report":"CO2 level",
  "sensor_uv.evt.sensor.report":"Ultraviolet light",
}

@Component({
  selector: 'app-analytics-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {
  public selectedSensorTypes :any[] = ["sensor_temp.evt.sensor.report"];
  public listOfSensorTypes : any[] = []; // {type:"sensor_temp.evt.sensor.report",name:"Temperature",isSelected:true}
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

  @ViewChild('sensorChart') sensorChartRef: LineChartComponent;



  constructor(private registry:ThingsRegistryService,private fimp : FimpService,private settings:AnalyticsSettingsService) {

  }

  ngOnInit() {
    this.loadFromStorage();
    this.loadListOfSensorTypes();
  }

  ngOnDestroy() {
    if(this.globalSub)
      this.globalSub.unsubscribe();
  }

  loadListOfSensorTypes() {
    this.globalSub = this.fimp.getGlobalObservable().subscribe((msg) => {
      let fimpMsg = NewFimpMessageFromString(msg.payload.toString());
      if (fimpMsg.service == "ecollector" && fimpMsg.corid ==this.lastRequestId ){
        if (fimpMsg.mtype == "evt.tsdb.measurements_report") {
          if (fimpMsg.val) {
            this.listOfSensorTypes.splice(0,this.listOfSensorTypes.length)
            for (let t of fimpMsg.val) {
              if(t.includes("sensor") && t.includes(".evt.")){
                if (t.includes("contact")||t.includes("presence") )
                  continue;
                let name = sensorTypeMap[t];
                if (name == undefined) {
                  name = t.replace(".evt.sensor.report","")
                }
                this.listOfSensorTypes.push({type:t,name:name,isSelected:false});
              }

            }
            this.updateListOfSensorTypes();
          }
        }
      }
    });
    this.queryData();
  }
  //(change)="updateChart($event)"
  // updateChart(event) {
  //   this.sensorChartRef.measurement = event.value;
  //   this.sensorChartRef.title  = "";
  //   this.sensorChartRef.queryData();
  // }

  updateSelectedSensorTypes() {
    this.updateListOfSensorTypes();
  }

  updateListOfSensorTypes() {
    for (let st of this.listOfSensorTypes) {
      let isSelected = false;
      for(let selSenT of this.selectedSensorTypes) {
        if (st.type == selSenT) {
          isSelected = true;
          break;
        }
      }
      st.isSelected = isSelected;
    }
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
    this.settings.updateDashboardConfigs("genericSensors",configs);
    this.settings.save();
  }

  loadFromStorage():boolean {
    let configs = this.settings.getDashboardConfigs("genericSensors");
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

  queryData() {
    let msg  = new FimpMessage("ecollector","cmd.tsdb.get_measurements","str_map",{},null,null)
    msg.src = "tplex-ui"
    this.lastRequestId = msg.uid;
    msg.resp_to = "pt:j1/mt:rsp/rt:app/rn:tplex-ui/ad:1"
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:ecollector/ad:1",msg.toString());
  }


}

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
import {SimplePieChartComponent} from "../charts/simple-pie-chart.component";
import {LineChartComponent} from "../charts/line-chart.component";

var sensorTypeMap = {
  "sensor_temp.evt.sensor.report":"Temperature",
  "sensor_humid.evt.sensor.report":"Humidity",
  "sensor_lumin.evt.sensor.report":"Light",
  "sensor_uv.evt.sensor.report":"Ultraviolet light",
}

@Component({
  selector: 'app-analytics-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {
  public selectedSensorTypes :any[] = ["sensor_temp.evt.sensor.report"];
  public listOfSensorTypes : any[] = [{type:"sensor_temp.evt.sensor.report",name:"Temperature",isSelected:true}];
  private lastRequestId : string ;
  private globalSub : Subscription;
  private
  timeFromNow :string = "2d";
  groupByTime :string = "1h";
  groupByTag  :string = "location_id";
  private _refreshRate :number = 60;
  gSize : number = 300;
  reloadSignal:boolean;
  intervalTimer:any;

  @ViewChild('sensorChart') sensorChartRef: LineChartComponent;

  set refreshRate(rate : number) {
    this._refreshRate = rate;
    if (this.intervalTimer!=undefined) {
      clearInterval(this.intervalTimer);
    }
    this.intervalTimer = setInterval(r=>this.reload(),this._refreshRate*1000);

  }
  get refreshRate():number {
    return this._refreshRate;
  }

  constructor(private registry:ThingsRegistryService,private fimp : FimpService) {

  }

  ngOnInit() {
    this.loadFromLocalStorage();
    this.loadListOfSensorTypes();
  }

  ngOnDestroy() {
    if(this.globalSub)
      this.globalSub.unsubscribe();
  }
  reload() {
    if(this.reloadSignal)
      this.reloadSignal = false;
    else {
      this.reloadSignal = true;
    }
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
  updateChart(event) {
    this.sensorChartRef.measurement = event.value;
    this.sensorChartRef.title  = "";
    this.sensorChartRef.queryData();
  }

  updateSelectedSensorTypes() {
    this.updateListOfSensorTypes();
    this.saveToLocalStorage();
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

  saveToLocalStorage() {
    localStorage.setItem("analyticsSelectedSensors", JSON.stringify(this.selectedSensorTypes));
  }

  loadFromLocalStorage():boolean {
    if (localStorage.getItem("analyticsSelectedSensors")!=null){
      this.selectedSensorTypes = JSON.parse(localStorage.getItem("analyticsSelectedSensors"));
      return true;
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

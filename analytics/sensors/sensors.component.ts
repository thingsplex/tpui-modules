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
  public selectedSensorType :string = "sensor_temp.evt.sensor.report";
  public listOfSensorTypes : any[] = [{type:"sensor_temp.evt.sensor.report",name:"Temperature"}];
  private lastRequestId : string ;
  private globalSub : Subscription;
  @ViewChild('sensorChart') sensorChartRef: LineChartComponent;

  constructor(private registry:ThingsRegistryService,private fimp : FimpService) {

  }

  ngOnInit() {
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
                this.listOfSensorTypes.push({type:t,name:name});
              }

            }
          }
        }
      }
    });
    this.queryData();
  }

  updateChart(event) {
    this.sensorChartRef.measurement = event.value;
    this.sensorChartRef.title  = "";
    this.sensorChartRef.queryData();
  }

  queryData() {
    let msg  = new FimpMessage("ecollector","cmd.tsdb.get_measurements","str_map",{},null,null)
    msg.src = "tplex-ui"
    this.lastRequestId = msg.uid;
    msg.resp_to = "pt:j1/mt:rsp/rt:app/rn:tplex-ui/ad:1"
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:ecollector/ad:1",msg.toString());
  }


}

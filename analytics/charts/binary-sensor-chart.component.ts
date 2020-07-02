import {Component, ElementRef, ViewChild,OnInit,Input,Output,EventEmitter} from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {ThingsRegistryService} from "../../registry/registry.service";
import {FimpService} from "../../../fimp/fimp.service";
import {Subscription} from "rxjs";
import {FimpMessage, NewFimpMessageFromString} from "../../../fimp/Message";
import {AnalyticsSettingsService} from "./settings.service";

declare var moment: any;
declare var Chart: any;

@Component({
  selector: 'binary-sensor-chart',
  templateUrl: './binary-sensor-chart.html'
})
export class BinarySensorChartComponent implements OnInit  {
  @Input() measurement     : string;
  @Input() title           : string;
  @Input() timeFromNow     : string;
  @Input() groupByTime     : string;
  @Input() groupByTag      : string;
  @Input() filterById      : string;
  @Input() filterByTopic   : string;
  @Input() isFilterEnabled : boolean;
  @Input() fillGaps        : boolean;
  @Input() dataProcFunc    : string;
  @Input() set height (val: number) {
    this._height = String(val)+"px";

  }
  get height():number {
    return 0;
  }
  @Input() set change(v:boolean) {
    console.log("QUery on change");
    this.queryData();
  }
  get change(){
    return true;
  }
  @ViewChild('canvas')
  canvasElement: ElementRef;

  globalSub : Subscription;

  chart : any;
  private _height:string;
  public chartLabels:string[] = [];
  public chartType:string = 'bar';
  public chartLegend:boolean = true;
  public chartData:any[] = [];

  private lastRequestId : string ;

  constructor(private registry:ThingsRegistryService,private fimp : FimpService,private settings:AnalyticsSettingsService) {
  }

  transformData(queryResponse:any) {
    console.dir(queryResponse);
    this.chartLabels.splice(0,this.chartLabels.length)
    this.chartData.splice(0,this.chartData.length)

    let areLabelsConfigured = false;
    if (!queryResponse.Results) {
      console.log("transformData:Empty response");
      return
    }
    if (!queryResponse.Results[0].Series) {
      console.log("transformData:Empty response");
      return;
    }
    let addedObjects = [];
    let objectType = "";
    let serviceName = "";
    for (let val of queryResponse.Results[0].Series) {
      let data:any[] = [];
      for (let v of val["values"]) {
        data.push({t:moment.unix(v[0]),y:v[1],r:1});
      }
      serviceName = val.name;
      areLabelsConfigured = true;
      let label = "unknown";
      if (val.tags) {
        switch (this.groupByTag) {
          case "location_id":
            objectType = "location";
            let locationId = val.tags.location_id;
            let loc = this.registry.getLocationById(Number(locationId))
            if (loc) {
              if ((loc.length)>0)
                label = loc[0].alias;
              else
                label = "location "+locationId;
            }else {
              label = "location "+locationId;
            }
            addedObjects.push(locationId);
            break;
          case "service_id":
            let service = this.registry.getServiceById(Number(val.tags.service_id))
            if (service) {
              label = service.alias;
            }
            break;
          case "dev_id":
            objectType = "dev";
            let dev = this.registry.getDeviceById(Number(val.tags.dev_id))
            if (dev) {
              label = dev.alias +" in "+ dev.location_alias;
            }else {
              label = "device "+val.tags.dev_id
              console.log("No device for id = ",val.tags.dev_id)
            }
            addedObjects.push(val.tags.dev_id);
            break;
        }
      }

      this.chartData.push({
        data:data,
        label:label,
        backgroundColor:this.settings.getColor(label),
        fill:false,
        pointRadius:1.5,
        lineTension:0.2,
      });
    }
    //Adding missing objects
    if(objectType=="location") {
      for(let loc of this.registry.locations) {
        let result = addedObjects.filter(location => location == loc.id)
        if (result.length==0) {
          this.chartData.push({
            data:[],
            label:loc.alias,
            backgroundColor:this.settings.getColor(loc.alias),
            fill:false,
            pointRadius:1.5,
            lineTension:0.2
          });
        }
      }
    }else if(objectType=="dev") {
      serviceName = serviceName.split(".")[0];
      for(let dev of this.registry.getDevicesFilteredByService(serviceName)) {
        let result = addedObjects.filter(device => device == dev.id)
        if (result.length==0) {
          let label = dev.alias +" in "+ dev.location_alias;
          this.chartData.push({
            data:[],
            label:label,
            backgroundColor:this.settings.getColor(label),
            fill:false,
            pointRadius:1.5,
            lineTension:0.2
          });
        }
      }
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.canvasElement.nativeElement.style.height = this._height;
      if(this.timeFromNow == undefined)
      this.timeFromNow = "24h";
    if (this.measurement==undefined)
      this.measurement = "sensor_presence.evt.presence.report";
    if (this.groupByTag == undefined) {
      console.log("filterByTopic = "+this.filterByTopic);
      if (this.filterByTopic != undefined) {
        console.log("-------Topic filter is set---------");
        this.groupByTag = "none";
      }else
        this.groupByTag = "location_id"; // Also supported thing_id , service_id , topic
    }
    if (this.groupByTime == undefined)
      this.groupByTime = "30m";
    console.log("groupByTag = "+this.groupByTag);

    this.initChart();
    this.globalSub = this.fimp.getGlobalObservable().subscribe((msg) => {
      let fimpMsg = NewFimpMessageFromString(msg.payload.toString());
      if (fimpMsg.service == "ecollector" && fimpMsg.corid ==this.lastRequestId ){
        if (fimpMsg.mtype == "evt.tsdb.query_report") {
          console.log("Message from ecollector");
          if (fimpMsg.val) {
            this.transformData(fimpMsg.val);
            this.chart.update();
            this.settings.save();
          }
        }
      }
    });
    // this.queryData();
  }

  queryData() {
    let query = "";
    let fillMode = "null";
    if (this.fillGaps)
      fillMode = "previous"; // null/linear/previous
    // query = "SELECT last(value) AS last_value FROM \"default_20w\".\"sensor_temp.evt.sensor.report\" WHERE time > now()-48h  GROUP BY  location_id FILL(null)"
    if (this.filterByTopic!=undefined) {
      query = "SELECT value FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" and topic='"+this.filterByTopic+"' FILL("+fillMode+")"
    }else {
      query = "SELECT count(\"value\") AS \"count_value\" FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" and value=true GROUP BY time("+this.groupByTime+"), "+this.groupByTag+" FILL("+fillMode+")"
    }
    if (this.groupByTime != "none" && this.filterByTopic!=undefined) {
      query = "SELECT mean(\"value\") AS \"mean_value\" FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" and topic='"+this.filterByTopic+"' GROUP BY time("+this.groupByTime+") FILL("+fillMode+")"

    }
    let msg  = new FimpMessage("ecollector","cmd.tsdb.query","str_map",{"query":query},null,null)
    msg.src = "tplex-ui"
    this.lastRequestId = msg.uid;
    msg.resp_to = "pt:j1/mt:rsp/rt:app/rn:tplex-ui/ad:1"
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:ecollector/ad:1",msg.toString());
  }

  ngOnDestroy() {
    if(this.globalSub)
      this.globalSub.unsubscribe();
  }

  initChart() {
    var ctx = this.canvasElement.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        // labels: this.chartLabels,
        datasets: this.chartData
      },
      options: {
        maintainAspectRatio:false,
        responsive: true,
        title:{text:this.title,display:true},
        scales: {
          xAxes: [{
            type: 'time',
            bounds:'ticks',
            // distribution: 'linear',
            stacked: true,
            ticks: {
              source: 'data',
              autoSkip:false
            },
            time:{
              unit:'minute',
              displayFormats: {
                minute: 'H:mm'
              }
            }

          }],
          yAxes: [{
            stacked: true,
            ticks: {
              beginAtZero: true,
              autoSkip:false,
            }
          }]
        }
      }
    });
  }



}



// transformData(queryResponse:any) {
//   this.barChartData[0].data = [];
//   this.barChartLabels = [];
//   for (let val of queryResponse.Results[0].Series) {
//     let locationId = val.tags.location_id;
//     let count = val["values"][0][1];
//     if (typeof count === "boolean") {
//       if(count)
//         count = 1;
//       else
//         count = 0;
//     }
//     this.barChartData[0].data.push(count);
//     let loc = this.registry.getLocationById(Number(locationId))
//     console.dir(loc);
//     let locationAlias = "unknown";
//     if (loc) {
//       if ((loc.length)>0)
//         locationAlias = loc[0].alias;
//     }
//     this.barChartLabels.push(locationAlias);
//   }
//
// }

// initDatasets() {
//   let query = ""
//   if (this.limit==0) {
//     query = "SELECT last(value) AS last_value FROM \"default_20w\".\"sensor_presence.evt.presence.report\" WHERE time > now()-48h  GROUP BY  location_id FILL(null)"
//   }else {
//     query = "SELECT count(value) AS count FROM \"default_20w\".\"sensor_presence.evt.presence.report\" WHERE time > now()-"+this.limit+"h and value=true GROUP BY  location_id FILL(null)"
//   }
//
//   let msg  = new FimpMessage("ecollector","cmd.tsdb.query","str_map",{"query":query},null,null)
//   msg.src = "tplex-ui";
//   msg.uid = "100";
//   this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:ecollector/ad:1",msg.toString());
// }

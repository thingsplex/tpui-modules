import {Component, ElementRef, ViewChild,OnInit,Input} from '@angular/core';
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
  selector: 'line-chart',
  templateUrl: './line-chart.html'
})
export class LineChartComponent implements OnInit  {
  private _groupByTime : string;
  private _timeFromNow : string;
  private _groupByTag  : string;
  private _height:string;
  private isInitialized:boolean = false;

  @Input() measurement : string;
  @Input() title       : string;
  @Input() set timeFromNow(tm:string) {
    this._timeFromNow = tm;
    // this.queryData();
  }
  get timeFromNow():string {
    return this._timeFromNow;
  }

  @Input() set groupByTime(tm:string) {
    this._groupByTime = tm;
    // this.queryData();
  }
  get groupByTime():string {
    return this._groupByTime;
  }
  @Input() set groupByTag(tm:string){
    this._groupByTag = tm;
    // this.queryData();
  }
  get groupByTag():string {
    return this._groupByTag;
  }
  @Input() filterById      : string;
  @Input() filterByTopic   : string;
  @Input() query           : string;
  @Input() fromTime        : string;
  @Input() toTime          : string;
  @Input() isFilterEnabled : boolean;
  @Input() fillGaps        : boolean;
  @Input() dataProcFunc    : string;
  @Input() dataTransformFunc    : string;
  @Input() set height (val: number) {
    console.log("chart height has changed to"+val)
    this._height = String(val)+"px";
    if (this.canvasElement)
      this.canvasElement.nativeElement.style.height = this._height;

  }
  get height():number {
    return 0;
  }

  @Input() set change(v:boolean) {
    console.log("QUery on change");
    if (this.isInitialized)
      this.queryData();
  }
  get change(){
    return true;
  }


  @ViewChild('canvas')
  canvasElement: ElementRef;

  globalSub : Subscription;

  chart : any;
  public chartLabels:string[] = [];
  public chartType:string = 'line';
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
        data.push({t:moment.unix(v[0]),y:v[1]});
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
            }else
              label = "location "+locationId;
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
              addedObjects.push(val.tags.dev_id);
            }else {
              label = "device "+val.tags.dev_id;
              console.log("No device for id = ",val.tags.dev_id)
            }
            break;
        }
      }

      this.chartData.push({
        data:data,
        label:label,
        borderColor:this.settings.getColor(label),
        fill:false,
        pointRadius:1.5,
        lineTension:0.2
        // backgroundColor: 'rgba(27,255,16,0.23)',
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
            borderColor:this.settings.getColor(loc.alias),
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
            borderColor:this.settings.getColor(label),
            fill:false,
            pointRadius:1.5,
            lineTension:0.2

          });
        }
      }
    }
  }
  ngOnInit()
   {
     console.log("Trfunc 1 "+this.measurement+":"+this.dataTransformFunc )
   }

  ngAfterViewInit() {
    console.log("Trfunc 2 "+this.measurement+":"+this.dataTransformFunc )
    if(this.timeFromNow == undefined)
      this.timeFromNow = "24h";
    if (this.measurement==undefined)
      this.measurement = ""; //sensor_temp.evt.sensor.report
    if (this.groupByTag == undefined) {
      if (this.filterByTopic != undefined) {
        this.groupByTag = "none";
      }else
        this.groupByTag = "location_id"; // Also supported thing_id , service_id , topic
    }
    if (this.groupByTime == undefined)
      this.groupByTime = "30m";

    if (this.isFilterEnabled == undefined)
      this.isFilterEnabled = true;

    if(this._height == undefined){
      this._height = "350px";
    }
    this.canvasElement.nativeElement.style.height = this._height;

    this.initChart();
    this.globalSub = this.fimp.getGlobalObservable().subscribe((msg) => {
      let fimpMsg = NewFimpMessageFromString(msg.payload.toString());
      if (fimpMsg.service == "ecollector" && fimpMsg.corid ==this.lastRequestId ){
        if (fimpMsg.mtype == "evt.tsdb.query_report" || fimpMsg.mtype == "evt.tsdb.data_points_report") {
          if (fimpMsg.val) {
            this.transformData(fimpMsg.val);
            this.chart.update();
            this.settings.save();
          }
        }
      }
    });

    // console.log("QUery on init");
    this.queryData();
    this.isInitialized = true;
  }
  ngOnDestroy() {
    if(this.globalSub)
      this.globalSub.unsubscribe();
  }

  queryDataOld() {
    let fillMode = "null";
    if (!this.dataProcFunc)
      this.dataProcFunc = "mean";
    if (this.fillGaps)
      fillMode = "previous"; // null/linear/previous
    console.log("Measurement = "+this.measurement);
    let query = ""
    if (!this.measurement && !this.query)
      return
      // query = "SELECT last(value) AS last_value FROM \"default_20w\".\"sensor_temp.evt.sensor.report\" WHERE time > now()-48h  GROUP BY  location_id FILL(null)"
    if (this.filterByTopic!=undefined) {
      query = "SELECT value FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" and topic='"+this.filterByTopic+"' FILL("+fillMode+")"
    }else {
      query = "SELECT "+this.dataProcFunc+"(\"value\") AS \"mean_value\" FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" GROUP BY time("+this.groupByTime+"), "+this.groupByTag+" FILL("+fillMode+")"
    }
    if (this.groupByTime != "none" && this.filterByTopic!=undefined) {
      query = "SELECT "+this.dataProcFunc+"(\"value\") AS \"mean_value\" FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" and topic='"+this.filterByTopic+"' GROUP BY time("+this.groupByTime+") FILL("+fillMode+")"

    }
    if(this.query != undefined && this.query != "")
      query = this.query
    let msg  = new FimpMessage("ecollector","cmd.tsdb.query","str_map",{"query":query},null,null)
    msg.src = "tplex-ui"
    msg.resp_to = "pt:j1/mt:rsp/rt:app/rn:tplex-ui/ad:1"
    this.lastRequestId = msg.uid;
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:ecollector/ad:1",msg.toString());
  }

  queryData() {
    let fillMode = "null";
    if (!this.dataProcFunc)
      this.dataProcFunc = "mean";
    if (this.fillGaps)
      fillMode = "previous"; // null/linear/previous
    console.log("Measurement = "+this.measurement);
    if (!this.measurement)
      return
    console.log("Time from "+this.fromTime)
    let request = {
      "proc_id":1,
      "field_name":"value",
      "measurement_name":this.measurement,
      "relative_time":this.timeFromNow,
      "from_time":this.fromTime,
      "to_time":this.toTime,
      "group_by_time":this.groupByTime,
      "group_by_tag":this.groupByTag,
      "fill_type":fillMode,
      "data_function":this.dataProcFunc,
      "transform_function":this.dataTransformFunc
    }
    let msg  = new FimpMessage("ecollector","cmd.tsdb.get_data_points","object",request,null,null)
    msg.src = "tplex-ui"
    msg.resp_to = "pt:j1/mt:rsp/rt:app/rn:tplex-ui/ad:1"
    this.lastRequestId = msg.uid;
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:ecollector/ad:1",msg.toString());
  }


  initChart() {
    var ctx = this.canvasElement.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        // labels: this.chartLabels,
        datasets: this.chartData
      },
      options: {
        maintainAspectRatio:false,
        title:{text:this.title,display:true},
        scales: {
          xAxes: [{
            type: 'time',
            bounds:'ticks',
            distribution: 'linear',
            ticks: {
              source: 'data',
              autoSkip:true
            },
            time:{
              unit:'minute',
              stepSize:1,
              displayFormats: {
                minute: 'H:mm'
              }
            }

          }],
          yAxes: [{
            ticks: {
              beginAtZero: false,
              autoSkip:true
            }
          }]
        }
      }
    });
  }



}

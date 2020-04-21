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

  @Input() measurement : string;
  @Input() title       : string;
  @Input() set timeFromNow(tm:string) {
    this._timeFromNow = tm;
    this.queryData();
  }
  get timeFromNow():string {
    return this._timeFromNow;
  }

  @Input() set groupByTime(tm:string) {
    this._groupByTime = tm;
    this.queryData();
  }
  get groupByTime():string {
    return this._groupByTime;
  }
  @Input() set groupByTag(tm:string){
    this._groupByTag = tm;
    this.queryData();
  }
  get groupByTag():string {
    return this._groupByTag;
  }
  @Input() filterById  : string;
  @Input() filterByTopic : string;
  @Input() query       : string;
  @Input() isFilterEnabled : boolean;
  @Input() set height (val: number) {
    this._height = String(val)+"px";
    this.canvasElement.nativeElement.style.height = this._height;
  }
  get height():number {
    return 0;
  }

  @Input() set change(v:boolean) {
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

  constructor(private registry:ThingsRegistryService,private fimp : FimpService) {

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
    for (let val of queryResponse.Results[0].Series) {
      let data:any[] = [];
      for (let v of val["values"]) {
        data.push({t:moment.unix(v[0]),y:v[1]});
      }
      areLabelsConfigured = true;
      let label = "unknown";
      if (val.tags) {
        switch (this.groupByTag) {
          case "location_id":
            let locationId = val.tags.location_id;
            let loc = this.registry.getLocationById(Number(locationId))
            if (loc) {
              if ((loc.length)>0)
                label = loc[0].alias;
            }
            break;
          case "service_id":
            let service = this.registry.getServiceById(Number(val.tags.service_id))
            if (service) {
              label = service.alias;
            }
            break;
          case "dev_id":
            let dev = this.registry.getDeviceById(Number(val.tags.dev_id))
            if (dev) {
              label = dev.alias +" in "+ dev.location_alias;
            }else {
              console.log("No device for id = ",val.tags.dev_id)
            }
            break;
        }
      }

      this.chartData.push({
        data:data,
        label:label,
        borderColor:this.random_rgba(0.9),
        fill:false,
        pointRadius:1.5,
        lineTension:0.2
        // backgroundColor: 'rgba(27,255,16,0.23)',
      });
    }
  }

  random_rgba(a) {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + a + ')';
  }

  ngOnInit() {

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
      this._height = "400px";
    }
    this.canvasElement.nativeElement.style.height = this._height;

    this.initChart();
    this.globalSub = this.fimp.getGlobalObservable().subscribe((msg) => {
      let fimpMsg = NewFimpMessageFromString(msg.payload.toString());
      if (fimpMsg.service == "ecollector" && fimpMsg.corid ==this.lastRequestId ){
        if (fimpMsg.mtype == "evt.tsdb.query_report") {
          if (fimpMsg.val) {
            this.transformData(fimpMsg.val);
            this.chart.update();
          }
        }
      }
    });
    this.queryData();
  }
  ngOnDestroy() {
    if(this.globalSub)
      this.globalSub.unsubscribe();
  }

  queryData() {
    console.log("Measurement = "+this.measurement);
    let query = ""
    if (!this.measurement && !this.query)
      return
      // query = "SELECT last(value) AS last_value FROM \"default_20w\".\"sensor_temp.evt.sensor.report\" WHERE time > now()-48h  GROUP BY  location_id FILL(null)"
    if (this.filterByTopic!=undefined) {
      query = "SELECT value FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" and topic='"+this.filterByTopic+"' FILL(previous)"
    }else {
      query = "SELECT mean(\"value\") AS \"mean_value\" FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" GROUP BY time("+this.groupByTime+"), "+this.groupByTag+" FILL(previous)"
    }
    if (this.groupByTime != "none" && this.filterByTopic!=undefined) {
      query = "SELECT mean(\"value\") AS \"mean_value\" FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" and topic='"+this.filterByTopic+"' GROUP BY time("+this.groupByTime+") FILL(previous)"

    }
    if(this.query != undefined && this.query != "")
      query = this.query
    let msg  = new FimpMessage("ecollector","cmd.tsdb.query","str_map",{"query":query},null,null)
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

import {Component, ElementRef, ViewChild,OnInit,Input} from '@angular/core';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {ThingsRegistryService} from "../../../registry/registry.service";
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
  @Input() measurement : string;
  @Input() title       : string;
  @Input() timeFromNow : string;
  @Input() groupByTime : string;
  @Input() groupByTag  : string;
  @Input() filterById  : string;
  @Input() filterByTopic   : string;
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
    this.chartLabels.splice(0,this.chartLabels.length)
    this.chartData.splice(0,this.chartData.length)

    let areLabelsConfigured = false;

    for (let val of queryResponse.Results[0].Series) {
      let data:any[] = [];
      for (let v of val["values"]) {
        data.push({t:moment.unix(v[0]),y:v[1]});
      }
      areLabelsConfigured = true;
      let label = "unknown";
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
        case "thing_id":
          let thing = this.registry.getThingById(Number(val.tags.thing_id))
          if (thing) {
              label = thing.alias +" in "+ thing.location_alias;
          }
          break;
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
      this.measurement = "sensor_temp.evt.sensor.report";
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
          }
        }
      }
    });
    this.queryData();
  }

  queryData() {
    let query = ""
      // query = "SELECT last(value) AS last_value FROM \"default_20w\".\"sensor_temp.evt.sensor.report\" WHERE time > now()-48h  GROUP BY  location_id FILL(null)"
    if (this.filterByTopic!=undefined) {
      query = "SELECT value FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" and topic='"+this.filterByTopic+"' FILL(previous)"
    }else {
      query = "SELECT mean(\"value\") AS \"mean_value\" FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" GROUP BY time("+this.groupByTime+"), "+this.groupByTag+" FILL(previous)"
    }
    if (this.groupByTime != "none" && this.filterByTopic!=undefined) {
      query = "SELECT mean(\"value\") AS \"mean_value\" FROM \"default_20w\".\""+this.measurement+"\" WHERE time > now()-"+this.timeFromNow+" and topic='"+this.filterByTopic+"' GROUP BY time("+this.groupByTime+") FILL(previous)"

    }
    let msg  = new FimpMessage("ecollector","cmd.tsdb.query","str_map",{"query":query},null,null)
    msg.src = "tplex-ui"
    this.lastRequestId = msg.uid;
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:ecollector/ad:1",msg.toString());
  }



  ngOnDestroy() {
    if(this.globalSub)
      this.globalSub.unsubscribe();
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

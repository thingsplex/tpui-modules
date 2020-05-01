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
import {randomBytes} from "crypto";
import {AnalyticsSettingsService} from "./settings.service";

declare var moment: any;
declare var Chart: any;

@Component({
  selector: 'simple-pie-chart',
  templateUrl: './simple-pie-chart.html'
})
export class SimplePieChartComponent implements OnInit  {
  @Input() title       : string;
  @Input() data : number[];
  @Input() labels : string[];
  @ViewChild('canvas')
  canvasElement: ElementRef;

  globalSub : Subscription;

  chart : any;

  public chartLabels:string[] = [];
  public chartLegend:boolean = true;
  public chartData:any[] = [];

  private lastRequestId : string ;

  constructor(private registry:ThingsRegistryService,private fimp : FimpService,private settings:AnalyticsSettingsService) {
  }


  ngOnInit() {
    this.chartData.push({data:this.data,backgroundColor:[]})
    this.applyColors();
    this.initChart();
  }

  applyColors() {
    let colors:any[] = [];
    let i = 0;
    for(let d in this.chartData[0].data) {
      let label = this.labels[i];
      let labelSplit = label.split(":");
      this.chartData[0].backgroundColor.push(this.settings.getColor(labelSplit[0]))
      i++;
    }
    // this.chartData.push({data:this.data,backgroundColor:colors})
  }

  initChart() {
    var ctx = this.canvasElement.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {datasets:this.chartData,labels:this.labels},
      options: {
        responsive: true,
        maintainAspectRatio:true,
        aspectRatio:1,
        title:{text:this.title,display:true},
        legend:{position:'right'}
      }
    });
  }

  update() {
    console.log("Update command");
    // this.initChart()
    this.applyColors();

    this.chart.update();
  }



}


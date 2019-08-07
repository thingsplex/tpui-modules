import {Component, ElementRef, ViewChild,OnInit,Input,Output,EventEmitter} from '@angular/core';
import {MatDialog, MatDialogRef,MatSnackBar} from '@angular/material';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import { Http, Response,URLSearchParams }  from '@angular/http';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import { ActivatedRoute } from '@angular/router';
import { ServiceInterface,Service} from '../model';
import { BACKEND_ROOT} from "app/globals";
import { getFimpServiceList} from "app/fimp/service-lookup"
import {ThingIntfUiComponent} from 'app/registry/thing-intf-ui/thing-intf-ui.component'
import {ServiceEditorDialog} from 'app/registry/services/service-editor.component'
import {ThingsRegistryService} from "../registry.service";


@Component({
  selector: 'reg-services-main',
  templateUrl: './services-main.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesMainComponent {
  constructor() {

  }

}

@Component({
  selector: 'service-selector-wizard',
  templateUrl: './service-selector-wizard.component.html',
  styleUrls: ['./services.component.css']
})
export class ServiceSelectorWizardComponent implements OnInit {
  @Input() msgFlowDirection : string;
  @Input() inputServiceAddress: string;
  @Input() inputServiceName: string;
  @Input() inputInterfaceName: string;
  public selectedLocationId :number;
  public selectedServiceId:number;
  public selectedThingId :number;
  public selectedInterfaceName:any;
  public fimpServiceList :any;
  public activeThings:any;
  public things:any;
  public activeService:any;
  public services:any;

  @Output() onSelect = new EventEmitter<ServiceInterface>();
  ngOnInit() {
    if(this.inputServiceAddress) {
      let svcs = this.registry.getServiceByAddress(this.inputServiceAddress)
      if (svcs.length > 0) {

        this.selectedServiceId = svcs[0].id;
        this.selectedLocationId = svcs[0].location_id;
        this.selectedInterfaceName = this.inputInterfaceName;
        this.selectedThingId = svcs[0].container_id;
        console.log("Selected thing id "+this.selectedThingId);
        this.activeService = svcs[0]
        this.onLocationSelected();
        this.onThingSelected()
        this.onServiceSelected()
      }

    }
  }
  constructor(private route: ActivatedRoute,public registry:ThingsRegistryService) {
    this.fimpServiceList = getFimpServiceList();
  }

  selectInterface(intf:ServiceInterface) {
    console.dir(intf);
    this.onSelect.emit(intf);
  }



  onLocationSelected() {
    this.things = this.registry.getThingsForLocation(this.selectedLocationId);
    console.log("THings for location:")
    console.dir(this.things)
  }

  onThingSelected() {
    this.services = this.registry.getServicesForThing(this.selectedThingId);
    console.log("Services for thing:")
    console.dir(this.services)
  }

  onServiceSelected(){
    // this.loadServices(this.selectedService,"");
    this.activeService = this.registry.getServiceById(this.selectedServiceId)
    console.dir(this.activeService);
  }

  onInterfaceSelected(service) {
    var intf = new ServiceInterface();
    intf.serviceName = this.activeService.name;
    intf.intfMsgType = this.selectedInterfaceName;
    intf.locationAlias = this.activeService.location_alias;
    intf.serviceAlias = this.activeService.alias;
    if (intf.intfMsgType.indexOf("cmd.")>=0) {
      intf.intfAddress = "pt:j1/mt:cmd"+this.activeService.address
    }else {
      intf.intfAddress = "pt:j1/mt:evt"+this.activeService.address
    }

    this.onSelect.emit(intf);
  }

}


@Component({
  selector: 'reg-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  displayedColumns = ['name','alias','locationAlias','address','action'];
  thingId : string ;
  dataSource: ServicesDataSource | null;
  // usage (onSelect)="onSelected($event)">
  @Output() onSelect = new EventEmitter<ServiceInterface>();
  @ViewChild('filterThingAddr') filterThingAddr: ElementRef;
  @ViewChild('filterServiceName') filterServiceName: ElementRef;

  constructor(private http : Http,private route: ActivatedRoute,public dialog: MatDialog) {

  }

  ngOnInit() {
    this.thingId = this.route.snapshot.params['filterValue'];
    console.log("Thing id  = ",this.thingId);
    this.dataSource = new ServicesDataSource(this.http);
    this.dataSource.getData("","",this.thingId);
    Observable.fromEvent(this.filterThingAddr.nativeElement, 'keyup')
        .debounceTime(500)
        .distinctUntilChanged()
        .subscribe(() => {
          if (!this.dataSource) { return; }
          this.dataSource.getData(this.filterThingAddr.nativeElement.value,this.filterServiceName.nativeElement.value,"")
        });
    Observable.fromEvent(this.filterServiceName.nativeElement, 'keyup')
        .debounceTime(500)
        .distinctUntilChanged()
        .subscribe(() => {
          if (!this.dataSource) { return; }
          this.dataSource.getData(this.filterThingAddr.nativeElement.value,this.filterServiceName.nativeElement.value,"")
        });

  }
  showServiceEditorDialog(service:Service) {
    let dialogRef = this.dialog.open(ServiceEditorDialog,{
            width: '400px',
            data:service
          });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
        {
           this.dataSource.getData("","",this.thingId)
        }
    });
  }
  selectInterface(intf:ServiceInterface) {
    console.dir(intf);
    this.onSelect.emit(intf);
  }
}


export class ServicesDataSource extends DataSource<any> {
  services : Service[] = [];
  servicesObs = new BehaviorSubject<Service[]>([]);

  constructor(private http : Http) {
    super();
  }

  getData(thingAddr:string ,serviceName:string,thingId:string) {
    let params: URLSearchParams = new URLSearchParams();
    params.set('serviceName', serviceName);
    params.set('thingId', thingId);
    if (thingId!="*") {
      params.set('thingId', thingId);
    }
    this.http
        .get(BACKEND_ROOT+'/fimp/api/registry/services',{search:params})
        .map((res: Response)=>{
          let result = res.json();
          return this.mapThings(result);
        }).subscribe(result=>{
          this.servicesObs.next(result);
        });

  }

  connect(): Observable<Service[]> {
    return this.servicesObs;
  }
  disconnect() {}

  mapThings(result:any):Service[] {
    let services : Service[] = [];
    for (var key in result){
            let service = new Service();
            service.id = result[key].id
            service.name = result[key].name;
            service.alias = result[key].alias;
            service.address = result[key].address;
            service.groups = result[key].groups;
            service.locationId = result[key].location_id;
            service.locationAlias = result[key].location_alias;
            service.props = result[key].props;
            service.interfaces = result[key].interfaces;
            services.push(service)
     }
     return services;
  }
}

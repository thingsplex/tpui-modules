import {Component, ElementRef, ViewChild,OnInit,Input,Output,EventEmitter} from '@angular/core';
import {MatDialog, MatDialogRef,MatSnackBar} from '@angular/material';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import { ActivatedRoute } from '@angular/router';
import { ServiceInterface,Service} from '../model';
import { getFimpServiceList} from "app/fimp/service-lookup"
import {ServiceEditorDialog} from './service-editor.component'
import {ThingsRegistryService} from "../registry.service";
import {Subscription} from "rxjs";
import {ServiceRunDialog} from "./service-run.component";


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
  public selectedServiceId:string;
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
        this.selectedServiceId = svcs[0].name;
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
    this.things = this.registry.getDevicesForLocation(this.selectedLocationId);
    console.log("THings for location:")
    console.dir(this.things)
  }

  onThingSelected() {
    this.services = this.registry.getServicesForThing(this.selectedThingId);
    console.log("Services for thing:")
    console.dir(this.services)
    this.onInterfaceSelected("");
  }

  onServiceSelected(){
    // this.loadServices(this.selectedService,"");
    this.activeService = this.registry.getServiceByDeviceIdAndName(this.selectedThingId,this.selectedServiceId)
    console.dir(this.activeService);
    this.onInterfaceSelected("");
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
  displayedColumns = ['name','alias','address','action'];
  thingId : string ;
  parentObjectName :string;
  dataSource: ServicesDataSource | null;
  // usage (onSelect)="onSelected($event)">
  private registrySub: Subscription = null;
  @Output() onSelect = new EventEmitter<ServiceInterface>();
  @ViewChild('filterThingAddr') filterThingAddr: ElementRef;
  @ViewChild('filterServiceName') filterServiceName: ElementRef;

  constructor(private route: ActivatedRoute,public dialog: MatDialog,private registry:ThingsRegistryService) {

  }

  ngOnInit() {
    this.thingId = this.route.snapshot.params['filterValue'];
    console.log("Thing id  = ",this.thingId);
    this.dataSource = new ServicesDataSource(this.registry);

    if (!this.registry.isRegistryInitialized()) {
      if (!this.registrySub) {
        this.registrySub = this.registry.registryState$.subscribe((state) => {
          if(state=="allLoaded") {
            this.dataSource.getData("","",this.thingId);
            this.setParentObjectName();
          }
          console.log("new registry state = "+state);

        });
      }
    }else {
      this.dataSource.getData("","",this.thingId);
      this.setParentObjectName();
    }

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

  setParentObjectName () {
    let dev = this.registry.getDeviceById(parseInt(this.thingId))
    if (dev)
        this.parentObjectName = dev.alias
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

  showServiceRunDialog(service:Service) {
    let dialogRef = this.dialog.open(ServiceRunDialog,{
      width: '400px',
      data:service
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
      {

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

  constructor(private registry:ThingsRegistryService) {
    super();
  }

  getData(thingAddr:string ,serviceName:string,thingId:string) {
    // let params: URLSearchParams = new URLSearchParams();
    // params.set('serviceName', serviceName);
    // params.set('thingId', thingId);
    // if (thingId!="*") {
    //   params.set('thingId', thingId);
    // }
    // this.http
    //     .get(BACKEND_ROOT+'/fimp/api/registry/services',{search:params})
    //     .map((res: Response)=>{
    //       let result = res.json();
    //       return this.mapThings(result);
    //     }).subscribe(result=>{
    //       this.servicesObs.next(result);
    //     });
    if (thingId!="" && thingId!="*") {
      this.servicesObs.next(this.registry.getServicesForDevice(parseInt(thingId)));
    }else {
      this.servicesObs.next(this.registry.services);
    }

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

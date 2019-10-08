import { Injectable } from '@angular/core';
// import {BehaviorSubject, Observable} from 'rxjs';
// import {
//   MqttMessage,
//   MqttService
// } from 'angular2-mqtt';
// import { FimpMessage, NewFimpMessageFromString } from "app/fimp/Message";
// import {tap} from "rxjs/operators";
import {FimpService} from "app/fimp/fimp.service";
import { BACKEND_ROOT} from "app/globals";
import {HttpClient} from "@angular/common/http";
import {Subject} from "rxjs";



@Injectable()
export class ThingsRegistryService{

  public services : any;
  public locations : any;
  public things :any;
  private registryStateSource = new Subject<string>();
  public registryState$ = this.registryStateSource.asObservable();
  constructor(private fimp: FimpService,private http: HttpClient) {
    console.log("registry service constructor")
    this.loadAllComponents();
  }

  public init() {


  }

  loadAllComponents() {
    this.loadLocations();
    this.loadThings();
    this.loadServices();
  }

  loadServices() {
    let params: URLSearchParams = new URLSearchParams();
    // params.set('serviceName', serviceName);
    // params.set('filterWithoutAlias',"true");
    this.http.get(BACKEND_ROOT+'/fimp/api/registry/services')
      .subscribe(result=>{
      this.services = result;
      this.registryStateSource.next("servicesLoaded");
      this.notifyRegistryState();
    });
  }
  loadLocations() {
    this.http.get(BACKEND_ROOT+'/fimp/api/registry/locations')
      .subscribe(result=>{
      this.locations = result;
        this.registryStateSource.next("locationsLoaded");
        this.notifyRegistryState();
    });
  }

  loadThings() {
    this.http.get(BACKEND_ROOT+'/fimp/api/registry/things')
      .subscribe(result=>{
        this.things = result;
        this.registryStateSource.next("thingsLoaded");
        this.notifyRegistryState();
      });
  }

  notifyRegistryState() {
    if (this.isRegistryInitialized()) {
      this.registryStateSource.next("allLoaded");
    }
  }

  isRegistryInitialized():boolean {
    if (this.things != undefined && this.locations != undefined && this.services != undefined)
      return true;
    else
      return false;
  }


  getLocationById(locationId:number) {
    return this.locations.filter(location => location.id == locationId)
  }

  getThingsForLocation(locationId:number) {
      return this.things.filter(thing => thing.location_id == locationId)
  }

  getThingById(thingId:number) {
    return this.things.filter(thing => thing.id == thingId)[0]
  }

  getThingByAddress(tech:string,address:string) {
    // console.dir(this.things);
    return this.things.filter(thing => (thing.address == address && thing.comm_tech == tech ))
  }

  getServiceByAddress(address:string) {
    return this.services.filter(service => address.indexOf(service.address)>=0)
  }

  getServicesForThing(thingId:number) {
      return this.services.filter(service => service.container_id == thingId)
  }


  getServiceById(serviceId:number) {
      return this.services.filter(service => service.id == serviceId)[0]
  }


}



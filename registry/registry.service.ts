import { Injectable } from '@angular/core';
// import {BehaviorSubject, Observable} from 'rxjs';
// import {
//   MqttMessage,
//   MqttService
// } from 'angular2-mqtt';
// import { FimpMessage, NewFimpMessageFromString } from "app/fimp/Message";
// import {tap} from "rxjs/operators";
import {FimpService} from "../fimp/fimp.service";
import { BACKEND_ROOT} from "app/globals";
import {HttpClient} from "@angular/common/http";



@Injectable()
export class ThingsRegistryService{

  public services : any;
  public locations : any;
  public things :any;
  constructor(private fimp: FimpService,private http: HttpClient) {
    console.log("registry service constructor")
    this.loadLocations();
    this.loadThings();
    this.loadServices();
  }

  public init() {


  }


  loadServices() {
    let params: URLSearchParams = new URLSearchParams();
    // params.set('serviceName', serviceName);
    // params.set('filterWithoutAlias',"true");
    this.http.get(BACKEND_ROOT+'/fimp/api/registry/services')
      .subscribe(result=>{
      this.services = result;
    });
  }
  loadLocations() {
    this.http.get(BACKEND_ROOT+'/fimp/api/registry/locations')
      .subscribe(result=>{
      this.locations = result;
    });
  }

  loadThings() {
    this.http.get(BACKEND_ROOT+'/fimp/api/registry/things')
      .subscribe(result=>{
        this.things = result;
      });
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



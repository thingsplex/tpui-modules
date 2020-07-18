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

  public services : any = [];
  public locations : any = [];
  public things : any = [];
  public devices :any = [];
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
    this.loadDevices();
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

  loadDevices() {
    this.http.get(BACKEND_ROOT+'/fimp/api/registry/devices')
      .subscribe(result=>{
        this.devices = result;
        this.registryStateSource.next("devicesLoaded");
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
    if(this.locations)
      return this.locations.filter(location => location.id == locationId)
    else
      return []
  }

  getThingsForLocation(locationId:number) {
    if(this.things)
      return this.things.filter(thing => thing.location_id == locationId)
    else
      return []
  }

  getDevicesForLocation(locationId:number) {
    if(this.devices)
      return this.devices.filter(device => device.location_id == locationId)
    else
      return []
  }

  getDevicesForThing(thingId:number) {
    if(this.devices)
      return this.devices.filter(device => device.thing_id == thingId)
    else
      return []
  }

  getThingById(thingId:number) {
    if(this.things)
      return this.things.filter(thing => thing.id == thingId)[0]
  }

  getDeviceById(devId:number) {
    if (this.devices)
      return this.devices.filter(dev => dev.id == devId)[0]
  }

  getThingByAddress(tech:string,address:string) {
    // console.dir(this.things);
    let fullAddress = "/rn:"+tech+"/ad:1/ad:"+address;
    let things = this.things.filter(thing => (thing.address == fullAddress ))
    return things
  }

  getThingByFullAddress(address:string) {
    // console.dir(this.things);
    if(this.things)
      return this.things.filter(thing => (thing.address == address ))
    else
      return []
  }

  getServiceByAddress(address:string) {
    if (this.services)
      return this.services.filter(service => address.indexOf(service.address)>=0)
    else
      return []
  }

  getServicesForThing(thingId:number) {
    if (this.services)
      return this.services.filter(service => service.container_id == thingId)
    else
      return []
  }

  getServicesForDevice(deviceId:number) {
    if (this.services)
      return this.services.filter(service => service.container_id == deviceId && service.container_type == "dev")
    else
      return []
  }

  getServiceById(serviceId:number) {
    if (this.services)
      return this.services.filter(service => service.id == serviceId)[0]
  }

  getServiceByDeviceIdAndName(deviceId:number,name: string) {
    if (this.services)
      return this.services.filter(service => service.container_id == deviceId && service.container_type == "dev" && service.name == name )[0]
  }

  getDevicesFilteredByService(serviceName:string) {
    if (this.services) {
      let services = this.services.filter(service => service.container_type == "dev" && service.name == serviceName)
      let result = [];
      for (let svc of services) {
        let dev = this.getDeviceById(svc.container_id)
        if (dev)
          result.push(dev)
      }
      return result;
    } else {
      return []

    }
  }

}



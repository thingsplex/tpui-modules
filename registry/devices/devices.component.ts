import {Component, ElementRef, ViewChild,OnInit} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject,Observable} from 'rxjs';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import { Device } from '../model';
import { ActivatedRoute } from '@angular/router';
import { BACKEND_ROOT } from "app/globals";
import {DeviceEditorDialog} from './device-editor.component'
import {ThingsRegistryService} from "../registry.service";
import {register} from "ts-node/dist";
import {Subscription} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent implements OnInit {
  displayedColumns = ['id', 'alias','type','locationAlias', 'action'];
  dataSource: DevicesDataSource | null;
  locationId:string;
  parentObjectName : string ;
  private registrySub: Subscription = null;

  @ViewChild('filterAddr') filter: ElementRef;

  constructor(private http : HttpClient,private route: ActivatedRoute,public dialog: MatDialog,private registry:ThingsRegistryService) {

  }

  ngOnInit() {

    let filterName = this.route.snapshot.params['filterName'];
    this.locationId = this.route.snapshot.params['filterValue'];
    this.dataSource = new DevicesDataSource(this.registry);
    if (this.locationId=="*"){
      this.locationId = "";
    }

    if (!this.registry.isRegistryInitialized()) {
      if (!this.registrySub) {
        this.registrySub = this.registry.registryState$.subscribe((state) => {
          if(state=="allLoaded") {

            this.dataSource.getData(filterName,this.locationId);
            this.setParentObjectName(filterName);
          }
          console.log("new registry state = "+state);

        });
      }
    }else {
      console.log("Reloading device data")
      this.dataSource.getData(filterName,this.locationId);
      this.setParentObjectName(filterName);
    }

    // Observable.fromEvent(this.filter.nativeElement, 'keyup')
    //     .debounceTime(150)
    //     .distinctUntilChanged()
    //     .subscribe(() => {
    //       if (!this.dataSource) { return; }
    //       this.dataSource.filter = this.filter.nativeElement.value;
    //     });
  }
  showDeviceEditorDialog(service:Device) {
    let dialogRef = this.dialog.open(DeviceEditorDialog,{
            width: '400px',
            data:service
          });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
        {
           this.dataSource.getData("",this.locationId)
        }
    });
  }

  setParentObjectName (filterName:string) {
    if(filterName == "locationId") {
      this.parentObjectName = this.registry.getLocationById(parseInt(this.locationId))[0].alias
    }else if(filterName == "thingId")  {
      this.parentObjectName = this.registry.getThingById(parseInt(this.locationId)).alias
    }
  }

  deleteDevice(id:string) {
    this.http
     .delete(BACKEND_ROOT+'/fimp/api/registry/device/'+id)
     .subscribe ((result) => {
        this.dataSource.getData("","");
     });
  }
  }

  /**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, DevicesDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class DevicesDataSource extends DataSource<any> {
  _filterChange = new BehaviorSubject('');
  devices : Device[] = [];
  devicesObs = new BehaviorSubject<Device[]>([]);
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this.getData("","") }

  constructor(private registry:ThingsRegistryService) {
    super();
    // this.getData("");
  }

  getData(filterName,id:string) {
    console.log("Total devices in registry = "+this.registry.devices.length);
    if (filterName == "locationId") {
      if (id == "") {
        this.devicesObs.next(this.mapDevices(this.registry.devices));
      }else {
        this.devicesObs.next(this.mapDevices(this.registry.getDevicesForLocation(parseInt(id))));
      }
    }else if (filterName == "thingId") {
      if (id == "") {
        this.devicesObs.next(this.mapDevices(this.registry.devices));
      }else {
        this.devicesObs.next(this.mapDevices(this.registry.getDevicesForThing(parseInt(id))));
      }
    }else {
      this.devicesObs.next(this.mapDevices(this.registry.devices));
    }




  }

  connect(): Observable<Device[]> {
    return this.devicesObs;
  }
  disconnect() {}

  mapDevices(result:any):Device[] {
    let devices : Device[] = [];
    for (var key in result){
            let device = new Device();
            device.id = result[key].id;
            device.alias = result[key].alias;
            device.locationId = result[key].location_id;
            device.thingId = result[key].thing_id;
            device.locationAlias = result[key].location_alias;
            device.type = result[key].type;
            devices.push(device)
     }
     return devices;
  }
}

import {Component, ElementRef, ViewChild,OnInit,Input,Output,EventEmitter} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import {Location} from '../model';
import { BACKEND_ROOT } from "app/globals";
import { LocationEditorDialog} from './location-editor.component'
import {MatDialog, MatDialogRef,MatSnackBar} from '@angular/material';
import {ThingsRegistryService} from "../registry.service";
import {Subscription} from "rxjs";
import {FimpMessage} from "../../../fimp/Message";
import {FimpService} from "../../../fimp/fimp.service";
import {HttpClient} from "@angular/common/http";
// import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent implements OnInit {
displayedColumns = ['id','type','sub_type','alias','address','action'];

// displayedColumns = ['thingAddress', 'thingAlias',
// 'serviceName','serviceAlias','intfMsgType'];
  dataSource: LocationsDataSource | null;
  private registrySub: Subscription = null;
  constructor(private http : HttpClient,public dialog: MatDialog,private registry:ThingsRegistryService,private fimp:FimpService) {

  }

  ngOnInit() {
    this.dataSource = new LocationsDataSource(this.registry);

    if (!this.registry.isRegistryInitialized()) {
      if (!this.registrySub) {
        this.registrySub = this.registry.registryState$.subscribe((state) => {
          if(state=="allLoaded") {
           this.dataSource.getData();
          }
          console.log("new registry state = "+state);

        });
      }
    }else {
      this.dataSource.getData();
    }

  }

  public sync(){
    let msg  = new FimpMessage("tpflow","cmd.registry.sync_rooms","null",null,null,null)
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:registry/ad:1",msg.toString());
    setTimeout( ()=> {
        this.registry.loadAllComponents()
    },1000)
  }

  deleteLocation(id:string) {
    this.http
     .delete(BACKEND_ROOT+'/fimp/api/registry/location/'+id)
     .subscribe ((result) => {
        this.dataSource.getData();
     });
   }
  showLocationEditorDialog(service:Location) {
    let dialogRef = this.dialog.open(LocationEditorDialog,{
            width: '400px',
            data:service
          });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
        {
           this.dataSource.getData()
        }
    });
  }
}


export class LocationsDataSource extends DataSource<any> {
  locations : Location[] = [];
  locationsObs = new BehaviorSubject<Location[]>([]);

  constructor(private registry:ThingsRegistryService) {
    super();
    // this.getData();
  }

  getData() {
    this.locationsObs.next(this.registry.locations)
  }

  connect(): Observable<Location[]> {
    return this.locationsObs;
  }
  disconnect() {}

  mapThings(result:any):Location[] {
    let locations : Location[] = [];
    for (var key in result){
            let loc = new Location();
            loc.id = result[key].id;
            loc.type = result[key].type;
            loc.sub_type = result[key].sub_type;
            loc.alias = result[key].alias;
            loc.address = result[key].address;
            loc.long = result[key].long;
            loc.lat = result[key].lat;
            locations.push(loc)
     }
     return locations;
  }
}

@Component({
  selector: 'location-selector',
  templateUrl: './location-selector.html',
  styleUrls: ['./locations.component.css']
})
export class LocationSelectorWizardComponent implements OnInit {
  @Input() currentLocation : number;
  public locations : Location[];
  selectedLocationId :number;
  @Output() onSelect = new EventEmitter<number>();
  ngOnInit() {
    this.loadLocations();
    this.selectedLocationId = this.currentLocation;
  }
  constructor(private registry:ThingsRegistryService) {
  }

  loadLocations() {
    this.locations = this.registry.locations
  }
  onSelected() {
     this.onSelect.emit(this.selectedLocationId);
  }

}

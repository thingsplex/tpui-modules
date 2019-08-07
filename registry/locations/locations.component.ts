import {Component, ElementRef, ViewChild,OnInit,Input,Output,EventEmitter} from '@angular/core';
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
import {Location} from '../model';
import { BACKEND_ROOT } from "app/globals";
import { LocationEditorDialog} from 'app/registry/locations/location-editor.component'
import {MatDialog, MatDialogRef,MatSnackBar} from '@angular/material';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent implements OnInit {
displayedColumns = ['id','type','alias','address','geo','action'];

// displayedColumns = ['thingAddress', 'thingAlias',
// 'serviceName','serviceAlias','intfMsgType'];
  dataSource: LocationsDataSource | null;

  constructor(private http : Http,public dialog: MatDialog) {

  }

  ngOnInit() {
    this.dataSource = new LocationsDataSource(this.http);

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

  constructor(private http : Http) {
    super();
    this.getData();
  }

  getData() {
    let params: URLSearchParams = new URLSearchParams();
    this.http
        .get(BACKEND_ROOT+'/fimp/api/registry/locations',{search:params})
        .map((res: Response)=>{
          let result = res.json();
          return this.mapThings(result);
        }).subscribe(result=>{
          this.locationsObs.next(result);
        });

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
  constructor(private http : Http,) {
  }

  loadLocations() {
    this.http.get(BACKEND_ROOT+'/fimp/api/registry/locations',{})
    .map((res: Response)=>{
      let result = res.json();
      return result;
    }).subscribe(result=>{
      this.locations = result;
    });
  }
  onSelected() {
     this.onSelect.emit(this.selectedLocationId);
  }

}

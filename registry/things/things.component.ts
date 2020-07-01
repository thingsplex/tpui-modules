import {Component, ElementRef, ViewChild,OnInit} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import { Thing } from '../model';
import { ActivatedRoute } from '@angular/router';
import { BACKEND_ROOT } from "app/globals";
import { ThingEditorDialog} from './thing-editor.component'
import {ThingsRegistryService} from "../registry.service";
import {Subscription} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-things',
  templateUrl: './things.component.html',
  styleUrls: ['./things.component.css']
})
export class ThingsComponent implements OnInit {
  displayedColumns = ['id', 'alias','locationAlias', 'address','manufacturerId','productName','productHash','action'];
  dataSource: ThingsDataSource | null;
  locationId:string;
  private registrySub: Subscription = null;
  @ViewChild('filterAddr') filter: ElementRef;

  constructor(private http : HttpClient,private route: ActivatedRoute,public dialog: MatDialog,private registry:ThingsRegistryService) {

  }

  ngOnInit() {
    this.locationId = this.route.snapshot.params['filterValue'];
    this.dataSource = new ThingsDataSource(this.http,this.registry);
    if (this.locationId=="*"){
      this.locationId = "";
    }

    if (!this.registry.isRegistryInitialized()) {
      if (!this.registrySub) {
        this.registrySub = this.registry.registryState$.subscribe((state) => {
          if(state=="allLoaded") {
            this.dataSource.getData(this.locationId);
          }
          console.log("new registry state = "+state);

        });
      }
    }else {
      this.dataSource.getData(this.locationId);
    }

    Observable.fromEvent(this.filter.nativeElement, 'keyup')
        .debounceTime(150)
        .distinctUntilChanged()
        .subscribe(() => {
          if (!this.dataSource) { return; }
          this.dataSource.filter = this.filter.nativeElement.value;
        });
  }
  showThingEditorDialog(service:Thing) {
    let dialogRef = this.dialog.open(ThingEditorDialog,{
            width: '400px',
            data:service
          });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
        {
           this.dataSource.getData(this.locationId)
        }
    });
  }

  deleteThing(id:string) {
    this.http
     .delete(BACKEND_ROOT+'/fimp/api/registry/thing/'+id)
     .subscribe ((result) => {
        this.dataSource.getData("");
     });
  }
  }

  /**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ThingsDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class ThingsDataSource extends DataSource<any> {
  _filterChange = new BehaviorSubject('');
  things : Thing[] = [];
  thingsObs = new BehaviorSubject<Thing[]>([]);
  get filter(): string { return this._filterChange.value; }
  set filter(filter: string) { this.getData("") }

  constructor(private http : HttpClient,private registry:ThingsRegistryService) {
    super();
    // this.getData("");
  }

  getData(locationId:string) {
    // let params: URLSearchParams = new URLSearchParams();
    // params.set('locationId', locationId);
    // this.http
    //     .get(BACKEND_ROOT+'/fimp/api/registry/things',{search:params})
    //     .map((res: Response)=>{
    //       let result = res.json();
    //       return this.mapThings(result);
    //     }).subscribe(result=>{
    //       this.thingsObs.next(result);
    //     });
    if (locationId == "") {
      this.thingsObs.next(this.mapThings(this.registry.things));
    }else {
      this.thingsObs.next(this.mapThings(this.registry.getThingsForLocation(parseInt(locationId))));
    }

  }

  connect(): Observable<Thing[]> {
    return this.thingsObs;
  }
  disconnect() {}

  mapThings(result:any):Thing[] {
    let things : Thing[] = [];
    for (var key in result){
            let thing = new Thing();
            thing.id = result[key].id;
            thing.address = result[key].address;
            thing.commTech = result[key].comm_tech;
            thing.alias = result[key].alias;
            thing.productId = result[key].product_id;
            thing.productName = result[key].product_name;
            thing.productHash = result[key].product_hash;
            thing.manufacturerId = result[key].manufacturer_id;
            thing.locationId = result[key].location_id;
            thing.locationAlias = result[key].location_alias;
            things.push(thing)
     }
     return things;
  }
}

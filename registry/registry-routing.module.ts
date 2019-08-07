import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";
import {ThingsComponent} from './things/things.component'
import {ServicesComponent,ServicesMainComponent} from './services/services.component'
import {LocationsComponent} from './locations/locations.component'
import {AdminComponent} from './admin/admin.component'
import { ThingViewComponent } from "app/thing-view/thing-view.component";


@NgModule({
  imports: [RouterModule.forChild([
    { path: 'registry/things/:filterName/:filterValue', component: ThingsComponent },
    { path: 'registry/services/:filterName/:filterValue', component: ServicesMainComponent },
    { path: 'registry/locations', component: LocationsComponent },
    { path: 'registry/admin', component: AdminComponent },
    { path: 'fimp/thing-view/:ad/:id', component: ThingViewComponent },
  ])],
  exports: [RouterModule]
})
export class RegistryRoutingModule {}
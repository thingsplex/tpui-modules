import { RouterModule, Routes } from '@angular/router';
import { NgModule } from "@angular/core";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {PresenceComponent} from "./presence/presence.component";
import {SensorsComponent} from "./sensors/sensors.component";


@NgModule({
  imports: [RouterModule.forChild([
    { path: 'analytics/dashboard', component: DashboardComponent },
    { path: 'analytics/sensors', component: SensorsComponent },
    { path: 'analytics/presence', component: PresenceComponent },
  ])],
  exports: [RouterModule]
})
export class AnalyticsRoutingModule {}

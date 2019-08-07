import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpModule } from '@angular/http';
import { AnalyticsRoutingModule } from "./analytics-routing.module";
import { RegistryModule } from "../registry/registry.module";
import { last } from 'rxjs/operator/last';
import { FormsModule } from '@angular/forms';
import { MatTableModule,
  MatSortModule,
  MatFormFieldModule,
  MatCheckboxModule,
  MatInputModule,
  MatSelectModule,
  MatChipsModule,
  MatButtonModule,
  MatRadioModule,
  MatCardModule,
  MatIconModule,
  MatSliderModule,
  MatListModule,
  MatDialogModule,
  MatTabsModule,
  MatExpansionModule} from '@angular/material';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {BinarySensorChartComponent} from "./charts/binary-sensor-chart.component";
import {LineChartComponent} from "./charts/line-chart.component";
import {PresenceComponent} from "./presence/presence.component";
import {SensorsComponent} from "./sensors/sensors.component";
import {ExploreComponent} from "./explore/explore.component";
import {SimplePieChartComponent} from "./charts/simple-pie-chart.component";


@NgModule({
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    FormsModule,
    CdkTableModule,
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatTableModule,
    MatListModule,
    MatIconModule,
    MatRadioModule,
    MatSliderModule,
    MatDialogModule,
    MatExpansionModule,
    MatTabsModule,
     HttpModule,
    RegistryModule
  ],
  exports:[],
  declarations: [DashboardComponent,BinarySensorChartComponent,LineChartComponent,PresenceComponent,SensorsComponent,ExploreComponent,SimplePieChartComponent]
})
export class AnalyticsModule { }

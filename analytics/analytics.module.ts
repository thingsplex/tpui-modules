import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { AnalyticsRoutingModule } from "./analytics-routing.module";
import { RegistryModule } from "../registry/registry.module";
import { last } from 'rxjs/operator/last';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import {DashboardComponent} from "./dashboard/dashboard.component";
import {BinarySensorChartComponent} from "./charts/binary-sensor-chart.component";
import {LineChartComponent} from "./charts/line-chart.component";
import {ActivityComponent} from "./activity/activity.component";
import {SensorsComponent} from "./sensors/sensors.component";
import {ExploreComponent} from "./explore/explore.component";
import {EnergyComponent} from "./energy/energy.component";
import {TsdbConfigComponent} from "./tsdb/tsdb-config.component";
import {SimplePieChartComponent} from "./charts/simple-pie-chart.component";
import {AnalyticsSettingsService} from "./charts/settings.service";


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
    RegistryModule
  ],
  exports:[],
  providers:[AnalyticsSettingsService],
  declarations: [DashboardComponent,BinarySensorChartComponent,LineChartComponent,ActivityComponent,SensorsComponent,ExploreComponent,EnergyComponent,SimplePieChartComponent,TsdbConfigComponent]
})
export class AnalyticsModule { }

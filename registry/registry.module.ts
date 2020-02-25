import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule,
         MatFormFieldModule,
         MatInputModule,
         MatChipsModule,
         MatIconModule,
         MatSliderModule,
         MatCheckboxModule,
         MatListModule,
         MatSelectModule,
         MatOptionModule,
         MatDialogModule,
         MatTabsModule,
         MatButtonModule,
         MatSnackBarModule,
         MatCardModule,
         MatCheckbox} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ThingsComponent } from './things/things.component';
import { DevicesComponent } from './devices/devices.component';
import { ServicesComponent ,ServicesMainComponent,ServiceSelectorWizardComponent } from './services/services.component';
import { LocationsComponent,LocationSelectorWizardComponent } from './locations/locations.component';
import { AdminComponent } from './admin/admin.component';
import { ThingIntfUiComponent,KeysPipe } from './thing-intf-ui/thing-intf-ui.component'

import { RegistryRoutingModule } from "./registry-routing.module";
import { CdkTableModule } from '@angular/cdk/table';
import { FimpService } from 'app/fimp/fimp.service'
import { ServiceEditorDialog }from './services/service-editor.component'
import { ThingEditorDialog }from './things/thing-editor.component'
import { DeviceEditorDialog }from './devices/device-editor.component'
import { LocationEditorDialog }from './locations/location-editor.component'
import {ThingsRegistryService} from "./registry.service";

@NgModule({
  imports: [
    CommonModule,
    RegistryRoutingModule,
    FormsModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,
    MatChipsModule,
    MatOptionModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,
    MatSliderModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    HttpModule,
    CdkTableModule
  ],
  exports:[ServicesComponent,
    ThingIntfUiComponent,
    KeysPipe,
    ServiceSelectorWizardComponent
    ],

  declarations: [
    ThingsComponent,
    DevicesComponent,
    ServicesComponent,
    ServicesMainComponent,
    LocationsComponent,
    AdminComponent,
    ThingIntfUiComponent,
    ServiceSelectorWizardComponent,
    LocationSelectorWizardComponent,
    KeysPipe,
    ServiceEditorDialog,
    ThingEditorDialog,
    DeviceEditorDialog,
    LocationEditorDialog
  ],
  providers:[ThingsRegistryService],
  entryComponents: [ServiceEditorDialog,ThingEditorDialog,DeviceEditorDialog,LocationEditorDialog]
})
export class RegistryModule { }

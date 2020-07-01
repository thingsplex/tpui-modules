import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule, MatCheckbox } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
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
import { ServiceRunDialog }from './services/service-run.component'
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
    ServiceRunDialog,
    ThingEditorDialog,
    DeviceEditorDialog,
    LocationEditorDialog
  ],
  providers:[ThingsRegistryService],
  entryComponents: [ServiceEditorDialog,ServiceRunDialog,ThingEditorDialog,DeviceEditorDialog,LocationEditorDialog]
})
export class RegistryModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowOverviewComponent } from './flow-overview/flow-overview.component';
import { FlowContextComponent } from './flow-context/flow-context.component';
import { FlowLibComponent } from './flow-lib/flow-lib.component';
import { VariableSelectorComponent } from './flow-context/variable-selector.component';
import { JsonInputComponent } from './ui-elements/json-input.component';
import { FlowEditorComponent, FlowSourceDialog,FlowLogDialog, FlowRunDialog, ServiceLookupDialog,ContextDialog,NodeEditorDialog,HelpDialog } from './flow-editor/flow-editor.component';
import { FlowNodesComponent ,SetVariableNodeComponent,TimeTriggerNodeComponent } from './flow-nodes/flow-nodes.component';
import { LoopNodeComponent,WaitNodeComponent} from './flow-nodes/flow-nodes.component';
import { RestActionNodeComponent } from './flow-nodes/rest-action-node/node.component';
import { TriggerNodeComponent,VincTriggerNodeComponent,SceneTriggerNodeComponent } from './flow-nodes/trigger-node/node.component';
import { IfNodeComponent } from './flow-nodes/if-node/node.component';
import { TransformNodeComponent  } from './flow-nodes/transform-node/node.component';
import { ExecNodeComponent  } from './flow-nodes/exec-node/node.component';
import { LogNodeComponent  } from './flow-nodes/log-node/node.component';
import { ActionNodeComponent,VincActionNodeComponent,NotificationActionNodeComponent,TimelineActionNodeComponent } from './flow-nodes/action-node/node.component';
import { ReceiveNodeComponent } from './flow-nodes/flow-nodes.component';
import { FlowRoutingModule } from "app/tpui-modules/flow/flow-routing.module";
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RegistryModule} from 'app/tpui-modules/registry/registry.module'
import { VariableElementComponent} from 'app/tpui-modules/flow/flow-nodes/ui-elements/ui-elements.component'
import { RecordEditorDialog} from "./flow-context/record-editor-dialog.component";
import { CdkTableModule } from '@angular/cdk/table';
import { SignInDialog,FirebaseAuthCheckComponent } from './firebase/firebase-auth.component';

import { MatTableModule,
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatChipsModule,
  MatIconModule,
  MatSliderModule,
  MatCheckboxModule,
  MatListModule,
  MatSelectModule,
  MatOptionModule,
  MatDialogModule,
  MatCardModule,
  MatSidenavModule,
  MatRadioModule,
  MatExpansionModule,
  MatTabsModule,
  MatCheckbox} from '@angular/material';
// import {MsgDetailsDialog} from "../timeline/timeline.component";
import {FlowPropsDialog} from "./flow-editor/flow-props-editor.component";


@NgModule({
  imports: [
    CommonModule,
    FlowRoutingModule,
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
    MatCardModule,
    MatSidenavModule,
    MatRadioModule,
    MatExpansionModule,
    FormsModule,
    HttpModule,
    RegistryModule,
    MatTabsModule,
    CdkTableModule
  ],
  declarations: [
     FlowOverviewComponent,
     FlowContextComponent,
     FlowLibComponent,
     FlowEditorComponent,
     FlowSourceDialog,
     FlowRunDialog,
     FlowPropsDialog,
     FlowLogDialog,
    SignInDialog,
    FirebaseAuthCheckComponent,
     VariableSelectorComponent,
     JsonInputComponent,
     NodeEditorDialog,
     HelpDialog,
     FlowNodesComponent,
     ActionNodeComponent,
     NotificationActionNodeComponent,
     TimelineActionNodeComponent,
     RestActionNodeComponent,
     TriggerNodeComponent,
     ReceiveNodeComponent,
     SetVariableNodeComponent,
     ServiceLookupDialog,
     ContextDialog,
     VariableElementComponent,
     TimeTriggerNodeComponent,
     LoopNodeComponent,
     IfNodeComponent,
     TransformNodeComponent,
     ExecNodeComponent,
     LogNodeComponent,
     WaitNodeComponent,
     VincTriggerNodeComponent,
     VincActionNodeComponent,
     RecordEditorDialog,
    SceneTriggerNodeComponent

  ],
  providers:[],
  exports:[JsonInputComponent],
  entryComponents: [FlowSourceDialog,FlowLogDialog,FlowRunDialog,FlowPropsDialog,ServiceLookupDialog,ContextDialog,NodeEditorDialog,HelpDialog,RecordEditorDialog,SignInDialog]
})
export class FlowModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SuspectRoomPageRoutingModule } from './suspect-room-routing.module';

import { SuspectRoomPage } from './suspect-room.page';

import { QRCodeModule } from 'angularx-qrcode';
import { LocalControllerComponent } from '../components/localController/local-controller.component';
import { ChatService } from '../services/chat.service';
import { AiService } from '../services/ai.service';
import { ConversationFlowService } from '../services/conversationFlow.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuspectRoomPageRoutingModule,
    QRCodeModule
  ],
  declarations: [SuspectRoomPage, LocalControllerComponent ],
  providers: [ ChatService, AiService, ConversationFlowService ]
})
export class SuspectRoomPageModule {}

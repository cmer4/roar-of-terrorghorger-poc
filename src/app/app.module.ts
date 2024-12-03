import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { ConversationFlowService } from './services/conversationFlow.service';
import { ChatService } from './services/chat.service';
import { AiService } from './services/ai.service';
import { TypingSimulatorService } from './services/typing-simulator.service';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';

import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, QRCodeModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, ConversationFlowService, ChatService, AiService, TypingSimulatorService, provideHttpClient(), provideFirebaseApp(() => initializeApp({"projectId":"judgemegantest","appId":"1:776946889078:web:1b0b08aacaa7c7d8ae0a57","databaseURL":"https://judgemegantest-default-rtdb.firebaseio.com","storageBucket":"judgemegantest.appspot.com","apiKey":"AIzaSyCJyFKZnLSXLmsbiZNuXnCMcwdOSVUd5nk","authDomain":"judgemegantest.firebaseapp.com","messagingSenderId":"776946889078"})), provideDatabase(() => getDatabase())],
  bootstrap: [AppComponent],
})
export class AppModule {}

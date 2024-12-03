import { Component, OnInit } from '@angular/core';
import { ConversationFlowService } from '../../app/services/conversationFlow.service';
import { GameStateService } from '../services/gamestate.service';


@Component({
  selector: 'app-debug',
  templateUrl: './debug.page.html',
  styleUrls: ['./debug.page.scss'],
})
export class DebugPage implements OnInit {

  selectedSegment: string = 'game-settings';

  constructor(public conversationFlowService: ConversationFlowService, public gamestate: GameStateService) {

  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  ngOnInit() {
  }

}
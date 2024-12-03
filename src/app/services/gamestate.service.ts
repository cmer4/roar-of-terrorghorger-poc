import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { BehaviorSubject } from 'rxjs';

export interface Player {
    id: 'player1' | "player2",
    name: string | null,
    role: 'defender' | 'prosecutor' | 'unassigned',
    input: string,
    canSpeak: boolean,
    canObject: boolean,
    recordingSpeech: boolean,
    objectionTokens: number,
    score: number
}

export interface GamePhase {
  type: 'setup' | 
        'introductions' | 
        'introductions_prosecutor' | 
        'introductions_defender' | 
        'openingStatements' | 
        'openingStatements_prosecutor' | 
        'openingStatements_defender' | 
        'witnessQuestioning' | 
        'witnessQuestioning_prosecutor' | 
        'witnessQuestioning_defender' | 
        'closingArguments' | 
        'closingArguments_prosecutor' | 
        'closingArguments_defender' | 
        'deliberation' | 
        'verdict';
}

@Injectable({
  providedIn: 'root'
})

export class GameStateService {

    public player1DetailsSubject = new BehaviorSubject<Player>({
      id: 'player1',
      name: null,
      role: 'unassigned',
      input: '',
      canSpeak: false,
      canObject: false,
      recordingSpeech: false,
      objectionTokens: 3,
      score: 0
    });

    public player2DetailsSubject = new BehaviorSubject<Player>({
      id: 'player2',
      name: null,
      role: 'unassigned',
      input: '',
      canSpeak: false,
      canObject: false,
      recordingSpeech: false,
      objectionTokens: 3,
      score: 0
    });

    // global state setting:
    public voiceMode: boolean = false;
    public localMultiplayerMode: boolean = true;
    public currentSessionState: string = "";
    public currentCharacter: string | null = null;

    public suspect1: any = {
      name: "Jones",
      mood: "embarrassed",
      meter: 150,
      meterVisible: "hidden",
      meterColor: "cyan",
      processed: false,
      selectable: false
    }
  
    public suspect2: any = {
      name: "Jenny",
      mood: "afraid",
      meter: 150,
      meterVisible: "hidden",
      meterColor: "cyan",
      processed: false,
      selectable: false
    }
  
    public suspect3: any = {
      name: "Prescott",
      mood: "irritated",
      meter: 100,
      meterVisible: "hidden",
      meterColor: "orange",
      processed: false,
      selectable: false
    }

    constructor(
      private db: DatabaseService
    ) {
    }

    async createPlayer1Details() {
      let player1Details = {
        id: 'player1',
        name: "Player 1",
        role: 'prosecutor',
        input: '',
        canSpeak: false,
        canObject: false,
        recordingSpeech: false,
        objectionTokens: 3,
        score: 0
      };
      await this.db.setData('sessions/currentSession/player1', player1Details);

    };

    async createPlayer2Details() {
      let player1Details = {
        id: 'player2',
        name: "Player 2",
        role: 'defender',
        input: '',
        canSpeak: false,
        canObject: false,
        recordingSpeech: false,
        objectionTokens: 3,
        score: 0
      };
      await this.db.setData('sessions/currentSession/player2', player1Details);

    };

    async updatePlayer1Details(newDetails: Partial<Player>) {

      const currentDetails = this.player1DetailsSubject.value;
      const updatedDetails = { ...currentDetails, ...newDetails };
      this.player1DetailsSubject.next(updatedDetails);
      if (!this.localMultiplayerMode) await this.db.updateData('sessions/currentSession/player1', updatedDetails);

    };

    async updatePlayer2Details(newDetails: Partial<Player>) {

      const currentDetails = this.player2DetailsSubject.value;
      const updatedDetails = { ...currentDetails, ...newDetails };
      this.player2DetailsSubject.next(updatedDetails);
      if (!this.localMultiplayerMode) await this.db.updateData('sessions/currentSession/player2', updatedDetails);

    };

    async joinOnlineSession() {

        this.currentSessionState = await this.db.readCurrentSessionState();

        if (this.currentSessionState === 'sessionStarted') {
          console.log("updating server and locally with prosecutor details")
          await this.createPlayer1Details();
          await this.db.updateCurrentSessionState('player1joined');
          return 1
        } else if (this.currentSessionState === 'player1joined') {
          console.log("updating server and locally with defender details")
          await this.createPlayer2Details();
          await this.db.updateCurrentSessionState('player2joined');
          return 2;
        } else if (this.currentSessionState === 'sessionEnded') {
          this.db.archiveCurrentSession();
          return null
        } else return null

    };

}
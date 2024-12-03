
import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SpeechRecognitionService } from '../services/speech-recognition.service';
import { DatabaseService } from '../services/database.service';
import { GameStateService } from '../services/gamestate.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.page.html',
  styleUrls: ['./controller.page.scss'],
})
export class ControllerPage implements OnInit {

  currentPlayerNumber: number | null = 0;
  playerName: string | null = null;
  playerRole: string = "unassigned";
  canSpeak: boolean = false;
  canObject: boolean = false;
  playerInput: string = "";
  recordingSpeech: boolean = false;
  microphonePermissionGranted: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private speechRecognition: SpeechRecognitionService,
    public gamestate: GameStateService,
    public db: DatabaseService,
    private platform: Platform
  ) {
  }

  startSpeechRecording() {
    this.recordingSpeech = true;
    this.speechRecognition.startListening();
  };

  stopSpeechRecording() {
    this.recordingSpeech = false;
    this.speechRecognition.stopListening().then((transcript)=>{
      this.updateInputWithSpeech(transcript);
    })
  };

  updateInputWithSpeech(transcript: string) {
    this.playerInput = transcript;
  };

  speak() {
    if (!this.playerInput) return;
    this.db.setData('sessions/currentSession/player'+this.currentPlayerNumber, { input: this.playerInput }).then(()=>{
      this.playerInput = '';
    })
  };

  object() {
    console.log("Objection!!!")
  };

  handleRecognizedSpeech(transcript: string) {
    console.log("interim speech recognition: "+transcript)
  };

  requestMicrophonePermission() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        // Microphone access granted
        console.log('Microphone access granted');
        this.microphonePermissionGranted = true;
      })
      .catch((error) => {
        // Microphone access denied or error occurred
        console.log('Error accessing microphone:', error);
        this.microphonePermissionGranted = false;
      });
  };

  listenPlayerStateUpdatesByController() {
    if (this.currentPlayerNumber) {
      console.log("listening to player state changes by player # "+this.currentPlayerNumber);
      this.db.listenData('sessions/currentSession/player'+this.currentPlayerNumber).subscribe((result)=>{
        let obj = result.snapshot.val();
        if (!this.playerName) {
          this.playerName = obj.name;
          this.playerRole = obj.role;
        };
        this.canObject = obj.canObject;
        this.canSpeak = obj.canSpeak;
      })
    } else {
      console.error("no player number available, can't listen to changes on controller side")
    };
  };

  async ngOnInit() {

    console.log("init controller");

    this.gamestate.localMultiplayerMode = false;

    this.currentPlayerNumber = await this.gamestate.joinOnlineSession();

    this.listenPlayerStateUpdatesByController();

    this.speechRecognition.currentSpeech.pipe(
      takeUntil(this.destroy$)
    ).subscribe(this.handleRecognizedSpeech.bind(this));

    this.platform.ready().then(() => {
      this.requestMicrophonePermission();
    });

  };

}
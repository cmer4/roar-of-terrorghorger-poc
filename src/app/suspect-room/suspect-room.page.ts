
import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ChatService, ChatMessage } from '../services/chat.service';
import { ConversationFlowService, SideEffect, ConversationStep } from '../services/conversationFlow.service';
import { GameStateService, Player } from '../services/gamestate.service';
import { DatabaseService } from '../services/database.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Platform, ModalController } from '@ionic/angular';
import { LocalControllerComponent } from '../components/localController/local-controller.component'

@Component({
  selector: 'app-suspect-room',
  templateUrl: './suspect-room.page.html',
  styleUrls: ['./suspect-room.page.scss'],
})
export class SuspectRoomPage implements OnInit, OnDestroy {

  @Output() sideEffectCompleted = new EventEmitter<string>();

  public suspect1CloseUpViewBox: any = "800 500 1200 600";
  public suspect2CloseUpViewBox: any = "2270 850 1200 600";
  public suspect3CloseUpViewBox: any = "3750 700 1200 600";
  public suspect123InitialView: any = "0 0 5450 3199";

  public namesRevealed: boolean = true;

  animateTimer: boolean = false;

  public fullScreenMode: boolean = false;
  public player1joined: boolean = false;
  public player2joined: boolean = false;
  public microphonePermissionGranted: boolean = false;
  public localControllerPlayer1CanSpeak: boolean = false;
  public localControllerPlayer1CanObject: boolean = false;
  public localControllerPlayer2CanSpeak: boolean = false;
  public localControllerPlayer2CanObject: boolean = false;
  public showQRCode: boolean = false;
  public qrCodeUrl: string = `${window.location.protocol}//${window.location.host}/controller`;
  public showSuspectRoom: string = 'hidden';
  public showCodeLock: string = 'visible';
  public currentGameSessionStatus: string = "unknown";
  public enteredCode: string = '';
  private validCode: string = '54321';
  public messages: ChatMessage[] = [];
  public currentViewBox: any = "0 300 5450 2199";
  public timerValue: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService,
    public conversationFlow: ConversationFlowService,
    public gamestate: GameStateService,
    private db: DatabaseService,
    private platform: Platform,
    private modal: ModalController
  ) {
  }

  suspectClicked(number: number) {
    switch(number) {
      case 1:
        if (!this.gamestate.suspect1.selectable) return;
        this.gamestate.currentCharacter = "jones";
        this.conversationFlow.script = this.conversationFlow.script.concat(this.conversationFlow.jonesScript);
        this.currentViewBox = this.suspect1CloseUpViewBox;
        this.conversationFlow.handleUserInput('player', "Ok, starting with mr. Jones...");
        this.gamestate.suspect1.meterVisible = "visible";
        break;
      case 2:
        if (!this.gamestate.suspect2.selectable) return;
        this.currentViewBox = this.suspect2CloseUpViewBox;
        this.conversationFlow.handleUserInput('player', "Sure, mr. Jenny, you are next!");
        this.gamestate.suspect2.meterVisible = "visible";
        break;
      case 3:
        if (!this.gamestate.suspect3.selectable) return;
        this.gamestate.currentCharacter = "prescott";
        this.conversationFlow.script = this.conversationFlow.script.concat(this.conversationFlow.prescottScript)
        this.currentViewBox = this.suspect3CloseUpViewBox;
        this.conversationFlow.handleUserInput('player', "Yep, let's talk to mr. Prescott");
        this.gamestate.suspect3.meterVisible = "visible";
        break;
    };
  }

  private reactToPlayerStateChanges() {
    this.gamestate.player1DetailsSubject.subscribe((player1obj)=>{
      //console.log("react to player changes 1:", player1obj)
      if (this.gamestate.localMultiplayerMode) {
        this.localControllerPlayer1CanSpeak = player1obj.canSpeak;
        this.localControllerPlayer1CanObject = player1obj.canObject;
      }
      if (player1obj.input) {
        this.conversationFlow.handleUserInput('player', player1obj.input);
        this.gamestate.updatePlayer1Details({ input: '' })
      }
    });
    this.gamestate.player2DetailsSubject.subscribe((player2obj)=>{
      //console.log("react to player changes 2:", player2obj)
      if (this.gamestate.localMultiplayerMode) {
        this.localControllerPlayer2CanSpeak = player2obj.canSpeak;
        this.localControllerPlayer2CanObject = player2obj.canObject;
      }
      if (player2obj.input) {
        this.conversationFlow.handleUserInput('player', player2obj.input);
        this.gamestate.updatePlayer2Details({ input: '' })
      }
    });
  };

  private updateTimer(value: number) {
    this.timerValue = value;
    let intervalHolder: any;
  
    if (this.timerValue > 0) {
      intervalHolder = setInterval(() => {
        this.timerValue--;
        this.triggerAnimation();
        if (this.timerValue <= 0) {
          clearInterval(intervalHolder);
          this.timerValue = 0;
        }
      }, 1000);
    }
  };

  triggerAnimation() {
    this.animateTimer = true;
    setTimeout(() => {
      this.animateTimer = false;
    }, 300); // Matches the animation duration
  }

  private handleOnlineSessionStateChange(status: string) {
    switch (status) {
      case 'empty':
        console.log('Waiting for courtroom');
        break;
      case 'sessionStarted':
        console.log('Session started.');
        break;
      case 'player1joined':
        console.log('Player 1 joined. Waiting for Player 2...');
        this.conversationFlow.playerJoined();
        break;
      case 'player2joined':
        console.log('Player 2 joined. Starting game...');
        this.conversationFlow.playerJoined();
        break;
      case 'sessionEnded':
        console.log('Session ended.');
        break;
      default:
        console.log('Unknown session state:', status);
        break;
    }
  };

  private async handleSideEffect(stepWithSideEffect: { step: ConversationStep, sideEffect: SideEffect }) {
    let sideEffect = stepWithSideEffect.sideEffect;
    let step = stepWithSideEffect.step;
    switch (sideEffect.type) {
      case 'changeViewbox':
        this.currentViewBox = sideEffect.value;
        break;
      case 'displayQRCode':
        this.showQRCode = sideEffect.value;
        console.log("handling QR code display")
        break;
      case 'playScriptedAudio':
        if (this.gamestate.voiceMode) {
          await this.playAudioAndWait(sideEffect.value);
        }
        if (!step.waitForUsers && this.gamestate.voiceMode) {
          await this.conversationFlow.proceedWithConversation();
        };
        break;
      case 'setTimer':
        this.updateTimer(sideEffect.value)
        break;
      case 'suspectSelectable':
        this.gamestate.suspect1.selectable = sideEffect.value;
        this.gamestate.suspect3.selectable = sideEffect.value;
        break;
      case 'suspectMeterUpdate':
        switch(sideEffect.suspectNumber) {
          case 1:
            this.gamestate.suspect1.meter = sideEffect.meterValue;
            if (sideEffect.meterValue < 101) {
              this.gamestate.suspect1.meterColor = 'orange';
            }
            break;
          case 2:
            this.gamestate.suspect2.meter = sideEffect.meterValue;
            break;
          case 3:
            this.gamestate.suspect3.meter = sideEffect.meterValue;
            if (sideEffect.meterValue < 101) {
              this.gamestate.suspect3.meterColor = 'orange';
            }
            break;
        }
        break;
      case 'sentimentChange':
        this.tempUpdateSentiment(sideEffect.value)
        break;
    }
  };

  tempUpdateSentiment(sentimentValue: string) {

    if (this.gamestate.currentCharacter === 'jones') {
      // Adjust meter value based on sentiment
      if (sentimentValue === "positive") {
        this.gamestate.suspect1.meter += 50;
        if (this.gamestate.suspect1.meter > 250) { this.gamestate.suspect1.meter = 250; }
      } else {
        this.gamestate.suspect1.meter -= 50;
        if (this.gamestate.suspect1.meter < 0) { this.gamestate.suspect1.meter = 0; }
      }
      console.log("meter: "+this.gamestate.suspect1.meter)
      // Update meter color and handle conversation flow based on meter value
      switch (true) {
      case this.gamestate.suspect1.meter > 200:
        this.gamestate.suspect1.meterColor = "green";
        break;
      case this.gamestate.suspect1.meter > 150:
        this.gamestate.suspect1.meterColor = "blue";
        break;
      case this.gamestate.suspect1.meter > 100:
        this.gamestate.suspect1.meterColor = "cyan";
        break;
      case this.gamestate.suspect1.meter > 50:
        this.gamestate.suspect1.meterColor = "orange";
        break;
      case this.gamestate.suspect1.meter == 0:
        this.gamestate.suspect1.meterColor = "red";
        break;
      }
    };

    if (this.gamestate.currentCharacter === 'prescott') {
      // Adjust meter value based on sentiment
      if (sentimentValue === "positive") {
        this.gamestate.suspect3.meter += 50;
        if (this.gamestate.suspect3.meter > 250) { this.gamestate.suspect3.meter = 250; }
      } else {
        this.gamestate.suspect3.meter -= 50;
        if (this.gamestate.suspect3.meter < 0) { this.gamestate.suspect3.meter = 0; }
      }
      console.log("meter: "+this.gamestate.suspect3.meter)
      // Update meter color and handle conversation flow based on meter value
      switch (true) {
      case this.gamestate.suspect3.meter <= 250:
        this.gamestate.suspect3.meterColor = "red";
        break;
      case this.gamestate.suspect3.meter <= 200:
        this.gamestate.suspect3.meterColor = "orange";
        break;
      case this.gamestate.suspect3.meter <= 150:
        this.gamestate.suspect3.meterColor = "blue";
        break;
      case this.gamestate.suspect3.meter <= 100:
        this.gamestate.suspect3.meterColor = "cyan";
        break;
      case this.gamestate.suspect3.meter <= 50:
        this.gamestate.suspect3.meterColor = "green";
        break;
      }
    };

  }

  async wrapConversation() {
    await this.conversationFlow.pause(1000);
    this.conversationFlow.currentStepIndex++;
    this.conversationFlow.proceedWithConversation();
  };

  playAudioAndWait(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.play().then(() => {
        audio.onended = () => {
          resolve(); 
        };
      }).catch(error => {
        reject(error);
      });
    });
  };

  isCodeValid(): boolean {
    return this.enteredCode === this.validCode;
  };

  async startGameSession() {
    if (this.isCodeValid()) {
      if (!this.gamestate.voiceMode) {
        this.chatService.typingSimulator.word_delay = 10;
        this.chatService.typingSimulator.punctuation_delay = 10;
        this.chatService.typingSimulator.end_message_delay = 50;
      };
      if (!this.gamestate.localMultiplayerMode) {
        this.db.listenData('sessions/currentSession/status').subscribe((result)=>{
          let obj = result.snapshot.val();
          if (obj) {
            this.currentGameSessionStatus = obj
            this.handleOnlineSessionStateChange(obj);
          }
        })
        await this.db.startSession();
        this.listenPlayerStateUpdatesOnServerByCourtroom();
      };
      this.showSuspectRoom = 'visible';
      this.showCodeLock = 'hidden';
      this.showQRCode = false;
      this.player1joined = true;
      this.conversationFlow.proceedWithConversation();
    } else {
      console.log('Invalid code entered');  // You can also display an error message in the UI
    }
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  };

  async openModal(playerNumber: number) {

    let stepToInject: any;

    if (this.timerValue) {
      if (this.gamestate.currentCharacter === 'jones') {
        stepToInject = { 
          phase: 'suspect_3',
          type: 'aiNPC',
          sender: 'suspect',
          senderName: this.gamestate.currentCharacter,
          content: "", 
          waitForUsers: true,
          aiPrompt: [
            { 
              role: "system",
              content: `You are Jones, a Silicon Valley hipster who went to an antiques show at a private estate to find a cool gift for your fiancée. Unfortunately, you ended up stuck in the bathroom for way too long after a bad burrito, and during that time, you overheard a heated argument—something that might be important to the case. But you are way too embarrassed to admit how long you were in the bathroom and feel awkward about the whole situation so you will not mention anything to the police questioning unless they will act positively and will make you feel comfortable first. If player asks nicely, or laughs it off or in other way make you feel like good, you will start talking about what you heard otherwise you will not spill any information to them. But if they threaten, make fun of you or focus on the bathroom incident, you get defensive and and will only give short responses.`
            }
          ],
          sideEffects: [
            { type: 'createPrompt', value: 'questioningJones' },
            { type: 'updatePlayerState', canSpeak: true }
          ]
        }
      }
      if (this.gamestate.currentCharacter === 'prescott') {
        stepToInject = { 
          phase: 'suspect_3',
          type: 'aiNPC',
          sender: 'suspect',
          senderName: this.gamestate.currentCharacter,
          content: "", 
          waitForUsers: true,
          aiPrompt: [
            { 
              role: "system",
              content: 'You are Prescott, a fortune hunter obsessed with finding valuable antiques. You’ve spent years chasing rumors of lost treasures, and your desperation to strike it big has pushed you to take reckless risks. You recently attended an antiques show, hoping to strike a deal with Mrs. Sweet, who you believed owned a priceless item. However, Mrs. Sweet was found dead shortly after you were seen talking to her, and now you’re terrified of getting implicated in this investigation. If the detective asks simple or non-accusatory questions, you’ll stay composed and respond with cool, rehearsed answers. However, if they start challenging your story, calling out inconsistencies, or accusing you, your nerves will start to show, and your confidence will crumble.'
            }
          ],
          sideEffects: [
            { type: 'createPrompt', value: 'questioningPrescott' },
            { type: 'updatePlayerState', canSpeak: true }
          ]
        }
      }
      this.conversationFlow.script.splice(this.conversationFlow.script.length-1, 0, stepToInject)
    } else {
      this.gamestate.updatePlayer1Details({ canSpeak: false });
    }

    const modal = await this.modal.create({
      component: LocalControllerComponent,
      cssClass: 'half-height-modal',
      backdropDismiss: true,
      showBackdrop: true,
      componentProps: {
        playerNumber: playerNumber
      }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      if (playerNumber === 1) {
        this.gamestate.updatePlayer1Details({
          input: data,
          canSpeak: false,
          canObject: false
        })
      } else
      if (playerNumber === 2) {
        this.gamestate.updatePlayer2Details({
          input: data,
          canSpeak: false,
          canObject: false
        })
      };
    }
  };

  async localPlayerJoin() {
    if (!this.gamestate.localMultiplayerMode) return;
    if (!this.player1joined && !this.player2joined) {
      this.player1joined = true;
      this.gamestate.currentSessionState = 'player1joined';
      this.gamestate.updatePlayer1Details({ role: "prosecutor" });
      this.conversationFlow.proceedWithConversation();
    } else 
    if (this.player1joined && !this.player2joined) {
      this.player2joined = true;
      this.gamestate.currentSessionState = 'player2joined';
      this.gamestate.updatePlayer2Details({ role: "defender" });
      this.conversationFlow.proceedWithConversation();
    } else {
      this.gamestate.currentSessionState = 'sessionStarted';
    }
  };

  private listenPlayerStateUpdatesOnServerByCourtroom() {
    this.db.listenData('sessions/currentSession').subscribe((result)=>{
      let obj = result.snapshot.val();
      if (obj.player1) {
        console.log("player 1 changes detected by courtroom")
        // this.gamestate.updatePlayer1Details(obj.player1)
        this.gamestate.player1DetailsSubject.next(obj.player1);
      };
      if (obj.player2) {
        console.log("player 2 changes detected by courtroom")
        // this.gamestate.updatePlayer2Details(obj.player2)
        this.gamestate.player2DetailsSubject.next(obj.player2);
      };
    })
  };

  async ngOnInit() {

    await this.db.resetSession();

    this.platform.ready().then(() => {
      this.requestMicrophonePermission();
    });

    this.chatService.messages$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(messages => {
      this.messages = messages;
    });

    this.conversationFlow.sideEffectTriggered.pipe(
      takeUntil(this.destroy$)
    ).subscribe(this.handleSideEffect.bind(this));

    this.reactToPlayerStateChanges();
  
  };

  // MISC:

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

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      const element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen();
          this.fullScreenMode = true;
        };
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        this.fullScreenMode = false;
      }
    }
  };

  handleStabilityChange(event: any) {
    this.conversationFlow.aiService.temperature = parseFloat(event.detail.value);
    console.log('ionChange stability fired with value: ' + event.detail.value);
  };

}
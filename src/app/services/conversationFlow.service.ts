// conversation-flow.service.ts
import { Injectable, EventEmitter } from '@angular/core';
import { ChatService } from './chat.service';
import { AiService, GPTMessage } from './ai.service';
import { BehaviorSubject, Observable, of, lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GameStateService, Player } from './gamestate.service';

export type SideEffect = 
  | { type: 'changeViewbox', value: string }
  | { type: 'sentimentChange', value: string }
  | { type: 'updatePlayerState', canSpeak: boolean }
  | { type: 'awaitPlayerJoin', player: 'any' }
  | { type: 'setTimer', value: number }
  | { type: 'playScriptedAudio', value: string }
  | { type: 'playScriptedVideo', value: string }
  | { type: 'displayQRCode', value: boolean }
  | { type: 'createPrompt', value: string }
  | { type: 'suspectSelectable', value: boolean }
  | { type: 'suspectMeterUpdate', suspectNumber: number, meterValue: number}

export interface ConversationStep {
  phase: string;
  type: 'scriptedNPC' | 'aiNPC' | 'player';
  sender: 'detective' | 'suspect' | 'player';
  senderName?: any,
  content?: string;
  aiPrompt?: Array<GPTMessage>;
  waitForUsers: boolean;
  sideEffects?: SideEffect[];
}

@Injectable({
  providedIn: 'any'
})
export class ConversationFlowService {

  public script: Array<ConversationStep> = [
    { 
      phase: 'setup_1', 
      type: 'scriptedNPC',
      sender: 'detective',
      senderName: 'detective',
      content: "Alright, we got some other suspects at our precinct, they all seem a bit nervous, as if they know or did something... Help me warm them up but not lawyer up! They each might reveal something important for the case or worse...", 
      waitForUsers: false,
      sideEffects: [
        { type: 'playScriptedAudio', value: '../../assets/audio/scripted_audio_detective_0.mp3' }
      ]
    },
    { 
      phase: 'setup_2', 
      type: 'scriptedNPC',
      sender: 'detective',
      senderName: 'detective',
      content: "Here we have Hipster Jones, who seems embarrassed, so you might want to be nice to him. Then there's Jenny, the very nervous dog-walker we caught trespassing on the property. And finally, we have Mr. Prescott, who was seen arguing with Mrs. Sweet, and, well, we need to give him a little push, if you know what I mean...", 
      waitForUsers: false,
      sideEffects: [
        { type: 'playScriptedAudio', value: '../../assets/audio/scripted_audio_detective_1.mp3' }
      ]
    },
    { 
      phase: 'setup_4', 
      type: 'scriptedNPC',
      sender: 'detective',
      senderName: 'detective',
      content: "Start with Jones or Prescott. I will introduce you, then pretend i wink-wink-forgot the tape recorder, so you will have exactly 3 minutes off-the-tape time to crack them! [Tap Jones or Prescott to start]", 
      waitForUsers: true,
      sideEffects: [
        { type: 'suspectSelectable', value: true },
        { type: 'playScriptedAudio', value: '../../assets/audio/scripted_audio_detective_2.mp3' }
      ]
    }
  ];

  public jonesScript: Array<ConversationStep> = [
    { 
      phase: 'setup_1', 
      type: 'scriptedNPC',
      sender: 'detective',
      senderName: 'detective',
      content: "Alright... Mr. Jones, I am detective Steele, these are my assistants...oh so silly of me, I forgot the tape recorder. I will be back shortly...", 
      waitForUsers: false,
      sideEffects: [
        { 
          type: 'setTimer', value: 180
        },
        { type: 'playScriptedAudio', value: '../../assets/audio/scripted_audio_detective_3.mp3' }
      ]
    },
    { 
      phase: 'suspect_2', 
      type: 'scriptedNPC',
      sender: 'suspect',
      senderName: 'jones',
      content: "Hey listen, I think there was a terrible mistake, what am I even doing here???", 
      waitForUsers: true,
      sideEffects: [
        { type: 'suspectMeterUpdate', suspectNumber: 1, meterValue: 100 },
        { type: 'updatePlayerState', canSpeak: true },
        { type: 'playScriptedAudio', value: '../../assets/audio/scripted_audio_suspect1_0.mp3' }
      ]
    },
    { 
      phase: 'suspect_3',
      type: 'aiNPC',
      sender: 'suspect',
      senderName: 'jones',
      content: "", 
      waitForUsers: true,
      aiPrompt: [
        { 
          role: "system",
          content: `You are Jones, a Silicon Valley hipster who attended an antiques show at a private estate to find a unique gift for your fiancée. Unfortunately, after eating a bad burrito, you found yourself stuck in the bathroom for too long, raising suspicion when the police arrived. During this time, you overheard a heated argument between a man and a woman, which could be crucial to the case. You're embarrassed about your bathroom incident and reluctant to discuss it with the police. To feel comfortable sharing what you overheard, the detective must treat you with respect and kindness. If the detective makes you feel good and respected, you may start revealing details about the argument. However, if they mock you or focus on the bathroom incident, you’ll become defensive, provide short answers, and try to leave. Initially, your responses should be brief and evasive, as you’re hesitant to talk and ready to lawyer up. If the detective persists respectfully, you may gradually open up about the conversation you overheard.`
        }
      ],
      sideEffects: [
        { type: 'createPrompt', value: 'questioningJones' },
        { type: 'updatePlayerState', canSpeak: true }
      ]
    },
    { 
      phase: 'suspect_5', 
      type: 'scriptedNPC',
      sender: 'detective',
      senderName: 'detective',
      content: "Ok I am back, looks like you guys shad a good chat here? [END OF DEMO]", 
      waitForUsers: true,
      sideEffects: [
        { type: 'suspectSelectable', value: false },
        { type: 'updatePlayerState', canSpeak: false },
        { type: 'playScriptedAudio', value: '../../assets/audio/scripted_audio_detective_wrap.mp3' }
      ]
    }
  ]

  public prescottScript: Array<ConversationStep> = [
    { 
      phase: 'setup_1', 
      type: 'scriptedNPC',
      sender: 'detective',
      senderName: 'detective',
      content: "Good day to you, Mr. Prescott, I am detective Steele, and these are my trainees...oh so silly of me, I forgot the tape recorder. I will be back shortly...", 
      waitForUsers: false,
      sideEffects: [
        { 
          type: 'setTimer', value: 180
        },
        { type: 'playScriptedAudio', value: '../../assets/audio/scripted_audio_detective_4.mp3' }
      ]
    },
    { 
      phase: 'suspect_2', 
      type: 'scriptedNPC',
      sender: 'suspect',
      senderName: 'prescott',
      content: "Who are you exactly? w-w-why was I detained?? Is now a visit to antiques show against the law??", 
      waitForUsers: true,
      sideEffects: [
        { type: 'suspectMeterUpdate', suspectNumber: 3, meterValue: 150 },
        { type: 'updatePlayerState', canSpeak: true },
        { type: 'playScriptedAudio', value: '../../assets/audio/scripted_audio_suspect3_0.mp3' }
      ]
    },
    { 
      phase: 'suspect_3',
      type: 'aiNPC',
      sender: 'suspect',
      senderName: 'prescott',
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
    },
    { 
      phase: 'suspect_3', 
      type: 'scriptedNPC',
      sender: 'detective',
      senderName: 'detective',
      content: "Ok I am back, looks like you guys had a good chat here? [END OF DEMO]", 
      waitForUsers: true,
      sideEffects: [
        { type: 'suspectSelectable', value: false },
        { type: 'updatePlayerState', canSpeak: false },
        { type: 'playScriptedAudio', value: '../../assets/audio/scripted_audio_detective_wrap.mp3' }
      ]
    }
  ]

  public currentStepIndex = -1;
  public latestPlayerMessage!: GPTMessage
  currentGamePhase = new BehaviorSubject<string>('setup');
  sideEffectTriggered = new EventEmitter<{ step: ConversationStep, sideEffect: SideEffect }>();
  playerStateUpdated = new EventEmitter<{playerId: 'prosecutor' | 'defender', updates: Partial<Player>}>();

  constructor(
    private chatService: ChatService,
    public aiService: AiService,
    private gamestate: GameStateService
  ) {}

  async proceedWithConversation() {
    await this.moveToNextStep();
  };

  async wrapConversation() {
    this.currentStepIndex = this.script.length-2;
    await this.processCurrentStep();
  };
  
  async playerJoined() {
    await this.moveToNextStep();
  };

  private async moveToNextStep() {
    console.log("next step triggered")
    this.currentStepIndex++;
    await this.processCurrentStep();
  };

  private async processCurrentStep() {

    if (this.currentStepIndex < this.script.length) {

      const currentStep = this.script[this.currentStepIndex];

      await this.processStep(currentStep);

    };

  };

  private async processStep(step: ConversationStep) {

    console.log('processing step: ', step)

    if (step.sideEffects) {
      // Trigger side effects sequentially, waiting for each one to complete
      for (const sideEffect of step.sideEffects) {
        this.triggerSideEffect(step, sideEffect);
      }
    };

    this.currentGamePhase.next(step.phase);

    await this.pause(1000);

    switch (step.type) {
      case 'scriptedNPC':
        await this.handleScriptedNPCStep(step);
        break;
      case 'aiNPC':
        await this.handleAINPCStep(step);
        break;
      case 'player':
        await this.handlePlayerStep(step);
        break;
    };

    if (!step.waitForUsers && !this.gamestate.voiceMode) {
      await this.proceedWithConversation();
    };

  };

  private async handleScriptedNPCStep(step: ConversationStep) {
    await lastValueFrom(this.chatService.addMessage({
      phase: step.phase,
      type: 'scriptedNPC',
      sender: step.sender,
      senderName: step.senderName,
      content: step.content!,
      timestamp: new Date()
    }));
  };

  private async handleAINPCStep(step: ConversationStep) {
    // text:
    const response = await lastValueFrom(this.handleAIResponse(step));
    console.log(response)
    let responseObj: any;
    if (response.choices) {
      responseObj = JSON.parse(response.choices[0].message.content);
    } else {
      responseObj = 'Hmm I am not sure I understood you well...'
    };
    if (responseObj && responseObj.sentiment) {
      this.triggerSideEffect(step, { type: 'sentimentChange', value: responseObj.sentiment })
    }
    // Await the audio playback to finish
    if (this.gamestate.voiceMode) {
      // audio:
      const blob = await lastValueFrom(this.aiService.getAiAudio(responseObj.response, step.senderName));
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      lastValueFrom(this.chatService.addMessage({
        phase: step.phase,
        type: 'aiNPC',
        sender: step.sender,
        senderName: step.senderName,
        content: responseObj.response,
        timestamp: new Date()
      }));
      audio.play();
      audio.onended = ()=>{
        this.checkForWrapConversation();
      }
    } else {
      await lastValueFrom(this.chatService.addMessage({
        phase: step.phase,
        type: 'aiNPC',
        sender: step.sender,
        senderName: step.senderName,
        content: responseObj.response,
        timestamp: new Date()
      }));
      this.checkForWrapConversation();
    }
  };

  private async handlePlayerStep(step: ConversationStep) {
    console.log('awaiting player input')
    console.log(step.aiPrompt)
  };

  private handleAIResponse(step: ConversationStep): Observable<any> {
    let prompt: Array<GPTMessage> = [];
    if (step.aiPrompt) {
      prompt = step.aiPrompt;
      prompt.push(this.latestPlayerMessage);
    } else {
      console.error("AI prompt is empty. Something went wrong")
    };
    return this.aiService.getAiResponse(prompt).pipe(
      catchError(error => {
        console.error('Error getting AI response:', error);
        return of('AI response unavailable');
      })
    );
  };

  async handleUserInput(sender: 'detective' | 'suspect' | 'player', message: string) {
    await lastValueFrom(this.chatService.addMessage({
      phase: this.currentGamePhase.value,
      type: 'player',
      sender: sender,
      senderName: 'player',
      content: message,
      timestamp: new Date()
    }, true));
    this.latestPlayerMessage =
    {
      role: 'user',
      content: message
    }
    await this.moveToNextStep();
  };

  private triggerSideEffect(step: ConversationStep, sideEffect: SideEffect) {
    console.log('triggering side effect')
    this.sideEffectTriggered.emit({ step: step, sideEffect: sideEffect});
    switch(sideEffect.type) {
      case 'updatePlayerState':
        this.gamestate.updatePlayer1Details({
          canSpeak: sideEffect.canSpeak
        })
        break;
      case 'createPrompt':
        if (step.aiPrompt) {
          step.aiPrompt.push(
            {
              role: 'system',
              content: `You should consider the full chat history: (${this.chatService.chatHistoryString}), to decide if based on your prompt you can reveal more details to the player or you are hesitating, but do not say that to player, they have to figure the approach to crack you on their own. Respond in valid json format { "response": "string goes here", "sentiment": "positive" | "negative" }. For Jones negative sentiment is if he is not comfortable and positive if Jones feels warmed up by player. For Prescott, negative sentiment is when he looses his composure and positive if he maintains his composure.`
            }
          )
        }
        break;
    };
  };

  private checkForWrapConversation() {
    if(this.gamestate.currentCharacter === 'jones' && !this.gamestate.suspect1.processed) {
      if (this.gamestate.suspect1.meter === 250) {
        console.log("Jones SPILLING BEANS!")
        this.script.splice(this.script.length - 1, 0, {
          phase: 'suspect_4',
          type: 'scriptedNPC',
          sender: 'suspect',
          senderName: this.gamestate.currentCharacter,
          content: "You know, it is so good to talk to a person who respects you and understands the situation. Here is everything I know [SPILLING BEANS]", 
          waitForUsers: false,
          sideEffects: [
            { type: 'updatePlayerState', canSpeak: false },
            { type: 'playScriptedAudio', value: '../../assets/audio/suspect_1_spills_beans.mp3' }
          ]
        });
        this.gamestate.suspect1.processed = true;
        this.wrapConversation();
      }
      if (this.gamestate.suspect1.meter === 0) {
        console.log("Jones DEMANDS LAWYER!");
        this.script.splice(this.script.length - 1, 0, {
          phase: 'suspect_4',
          type: 'scriptedNPC',
          sender: 'suspect',
          senderName: this.gamestate.currentCharacter,
          content: "You know what? I want my lawyer here now, and I am not going to say anything else...", 
          waitForUsers: false,
          sideEffects: [
            { type: 'updatePlayerState', canSpeak: false },
            { type: 'playScriptedAudio', value: '../../assets/audio/suspect_1_lawyers_up.mp3' }
          ]
        });
        console.log(this.currentStepIndex)
        console.log(this.script);
        this.gamestate.suspect1.processed = true;
        this.wrapConversation();
      }
    } else if (this.gamestate.currentCharacter === 'prescott' && !this.gamestate.suspect3.processed) {
      if (this.gamestate.suspect3.meter === 0) {
        console.log("Prescott SPILLING BEANS!")
        this.script.splice(this.script.length - 1, 0, {
          phase: 'suspect_4',
          type: 'scriptedNPC',
          sender: 'suspect',
          senderName: this.gamestate.currentCharacter,
          content: "Oh wait! please wait! let me just tell you EVERYTHING I know, but I swear I had nothing to do with her death! [SPILLING BEANS]", 
          waitForUsers: false,
          sideEffects: [
            { type: 'updatePlayerState', canSpeak: false },
            { type: 'playScriptedAudio', value: '../../assets/audio/suspect_3_spills_beans.mp3' }
          ]
        });
        this.gamestate.suspect3.processed = true;
        this.wrapConversation();
      }
      if (this.gamestate.suspect3.meter === 250) {
        console.log("Prescott DEMANDS LAWYER!");
        this.script.splice(this.script.length - 1, 0, {
          phase: 'suspect_4',
          type: 'scriptedNPC',
          sender: 'suspect',
          senderName: this.gamestate.currentCharacter,
          content: "You know what? I want my lawyer here now, and I am not going to say anything else...", 
          waitForUsers: false,
          sideEffects: [
            { type: 'updatePlayerState', canSpeak: false },
            { type: 'playScriptedAudio', value: '../../assets/audio/suspect_3_lawyers_up.mp3' }
          ]
        });
        this.gamestate.suspect3.processed = true;
        this.wrapConversation();
      }
    }
  };

  async pause(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  };

}


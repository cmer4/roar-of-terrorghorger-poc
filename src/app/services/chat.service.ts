import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { concatMap, tap, finalize } from 'rxjs/operators';
import { TypingSimulatorService } from './typing-simulator.service';

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

export interface ChatMessage {
  phase: GamePhase['type'] | string
  type: 'scriptedNPC' | 'aiNPC' | 'player'
  sender: 'detective' | 'suspect' | 'player';
  senderName?: any,
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

@Injectable({
  providedIn: 'any'
})
export class ChatService {

  private messages = new BehaviorSubject<ChatMessage[]>([]);

  public messages$ = this.messages.asObservable();

  public chatHistoryString: string = "";

  constructor(public typingSimulator: TypingSimulatorService) {}

  addMessage(message: ChatMessage, isRealUser: boolean = false): Observable<void> {
    console.log(message)
    if (isRealUser) {
      const currentMessages = this.messages.value;
      this.messages.next([message, ...currentMessages]);
      this.updateChatHistory(message);
      return of(void 0);
    } else {
      const typingMessage: ChatMessage = { ...message, content: '', isTyping: true };
      const currentMessages = this.messages.value;
      this.messages.next([typingMessage, ...currentMessages]);
      return this.typingSimulator.simulateTyping(message.content).pipe(
        tap(partialContent => {
          typingMessage.content = partialContent;
          this.messages.next([...this.messages.value]);
        }),
        finalize(() => {
          typingMessage.isTyping = false;
          this.messages.next([...this.messages.value]);
          this.updateChatHistory(message);
        }),
        concatMap(() => of(void 0))
      );
    };
  }

  updateChatHistory(message: ChatMessage) {
    // only add messages from player or witness:
    if (message.sender === 'detective') return;

    // Create a string representation of the message
    const formattedMessage = `${message.sender}: ${message.content}\n`;

    // Append it to the chatHistoryString
    this.chatHistoryString += formattedMessage;
    console.log(this.chatHistoryString)
  }
}
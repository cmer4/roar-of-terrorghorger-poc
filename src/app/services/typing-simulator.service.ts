import { Injectable } from '@angular/core';
import { Observable, of, concat } from 'rxjs';
import { delay, concatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'any'
})
export class TypingSimulatorService {

  public word_delay = 200; // milliseconds between words
  public punctuation_delay = 200; // milliseconds after punctuation
  public end_message_delay = 300; // milliseconds after the last word

  simulateTyping(fullMessage: string): Observable<string> {
    const words = fullMessage.split(' ');
    let currentMessage = '';

    return concat(
      ...words.map((word, index) => {
        return of(word).pipe(
          concatMap(w => {
            const hasPunctuation = /[.!?]$/.test(w);
            currentMessage += (currentMessage ? ' ' : '') + w;
            
            return of(currentMessage).pipe(
              delay(this.word_delay),
              concatMap(msg => {
                if (hasPunctuation) {
                  return of(msg).pipe(delay(this.punctuation_delay));
                }
                return of(msg);
              }),
              concatMap(msg => {
                if (index === words.length - 1) {
                  return of(msg).pipe(delay(this.end_message_delay));
                }
                return of(msg);
              })
            );
          })
        );
      })
    );
  }
}
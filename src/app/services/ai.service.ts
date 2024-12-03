import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface GPTMessage {
  role: "user" | "system" | "assistant",
  content: string
}

@Injectable({
  providedIn: 'any'
})
export class AiService {

  public temperature: number = 0.7;

  constructor(private http: HttpClient) {}

  getAiResponse(gptMessages: Array<GPTMessage>): Observable<any> {
    console.log(gptMessages)
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer sk-proj-EeVHFrdNSA7YLDcLzsqlT3BlbkFJalv1u8lVHJqfqX8F3wAF`
    });

    const body = {
      messages: gptMessages,
      model: "gpt-4o-mini-2024-07-18",
      temperature: this.temperature
    };

    return this.http.post('https://api.openai.com/v1/chat/completions', body, { headers: headers });
  }

  getAiAudio(message:string, suspect: string | undefined): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer sk-proj-EeVHFrdNSA7YLDcLzsqlT3BlbkFJalv1u8lVHJqfqX8F3wAF`
    });

    let voice = 'echo';

    if (suspect && suspect.match('jones')) {

      voice = 'onyx'

    } else {

      voice = 'fable'

    }

    const body = {
      input: message,
      model: "tts-1",
      voice: voice
    };

    return this.http.post('https://api.openai.com/v1/audio/speech', body, { headers: headers, responseType: "blob" });
  }

}
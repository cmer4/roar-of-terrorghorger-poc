import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {

  recognition: any;
  isListening = false;
  currentTranscript = ''; // For interim results
  finalTranscript = ''; // For final results
  currentSpeech = new EventEmitter<string>();

  constructor() {

    const { webkitSpeechRecognition }: IWindow = window as any;

    if (webkitSpeechRecognition) {

      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true; // Continue listening until manually stopped
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        this.currentTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.finalTranscript += transcript.trim() + ' ';
          } else {
            this.currentTranscript += transcript;
            this.currentSpeech.emit(this.currentTranscript)
          }
        }

      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.finalTranscript += this.currentTranscript; // Append any remaining interim transcript
      };
    } else {
      alert('Speech recognition is not supported in this browser. Please use modern Chrome');
    }
  };

  startListening() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.finalTranscript = '';
      this.currentTranscript = '';
      this.recognition.start();
    }
  };

  stopListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.recognition && this.isListening) {
        this.isListening = false;
        this.recognition.stop();
        // Handler for final result
        this.recognition.onend = () => {
          // Slight delay to process final words
          setTimeout(() => {
            try {
              this.finalTranscript += this.currentTranscript;  // Append final transcript
              resolve(this.finalTranscript);  // Resolve the promise with the final transcript
            } catch (error) {
              reject('Error processing final transcript: ' + error);
            }
          }, 400);
        };
  
        // Handle any errors during the process
        this.recognition.onerror = (event: any) => {
          reject('Speech recognition error: ' + event.error);
        };
      } else {
        reject('Speech recognition is not active.');
      }
    });
  };

}

interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

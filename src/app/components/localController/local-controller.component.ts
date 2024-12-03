import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';

@Component({
  selector: 'local-controller',
  templateUrl: 'local-controller.component.html',
})
export class LocalControllerComponent implements OnInit {

  public playerNumber!: number;
  public input: string = "";
  public recordingSpeech: boolean = false;

  constructor(private modalCtrl: ModalController, private speechRecognition: SpeechRecognitionService) {}

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  speak() {
    let transcript = this.input.trim();
    if (transcript) {
      this.modalCtrl.dismiss(this.input.trim(), 'confirm');
    };
  };

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevents a new line from being added
      this.speak(); // Trigger the speak function
    }
  };

  object() {
    console.log("Objection!!!")
  };

  handleRecording() {

    if (this.recordingSpeech) {
      this.stopSpeechRecording();
    } else {
      this.startSpeechRecording();
    }

  }

  startSpeechRecording() {
    console.log('started recording)');
    this.recordingSpeech = true;
    this.speechRecognition.startListening();
  };

  stopSpeechRecording() {
    this.recordingSpeech = false;
    this.speechRecognition.stopListening().then((transcript)=>{
      this.input = transcript;
    })
  };

  ngOnInit(): void {

  }

}
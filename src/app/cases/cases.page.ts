import { Component, OnInit } from '@angular/core';

export interface Case {
  id: number;
  title: string;
  summary: string;
  details: string;
  evidence: string[];
  witness: {
    name: string;
    role: string;
    testimony: string;
  };
}

@Component({
  selector: 'app-cases',
  templateUrl: './cases.page.html',
  styleUrls: ['./cases.page.scss'],
})
export class CasesPage {

  cases: Case[] = [];

  constructor() {
  }

  selectStory() {
    console.log("hi")
  }

  ngAfterViewInit() {
  }

}
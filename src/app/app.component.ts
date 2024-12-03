import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  public appPages = [
    { title: 'Courtroom', url: '/courtroom', icon: 'mail' },
    { title: 'Controller', url: '/controller', icon: 'game-controller' },
    { title: 'Cases', url: '/cases', icon: 'book' },
    { title: 'Debug', url: '/debug', icon: 'bug' },
  ];

  constructor(
  ) {}

  ngOnInit() {

  }

}

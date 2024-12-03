import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuspectRoomPage } from './suspect-room.page';

const routes: Routes = [
  {
    path: '',
    component: SuspectRoomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuspectRoomPageRoutingModule {}

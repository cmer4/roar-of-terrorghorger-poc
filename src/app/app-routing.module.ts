import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'suspect-room',
    pathMatch: 'full'
  },
  {
    path: 'suspect-room',
    loadChildren: () => import('./suspect-room/suspect-room.module').then( m => m.SuspectRoomPageModule)
  },
  {
    path: 'debug',
    loadChildren: () => import('./debug/debug.module').then( m => m.DebugPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

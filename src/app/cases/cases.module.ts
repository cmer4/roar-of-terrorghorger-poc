import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CasesPageRoutingModule } from './cases-routing.module';

import { CasesPage } from './cases.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CasesPageRoutingModule
  ],
  declarations: [CasesPage]
})
export class CasesPageModule {}

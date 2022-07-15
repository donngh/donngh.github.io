import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FicheifpbComponent } from './ficheifpb/ficheifpb.component';

const routes: Routes = [
	{ path: '', redirectTo: '/ifpb', pathMatch: 'full' },
	{ path: 'ifpb', component: FicheifpbComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

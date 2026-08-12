import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HelloComponent } from './hello.component';
import { HelloModule } from './hello.module';

const routes: Routes = [
  {
    component: HelloComponent,
    path: 'hello',
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/hello',
  },
];

@NgModule({
  exports: [HelloModule, RouterModule],
  imports: [HelloModule, RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}

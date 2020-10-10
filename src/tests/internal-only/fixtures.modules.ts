import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { InternalComponent } from './fixtures.components';

@NgModule({
  declarations: [InternalComponent],
  imports: [CommonModule],
})
export class TargetModule {}

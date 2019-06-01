import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PersonService } from './person.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    PersonService
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

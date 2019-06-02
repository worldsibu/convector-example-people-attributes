import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { PersonService } from './person.service';
import { HttpClientModule } from '@angular/common/http';
import { ParticipantService } from './participant.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [
    PersonService,
    ParticipantService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

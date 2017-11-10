import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { MaterializeModule } from "angular2-materialize";
import { DragulaModule } from "ng2-dragula";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MaterializeModule,
    DragulaModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

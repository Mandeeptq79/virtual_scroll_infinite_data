import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { AppComponent } from './app.component';
import { TableComponent } from './table/table.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule, ScrollingModule, MatTableModule ],
  declarations: [ AppComponent, TableComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }

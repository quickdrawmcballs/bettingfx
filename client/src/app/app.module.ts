import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { FormsModule } from '@angular/forms';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { MainTableComponent } from './main-table/main-table.component';
import { SortTableComponent } from './sort-table/sort-table.component';
import { NbaGamesListComponent } from './components/nba-games-list/nba-games-list.component';
import { DocumentComponent } from './components/document/document.component';
import { DocumentListComponent } from './components/document-list/document-list.component';

const config: SocketIoConfig = { url: 'http://localhost:8001', options: {} };

@NgModule({
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatSortModule,
    FormsModule,
    SocketIoModule.forRoot(config)
  ],
  declarations: [
    AppComponent,
    MainTableComponent,
    SortTableComponent,
    NbaGamesListComponent,
    DocumentComponent,
    DocumentListComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

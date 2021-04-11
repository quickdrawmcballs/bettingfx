import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { MainTableComponent } from './components/main-table/main-table.component';
import { SortTableComponent } from './components/sort-table/sort-table.component';
import { NbaGamesListComponent } from './components/nba-games-list/nba-games-list.component';
import { DocumentComponent } from './components/document/document.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { NbaRefreshOddsComponent } from './components/nba-refresh-odds/nba-refresh-odds.component';
import { NbaRefreshSeasonComponent } from './components/nba-refresh-season/nba-refresh-season.component';
import { UpcomingNbaGamesStatsTableComponent } from './components/upcoming-nba-games-stats-table/upcoming-nba-games-stats-table.component';
import { ErrorManagerComponent } from './components/error-manager/error-manager.component';
import { DiffChartComponent } from './components/diff-chart/diff-chart.component';


const config: SocketIoConfig = { url: 'http://localhost:8001', options:{}}; // withCredentials: false

@NgModule({
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatInputModule,
    MatDialogModule,
    MatFormFieldModule,
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
    DocumentListComponent,
    NbaRefreshOddsComponent,
    NbaRefreshSeasonComponent,
    UpcomingNbaGamesStatsTableComponent,
    ErrorManagerComponent,
    DiffChartComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

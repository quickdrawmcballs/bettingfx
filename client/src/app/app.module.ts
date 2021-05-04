import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { FormsModule } from '@angular/forms';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { MainTableComponent } from './components/main-table/main-table.component';
import { SortTableComponent } from './components/sort-table/sort-table.component';
import { DocumentComponent } from './components/document/document.component';
import { DocumentListComponent } from './components/document-list/document-list.component';
import { NbaRefreshOddsComponent } from './components/nba-refresh-odds/nba-refresh-odds.component';
import { NbaRefreshSeasonComponent } from './components/nba-refresh-season/nba-refresh-season.component';
import { UpcomingNbaGamesStatsTableComponent } from './components/upcoming-nba-games-stats-table/upcoming-nba-games-stats-table.component';
import { ErrorManagerComponent } from './components/error-manager/error-manager.component';
import { DiffChartComponent } from './components/diff-chart/diff-chart.component';
import { UpcomingNbaGamesStatsTableNoFrillsComponent } from './components/upcoming-nba-games-stats-table-no-frills/upcoming-nba-games-stats-table-no-frills.component';
import { MomentPipe } from './pipes/app.pipe.momentpipe';

import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { NbaGamesComponent } from './components/nba-games/nba-games.component';


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
    SocketIoModule.forRoot(config),
    NgbModule
    // NbaGameAnalysisModule
  ],
  declarations: [
    AppComponent,
    MainTableComponent,
    SortTableComponent,
    DocumentComponent,
    DocumentListComponent,
    NbaRefreshOddsComponent,
    NbaRefreshSeasonComponent,
    UpcomingNbaGamesStatsTableComponent,
    ErrorManagerComponent,
    DiffChartComponent,
    UpcomingNbaGamesStatsTableNoFrillsComponent,
    MomentPipe,
    PageNotFoundComponent,
    NbaGamesComponent
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule { }

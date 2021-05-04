import { Injectable } from '@angular/core';

import { SimpleBehaviorService } from 'src/app/services/simple-behavior.service';

import { UPCOMING_GAME_STATS } from '../../../../../models/teams';

@Injectable({
  providedIn: 'root'
})
export class SelectedGameService extends SimpleBehaviorService<UPCOMING_GAME_STATS> {}

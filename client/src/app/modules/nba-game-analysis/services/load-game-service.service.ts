import { Injectable } from '@angular/core';
import { SimpleService } from 'src/app/services/simple.service';

import { UPCOMING_GAME_STATS } from '../../../../../../models/teams';


@Injectable({
  providedIn: 'root'
})
export class LoadGameServiceService extends SimpleService<UPCOMING_GAME_STATS>{}

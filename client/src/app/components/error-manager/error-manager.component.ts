import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { ServerErrorsService } from 'src/app/services/server-errors.service';
import { RequestError } from '../../../../../models/serverErrors';


@Component({
  selector: 'app-error-manager',
  templateUrl: './error-manager.component.html',
  styleUrls: ['./error-manager.component.less']
})
export class ErrorManagerComponent implements OnInit {
  private _errorSub: Subscription;

  constructor(private errorsService: ServerErrorsService) { }

  ngOnInit(): void {
    this._errorSub = this.errorsService.serverErrors
    .subscribe( (requestError:RequestError) => {
      console.log(`Received an Error from the Server ${requestError}`);
    });
  }

}

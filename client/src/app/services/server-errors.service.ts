import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { RequestError } from '../models/request-error.model';

@Injectable({
  providedIn: 'root'
})
export class ServerErrorsService {

  serverErrors = this.socket.fromEvent<RequestError[]>('server_error');

  constructor(private socket: Socket) { }
}

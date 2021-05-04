import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimpleService<T> {
  private subject = new Subject<T>();

  send(update:T) {
    this.subject.next(update);
  }
  clear() {
    this.subject.next();
  }
  getUpdates(): Observable<T> {
    return this.subject.asObservable();
  }
}

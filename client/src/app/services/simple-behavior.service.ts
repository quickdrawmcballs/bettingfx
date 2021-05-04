import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimpleBehaviorService<T> {
  private subject = new BehaviorSubject<T>(null as any);
  data:T = null as any;

  send(update:T) {
    this.data = update;
    this.subject.next(update);
  }
  clear() {
    this.data = null as any;
    this.subject.next(null as any);
  }
  getData(): Observable<T> {
    return this.subject.asObservable();
  }
}

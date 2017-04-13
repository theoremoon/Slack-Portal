import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

@Injectable()
export class FlashService {
    messageObservable = new Subject<string>();
    errorObservable = new Subject<string>();

    flash(message: string): void {
        this.messageObservable.next(message);
    }
    error(errorMessage: string): void {
        this.errorObservable.next(errorMessage);
    }
}
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';



@Injectable()
export class WebSocketService {
    private observable: Observable<MessageEvent>;
    private wsPromise: Promise<WebSocket>;

    connect(url: string): void {
        this.wsPromise = new Promise((resolve, reject) => {
            let ws = new WebSocket(url);
            ws.onopen = () => {resolve(ws)};
            ws.onerror = () => {reject()};
        });
    }

    getObservable(): Observable<MessageEvent> {
        if (this.observable) {
            return this.observable;
        }
        return this.observable = Observable.create((observer: Observer<MessageEvent>) => {
            return Observable.fromPromise(this.wsPromise.then((ws: WebSocket): void => {
                ws.onmessage = observer.next.bind(observer);
                ws.onerror = observer.error.bind(observer);
                ws.onclose = observer.complete.bind(observer);
                ws.close.bind(ws);
            }));
        });
    }

    sendJson(data: Object): Promise<boolean> {
        return this.wsPromise.then(ws => {
            if (ws.readyState !== ws.OPEN) {
                return false;
            }
            ws.send(JSON.stringify(data));
            return true;
        });
    }
}

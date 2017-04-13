import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';

import { WebSocketService } from './websocket.service';
import { Recv, Team, Result } from './types';

@Injectable()
export class UpdateNotifyService {
    private url = 'ws://localhost:8888/';
    private key: string;
    updateNotifier = new Subject<Team>();
    resultNotifier = new Subject<Result>();
    register_token(apiToken: string): Promise<boolean> {
        return this.ws.sendJson({
            command: 'NewToken',
            arguments: [ this.key , apiToken ]
        });
    }
    constructor(private ws: WebSocketService) {
        ws.connect(this.url);
       
        ws.getObservable().subscribe((response: MessageEvent) => {
            console.log("DEBUG: "+ response.data);            
            let data = JSON.parse(response.data) as Recv;
            switch (data.typename) {
                case "Connect":
                case "Resume": {
                    this.key = (data.value as string);
                    localStorage.setItem("key", this.key);
                    break;
                }
                case "Result": {
                    this.resultNotifier.next(data.value as Result);
                    break;
                }
                case "Team": {
                    this.updateNotifier.next(data.value as Team);
                }
            }
        });
        let key = localStorage.getItem("key");
        if (key === null) {
            ws.sendJson({
                command: 'Connect',
                arguments: [],
            });
        } else {
            ws.sendJson({
                command: 'Resume',
                arguments: [ key ],
            })
        }
    }
}
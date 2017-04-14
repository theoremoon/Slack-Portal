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

    // ユーザがログインしていたらtrueを返す
    isUserLogin(): boolean {
        return this.key != null;
    }

    register_token(apiToken: string): Promise<boolean> {
        return this.ws.sendJson({
            command: 'NewToken',
            arguments: [ apiToken ]
        });
    }

    register(username: string, password: string): Promise<boolean> {
        return this.ws.sendJson({
            command: 'Register',
            arguments: [ username, password ]
        });
    }
    login(username: string, password: string): Promise<boolean> {
        return this.ws.sendJson({
            command: 'Login',
            arguments: [ username, password ]
        });
    }
    resume(sessionKey: string): Promise<boolean> {
        return this.ws.sendJson({
            command: 'Resume',
            arguments: [ sessionKey ],
        })
    }

    // 起動時の処理
    constructor(private ws: WebSocketService) {
        ws.connect(this.url);

        // データを受け取ったときの処理
        ws.getObservable().subscribe((response: MessageEvent) => {
            console.log("DEBUG: "+ response.data);            
            let data = JSON.parse(response.data) as Recv;
            switch (data.typename) {
                case "Result": {
                    this.resultNotifier.next(data.value as Result);
                    break;
                }
                case "Register":
                case "Login":
                case "Resume": {
                    this.key = (data.value as string);
                    localStorage.setItem("key", this.key);
                    break;
                }
                case "Team": {
                    this.updateNotifier.next(data.value as Team);
                }
            }
        });

        let key = localStorage.getItem("key");
        if (key) {
            this.resume(key);
        }
    }
}
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs/Rx';

import { WebSocketService } from './websocket.service';
import { Recv, Team, Result, ListenTeam } from './types';

@Injectable()
export class UpdateNotifyService {
    private url = 'ws://' + location.host + ":" + process.env.SERVER_PORT ;
    private key: string;
    updateNotifier = new Subject<Team>();
    resultNotifier = new Subject<Result>();
    teamNameNotifier = new Subject<ListenTeam>(); // 監視しているチームの通知
    deletedTeamNotifier = new Subject<string>(); // 削除されたチームの通知

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
    stopListen(teamName: string): Promise<boolean> {
        return this.ws.sendJson({
            command: 'Stop',
            arguments: [ teamName ],
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
                case "Listen": {
                    this.teamNameNotifier.next(data.value as ListenTeam);
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
                    break;
                }
                case "Stop": {
                    this.deletedTeamNotifier.next(data.value as string);
                    break;
                }
            }
        },
        // WS 接続失敗……
        (error) => {
            console.log(error);
            this.resultNotifier.next({
                result: false,
                message: error,
            });
        });


        let key = localStorage.getItem("key");
        if (key) {
            this.resume(key);
        }
    }
}
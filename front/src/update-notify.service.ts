import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { WebSocketService } from './websocket.service';
import { Team, Post } from './team';

@Injectable()
export class UpdateNotifyService {
    private url = 'ws://localhost:8888/';
    updateNotifier: Observable<Team>;
    register_token(token: string): Promise<boolean> {
        return this.ws.sendJson({
            command: 'new api token',
            arguments: [ token ]
        });
    }
    constructor(private ws: WebSocketService) {
        ws.connect(this.url);
        this.updateNotifier = ws.getObservable().map((response: MessageEvent): Team => {
            let data = JSON.parse(response.data);
            return data as Team;
            // return {
            //     name: data.name,
            //     channel: data.channel,
            //     posts: data.posts
            // }
        });

    }
}
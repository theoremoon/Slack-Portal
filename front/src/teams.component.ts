import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';

import { Team, Result } from './types';
import { UpdateNotifyService } from './update-notify.service';
import { AudioService } from './audio.service';
import { FlashService } from './flash.service';


@Component({
    selector: 'teams',
    template: require('./teams.component.html'),
    styles: [ require('./teams.component.css') ]
})
/**
 * メインのコンポーネント。ログインもここでやっちゃえということになってる
 */
export class TeamsComponent {
    private teams: Observable<Team[]>;  // データが更新されるとここに入る
    private teamArray = new Map<string, Team>(); // データを持っておくだけの場所
    private teamNames = new Subject<string[]>(); // チーム名だけも持っておく
    private teamNameArray = new Set<string>(); 
    private isUserLogin: boolean; // ユーザがログインしているときはFalse
    
    constructor(
        private updateNotifyService: UpdateNotifyService,
        private audioService: AudioService,
        private flashService: FlashService
    ) {}


    ngOnInit(): void {
        // 通知音を読んどく
        this.audioService.load('assets/gomen.mp3');

        // データを受け取ったときの処理
        this.teams = this.updateNotifyService.updateNotifier.map((team: Team): Team[] => {
            this.audioService.play();

            // チーム名でデータを更新して更新時刻で降順ソート
            this.teamArray.set(team.name, team);
            let arr = Array.from(this.teamArray.values()).sort((a, b) => {
                if (a.last_modified > b.last_modified) {
                    return -1;
                }
                else if (a.last_modified < b.last_modified) {
                    return 1;
                }
                return 0;
            });

            this.addListeningTeam(team.name);

            return arr;
        });

        // チーム名が追加されたときの処理
        this.updateNotifyService.teamNameNotifier.subscribe((teamName: string) => {
            this.addListeningTeam(teamName);
        })

        // 通知を受け取ったときの処理
        this.updateNotifyService.resultNotifier.subscribe((result: Result): void => {
            if (result.result && result.message) {
                this.flashService.flash(result.message);
            }
            else if (! result.result && result.message) {
                this.flashService.error(result.message);
            }
        })

        this.isUserLogin = this.updateNotifyService.isUserLogin();
    }
        
    // チーム名がまだ追加されてなかったら入れておく
    addListeningTeam(teamName: string) {
        if (! this.teamNameArray.has(teamName)) {
            this.teamNameArray.add(teamName);
            this.teamNames.next(Array.from(this.teamNameArray.values()));
        }
    }

    // チームを追加
    add_token(token: string) {
        this.updateNotifyService.register_token(token);
    }

    login(username: string, password:string) {
        this.updateNotifyService.login(username, password);
    }
    register(username: string, password: string) {
        this.updateNotifyService.register(username, password);
    }
    deleteTeam(teamName: string) {
        
    }
}
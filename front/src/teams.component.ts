import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { Team, Result } from './types';
import { UpdateNotifyService } from './update-notify.service';
import { AudioService } from './audio.service';
import { FlashService } from './flash.service';

// import './teams.component.html';
// import './teams.component.css';

@Component({
    selector: 'teams',
    template: require('./teams.component.html'),
    styles: [ require('./teams.component.css') ]
})
export class TeamsComponent {
    private teams: Observable<Team[]>;
    private teamArray = new Map<string, Team>();
    
    constructor(
        private updateNotifyService: UpdateNotifyService,
        private audioService: AudioService,
        private flashService: FlashService
    ) {}
    ngOnInit(): void {
        this.audioService.load('assets/gomen.mp3');
        this.teams = this.updateNotifyService.updateNotifier.map((team: Team): Team[] => {
            this.audioService.play();
            team.last_modified = Date.now();
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
            return arr;
        });
        this.updateNotifyService.resultNotifier.subscribe((result: Result): void => {
            if (result.result && result.message) {
                this.flashService.flash(result.message);
            }
            else if (! result.result && result.message) {
                this.flashService.error(result.message);
            }
        })
    }
    add_token(token: string) {
        this.updateNotifyService.register_token(token);
    }
}
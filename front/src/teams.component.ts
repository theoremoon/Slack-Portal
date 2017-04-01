import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { Team } from './team';
import { UpdateNotifyService } from './update-notify.service';
import { AudioService } from './audio.service';

@Component({
    selector: 'teams',
    templateUrl: './teams.component.html',
    styleUrls: [ './teams.component.css' ]
})
export class TeamsComponent {
    private teams: Observable<Team[]>;
    private teamArray = new Map<string, Team>();
    
    constructor(
        private updateNotifyService: UpdateNotifyService,
        private audioService: AudioService) {}
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
    }
    add_token(token: string) {
        this.updateNotifyService.register_token(token);
    }
}
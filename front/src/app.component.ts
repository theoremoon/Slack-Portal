import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Rx';

import { FlashService } from './flash.service';

import './app.component.html';

@Component({
    selector: 'app',
    template: require('./app.component.html'),
    styles: [ require('./app.component.css') ],
})
export class AppComponent implements OnInit {
    messageObservable = new Observable<string>();
    errorObservable = new Observable<string>();

    constructor(
        private flashService: FlashService
    ) {}
    ngOnInit() {
        this.messageObservable = this.flashService.messageObservable.map(x => x);
        this.errorObservable = this.flashService.errorObservable.map(x => x);
    }
}
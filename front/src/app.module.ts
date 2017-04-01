import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { WebSocketService } from './websocket.service';
import { UpdateNotifyService } from './update-notify.service';
import { TeamsComponent } from './teams.component';
import { AudioService } from './audio.service';

@NgModule({
    imports: [ BrowserModule ],
    declarations: [ 
        AppComponent,
        TeamsComponent
    ],
    providers: [
        WebSocketService,
        AudioService,
        UpdateNotifyService
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
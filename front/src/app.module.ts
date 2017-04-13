import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { RouterModule, Routes } from "@angular/router";
import { WebSocketService } from './websocket.service';
import { UpdateNotifyService } from './update-notify.service';
import { TeamsComponent } from './teams.component';
import { AudioService } from './audio.service';
import { FlashService } from './flash.service';

const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: '', component: TeamsComponent }
];

@NgModule({
    imports: [ 
        BrowserModule,
        RouterModule.forRoot(appRoutes)
    ],
    declarations: [ 
        AppComponent,
        TeamsComponent
    ],
    providers: [
        WebSocketService,
        AudioService,
        UpdateNotifyService,
        FlashService,
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {}
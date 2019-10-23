import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
// import { TextToSpeech } from '@ionic-native/text-to-speech';
import { ErrorHandler } from '@angular/core';
	
import {MyHammerConfig} from './hammer.config'
import { IonicStorageModule } from '@ionic/storage';
import { File } from '@ionic-native/file/ngx';






@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,IonicStorageModule.forRoot()],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig},
    Camera,
    File

  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

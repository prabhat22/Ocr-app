import { Component } from '@angular/core';
import { NavController, ActionSheetController, LoadingController, ToastController } from '@ionic/angular';
import * as Tessaract from 'tesseract.js';

// import { TextToSpeech } from '@ionic-native/text-to-speech';
import { Storage } from '@ionic/storage';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { TesseractWorker } from 'tesseract.js';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  selectedImage:string;
  imageText:string;
  ncount:number;
  ocrResult;
  constructor(public toss:ToastController,
    private ns:Storage,
    private loading:LoadingController,
    public navCtrl: NavController,
    private actionsh:ActionSheetController,
    private camera: Camera,
 
) 
    {

    this.ns.get('notecount').then(result=>{
      this.ncount = result.count;
    })
    .catch(_=>{
      this.ns.set('notecount',{
        count:0,
      })
    })
}
refresh(){
  this.selectedImage = "";
  this.imageText = "";
}
  async chooseImage(){

  let actionSheet = await this.actionsh.create({
    buttons: [
      {
        text: 'Library',
        handler: () => {
          this.getPicture(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Capture Picture',
        handler: () => {
          this.getPicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel',
      }
    ]
  });

  await actionSheet.present();
}
getPicture(source:PictureSourceType){
  this.camera.getPicture({
    quality:100,
    destinationType:this.camera.DestinationType.DATA_URL,
    allowEdit:true,
    correctOrientation:true,
    sourceType:source,
    saveToPhotoAlbum:false,
  }).then(imageData=>{
    this.selectedImage = `data:image/jpeg;base64,${imageData}`;
    
  })
  .catch(reason=>{
    alert(reason);
  })
}
// speak(){
//   this.tts.speak(this.imageText)
//   .then(response=>{
//   console.log("SUCCESS");
//   })
//   .catch(error=>{
//     alert(error)
//   })
// }
 
async recog()
{
  const worker = new TesseractWorker();
  worker
    .recognize(this.selectedImage)
    .progress((p) => {
     // console.log('progress', p);
    })
    .then(({ text }) => {
      this.ocrResult = text;
      console.log(this.ocrResult)
      this.imageText=this.ocrResult;
      worker.terminate();
    });
}

//   async recog(){
//   let lc = await this.loading.create({
//     spinner: null,
//       duration: 5000,
//       message: 'Please wait...',
//       translucent: true,
//       cssClass: 'custom-class custom-loading'
//   })
//   await lc.present();
//   Tessaract.recognize(this.selectedImage)
//   .progress(result=>{
//     if(result.status=='recognizing text'){
//      // this.progress.set(result.progress);
//     }
//   })
//   .catch(e=>{
//     alert(e)
//   })
//   .then(result=>{
//     this.imageText = result.text;
//   })
//   .finally(ress=>{
//    // this.progress.complete();
//     lc.dismiss();
//   })
// }


    }

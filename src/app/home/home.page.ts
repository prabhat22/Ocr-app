import { Component } from '@angular/core';
import { NavController, ActionSheetController, LoadingController, ToastController } from '@ionic/angular';
import * as Tessaract from 'tesseract.js';

// import { TextToSpeech } from '@ionic-native/text-to-speech';
import { Storage } from '@ionic/storage';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { TesseractWorker } from 'tesseract.js';
import { File } from '@ionic-native/file/ngx';
import { of } from 'rxjs/internal/observable/of';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';



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
  blob:Blob;

  private loading;
  promise: Promise<string>;
  constructor(public toss:ToastController,
    private ns:Storage,
    private loadingController:LoadingController,
    public navCtrl: NavController,
    private actionsh:ActionSheetController,
    private camera: Camera,
    private file: File,
    public toastCtrl: ToastController
 
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
    this.selectedImage = "";
    this.imageText = "";
  const actionSheet = await this.actionsh.create({
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
        handler: () => {
          console.log('Cancel clicked');
        }
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

  this.loadingController.create({
    message: 'Recognizing Text'
  }).then((overlay)=>
  {
    this.loading=overlay;
    this.loading.present();

  });
  const worker = new TesseractWorker();
  worker
    .recognize(this.selectedImage)
    .progress((p) => {
     // console.log('progress', p);
    })
    .then(({ text }) => {
      this.ocrResult = text;
     // console.log(this.ocrResult)
      this.loading.dismiss();
      this.imageText=this.ocrResult;
    
      worker.terminate();
    });
}
// fakeValidateUserData() {
//   return of({
//     userDate1: 1,
//     userData2: 2
//   });
// }
// private setting = {
//   element: {
//     dynamicDownload: null as HTMLElement
//   }
// }
createFile()
{
  console.log("file create");
  this.pdfMake();
  // console.log(this.file.dataDirectory)
  // this.file.createFile(this.file.dataDirectory, 'Demo', true);
  // this.imageText="I love delhi";
  // this.blob = new Blob([this.imageText], { type: 'text/plain' });
  // this.file.writeFile(this.file.dataDirectory, 'Demo', this.blob, {replace: true, append: false}).then();
  // this.readFile();
  // this.fakeValidateUserData().subscribe((res) => {
  //   this.dyanmicDownloadByHtmlTag({
  //     fileName: 'My Report',
  //     text: JSON.stringify(res)
  //   });
  // });
  
}
// private dyanmicDownloadByHtmlTag(arg: {
//   fileName: string,
//   text: string
// }) {
//   if (!this.setting.element.dynamicDownload) {
//     this.setting.element.dynamicDownload = document.createElement('a');
//   }
//   const element = this.setting.element.dynamicDownload;
//   const fileType = arg.fileName.indexOf('.json') > -1 ? 'text/json' : 'text/plain';
//   element.setAttribute('href', `data:${fileType};charset=utf-8,${encodeURIComponent(arg.text)}`);
//   element.setAttribute('download', arg.fileName);

//   var event = new MouseEvent("click");
//   element.dispatchEvent(event);
// }

pdfMake()
{
  let self = this;
  pdfmake.vfs = pdfFonts.pdfMake.vfs;
  var docDefinition = {
    content: [
    {
    columns: [
   
    [
    { text: 'Text Result', style: 'header' },
    { text: this.imageText, style: 'sub_header' },
    ]
    ]
    }
    ],
    styles: {
    header: {
    bold: true,
    fontSize: 20,
    alignment: 'center'
    },
    sub_header: {
    fontSize: 18,
    alignment: 'center'
    },
    },
    pageSize: 'A4',
    pageOrientation: 'portrait'
    };
    console.log(docDefinition);
    pdfmake.createPdf(docDefinition).getBuffer(function (buffer) {
      let utf8 = new Uint8Array(buffer);
      let binaryArray = utf8.buffer;
      self.saveToDevice(binaryArray,"Ocr.pdf")
      });
    
}
async saveToDevice(data:any,savefile:any){
  let self = this;
  console.log("file save start");
  self.file.writeFile(self.file.externalDataDirectory, savefile, data, {replace:true});

const toast = await self.toastCtrl.create({
message: 'File saved to your device',
duration: 3000,
position: 'bottom',
color:'success'
});
toast.present();

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

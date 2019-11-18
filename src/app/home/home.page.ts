import {Component} from '@angular/core';
import {NavController, ActionSheetController, LoadingController, ToastController} from '@ionic/angular';
import * as Tessaract from 'tesseract.js';

// import { TextToSpeech } from '@ionic-native/text-to-speech';
import { Storage} from '@ionic/storage';
import {Camera, CameraOptions, PictureSourceType} from '@ionic-native/camera/ngx';
import {TesseractWorker} from 'tesseract.js';
import {File} from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {of} from 'rxjs/internal/observable/of';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// import * as fs from "fs";
import {HTTP} from '@ionic-native/http/ngx';
import {HttpClient} from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(public toss: ToastController,
              private ns: Storage,
              private loadingController: LoadingController,
              public navCtrl: NavController,
              private actionsh: ActionSheetController,
              private camera: Camera,
              private file: File,
              public toastCtrl: ToastController,
              private http: HttpClient,
              private socialSharing: SocialSharing
  ) {

    this.ns.get('notecount').then(result => {
        this.ncount = result.count;
      })
      .catch(_ => {
        this.ns.set('notecount', {
          count: 0,
        });
      });
    const obj = {
      text: 'Helo world'
    };

  }

  selectedImage: string;
  imageText: string;
  ncount: number;
  ocrResult;
  blob: Blob;
  text: string = 'hello';

  private loading;
  promise: Promise < string > ;
  films: any;

  private setting = {
    element: {
      dynamicDownload: null as HTMLElement
    }
  };
  refresh() {
    this.selectedImage = '';
    this.imageText = '';
  }
  async chooseImage() {
    this.selectedImage = '';
    this.imageText = '';
    const actionSheet = await this.actionsh.create({
      buttons: [{
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
  getPicture(source: PictureSourceType) {
    this.camera.getPicture({
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        allowEdit: true,
        correctOrientation: true,
        sourceType: source,
        saveToPhotoAlbum: false,
      }).then(imageData => {
        this.selectedImage = `data:image/jpeg;base64,${imageData}`;

      })
      .catch(reason => {
        alert(reason);
      });
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

  async recog() {

    this.loadingController.create({
      message: 'Recognizing Text'
    }).then((overlay) => {
      this.loading = overlay;
      this.loading.present();

    });
    const worker = new TesseractWorker();
    worker
      .recognize(this.selectedImage)
      .progress((p) => {
        // console.log('progress', p);
      })
      .then(({
        text
      }) => {
        this.ocrResult = text;
        // console.log(this.ocrResult)
        this.loading.dismiss();
        this.imageText = this.ocrResult;

        worker.terminate();
      });
  }

  async toastCreater() {
    const self = this;
    const toast = await self.toastCtrl.create({
      message: 'File saved to your device',
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }

  // async resolveLocalFile() {
  //   return this.file.copyFile(`${this.file.applicationDirectory}www/assets/imgs`, 'acedemy.jpg', this.file.cacheDirectory, `${new Date().getTime()}.jpg`)
  // }

  //shareViaWhatsApp
  shareViaWhatsApp() {
    this.socialSharing.shareViaWhatsApp(this.text).then(() => {
      // Success!
      console.log('shared');
    }).catch(() => {
      // Error!
      console.log('err');
    });
  }

  // DOC Creation
  createDocFile() {
    this.file.createFile(this.file.dataDirectory, 'OCRDoc.txt', true);
    console.log('file created');
  }
  writeDocFile() {
    console.log('this.imageText', this.imageText);
    this.file.writeFile(this.file.externalDataDirectory, 'OCRDoc.txt', this.imageText, {
      replace: true,
      append: false
    });

  }
  saveDoc() {
    console.log('doc file saved');
    this.createDocFile();
    this.writeDocFile();
    this.toastCreater();

  }
  // PDF Creation
  createFile() {
    console.log('file create');
    this.pdfMake();
  }

  pdfMake() {
    const self = this;
    pdfmake.vfs = pdfFonts.pdfMake.vfs;
    const docDefinition = {
      content: [{
        columns: [

          [{
              text: 'Text Result',
              style: 'header'
            },
            {
              text: this.imageText,
              style: 'sub_header'
            },
          ]
        ]
      }],
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
    pdfmake.createPdf(docDefinition).getBuffer(function(buffer) {
      const utf8 = new Uint8Array(buffer);
      const binaryArray = utf8.buffer;
      self.saveToDevice(binaryArray, 'Ocr.pdf');
    });

  }
  async saveToDevice(data: any, savefile: any) {
    const self = this;
    console.log('file save start');
    self.file.writeFile(self.file.externalDataDirectory, savefile, data, {
      replace: true
    });

    this.toastCreater();

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

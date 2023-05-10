import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem} from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { S3Service } from './s3.service';
import { AuthService } from './auth.service';
import { ObjectList } from 'aws-sdk/clients/s3';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public s3Photos: ObjectList | undefined

  constructor( private platform: Platform, private s3Service: S3Service, private auth: AuthService) { } 

  public async loadSaved() {

    // Retrieve names of photos in s3 bucket
    this.auth.getToken()
      .then(token => {
        this.s3Service.getAllImageReferences(token)
          .then(
            objectList=> {
              if (objectList === undefined){
                this.s3Photos = []
              }
              else {
                this.s3Photos = objectList
            }
            console.log("Imagelist retrieved");
            },
            err => {
              console.log(`Error in imagelist retrieve: ${err}`)
            }
          );
      })
    .catch(err => {
      console.log(`Error in imagelist retrieve: ${err}`)
    });
  }
  
  public async addNewToGallery() {

    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
  
    // Save the picture and add it to photo collection
    const savedImageFile = await this.savePicture(capturedPhoto);
  }

  private async savePicture(photo: Photo) {

    // Convert photo to base64 format
    const base64Data = await this.readAsBase64(photo);
    const fileName = new Date().getTime() + '.png';
   
    await this.uploadPhotoToS3(base64Data, fileName);
  }

  private async uploadPhotoToS3(data: string, fileName: string) {
    this.auth.getToken()
      .then(token => {
        this.s3Service.upload(data, fileName, token).then(
          res => {
            console.log(res)
            this.s3Photos!.unshift({ Key: fileName })
            console.log(`${fileName} uploaded successfull`);
          },
          err => {
            console.log(`Error in image upload: ${err}`)
          }
        );
      })
      .catch(err => console.log(err));
  }

  private async readAsBase64(photo: Photo) {

    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {

      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path!
      });

      return file.data;
    }
    else {

      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }
    
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async deletePicture(fileName: string, position: number) {
    this.auth.getToken()
      .then(token => {
        this.s3Service.delete(fileName, token).then(
          res => {

            // Remove this photo from the Photos reference data array
            this.s3Photos!.splice(position, 1);
            console.log(`${fileName} deleted successfully`);
          },
          err => {
            console.log(`Error in image deletion: ${err}`)
          }
        );
      })
      .catch(err => console.log(err));
  }
}

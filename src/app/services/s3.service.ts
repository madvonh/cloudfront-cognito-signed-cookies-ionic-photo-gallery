import { Injectable } from '@angular/core';
import * as aws from "aws-sdk";
import { environment } from '../../environments/environment';
import { ListObjectsOutput, ObjectList } from 'aws-sdk/clients/s3';

@Injectable({
  providedIn: 'root'
})
export class S3Service {
  private providerName:string =`cognito-idp.${environment.REGION}.amazonaws.com/${environment.COGNITO.USER_POOL_ID}`

  public getAllImageReferences(accessToken: string): Promise<ObjectList | undefined> {
    
    return new Promise((resolve, reject) => {
      aws.config.region = environment.REGION;
      aws.config.credentials = new aws.CognitoIdentityCredentials({
        IdentityPoolId: environment.COGNITO.IDENTITY_POOL_ID,
        Logins: {
          [`${this.providerName}`]: accessToken
        }
      });
      var data = {
        Bucket: environment.S3.BUCKET_NAME,
      };

      var s3 = new aws.S3({
        apiVersion: "2006-03-01",
        params: { Bucket: environment.S3.BUCKET_NAME }
      });

      return s3.listObjects(data, (err, res: ListObjectsOutput) => {
        if (err) {
          reject(err);
        } else {
          if (res.Contents === undefined){
            resolve(res.Contents);
            return
          }

          // remove folders in s3 bucket from result 
          const filteredContents = res.Contents.filter(item => !item.Key?.endsWith('/'));

          // sort in descending order
          const sortedContents = filteredContents.sort((a, b) => {
            return b.LastModified!.getTime() - a.LastModified!.getTime();
          });
          resolve(sortedContents);
        }
      });
    })
  }

  public upload(image: string, imageName: string, accessToken: string) {
    return new Promise((resolve, reject) => {
      aws.config.region = environment.REGION;
      aws.config.credentials = new aws.CognitoIdentityCredentials({
        IdentityPoolId: environment.COGNITO.IDENTITY_POOL_ID,
        Logins: {
          [this.providerName]: accessToken
        }
      });

      var s3 = new aws.S3({
        apiVersion: "2006-03-01",
        params: { Bucket: environment.S3.BUCKET_NAME }
      });
      
      // we need to have a buffer to for uploading to s3
      fetch(image)
        .then(response => response.blob())
        .then(blob => {
          // Use file stream
          const fileStream = new FileReader();
          fileStream.readAsArrayBuffer(blob);
          fileStream.onloadend = () => {
            const fileContent = fileStream.result as ArrayBuffer;
            var data = {
              Bucket: environment.S3.BUCKET_NAME,
              Key: imageName,
              Body: fileContent,
              ACL: 'private',
              ContentEncoding: 'base64',
              ContentType: 'image/png'
            };

            s3.putObject(data, (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            });
        };
      });
    });
  }

  public delete(imageName: string, accessToken: string) {
    return new Promise((resolve, reject) => {
      aws.config.region = environment.REGION;
      aws.config.credentials = new aws.CognitoIdentityCredentials({
        IdentityPoolId: environment.COGNITO.IDENTITY_POOL_ID,
        Logins: {
          [this.providerName]: accessToken
        }
      });

      var s3 = new aws.S3({
        apiVersion: "2006-03-01",
        params: { Bucket: environment.S3.BUCKET_NAME }
      });
      
      s3.deleteObject({ Bucket: environment.S3.BUCKET_NAME, Key: imageName }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }
}

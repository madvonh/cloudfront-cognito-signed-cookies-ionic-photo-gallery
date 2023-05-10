const { writeFile } = require('fs');

// read environment variables from .env file
require('dotenv').config();

// we have access to our environment variables
// in the process.env object thanks to dotenv
const environmentFileContent = `
export const environment = {
   // This file is generated by set-env.ts file. Changes in this file will be overwritten. 
   // Change environment variables in .env file.  
   
   production: ${process.env["IS_PROD"]},
   REGION: "${process.env["AWS_REGION"]}",
   COGNITO: {
      USER_POOL_ID: "${process.env["AWS_COGNITO_USER_POOL_ID"]}",
      CLIENT_ID: "${process.env["AWS_COGNITO_USER_POOL_CLIENT_ID"]}",
      IDENTITY_POOL_ID: "${process.env["AWS_COGNITO_IDENTITY_POOL_ID"]}"
   },
   S3: {
      BUCKET_NAME: "${process.env["AWS_S3_BUCKET_NAME"]}"
   },
   CLOUDFRONT: {
      IMAGE_ENDPOINT: "${process.env["AWS_CLOUDFRONT_IMAGE_ENDPOINT"]}",
      IMAGE_AUTH_ENDPOINT: "${process.env["AWS_CLOUDFRONT_IMAGE_ENDPOINT"]}${process.env["AWS_CLOUDFRONT_COOKIE_PATH"]}",
      IMAGE_AUTH_LOGOUT: "${process.env["AWS_CLOUDFRONT_IMAGE_ENDPOINT"]}${process.env["AWS_CLOUDFRONT_REMOVE_COOKIE_PATH"]}"
   }
};
`;

// write the content to the respective file
writeFile('./src/environments/environment.ts', environmentFileContent, function (err: any) {
   if (err) {
      console.log(err);
   }

   console.log(`Wrote variables to ${"src/environments/environment.ts"}`);
});
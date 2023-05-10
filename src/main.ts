import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { Amplify } from '@aws-amplify/core';

if (environment.production) {
  enableProdMode();
}

Amplify.configure({
  aws_project_region: environment.REGION,
  aws_user_pools_id: environment.COGNITO.USER_POOL_ID,
  aws_user_pools_web_client_id: environment.COGNITO.CLIENT_ID,
  aws_cognito_identity_pool_id: environment.COGNITO.IDENTITY_POOL_ID,

  /*aws_user_files_s3_bucket_region: environment.REGION, // (required) - Amazon S3 bucket region
  aws_user_files_s3_bucket:  environment.S3.BUCKET_NAME, // (required) - Amazon S3 bucket URI+
  Storage: {
    AWSS3: {
      bucket: environment.S3.BUCKET_NAME,
      region: environment.REGION
    }
  }*/ 
});

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

defineCustomElements(window);

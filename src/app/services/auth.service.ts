import { HttpClient  } from "@angular/common/http";
import { Injectable } from '@angular/core'
import { Auth } from '@aws-amplify/auth'
import { Hub, ICredentials } from '@aws-amplify/core'
import { Subject, Observable} from 'rxjs'
import { CognitoUser } from 'amazon-cognito-identity-js'
import { environment } from '../../environments/environment';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private _authState: Subject<CognitoUser|any> = new Subject<CognitoUser|any>();
  authState: Observable<CognitoUser|any> = this._authState.asObservable();
  public errorMessage: string | undefined;

  constructor(private httpClient: HttpClient, private router: Router) {   
    const imageAuthEndpoint = `${environment.CLOUDFRONT.IMAGE_AUTH_ENDPOINT}`; 
    const imageLogoutEndpoint = `${environment.CLOUDFRONT.IMAGE_AUTH_LOGOUT}`; 

    const getImageAuthCookie = async () => {
      const token = (await Auth.currentSession())
        .getIdToken()
        .getJwtToken();

      const options = {
        withCredentials: true,
        headers: {
          Authorization: 'Bearer ' + token,
          "Access-Control-Allow-Credentials": 'true'
        }
      };

      const response = this.httpClient.get(imageAuthEndpoint, options)
        .subscribe((data) => {
          console.log('Got cookie');
          return data;
        });
    }

    Hub.listen('auth', async ({ payload: { event, data } }) => {
      console.log(JSON.stringify(event))

      switch (event) {
        case "signIn": 
          getImageAuthCookie()
            .then(() => {
              this.router.navigate(['home'])
              })
            .catch(err => console.log(err));
          break;
        case "signIn_failure":
            console.log("Sign in failure: ", JSON.stringify(data));
            break;
        case "signUp":
          this.router.navigate(['verify-email'])
          break;
        case "signUp_failure":
          console.log("Sign up failure: ", JSON.stringify(data));
          break;
        case "signOut":
        case "oAuthSignOut":
          try{
            this.httpClient.get(imageLogoutEndpoint)
              .subscribe((data) => {
                console.log('Removed cookie');
              });
            console.log('Signed out')
          } catch (err) {
            console.log("Sign out failed: ", JSON.stringify(err));
          }
          this.router.navigate(['login'])
          break;
        case "confirmSignUp":
          this.router.navigate(['login'])
          break;
        case "tokenRefresh":  
          getImageAuthCookie().then(() => {
            console.log("token refreshed")
            })
          .catch(err => console.log(err));
          break;
        case "tokenRefresh_failure":
          console.log("Token refresh failed: ", JSON.stringify(data));
          break;
        default:
          break;
      }

      this._authState.next(event);
    });
  }
 
  getToken(): Promise<string> {
      return Auth
        .currentSession()
        .then(session => {
          return session
            .getIdToken()
            .getJwtToken()
        })
  }

  currentUser(): Promise<CognitoUser>  {
    return Auth.currentAuthenticatedUser()
  }

  signOut(): Promise<any> {
    return Auth.signOut({ global: true });
  }

  signIn(email: string, password: string) {
    this.errorMessage = undefined
    Auth.signIn(email, password)
      .then(data => {
        // The data here is the user.
      })
      .catch(err => {
        console.log(err)
        this.errorMessage = err
      });
  }

  signUp(email: string,  password: string) {
    this.errorMessage = undefined
    Auth.signUp({
          username: email,
            password,
            attributes: {
                email
            }
        })
        .then(data => {
          console.log(data)
        })
        .catch(err => {
          console.log(err)
          this.errorMessage = err
        });
  }

  confirmSignUp(userName: string, code: string) {
    this.errorMessage = undefined
    Auth.confirmSignUp(userName, code)
      .then(data => {
        console.log(data)
      })
      .catch(err => {
        console.log(err)
        this.errorMessage = err
      });
  }

  forgotPassword(userName: string) {
    return Auth.forgotPassword(userName)
  }


  isAuthenticated() {
    return this.currentUser()
    .then(user => {
      return true;
    })
    .catch((error) => {
      console.log(error)
      return false;
    })
  }
}
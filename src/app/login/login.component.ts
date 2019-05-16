import { Component, ViewChild } from '@angular/core';
import { JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';
import * as OktaAuth from '@okta/okta-auth-js';
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";

@Component({
  selector: 'Login',
  moduleId: module.id,
  templateUrl: 'login.html'
})
export class LoginComponent {
  @ViewChild('email') email: any;
  private username: string;
  private password: string;
  private error: string;

  constructor(private oauthService: OAuthService) {
    oauthService.redirectUri = window.location.origin;
    oauthService.clientId = '{clientId}';
    oauthService.scope = 'openid profile email';
    oauthService.issuer = 'https://dev-322018.oktapreview.com/oauth2/default';
    oauthService.tokenValidationHandler = new JwksValidationHandler();

    // Load Discovery Document and then try to login the user
    this.oauthService.loadDiscoveryDocument().then(() => {
      this.oauthService.tryLogin();
    });
  }

  login(): void {
    this.oauthService.createAndSaveNonce().then(nonce => {
      const authClient = new OktaAuth({
        clientId: this.oauthService.clientId,
        redirectUri: this.oauthService.redirectUri,
        url: 'https://dev-322018.oktapreview.com',
        issuer: 'default'
      });
      return authClient.signIn({
        username: this.username,
        password: this.password
      }).then((response) => {
        if (response.status === 'SUCCESS') {
          return authClient.token.getWithoutPrompt({
            nonce: nonce,
            responseType: ['id_token', 'token'],
            sessionToken: response.sessionToken,
            scopes: this.oauthService.scope.split(' ')
          })
            .then((tokens) => {
              const idToken = tokens[0].idToken;
              const accessToken = tokens[1].accessToken;
              const keyValuePair = `#id_token=${encodeURIComponent(idToken)}&access_token=${encodeURIComponent(accessToken)}`;
              this.oauthService.tryLogin({
                customHashFragment: keyValuePair,
                disableOAuth2StateCheck: true
              });
            // this.navCtrl.push(TabsPage);
            });
        } else {
          throw new Error('We cannot handle the ' + response.status + ' status');
        }
      }).fail((error) => {
        console.error(error);
        this.error = error.message;
      });
    });
  }
}

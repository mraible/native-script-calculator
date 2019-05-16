import { Component, OnInit, ViewChild } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { DrawerTransitionBase, RadSideDrawer, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";
import { filter } from "rxjs/operators";
import * as app from "tns-core-modules/application";
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent implements OnInit {
    private _activatedUrl: string;
    private _sideDrawerTransition: DrawerTransitionBase;

    constructor(private router: Router, private routerExtensions: RouterExtensions, private oauthService: OAuthService) {
    }

    ngOnInit(): void {
      if (this.oauthService.hasValidIdToken()) {
        this._activatedUrl = '/home';
      } else {
        this._activatedUrl = '/login';
      }

      this._sideDrawerTransition = new SlideInOnTopTransition();

      this.router.events
        .pipe(filter((event: any) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => this._activatedUrl = event.urlAfterRedirects);
    }

    get sideDrawerTransition(): DrawerTransitionBase {
        return this._sideDrawerTransition;
    }

    isComponentSelected(url: string): boolean {
        return this._activatedUrl === url;
    }

    onNavItemTap(navItemRoute: string): void {
        this.routerExtensions.navigate([navItemRoute], {
            transition: {
                name: "fade"
            }
        });

        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.closeDrawer();
    }
}

// import { AuthFlow, AuthStateEmitter } from './flow';

// const authFlow = new AuthFlow();
//
// authFlow.authStateEmitter.on(
//     AuthStateEmitter.ON_TOKEN_RESPONSE, () => {
//     }
// );
//
// async function signIn() {
//   if (!authFlow.loggedIn()) {
//     await authFlow.fetchServiceConfiguration();
//     await authFlow.makeAuthorizationRequest();
//   }
// }

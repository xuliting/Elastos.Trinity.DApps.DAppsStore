import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';

import { Dapp } from 'src/app/dapps.model';
import { DappsService } from 'src/app/dapps.service';

declare let appManager: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  applications: Dapp[] = [];
  appsLoaded: boolean = false;

  constructor(
    private dappsService: DappsService,
    public toastController: ToastController
  ) {}

  ngOnInit() {
    this.appsLoaded = false;
    this.dappsService.fetchDapps().subscribe((apps: Dapp[]) => {
      this.appsLoaded = true;
      this.applications = apps;
    });
  }

  ionViewWillEnter() {
    this.applications = this.dappsService.dapps;
  }

  getAppIcon(app) {
    return this.dappsService.getAppIcon(app);
  }

  // Install app
  async installApp(dapp) {
    dapp.installing = true;

    // Download the file
    const epkPath = await this.downloadAppEPK(dapp);
    console.log("EPK file downloaded and saved to " + epkPath);

    // Ask the app installer to install the DApp
    appManager.sendIntent(
      'appinstall',
      { url: epkPath, dappStoreServerAppId: dapp._id },
      () => {
        console.log('App installed');
        dapp.installing = false;
        dapp.installed = true;
        this.installSuccess(dapp);
      }, (err) => {
        console.log('App install failed', err)
        dapp.installing = false;
        this.installFailed(dapp);
      }
    );
  }

  async downloadAppEPK(dapp) {
    return await this.dappsService.downloadDapp(dapp);
  }

  async installSuccess(dapp) {
    const toast = await this.toastController.create({
      message: 'Installed ' + dapp.appName,
      color: "primary",
      duration: 2000
    });
    toast.present();
  }

  async installFailed(dapp) {
    const toast = await this.toastController.create({
      message: 'Failed to install ' + dapp.appName,
      color: "primary",
      duration: 2000
    });
    toast.present();
  }
}

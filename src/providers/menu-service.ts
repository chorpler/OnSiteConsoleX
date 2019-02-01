// import { Nav,                                        } from 'ionic-angular'              ;
// import { Observable                                  } from 'rxjs'                       ;
// import { Subject                                     } from 'rxjs'                       ;
import { Subscription                                } from 'rxjs'                       ;
import { Injectable                                  } from '@angular/core'              ;
import { ModalController,                            } from 'ionic-angular'              ;
import { MenuController,                             } from 'ionic-angular'              ;
import { Log, Moment, isMoment                       } from 'domain/onsitexdomain'       ;
import { Notice,                                     } from 'domain/onsitexdomain'       ;
import { menuItems                                   } from 'config/config.menu'         ;
import { ConsoleMenuItemStyle, ConsoleMenuIconStyle, } from 'domain/onsitexdomain'       ;
import { ConsoleMenuIcon, ConsoleSubMenuItem,        } from 'domain/onsitexdomain'       ;
import { ConsoleMenuItem, ConsoleMenu                } from 'domain/onsitexdomain'       ;
import { Report                                      } from 'domain/onsitexdomain'       ;
import { AlertService                                } from 'providers/alert-service'    ;
import { NotifyService                               } from 'providers/notify-service'   ;
import { OSData                                      } from 'providers/data-service'     ;
import { DispatchService, AppEvents,                 } from 'providers/dispatch-service' ;

@Injectable()
export class MenuService {
  public menu:ConsoleMenu = menuItems;
  public menuArray:ConsoleMenuItem[] = [];
  public appSubcription:Subscription;

  constructor(
    // public nav       : Nav             ,
    // public menuCtrl  : MenuController  ,
    public modalCtrl : ModalController ,
    // public data      : OSData          ,
    public dispatch  : DispatchService ,
    // public alert     : AlertService    ,
    // public notify    : NotifyService   ,
  ) {
    Log.l(`Hello MenuService provider`);
    this.menuArray = this.generateMenuArray();
    this.appSubcription = this.dispatch.appEventFired().subscribe((data:{channel:AppEvents, event?:any}) => {
      if(data && data['channel'] === 'menuclosed') {
        this.menuClosed();
      }
    });
  }

  public generateMenuArray():ConsoleMenuItem[] {
    let keys:string[] = Object.keys(this.menu);
    let menuArray:ConsoleMenuItem[] = keys.map(key => this.menu[key]);
    return menuArray;
  }

  public async menuItemClick(page:any, parent?:any, event?:MouseEvent) {
    // let spinnerID, openModal:boolean = false, res:any;
    let openModal:boolean = false;
    try {
      let res:any;
      if(event && event.shiftKey) {
        openModal = true;
      }
      page.active = false;
      if(page.title === 'Reauthenticate') {
        // try {
        //   // res = await this.menuCtrl.close();
        //   this.dispatch.triggerAppEvent('authenticate')
        //   return res;
        // } catch(err) {
        //   Log.l("menuItemClick: error triggering reauthentication event.");
        //   this.alert.hideSpinner(spinnerID);
        //   this.notify.addError("ERROR", `Error during authentication: ${err.message}`, 10000);
        // }
        this.dispatch.triggerAppEvent('authenticate');
      } else if(page.title === 'Advanced Options') {
        // res = await this.menuCtrl.close();
        this.dispatch.showGlobalOptions('advanced');
      } else if(page.title === 'Options') {
        Log.l("menuItemClick(): User wants to show options...");
        // res = await this.menuCtrl.close();
        this.dispatch.showGlobalOptions('global');
      } else if(page.title === 'Update Data') {
        this.dispatch.triggerAppEvent('updatedata');
        // try {
        //   Log.l("menuItemClick(): User wants to update data...");
        //   // res = await this.menuCtrl.close();
        //   // res = await this.updateData();
        //   // this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
        //   return res;
        // } catch(err) {
        //   Log.l("menuItemClick(): Error updating data!");
        //   Log.e(err);
        //   this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
        //   return false;
        // }
      } else if(page.title === 'Restart App') {
        Log.l("menuItemClick(): User clicked Restart.");
        window.location.reload();
        return true;
      } else if(page.title === 'Logout') {
        Log.l("menuItemClick(): User clicked logout.");
        this.dispatch.triggerAppEvent('logout');
      } else if(page.title === 'Save Preferences') {
        Log.l("menuItemClick(): I'm actually just going to save Preferences!");
        this.dispatch.triggerAppEvent('saveprefs');
        // this.notify.addInfo("SUCCESS", "Preferences saved.", 3000);
        // this.menuCtrl.close();
      } else if(page.title === 'Test Notifications') {
        Log.l("menuItemClick(): I'm actually just going to send a test notification!");
        // this.testNotifications();
        this.dispatch.triggerAppEvent('testnotifications');
        // this.menuCtrl.close();
      } else {
        if(page.submenu && page.submenu.length && !page.showSubMenu) {
          this.hideAllSubmenus();
          this.showSubmenuOf(page);
          // page.subStyle['max-height'] = '1000px';
        } else if(page.submenu && page.submenu.length && page.showSubMenu) {
          this.hideSubmenuOf(page);
          // page.showSubMenu = false;
          // page.style['max-height'] = '0px';
          // page.subStyle['max-height'] = '0px';
        } else {
          this.hideAllSubmenus();
          // for(let eachPage of this.pageList) {
          //   eachPage.showSubMenu = false;
          //   page.style['max-height'] = '0px';
          //   // page.subStyle['max-height'] = '0px';
          // }
          // res = await this.menuCtrl.close();
            // Reset the content nav to have just this page
            // we wouldn't want the back button to show in this scenario
          // if(openModal) {
          this.dispatch.triggerAppEvent('openpage', {page: page, modal: openModal});
          // } else {
            // this.dispatch.triggerAppEvent('openpage', {page: page, modal: false});
          // }
          // if(openModal) {
          //   let modal = this.modalCtrl.create(page.page, {}, {cssClass: 'modal-page'});
          //   modal.onDidDismiss((data) => {
          //     Log.l(`menuItemClick(): Modal page '${page.page}' dismissed. Returned data is\n`, data);
          //   });
          //   Log.l(`menuItemClick(): Opening page '${page.page}' as modal...`);
          //   modal.present();
          // } else {

          //   this.nav.setRoot(page.page);
          // }
          // setTimeout(() => {
          //   this.nav.setRoot(page.page);
          // }, 500)
        }
      }
      return true;
    } catch(err) {
      Log.l(`menuItemClick(): Error processing click on item:\n`, page);
      Log.e(err);
      // throw new Error(err);
    }
  }

  // public isDeveloperMenuVisible():boolean {
  //   if(this.data && this.data.status && this.data.status.role) {
  //     let userRole = this.data.status.role;
  //     if(userRole === 'dev') {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // }

  public showSubmenuOf(item:ConsoleMenuItem) {
    if(item && item['hasSubmenu'] && item['showSubMenu'] === false) {
      item.showSubMenu = true;
      item.style['max-height'] = '100px';
    }
  }

  public hideSubmenuOf(item:ConsoleMenuItem) {
    if(item && item['hasSubmenu'] && item['showSubMenu'] === true) {
      item.showSubMenu = false;
      // item.style['max-height'] = '0px';
    }
  }

  public hideAllSubmenus() {
    for(let page of this.menuArray) {
      this.hideSubmenuOf(page);
    }
  }

  // public testNotifications() {
  //   let MIN = 500, MAX = 7500;
  //   let live = this.data.random(MIN, MAX);
  //   let details:string = `Developers are always watching, for ${live}ms at least.`;
  //   Log.l(`AppComponent.testNotifications(): generating a notification that should last ${live}ms...`);
  //   // let msg:Notice = {severity:'error', summary:'ERROR!', detail:details, life:live}
  //   this.notify.addError("ERROR!", details, live);
  // }

  public menuClosed() {
    for(let eachPage of this.menuArray) {
      if(eachPage['showSubMenu'] !== undefined) {
        eachPage.showSubMenu = false;
      }
      // if(eachPage['parent'] !== undefined) {
      //   // eachPage.subStyle['max-height'] = '0px';
      //   eachPage.style['max-height'] = '0px';
      // }
    }
    // this.events.publish("menu:closed", '');
  }

  // public async updateData(evt?:any) {
  //   let spinnerID = '';
  //   try {
  //     let res:any;
  //     if(this.menuCtrl.isOpen()) {
  //       res = await this.menuCtrl.close();
  //     }
  //     res = await this.data.getReports();
  //     let newReports:Array<Report> = res;
  //     this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
  //     this.alert.hideSpinner(spinnerID);
  //     return res;
  //   } catch(err) {
  //     Log.l(`updateData(): Error getting updated data!`);
  //     Log.e(err);
  //     this.alert.hideSpinner(spinnerID);
  //     this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
  //     throw new Error(err);
  //   }
  //   // this.menu.close().then(res => {
  //   //   return this.data.getReports();
  //   // }).then(res => {
  //   //   this.notify.addSuccess("FINISHED", "Updated report data!", 3000);
  //   // }).catch(err => {
  //   //   Log.l("openPage(): Error updating data!");
  //   //   Log.e(err);
  //   //   this.notify.addError("ERROR", `Error updating reports: '${err.message}'`, 10000);
  //   // });
  // }



}

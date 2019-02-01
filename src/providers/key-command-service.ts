// import                                 'rxjs/add/operator/map'                   ;
// import                                 'rxjs/add/operator/toPromise'             ;
import * as mousetrap             from 'mousetrap'                            ;
import * as JSON5                 from 'json5'                                ;
import { Injectable             } from '@angular/core'                        ;
import { HttpClient             } from '@angular/common/http'                 ;
import { Subject, Observable,   } from 'rxjs'                                 ;
import { Log                    } from 'domain/onsitexdomain'                 ;
import { HotkeysService, Hotkey } from 'angular2-hotkeys'                     ;
import { NotifyService          } from 'providers/notify-service'             ;
import { NotificationComponent  } from 'components/notification/notification' ;

export const configFile = "assets/config/keyconfig.json5";

class HotkeyConfig {
  [key: string]: string[];
}

class ConfigModel {
  public hotkeys: HotkeyConfig;
}

export class Command {
  public name  : string        ;
  public combo : string        ;
  public ev    : KeyboardEvent ;
}

@Injectable()
export class KeyCommandService {
  public subject:Subject<Command>;
  public commands:Observable<Command>;

  // constructor(public hotkeysService:HotkeysService, public http:Http, public notify:NotifyService) {
  constructor(public hotkeysService:HotkeysService, public http:HttpClient, public notify:NotifyService) {
    this.subject = new Subject<Command>();
    this.commands = this.subject.asObservable();
    // this.http.get(configFile, {observe: 'response'}).toPromise().then((res:any) => {
    //   Log.l("KeyCommandService: observed response is:\n", res);
    //   // return this.readJSON5Config(res);
    //   // return json as ConfigModel;
    // // }).then(r => r.json() as ConfigModel)
    // // }).then((c:ConfigModel) => {
    //   // for(const key in c.hotkeys) {
    //     // const commands = c.hotkeys[key];
    //     // hotkeysService.add(new Hotkey(key, (ev, combo) => this.hotkey(ev, combo, commands)));
    //   // }
    // });

    this.http.get(configFile, {responseType: 'text'}).toPromise().then((res:any) => {
      // Log.l("KeyCommandService: observed response is:\n", res);
      return this.readJSON5Config(res);
    //   return json as ConfigModel;
    // }).then(r => r.json() as ConfigModel)
    }).then((c:ConfigModel) => {
      Log.l("KeyCommandService: parsed response is:\n", c);
      for(const key in c.hotkeys) {
        const commands = c.hotkeys[key];
        hotkeysService.add(new Hotkey(key, (ev, combo) => this.hotkey(ev, combo, commands)));
      }
    });
  }

  public hotkey(ev: KeyboardEvent, combo: string, commands: string[]): boolean {
    commands.forEach(c => {
      const command = {
        name: c,
        ev: ev,
        combo: combo
      } as Command;
      this.subject.next(command);
    });
    return true;
  }

  public readJSON5Config(json5:any):Promise<ConfigModel> {
    return new Promise(resolve => {
      let json = JSON5.parse(json5);
      resolve(json as ConfigModel);
    });
  }
}

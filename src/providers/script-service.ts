// import { ScriptStore } from "./script.store"       ;
import { Injectable  } from "@angular/core"        ;
import { Log         } from 'domain/onsitexdomain' ;
import { Preferences } from './preferences'        ;

// declare var document: any;

export interface ScriptLink {
  key     : string  ;
  src     : string  ;
  type    : number  ;
  loaded  : boolean ;
}

export interface ScriptLoadResult {
  script: string  ;
  loaded: boolean ;
  status: string  ;
}



export interface ScriptLinks {
  // [propName:string]:ScriptLink;
  maps         ?: ScriptLink;
  charts       ?: ScriptLink;
  quill        ?: ScriptLink;
  fullcalendar ?: ScriptLink;
}

@Injectable()
export class ScriptService {
  public scripts:ScriptLinks;

  constructor(
    public prefs:Preferences,
  ) {
    Log.l("Hello ScriptService provider");
    window['onsitescriptservice'] = this;
    let scriptList:ScriptLinks = {};
    let scripts:any = this.prefs.getScripts();
    // let keys:string[] = Object.keys(scripts);
    for(let key in scripts) {
      let url:string = scripts[key];
      let item:ScriptLink = {
        key    : key   ,
        type   : 1     ,
        src    : url   ,
        loaded : false ,
      };
      if(key === 'quill' || key === 'fullcalendar') {
        let baseURL:string = this.prefs.getAppURL();
        let fullURL:string = `${baseURL}${url}`;
        item.type = 2;
        item.src  = fullURL;
      }
      scriptList[key] = item;
    }
    this.scripts = scriptList;
    // ScriptStore.forEach((script: any) => {
    //     this.scripts[script.name] = {
    //         loaded: false,
    //         src: script.src
    //     };
    // });
  }

  public getScriptList():ScriptLinks {
    return this.scripts;
  }

  public showScriptList():ScriptLinks {
    Log.t(this.scripts);
    return this.scripts;
  }

  public loadScript(key:string):Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        Log.l(`loadScript(): Attempting to load script '${key}' ...`);
        let result:ScriptLoadResult = {
          script: key          ,
          loaded: false        ,
          status: "Not loaded" ,
        };
        let scripts:any = this.scripts;
        let item:any = scripts[key];
        if(!item) {
          let text:string = `Script '${key}' not found`;
          let err:Error = new Error(text);
          throw err;
        } else {
          let src:string = item.src;
          if(item.loaded) {
            Log.l(`loadScript(): Script '${key}' already loaded.`);
            result = {
              script: key              ,
              loaded: true             ,
              status: "Already loaded" ,
            };
            resolve(result);
          } else {
            Log.l(`loadScript(): Script '${key}' not loaded, attempting to load...`);
            let script:HTMLScriptElement = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;
            script.onload = () => {
              Log.l(`loadScript(): Script '${key}' loaded from '${item.src}'`);
              scripts[key].loaded = true;
              result = {
                script: key      ,
                loaded: true     ,
                status: "Loaded" ,
              };
              resolve(result);
            };
            script.onerror = (err: any) => {
              Log.l(`loadScript(): Error loading script '${key}' from '${item.src}'`);
              Log.e(err);
              throw err;
            };
            let header:HTMLElement = document.getElementsByTagName('head')[0];
            if(header) {
              header.appendChild(script);
            }
            Log.l(`loadScript(): Script '${key}' should be loading or loaded right now...`);
          }
        }
      } catch(err) {
        Log.l(`loadScript(): Error loading script with key '${key}'`);
        Log.e(err);
        // throw new Error(err);
        reject(err);
      }
    });
    // try {
    //     return res;
    // } catch(err) {
    //   Log.l(`loadScript(): Error loading script with key '${key}'`);
    //   Log.e(err);
    //   throw new Error(err);
    // }
  }

  // load(...scripts: string[]) {
  //     var promises: any[] = [];
  //     scripts.forEach((script) => promises.push(this.loadScript(script)));
  //     return Promise.all(promises);
  // }

  // loadScript(name: string) {
  //     return new Promise((resolve, reject) => {
  //         //resolve if already loaded
  //         if (this.scripts[name].loaded) {
  //             resolve({script: name, loaded: true, status: 'Already Loaded'});
  //         }
  //         else {
  //             //load script
  //             let script = document.createElement('script');
  //             script.type = 'text/javascript';
  //             script.src = this.scripts[name].src;
  //             if (script.readyState) {  //IE
  //                 script.onreadystatechange = () => {
  //                     if (script.readyState === "loaded" || script.readyState === "complete") {
  //                         script.onreadystatechange = null;
  //                         this.scripts[name].loaded = true;
  //                         resolve({script: name, loaded: true, status: 'Loaded'});
  //                     }
  //                 };
  //             } else {  //Others
  //                 script.onload = () => {
  //                     this.scripts[name].loaded = true;
  //                     resolve({script: name, loaded: true, status: 'Loaded'});
  //                 };
  //             }
  //             script.onerror = (error: any) => resolve({script: name, loaded: false, status: 'Loaded'});
  //             document.getElementsByTagName('head')[0].appendChild(script);
  //         }
  //     });
  // }

}

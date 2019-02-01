import { Injectable    } from '@angular/core'              ;
import { Platform      } from 'ionic-angular'              ;
import { Preferences   } from './preferences'              ;
import { ServerService } from './server-service'           ;
import { DBService     } from './db-service'               ;
import { Log           } from 'domain/onsitexdomain'       ;

@Injectable()
export class SmartAudio {

  public audioType  : string      = 'html5'     ;
  public sounds     : any         = {}          ;
  public blobs      : Blob[]      = []          ;
  public multisounds: any         =         { } ;

  // constructor(public nativeAudio: NativeAudio, platform: Platform) {
  constructor(
    public platform : Platform      ,
    public prefs    : Preferences   ,
    public server   : ServerService ,
    public db       : DBService     ,
  ) {

    // if (platform.is('cordova')) {
    //   this.audioType = 'native';
    // }

    window['consoleaudio'] = this;
  }

  public preload(key, asset) {
    // if (this.audioType === 'html5') {
      let audio = {
        key: key,
        asset: asset,
        type: 'html5'
      };
      // let sounds:any = {};
      this.sounds = this.sounds ? this.sounds : {};
      this.sounds[key] = audio;
      let blob = new Blob([asset], {type: 'file'});
      this.blobs.push(blob);
    // }
    //  else {
    //   this.nativeAudio.preloadSimple(key, asset);

    //   let audio = {
    //     key: key,
    //     asset: key,
    //     type: 'native'
    //   };

    //   this.sounds.push(audio);
    // }
  }

  public play(key) {
    let audio:any;
    if(Array.isArray(this.sounds)) {
      audio = this.sounds.find((sound) => {
        return sound.key === key;
      });
    } else {
      if(!audio) {
        audio = this.sounds[key];
        let audioAsset = new Audio(audio);
        audioAsset.play();
      } else {
        let audioAsset = new Audio(this.sounds[key]);
        audioAsset.play();
      }
    }
    // if(audio) {
    //   if (audio.type === 'html5') {
    //     let audioAsset = new Audio(audio.asset);
    //     audioAsset.play();
    //   }
    // } else {
    //   Log.w("Can't play sound with key: ", key);
    // // else {
    // //   this.nativeAudio.play(audio.asset).then((res) => { Log.l(res); }, (err) => {Log.e(err); });
    // // }
    // }
  }

  public async preloadSounds() {
    try {
      let res:any = await this.db.getSounds();
      this.multisounds = res;
      let keys:string[] = Object.keys(this.multisounds);
      for(let key of keys) {
        this.blobs.push(this.multisounds[key]);
        this.preload(key, this.multisounds[key]);
      }
      Log.l("SmartAudio.preloadSounds(): Success! Preloaded sounds:\n", this.multisounds);
      return res;
    } catch(err) {
      Log.l(`SmartAudio.preloadSounds(): Error preloading sounds!`);
      Log.e(err);
      throw err;
    }
  }

  public getRandomSound(key1?:string) {
    let key = null;
    if(key1) {
      key = key1;
    } else {
      let keys = Object.keys(this.multisounds);
      let max = keys.length;
      let choice = Math.floor(Math.random() * (max));
      key = keys[choice];
    }
    Log.l(`SmartAudio.getRandomSound(): Playing random sound from '${key}'`);
    let size = this.multisounds[key].length;
    let min = 0;
    let max = size - 1;
    let choice = Math.floor(Math.random() * size) + min;
    return this.multisounds[key][choice];
  }

  public playRandomSound(key?:string) {
    if(this.prefs.isAudioEnabled()) {
      // if(key) {
      //   if(this.multisounds && this.multisounds[key] && this.multisounds[key].length) {
      //     let sound = this.getRandomSound(key);
      //     let audio = new Audio(sound);
      //     audio.play();
      //   } else {
      //     Log.w(`playRandomSound(): Sounds for '${key}' not found!`);
      //   }
      // } else {
      //   let sound = this.getRandomSound();
      //   let audio = new Audio(sound);
      //   audio.play();
      // }
      this.playRandomSoundForcibly(key);
    } else {
      Log.l(`SmartAudio.playRandomSound(): Can't play random sound for key '${key}', user has sounds disabled.`);
    }
  }

  public playRandomSoundForcibly(key?:string) {
    if(key) {
      if(this.multisounds && this.multisounds[key] && this.multisounds[key].length) {
        let sound = this.getRandomSound(key);
        let audio = new Audio(sound);
        audio.play();
      } else {
        Log.w(`SmartAudio.playRandomSoundForcibly(): Sounds for '${key}' not found!`);
      }
    } else {
      let sound = this.getRandomSound();
      let audio = new Audio(sound);
      audio.play();
    }
  }

}

// import { ModuleWithProviders            } from '@angular/core'                                           ;
// import { AgmCoreModule                  } from '@agm/core'                                               ;
// import { MapsAPILoader                  } from '@agm/core/services/maps-api-loader/maps-api-loader'      ;
// import { LazyMapsAPILoaderConfigLiteral } from '@agm/core/services/maps-api-loader/lazy-maps-api-loader' ;

// export class AgmCoreOverrideModule {
//     static forRoot(lazyMapsAPILoaderConfig?: LazyMapsAPILoaderConfigLiteral): ModuleWithProviders {
//         var module = AgmCoreModule.forRoot(lazyMapsAPILoaderConfig);

//         // This is the magical path to what we need to override.
//         // Future releases of Agm Core may totally break this.
//         let provider: any = module.providers[2];
//         provider.useClass = IgnoreIncludingApiLoader;

//         return module;
//     }
// }

// export class IgnoreIncludingApiLoader extends MapsAPILoader {
//     load(): Promise<void> {
//         // Do absolutely nothing.
//         return new Promise<void>(resolve => resolve());
//     }
// }

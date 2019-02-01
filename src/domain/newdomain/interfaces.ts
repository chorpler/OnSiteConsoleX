export interface SpinnerRecord {
  id     : string;
  spinner: any   ;
}

export interface Tab {
  name     : string ;
  fullName : string ;
  icon     : string ;
  waiting ?: boolean;
  active  ?: boolean;
  show     : boolean;
  role     : string ;
}

export interface SelectString {
  name     : string;
  fullName?: string;
  value   ?: string;
  code    ?: string;
  hours   ?: number;
}

export interface CLL {
  name         ?: string;
  fullName     ?: string;
  value        ?: string;
  code         ?: string;
  capsName     ?: string;
  techClass    ?: string;
  scheduleName ?: string;
  id           ?: number;
  hours        ?: number;
}

export interface ISESAShiftSymbols extends CLL {
  sunChars  ?: string;
  moonChars ?: string;
  sun       ?: string;
  moon      ?: string;
}

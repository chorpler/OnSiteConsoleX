/**
 * Name: Notice domain class
 * Vers: 2.0.1
 * Date: 2017-11-14
 * Auth: David Sargeant
 * Logs: 2.0.1 2017-11-14: Moved from NotificationComponent directory and added Notices interface as well
 */

export interface Notice {
  severity ?: string ;
  summary  ?: string ;
  detail   ?: string ;
  id       ?: any    ;
  life     ?: number ;
  closable ?: boolean;
  key      ?: string ;
  sticky   ?: boolean;
  data     ?: any    ;
}

export interface Notices {
  notices ?: Array<Notice>;
}

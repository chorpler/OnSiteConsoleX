var doc1 = {"_id":"arodriguez_2019-05-25_18-38-53_-0600_Sat","_rev":"8-22c131ad29e80c0106490fd07ab454c2","repairHrs":12,"uNum":"13028765","wONum":"319573312","notes":"S45c pm","rprtDate":"2019-05-24","lastName":"Rodriguez","firstName":"Anthony","client":"HALLIBURTON","location":"FORT LUPTON","locID":"MNSHOP","shift":"","shiftLength":0,"shiftStartTime":"","shiftSerial":"43607_03","workSite":"HB FORT LUPTON MNSHOP","payrollPeriod":43607,"technician":"Rodriguez, Anthony","timeStamp":43610.77700966435,"timeStampM":"2019-05-25T19:38:53-05:00","username":"arodriguez","timeStarts":"2019-05-24T05:00:00-05:00","timeEnds":"2019-05-24T17:00:00-05:00","change_log":[{"change":"updated","user":"Roxana","timestamp":"2019-06-06T11:59:19-05:00"},{"change":"updated","user":"Roxana","timestamp":"2019-06-10T16:42:40-05:00"}],"invoiced":false,"invoiced_dates":[],"flagged":false,"flagged_fields":[],"preauthed":false,"preauth_dates":[],"invoiced_date":"","invoice_numbers":[],"crew_number":"","paid":false,"paid_date":""}; var rpt1 = new onsitedebug.Report(doc1); t.data.dbdata.reports = [rpt1]; t.data.loaded.reports = true; t.zone.run(() => { p.reports = t.data.getData('reports'); }); 
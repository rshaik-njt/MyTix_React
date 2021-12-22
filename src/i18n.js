import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as commonConstants from './modules/common/services/CommonConstants'

import XHR from 'i18next-xhr-backend';
// not like to use this?
// have a look at the Quick start guide 
// for passing in lng and translations on init

i18n
  // load translation using xhr -> see /public/locales
  // (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-xhr-backend
  .use(XHR) 
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    backend: {
      loadPath: getURL(),
      customHeaders: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8; encoding=utf8' 
      }
    },
    fallbackLng: 'en',
    keySeparator : '_'
  });

  function getURL() {
      var appurl = window.location.href; 
      let search = window.location.search;
      let params = new URLSearchParams(search);
      let appTypeId = params.get('appTypeId') ? params.get('appTypeId') : '';

      var url = "/mytix-portal/assets/resources/e-ticketing_en.json";
      if(appurl.indexOf('/eticketing') !== -1 || ( (appurl.indexOf('appTypeId') !== -1) && appTypeId === commonConstants.ETICKETING_APP_TYPE) ){
        url = "/mytix-portal/assets/resources/e-ticketing_en.json";      
      }
      else if(appurl.indexOf('/student-ticketing') !== -1 || ( (appurl.indexOf('appTypeId') !== -1) && appTypeId === commonConstants.STUDENT_TICKETING_APP_TYPE) ){
        url = "/mytix-portal/assets/resources/student-ticketing_en.json";   
      } 
      else if(appurl.indexOf('/promotions') !== -1 || ( (appurl.indexOf('appTypeId') !== -1) && appTypeId === commonConstants.PROMOTIONS_APP_TYPE) ){          
        url = "/mytix-portal/assets/resources/promotions_en.json";  
      } 
      else if(appurl.indexOf('/paygo') !== -1 || ( (appurl.indexOf('appTypeId') !== -1) && appTypeId === commonConstants.PAYGO_APP_TYPE)){
        url = "/mytix-portal/assets/resources/paygo_en.json";  
      } 
      else {
        url = "/mytix-portal/assets/resources/e-ticketing_en.json";  
      }
    
      return url;
    }



export default i18n;
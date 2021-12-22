
import { PORTAL_REST_URL, CONFIG_URL } from './ApplicationConstants';
import { MessageService } from './MessageService';
import { CacheService } from './CacheService';
import { ExceptionHandlingService } from './ExceptionHandlingService';
import XMLParser from 'react-xml-parser';



export class RestService {

  constructor() {
    this.MessageService = new MessageService();
    this.CacheService = new CacheService();
    this.ExceptionHandlingService = new ExceptionHandlingService();
    this.headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8; encoding=utf8' });
    this.eTicketingHeaders = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8; encoding=utf8' });
    this.studentHeaders = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8; encoding=utf8' });
    this.payGoHeaders = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8; encoding=utf8' });
    this.promotionsHeaders = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8; encoding=utf8' });

  }

  processRequest(request, url_id) {
    this.MessageService.clearMessge();
    const form = new URLSearchParams();
    this.CacheService.setCache('method', request['method']);
    form.append('action', request['action']);
    form.append('method', request['method']);
    form.append('version', request['version']);
    form.append('app_type', request['app_type']);
    if (request['data']) {
      form.append('data', JSON.stringify(request['data']));
    }
    this.headers = this.addRequestHeaders(request['app_type']);
    let headers = this.headers;
    let url = this.getRestURL(url_id);
    var that = this;
    return fetch(url, {
      method: 'POST',
      body: form,
      headers
    }).then(function (response) {
      if (response.headers && response.headers.get('user_token')) {
        that.CacheService.setCache('uid', response.headers.get('user_token'));
      }
      if (response.headers && response.headers.get('app_session')) {
        that.CacheService.setCache('app_session', response.headers.get('app_session'));
      }
      return response;
    }).then(function (response) {
      return response.json();
    });
  }

  processTCRequest(request, url_id) {
    this.MessageService.clearMessge();
    const form = new URLSearchParams();
    let fData = request['data'];
    if (fData) {
      for (let key in fData) {
        form.append(key, fData[key]);
      }
    }
    this.headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8; encoding=utf8' });
    let headers = this.headers;
    let method = request['method'];
    let geturl = this.getTcPaymentURL(url_id);
    let url = geturl + method + '.php';
    return fetch(url, {
      method: 'POST',
      body: form,
      headers
    }).then(res => res.text())
    .then(data => {
        var xml = new XMLParser().parseFromString(data); 
        return xml;
    })
    
  }

  updateCache(request, url) {
    const form = new URLSearchParams();
    form.append('action', request['action']);
    form.append('method', request['method']);
    form.append('version', request['version']);
    form.append('app_type', request['app_type']);
    if (request['data']) {
      form.append('data', JSON.stringify(request['data']));
    }
    let headers = this.headers;
    var that = this;
    return fetch(url, {
      method: 'POST',
      body: form,
      headers
    }).then(function (response) {
      return response;
    }).then(function (response) {
      return response.json();
    });
  }

  getFileConfig(fileName) {
    let resp;
    let headers = this.addRequestHeaders(0);
    return fetch(CONFIG_URL + fileName, { method: 'POST', headers }).then(res =>
      res.json()).then(json =>
        resp = json);
  }

  addRequestHeaders(app_type) {
    let headers;
    switch (app_type) {
      case '0':
        headers = this.headers;
        break;
      case '1':
        headers = this.eTicketingHeaders;
        break;
      case '2':
        headers = this.studentHeaders;
        break;
      case '5':
        headers = this.payGoHeaders;
        break;
      case '3':
        headers = this.promotionsHeaders;
        break;
      default:
        headers = this.headers;
    }
    if (this.CacheService.getCache('uid') && !headers.get('user_token')) {
      headers.append('user_token', this.CacheService.getCache('uid'))
    }
    if (this.CacheService.getCache('app_session') && !headers.get('app_session')) {
      headers.append('app_session', this.CacheService.getCache('app_session'))
    }
    return headers;
  }

  getRestURL(url_id) {
    // get the URL from the home
    let rest_URL = PORTAL_REST_URL
    // let home_config = JSON.parse(this.CacheService.getCache(GET_CONFIG_METHOD));
    // if(home_config && home_config['rest_urls'] && home_config['rest_urls'][url_id]) {
    //     rest_URL = home_config['rest_urls'][url_id]
    // } 
    return rest_URL;

  }

  getTcPaymentURL() {
    let rest_URL = 'https://vault.trustcommerce.com/trusteeapi/';
    return rest_URL;
  }


}










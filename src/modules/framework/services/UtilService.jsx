 import { MessageService } from './MessageService';
 import { CacheService } from './CacheService';
 import { RestService } from './RestService';

 export  class UtilService  {
 	constructor() {
 		this.MessageService = new MessageService();
        this.CacheService = new CacheService();
        this.RestService = new RestService();
 	}

    processResponse = (response) => new Promise((resolve, reject) => {
        let data = response.data;
        if(!data.pdfByteArray){//added to skip for large data 
            this.CacheService.removeDataFromCache('response'); 
            this.CacheService.setCache('response', JSON.stringify(response));
        }
        let app_type = this.CacheService.getCache('APP_TYPE');
        if(data) {
            if(data.msg_code && data.msg_code !== "0") {
                if(app_type !== '2') {
                    if(data.msg_code === 163) {
                        this.updatePromoCache();
                    }
                    this.MessageService.setMessageToDisplay(data.msg_code);
                } else {
                    let action = this.CacheService.getCache("method");
                    if(action === 'validate_email' || action === 'check_request_code' 
                        || action === 'reset_password' || action === 'forgot_password' 
                        ||action === 'validate_security_code'|| action === 'register_user'|| 'authenticate_user'||'resend_verification_link') {
                        this.MessageService.setMessageToDisplay(data.msg_code);
                    }
                }
                
            }  
            if(data.status_code === "0") {             
                return resolve(response.data);
            } else {
                return reject(response.data);
            }
        } else {
          this.MessageService.setMessageToDisplay(0);
          return reject(response);
        }
    });

    updatePromoCache() {
        let app_config = this.CacheService.getCache('get_config');
        let user_config = JSON.parse(JSON.parse(app_config))['home_config']['user_account'];
        console.log(user_config);        
        let noofservers  = user_config['NO_OF_SERVERS'];
        let auth_code = user_config['ACCESS_CONFIG_KEY'];
        let data = {
            'auth_code' : auth_code,
        }
        let request = {};
        request.action = 'config_manager';
        request.method =  'promo_cache' ;
        request.version = '1.0';
        request.app_type = this.CacheService.getCache('APP_TYPE');
        request.data = data;
       
        for(let i=1; i<=noofservers; i++) {
            let url  = user_config['URL_'+i];
            console.log(url);
            this.RestService.updateCache(request, url);
        }
    }	
}
import { RestService } from '../../framework/services/RestService';
import * as commonConstants from './CommonConstants';
import {UserManagementService} from './UserManagementService';
import { ValidationService }  from '../../framework/services/ValidationService';
import { CacheService }  from '../../framework/services/CacheService';
import { UserAgent } from 'react-ua'
import { trackPromise } from 'react-promise-tracker'
import * as PromotionsConstants from '../../promotions/services/PromotionsConstants';

export class CommonService {
    constructor(){
        this.RestService = new RestService();
        this.ValidationService = new ValidationService();
        this.CacheService = new CacheService();
        this.UserManagementService = new UserManagementService();
    }

   updateCache = () => new Promise((resolve, reject) => {
      this.getMessages();
      this.getValidations().then(result => {
          this.getConfig().then(response => {
          this.CacheService.setCache(commonConstants.GET_CONFIG_METHOD, JSON.stringify(response.content)); 
              return resolve(response);                    
          }).catch(error => {
              return reject('CommonService - > updateCache', error);
          });
      })
    });

    getConfig  = () => new Promise((resolve, reject) => {
        let request = {};
        request.action = this.constructActionName();
        request.method =  commonConstants.GET_CONFIG_METHOD ;
        request.version = commonConstants.APP_VERSION;
        request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        request.data = this.constructCofigRequest();
        this.RestService.processRequest(request,  commonConstants.PORTAL_REST).then(result => {
            return resolve(result.data);           
        }).catch(error => {
            return reject('CommonService - > getConfig', error);
        });
       
    });

    constructCofigRequest() {
        let req ={}; 
        
        let app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        switch(app_type) {
           case commonConstants.ETICKETING_APP_TYPE :
             req = {};
            req.browser = this.CacheService.getCache('browser');
            req.os = this.CacheService.getCache('os');
             return req;
           case commonConstants.STUDENT_TICKETING_APP_TYPE :
            req = {};
            let university_code = this.CacheService.getCache('university_code');
            let student_id = this.CacheService.getCache('student_id');
            req.browser = this.CacheService.getCache('browser');
            req.os = this.CacheService.getCache('os');
            req.university_code = university_code ? university_code : undefined;
            req.student_id = student_id ? student_id :  undefined;
            return req;
           case commonConstants.PROMOTIONS_APP_TYPE :
             req = {};
             req.browser = this.CacheService.getCache('browser');
             req.os = this.CacheService.getCache('os');
             req.promo_code = this.CacheService.getCache('promoCode')? this.CacheService.getCache('promoCode') : undefined;
             return req;
             case commonConstants.PAYGO_APP_TYPE :
              req = {};
             req.browser = this.CacheService.getCache('browser');
             req.os = this.CacheService.getCache('os');
              return req;  
          default :
             req = {};
             return req;

        }
        
    }

    constructActionName() {
      let action =""; 
      
      let app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
      switch(app_type) {
         case commonConstants.ETICKETING_APP_TYPE :
          return commonConstants.ETICKETING_CONFIG_MANAGEMENT;
         case commonConstants.STUDENT_TICKETING_APP_TYPE :
          return commonConstants.STUDENT_TICKETING_CONFIG_MANAGEMENT;
         case commonConstants.PROMOTIONS_APP_TYPE :
          return commonConstants.PROMO_CONFIG_MANAGEMENT;
        case commonConstants.PAYGO_APP_TYPE :
          return commonConstants.PAYGO_CONFIG_MANAGEMENT;
        default :
           return action;

      }
      
  }

    getMessages() {
         let app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT); 
         let fileName = this.getFileName(app_type);
         this.RestService.getFileConfig(fileName + "_en.json").then(result =>  {
              this.CacheService.setCache('messages',JSON.stringify(result['messages'])); 
         });
      
    }

    getFileName(app_type) {
      var fileName = '';
      switch(app_type) {
        case commonConstants.ETICKETING_APP_TYPE : 
          fileName = "e-ticketing";
          break;
        case commonConstants.STUDENT_TICKETING_APP_TYPE : 
          fileName = "student-ticketing";        
          break;
        case commonConstants.PAYGO_APP_TYPE : 
          fileName = "paygo";        
          break;
        case commonConstants.PROMOTIONS_APP_TYPE : 
          fileName = "promotions";        
          break;
          
        default : 
          fileName = "e-ticketing";
        break;
      }
      return fileName;
    }

    getValidations = () => new Promise((resolve, reject) => {   
      let app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
      let fileName = this.getFileName(app_type);
       this.RestService.getFileConfig(fileName + "_validation_rules.json")
        .then(result =>  {
            this.ValidationService.setValidations(result).then(response => {
                 this.CacheService.setCache('validations', JSON.stringify(response)); 
                 return resolve(result);
            });                 
        });
    }); 
    
    forgotPassword(request){  
        return this.UserManagementService.forgotPassword(request);
    };

    resetPassword(request){
        
        return this.UserManagementService.resetPassword(request);
    };
    
    validateSecurityCode(request){
        return this.UserManagementService.validateSecurityCode(request);
    };

    validateResetToken(request){
        return this.UserManagementService.validateResetToken(request);
    }  
    
}
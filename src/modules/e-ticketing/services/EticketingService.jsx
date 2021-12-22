import { RestService } from '../../framework/services/RestService';
import * as eticketingConstants from './EticketingConstants';
import * as commonConstants from '../../common/services/CommonConstants';
import { ValidationService }  from '../../framework/services/ValidationService';
import { CacheService }  from '../../framework/services/CacheService';
import { UserManagementService } from '../../common/services/UserManagementService';
import { PurchaseMgmtService } from '../../common/services/PurchaseMgmtService';
import { ExceptionHandlingService }  from '../../framework/services/ExceptionHandlingService';


export class EticketingService {
    constructor(){
          this.RestService = new RestService();
          this.ValidationService = new ValidationService();
          this.CacheService = new CacheService();
          this.UserManagementService = new UserManagementService();
          this.PurchaseMgmtService = new PurchaseMgmtService();
          this.ExceptionHandlingService = new ExceptionHandlingService();
    }

    get_eticket_Config(){
        let request = {};
        request.action = eticketingConstants.CONFIG_MANAGER_ACTION;;
        request.method = eticketingConstants.GET_ETICKET_CONFIG_METHOD;
        request.version = eticketingConstants.ETICKETING_VERSION;
        request.app_type = this.CacheService.get(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(request).then(result => {
            console.log(result)
            console.log(JSON.stringify(result));
            this.CacheService.setCache(eticketingConstants.GET_ETICKET_CONFIG_METHOD, JSON.stringify(result))
        }).catch(error => {
            
           this.ExceptionHandlingService.setException(0);
        });     

    };
 
    registerUser(request){
        return this.UserManagementService.registerUser(request)
    };

    updateUserProfile(request){
       return this.UserManagementService.updateUserProfile(request);
    };

    authenticateUser(request){
       return this.UserManagementService.authenticateUser(request);        
    };
   
    activateUser(request){
        return this.UserManagementService.activateUser(request);
    };

    logout(){
        return this.UserManagementService.logout();        
     };

    getPayments(){
        return this.PurchaseMgmtService.getPayments();
    }

    updatePayment(request){
        return this.PurchaseMgmtService.updatePayment(request);
    }
    addPayment(request){
        return this.PurchaseMgmtService.addPayment(request);
    }
    deletePayment(request){
        return this.PurchaseMgmtService.deletePayment(request);
    }
    purchase(request){
        return this.PurchaseMgmtService.purchase(request);
    }

    downloadEticket(request){
        return this.PurchaseMgmtService.downloadEticket(request);
    }

    getTicketPurchaseHistory(){
        return this.PurchaseMgmtService.getTicketPurchaseHistory();
    }

    getEvents(){
        return this.PurchaseMgmtService.getEvents();
    }

    regenerateVerificationUrl(request){
        return this.UserManagementService.regenerateVerificationUrl(request);
    };



   
}
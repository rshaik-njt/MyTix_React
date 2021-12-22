import { RestService } from '../../framework/services/RestService';
import * as commonConstants from './CommonConstants';
import { ValidationService }  from '../../framework/services/ValidationService';
import { CacheService }  from '../../framework/services/CacheService';
import { UtilService }  from '../../framework/services/UtilService';
import { MessageService }  from '../../framework/services/MessageService';
import { ExceptionHandlingService }  from '../../framework/services/ExceptionHandlingService';

export class UserManagementService {
    constructor(){
          this.RestService = new RestService();
          this.ValidationService = new ValidationService();
          this.CacheService = new CacheService();
          this.ExceptionHandlingService = new ExceptionHandlingService();
          this.MessageService = new MessageService();
          this.UtilService = new UtilService();
    }
          
    authenticateUser   = (request) => new Promise((resolve, reject) => {
        let req ={};
        req.action = this.constructUserMgmtActionName();
        req.method = commonConstants.AUTHENTICATE_USER;
        req.version = commonConstants.APP_VERSION;
        req.data = request;
        req.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(req, commonConstants.PORTAL_REST).then(result => {
            this.UtilService.processResponse(result).then(resp => {
                let responseData = resp;
                let userData = {};
                userData = responseData.content;
                this.CacheService.setCache('user', JSON.stringify(userData));
                return resolve(responseData);
            }).catch(error => {
                return reject('UserManagementService - > authenticateUser :error while Process response', error);
            }); 
        }).catch(error => {
            return reject('UserManagementService - > authenticateUser :error while Process request', error);
        });                
    })

    constructUserMgmtActionName() {
        let action =""; 
        
        let app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        switch(app_type) {
           case commonConstants.ETICKETING_APP_TYPE :
            return commonConstants.ETICKETING_USER_MANAGER_ACTION;
           case commonConstants.STUDENT_TICKETING_APP_TYPE :
            return commonConstants.STUDENT_USER_MANAGER_ACTION;
           case commonConstants.PROMOTIONS_APP_TYPE :
            return commonConstants.PROMOTIONS_USER_MANAGER_ACTION;
          case commonConstants.PAYGO_APP_TYPE :
            return commonConstants.PAYGO_USER_MANAGER_ACTION;
          default :
             return action;
  
        }
        
    }
   
    registerUser = (request)  => new Promise((resolve, reject) => {
         let reg ={};
         reg.action = this.constructUserMgmtActionName();
         reg.method = commonConstants.REGISTER_USER;
         reg.version = commonConstants.APP_VERSION;
         reg.data = request;
         reg.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
         this.RestService.processRequest(reg, commonConstants.PORTAL_REST).then(response => {
            this.UtilService.processResponse(response).then(resp => {                
                return resolve(resp);
            }).catch(error => {
                return reject('error');
            }); 
        }).catch(error => {
            return reject('error');
        });
    
    })

    activateUser = (request)  => new Promise((resolve, reject) => {
        let reg ={};
        reg.action = this.constructUserMgmtActionName();
        reg.method = commonConstants.ACTIVATE_USER;
        reg.version = commonConstants.APP_VERSION;
        reg.data = request;
        reg.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(reg, commonConstants.PORTAL_REST).then(response => {           
           this.UtilService.processResponse(response).then(resp => {               
               return resolve(resp);
           }).catch(error => {
               return reject('error');
           }); 
       }).catch(error => {
           return reject('error');
       });
   
    })

    regenerateVerificationUrl = (request)  => new Promise((resolve, reject) => {
        let reg ={};
        reg.action = this.constructUserMgmtActionName();
        reg.method = commonConstants.REGENERATE_VERIFY_EMAIL;
        reg.version = commonConstants.APP_VERSION;
        reg.data = request;
        reg.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(reg, commonConstants.PORTAL_REST).then(response => {          
           this.UtilService.processResponse(response).then(resp => {               
               return resolve(resp);
           }).catch(error => {
               return reject('error');
           }); 
       }).catch(error => {
           return reject('error');
       });
   
    })

    extendStudentProfile = (request)  => new Promise((resolve, reject) => {
        let reg ={};
        reg.action = this.constructUserMgmtActionName();
        reg.method = commonConstants.EXTEND_STUDENT_PROFILE;
        reg.version = commonConstants.APP_VERSION;
        reg.data = request;
        reg.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(reg, commonConstants.PORTAL_REST).then(response => {          
           this.UtilService.processResponse(response).then(resp => {               
               return resolve(resp);
           }).catch(error => {
               return reject('error');
           }); 
       }).catch(error => {
           return reject('error');
       });
   
    })

    

    forgotPassword = (request) => new Promise((resolve, reject) => {
        let req ={};
        req.action = this.constructUserMgmtActionName();
        req.method = commonConstants.FORGOT_PASSWORD;
        req.version = commonConstants.APP_VERSION;
        req.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        req.data = request;
         this.RestService.processRequest(req, commonConstants.PORTAL_REST).then(response => {
            this.UtilService.processResponse(response).then(resp => {               
                return resolve(resp);
            }).catch(error => {
                return reject('error');
            }); 
        }).catch(error => {
            return reject('error');
        });
    })

    validateSecurityCode = (request)  => new Promise((resolve, reject) => {
        let req ={};
        req.action = this.constructUserMgmtActionName();
        req.method = commonConstants.VALIDATE_SECURITY_CODE;
        req.version = commonConstants.APP_VERSION;
        req.data = request;
        req.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(req, commonConstants.PORTAL_REST).then(response => {
           this.UtilService.processResponse(response).then(resp => {
               return resolve(resp);
           }).catch(error => {
               return reject('error');
           }); 
       }).catch(error => {
           return reject('error');
       });
   
     })

    updateUserProfile = (request)  => new Promise((resolve, reject) => {
        let profile ={};
        profile.action = this.constructUserMgmtActionName();
        profile.method = commonConstants.UPDATE_USER_PROFILE;
        profile.version = commonConstants.APP_VERSION;
        profile.data = request;
        profile.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(profile, commonConstants.PORTAL_REST).then(response => {
            this.UtilService.processResponse(response).then(resp => {
               
                return resolve(resp);
            }).catch(error => {
                return reject('error');
            }); 
        }).catch(error => {
            return reject('error');
        });
   
       })


    resetPassword = (request)  => new Promise((resolve, reject) => {
        let Rpass ={};
        Rpass.action = this.constructUserMgmtActionName();
        Rpass.method = commonConstants.RESET_PASSWORD;
        Rpass.version = commonConstants.APP_VERSION;
        Rpass.data = request;
        Rpass.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(Rpass, commonConstants.PORTAL_REST).then(response => {
            this.UtilService.processResponse(response).then(resp => {               
                return resolve(resp);
            }).catch(error => {
                return reject('error');
            });           
        }).catch(error => {
            return reject('error');
        });
   
    })

    validateResetToken = (request)  => new Promise((resolve, reject) => {
        let req ={};
        req.action = this.constructUserMgmtActionName();
        req.method = commonConstants.VALIDATE_RESET_TOKEN;
        req.version = commonConstants.APP_VERSION;
        req.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        req.data = request;
            this.RestService.processRequest(req, commonConstants.PORTAL_REST).then(response => {
            this.UtilService.processResponse(response).then(resp => {                
                 
                this.CacheService.setCache(request.email, resp);
                return resolve(resp);
            }).catch(error => {
                return reject('error');
            }); 
        }).catch(error => {
            return reject('error');
        });
   
    })
 
    continueSession = ()  => new Promise((resolve, reject) => {
        let reg ={};
        reg.action = this.constructUserMgmtActionName();
        reg.method = commonConstants.EXTEND_USER_SESSION;
        reg.version = commonConstants.APP_VERSION;
        reg.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(reg, commonConstants.PORTAL_REST).then(response => {
           this.UtilService.processResponse(response).then(resp => {
                let responseData = resp;
                let userData = {};
                userData = responseData.content;
                if((userData+'') !== "undefined"){
                    this.CacheService.setCache('user', JSON.stringify(userData));
                }
                
                return resolve(responseData);
            }).catch(error => {
                return reject('UserManagementService - > authenticateUser :error while Process response', error);
            }); 
       }).catch(error => {
           return reject('error');
       });
   
    })


     logout   = () => new Promise((resolve, reject) => {
        let req ={};
        req.action = this.constructUserMgmtActionName();
        req.method = commonConstants.LOGOUT;
        req.version = commonConstants.APP_VERSION;
        req.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(req, commonConstants.PORTAL_REST).then(result => {
            this.UtilService.processResponse(result).then(resp => {
                this.CacheService.removeDataFromCache('user');
                return resolve(resp);
            }).catch(error => {
                return reject('UserManagementService - > authenticateUser :error while Process response', error);
            }); 
        }).catch(error => {
            return reject('UserManagementService - > authenticateUser :error while Process request', error);
        });                
    })


     

}
import { RestService } from '../../framework/services/RestService';
import { ValidationService }  from '../../framework/services/ValidationService';
import { CacheService }  from '../../framework/services/CacheService';
import { UserManagementService } from '../../common/services/UserManagementService';
import { ExceptionHandlingService }  from '../../framework/services/ExceptionHandlingService';


export class StudentTicketingService {
    constructor(){
        this.RestService = new RestService();
        this.ValidationService = new ValidationService();
        this.CacheService = new CacheService();
        this.UserManagementService = new UserManagementService();
        this.ExceptionHandlingService = new ExceptionHandlingService();
  }


  registerStudent(request){
      return this.UserManagementService.registerUser(request)
  };

  authenticateUser(request){
     return this.UserManagementService.authenticateUser(request);        
  };

  regenerateVerificationUrl(request){
    return this.UserManagementService.regenerateVerificationUrl(request);
  };

  extendStudentProfile(request){
    return this.UserManagementService.extendStudentProfile(request);
  };
     
}
import { UserManagementService } from '../../common/services/UserManagementService';
import { PurchaseMgmtService } from '../../common/services/PurchaseMgmtService';


export class PromotionsService {
    constructor(){
          this.UserManagementService = new UserManagementService();
          this.PurchaseMgmtService = new PurchaseMgmtService();
    }

    registerUser(request){
        return this.UserManagementService.registerUser(request)
    };

    updateUserProfile(request){
       return this.UserManagementService.updateUserProfile(request);
    };

    authenticateUser(request){
       return this.UserManagementService.authenticateUser(request);        
    };

    logout(){
       return this.UserManagementService.logout();        
    };
   
    activateUser(request){
        return this.UserManagementService.activateUser(request);
    };

    regenerateVerificationUrl(request){
        return this.UserManagementService.regenerateVerificationUrl(request);
    };

    getProducts(request) {
      return this.PurchaseMgmtService.getProducts(request);
    }

    getDestinationStations(request) {
      return this.PurchaseMgmtService.getDestinationStations(request);
    }

    getOriginStations(request) {
      return this.PurchaseMgmtService.getOriginStations(request);
    }

    getViaStations(request) {
      return this.PurchaseMgmtService.getViaStations(request);
    }

    getTariffTypes(request) {
      return this.PurchaseMgmtService.getTariffTypes(request);

    }

    getRoutes(request) {
      return this.PurchaseMgmtService.getRoutes(request);
    }

    getLightRailProducts(request) {
      return this.PurchaseMgmtService.getLightRailProducts(request);      
    }

    getZones(request) {
      return this.PurchaseMgmtService.getZones(request);
    }

    verifyOrder(request) {
      return this.PurchaseMgmtService.verifyOrder(request);
    }

    purchase(request) {
      return this.PurchaseMgmtService.purchase(request);
    }

    
}
import { RestService } from '../../framework/services/RestService';
import * as commonConstants from './CommonConstants';
import { UserManagementService } from './UserManagementService';
import { ValidationService } from '../../framework/services/ValidationService';
import { CacheService } from '../../framework/services/CacheService';
import { trackPromise } from 'react-promise-tracker'
import { UtilService }  from '../../framework/services/UtilService';

export class PurchaseMgmtService {
  constructor() {
    this.RestService = new RestService();
    this.ValidationService = new ValidationService();
    this.CacheService = new CacheService();
    this.UserManagementService = new UserManagementService();
    this.UtilService = new UtilService();
  }

  getProducts = () => new Promise((resolve, reject) => {
    this.RestService.getFileConfig('promotions_products.json')
      .then(result => {
           return resolve(result);                    
      }).catch(error => {
          return reject('CommonService - > updateCache', error);
      });
  });

  getOriginStations = () => new Promise((resolve, reject) => {
    this.RestService.getFileConfig('stations.json')
      .then(result => {
        return resolve(result);                    
      }).catch(error => {
          return reject('CommonService - > updateCache', error);
      });
    
  });

  getRoutes = (data) => new Promise((resolve, reject) => {
     let request ={};
     request.action = this.constructUserMgmtActionName();
     request.method = commonConstants.GET_ROUTES;
     request.version = commonConstants.APP_VERSION;
     request.data = data;
     request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
     this.RestService.processRequest(request, commonConstants.PORTAL_REST)
      .then(response => {
          this.UtilService.processResponse(response).then(resp => {  
              return resolve(resp);
          }).catch(error => {
              return reject('getRoutes -> error', error);
          });                    
      }).catch(error => {
          return reject('purchaseService - > getRoutes', error);
      });
  });


  getLightRailProducts = (data) => new Promise((resolve, reject) => {
     let request ={};
     request.action = this.constructUserMgmtActionName();
     request.method = commonConstants.METHOD_GET_LR_PRODUCTS;
     request.version = commonConstants.APP_VERSION;
     request.data = data;
     request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
     this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
          this.UtilService.processResponse(response).then(resp => {  
              return resolve(resp);
          }).catch(error => {
              return reject('getLightRailProducts -> error', error);
          });                    
      }).catch(error => {
          return reject('purchaseService - > getLightRailProducts', error);
      });
  });

  getDestinationStations = (data)  => new Promise((resolve, reject) => {
       let request ={};
       request.action = this.constructUserMgmtActionName();
       request.method = commonConstants.GET_DESTINATION_STATIONS;
       request.version = commonConstants.APP_VERSION;
       request.data = data;
       request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
       this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
          this.UtilService.processResponse(response).then(resp => {  
              return resolve(resp);
          }).catch(error => {
              return reject('getdestinationStations -> error', error);
          }); 
      }).catch(error => {
          console.log("purchaseService getDestinationStations processRequest Failed", error);              
          return reject('error');
      });    
  });


  getViaStations = (data)  => new Promise((resolve, reject) => {
       let request ={};
       request.action = this.constructUserMgmtActionName();
       request.method = commonConstants.GET_VIA_STATIONS;
       request.version = commonConstants.APP_VERSION;
       request.data = data;
       request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
       this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
          this.UtilService.processResponse(response).then(resp => {                
              return resolve(resp);
          }).catch(error => {
              return reject('error');
          }); 
      }).catch(error => {
          return reject('error');
      });    
  });

  verifyOrder = (data)  => new Promise((resolve, reject) => {
       let request ={};
       request.action = this.constructUserMgmtActionName();
       request.method = commonConstants.VERIFY_PROMO_ORDER;
       request.version = commonConstants.APP_VERSION;
       request.data = data;
       request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
       this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
          this.UtilService.processResponse(response).then(resp => {                
              return resolve(resp);
          }).catch(error => {
              return reject('error');
          }); 
      }).catch(error => {
          return reject('error');
      });    
  });

  purchase = (data)  => new Promise((resolve, reject) => {
       let request ={};
       request.action = this.constructUserMgmtActionName();
       request.method = commonConstants.PURCHASE;
       request.version = commonConstants.APP_VERSION;
       request.data = data;
       request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
       this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
          this.UtilService.processResponse(response).then(resp => {                
              return resolve(resp);
          }).catch(error => {
              return reject('error');
          }); 
      }).catch(error => {
          return reject('error');
      });    
  });

  getTariffTypes = (data)  => new Promise((resolve, reject) => {
       let request ={};
       request.action = this.constructUserMgmtActionName();
       request.method = commonConstants.GET_TARIFF_TYPES;
       request.version = commonConstants.APP_VERSION;
       request.data = data;
       request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
       this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
          this.UtilService.processResponse(response).then(response => {                
              return resolve(response);
          }).catch(error => {
              return reject('error');
          }); 
      }).catch(error => {
          return reject('error');
      });    
  });

  getZones = (data)  => new Promise((resolve, reject) => {
      let request ={};
      request.action = this.constructUserMgmtActionName();
      request.method = commonConstants.GET_ZONES;
      request.version = commonConstants.APP_VERSION;
      request.data = data;
      request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
      this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
          this.UtilService.processResponse(response).then(response => {       
              return resolve(response);
          }).catch(error => {
              return reject('error');
          }); 
      }).catch(error => {
          return reject('error');
      });    
  })

  updatePayment = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();
    request.method = commonConstants.UPDATE_PAYMENT;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
})

addPayment = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();
    request.method = commonConstants.ADD_PAYMENT;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
})

deletePayment = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();
    request.method = commonConstants.DELETE_PAYMENT;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
})

downloadEticket = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();;
    request.method = commonConstants.DOWNLOAD_ETICKET;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
})

getTicketPurchaseHistory = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();;
    request.method = commonConstants.GET_PURCHASE_HISTORY;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
})

getEvents =() => new Promise((resolve, reject) => {   
    let app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
     this.RestService.getFileConfig( "e-ticketing_products.json")
      .then(result =>  {
               this.CacheService.setCache('events', JSON.stringify(result)); 
               return resolve(result);           
      });
  });


getPayments = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();
    request.method = commonConstants.GET_PAYMENTS;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
});

getCardById = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();
    request.method = commonConstants.GET_CARD_BY_ID;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
});

getMerchantToken = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();
    request.method = commonConstants.GET_MERCHANT_TOKEN;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
});

getTransactionHistory = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();
    request.method = commonConstants.GET_TRX_HISTORY;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
});
  
getjourneyDetail = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();
    request.method = commonConstants.GET_JOURNEY_DETAILS;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
});

getPaymentReceipt = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.action = this.constructUserMgmtActionName();
    request.method = commonConstants.GET_PAYMENT_RECEIPT;
    request.version = commonConstants.APP_VERSION;
    request.data = data;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
        this.UtilService.processResponse(response).then(response => {       
            return resolve(response);
        }).catch(error => {
            return reject('error');
        }); 
    }).catch(error => {
        return reject('error');
    });    
});

constructUserMgmtActionName() {
    let action =""; 
    
    let app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    switch(app_type) {
       case commonConstants.ETICKETING_APP_TYPE :
        return commonConstants.ETICKETING_PURCHASE_MANAGER_ACTION;
       case commonConstants.STUDENT_TICKETING_APP_TYPE :
        return commonConstants.STUDENT_PURCHASE_MANAGER_ACTION;
       case commonConstants.PROMOTIONS_APP_TYPE :
        return commonConstants.PROMOTIONS_PURCHASE_MANAGER_ACTION;
      case commonConstants.PAYGO_APP_TYPE :
        return commonConstants.PAYGO_PURCHASE_MANAGER_ACTION;
      default :
         return action;

    }
    
}

TCpayment = (data)  => new Promise((resolve, reject) => {
    let request ={};
    request.method = commonConstants.TC_PAYMENT;
    request.data = data;
    this.RestService.processTCRequest(request).then(response => {
        return resolve(response);
    }).catch(error => {
        return reject('error2');
    });    
})


getCardByToken = (data)  => new Promise((resolve, reject) => {
        let request ={};
        request.action = this.constructUserMgmtActionName();
        request.method = commonConstants.GET_CARD_BY_TOKEN;
        request.version = commonConstants.APP_VERSION;
        request.data = data;
        request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
            this.UtilService.processResponse(response).then(response => {       
                return resolve(response);
            }).catch(error => {
                return reject('error');
            }); 
        }).catch(error => {
            return reject('error');
        });    
    });

completeTransaction = (data)  => new Promise((resolve, reject) => {
        let request ={};
        request.action = this.constructUserMgmtActionName();
        request.method = commonConstants.COMPLETE_TRANSACTION;
        request.version = commonConstants.APP_VERSION;
        request.data = data;
        request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.RestService.processRequest(request, commonConstants.PORTAL_REST).then(response => {
            this.UtilService.processResponse(response).then(response => {       
                return resolve(response);
            }).catch(error => {
                return reject('error');
            }); 
        }).catch(error => {
            return reject('error');
        });    
    });


}
    
    

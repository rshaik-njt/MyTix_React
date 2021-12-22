import React, { Suspense } from 'react';
import logo from './images/Image2.png';
import './App.scss';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { loadReCaptcha } from 'react-recaptcha-google';
import { UserAgent } from 'react-ua';
import { BrowserView, MobileView} from "react-device-detect";
import './css/translateelement.css';


//Student Ticketing Imports
import StudentLoginComponent from './modules/common/components/LoginComponent';
import StudentRegistrationComponent from './modules/common/components/RegisterComponent';
import StudentSplashComponent from './modules/student-Ticketing/components/StudentSplashComponent';
import StudentExtendProfileComponent from './modules/student-Ticketing/components/StudentLoginComponent';

import ForgotPasswordComponent from './modules/common/components/ForgotPasswordComponent'
import ActivateUserComponent from './modules/common/components/ActivateUserComponent';
import * as commonConstants from './modules/common/services/CommonConstants'

import HelpandSupportComponent from './modules/common/components/HelpandSupportComponent';

//eticketting imports
import EventLoginComponent from './modules/common/components/LoginComponent'
import EventRegisterComponent from './modules/common/components/RegisterComponent'
import EventPurchaseComponent from './modules/e-ticketing/components/EventPurchaseComponent'
import CheckoutComponent from './modules/e-ticketing/components/CheckoutComponent'
import UserProfileComponent from './modules/e-ticketing/components/UserProfileComponent'
import UserTicketsComponent from './modules/e-ticketing/components/UserTicketsComponent'
import ReviewOrderComponent from './modules/e-ticketing/components/ReviewOrderComponent'
import UserPaymentsComponent from './modules/e-ticketing/components/UserPaymentsComponent'
import SplashComponent from './modules/e-ticketing/components/SplashComponent'
import OrderCompleteComponent from './modules/e-ticketing/components/OrderCompleteComponent'
import EticketSplashComponent from './modules/e-ticketing/components/EticketSplashComponent';



//Promotions imports
import PromoLoginComponent from './modules/common/components/LoginComponent';
import PromoReviewOrderComponent from './modules/promotions/components/PromoReviewOrderComponent';
import PromoPurchaseComponent from './modules/promotions/components/PromoPurchaseComponent';
import PromoRegisterComponent from './modules/common/components/RegisterComponent';
import PromoUserProfileComponent from './modules/promotions/components/PromoUserProfileComponent';
import { CacheService } from './modules/framework/services/CacheService';
import { MessageService } from './modules/framework/services/MessageService';
import PromoSplashComponent from './modules/promotions/components/PromoSplashComponent';

import { CommonService } from './modules/common/services/CommonService';
import { UserManagementService } from './modules/common/services/UserManagementService';

import  LoadingComponent from './modules/common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';
import  PageNotFoundComponent from './modules/common/components/PageNotFoundComponent';

import {ETICKETTING_PATH,STUDENTTICKET_PATH,PROMOTIONS_PATH } from './modules/framework/services/ApplicationConstants';

import IdleTimer from 'react-idle-timer';

const logoStyle = {
  padding: '0.9em',
  maxWidth: '100%',
  width: 'auto',
  verticalAlign: 'bottom', 
  top: '50%',
  position: 'relative',
  maxHeight: '100%',
  height: '6em'

}

const moblogoStyle = {
  padding: '14px',
  maxWidth: '65%',
  width: 'auto',
  verticalAlign: 'bottom', 
  top: '50%',
  position: 'relative',
  maxHeight: '100%'
}

const headBgColor = {
  backgroundColor: '#1a2b57'
}

class App extends React.Component {
constructor(props) {
  super(props);
  this.idleTimer = null
  this.onAction = this._onAction.bind(this)
  // this.onActive = this._onActive.bind(this)
  // this.onIdle = this._onIdle.bind(this)
  this.state = {
    isconfigLoaded : false
  }
  this.browser = '';
  this.os = '';
  this.CommonService = new CommonService();
  this.UserManagementService = new UserManagementService();
  this.CacheService = new CacheService(); 
  this.MessageService = new MessageService();
  this.CacheService.clearCache();
}

googleTranslateElementInit = () => {
  new window.google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element')

}

componentDidMount() {
  loadReCaptcha(); 
  this.setAppType().then(result => {  
    this.CommonService.updateCache().then(response => {
      this.setState({isconfigLoaded : true});
    })
  }).catch(error => {

  });
  setTimeout(() => {
    var addScript = document.createElement('script');
    addScript.setAttribute('type', 'text/javascript');
    addScript.async = true;
    addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
    document.head.appendChild(addScript);
    window.googleTranslateElementInit = this.googleTranslateElementInit;
  }, 1000);

}

_onAction(e) {
    let uid = this.CacheService.getCache("uid");
    let user = JSON.parse(this.CacheService.getCache("user"));
    if(uid && user) {
      let now = new Date();
      let app_config = JSON.parse(this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD));      
      let user_config = (app_config)['home_config']['user_account'];      
      let userSessionTime = Number(user_config['USER_SESSION_TIMEOUT']); // 60 min
      let sessionExtendTime = Number(user_config['TIME_FOR_EXTEND_SESSION']); // 120 sec

      let loginTime;
      loginTime = new Date(this.CacheService.getCache('loginTime'));
      loginTime.setMinutes( loginTime.getMinutes() +  userSessionTime);

      if((loginTime - now) > 0 && (loginTime - now) <= (sessionExtendTime * 1000) ){
          this.contiueSession();
      } else if((loginTime - now) <= 0) {
          this.CacheService.removeDataFromCache('uid');
          this.CacheService.removeDataFromCache('user');        
          this.MessageService.setMessageToDisplay(117);
          this.redirectToLoginPage();
          
      }

    }
}

redirectToLoginPage() {
   var appurl = window.location.href; 
    if(appurl.indexOf(ETICKETTING_PATH) !== -1) {
        this.CacheService.setCache(commonConstants.APP_TYPE_CONSTANT, commonConstants.ETICKETING_APP_TYPE);
    } else if(appurl.indexOf(PROMOTIONS_PATH) !== -1){
         window.location = PROMOTIONS_PATH +  this.CacheService.getCache("promoPath");
    }
 }

contiueSession() {
    this.UserManagementService.continueSession().then(response => {
        this.CacheService.setCache('loginTime', new Date());
    });
}

 
setAppType = () => new Promise((resolve, reject) => {
    var appurl = window.location.href; 
    this.CacheService.setCache('browser',this.browser);
    this.CacheService.setCache('os',this.os);
    if(appurl.indexOf(ETICKETTING_PATH) !== -1) {
        this.CacheService.setCache(commonConstants.APP_TYPE_CONSTANT, commonConstants.ETICKETING_APP_TYPE);
        let search = window.location.search;
        let params = new URLSearchParams(search);
        this.trxseqid ='';
        if(params.get('trxseqid') !== null){
        this.trxseqid = params.get('trxseqid');
        }
        this.CacheService.setCache('trxseqid', this.trxseqid);
        
    } else if(appurl.indexOf(STUDENTTICKET_PATH) !== -1){
        let search = window.location.search;
        let params = new URLSearchParams(search);
        this.university_code ='*';
        this.student_id = '*';
        if(params.get('university_code') !== null){
        this.university_code = params.get('university_code');
        }
        if(params.get('student_id') !== null){
        this.student_id = params.get('student_id'); 
        }
        this.CacheService.setCache(commonConstants.APP_TYPE_CONSTANT, commonConstants.STUDENT_TICKETING_APP_TYPE);
        this.CacheService.setCache('university_code', this.university_code);
        this.CacheService.setCache('student_id', this.student_id); 
    } else if(appurl.indexOf(PROMOTIONS_PATH) !== -1){
           this.CacheService.setCache(commonConstants.APP_TYPE_CONSTANT, commonConstants.PROMOTIONS_APP_TYPE);
          var promoIndex = appurl.lastIndexOf("-");
          this.promoCode = '';
          if(promoIndex !== -1) {
              var endInd = appurl.length;
              if(appurl.indexOf("/", promoIndex+1) !== -1) {
                 endInd = appurl.indexOf("/", promoIndex+1);
              }  
              this.promoCode = appurl.substring(promoIndex+1, endInd);
              this.CacheService.setCache('promoPath', "/specialPromotion-" + this.promoCode);
              this.CacheService.setCache('promoCode', this.promoCode);
              if(this.promoCode.indexOf(".") != -1){
                this.CacheService.setCache('promoCode', '');
              }
          } else {
              this.CacheService.setCache(commonConstants.APP_TYPE_CONSTANT, commonConstants.PROMOTIONS_APP_TYPE);
              this.CacheService.setCache('promoCode', this.promoCode);
          }

    }  else if(appurl.indexOf('appTypeId') !== -1 ){
      let search = window.location.search;
      let params = new URLSearchParams(search);
      this.appTypeId = params.get('appTypeId');

      if(this.appTypeId === commonConstants.PROMOTIONS_APP_TYPE){
        var promoposition = appurl.lastIndexOf("-");
        if(promoposition !== -1) {
            var endposition = appurl.length;
            if(appurl.indexOf("&", promoposition+1) !== -1) {
              endposition = appurl.indexOf("&", promoposition+1);
            }  
            this.promoCode = appurl.substring(promoposition+1, endposition);
            this.CacheService.setCache('promoPath', "/specialPromotion-" + this.promoCode);
            this.CacheService.setCache('promoCode', this.promoCode);
          }
      }
      
      this.CacheService.setCache(commonConstants.APP_TYPE_CONSTANT, this.appTypeId);
    }
    return resolve(appurl);

});

render() {
  // const { t } = this.props;
  if(!this.state.isconfigLoaded) {
     return (
            <UserAgent>

            {v => {
                this.browser = v.browser.name;
                this.os = v.os.name;
            }}
            </UserAgent>
     );  
  }
  return (
    
    <Router>
      <div className="App body-c">
       <div className="c-navbar" style={headBgColor}>
          <div className="container-fluid">
            <div className="c-navbar-wrapper clearfix">
              <div className="kf_element_left">
                <div className="logo-here">
                     <BrowserView>
                        <img style={logoStyle}
                         border="0" src={logo} alt="NJ Transit Logo"/>
                    </BrowserView>
                    <MobileView>
                        <img style={moblogoStyle}
                     border="0" src={logo} alt="NJ Transit Logo"/>
                    </MobileView>
                </div>
              </div>

            </div>
          </div>
        </div>
        <Suspense fallback={( <LoadingComponent />  )}>
        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          element={document}
          onActive={this.onActive}
          onIdle={this.onIdle}
          onAction={this.onAction}
          debounce={250}
          timeout={1000 * 60 * 1} />
          <div id="notification-message-container"  className = "alert fixed-top"> 
                <div id="msg_description"></div>
          </div>
        <div id="app_body" class="container-fluid mb-5 pb-4"> 
            
          <Switch>    
            <Route exact path={PROMOTIONS_PATH} component={PromoLoginComponent}/>
            <Route exact path={PROMOTIONS_PATH + '/login'} component={PromoLoginComponent}/>
            <Route exact path={ETICKETTING_PATH} component={EventLoginComponent}/>
            <Route exact path={STUDENTTICKET_PATH} component={StudentLoginComponent}/> 


            <Route path={ PROMOTIONS_PATH + "/specialPromotion-" + this.promoCode + '/forgotPassword'} component={ForgotPasswordComponent} />

            <Route path={STUDENTTICKET_PATH + '/forgotPassword'} component={ForgotPasswordComponent} />
            <Route path={STUDENTTICKET_PATH + "/login"} component={StudentLoginComponent} />
            <Route path={STUDENTTICKET_PATH + "/extendStudentProfile"} component={StudentExtendProfileComponent} />
            <Route path={STUDENTTICKET_PATH + "/register"} component={StudentRegistrationComponent} />
            <Route path={STUDENTTICKET_PATH + "/register-success"} component={StudentSplashComponent} />
              
            <Route path={ETICKETTING_PATH + '/forgotPassword'} component={ForgotPasswordComponent} />
            <Route path={ETICKETTING_PATH + "/login"} component={EventLoginComponent}/>
            <Route path={ETICKETTING_PATH + "/register"} component={EventRegisterComponent}/>
            <Route path={ETICKETTING_PATH + "/purchase"} component={EventPurchaseComponent}/>
            <Route path={ETICKETTING_PATH + "/checkout"} component={CheckoutComponent}/>
            <Route path={ETICKETTING_PATH + "/user-profile"} component={UserProfileComponent}/>
            <Route path={ETICKETTING_PATH + "/my-tickets"} component={UserTicketsComponent}/>
            <Route path={ETICKETTING_PATH + "/review-order"} component={ReviewOrderComponent}/>
            <Route path={ETICKETTING_PATH + "/payment"} component={UserPaymentsComponent}/>
            <Route path={ETICKETTING_PATH + "/message"} component={SplashComponent}/>
            <Route path={ETICKETTING_PATH + "/order-complete"} component={OrderCompleteComponent}/>
            <Route path={ETICKETTING_PATH + '/register-success'} component={EticketSplashComponent} />



           
            <Route exact path={PROMOTIONS_PATH + "/specialPromotion-" + this.promoCode} component={PromoLoginComponent} />
            <Route path={PROMOTIONS_PATH + "/specialPromotion-" + this.promoCode + "/register"} component={PromoRegisterComponent} />
            <Route path={PROMOTIONS_PATH + "/specialPromotion-" + this.promoCode + "/register-success"} component={PromoSplashComponent} />
            <Route path={PROMOTIONS_PATH + "/specialPromotion-" + this.promoCode +  "/purchase"} component={PromoPurchaseComponent} />            
            <Route path={PROMOTIONS_PATH + "/specialPromotion-" + this.promoCode + "/reviewOrder"} component={PromoReviewOrderComponent} />
            <Route path={PROMOTIONS_PATH + "/specialPromotion-" + this.promoCode + "/userProfile"} component={PromoUserProfileComponent} />
            <Route path={"/mytix-portal/activateUser"} component={ActivateUserComponent}/>
            <Route path={PROMOTIONS_PATH + "/help&support"} component={HelpandSupportComponent}/>

            <Route path={ETICKETTING_PATH + "/help&support"} component={HelpandSupportComponent}/>
            <Route path={STUDENTTICKET_PATH + "/help&support"} component={HelpandSupportComponent}/>
            <Route component={PageNotFoundComponent} />

          </Switch>

        </div>
        <div className="footer"> 
        <div className ="row">

          <div className = "col-md-2 mb-2">


           {this.CacheService.getCache('APP_TYPE') === '1' ?
           <p className="text-center mb-0 p-2"><a href={ETICKETTING_PATH + "/help&support"} target="_blank" className="text-white">Help & Support</a></p>
           :null}

           {this.CacheService.getCache('APP_TYPE') === '2' ?
            <p className="text-center mb-0 p-2"><a href={STUDENTTICKET_PATH + "/help&support"} target="_blank" className="text-white">Help & Support</a></p>
           :null}

           {this.CacheService.getCache('APP_TYPE') === '3' || this.CacheService.getCache('APP_TYPE') === '0'?
            <p className="text-center mb-0 p-2"><a href={PROMOTIONS_PATH + "/help&support"} target="_blank" className="text-white">Help & Support</a></p>
           :null}

           </div>

          <div className = "col-md-2 mb-2">
          <p className="text-center mb-0 p-2"><a href="https://www.njtransit.com/privacy-and-terms#privacy-policy" target="_blank" className="text-white">Privacy </a> &nbsp; <a href="https://www.njtransit.com/privacy-and-terms" target="_blank" className="text-white">Terms of Use</a></p>
          </div>

          <div className = "col-md-5 mb-2">
          <p className="text-center mb-0 p-2 text-white">2021 © NJ TRANSIT All Rights Reserved. Version: MyTix_Portal_2.0.l</p>
          </div>

          <div className = "col-md-3 mb-2">
          <div id="google_translate_element"></div> 
          </div>
       
        </div>
        </div>
        </Suspense>
      </div>
    </Router>


  )
}
}

 export default App;
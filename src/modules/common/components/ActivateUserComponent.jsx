
import React from 'react';
import '../../promotions/css/Promo-style.scss';
import { ETICKETTING_PATH,PROMOTIONS_PATH,PAYGO_PATH } from '../../framework/services/ApplicationConstants';
import { UserAgent } from 'react-ua'
import { MessageService } from '../../framework/services/MessageService';
import { PromotionsService } from '../../promotions/services/PromotionsService';
import { CommonService } from '../services/CommonService';
import { CacheService } from '../../framework/services/CacheService';
import { ValidationService } from '../../framework/services/ValidationService';
import { withTranslation } from 'react-i18next';
import LoadingOverlay from 'react-loading-overlay'
import LoadingComponent from '../components/LoadingComponent';
import * as commonConstants from '../services/CommonConstants';
import StudentSplashComponent from '../../student-Ticketing/components/StudentSplashComponent';
import { ReCaptcha } from 'react-recaptcha-google';

 
class ActivateUserComponent extends React.Component {
  constructor(props) {
    super(props);
    this.CacheService = new CacheService();
    let search = props.location.search;
    let params = new URLSearchParams(search);
    if (params.get('verification_key')) {
      this.verificationKey = params.get('verification_key').replace(/ /g, '+');
      this.appTypeId = params.get('appTypeId').replace(/ /g, '+');
    }
    this.state = {
      email: '',
      password: '',
      captchaverifyToken: '',
      validateResponse: {},
      campaignText : '',
      isValidPromo : true,
      isActive : true,
      isTokenValid : 'Valid',
      outcome : 'init',
      profExpDate:'',
      respMsg : '',
      user : {},
      isconfigLoaded : false,
      activateButton:false
      
    };
    this.userConfig = {};
    this.recaptcha = React.createRef();
    this.browser = '';
    this.os = '';
    
    this.handleChange = this.handleChange.bind(this);
    this.regenerateVerificationUrl = this.regenerateVerificationUrl.bind(this);
    this.PromotionsService = new PromotionsService();
    this.CommonService = new CommonService();
    this.ValidationService = new ValidationService();
    this.MessageService = new MessageService();
    this.CacheService = new CacheService();
    let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        if(app_config !== "undefined") {
            let user = JSON.parse(app_config)['home_config']['user_account'];
            this.userConfig = user;
        }
    this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.CacheService.setCache(commonConstants.APP_TYPE_CONSTANT, this.appTypeId);
    if (this.verificationKey) {
       this.activateUser();
    }  else {
      this.setState({isTokenValid : 'Valid'});          
    }
  
  }
 

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  activateUser() {
    this.setState({isActive : true});
    let request = {};

    request.verificationKey = this.verificationKey;
    this.ValidationService.validateForm('activateuser', request).then(result => {
      this.setState({ validateResponse: result });
      if (this.state.validateResponse.isValid) {
        this.PromotionsService.activateUser(request).then(response => {
          
            this.CacheService.setCache('isNewUser', 'YES');
      
            if(this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT) === commonConstants.ETICKETING_APP_TYPE){
              this.props.history.push(ETICKETTING_PATH);
            }else if(this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT) === commonConstants.PROMOTIONS_APP_TYPE){
              this.CacheService.setCache('promoPath', "/specialPromotion-" + response.content.promoCode);
              this.CacheService.setCache('promoCode', response.content.promoCode);
              this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath"));
            }else if(this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT) === commonConstants.STUDENT_TICKETING_APP_TYPE){
              this.setState({isTokenValid : 'Student'}); 
              let user = {};
              user.firstName = response.content.firstName;
              user.email = response.content.email;
              this.setState({user : user});
              this.CacheService.setCache('university_code', response.content.universityCode);
              this.CacheService.setCache('student_id', response.content.studentId);
              this.setState({profExpDate : response.content.profileExpireDate});
              this.setState({outcome : 'activated'});
            }else if(this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT) === commonConstants.PAYGO_APP_TYPE){
              this.props.history.push(PAYGO_PATH);
            }
            
            this.setState({isActive : false});
        }).catch(error => {  
            this.setState({isActive : false});        	
            this.setState({isTokenValid : 'Invalid'});
               
            let cacheresponse = JSON.parse(this.CacheService.getCache('response'));
            let msgDesc = this.MessageService.getMessageDesc(cacheresponse.data.msg_code);
          
        if(msgDesc.msg_code == 120){
        this.setState({activateButton : true});}

            this.setState({respMsg : msgDesc.msgValue});  
            if(this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT) === commonConstants.STUDENT_TICKETING_APP_TYPE){
              this.setState({isTokenValid : 'Student'}); 
              this.setState({outcome : 'activatefailed'});
            }
               
    	});
      } else {
          this.setState({isActive : false});                   
      }
    }).catch(error => {
      this.setState({isActive : false});
      this.setState({isTokenValid : 'Invalid'}); 
     // this.setState({activateButton : true});  
      let cacheresponse = JSON.parse(this.CacheService.getCache('response'));
      let msgDesc = this.MessageService.getMessageDesc(cacheresponse.data.msg_code);
      this.setState({respMsg : msgDesc.msgValue});       	
    });
  }

  regenerateVerificationUrl(e) {
    this.setState({isActive : true});
    let request = {};
    request.verificationKey = this.verificationKey;
    request.promoCode =  this.CacheService.getCache('promoCode');    
    this.ValidationService.validateForm('activateuser', request).then(result => {
      this.setState({ validateResponse: result });
      if (this.state.validateResponse.isValid) {
        this.PromotionsService.regenerateVerificationUrl(request).then(response => {
            this.setState({isTokenValid : 'Valid'}); 

            if(this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT) === commonConstants.ETICKETING_APP_TYPE){
              this.props.history.push(ETICKETTING_PATH);
            }else if(this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT) === commonConstants.PROMOTIONS_APP_TYPE){
              this.CacheService.setCache('promoPath', "/specialPromotion-" + response.content.promoCode);
              this.CacheService.setCache('promoCode', response.content.promoCode);
              this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath"));
            }else if(this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT) === commonConstants.STUDENT_TICKETING_APP_TYPE){
              let user = {};
              user.firstName = response.content.firstName;
              user.email = response.content.email;
              this.setState({user : user});
              this.CacheService.setCache('university_code', response.content.universityCode);
              this.CacheService.setCache('student_id', response.content.studentId);
              this.setState({outcome : 'reverification'});
            }else if(this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT) === commonConstants.PAYGO_APP_TYPE){
              this.props.history.push(PAYGO_PATH);
            }
            this.setState({isActive : false});
        }).catch(error => {
          this.setState({isActive : false});          
          this.setState({isTokenValid : 'Invalid'});         
          let cacheresponse = JSON.parse(this.CacheService.getCache('response'));
          let msgDesc = this.MessageService.getMessageDesc(cacheresponse.data.msg_code);
          this.setState({respMsg : msgDesc.msgValue});
            
                   
      });
      } else {
                this.setState({isActive : false});                    

            }
    }).catch(error => {
      this.setState({isActive : false});
      this.setState({isTokenValid : 'Invalid'});          
    });
  } 

  captcha(){
    this.state = {regenerate:false}
}

onLoadRecaptcha() {
  this.recaptcha.current.reset();
}

verifyCallback(recaptchaToken) {
this.setState({ captchaverifyToken: recaptchaToken ,
regenerate:false});
}

clearRecaptchaToken() {
this.setState({ captchaverifyToken: '' ,
regenerate:false});
}


  render() {
        const { t } = this.props;

    return (

      <div id="promo_login" className="">
        <UserAgent>
          {v => {
            this.browser = v.browser.name;
            this.os = v.os.name;
          }}
        </UserAgent>
        <LoadingOverlay
              active={this.state.isActive}
              spinner={<LoadingComponent />}
              >
        {this.state.isTokenValid ==='Invalid' ?
          <div>            
            <div id="promo_msg">
                  <div className="container mt-2 ">
                      <div className="row justify-content-center">
                          <div className="col-md-9 py-4 msg">
                              <p className="fail justify-content-center">Activation Failed</p>
                              <p className="studentMessages text-center"> {this.state.respMsg} </p>
                          <div className="form-group">
                            
                    {this.userConfig['ENABLE_CAPTCHA'] === 'Y' ?
                        <div className="text-center mt-0">
                            <ReCaptcha id="eticket_register_captcha"
                                ref={this.recaptcha}
                                size="normal" 
                                onChange={() =>this.captcha()}
                                data-theme="dark"
                                render="explicit"
                                className="captchaStyle"
                                sitekey={this.userConfig['CAPTCHA_CLIENT_KEY']}                                    
                                onLoadCallback={this.onLoadRecaptcha}
                                verifyCallback={this.verifyCallback}
                                expiredCallback={this.clearRecaptchaToken}

                            />
                        </div> : null}
                          { this.state.activateButton == true ?<button id="promo_regenerate_btn" type="submit" disabled = {this.userConfig['ENABLE_CAPTCHA'] === 'Y' && 
                             (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)} onClick={this.regenerateVerificationUrl}                        
                          className="btn btn-primary btn-lg btn-block login-button register mt-4">{t('label_btn.regenerate')}</button> : null }
                      </div>
                          </div>

                      </div>
                  </div>    

              </div>
            </div> : null}

            {this.state.isTokenValid === 'Student' ?
             <StudentSplashComponent verificationKey = {this.verificationKey} profExpDate={this.state.profExpDate} outcome={this.state.outcome} respMsg={this.state.respMsg}  user={this.state.user} > </StudentSplashComponent>
            : null}


            </LoadingOverlay>
      </div>
      


    );
  }

}

export default withTranslation()(ActivateUserComponent);
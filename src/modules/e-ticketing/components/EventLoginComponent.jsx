import React, { Component } from 'react';
import '../css/eticket-style.scss';
import { EticketingService } from '../services/EticketingService';
import { CacheService } from '../../framework/services/CacheService';
import * as commonConstants from '../../common/services/CommonConstants';
import { ValidationService } from '../../framework/services/ValidationService';
import { Link } from 'react-router-dom';
import { ReCaptcha } from 'react-recaptcha-google'
import  LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';
import { withTranslation } from 'react-i18next';
import {ETICKETTING_PATH} from '../../framework/services/ApplicationConstants';
import { BrowserView} from "react-device-detect";

class EventLoginComponent extends Component  {
  constructor(props) {
    super(props);
     
    this.state = {
      email: '',
      password: '',
      captchaverifyToken : '',
      validateResponse: {},
      user_config : {},
      isActive : true
    }

    this.authenticateUser = this.authenticateUser.bind(this);
    this.EticketingService = new EticketingService();
    this.ValidationService = new ValidationService();
    this.CacheService = new CacheService();
    this.handleChange = this.handleChange.bind(this);
    this.validate = this.validate.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.clearRecaptchaToken = this.clearRecaptchaToken.bind(this);
    
  }


   onLoadRecaptcha() {
      if (this.state.ready) {
          this.recaptcha.current.reset();
      }
   }

    verifyCallback(recaptchaToken) {
        this.setState({captchaverifyToken : recaptchaToken});
    }

    clearRecaptchaToken() {
        this.setState({captchaverifyToken : ''});
    }
 
    componentDidMount() {    
        this.setState({isActive : true});              
        let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        if(app_config !== "undefined") {
            let user_config = JSON.parse(app_config)['home_config']['user_account'];
            this.setState({user_config : user_config});
            if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
               this.recaptcha.current.reset();
            }
        }  
        this.setState({isActive : false});
    }


 
  async handleChange (event){
    await this.setState({ [event.target.name]: event.target.value });
    this.validate();
  }

  onBlur(e) {
    this.validate();
}

validate(){
    
    let request = {};
    
    if(this.state.email !== ''){
    request.email = this.state.email;
    }
    if(this.state.password !== ''){
    request.password = this.state.password; 
    }
    
    this.ValidationService.validateForm('authenticateUser', request).then(result => {

            this.setState({ validateResponse: result });
    }).catch(error => {
        this.setState({isActive : false});
        
    });
}

  authenticateUser = (e) => {
    e.preventDefault();
    this.setState({isActive : true});
    let request = {};
    request.email = this.state.email;
    request.password = this.state.password;
    if(this.state.user_config['ENABLE_CAPTCHA'] === 'Y')
    request.recaptchaResponse = this.state.captchaverifyToken;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.ValidationService.validateForm('authenticateUser', request).then(result => {
      this.setState({ validateResponse: result });
      if(this.state.validateResponse.isValid) {
           this.EticketingService.authenticateUser(request).then(response => {
            this.setState({isActive : false});
            this.CacheService.setCache('loginTime', new Date());
          if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
            this.clearRecaptchaToken();
            this.recaptcha.current.reset();
          }
               this.props.history.push(ETICKETTING_PATH + "/purchase");
            }).catch(error => {
              if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
                this.clearRecaptchaToken();
                this.recaptcha.current.reset();
              }
              this.setState({isActive : false});
          });
      } else {
      
        if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
          this.clearRecaptchaToken();
          this.recaptcha.current.reset();
        }
            this.setState({isActive : false});                    

        }
     
    }).catch(error => {
        this.recaptcha.current.reset();
        this.setState({isActive : false});
        console.log("error Authenticate", error);
    });
  }

  goToRegister = () => {
    this.props.history.push(ETICKETTING_PATH + "/register");
  }


  render() {  
    const { t } = this.props; 
    return (
     <LoadingOverlay
            active={this.state.isActive}
            spinner={<LoadingComponent />}
            >
      <BrowserView>
          <div className="heading">
              <span>{t('label_title.appTypeTitle')}</span>
          </div>
      </BrowserView>
      <div id="eticket-container" className="vh-100">

          <div className="bg mt-n2 col-md-12">
              <div className="container col-md-4 pb-4">
                  <div className="col-md-12 m-auto pt-4">
                      <div className="col-md-12">
                          <form id="eticket-login-form" className="form-horizontal col-md-12 reg p-4" method="post" action="#" onSubmit={this.authenticateUser}>

                            <div className="form-head">
                              <span>{t('label_title.userlogin')}</span>
                            </div>

                            <div className="form-group">
                              <p className="p-2 mt-3">{t('label_title.loginDesc')}</p>
                            </div>
                            <div className="form-group" >
                              <label id="eticket-login-email-lbl" htmlFor="eticket-login-email" className="cols-sm-2 control-label"> {t('label_label.email')}<span className="mandate">*</span> </label>
                              <div className="cols-sm-6">
                                <div className="input-group">
                                  <input type="text" className="form-control App" name="email" id="eticket-login-email"
                                    placeholder={t('label_label.email')} value={this.state.email} onChange={this.handleChange} onBlur={this.onBlur}/>
                                </div>
                                {this.state.validateResponse.email_error === 'required' ?
                                  <span className="form_error"> {t('label_label.emailRequired')} </span> : null}
                                {this.state.validateResponse.email_error === 'minLength' ?
                                  <span className="form_error">{t('label_label.usernameMinlength')}  </span> : null}
                                {this.state.validateResponse.email_error === 'maxLength' ?
                                  <span className="form_error"> {t('label_label.usernameMaxlength')} </span> : null}
                                {this.state.validateResponse.email_error === 'regex' ?
                                  <span className="form_error"> {t('label_label.usernameInvalid')}</span> : null}
                              </div>
                            </div>

                            <div className="form-group" >
                              <label htmlFor="password" className="cols-sm-2 control-label">{t('label_label.password')}<span className="mandate">*</span></label>
                              <div className="cols-sm-6">
                                <div className="input-group">
                                    <input type="password" className="form-control App" name="password" id="eticket-login-password"
                                    placeholder={t('label_label.password')}  value={this.state.password} onChange={this.handleChange} onBlur={this.onBlur}/>
                                </div>
                                {this.state.validateResponse.password_error === 'required' ?
                                  <span className="form_error">{t('label_label.passwordRequired')}  </span> : null}
                                {this.state.validateResponse.password_error === 'minLength' ?
                                  <span className="form_error"> {t('label_label.passwordMinlength')} </span> : null}
                                {this.state.validateResponse.password_error === 'maxLength' ?
                                  <span className="form_error">{t('label_label.passwordMaxlength')} </span> : null}  
                              </div>
                            </div>
                            <div>
                                <Link className="pss p-2" to={ETICKETTING_PATH + '/forgotPassword'}> {t('label_link.forgotPassword')} </Link>                                                                                                
                            </div>

                             { this.state.user_config['ENABLE_CAPTCHA'] === 'Y' ?
                              <div className="text-center" >
                                <ReCaptcha id="promo_login_captcha"
                                  ref={this.recaptcha}
                                  size="normal"
                                  data-theme="dark"
                                  render="explicit"
                                  className="captchaStyle"
                                  sitekey={this.state.user_config['CAPTCHA_CLIENT_KEY']}
                                  onLoadRecaptcha={this.onLoadRecaptcha}
                                  verifyCallback={this.verifyCallback}
                                  expiredCallback={this.clearRecaptchaToken}
                                />
                                </div> : null}

                            <div className="form-group mt-4">
                              <button type="submit"
                                className="btn btn-primary btn-lg btn-block login-button register"> {t('label_btn.login')}</button>
                            </div>
                            <div className="form-group mt-4">
                              <button  onClick={this.goToRegister}
                                className="btn btn-outline-primary btn-lg btn-block login-button"> {t('label_btn.register')} </button>

                            </div>

                          </form>
                      </div>
                    
                  </div>
                </div>
            </div>
        </div>
        </LoadingOverlay>
        );
      }
    
    }
 
export default withTranslation()(EventLoginComponent);
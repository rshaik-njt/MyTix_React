
import React from 'react';
import '../css/Promo-style.scss';
import { ReCaptcha } from 'react-recaptcha-google';
import { PROMOTIONS_PATH } from '../../framework/services/ApplicationConstants';
import { MessageService } from '../../framework/services/MessageService';
import { PromotionsService } from '../services/PromotionsService';
import { CommonService } from '../../common/services/CommonService';
import { CacheService } from '../../framework/services/CacheService';
import * as commonConstants from '../../common/services/CommonConstants';
import { ValidationService } from '../../framework/services/ValidationService';
import PromoSplashComponent  from './PromoSplashComponent';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import LoadingOverlay from 'react-loading-overlay'
import LoadingComponent from '../../common/components/LoadingComponent';


const contentStyle = {
  width: "80%",
  margin: "auto"
};

class PromoLoginComponent extends React.Component {
  constructor(props) {
    super(props);
    this.CacheService = new CacheService(); 
    this.state = {
      email: '',
      password: '',
      captchaverifyToken: '',
      validateResponse: {},
      isValidPromo : "YES",
      isActive : true,
      user_config : {},
      userType : "0"
    };
    this.campText = {};
    this.homeimgUrl = '';
    this.recaptcha = React.createRef();
    this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validate = this.validate.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.clearRecaptchaToken = this.clearRecaptchaToken.bind(this);
    this.authenticateUser = this.authenticateUser.bind(this);
    this.PromotionsService = new PromotionsService();
    this.CommonService = new CommonService();
    this.ValidationService = new ValidationService();
    this.MessageService = new MessageService();
    this.CacheService = new CacheService();   
  }

  componentDidMount() {
    this.setState({isActive : true});

    this.CacheService.removeDataFromCache('ticket_data');

     let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
     if(app_config !== "undefined") {
         this.setState({isValidPromo : "YES"});
         let campaignText = JSON.parse(app_config)['promo_config']['campaignText'];
         this.campText = JSON.parse(campaignText);
         let user_config = JSON.parse(app_config)['home_config']['user_account'];
         this.setState({user_config : user_config});
         this.homeimgUrl  = user_config['HOME_IMAGE_URL'] +'?v=' + Date.now();
         this.CacheService.setCache('HOME_IMAGE_URL', this.homeimgUrl);
         this.CacheService.setCache('WELCOME_IMAGE_URL', user_config['WELCOME_IMAGE_URL']);
         let isNewUser = this.CacheService.getCache('isNewUser');
         let userType = JSON.parse(app_config)['promo_config']['userType'];
         let balancecount = JSON.parse(app_config)['promo_config']['balancecount'];
         if(Number(balancecount) <= 0) {
            this.setState({isValidPromo : 'EXCEEDED'});
         }
         this.setState({userType : userType});
          if(isNewUser !== 'YES' && userType ===  "1") {
              this.MessageService.setMessageToDisplay(182);
              this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath") + '/register');
          } else if(userType ===  "2") {
            this.MessageService.setMessageToDisplay(181);
          } 
         this.setState({isActive : false});
     } else {
        this.setState({isValidPromo : 'EXPIRED'});
        this.setState({isActive : false});

     }

      if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
           this.recaptcha.current.reset();
      }
  }

  onLoadRecaptcha() {
    if (this.state.ready && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
      this.recaptcha.current.reset();
    }
  }

  verifyCallback(recaptchaToken) {
    this.setState({ captchaverifyToken: recaptchaToken });
  }

  clearRecaptchaToken() {
    this.setState({ captchaverifyToken: '' });
  }

  async handleChange(e) {
    const { name, value } = e.target;
    await this.setState({ [name]: value });
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
    
    this.ValidationService.validateForm('authenticatePromoUser', request).then(result => {

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
    request.promoCode = this.CacheService.getCache('promoCode');
    if(this.state.user_config['ENABLE_CAPTCHA'] === 'Y')
            request.recaptchaResponse = this.state.captchaverifyToken;
    request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
    this.ValidationService.validateForm('authenticatePromoUser', request).then(result => {
      this.setState({ validateResponse: result });
      if (this.state.validateResponse.isValid) {
        this.PromotionsService.authenticateUser(request).then(response => {
          this.setState({isActive : false});
          this.CacheService.setCache('loginTime', new Date());
          if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
            this.clearRecaptchaToken();
            this.recaptcha.current.reset();
          }
          this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath") + '/purchase');
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
    this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath") + '/register');
  }

  render() {
    const { t } = this.props;
    return (
      <LoadingOverlay
              active={this.state.isActive}
              spinner={<LoadingComponent />}
              >
      <div id="promo_login" className="">
        
        {this.state.isValidPromo === "YES" ?       
        <div> 
          <img id="promo_login_banner" className="d-block w-100" src={this.homeimgUrl} alt="Second slide"></img>

          <div className="row" style={contentStyle} >
            <div className="col-md-4 m-3">
              <form className="form-horizontal reg p-4" method="post" action="#" onSubmit={this.authenticateUser}>
                <div className="form-head">
                  <span>{t('label_title.userlogin')}</span>
                </div>
                <div className="form-group">
                  <p className="p-2 mt-3">{t('label_title.loginDesc')}</p>
                </div>
                <div className="form-group">
                  <label id="promo_login_email_lbl" htmlFor="promo_login_email" className="cols-sm-2 control-label"> {t('label_label.email')}<span className="mandate">*</span> </label>
                  <div className="cols-sm-6">
                    <div className="input-group">
                        <input type="text" className="form-control App" name="email" id="promo_login_email"
                        placeholder={t('label_label.email')} onChange={this.handleChange} onBlur={this.onBlur}/>
                    </div>
                    {this.state.validateResponse.email_error === 'required' ?
                      <span className="form_error">{t('label_label.emailRequired')} </span> : null}
                    {this.state.validateResponse.email_error === 'minLength' ?
                      <span className="form_error"> {t('label_label.usernameMinlength')} </span> : null}
                    {this.state.validateResponse.email_error === 'maxLength' ?
                      <span className="form_error"> {t('label_label.username.Maxlength')} </span> : null}
                    {this.state.validateResponse.email_error === 'regex' ?
                      <span className="form_error"> {t('label_label.username.Invalid')}</span> : null}
                  </div>
                </div>

                <div className="form-group">
                  <label id="promo_login_password_lbl" htmlFor="promo_login_password" className="cols-sm-2 control-label">{t('label_label.password')}<span className="mandate">*</span> </label>
                  <div className="cols-sm-6">
                    <div className="input-group">
                      
                      <input type="password" className="form-control App" name="password" id="promo_login_password"
                        placeholder={t('label_label.password')} onChange={this.handleChange} onBlur={this.onBlur} autoComplete="off" />
                    </div>
                    {this.state.validateResponse.password_error === 'required' ?
                      <span className="form_error"> {t('label_label.passwordRequired')} </span> : null}
                    {this.state.validateResponse.password_error === 'minLength' ?
                      <span className="form_error"> {t('label_label.passwordMinlength')} </span> : null}
                    {this.state.validateResponse.password_error === 'maxLength' ?
                      <span className="form_error"> {t('label_label.passwordMaxlength')} </span> : null}  
                  </div>
                </div>
                <div>
                  <Link className="pss p-2" to={PROMOTIONS_PATH + this.CacheService.getCache("promoPath") + '/forgotPassword'}> {t('label_link.forgotPassword')} </Link>
                </div> 

                 { this.state.user_config['ENABLE_CAPTCHA'] === 'Y' ?
                  <div className="text-center mt-3" >
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
                  disabled={this.state.user_config['ENABLE_CAPTCHA'] === 'Y' && (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)}

                    className="btn btn-primary btn-lg btn-block">{t('label_btn.login')}</button>
                </div>
                { this.state.userType !== "2" ?
                <div className="form-group mt-4">
                  <button type="submit" onClick={this.goToRegister}                 
                    className="btn btn-secondary btn-lg btn-block">
                    {t('label_btn.register')} </button>
                </div> :null }
               
              </form>
            </div>

            <div className="col-md-7 m-3 reg adv" > 
          
                <div className="m-4">
                    <span className="row form-head text-center"> <b> {this.campText.header} </b> </span> 
                    <span className="row prTitle mt-4">{this.campText.body}</span>
                </div>
 
               
              <p>&nbsp;</p>

            </div>
          </div>

          </div> : <PromoSplashComponent status={this.state.isValidPromo}></PromoSplashComponent> }

      </div>
      </LoadingOverlay>


    );
  }

}

export default withTranslation()(PromoLoginComponent);
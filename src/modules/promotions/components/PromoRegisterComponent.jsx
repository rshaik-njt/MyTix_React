
import React, { Component } from 'react';
import '../css/Promo-style.scss';
import { ReCaptcha } from 'react-recaptcha-google'
import { CacheService } from '../../framework/services/CacheService';
import { PROMOTIONS_PATH } from '../../framework/services/ApplicationConstants';
import { MessageService } from '../../framework/services/MessageService';
import { PromotionsService } from '../services/PromotionsService';
import { CommonService } from '../../common/services/CommonService';
import * as commonConstants from '../../common/services/CommonConstants';
import { ValidationService } from '../../framework/services/ValidationService';
import { withTranslation } from 'react-i18next';
import LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';


const contentStyle = {
    width: "80%",
    margin: "auto"
};

class PromoRegisterComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNo: '',
            zipCode: '',
            validateResponse: {},
            isPwdsSame: 'YES',
            captchaverifyToken : '',
            user_config : {},
            confirmEmail : '',
            campaignText : '',
            isActive : true,
            isValidPromo : "YES",
            isUserRegistered : false,
            user : ''

        }
        this.homeimgUrl = '';
        this.campText = {};
        this.recaptcha = React.createRef();
        this.CommonService = new CommonService();
        this.CacheService = new CacheService();
        this.ValidationService = new ValidationService();
        this.PromotionsService = new PromotionsService();
        this.register = this.register.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste =this.onPaste.bind(this);
        this.validate = this.validate.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);
        this.MessageService = new MessageService();

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

    componentDidMount() {
        if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
            this.recaptcha.current.reset();
        }  

         let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
         if(app_config !== "undefined") {
             let campaignText = JSON.parse(app_config)['promo_config']['campaignText'];
             this.campText = JSON.parse(campaignText);    
             let userType = JSON.parse(app_config)['promo_config']['userType'];
             let user_config = JSON.parse(app_config)['home_config']['user_account'];
             this.setState({user_config : user_config});
             this.homeimgUrl  = user_config['HOME_IMAGE_URL'] +'?v=' + Date.now();
             this.CacheService.setCache('HOME_IMAGE_URL', this.homeimgUrl);
             this.CacheService.setCache('WELCOME_IMAGE_URL', user_config['WELCOME_IMAGE_URL']);
             let balancecount = JSON.parse(app_config)['promo_config']['balancecount'];
             if(Number(balancecount) <= 0) {
                this.setState({isValidPromo : 'EXCEEDED'});
             }
            if(userType ===  "2") {
                this.MessageService.setMessageToDisplay(181);
                this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath"));
            } else if(userType ===  "1") {
                this.MessageService.setMessageToDisplay(182);            
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

 
    register(e) {
        e.preventDefault();
        this.setState({ isemailSame: 'YES' });  
        this.setState({ isPwdsSame: 'YES' });
        this.setState({isUserRegistered : false});
        let validateResponse = {};
        this.setState({validateResponse : validateResponse});
        if(this.state.email !== this.state.confirmEmail || this.state.password !== this.state.confirmPassword) {
            let isemailSame = this.state.email !== this.state.confirmEmail ? 'NO' : 'YES';
            let isPwdsSame = this.state.password !== this.state.confirmPassword ? 'NO' : 'YES';
            this.setState({ isemailSame: isemailSame });  
            this.setState({ isPwdsSame: isPwdsSame });
            return;        
        } 
        this.setState({isActive : true});

        this.setState({ submitted: true });
        let request = {};
        request.firstName = this.state.firstName;
        request.lastName = this.state.lastName;
        request.phoneNo = this.state.phoneNo;
        request.email = this.state.email;
        request.password = this.state.password; 
        request.zipCode = this.state.zipCode;
        request.promoCode =  this.CacheService.getCache('promoCode');
        this.setState({user : request.email});
        if(this.state.user_config['ENABLE_CAPTCHA'] === 'Y')
            request.recaptchaResponse = this.state.captchaverifyToken;
            request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.ValidationService.validateForm('registerPromoUser', request).then(result => {
            this.setState({ validateResponse: result });
            if (this.state.validateResponse.isValid) {
                request.phoneNo = this.state.phoneNo.replaceAll('-','');
                request.phoneNo = this.state.phoneNo.replaceAll('(','');
                request.phoneNo = this.state.phoneNo.replaceAll(')','');
                this.PromotionsService.registerUser(request).then(response => {
                this.setState({
                        firstName: '',
                        lastName: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        phoneNo: '',
                        zipCode: '',
                        confirmEmail : ''
                    });
                    if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
                      this.clearRecaptchaToken();
                      this.recaptcha.current.reset();
                    }
                    this.setState({isUserRegistered : true});
                    this.setState({isActive : false});

                }).catch(error => {
                    if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
                      this.clearRecaptchaToken();
                      this.recaptcha.current.reset();
                    }
                    this.setState({isActive : false});
                     
                });
            } else {
                this.setState({isActive : false});
            }
        }).catch(error => {
                    this.setState({isActive : false});
            
        });

    }

    async handleChange(e) {
        e.preventDefault();
        const { name, value } = e.target;
      await this.setState({ [name]: value });
        this.validate();
    }

    onCopy(e){
        e.preventDefault();
        return false;
    }

    onPaste(e){
        e.preventDefault();
        return false;
    }

    onBlur(e) {
        this.validate();
    }

    validate(){
        
        let request = {};
        if(this.state.firstName !== ''){
        request.firstName = this.state.firstName;
        }
        if(this.state.lastName !== ''){
        request.lastName = this.state.lastName;
        }
        if(this.state.phoneNo !== ''){
        request.phoneNo = this.state.phoneNo;
        }
        if(this.state.email !== ''){
        request.email = this.state.email;
        }
        if(this.state.password !== ''){
        request.password = this.state.password; 
        }
        if(this.state.zipCode !== ''){
        request.zipCode = this.state.zipCode;
        }
        if(this.state.promoCode !== ''){
            request.promoCode = this.state.promoCode;
        }

        this.ValidationService.validateForm('registerPromoUser', request).then(result => {

                this.setState({ validateResponse: result });
        }).catch(error => {
            this.setState({isActive : false});
            
        });
    }

    goToLogin = () => {
        this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath"));
    }


    render() {
        const { t } = this.props;
        return (
        <LoadingOverlay
              active={this.state.isActive}
              spinner={<LoadingComponent />}
              >
            {!this.state.isUserRegistered ?
            <div id="promo_register">
                
                 {this.state.isValidPromo === "YES" ? 
                 <div>
                    <img id="promo_register_banner_img" className="d-block w-100" src={this.homeimgUrl} alt="Second slide"></img>
                    <div className="row" style={contentStyle}>
                        <div className="col-md-4 m-3">
                            <form className="form-horizontal reg p-4" method="post" action="#" onSubmit={this.register}>
                                <div className="form-head">
                                    <span>{t('label_title.register')}</span>
                                </div>
                                <div className="form-group mt-4">
                                    <label htmlFor="name" className="cols-sm-2 control-label">{t('label_label.firstName')}<span className="mandate">*</span></label>
                                    <div className="cols-sm-6">
                                        <div className="input-group">
                                            
                                            <input type="text" className="form-control App" name="firstName" id="promo-register-fname"
                                                placeholder={t('label_label.firstName')} value={this.state.firstName} onChange={this.handleChange} onBlur={this.onBlur}/>
                                        </div>

                                        {this.state.validateResponse.firstName_error === 'required' ?
                                            <span className="form_error">{t('label_label.firstNameRequired')}</span> : null}
                                        {this.state.validateResponse.firstName_error === 'minLength' ?
                                            <span className="form_error">{t('label_label.firstNameMinlength')} </span> : null}
                                        {this.state.validateResponse.firstName_error === 'maxLength' ?
                                            <span className="form_error">{t('label_label.firstNameMaxlength')} </span> : null}
                                        {this.state.validateResponse.firstName_error === 'regex' ?
                                            <span className="form_error"> {t('label_label.firstNameInvalid')}</span> : null}

                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="name" className="cols-sm-2 control-label">{t('label_label.lastName')}<span className="mandate">*</span></label>
                                    <div className="cols-sm-6">
                                        <div className="input-group">
                                            
                                            <input type="text" className="form-control App" name="lastName" id="promo-register-lname"
                                                placeholder={t('label_label.lastName')} value={this.state.lastName} onChange={this.handleChange} onBlur={this.onBlur}/>
                                        </div>
                                        {this.state.validateResponse.lastName_error === 'required' ?
                                            <span className="form_error"> {t('label_label.lastNameRequired')}</span> : null}
                                        {this.state.validateResponse.lastName_error === 'minLength' ?
                                            <span className="form_error">{t('label_label.lastNameMinlength')}  </span> : null}
                                        {this.state.validateResponse.lastName_error === 'maxLength' ?
                                            <span className="form_error">{t('label_label.lastNameMaxlength')} </span> : null}
                                        {this.state.validateResponse.lastName_error === 'regex' ?
                                            <span className="form_error">{t('label_label.lastNameInvalid')} </span> : null}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label id="promo_register_email_lbl" htmlFor="promo_register_email" className="cols-sm-2 control-label"> {t('label_label.email')}<span className="mandate">*</span></label>
                                    <div className="cols-sm-6">
                                        <div className="input-group">
                                                <input type="text" className="form-control App" name="email" id="promo_register_email" 
                                                placeholder={t('label_label.email')} onCopy={this.onCopy} onPaste={this.onPaste}
                                                 value={this.state.email} onChange={this.handleChange} onBlur={this.onBlur}/>
                                        </div>
                                        {this.state.validateResponse.email_error === 'required' ?
                                            <span className="form_error"> {t('label_label.emailRequired')} </span> : null}
                                        {this.state.validateResponse.email_error === 'minLength' ?
                                            <span className="form_error"> {t('label_label.emailMinlength')}. </span> : null}
                                        {this.state.validateResponse.email_error === 'maxLength' ?
                                            <span className="form_error">{t('label_label.emailMaxlength')} </span> : null}
                                        {this.state.validateResponse.email_error === 'regex' ?
                                            <span className="form_error"> {t('label_label.emailInvalid')}</span> : null}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label id="promo_reg_confirmemail_lbl" htmlFor="promo_reg_confirmemail" 
                                    className="cols-sm-2 control-label"> {t('label_label.confitmemail')}<span className="mandate">*</span></label>
                                    <div className="cols-sm-6">
                                        <div className="input-group">
                                            
                                            <input type="text" className="form-control App" autoComplete="off" name="confirmEmail" id="promo_reg_confirmemail"
                                                placeholder={t('label_label.confitmemail')} onCopy={this.onCopy} onPaste={this.onPaste}
                                                 value={this.state.confirmEmail} onChange={this.handleChange} onBlur={this.onBlur}/>
                                        </div>
                                        {this.state.isemailSame === 'NO' ?
                                            <span className="form_error">  {t('label_label.emailMatch')} </span> :
                                        <div>
                                        {this.state.validateResponse.email_error === 'required' ?
                                            <span className="form_error"> {t('label_label.emailRequired')} </span> : null}
                                        {this.state.validateResponse.email_error === 'minLength' ?
                                            <span className="form_error"> {t('label_label.emailMinlength')}. </span> : null}
                                        {this.state.validateResponse.email_error === 'maxLength' ?
                                            <span className="form_error">{t('label_label.emailMaxlength')} </span> : null}
                                        {this.state.validateResponse.email_error === 'regex' ?
                                            <span className="form_error"> {t('label_label.emailInvalid')}</span> : null}
                                        </div>
                                        }
                                    </div>
                                </div>



                                <div className="form-group">
                                    <label id="promo_register_password_lbl" htmlFor="promo_register_password" className="cols-sm-2 control-label">{t('label_label.password')} <span className="mandate">*</span></label>
                                    <div className="cols-sm-6">
                                        <div className="input-group">
                                            
                                            <input type="password" autoComplete="off" className="form-control App" name="password" id="promo_register_password"
                                                placeholder={t('label_label.password')} onChange={this.handleChange} onBlur={this.onBlur}/>
                                        </div>
                                        {this.state.validateResponse.password_error === 'required' ?
                                            <span className="form_error"> {t('label_label.passwordRequired')} </span> : null}
                                        {this.state.validateResponse.password_error === 'minLength' ?
                                            <span className="form_error"> {t('label_label.passwordMinlength')} </span> : null}
                                        {this.state.validateResponse.password_error === 'maxLength' ?
                                            <span className="form_error"> {t('label_label.passwordMaxlength')} </span> : null}
                                        {this.state.validateResponse.password_error === 'regex' ?
                                            <span className="form_error">{t('label_label.passwordInvalid')} </span> : null}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirm" className="cols-sm-2 control-label">{t('label_label.verifyPassword')} 
                                    <span className="mandate">*</span></label>
                                    <div className="cols-sm-6">
                                        <div className="input-group">
                                            
                                            <input type="password" autoComplete="off" className="form-control App" name="confirmPassword" id="promo-register-confirmpassword"
                                                placeholder={t('label_label.verifyPassword')} onChange={this.handleChange}  onBlur={this.onBlur}/>
                                        </div>

                                        {this.state.isPwdsSame === 'NO' ?
                                            <span className="form_error">  {t('label_label.passwordMatch')} </span> :
                                        <div>
                                            {this.state.validateResponse.password_error === 'required' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordRequired')}  </span> : null}
                                            {this.state.validateResponse.password_error === 'minLength' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordMinlength')} </span> : null}
                                            {this.state.validateResponse.password_error === 'maxLength' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordMaxlength')} </span> : null}
                                            {this.state.validateResponse.password_error === 'regex' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordInvalid')}</span> : null}
                                        </div>
                                        }
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirm" className="cols-sm-2 control-label"> {t('label_label.phone')}<span className="mandate">*</span></label>
                                    <div className="cols-sm-6">
                                        <div className="input-group">
                                               <input type="phone" className="form-control App" name="phoneNo" id="promo-register-phone"
                                                placeholder={t('label_label.phone')} value={this.state.phoneNo} onChange={this.handleChange} onBlur={this.onBlur}/>
                                        </div>
                                    </div>
                                    {this.state.validateResponse.phoneNo_error === 'required' ?
                                        <span className="form_error"> {t('label_label.phoneRequired')}  </span> : null}
                                    {this.state.validateResponse.phoneNo_error === 'minLength' ?
                                        <span className="form_error"> {t('label_label.phoneMinlength')} </span> : null}
                                    {this.state.validateResponse.phoneNo_error === 'maxLength' ?
                                        <span className="form_error">{t('label_label.phoneMaxlength')} </span> : null}
                                    {this.state.validateResponse.phoneNo_error === 'regex' ?
                                        <span className="form_error"> {t('label_label.phoneInvalid')}</span> : null}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirm" className="cols-sm-2 control-label">{t('label_label.zip')}<span className="mandate">*</span></label>
                                    <div className="cols-sm-6">
                                        <div className="input-group">
                                            
                                            <input type="zip" className="form-control App" name="zipCode" id="promo-register-zip"
                                                placeholder={t('label_label.zip')} value={this.state.zipCode} onChange={this.handleChange} onBlur={this.onBlur}/>
                                        </div>
                                    </div>
                                    {this.state.validateResponse.zipCode_error === 'required' ?
                                        <span className="form_error"> {t('label_label.zipRequired')}</span> : null}
                                    {this.state.validateResponse.zipCode_error === 'minLength' ?
                                        <span className="form_error"> {t('label_label.zipMinlength')} </span> : null}
                                    {this.state.validateResponse.zipCode_error === 'maxLength' ?
                                        <span className="form_error"> {t('label_label.zipMaxlength')} </span> : null}
                                    {this.state.validateResponse.zipCode_error === 'regex' ?
                                        <span className="form_error"> {t('label_label.zipInvalid')} </span> : null}
                                </div>
 
                                 <p className="p-2 mt-3 pnotes"> {t('label_password.note')}  </p> 
                                  { this.state.user_config['ENABLE_CAPTCHA'] === 'Y' ?
                                <div className="text-center">
                                    <ReCaptcha id="promo_register_captcha"
                                        ref={this.recaptcha}
                                        size="normal"
                                        data-theme="dark"
                                        render="explicit"
                                        className="captchaStyle"
                                        sitekey={this.state.user_config['CAPTCHA_CLIENT_KEY']}                                    
                                        onLoadCallback={this.onLoadRecaptcha}
                                        verifyCallback={this.verifyCallback}
                                        expiredCallback={this.clearRecaptchaToken}

                                    />
                                </div> : null}
                                <div className="form-group">
                                    <button id="promo_register_btn" type="submit" onClick={this.onSubmit}
                                    disabled={this.state.user_config['ENABLE_CAPTCHA'] === 'Y' && (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)}
                                    className="btn btn-primary btn-lg btn-block login-button register mt-4">{t('label_btn.register')}</button>
                                </div>
                                <div className="form-group">
                                    <button id="promo_login_btn" onClick={this.goToLogin}
                                    className="btn btn-secondary btn-lg btn-block login-button register mt-4">{t('label_btn.login')}</button>
                                </div>
                                
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
                </div> : <div id="promo_msg">
                
                <div className="container mt-2 ">
                    <div className="row justify-content-center">
                        {this.state.isPwdsSame === 'EXPIRED' ?
                            <div className="msg">
                                <span className="fail"> {t('label_label.promoExpiredTtl')} </span>
                                <p className="text1"> {t('label_label.promoExpired')} </p>
                            </div> :

                             <div className="msg">
                                <span className="fail"> {t('label_label.promoExceededTtl')} </span>
                                <p className="text1"> {t('label_label.promoExceeded')}  </p>
                            </div> }

                    </div>
                </div>    
            </div>}
            </div>
            :
            <div>
                <img id="promo_register_banner_img" className="d-block w-100" src={this.homeimgUrl} alt="Second slide"></img>
                <div id="promo_msg">
                    <div className="container mt-2 ">
                        <div className="row justify-content-center">
                            <div className="splashDiv">
                                <span className="successIcon"> 
                                <i className="fa fa-check-circle"></i> </span>
                                <span className="splashHeadingMessages">Registration Successful</span>
                                <p className="splashMessages">A verification link has been sent to <strong> {this.state.user}</strong>.</p>
                                <p className="splashMessages">Please allow 5 minutes for this message to arrive.</p>

                            </div>
                        </div>
                    </div>    
                </div>
            </div> }
            </LoadingOverlay>
        );
    }
}

export default withTranslation()(PromoRegisterComponent);
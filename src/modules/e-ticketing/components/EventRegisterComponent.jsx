import React, { Component } from 'react';
import '../css/eticket-style.scss';
import { UserAgent } from 'react-ua'
import { EticketingService } from '../services/EticketingService';
import { CacheService } from '../../framework/services/CacheService';
import * as commonConstants from '../../common/services/CommonConstants';
import { CommonService } from '../../common/services/CommonService';
import { ValidationService } from '../../framework/services/ValidationService';
import { ReCaptcha } from 'react-recaptcha-google';
import  LoadingComponent from '../../common/components/LoadingComponent';
import { withTranslation } from 'react-i18next';
import LoadingOverlay from 'react-loading-overlay';
import {ETICKETTING_PATH} from '../../framework/services/ApplicationConstants';

class EventRegisterComponent extends Component {
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
            isPwdsSame : 'YES',
            user_config : {},
            isActive : true
        }
         
        this.CommonService = new CommonService();  
        this.CacheService = new CacheService();
        this.EticketingService = new EticketingService();
        this.ValidationService = new ValidationService();
        this.register = this.register.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste =this.onPaste.bind(this);
        this.validate = this.validate.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);
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

        this.ValidationService.validateForm('registerWebUser', request).then(result => {

                this.setState({ validateResponse: result });
        }).catch(error => {
            this.setState({isActive : false});
            
        });
    }

    goToLogin = () => {
        this.props.history.push(ETICKETTING_PATH);
     }

     register(e) {
        e.preventDefault();
        this.setState({ isPwdsSame: 'YES' });
        this.setState({isUserRegistered : false});
        let validateResponse = {};
        this.setState({validateResponse : validateResponse});
        if(this.state.password !== this.state.confirmPassword) {
            let isPwdsSame = this.state.password !== this.state.confirmPassword ? 'NO' : 'YES';
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
        this.setState({user : request.email});
        if(this.state.user_config['ENABLE_CAPTCHA'] === 'Y')
            request.recaptchaResponse = this.state.captchaverifyToken;
            request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.ValidationService.validateForm('registerWebUser', request).then(result => {
            this.setState({ validateResponse: result });
            if (this.state.validateResponse.isValid) {
                request.phoneNo = this.state.phoneNo.replaceAll('-','');
                request.phoneNo = this.state.phoneNo.replaceAll('(','');
                request.phoneNo = this.state.phoneNo.replaceAll(')','');
                this.EticketingService.registerUser(request).then(response => {
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
    

    render() {
        const { t } = this.props;
        return (
          
            <div id="eticket-register" className="vh-100">               
                
                    <div className="heading">
                        <span>{t('label_title.appTypeTitle')}</span>
                    </div>
                    <LoadingOverlay
                    active={this.state.isActive}
                    spinner={<LoadingComponent />} >
                    <div className="bg mt-n2 col-md-12">
                        <div className="container col-md-5 pb-4">
                            <div className="col-md-12 m-auto pt-4">
                                <div className="col-md-12">
                                    <form id="eticket-register-form" className="form-horizontal col-md-12 reg p-4" method="post" action="#" onSubmit={this.register}>
                                        <div className="form-head">
                                            <span>{t('label_title.register')}</span>
                                        </div>
                                        <div className="form-group mt-4">
                                            <label htmlFor="name" className="cols-sm-2 control-label">{t('label_label.firstName')}<span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                                                    <input type="text" className="form-control App" name="firstName" id="eticket-register-fname"
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
                                                    <input type="text" className="form-control App" name="lastName" id="eticket-register-lname"
                                                        placeholder={t('label_label.lastName')} value={this.state.lastName} onChange={this.handleChange} onBlur={this.onBlur} />
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
                                            <label htmlFor="email" className="cols-sm-2 control-label">{t('label_label.email')} <span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                                                    <input type="text" className="form-control App" name="email" id="eticket-register-email"
                                                        placeholder={t('label_label.email')} onCopy={this.onCopy} onPaste={this.onPaste}
                                                         value={this.state.email} onChange={this.handleChange} onBlur={this.onBlur}/>
                                                </div>
                                                {this.state.validateResponse.email_error === 'required' ?
                                                 <span className="form_error"> {t('label_label.emailRequired')} </span> : null}
                                                 {this.state.validateResponse.email_error === 'minLength' ?
                                                 <span className="form_error"> {t('label_label.usernameMinlength')} </span> : null}
                                                 {this.state.validateResponse.email_error === 'maxLength' ?
                                                    <span className="form_error">{t('label_label.usernameMaxlength')} </span> : null}
                                                 {this.state.validateResponse.email_error === 'regex' ?
                                                    <span className="form_error">{t('label_label.usernameInvalid')} </span> : null}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="password" className="cols-sm-2 control-label">{t('label_label.password')} <span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                                                    <input type="password" className="form-control App" name="password" id="eticket-register-password"
                                                        placeholder={t('label_label.password')} value={this.state.password} onChange={this.handleChange} onBlur={this.onBlur}/>
                                                </div>
                                                {this.state.validateResponse.password_error === 'required' ?
                                                <span className="form_error"> {t('label_label.passwordRequired')} </span> : null}
                                                 {this.state.validateResponse.password_error === 'minLength' ?
                                                <span className="form_error"> {t('label_label.passwordMinlength')} </span> : null}
                                                 {this.state.validateResponse.password_error === 'maxLength' ?
                                                <span className="form_error">{t('label_label.passwordMaxlength')} </span> : null}
                                                 {this.state.validateResponse.password_error === 'regex' ?
                                                <span className="form_error"> {t('label_label.passwordInvalid')} </span> : null}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirm" className="cols-sm-2 control-label">{t('label_label.verifyPassword')} <span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                                                    <input type="password" className="form-control App" name="confirmPassword" id="eticket-register-confirmpassword"
                                                        placeholder={t('label_label.verifyPassword')} value={this.state.confirmPassword} onChange={this.handleChange} onBlur={this.onBlur}/>
                                                </div>

                                                {this.state.validateResponse.password_error === 'required' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordRequired')}  </span> : null}
                                                {this.state.validateResponse.password_error === 'minLength' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordMinlength')} </span> : null}
                                                {this.state.validateResponse.password_error === 'maxLength' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordMaxlength')} </span> : null}
                                                {this.state.validateResponse.password_error === 'regex' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordInvalid')}</span> : null}
                                                {this.state.isPwdsSame === 'NO' ?
                                                    <span className="form_error">  {t('label_label.passwordMatch')} </span> : null}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirm" className="cols-sm-2 control-label"> {t('label_label.phone')}<span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                                                    <input type="phone" className="form-control App" name="phoneNo" id="eticket-register-phone"
                                                        placeholder={t('label_label.phone')} value={this.state.phoneNo} onChange={this.handleChange} onBlur={this.onBlur} />
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
                                                    <input type="zip" className="form-control App" name="zipCode" id="eticket-register-zip"
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
                                            <ReCaptcha id="eticketing_register_captcha"
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

                                        
                                        <div className="form-group ">
                                            <button type="submit" className="btn btn-primary btn-lg btn-block login-button register mt-4">{t('label_btn.register')}</button>
                                        </div>

                                        <div className="form-group">
                                        <button onClick={this.goToLogin} className="btn btn-outline-primary btn-lg btn-block login-button mt-4"> {t('label_btn.login')}</button>
                                        </div>

                                    </form>

                                </div>
                            </div>


                        </div>
                    </div>
                    </LoadingOverlay>
                </div>
        );
    }
}

export default withTranslation()(EventRegisterComponent);
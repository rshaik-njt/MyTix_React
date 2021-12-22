
import React, { Component } from 'react';
import { PAYGO_PATH,ETICKETTING_PATH,STUDENTTICKET_PATH,PROMOTIONS_PATH } from '../../framework/services/ApplicationConstants';
import { ReCaptcha } from 'react-recaptcha-google';
import { CacheService } from '../../framework/services/CacheService';
import { MessageService } from '../../framework/services/MessageService';
import * as commonConstants from '../services/CommonConstants';
import { withTranslation } from 'react-i18next';
import { ValidationService } from '../../framework/services/ValidationService';
import  LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';
import { UserManagementService } from '../services/UserManagementService';
import StudentSplashComponent from '../../student-Ticketing/components/StudentSplashComponent';
import PromoSplashComponent from '../../promotions/components/PromoSplashComponent';
import EticketSplashComponent from '../../e-ticketing/components/EticketSplashComponent';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import {Card, Button, OverlayTrigger,Tooltip} from 'react-bootstrap';
import {Password} from 'primereact/password';
// import { Tooltip } from 'primereact/tooltip';
// import { InputText } from 'primereact/inputtext';

class RegisterComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            register_firstName: '',
            register_lastName: '',
            register_email:'',
            register_confirmemail: '',
            register_password: '',
            register_verifypassword:'',
            register_phone:'',
            register_zip:'',
            regenerate:true,
            isemailSame : 'YES',
            user_config : {},
            validateResponse: {},
            validateScreenName: '',
            isPwdsSame: 'YES',
            outcome : 'init',
            respMsg : '',
            user : {},
            captchaverifyToken : ''
        }
        this.userConfig = {};   
        this.campText = {};     
        this.isValidPromo = 'YES';
        this.CacheService = new CacheService();
        let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        if(app_config !== "undefined") {
            this.userConfig  = JSON.parse(app_config)['home_config']['user_account'];  
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
                let balancecount = JSON.parse(app_config)['promo_config']['balancecount'];
                let isExpired = JSON.parse(app_config)['promo_config']['isExpired'];

                let campaignText = JSON.parse(app_config)['promo_config']['campaignText'];
                this.campText = JSON.parse(campaignText);

                if(Number(balancecount) <= 0) {
                    this.isValidPromo = 'EXCEEDED';
                }    
                if(isExpired === 'Y'){
                    this.isValidPromo = 'EXPIRED';
                }            
            }
        }else{
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
                this.isValidPromo = 'INVALID';
            }
        }
        this.homeimgUrl='';        
        
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.MessageService = new MessageService();
        this.verifyCallback = this.verifyCallback.bind(this);
        this.recaptcha = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste =this.onPaste.bind(this);
        this.validate = this.validate.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.ValidationService = new ValidationService();
        this.register = this.register.bind(this);
        this.UserManagementService = new UserManagementService();
    }

    componentDidMount() {
        this.setState({isActive : true});

        if(this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE){
            this.setState({validateScreenName : 'registerWebUser'});
        }else if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE){
            this.setState({validateScreenName : 'registerStudentUser'});
        }else if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
            this.setState({validateScreenName : 'registerPromoUser'});
        }else{

        }

        let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        if(app_config !== "undefined") {
           let user_config = JSON.parse(app_config)['home_config']['user_account'];
            this.setState({user_config : user_config});
            this.homeimgUrl  = user_config['HOME_IMAGE_URL'];
            this.CacheService.setCache('HOME_IMAGE_URL', this.homeimgUrl+'?v=' + Date.now());
            this.CacheService.setCache('WELCOME_IMAGE_URL', user_config['WELCOME_IMAGE_URL']+'?v=' + Date.now());
            if (this.state.user_config['ENABLE_CAPTCHA'] !== 'Y') {
                this.setState({regenerate : false });
            } else {
                this.setState({regenerate : true });
            }
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
                let campaignText = JSON.parse(app_config)['promo_config']['campaignText'];
                this.campText = JSON.parse(campaignText);    
                let userType = JSON.parse(app_config)['promo_config']['userType'];
                let balancecount = JSON.parse(app_config)['promo_config']['balancecount'];
                let isExpired = JSON.parse(app_config)['promo_config']['isExpired'];
                if(Number(balancecount) <= 0) {
                    this.isValidPromo = 'EXCEEDED';
                }
                if(isExpired === 'Y'){
                    this.isValidPromo = 'EXPIRED';
                }

                if(userType ===  "2") {
                    this.MessageService.setMessageToDisplay(181);
                    this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath"));
                } else if(userType ===  "1") {
                    this.MessageService.setMessageToDisplay(182);            
                }   
            } 
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE && 
                user_config['IS_VALID_SCHOOL'] === "N"){
                this.setState({outcome : 'invalidSchool'});
            }
           
           if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
               this.recaptcha.current.reset();
           }  
           this.setState({isActive : false});
       } else {
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
                this.isValidPromo = 'INVALID';
            }            
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE){
            this.setState({outcome : 'invalidSchool'});
            }
            this.setState({isActive : false});
       }
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
  
    captcha(){
        
      this.setState({regenerate:false});
    
    }

    renderTooltip = (props) => (
        
        <Tooltip className="mytooltip1 text-left" id="button-tooltip" effect="solid" {...props}>
        <PasswordStrengthMeter password = {this.state.register_password}></PasswordStrengthMeter>
        {this.state.register_password === "" ?
          <label className="cols-sm-2 control-label text-black"> Note : Password is case sensitive and must be at least 8 characters and contain at least one lowercase letter, one uppercase letter, one number, and one symbol from the following @#$&=+</label>    
        :null}                         
        </Tooltip>
      );

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
        if(this.state.register_firstName !== ''){
        request.firstName = this.state.register_firstName;
        }
        if(this.state.register_lastName !== ''){
        request.lastName = this.state.register_lastName;
        }
        if(this.state.register_phone !== ''){
        request.phoneNo = this.state.register_phone;
        }
        if(this.state.register_email !== ''){
        request.email = this.state.register_email;
            if(this.state.register_confirmemail !== ''){
            let isemailSame = this.state.register_email !== this.state.register_confirmemail ? 'NO' : 'YES'; 
            this.setState({ isemailSame: isemailSame });     
            }         
        }
        if(this.state.register_password !== ''){
        request.password = this.state.register_password; 
            if(this.state.register_verifypassword !== ''){
            let isPwdsSame = this.state.register_password !== this.state.register_verifypassword ? 'NO' : 'YES';
            this.setState({ isPwdsSame: isPwdsSame });
            }
        }
        if(this.state.register_zip !== ''){
        request.zipCode = this.state.register_zip;
        }
        // if(this.state.promoCode !== ''){
        //     request.promoCode = this.CacheService.getCache('promoCode');;
        // }

        this.ValidationService.validateForm(this.state.validateScreenName, request).then(result => {

                this.setState({ validateResponse: result });
        }).catch(error => {
            this.setState({isActive : false});
            
        });
    }


    register(e){
        e.preventDefault();
        this.setState({ isemailSame: 'YES' });  
        this.setState({ isPwdsSame: 'YES' });
        let validateResponse = {};
        this.setState({validateResponse : validateResponse});
        if(this.state.register_email !== this.state.register_confirmemail || this.state.register_password !== this.state.register_verifypassword) {
            let isemailSame = this.state.register_email !== this.state.register_confirmemail ? 'NO' : 'YES';
            let isPwdsSame = this.state.register_password !== this.state.register_verifypassword ? 'NO' : 'YES';
            this.setState({ isemailSame: isemailSame });  
            this.setState({ isPwdsSame: isPwdsSame });
            return;        
        } 
        this.setState({isActive : true});

        let request = {};
        request.firstName = this.state.register_firstName;
        request.lastName = this.state.register_lastName;
        request.phoneNo = this.state.register_phone;
        request.email = this.state.register_email;
        request.password = this.state.register_password; 
        request.zipCode = this.state.register_zip;

        if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
            request.promoCode =  this.CacheService.getCache('promoCode');
        }
        if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE){
            request.studentId = this.CacheService.getCache('student_id');         
            request.universityCode = this.CacheService.getCache('university_code');
        }
        let user = {};
        user.firstName = this.state.register_firstName;
        user.lastName = this.state.register_lastName;
        user.email = this.state.register_email;
        this.setState({user : user});

        if(this.state.user_config['ENABLE_CAPTCHA'] === 'Y'){
            request.recaptchaResponse = this.state.captchaverifyToken;
        }
            request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.ValidationService.validateForm(this.state.validateScreenName, request).then(result => {
            this.setState({ validateResponse: result });
            if (this.state.validateResponse.isValid) {
                request.phoneNo = this.state.register_phone.replaceAll('-','');
                request.phoneNo = this.state.register_phone.replaceAll('(','');
                request.phoneNo = this.state.register_phone.replaceAll(')','');
                this.UserManagementService.registerUser(request).then(response => {
                this.setState({
                        register_firstName: '',
                        register_lastName: '',
                        register_email: '',
                        register_confirmemail: '',
                        register_password: '',
                        register_verifypassword:'',
                        register_phone: '',
                        register_zip: ''
                    });
                    let cacheresponse = JSON.parse(this.CacheService.getCache('response'));
                    let msgDesc = this.MessageService.getMessageDesc(cacheresponse.data.msg_code);
                                           

                    if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
                      this.clearRecaptchaToken();
                      this.recaptcha.current.reset();
                    }
                    this.verifyCallback = this.verifyCallback.bind(this);
                    this.recaptcha = React.createRef();
                    this.setState({respMsg : msgDesc.msgValue});  

                    this.setState({outcome : 'registerSuccess'});
                    this.setState({isActive : false});
                    this.setState({regenerate:true});

                }).catch(error => {
                    this.setState({isActive : false});
                    if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
                      this.clearRecaptchaToken();
                      this.recaptcha.current.reset();
                      this.setState({regenerate : true});
                    }
                    if(this.CacheService.getCache('APP_TYPE') !== commonConstants.PAYGO_APP_TYPE && this.CacheService.getCache('APP_TYPE') !== commonConstants.PROMOTIONS_APP_TYPE
                        && this.CacheService.getCache('APP_TYPE') !== commonConstants.ETICKETING_APP_TYPE){
                    let cacheresponse = JSON.parse(this.CacheService.getCache('response'));
                    let msgDesc = this.MessageService.getMessageDesc(cacheresponse.data.msg_code);
                    this.setState({respMsg : msgDesc.msgValue});  
                    this.setState({outcome : 'REGISTERFAILED'});
                    this.setState({isActive : false});    
                    }
                    this.verifyCallback = this.verifyCallback.bind(this);
                    this.recaptcha = React.createRef();  
                    this.setState({regenerate:true});               
                     
                });
            } else {
                this.setState({isActive : false});
            }
        }).catch(error => {
                    this.setState({isActive : false});
            
        });   
        
    }
    onClick = () => {
        this.CacheService.setCache("isResetPwd", false);
        if(this.CacheService.getCache('APP_TYPE') === commonConstants.PAYGO_APP_TYPE){
            this.props.history.push(PAYGO_PATH + '/login');
        }else if(this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE){
            this.props.history.push(ETICKETTING_PATH + '/login');    
        }else if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE){
            this.props.history.push(STUDENTTICKET_PATH +'/login?university_code='+this.CacheService.getCache('university_code')+'&student_id='+this.CacheService.getCache('student_id'));
        }
        else if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
            this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath"));
        }
    }
    render() {

        const { t } = this.props;
        
        
        return (
            
                <div className="">  
                <LoadingOverlay
                    active={this.state.isActive}
                    spinner={<LoadingComponent />} >
                    <div className="heading">
                    <span>{t('label_title.appTypeTitle')}</span>
                    </div>   
                    {this.state.outcome === 'init' && this.isValidPromo === "YES" ?
                    <div>
                     

                    <div className=""> 
                    <div className="row">
                    <div className="col-12">  

                         
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.PAYGO_APP_TYPE   ? 
                            <img id="paygo_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="paygo slide"></img>
                            : null}    
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE   ?    
                            <img id="eticket_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="eticketing slide"></img>
                            : null}
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE   ? 
                            <img id="student_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="student ticketing slide"></img>
                            : null}
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE   ? 
                            <img id="promo_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="special promotions slide"></img>
                            : null}    
                </div>       
                </div> 
                </div>

                    <div className="">
                        <div className="col-md-12 reg mt-2 pb-4 mb-4">
                            <div className="row justify-content-center pt-4">
                
                                <div className="col-md-6">
                                    <form id="register-form" className="form-horizontal p-4" method="post" action="#" onSubmit={this.handleSubmit}>
                
                                        <div className="form-head h4 text-left">
                                            {this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE?
                                                <span>New Student Registration</span> :
                                                <span>New Customer Registration</span>
                                            }
                                        </div>
                            <div className="row mt-4">

                                        <div className="form-group col-md-12">
                                            <label htmlFor="register_firstName" className="cols-sm-2 control-label">First Name <span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                
                                                    <input type="text" className="form-control App" name="register_firstName" id="register_firstName" placeholder="First Name"
                                                     value={this.state.register_firstName} onChange={this.handleChange} onBlur={this.onBlur}/>
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

                                        <div className="form-group col-md-12">
                                            <label htmlFor="register_lastName" className="cols-sm-2 control-label">Last Name <span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                
                                                    <input type="text" className="form-control App" name="register_lastName" id="register_lastName"
                                                     placeholder="Last Name" value={this.state.register_lastName} onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                    </div>
                                    <div className="row">
                                        <div className="form-group col-md-12">
                                            <label htmlFor="register_email" className="cols-sm-2 control-label"> Email <span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                
                                                    <input type="text" className="form-control App" name="register_email" id="register_email"
                                                           placeholder="Email" value={this.state.register_email} onCopy={this.onCopy} onPaste={this.onPaste}
                                                           onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                        <div className="form-group col-md-12">
                                            <label htmlFor="register_confirmemail" className="cols-sm-2 control-label">Confirm Email <span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                
                                                    <input type="text" className="form-control App" name="register_confirmemail" id="register_confirmemail"
                                                           placeholder="Confirm Email" value={this.state.register_confirmemail} onCopy={this.onCopy} onPaste={this.onPaste}
                                                           onChange={this.handleChange} onBlur={this.onBlur}/>
                                                </div>
                                                {this.state.validateResponse.confirmemail_error === 'required' ?
                                                 <span className="form_error"> {t('label_label.emailRequired')} </span> : null}
                                                 {this.state.validateResponse.confirmemail_error === 'minLength' ?
                                                 <span className="form_error"> {t('label_label.usernameMinlength')} </span> : null}
                                                 {this.state.validateResponse.confirmemail_error === 'maxLength' ?
                                                    <span className="form_error">{t('label_label.usernameMaxlength')} </span> : null}
                                                 {this.state.validateResponse.confirmemail_error === 'regex' ?
                                                    <span className="form_error">{t('label_label.usernameInvalid')} </span> : null}
                                                 {this.state.isemailSame === 'NO' ?
                                                    <span className="form_error">  {t('label_label.emailMatch')} </span> : null}   
                                            </div>
                                        </div>

                                        
                                        <div className="form-group col-md-12">
                                            <label htmlFor="register_password" className="cols-sm-2 control-label">Password <span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                                                <OverlayTrigger
                                                placement="right"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={this.renderTooltip}>     
                                                {/* <Tooltip className="mytooltip1 text-left" arrow id="button-tooltip" placement="right-end" effect="solid">
                                                    <PasswordStrengthMeter password = {this.state.register_password}></PasswordStrengthMeter>
                                                    {this.state.register_password === "" ?
                                                    <label className="cols-sm-2 control-label text-black"> Note : Password is case sensitive and must be at least 8 characters and contain at least one lowercase letter, one uppercase letter, one number, and one symbol from the following @#$&=+</label>    
                                                    :null}
                                                </Tooltip> */}
                                                    <input type="password" className="form-control App" data-tip data-for="title required" name="register_password" id="register_password"
                                                            placeholder="Password"  onChange={this.handleChange} onBlur={this.onBlur}/>
                                                             {/* tooltip={this.renderTooltip} tooltipOptions={{event: 'focus',position: 'right'}}/> */}
                                                
                                                </OverlayTrigger>
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
                                        <div className="form-group col-md-12">
                                            <label htmlFor="register_verifypassword" className="cols-sm-2 control-label">Confirm Password <span className="mandate">*</span></label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                
                                                    <input type="password" className="form-control App" name="register_verifypassword" id="register_verifypassword"
                                                           placeholder="Confirm Password"  onChange={this.handleChange} onBlur={this.onBlur}/>
                                                </div>
                                                {this.state.validateResponse.verifypassword_error === 'required' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordRequired')}  </span> : null}
                                                {this.state.validateResponse.verifypassword_error === 'minLength' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordMinlength')} </span> : null}
                                                {this.state.validateResponse.verifypassword_error === 'maxLength' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordMaxlength')} </span> : null}
                                                {this.state.validateResponse.verifypassword_error === 'regex' ?
                                                <span className="form_error"> {t('label_label.verifyPasswordInvalid')}</span> : null}
                                                {this.state.isPwdsSame === 'NO' ?
                                                    <span className="form_error">  {t('label_label.matchPassword')} </span> : null}
                                            </div>
                                        </div>
                                       

                                        <div className="form-group col-md-12">
                                            <label htmlFor="register_phone" className="cols-sm-2 control-label">Phone <span className="mandate">*</span> </label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                                                    <input type="phone" className="form-control App" name="register_phone" id="register_phone"
                                                           placeholder="Phone" value={this.state.register_phone} onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                        </div>
                                        <div className="form-group col-md-12">
                                            <label htmlFor="register_zip" className="cols-sm-2 control-label">Zip / Postal code <span className="mandate">*</span> </label>
                                            <div className="cols-sm-6">
                                                <div className="input-group">
                
                                                    <input type="zip" className="form-control App" name="register_zip" id="register_zip"
                                                           placeholder="Zip / Postal code" onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                        </div>
                                        </div>
                                      
                                        
                                        <p className="p-2 mt-3 pnotes"> {t('label_label.passwordNote')} </p> 
                                        {this.state.user_config['ENABLE_CAPTCHA'] === 'Y' ?
                                        <div className="text-left mt-3" >
                                            <ReCaptcha id="register_captcha"
                                                       ref={this.recaptcha}
                                                       onChange={() =>this.captcha()}
                                                       size="normal"
                                                       data-theme="dark"
                                                       render="explicit"
                                                       className="captchaStyle"
                                                       sitekey={this.userConfig['CAPTCHA_CLIENT_KEY']}
                                                       onLoadRecaptcha={this.onLoadRecaptcha}
                                                       verifyCallback={this.verifyCallback}
                                                       expiredCallback={this.clearRecaptchaToken}
                                                       />
                                        </div> : null}
                
                                            <div className="row">
                                            <div className="form-group mb-4 col-md-12">
                                                <button type="submit"
                                                 disabled={this.state.user_config['ENABLE_CAPTCHA'] === 'Y' && (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)}
                                                onClick={this.register} className="btn btn-primary btn-lg btn-block login-button register mt-4" id="register_submit">Submit</button>
                                            </div>
                                            <div className="form-group  col-md-12">
                                                <button type="submit" onClick={this.onClick}
                                                        className="btn btn-secondary btn-lg btn-block login-button mt-4" id="register_login">Login</button>
                                            </div>
                                            </div>
                                            { (this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE) ?
                                            <div className="row reg mt-2">
                                            <div className="form-head  mb-2 mt-2 text-left col-md-12">
                                                {this.campText.header}
                                            </div>
                                            <div className="form-group  col-md-12">
                                                {this.campText.body}
                                            </div>
                                            </div>  : null}  
                                    </form>
                                </div>
                            </div>
                
                
                        </div>
                
                    </div>
                    </div>: <div>
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.PAYGO_APP_TYPE   ? 
                            <img id="paygo_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={require("../../../images/Image14.png")} alt="paygo slide"></img>
                            : null}    
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE   ?    
                            <EticketSplashComponent outcome={this.state.outcome} respMsg={this.state.respMsg} user={this.state.user} > </EticketSplashComponent> 
                            : null}
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE   ? 
                        <StudentSplashComponent outcome={this.state.outcome} respMsg={this.state.respMsg} user={this.state.user} > </StudentSplashComponent> 
                            : null}
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE   ? 
                            <PromoSplashComponent outcome={this.state.outcome} respMsg={this.state.respMsg} user={this.state.user} status={this.isValidPromo} > </PromoSplashComponent> 
                            : null}  
                            
                            
                            
                    </div>
                            
                            
                    }
                    </LoadingOverlay>
                </div>
                
                );
    }

}

export default withTranslation()(RegisterComponent);
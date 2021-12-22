import React, { Component } from 'react';
import { CommonService } from '../../common/services/CommonService';
import { RestService } from '../../framework/services/RestService';
import { CacheService } from '../../framework/services/CacheService';
import { ValidationService } from '../../framework/services/ValidationService';
import { ExceptionHandlingService } from '../../framework/services/ExceptionHandlingService';
import LoadingOverlay from 'react-loading-overlay'
import LoadingComponent from '../../common/components/LoadingComponent';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import _ from 'lodash';
import {ETICKETTING_PATH,STUDENTTICKET_PATH,PROMOTIONS_PATH, PAYGO_PATH } from 
'../../framework/services/ApplicationConstants';
import * as commonConstants from '../services/CommonConstants';
import { BrowserView, MobileView} from "react-device-detect";
import {OverlayTrigger, Tooltip } from 'react-bootstrap';
import PasswordStrengthMeter from './PasswordStrengthMeter';


const sqStyle = {
    border: "none",
    paddingLeft: "0px",
    fontWeight : "bold"
}

const divHeight = {
    minHeight:"50em"   
}

class ForgotPasswordComponent extends Component {
    constructor(props) {
        super(props);
        let search = props.location.search;
        let params = new URLSearchParams(search);
        if (params.get('resetcode')) {
        this.resetKey = params.get('resetcode').replace(/ /g, '+');
        }
        this.state = {
            error: null,
            forgotpassword_email:'',
            value: '',             
            userName : {},
            forgotpassword_securitycode : '',
            resetpassword_newpassword : '',
            isPwdsSame: 'YES',
            resetpassword_confirmPassword : '',
            validateResponse: {},
            action_type : "forgotPassword",
            app_type : '',
            isActive : true,
            resetLink : 'valid'
        }  
        this.handleChange = this.handleChange.bind(this);
        this.CommonService = new CommonService();
        this.RestService = new RestService();
        this.ValidationService = new ValidationService();
        this.ExceptionHandlingService = new ExceptionHandlingService();
        this.CacheService = new CacheService();
        if (this.resetKey) {
        this.setState({ action_type: "" });    
        this.resetPasswordlink();
        }

    }

    async componentDidMount() { 
        if (this.resetKey) {
        this.setState({isActive : true});
        }else{
        this.setState({isActive : false});
        }
    }

      handleChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
      }

    renderTooltip = (props) => (
        
        <Tooltip className="mytooltip2" id="button-tooltip" effect="solid" {...props}>
        <PasswordStrengthMeter password = {this.state.resetpassword_newpassword}></PasswordStrengthMeter>
        {this.state.resetpassword_newpassword === "" ?
            <label className="cols-sm-2 control-label text-black"> Note : Password is case sensitive and must be at least 8 characters and contain at least one lowercase letter, one uppercase letter, one number, and one symbol from the following @#$&=+</label>    
        :null}                           
        </Tooltip>
      );


    resetPasswordlink(){

        this.setState({isActive : true});
        let request = {};
        request.resetKey = this.resetKey;
        this.CommonService.validateResetToken(request).then(response => {  
            this.setState({forgotpassword_email : response.content.email});
            this.setState({ action_type: "reset_password" });    
            this.setState({isActive : false});
        }).catch(error => {
            this.setState({resetLink : 'Invalid'});
            this.setState({isActive : false});
                    
        });
    } 

    forgotPassword = (e) => {
        e.preventDefault();
        this.setState({isActive : true});
        let request = {};
        request.email = this.state.forgotpassword_email;
        request.app_type = this.CacheService.getCache('APP_TYPE');
        this.ValidationService.validateForm('forgotpassword', request).then(result => {
            this.setState({ validateResponse: result });
            if(this.state.validateResponse.isValid) {
                this.CommonService.forgotPassword(request).then(response => {
                    this.setState({isActive : false});
                    this.setState({ action_type: "validate_security_code" });
                }).catch(error => {
                    this.setState({isActive : false});                     
                });
                    
            } else {
                this.setState({isActive : false});
            }
        }).catch(error => {
            this.setState({isActive : false});
             
        });
    }

    validateSecurityCode = (e) => {
        e.preventDefault();
        this.setState({ submitted: true });
        this.setState({isActive : true});
        var app_type = this.CacheService.getCache('APP_TYPE');
        let request = {};
        request.email = this.state.forgotpassword_email;
        request.securityCode = this.state.forgotpassword_securitycode;

        // if(request.securityCode.toString() === ''){
        //     this.setState({isActive : false});
        //     var element = document.getElementById("msg_description");
		// 	element.innerHTML = "Security code is required."; 
		// 	element.setAttribute('class', "alert alert--error alert--dismissible message-container-error"); 
		// 	setTimeout(() => {
		// 		element.innerHTML = ""; 
		// 	element.setAttribute('class', ""); 
		// 	}, 5000);
        //     return;
        // }

        this.ValidationService.validateForm('validateSecurityCode', request).then(result => {
            this.setState({ validateResponse: result });
            if(this.state.validateResponse.isValid) {
                  this.CommonService.validateSecurityCode(request).then(response => {    
                        this.setState({isActive : false});
                        this.setState({ action_type: "reset_password" });                     
                  }).catch(error => {
                    let cacheresponse = JSON.parse(this.CacheService.getCache('response'));
                    if(cacheresponse && cacheresponse.data && cacheresponse.data.msg_code && cacheresponse.data.msg_code === 144) {
                        this.redirectToLogin(app_type);
                    }
                    this.setState({ action_type: "validate_security_code" });
                    this.setState({isActive : false});
                  });
            }  else {
                this.setState({isActive : false});                    

            }
        }).catch(error => {
        });
    }


    resetPassword = (e) => {
        
        e.preventDefault();   
        this.setState({ isPwdsSame: 'YES' });
        let validateResponse = {};
        this.setState({validateResponse : validateResponse});
        if(this.state.resetpassword_newpassword !== this.state.resetpassword_confirmPassword) {
            let isPwdsSame = this.state.resetpassword_newpassword !== this.state.resetpassword_confirmPassword ? 'NO' : 'YES';
            this.setState({ isPwdsSame: isPwdsSame });
            return;        
        } 
        this.setState({isActive : true});
        var app_type = this.CacheService.getCache('APP_TYPE');
        let request = {};
        request.email = this.state.forgotpassword_email;
        request.password = this.state.resetpassword_newpassword;
        request.app_type = app_type;
        this.ValidationService.validateForm('resetpassword', request).then(result => {
            this.setState({ validateResponse: result });

            if (this.state.validateResponse.isValid) {
                this.CommonService.resetPassword(request).then(response => {  
                    this.redirectToLogin(app_type);    
                    this.setState({isActive : false});
                }).catch(error => {
                    this.setState({isActive : false});
                            
                });
            }else{
                this.setState({isActive : false});
            }

        });
    }

    redirectToLogin(app_type) {
        switch(app_type) {
            case commonConstants.ETICKETING_APP_TYPE :
                this.props.history.push(ETICKETTING_PATH);  
                break;
            case commonConstants.PROMOTIONS_APP_TYPE:
                this.props.history.push(PROMOTIONS_PATH +  this.CacheService.getCache("promoPath"));  
                break;
            case commonConstants.STUDENT_TICKETING_APP_TYPE:
                var university_code = this.CacheService.getCache('university_code');
                var student_id = this.CacheService.getCache('student_id');
                this.props.history.push(STUDENTTICKET_PATH + "/login" + '?university_code=' + university_code + '&student_id=' + student_id);  
                break;
            case commonConstants.PAYGO_APP_TYPE:
                this.props.history.push(PAYGO_PATH);
                break; 
            default: 
                this.props.history.push(ETICKETTING_PATH);  
                break;
        }
    }

    render() {
        const { t } = this.props;
        return (
            <div id="forgotPassword-Container">
                
                  <LoadingOverlay
              active={this.state.isActive}
              spinner={<LoadingComponent />}>

                  <div className= "mt-n2"> 
                    <div className="container mt-2 pb-2">
                       
                        <div className="row justify-content-center">
                            <div className="col-md-11 reg mt-2">
                            {this.state.resetLink === "valid" ?   
                            <div>
                            {this.state.action_type === "forgotPassword"   ? 
                                <form id="forgotpassword-form" className="form-horizontal col-md-6 reg shadow p-4 margin_auto" method="post"
                                 action="#" onSubmit={this.forgotPassword}>
                                    <div className="form-head text-left mb-4">
                                        <span>Forgot Password</span>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="forgotpassword_email" className="cols-sm-2 control-label"> Enter User Email <span className="mandate">*</span></label>
                                        <div className="cols-sm-6">
                                            <div className="input-group">
                                                <input type="text" className="form-control App" name="forgotpassword_email" id="forgotpassword_email-form-email"
                                                    placeholder="Enter User Email" onChange={this.handleChange} />
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

                                    <div className="form-group mt-4 col-sm-8 ">
                                        <button type="submit"
                                            className="btn btn-primary btn-lg btn-block login-button">Verify Email</button>
                                    </div>
                                </form>
                                : <div>

                                {this.state.action_type === "validate_security_code" ?
                                 <form id="forgotpassword-validateQA-form" className="form-horizontal col-md-6 reg shadow p-4 margin_auto" method="post"
                                 action="#" onSubmit={this.validateSecurityCode}>
                                    <div id="forgotpassword-security_question-section">
                                      <div className="form-head text-left">
                                            <span>Forgot Password</span>
                                        </div>

                                         <p className="mt-3"> For your security, we need to verify your 
                                         identity before you can reset your password. We have send our temporary 
                                         identification code to your email, Please enter the security code below. </p>
 
                                        <div className="form-group">
                                            <label htmlFor="forgotpassword_securitycode" className="cols-sm-2 control-label">Security Code <span className="mandate">*</span></label>
                                            <div className="cols-sm-8">
                                                <div className="input-group">
                                                    <input autoComplete="off" type="text" className="form-control App" 
                                                    name="forgotpassword_securitycode" id="forgotpassword-forgotpassword_securitycode"
                                                        placeholder="Security code" value={this.state.resetCode} onChange={this.handleChange}/>                                                    
                                                </div>
                                                {this.state.validateResponse.securityCode_error === 'required' ?
                                                    <span className="form_error"> {t('label_label.securityCodeRequired')} </span> : null}
                                                {this.state.validateResponse.securityCode_error === 'regex' ?
                                                    <span className="form_error"> {t('label_label.securityCodeInvalid')}</span> : null}
                                                {this.state.validateResponse.securityCode_error === 'minLength' ?
                                                    <span className="form_error"> {t('label_label.securityCodeMinLength')} </span> : null}
                                                {this.state.validateResponse.securityCode_error === 'maxLength' ?
                                                    <span className="form_error"> {t('label_label.securityCodeMaxLength')}</span> : null}        
                                            </div>
                                        </div>
                                        <div className="form-group mt-4 col-sm-10 ">
                                            <button type="submit" 
                                                className="btn btn-primary btn-lg btn-block login-button"
                                                disabled={this.state.resetCode === ''}
                                            >Verify Security Code</button>
                                        </div>
                                    </div>
                                </form>  : 
                                <form id="forgotpassword-resetpassword-form" className="form-horizontal col-md-6 shadow reg p-4 margin_auto" method="post" action="#" onSubmit={this.resetPassword}>
                                    <div className="form-head">
                                        <span>Reset Password</span>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="resetpassword_newpassword" className="cols-sm-2 control-label">New Password <span className="mandate">*</span></label>
                                        <div className="cols-sm-6">
                                        <div className="input-group">
                                            <OverlayTrigger
                                                placement="right"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={this.renderTooltip}>
                                                <input type="password" autoComplete="off" data-tip className="form-control App" name="resetpassword_newpassword" id="resetpassword_newpassword"
                                                    placeholder="Password 8-20 alpha numeric characters" 
                                                    onChange={this.handleChange} />
                                            </OverlayTrigger>
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
                                        <label htmlFor="resetpassword_confirmPassword" className="cols-sm-2 control-label">Confirm Password <span className="mandate">*</span></label>
                                        <div className="cols-sm-6">
                                            <div className="input-group">
                                                
                                                <input type="password" autoComplete="off" className="form-control App" name="resetpassword_confirmPassword" id="resetpassword_confirmPassword"
                                                    placeholder="Password 8-20 alpha numeric characters" 
                                                    onChange={this.handleChange} />
                                            </div>
                                            {this.state.isPwdsSame === 'NO' ?
                                            <span className="form_error">  {t('label_label.passwordMatch')} </span> : null
                                        }
                                        </div>
                                    </div>
                                    <p className="p-2 mt-3 pnotes"> {t('label_label.passwordNote')}  </p>
                                    <div className="form-group ">
                                        <button type="submit" className="btn btn-primary btn-lg btn-block login-button register mt-4">Reset Password</button>
                                    </div>

                                </form>}
                                   </div>
                                }
                            </div> : 

                                <div>            
                                <div id="promo_msg">
                                    <div className="container mt-2 ">
                                        <div className="row justify-content-center">
                                            <div className="col-md-9 py-4 msg">
                                                <p className="fail justify-content-center">Reset Password link Expired</p>
                                                <p className="studentMessages"> Your account reset password link has been expired. Please contact admin for reset password link. </p>
                                            </div>

                                        </div>
                                    </div>    

                                </div>
                                </div>
                                }

                            </div>
                        </div>
                    </div>
                </div>
                </LoadingOverlay>
                
            </div>
        );
    }
}

export default withTranslation() (ForgotPasswordComponent);
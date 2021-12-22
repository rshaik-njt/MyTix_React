import React, { Component } from 'react';
import '../css/eticket-style.scss';
import { CacheService } from '../../framework/services/CacheService';
import { ReCaptcha } from 'react-recaptcha-google';
import { EticketingService } from '../services/EticketingService';
import * as commonConstants from '../../common/services/CommonConstants';
import { withTranslation } from 'react-i18next';
import { UserAgent } from 'react-ua';

const divHeight = {
    minHeight:"45em"   
}

const activateMsg = {
    background: "#fff",
    width: "100em",
    height: "34em",
    boxShadow: "5px 5px 15px rgba(0,0,0,.14)",
    borderRadius: "5px",
    opacity: 1,
    marginTop: '2em',
    padding: "20px"
}


class EticketSplashComponent extends Component {
   constructor(props) {
        super(props);
        this.state = {captchaverifyToken : '',regenerate:true,user_config : {}};
        this.browser = '';
        this.os = '';
        this.homeimgUrl = '';  
        this.emailTime = '5';  
        this.userConfig = {};
        this.recaptcha = React.createRef();   
        this.EticketingService = new EticketingService();
        this.CacheService = new CacheService();
        let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        if(app_config !== "undefined") {
            let user = JSON.parse(app_config)['home_config']['user_account'];
            this.userConfig = user;
        }
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);
        this.homeimgUrl  = this.userConfig['HOME_IMAGE_URL'] +'?v=' + Date.now();
       
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
    regenerateVerifyEmail(){
        let request = {};
        request.browser = this.browser;
        request.os = this.os;
        request.email = this.props.user.email;
        request.app_type = commonConstants.ETICKETING_APP_TYPE;
        this.EticketingService.regenerateVerificationUrl(request);
        this.setState({ regenerate:true});
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);
        this.recaptcha = React.createRef();
        this.recaptcha.current.reset();
    }

    captcha(){
        this.state = {regenerate:false}
    }

    render() {
        const { t } = this.props;
        return (
            <div className="">
                <div className="heading">                        
                          {/* <span> {t('label_title.appTypeTitle')}</span>                          */}
                    </div>
                    <UserAgent>
                        {v => {
                            this.browser = v.browser.name;
                            this.os = v.os.name;
                        }}
                        </UserAgent>
            <div className="">
            
                  <img id="promo_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="Second slide"></img>
                
                 </div>
                
                <div className="container">
                    <div className="row justify-content-center">
                    <div className="col-md-9 py-2 text-center">
                            <i className="fa fa-fw fa-check-circle fafa-green"></i><span className="studentHeadingMessages w-100">Registration Successful</span>
                            <p className="studentMessages">A verification link has been sent to <b> {this.props.user.email} </b><br/>
                            Please allow up to {this.userConfig['EMAIL_TIME']} minutes for the verification email to arrive.</p>
                           <p class="studentMsg">If you have not received the email, please check your spam or junk folder. To resend click on regenerate button.</p>
                      
                    </div>
                    </div>
                    
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
                            
                    <div class="row justify-content-center form-group m-auto col-md-5">
                    <div class="form-group mt-1 ">
                        <button type="submit" disabled = {this.userConfig['ENABLE_CAPTCHA'] === 'Y' && 
                             (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)} class="btn btn-primary btn-lg btn-block login-button register"  onClick={() =>this.regenerateVerifyEmail()}>
                            <span class="ui-button-text ui-c">Regenerate</span>
                            </button>
                            </div>                            
                    </div>
                </div>
                        
                </div>
            
        );
    }
}
export default withTranslation() (EticketSplashComponent);
import React, { Component } from 'react';
import { PROMOTIONS_PATH } from '../../framework/services/ApplicationConstants';
import { CacheService } from '../../framework/services/CacheService';
import * as commonConstants from '../../common/services/CommonConstants';
import { withRouter } from 'react-router-dom';
import i18next from 'i18next';
import { MessageService } from '../../framework/services/MessageService';
import { PromotionsService } from '../services/PromotionsService';
import { CommonService } from '../../common/services/CommonService';
import { ReCaptcha } from 'react-recaptcha-google';
import { withTranslation } from 'react-i18next';
import { UserAgent } from 'react-ua';

const modalStyle = {
    margin: "auto",
    position: "relative",
    width: "100%"
}

class PromoSplashComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            captchaverifyToken : '',
            user : '',
            regenerate:true,
            user_config : {},
            isValidPromo:''
        }
        this.browser = '';
        this.os = '';
        this.homeimgUrl = '';
        this.campText = {};
        this.userConfig ={};
        this.status = props.status;
        this.CacheService = new CacheService();
        this.CommonService = new CommonService();
        this.PromotionsService = new PromotionsService();
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);
        this.MessageService = new MessageService();
        this.recaptcha = React.createRef();
        let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        
        if(app_config !== "undefined") {
            let user_config = JSON.parse(app_config)['home_config']['user_account'];
            this.userConfig = user_config;
            this.homeimgUrl  = user_config['HOME_IMAGE_URL'] +'?v=' + Date.now();
            this.CacheService.setCache('HOME_IMAGE_URL', this.homeimgUrl);
        }else {
            this.setState({isValidPromo : 'EXPIRED'});
        }

        
    }

    onLoadRecaptcha() {
        if (this.state.ready && this.userConfig['ENABLE_CAPTCHA'] === 'Y') {
            this.recaptcha.current.reset();
        }
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
        request.app_type = commonConstants.PROMOTIONS_APP_TYPE;
        this.PromotionsService.regenerateVerificationUrl(request);
          this.setState({ regenerate:true});
          this.verifyCallback = this.verifyCallback.bind(this);
          this.MessageService = new MessageService();
          this.recaptcha = React.createRef();
          
      }

    

    captcha(){
        this.state = {regenerate:false}
    }

    render() {
        const { t } = this.props;
        return (            
            <div id="promo_msg">
                <div className="heading">
                    {/* <span>{t('label_title.appTypeTitle')}</span> */}
                </div>
                <UserAgent>

                    {v => {
                        this.browser = v.browser.name;
                        this.os = v.os.name;
                    }}
                </UserAgent>
                {this.homeimgUrl!=='' ? 
                        <img id="promo_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="Promo slide"></img>
                    :null}

                <div className="container mt-2 ">
                    <div className="row justify-content-center" style={modalStyle}>
                            {this.status === 'EXPIRED' ?
                                <div className="msg">
                                    <div className = "cntr">
                                    <span className="fail"> {i18next.t('label_label.promoExpiredTtl')} </span>
                                    </div>
                                    <p className="text1"> {i18next.t('label_label.promoExpired')} </p>
                                </div> :null}

                            {this.status === 'EXCEEDED' ?
                             <div className="msg">
                                <div className = "cntr">
                                <span className="fail"> {i18next.t('label_label.promoExceededTtl')} </span>
                                </div>
                                <p className="text1"> {i18next.t('label_label.promoExceeded')}  </p>
                            </div> 
                            :null}

                            {this.status === 'INVALID' ?
                             <div className="msg">
                                 <div className = "cntr">
                                <span className="fail"> {i18next.t('label_label.promoInvalid')} </span>
                                </div>
                                <p className="text1"> {i18next.t('label_label.promoInvalidDesc')}  </p>
                            </div> 
                            :null}

                            <div>
                            {this.props.outcome === 'registerSuccess' ?    
                            <div className="container ">
                                <div className="row justify-content-center">
                                <div className="col-md-9 py-2 text-center">
                                        <i className="fa fa-fw fa-check-circle fafa-green"></i><span className="studentHeadingMessages w-100">Registration Successful</span>
                                        <p className="studentMessages mt-1">A verification link has been sent to <b> {this.props.user.email} </b><br/>
                                            Please allow up to {this.userConfig['EMAIL_TIME']} minutes for the verification email to arrive.</p>
                                        <p class="studentMsg">If you have not received the email, please check your spam or junk folder. To resend click on regenerate button.</p>
                      
                                    </div>
                                </div>
                                
                                {this.userConfig['ENABLE_CAPTCHA'] === 'Y' ?
                                <div className="text-center mt-0">
                                    <ReCaptcha id="promo_register_captcha"
                                        ref={this.recaptcha}
                                        size="normal" onChange={() =>this.captcha()}
                                        data-theme="dark"
                                        render="explicit"
                                        className="captchaStyle"
                                        sitekey={this.userConfig['CAPTCHA_CLIENT_KEY']}                                    
                                        onLoadCallback={this.onLoadRecaptcha}
                                        verifyCallback={this.verifyCallback}
                                        expiredCallback={this.clearRecaptchaToken}

                                    />
                                </div>   : null}         
                            <div class="row justify-content-center form-group m-auto col-md-5">
                                <div class="form-group mt-1 mb-2">
                                    <button type="submit" disabled = {this.userConfig['ENABLE_CAPTCHA'] === 'Y' && 
                             (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)} class="btn btn-primary btn-lg btn-block login-button register"  onClick={() =>this.regenerateVerifyEmail()}>
                                        <span class="ui-button-text ui-c">Regenerate</span>
                                        </button>
                                        </div>
                                        
                                </div>
                            </div>:null}
                        </div>

                    </div>
                </div>    
            </div>
        );
    }
}

export default withTranslation() (PromoSplashComponent);
    

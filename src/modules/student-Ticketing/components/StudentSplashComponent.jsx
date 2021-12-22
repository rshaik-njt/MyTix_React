import React, { Component } from 'react';
import '../css/Student-style.scss';
import { CacheService } from '../../framework/services/CacheService';
import { withTranslation } from 'react-i18next';
import { ReCaptcha } from 'react-recaptcha-google';
import * as commonConstants from '../../common/services/CommonConstants';
import { StudentTicketingService } from '../services/StudentTicketingService';
import { UserAgent } from 'react-ua';
import LoadingOverlay from 'react-loading-overlay';
import LoadingComponent from '../../common/components/LoadingComponent';

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

class StudentSplashComponent extends Component {
    constructor(props) {
        super(props);
        this.browser = '';
        this.os = '';
        this.homeimgUrl = '';
        console.log("props",props);
        this.userConfig = {};
        this.CacheService = new CacheService();
        this.StudentTicketingService = new StudentTicketingService();
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);
        this.recaptcha = React.createRef();
        this.state = {
            captchaverifyToken : '',
            user_config : {},
            user : '',
            regenerate:true,
            isValidPromo:''
        }
        let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        if(app_config !== "undefined") {
           let user_config = JSON.parse(app_config)['home_config']['user_account'];
            this.userConfig = user_config;
            this.homeimgUrl  = this.userConfig['HOME_IMAGE_URL'] +'?v=' + Date.now();
            this.CacheService.setCache('HOME_IMAGE_URL', this.homeimgUrl+'?v=' + Date.now());
            this.CacheService.setCache('WELCOME_IMAGE_URL', user_config['WELCOME_IMAGE_URL']+'?v=' + Date.now());
           
        //    if (this.recaptcha && this.userConfig['ENABLE_CAPTCHA'] === 'Y') {
        //        this.recaptcha.current.reset();
        //    }  
           this.setState({isActive : false});
       } else {
           this.setState({outcome : 'invalidSchool'});
       }
       if(this.homeimgUrl!==''){
        this.homeimgUrl = this.CacheService.getCache('HOME_IMAGE_URL');
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
        this.state = {regenerate:false};
    }


    regenerateVerifyEmail(){

        let request = {};
        request.browser = this.browser;
        request.os = this.os;
        request.email = this.props.user.email;
        request.verificationKey = this.props.verificationKey;
        request.app_type = commonConstants.STUDENT_TICKETING_APP_TYPE;
        this.StudentTicketingService.regenerateVerificationUrl(request);

        this.setState({regenerate:true});
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);
        this.recaptcha = React.createRef();
    }

    reEnroll(){
        this.setState({isActive : true});
        let request = {};
        request.browser = this.browser;
        request.os = this.os;
        request.email = this.props.user.email;
        request.password = this.props.user.password;
        request.studentId = this.CacheService.getCache('student_id');         
        request.universityCode = this.CacheService.getCache('university_code');
        request.app_type = commonConstants.STUDENT_TICKETING_APP_TYPE;
        if(this.userConfig['ENABLE_CAPTCHA'] === 'Y'){
            request.recaptchaResponse = this.state.captchaverifyToken;
        }
        this.StudentTicketingService.authenticateUser(request).then(response => {
            
            this.setState({isActive : false});
            if (this.recaptcha && this.userConfig['ENABLE_CAPTCHA'] === 'Y') {
                this.clearRecaptchaToken();
                this.recaptcha.current.reset();
            }
        }).catch(error => {

            this.setState({isActive : false});
            if (this.recaptcha && this.userConfig['ENABLE_CAPTCHA'] === 'Y') {
                this.clearRecaptchaToken();
                this.recaptcha.current.reset();
            }
        });
        this.setState({regenerate:true});
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);
        this.recaptcha = React.createRef();
    }

    render() {
        const { t } = this.props;
        return (

            <LoadingOverlay
            active={this.state.isActive}
            spinner={<LoadingComponent />}
            > 
            
          <div id="sticketSplash-container" >
              <div className="heading">
              {/* <span>Student Ticketing</span> */}
            </div>
              <UserAgent>

                {v => {
                    this.browser = v.browser.name;
                    this.os = v.os.name;
                }}
            </UserAgent>

            <div className="">
            
                <div >
                    {this.homeimgUrl!=='' ?  
                    <img id="student_banner" className="b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="Second slide"></img>
                        :
                        <img id="student_banner" className="b-img-ss rounded mt-4 mb-4" src={require("../../../images/Image16.png")} alt="Second slide"></img>
                    }
                </div>           

                {this.props.outcome === 'invalidSchool' ? 
                    <div className="container">
                    <div className="row justify-content-center pb-4">
                        <div className="msg col-md-9 py-1 text-center">
                            <span className="fail">Invalid Request</span>
                            <p className="studentMessages mt-2 text-center ">Invalid university/school code. Please check with your university/school's Web Admin</p>
                        </div>
                            
                    </div>            
                </div> : null}
                {this.props.outcome === 'registerSuccess' ? 
                
                <div className="container ">
                    <div className="row justify-content-center">
                        <div className="col-md-9 py-1 text-center">
                            <i className="fa fa-fw fa-check-circle fafa-green"></i><span className="studentHeadingMessages w-100">Registration Successful</span>
                            <p className="studentMessages mt-1">A verification link has been sent to <b> {this.props.user.email} </b><br/>
                            Please allow up to {this.userConfig['EMAIL_TIME']} minutes for the verification email to arrive.</p>
                           <p class="studentMsg">If you have not received the email, please check your spam or junk folder. To resend click on regenerate button.</p>
                      
                        </div>
                    </div>
                    {this.userConfig['ENABLE_CAPTCHA'] === 'Y' ?
                    <div className="text-center mt-0" >
                    <ReCaptcha id="student_register_captcha"
                        ref={this.recaptcha} onChange={() =>this.captcha()}
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
                    <div class="row justify-content-center form-group m-auto col-md-5">
                    <div class="form-group mt-1 mb-5">
                        <button type="submit" disabled = {this.userConfig['ENABLE_CAPTCHA'] === 'Y' && (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)} class="btn btn-primary btn-lg btn-block login-button register"  onClick={() =>this.regenerateVerifyEmail()}>
                            <span class="ui-button-text ui-c">Regenerate</span>
                            </button>
                    </div>
                            
                    </div>
                
                </div> 
                 : null }

                {this.props.outcome === 'reverification' ? 
                
                <div className="container mt-2 ">
                    <div className="row justify-content-center">
                        <div className="msg">
                            <p className="success">Verification email sent successfully </p>
                            <p className="studentMessages">A verification link has been sent to {this.props.user.email}</p>
                            <p className="studentMessages">Please allow {this.userConfig['EMAIL_TIME']} minutes for this{('\n')} message to arrive.</p>
                        </div>
                    </div>
                </div> : null }
                

                {this.props.outcome === 'authenticated' ? 
                
                <div className="container ">
                    <div className="row justify-content-center">
                        <div className="col-md-9 py-4 text-center">
                            <i className="fa fa-fw fa-check-circle fafa-green"></i><span className="studentHeadingMessages w-100">Re-enrollment Successful</span>
                            <p className="studentMessages">A verification link has been sent to <b> {this.props.user.email} </b><br/>
                            Please allow up to {this.userConfig['EMAIL_TIME']} minutes for the verification email to arrive.</p>
                            <p class="studentMsg">If you have not received the email, please check your spam or junk folder. To resend click on regenerate button.</p>
                        </div>
                    </div>

                    {this.userConfig['ENABLE_CAPTCHA'] === 'Y' ?
                    <div className="text-center mt-0" >
                    <ReCaptcha id="student_register_captcha"
                        ref={this.recaptcha} onChange={() =>this.captcha()}
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
                    <div class="row justify-content-center form-group m-auto col-md-5">
                    <div class="form-group mt-1 mb-5">
                        <button type="submit" disabled = {this.userConfig['ENABLE_CAPTCHA'] === 'Y' && (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)} class="btn btn-primary btn-lg btn-block login-button register"  onClick={() =>this.reEnroll()}>
                        <span class="ui-button-text ui-c">Regenerate</span>
                        </button>
                    </div>
                            
                    </div>
                    
                
                </div> 
                
                : null }

                {this.props.outcome === 'activated' ? 
                
                <div className="container mt-2 ">
                    <div className="row justify-content-center">
                        <div className="col-md-9 py-4 msg">
                            <span className="studentMessages">Hi  {this.props.user.firstName},</span><br></br>
                            <br></br>
                            <span className="studentMessages">You have successfully activated your NJ TRANSIT student mobile account! </span><br></br>
                            <span className="studentMessages">Use your account to purchase discounted student monthly passes.</span><br></br>
                            <span className="studentMessages">Your student account is valid through {this.props.profExpDate}.</span><br></br>
                            <br></br>
                            <span className="studentMessages"> {t('label_title.purchaseSteps')}</span><br></br> 
                            <br></br>
                            <ul>
                            <span className="studentMessages"><li> {t('label_msg.step1')} </li></span>
                            <span className="studentMessages"><li> {t('label_msg.step2')} </li></span>
                            <span className="studentMessages"><li> {t('label_msg.step3')} </li></span>
                            <span className="studentMessages"><li> {t('label_msg.step4')} </li></span>
                            <span className="studentMessages"><li> {t('label_msg.step5')} </li></span>
                            </ul>
                            <br></br>
                            

                            <span className="studentMessages">Following the start of each semester, return to your schools web portal and</span><br></br>
                            <span className="studentMessages">click on the "Existing NJ TRANSIT Mobile Student Monthly Pass Account </span><br></br>
                            <span className="studentMessages">Management" link to confirm your full-time status and continue through to</span><br></br>
                            <span className="studentMessages">purchase your student pass.</span>
                            <br></br>
                            <br></br>
                            <span className="studentMessages">Thank you.</span>

                        </div>
                    </div>
                </div> : null }
    
                {this.props.outcome === 'FAILED' ? 
                <div className="container mt-2">
                    <div className="row justify-content-center pb-4">
                        <div className="col-md-9 py-4 msg">
                            <p className="fail "><i className="fa fa-fw fa-times-circle fafa-red"></i>Re-enrollment Failed</p>
                            <p className="studentMessages mt-2 text-center "> {this.props.respMsg}</p>
                        </div>                            
                    </div>            
                </div> : null}

                {this.props.outcome === 'activatefailed' ? 
                <div className="container mt-2">
                    <div className="row justify-content-center pb-4">
                        <div className="col-md-9 py-4 msg">
                            <p className="fail "><i className="fa fa-fw fa-times-circle fafa-red"></i>Activation Failed</p>
                            <p className="studentMessages mt-2 studentMessages mt-2 text-center"> {this.props.respMsg}</p>
                        </div>                            
                    </div> 
                    {this.userConfig['ENABLE_CAPTCHA'] === 'Y' ?
                    <div className="text-center mt-0" >
                    <ReCaptcha id="student_register_captcha"
                        ref={this.recaptcha} onChange={() =>this.captcha()}
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
                    <div class="row justify-content-center form-group m-auto col-md-5">
                    <div class="form-group mt-1 mb-5">
                        <button type="submit" disabled = {this.userConfig['ENABLE_CAPTCHA'] === 'Y' && 
                        (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)} class="btn btn-primary btn-lg btn-block login-button register"  onClick={() =>this.regenerateVerifyEmail()}>
                            <span class="ui-button-text ui-c">Regenerate</span>
                            </button>
                    </div>
                            
                    </div>          
                </div> : null}

                {this.props.outcome === 'REGISTERFAILED' ? 
                 <div className="container">
                 <div className="row justify-content-center pb-4">
                     <div className="msg col-md-9 py-1 text-center">
                     <span className="fail"><i className="fa fa-fw fa-times-circle fafa-red"></i>Registration Failed</span>
                        <p className="studentMessages justify-content-center"> {this.props.respMsg} For re-enrollment please try login into the application 
                        using MyTix Student Monthly Pass – Account Management option from 
                        your university portal. </p>
                        </div>                            
                    </div>            
                </div> : null}
                {/*this.props.outcome === 'activated' ? 
                
                <div className="container mt-2">
                    <div className="row justify-content-center">
                        <div style={activateMsg}>
                              <img id="act_img" src={require("../../../images/activate.svg")}></img>
                        </div>
                    </div>
            </div> : null*/ }

            </div>
            </div>
            </LoadingOverlay>
        );
    }
}
export default withTranslation() (StudentSplashComponent);
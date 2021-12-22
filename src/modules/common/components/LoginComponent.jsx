
import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import CardDeck from 'react-bootstrap/CardDeck';
import Button from 'react-bootstrap/Button';
import { PAYGO_PATH,ETICKETTING_PATH,STUDENTTICKET_PATH,PROMOTIONS_PATH } from '../../framework/services/ApplicationConstants';
import { ReCaptcha } from 'react-recaptcha-google';
import { Link } from 'react-router-dom';
import { CacheService } from '../../framework/services/CacheService';
import { MessageService } from '../../framework/services/MessageService';
import * as commonConstants from '../services/CommonConstants';
import { Modal } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { UserManagementService } from '../services/UserManagementService';
import { ValidationService } from '../../framework/services/ValidationService';
import  LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';
import StudentSplashComponent from '../../student-Ticketing/components/StudentSplashComponent';
import PromoSplashComponent from '../../promotions/components/PromoSplashComponent';

const modalStyle = {
    overflowY: "scroll",
    maxHeight:"35em"   
}

class LoginComponent extends Component {


    constructor(props) {
        super(props);
        this.state = {
            login_email: '',
            login_password: '',
            showfaq : false,
            appType : '',
            user_config : {},
            validateResponse: {},
            user : {},
            disableLogin : true,
            validateScreenName : '',
            outcome1:'init',
            respMsg : '',
            captchaverifyToken : ''
        }
        this.userConfig = {};
        this.campText = {};
        this.ticket_types = {};
        this.isValidPromo = "YES";
        this.outcome = "init";
        this.CacheService = new CacheService();
        let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        if(app_config !== "undefined") {
            this.userConfig = JSON.parse(app_config)['home_config']['user_account'];
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
                this.ticket_types = JSON.parse(app_config)['home_config']['ticket_types'];
                this.CacheService.setCache("ticket_types", JSON.stringify(this.ticket_types));
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
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE && 
            this.userConfig['IS_VALID_SCHOOL'] === "N"){
                this.outcome = "invalidSchool";
            }

        }else{
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
                this.isValidPromo = 'INVALID';
            }
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE){
                this.outcome = "invalidSchool";
            }
        }
        this.homeimgUrl = '';
        this.campText = {};
        this.login = this.login.bind(this);
        this.register = this.register.bind(this); 
        this.gotoGuestTransactions = this.gotoGuestTransactions.bind(this);
        this.ValidationService = new ValidationService();
        
        this.MessageService = new MessageService();
        this.verifyCallback = this.verifyCallback.bind(this);
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.recaptcha = React.createRef();
        this.disableLogin = this.disableLogin.bind(this);
        this.UserManagementService = new UserManagementService();
        this.handleChange = this.handleChange.bind(this);
        this.validate = this.validate.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }
     
    

    componentDidMount(){
        this.setState({isActive : true});
        this.CacheService.removeDataFromCache('ticket_data');

        if(this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE){
            this.setState({validateScreenName : 'authenticateUser'});
        }else if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE){
            this.setState({validateScreenName : 'authenticateStudentUser'});
        }else if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
            this.setState({validateScreenName : 'authenticatePromoUser'});
        }else{

        }
        let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        if(app_config !== "undefined") {
            let user_config = JSON.parse(app_config)['home_config']['user_account'];
            this.setState({user_config : user_config}); 
            this.homeimgUrl  = user_config['HOME_IMAGE_URL'] +'?v=' + Date.now();
            this.CacheService.setCache('HOME_IMAGE_URL', this.homeimgUrl);
            this.CacheService.setCache('WELCOME_IMAGE_URL', user_config['WELCOME_IMAGE_URL']);
            if (user_config['ENABLE_CAPTCHA'] !== 'Y') {
                this.setState({disableLogin : false });

            } else {
                this.setState({disableLogin : true });
            }
        if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
            this.isValidPromo = "YES";
            let campaignText = JSON.parse(app_config)['promo_config']['campaignText'];
            this.campText = JSON.parse(campaignText);
            let isNewUser = this.CacheService.getCache('isNewUser');
            let userType = JSON.parse(app_config)['promo_config']['userType'];
            let balancecount = JSON.parse(app_config)['promo_config']['balancecount'];
            let isExpired  = JSON.parse(app_config)['promo_config']['isExpired'];
            if(Number(balancecount) <= 0) {
               this.isValidPromo ='EXCEEDED';
            }
            if(isExpired === 'Y'){
                this.isValidPromo ='EXPIRED';
            }
            this.setState({userType : userType});
             if(isNewUser !== 'YES' && userType ===  "1") {
                 this.MessageService.setMessageToDisplay(182);
                 this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath") + '/register');
             } else if(userType ===  "2") {
               this.MessageService.setMessageToDisplay(181);
             } 

        } 

        if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE && 
        user_config['IS_VALID_SCHOOL'] === "N"){
                this.outcome = "invalidSchool";
            }

            this.setState({isActive : false});


            if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
               this.recaptcha.current.reset();
            }
        }else{
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
                this.isValidPromo = 'INVALID';
            }
            if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE){
                this.outcome = 'invalidSchool';
            }
            this.setState({isActive : false});
            
        }
        this.setState({isActive : false});
    }


    onLoadRecaptcha() {
        this.recaptcha.current.reset();
    }

      async verifyCallback(recaptchaToken) {
        await this.setState({ captchaverifyToken: recaptchaToken, disableLogin : false });
      }


      disableLogin(e){
        this.setState({disableLogin : false });
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
        
        if(this.state.login_email !== ''){
        request.email = this.state.login_email;
        }
        if(this.state.login_password !== ''){
        request.password = this.state.login_password; 
        }
        
        this.ValidationService.validateForm(this.state.validateScreenName, request).then(result => {
    
                this.setState({ validateResponse: result });
        }).catch(error => {
            this.setState({isActive : false});
            
        });
    }

    
    login = (e) => {
        e.preventDefault();
        this.setState({isActive : true});  
        let request = {};
        let user = {};
        user.email = this.state.login_email;
        user.password = this.state.login_password;
        this.setState({user : user});

        request.email = this.state.login_email;
        request.password = this.state.login_password;

        if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
        request.promoCode = this.CacheService.getCache('promoCode');
        }
        if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE){
        request.studentId = this.CacheService.getCache('student_id');         
        request.universityCode = this.CacheService.getCache('university_code'); 
        }

        if(this.state.user_config['ENABLE_CAPTCHA'] === 'Y'){
            request.recaptchaResponse = this.state.captchaverifyToken;
        }
        request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);

        this.ValidationService.validateForm(this.state.validateScreenName, request).then(result => {
            this.setState({ validateResponse: result });
            if (this.state.validateResponse.isValid) {
              this.UserManagementService.authenticateUser(request).then(response => {
                
                this.CacheService.setCache('loginTime', new Date());

                if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
                  this.clearRecaptchaToken();
                  this.recaptcha.current.reset();
                }

                // this.setState({outcome : 'authenticated'});
                // let msgDesc = this.MessageService.getMessageDesc(response.data.msg_code);
                // this.setState({respMsg : msgDesc.msgValue});  

                if(this.CacheService.getCache('APP_TYPE') === commonConstants.PAYGO_APP_TYPE){
                    this.props.history.push(PAYGO_PATH + '/payments');
                }
                if(this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE){
                    if(this.CacheService.getCache('trxseqid') !== ''){
                        this.props.history.push(ETICKETTING_PATH + '/my-tickets');
                    }else{
                    this.props.history.push(ETICKETTING_PATH + '/purchase');
                    }
                }
                if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE){
                    this.setState({outcome1 : 'authenticated'});
                    this.outcome = 'authenticated'; 
                    console.log("this.outcome:::"+ this.outcome);
                    console.log("this.isValidPromo::"+this.isValidPromo);
                }
                if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
                    this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath") + '/purchase');
                }
                if(this.CacheService.getCache('APP_TYPE') === commonConstants.PAYGO_APP_TYPE){
                    this.props.history.push(PAYGO_PATH + '/payments');
                }
                this.setState({isActive : false});

              }).catch(error => {

                    if(this.CacheService.getCache('APP_TYPE') === '2'){                        
                        let response = JSON.parse(this.CacheService.getCache('response'));                     
                        let msg = this.MessageService.getMessageDesc(response.data.msg_code);
                        let msgDecription = msg.msgValue;
                        if(response.data.profile_expire_date) {
                        msgDecription = msgDecription + " " + response.data.profile_expire_date + '.';
                        }
                        this.setState({respMsg : msgDecription}); 
                        this.outcome = 'FAILED';   
                        if(response.data.msg_code==='131'){
                            this.outcome = 'authenticated';
                        }   
                                            
                    }
                    this.setState({isActive : false});
                    if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
                      this.clearRecaptchaToken();
                      this.recaptcha.current.reset();
                    }
                    
                });
              } else {
                this.setState({isActive : false}); 
                  if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
                    this.clearRecaptchaToken();
                    this.recaptcha.current.reset();
                  }                                         
      
                }
          }).catch(error => {
            this.setState({isActive : false});  
            this.recaptcha.current.reset();            
            console.log("error Authenticate", error);
          });
    }

    handlefaqmodal = () => {
        this.setState({
             showfaq : true
        })
    }
    handlefaqClose = () => {
        this.setState({
             showfaq : false
        })
    }


    register = (e) => {
        if(this.CacheService.getCache('APP_TYPE') === commonConstants.PAYGO_APP_TYPE){
            this.props.history.push(PAYGO_PATH + '/register');
        }else if(this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE){
            this.props.history.push(ETICKETTING_PATH + '/register');    
        }else if(this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE){
            this.props.history.push(STUDENTTICKET_PATH +'/register?university_code='+ 
            this.CacheService.getCache('university_code') +'&student_id=' + this.CacheService.getCache('student_id'));
        }else if(this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE){
            this.props.history.push(PROMOTIONS_PATH +this.CacheService.getCache("promoPath") +'/register');
        }
    }

    gotoGuestTransactions = (e) => {
        this.props.history.push(PAYGO_PATH + '/guestWelcome');
    }

    render() {
        const { t } = this.props;
        return (       
            <LoadingOverlay
            active={this.state.isActive}
            spinner={<LoadingComponent />}
            >   

            <div className="" tabIndex="-1">
                 
                <div className="heading">                          
                          <span>{t('label_title.appTypeTitle')}</span>
                </div>
                {(this.outcome === 'init' && this.state.outcome1 === 'init') && this.isValidPromo === "YES" ?
                <div>
                <div className=""> 
                    <div className="row">
                    <div className="col-12">
                         
                        {this.CacheService.getCache('APP_TYPE') ===  commonConstants.PAYGO_APP_TYPE  ? 
                            <img id="paygo_login_banner" className=" b-img-ss rounded mt-3 mb-2" src={this.homeimgUrl} alt="paygo slide"></img>
                            : null}    
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE   ?    
                            <img id="eticket_login_banner" className=" b-img-ss rounded mt-3 mb-2" src={this.homeimgUrl} alt="eticketing slide"></img>
                            : null}
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE   ? 
                            <img id="student_login_banner" className=" b-img-ss rounded mt-3 mb-2" src={this.homeimgUrl} alt="student ticketing slide"></img>
                            : null}
                        
                        {this.homeimgUrl!=='' ? 
                        <div>{this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE   ? 
                        <img id="promo_login_banner" className=" b-img-ss rounded mt-3 mb-2" src={this.homeimgUrl} alt="promo slide"></img>
                        : null} </div>
                        :null}
                          
                </div>       
                </div> 
                </div> 
                <div className="row row-flex pb-1 " tabIndex="-1">
                          
                              <div className="col-md-4 mb-1 " tabIndex="-1">

                              <form id="login-form" className="form-horizontal content1 reg" method="post" action="#">

                        <div className="form-head text-left">
                            <span>Account Login</span>
                        </div>

                        <div id="" className="form-group">
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.PAYGO_APP_TYPE   ? 
                                            <p className=" mt-1 pnotes"> Returning PAYGO users, simply login using your account to clear the debts using same or different cards. </p>
                            : null}
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE ? 
                                            <p className=" mt-1 pnotes"> Existing MyTix Customers Sign in using your MyTix account. </p>
                            : null}
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE   ? 
                                            <p className=" mt-1 pnotes"> Existing MyTix Customers and returning MyTix Student Monthly Pass account holders, Simply login using your student email address and password.</p>
                            : null}

                        </div>
                        <div className="form-group">
                            <label htmlFor="login_email" className="cols-sm-2 control-label"> Email <span className="mandate">*</span></label>
                            <div className="cols-sm-6">
                                <div className="input-group">
                                
                                    <input type="text" className="form-control App" name="login_email" id="login_email"
                                        placeholder="Email Address"  onChange={this.handleChange} onBlur={this.onBlur}/>
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

                        <div className="form-group">
                            <label htmlFor="login_password" className="cols-sm-2 control-label">Password <span className="mandate">*</span> </label>
                            <div className="cols-sm-6">
                                <div className="input-group">
                                    <input type="password" className="form-control App" name="login_password" id="login_password"
                                        placeholder="Password"  onChange={this.handleChange} onBlur={this.onBlur}/>
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
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.PAYGO_APP_TYPE   ?     
                        <Link className="pss p-2" to={PAYGO_PATH + '/forgotPassword'}> Forgot Password? </Link> : null
                        }
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE   ?
                        <Link className="pss p-2" to={ETICKETTING_PATH + '/forgotPassword'}> Forgot Password? </Link> : null
                        }
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE   ?
                        <Link className="pss p-2" to={STUDENTTICKET_PATH + '/forgotPassword'}> Forgot Password? </Link> : null
                        }
                        {this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE   ?
                        <Link className="pss p-2" to={PROMOTIONS_PATH + this.CacheService.getCache("promoPath") +'/forgotPassword'}> Forgot Password? </Link> : null
                        }
                        </div>

                                        <div className="form-group">
                            {this.state.user_config['ENABLE_CAPTCHA'] === 'Y' ?
                                        <div className="text-center mt-2" >
                            <ReCaptcha id="login-form-captcha"
                            ref={this.recaptcha} onChange={()=>this.disableLogin()}
                            size="normal"
                            data-theme="dark"
                            render="explicit"
                            className="captchaStyle w-100"
                            sitekey={this.userConfig['CAPTCHA_CLIENT_KEY']}
                            onLoadRecaptcha={this.onLoadRecaptcha}
                            verifyCallback={this.verifyCallback}
                            expiredCallback={this.clearRecaptchaToken}
                            />
                        </div> : null}
                        </div>

                        <div className="form-group">
                            <button type="button"
                            className="btn btn-primary btn-lg btn-block login-button register" 
                             disabled={this.state.user_config['ENABLE_CAPTCHA'] === 'Y' && 
                             (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)}
                            onClick={this.login} id="login-form-login">Sign In</button>
                        </div>

                        </form>

                </div>
                              <div className="col-md-8 mb-1">
                    <div className="content1 reg">        
            <CardDeck className="m-0 pt-1">
                <Card>
                    <Card.Body>
                        <Card.Title className="form-head text-left">New User?</Card.Title>
                        <Card.Text>
                        { this.CacheService.getCache('APP_TYPE') === commonConstants.PAYGO_APP_TYPE ?
                            <p>New users can create account using this option.Users can save the card details and pay the debt using the saved card or by entering new card details.</p>
                            : <p>New users can create account using this option.</p> }
                        </Card.Text>
                    </Card.Body>
                    <Button variant="primary" className="m-3" onClick={this.register} > <bold>Create New Account</bold></Button>
                    
                </Card>

                { this.CacheService.getCache('APP_TYPE') === commonConstants.PAYGO_APP_TYPE ?
                <Card>              
                    <Card.Body>
                        <Card.Title className="form-head text-left">Don't have an Account?</Card.Title>
                        <Card.Text>
                            Guest Users can still look up the transactions by entering the card details and can
                            pay debts using the same card or different card.  
                        </Card.Text>
                    </Card.Body>
                    
                    <Button variant="primary"className="m-3" onClick={this.gotoGuestTransactions} ><bold>Proceed as Guest</bold></Button>  
                </Card>  : null}  

                { this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE ?
                
                <Card>
                    <Card.Body>
                        <Card.Title className="form-head underline text-left"> <a onClick={this.handlefaqmodal}>
                        MyTix Student Monthly Pass FAQs.</a></Card.Title>
                        <Card.Text>
                        <p className=""><b>Terms of Use</b>{'\n'}The student monthly pass is for the personal use of the student who purchased it and is restricted for use traveling to/from stations
                                    indicated on the pass for the sole purpose of attending school. Student passes are not honored to or from any other rail station except those printed on the pass. But they may be used on certain buses and light rail vehicles as permitted under NJ TRANSIT cross-honoring policies. NJ TRANSIT reserves the right to review the applications for student passes. To ensure compliance with NJ TRANSIT policies, Students must present their student identification card upon request by train crew personnel or any NJ TRANSIT representative.</p>
                        
                        </Card.Text>
                    </Card.Body>

                </Card>  : null}
                { (this.CacheService.getCache('APP_TYPE') === commonConstants.ETICKETING_APP_TYPE) ?
                <Card>
                    <Card.Body>
                        <Card.Title className="form-head text-left"> 
                        NJ Transit</Card.Title>
                        <Card.Text>
                        <p className="">NJ Transit</p>
                        
                        </Card.Text>
                    </Card.Body>

                </Card> : null} 
                { (this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE) ?
                <Card>
                    <Card.Body>
                        <Card.Title className="form-head text-left"> 
                        {this.campText.header}</Card.Title>
                        <Card.Text>
                        <p className="">{this.campText.body}</p>
                        
                        </Card.Text>
                    </Card.Body>

                </Card> : null}                                     
            </CardDeck >
                
            </div> 
        </div>

                </div>
                </div>:<div>

                {this.CacheService.getCache('APP_TYPE') === commonConstants.STUDENT_TICKETING_APP_TYPE   ? 
                        <StudentSplashComponent outcome={this.outcome} respMsg={this.state.respMsg} user={this.state.user} > </StudentSplashComponent> 
                            : null}
                {this.CacheService.getCache('APP_TYPE') === commonConstants.PROMOTIONS_APP_TYPE ?
                <PromoSplashComponent status={this.isValidPromo}></PromoSplashComponent> : null}
                </div>                                
                
                }
            <Modal size="lg" show={this.state.showfaq} onHide={() => this.handlefaqClose()}>
            <Modal.Header closeButton>
                <b>  MyTix Student Monthly Pass FAQs </b>
            </Modal.Header>
            <Modal.Body style={modalStyle}>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="bg mt-n2">
                            <div className="container mt-2 pb-4">
                                <div className="row justify-content-center">
                                    <div class="col-md-12 reg mt-4">
                                        <div class="content">
                                            <div>
                                                <span className="pss text2 mb-3">About the App</span><br></br>
                                                <label className="lbl mb-0">where can I use mobile student monthly pass?</label>
                                                <p className="txt">Mobile passes are available for travel on all NJ TRANSIT rail lines, bus routes and light rail</p>
                                            </div>
                                            <div>
                                                <label className="lbl mb-0">Which mobile devices can run the app?</label>
                                                <p className="txt">The NJ TRANSIT Mobile App is available for iPhone, iPad & Android devices only. iPhone and iPad devices require iOS 8.0 or higher, and Android devices require Android OS 6.0 or higher. Rooted and jailbroken devices are not supported.</p>
                                            </div>
                                            <div>
                                                <label className="lbl mb-0">Can I use MyTix on multiple devices?</label>
                                                <p className="txt">To ensure access to your ticket(s), your MyTix account must be accessed from a single device.</p>
                                            </div>
                                            <div>
                                                <span className="pss text2 mb-3">Student Monthly Passes</span><br></br>
                                                <label className="lbl mb-0">How do I purchase my first mobile Student Monthly Pass?</label>
                                                <p className="txt">Full-time college students can save 25 percent on NJ TRANSIT Monthly Passes when their school participates in our University Partnership Program. Sign up through the participating college/university student web portal and click the MyTix Student Enrollment link to complete your enrollment.</p>
                                            </div>
                                            <div>
                                                <label className="lbl mb-0">Once I have completed my enrollment, how do I purchase my student monthly pass in subsequent months?</label>
                                                <p className="txt">During the enrollment process your status as a full time student is confirmed with your college/university, you are then eligible to purchase the discounted student pass for the balance of that semester. You can purchase the discounted pass directly in the NJT app.</p>
                                            </div>

                                            <div>
                                                <label className="lbl mb-0">For which months can I purchase a student monthly pass?</label>
                                                <p className="txt">Student monthly passes are sold for travel during the months from August through May. They are not available for June or July.</p>
                                            </div>
                                            <div>
                                                <label className="lbl mb-0">What forms of payment can I use?</label>
                                                <p className="txt">MyTix accepts credit and debit cards, Apple Pay, Google Pay and PayPal.</p>
                                            </div>
                                            <div>
                                                <label className="lbl mb-0">When can I purchase my student monthly pass?</label>
                                                <p className="txt">You may purchase a monthly pass beginning at 5:00 p.m. on the 19th of the previous month until 11:59 pm on the 10th of the month in which the pass is valid.</p>
                                            </div>
                                            <div>
                                                <label className="lbl mb-0">If I have a student monthly pass, can I purchase round trip and one way rail tickets for friends & family traveling with me?</label>
                                                <p className="txt">Yes, you may. Simply select the Buy option in the navigation menu to purchase any additional tickets.</p>
                                            </div>
                                            <div>
                                                <label className="lbl mb-0">How do I use my Student Monthly Pass?</label>
                                                <p className="txt">The Student Monthly pass is for the personal use of the Student who purchased it and is restricted for use traveling to/from stations indicated on the pass for the sole purpose of attending school. Student passes are not honored to or from any other rail station except those printed on the pass, but they may be used on certain buses and light rail vehicles as permitted under NJ TRANSIT cross-honoring policies.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>      
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className="form-group col-md-2 margin_auto">
                   <button type="submit" onClick={this.handlefaqClose}
                    className="btn btn-primary login-button">Close</button>
                </div>        
            </Modal.Footer>
        </Modal>
    
        
            </div>
            </LoadingOverlay>   
             
        );
    }

}

export default withTranslation()(LoginComponent);
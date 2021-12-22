import React, { Component } from 'react';
import '../css/Student-style.scss';
import { StudentTicketingService } from '../services/StudentTicketingService';
import { CacheService } from '../../framework/services/CacheService';
import { MessageService } from '../../framework/services/MessageService';
import * as commonConstants from '../../common/services/CommonConstants';
import StudentSplashComponent from './StudentSplashComponent';
import { ValidationService } from '../../framework/services/ValidationService';
import { ReCaptcha } from 'react-recaptcha-google';
import { withTranslation } from 'react-i18next';
import LoadingOverlay from 'react-loading-overlay'
import LoadingComponent from '../../common/components/LoadingComponent';
import { Modal } from 'react-bootstrap';

const modalStyle = {
    overflowY: "scroll",
    maxHeight:"35em"   
}

class StudentRegistrationComponent extends Component {
    constructor(props) {
        super(props);
        let search = props.location.search;
        let params = new URLSearchParams(search);
        this.university_code = params.get('university_code');
        this.student_id = params.get('student_id');
      
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
            isActive : true,
            outcome : 'init',
            respMsg : '',
            showfaq : false,
            user : {}

        }

      
        this.recaptcha = React.createRef();
        this.CacheService = new CacheService();
        this.MessageService = new MessageService();
        this.StudentTicketingService = new StudentTicketingService();
        this.ValidationService = new ValidationService();
        this.registerStudent = this.registerStudent.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste =this.onPaste.bind(this);
        this.validate = this.validate.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
        this.verifyCallback = this.verifyCallback.bind(this);
        this.clearRecaptchaToken = this.clearRecaptchaToken.bind(this);
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

    componentDidMount() {
         this.setState({isActive : true});
         let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
         if(app_config !== "undefined") {
            let user_config = JSON.parse(app_config)['home_config']['user_account'];
             this.setState({user_config : user_config});
             this.homeimgUrl  = user_config['HOME_IMAGE_URL'];
             this.CacheService.setCache('HOME_IMAGE_URL', this.homeimgUrl+'?v=' + Date.now());
             this.CacheService.setCache('WELCOME_IMAGE_URL', user_config['WELCOME_IMAGE_URL']+'?v=' + Date.now());
            
            if (this.recaptcha && this.state.user_config['ENABLE_CAPTCHA'] === 'Y') {
                this.recaptcha.current.reset();
            }  
            this.setState({isActive : false});
        } else {
            this.setState({outcome : 'invalidSchool'});
        }
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

        this.ValidationService.validateForm('registerStudentUser', request).then(result => {

                this.setState({ validateResponse: result });
        }).catch(error => {
            this.setState({isActive : false});
            
        });
    }

    onBlur(e) {
        this.validate();
    }


    registerStudent(e) {
        e.preventDefault();
        this.setState({ isemailSame: 'YES' });  
        this.setState({ isPwdsSame: 'YES' });
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
        let request = {};
        let user = {};
        user.lastName = this.state.lastName;
        user.email = this.state.email;
        this.setState({user : user});

        request.firstName = this.state.firstName;
        request.lastName = this.state.lastName;
        request.phoneNo = this.state.phoneNo;
        request.email = this.state.email;
        request.password = this.state.password;
        request.zipCode = this.state.zipCode;
        request.studentId = this.CacheService.getCache('student_id');         
        request.universityCode = this.CacheService.getCache('university_code');
        if(this.state.user_config['ENABLE_CAPTCHA'] === 'Y')
            request.recaptchaResponse = this.state.captchaverifyToken;
        request.app_type = this.CacheService.getCache(commonConstants.APP_TYPE_CONSTANT);
        this.ValidationService.validateForm('registerStudentUser', request).then(result => {
            this.setState({ validateResponse: result });
            if (this.state.validateResponse.isValid) {
                request.phoneNo = this.state.phoneNo.replaceAll('-','');
                request.phoneNo = this.state.phoneNo.replaceAll('(','');
                request.phoneNo = this.state.phoneNo.replaceAll(')','');
                this.StudentTicketingService.registerStudent(request).then(response => {
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
                        this.recaptcha.current.reset();
                    }
                    let cacheresponse = JSON.parse(this.CacheService.getCache('response'));
                    let msgDesc = this.MessageService.getMessageDesc(cacheresponse.data.msg_code);
                    this.setState({respMsg : msgDesc.msgValue});  

                    this.setState({outcome : 'registerSuccess'});
                    this.setState({isActive : false});

                }).catch(error => {
                    this.setState({isActive : false});
                    let cacheresponse = JSON.parse(this.CacheService.getCache('response'));
                    let msgDesc = this.MessageService.getMessageDesc(cacheresponse.data.msg_code);
                    this.setState({respMsg : msgDesc.msgValue});  
                    this.setState({outcome : 'REGISTERFAILED'});
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
        <LoadingOverlay
          active={this.state.isActive}
          spinner={<LoadingComponent />}
          >
           {this.state.outcome === 'init' ?
            <div id="sticketReg-container" className="vh-100">
                <div className="heading">
                    <span>Student Ticketing</span>
                </div>

                <div className="stdntbg">
                
                <div >
                <img id="student_banner" className="d-block w-100" src={require("../images/student_registration_banner.jpg")} alt="Second slide"></img>
                </div>

                    <div className="container mt-2 pb-4">
                        <div className="row">

                            <div className="col-md-4">

                                <div className="box">
                                    <span className="box-head">Create your MyTix Student Monthly {('\n')} {'       '}Pass account with these simple steps.</span>
                                    <ul>
                                        <li>1. Fill in all required fields on the registration form.  </li>
                                        <li>2. Verify your student email address.</li>
                                        <li>3. Download the NJ TRANSIT App and buy your{('\n')} {'       '}MyTix Student Monthly Pass.</li>
                                    </ul>
                                </div>


                                <div className="box2">
                                    <span className="box-head p-3 underline"><a onClick={this.handlefaqmodal}>
                                        MyTix Student Monthly Pass FAQs.</a></span>
                                    <p className="terms"><b>Terms of Use</b> {'\n'} {t('label_msg.loginTerms')}</p>
                                </div>


                            </div>

                            <div className="col-md-6">
                                <form id="student-ticketing-login-form"className="form-horizontal col-md-12 reg p-4" method="post" action="#" onSubmit={this.registerStudent}>

                                    <div className="form-head">
                                        <span>New Student Registration</span>
                                    </div>

                                    <div className="form-group mt-4">
                                        <label htmlFor="name" className="cols-sm-2 control-label">{t('label_label.firstName')}<span className="mandate">*</span></label>
                                        <div className="cols-sm-6">
                                            <div className="input-group">
                                                <input type="text" className="form-control App" name="firstName" id="student-register-fname"
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
                                                <input type="text" className="form-control App" name="lastName" id="student-register-lname"
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
                                        <label id="student_register_email_lbl" htmlFor="student_register_email" className="cols-sm-2 control-label"> {t('label_label.email')}<span className="mandate">*</span></label>
                                        <div className="cols-sm-6">
                                            <div className="input-group">
                                                <input type="text" className="form-control App" name="email" id="student_register_email" 
                                                    placeholder={t('label_label.email')} onCopy={this.onCopy} onPaste={this.onPaste} value={this.state.email} onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                        <label id="student_reg_confirmemail_lbl" htmlFor="student_reg_confirmemail" 
                                        className="cols-sm-2 control-label"> {t('label_label.confitmemail')}<span className="mandate">*</span></label>
                                        <div className="cols-sm-6">
                                            <div className="input-group">
                                                <input type="text" className="form-control App" name="confirmEmail" id="student_reg_confirmemail"
                                                    placeholder={t('label_label.confitmemail')} autoComplete="off" onCopy={this.onCopy} onPaste={this.onPaste} value={this.state.confirmEmail} onChange={this.handleChange} onBlur={this.onBlur}/>
                                            </div>
                                            {this.state.validateResponse.email_error === 'required' ?
                                                <span className="form_error"> {t('label_label.emailRequired')} </span> : null}
                                            {this.state.validateResponse.email_error === 'minLength' ?
                                                <span className="form_error"> {t('label_label.emailMinlength')}. </span> : null}
                                            {this.state.validateResponse.email_error === 'maxLength' ?
                                                <span className="form_error">{t('label_label.emailMaxlength')} </span> : null}
                                            {this.state.validateResponse.email_error === 'regex' ?
                                                <span className="form_error"> {t('label_label.emailInvalid')}</span> : null}
                                            {this.state.isemailSame === 'NO' ?
                                                <span className="form_error">  {t('label_label.emailMatch')} </span> : null}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label id="student_register_password_lbl" htmlFor="student_register_password" className="cols-sm-2 control-label">{t('label_label.password')} <span className="mandate">*</span></label>
                                        <div className="cols-sm-6">
                                            <div className="input-group">
                                                <input type="password" className="form-control App" name="password" id="student_register_password"
                                                    placeholder={t('label_label.password')} value={this.state.password} onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                                <input type="password" className="form-control App" name="confirmPassword" id="student-register-confirmpassword"
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
                                                <input type="phone" className="form-control App" name="phoneNo" id="student-register-phone"
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
                                                <input type="zip" className="form-control App" name="zipCode" id="student-register-zip"
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
                                    <div className="text-center mt-3">
                                        <ReCaptcha id="student_register_captcha"
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

                                    <div className="form-group mt-3">
                                        <button id="student_register_btn" type="submit"
                                        disabled={this.state.user_config['ENABLE_CAPTCHA'] === 'Y' && 
                                        (this.state.captchaverifyToken === '' || this.state.captchaverifyToken.trim().length === 0)}
                                        className="btn btn-primary btn-lg btn-block login-button register mt-4">{t('label_btn.register')}</button>
                                    </div>
                                    
                                </form>
                            </div>
                        </div>
                    </div>
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
            </div> </div> : <StudentSplashComponent outcome={this.state.outcome} respMsg={this.state.respMsg} user={this.state.user} > </StudentSplashComponent> 

        }
        </LoadingOverlay>
        );
    }
}

export default withTranslation()(StudentRegistrationComponent);
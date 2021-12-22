import React, { Component } from 'react';
import MenuBarComponent from './MenuBarComponent';
import { BrowserView, MobileView} from "react-device-detect";
import MobileMenuBarComponent from './MobileMenuBarComponent';
import { EticketingService } from '../services/EticketingService';
import { CommonService } from '../../common/services/CommonService';
import { RestService } from '../../framework/services/RestService';
import { CacheService } from '../../framework/services/CacheService';
import { MessageService } from '../../framework/services/MessageService';
import { ValidationService } from '../../framework/services/ValidationService';
import { ExceptionHandlingService } from '../../framework/services/ExceptionHandlingService';
import { withTranslation } from 'react-i18next';
import  LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';
import {ETICKETTING_PATH} from '../../framework/services/ApplicationConstants';
import { UserAgent } from 'react-ua';
import {Card, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import PasswordStrengthMeter from '../../common/components/PasswordStrengthMeter';
import Modal from "react-bootstrap/Modal";


const imgStyle = {
    height: "12em",
    width: "90%",
    margin: 'auto'
};
const njtEditFont = {
    color: "#F5600C",
    fontSize: "1.3em",
    algin:"center",
    fontWeight: 600
}
const modalStyle = {
    minWidth:"15em"   
}

class UserProfileComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userProfile_firstName: '',
            userProfile_lastName: '',
            userProfile_email: '',
            userProfile_currentPassword: '',
            userProfile_newPassword: '',
            userProfile_confirmPassword: '',
            validateResponse: {},
            userProfile_phoneNo: '',
            userProfile_zipCode: '',
            validation: {},
            isPwdsSame : 'YES',
            userData:{},
            isActive : true,
            showEdit:true,
            updateButton:false,
            updateUserProfile : false,            
            disablePassword: true,
            showConfirmPopUp:false
        }

        this.browser = '';
        this.os = '';
        this.CacheService = new CacheService();
        this.CacheService.getCache("userData");
        this.EticketingService = new EticketingService();
        this.ValidationService = new ValidationService();
        this.CommonService = new CommonService();
        this.RestService = new RestService();
        this.handleChange = this.handleChange.bind(this);
        this.validate = this.validate.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.confirmUpdateUserProfile = this.confirmUpdateUserProfile.bind(this);
        this.ExceptionHandlingService = new ExceptionHandlingService();
        this.MessageService = new MessageService();
        this.editProfile = this.editProfile.bind(this);
        this.editPassword = this.editPassword.bind(this);
        this.updateEditPassword = this.updateEditPassword.bind(this);
        this.updateEditProfile = this.updateEditProfile.bind(this);
        this.closePopUp = this.closePopUp.bind(this);
        this.openPopUp = this.openPopUp.bind(this);
    }

    componentDidMount() {
            this.setState({isActive : true});                    

        let uid = this.CacheService.getCache("uid");
        if(!uid) {
            this.MessageService.setMessageToDisplay(117);
            this.props.history.push(ETICKETTING_PATH);
        } else {
            this.setCachedUserData();
        }
        this.setState({isActive : false});
    }

    async handleChange(e) {
        const { name, value } = e.target;
        await this.setState({ [name]: value });     
        this.validate();   
    }

    handleClose = () => {
        this.setState({isActive : false});
    }
    closePopUp(){
        this.setState({showConfirmPopUp : false});
    }
    openPopUp(){
        this.setState({showConfirmPopUp : true});
    }

    setCachedUserData(){
        let user = JSON.parse(this.CacheService.getCache("user"));
        this.setState({userProfile_firstName : user.firstName});
        this.setState({userProfile_lastName : user.lastName});
        this.setState({userProfile_phoneNo : user.phoneNo});
        this.setState({userProfile_email : user.email});
        this.setState({userProfile_zipCode : user.zipCode});
    }

    updateUserCache() {
        this.CacheService.removeDataFromCache('user');
        let user = {};
        user.firstName = this.state.userProfile_firstName;
        user.lastName = this.state.userProfile_lastName;
        user.phoneNo = this.state.userProfile_phoneNo;
        user.email = this.state.userProfile_email;
        user.zipCode = this.state.userProfile_zipCode;
        this.CacheService.setCache('user', JSON.stringify(user));

    }

    onBlur(e) {
        this.validate();
    }

    validate(){
        
        let request = {};

        let validateResponse = {};
        this.setState({validateResponse : validateResponse});

        if(this.state.userProfile_firstName !== ''){
        request.firstName = this.state.userProfile_firstName;
        }
        if(this.state.userProfile_lastName !== ''){
        request.lastName = this.state.userProfile_lastName;
        }
        if(this.state.userProfile_phoneNo !== ''){
        request.phoneNo = this.state.userProfile_phoneNo;
        }
        if(this.state.userProfile_newPassword !== '') {
            request.newPassword = this.state.userProfile_newPassword;
        }
        if(this.state.userProfile_currentPassword !== '') {
        request.currentPassword = this.state.userProfile_currentPassword;
        }
        if(this.state.userProfile_zipCode !== '') {
        request.zipCode = this.state.userProfile_zipCode;
        }

        if(this.state.userProfile_firstName === '' || this.state.userProfile_lastName === '' ||
            this.state.userProfile_phoneNo === '' || this.state.userProfile_zipCode === '' || 
            this.state.userProfile_currentPassword === ''){
                this.setState({updateButton:false});
        }
        if(this.state.userProfile_firstName !== '' && this.state.userProfile_lastName !== '' &&
        this.state.userProfile_phoneNo !== '' && this.state.userProfile_zipCode !== '' && 
        this.state.userProfile_currentPassword !==''){
            this.setState({updateButton:true});
        }

        
        this.ValidationService.validateForm('updateAccount', request).then(result => {

                this.setState({ validateResponse: result });
        }).catch(error => {
            this.setState({isActive : false});
            
        });
    }

    renderTooltip = (props) => (
        
        <Tooltip className="mytooltip1" id="button-tooltip" effect="solid" {...props}>
        <PasswordStrengthMeter password = {this.state.userProfile_newPassword}></PasswordStrengthMeter>
        {this.state.userProfile_newPassword === "" ?
            <label className="cols-sm-2 control-label text-black"> Note : Password is case sensitive and must be at least 8 characters and contain at least one lowercase letter, one uppercase letter, one number, and one symbol from the following @#$&=+</label>    
        :null}                         
        </Tooltip>
      );

    confirmUpdateUserProfile() {
            this.setState({ isPwdsSame: 'YES' });
            this.setState({ isOldPwd: 'NO'}); 
            let validateResponse = {};
            this.setState({validateResponse : validateResponse});     

       if(this.state.userProfile_newPassword !== this.state.userProfile_confirmPassword || 
           this.state.userProfile_newPassword === this.state.userProfile_currentPassword) {
            let isPwdsSame = this.state.userProfile_newPassword !== this.state.userProfile_confirmPassword ? 'NO' : 'YES';
            let isOldPwd = this.state.userProfile_newPassword === this.state.userProfile_currentPassword ? 'YES' : 'NO';
            this.setState({ isPwdsSame: isPwdsSame });
            this.setState({ isOldPwd: isOldPwd});   
            this.setState({showConfirmPopUp : false});                  
            return;        
        } 
        this.setState({ submitted: true });
        this.setState({isActive : true});
        this.setState({showConfirmPopUp : false});
        let request = {};
        request.firstName = this.state.userProfile_firstName;
        request.lastName = this.state.userProfile_lastName;
        request.phoneNo = this.state.userProfile_phoneNo;
        request.email = this.state.userProfile_email;
        if(this.state.userProfile_newPassword !== '') {
            request.newPassword = this.state.userProfile_newPassword;
        }

        request.currentPassword = this.state.userProfile_currentPassword;
        
        request.zipCode = this.state.userProfile_zipCode;
        this.ValidationService.validateForm('updateAccount', request).then(result => {
            this.setState({ validateResponse: result });
            if (this.state.validateResponse.isValid) {
               
                    this.EticketingService.updateUserProfile(request).then(response => {
                        this.updateUserCache();
                        this.setState({isActive : false});
                        if(this.state.userProfile_newPassword !== ''){
                            this.EticketingService.logout().then(response => {
                            this.CacheService.removeDataFromCache('ticket_data');
                            this.CacheService.removeDataFromCache('uid');
                            this.props.history.push(ETICKETTING_PATH + '/login');
                            
                            }).catch(error => {
                                this.CacheService.removeDataFromCache('ticket_data');
                                this.CacheService.removeDataFromCache('uid');
                                this.props.history.push(ETICKETTING_PATH + '/login');
                            });
                        }                     
                         this.setState({
                            userProfile_currentPassword: '',
                            userProfile_newPassword: '',
                            userProfile_confirmPassword: '',
                        });
                        this.editProfile();
                        this.editPassword();
                        if(this.state.userProfile_currentPassword!=='' && this.state.userProfile_newPassword!==''&& this.state.userProfile_confirmPassword!==''){
                            this.setState({updateButton:true})
                        }
                        if(this.state.userProfile_currentPassword!==''){
                            this.setState({updateButton:true})
                        }
                    }).catch(error => {
                        this.setState({isActive : false});            
                    });
                
            } else {

                if(this.state.userProfile_newPassword !== '' && (this.state.validateResponse.newPassword_error === 'minLength' ||
                   this.state.validateResponse.newPassword_error === 'maxLength' || this.state.validateResponse.newPassword_error === 'regex')){
                    
                    this.setState({showConfirmPopUp : false});  
                    this.setState({isActive : false}); 
                }else{
                    var element = document.getElementById("msg_description");
                            element.innerHTML = "Please update the User Profile"; 
                            element.setAttribute('class', "alert alert--error alert--dismissible message-container-error"); 
                            setTimeout(() => {
                                element.innerHTML = ""; 
                            element.setAttribute('class', ""); 
                            }, 5000);
                    this.editProfile();
                }
                this.setState({isActive : false});
            }
        }).catch(error => {
             this.setState({isActive : false});     
        });
    }


    async editProfile(){
        await this.setState({showEdit : (!this.state.showEdit)});
        await this.setState({disablePassword : true});
        this.setState({updateButton:false,updateUserProfile : false, userProfile_currentPassword: '',
        userProfile_newPassword: '',
        userProfile_confirmPassword: ''});
        if(this.state.showEdit){
            this.setCachedUserData();
        }
        let validateResponse = {};
        this.setState({validateResponse : validateResponse});
    }

    async editPassword(){
        await this.setState({disablePassword : (!this.state.disablePassword)});
        await this.setState({showEdit : true});
        this.setState({updateButton:false,updateUserProfile : false, userProfile_currentPassword: '',
        userProfile_newPassword: '',
        userProfile_confirmPassword: ''});
        if(this.state.showEdit){
            this.setCachedUserData();
        }
        let validateResponse = {};
        this.setState({validateResponse : validateResponse});
    }

    async updateEditProfile(e){
        const { name, value } = e.target;
        await this.setState({ [name]: value});
        if(this.state.userProfile_currentPassword!==''){
            this.setState({updateButton:true});
        }
        if(this.state.userProfile_currentPassword ===''){
            this.setState({updateButton:false});
        }
        this.validate();
    }

    async updateEditPassword(e){
        const { name, value } = e.target;
        await this.setState({ [name]: value});
        
        let validateResponse = {};
        this.setState({validateResponse : validateResponse});

        if(this.state.userProfile_currentPassword!=='' && this.state.userProfile_newPassword!==''&& this.state.userProfile_confirmPassword!==''){
            this.setState({updateButton:true})
        }
        if(this.state.userProfile_currentPassword ==='' || this.state.userProfile_newPassword ==='' || this.state.userProfile_confirmPassword ===''){
            this.setState({updateButton:false})
        }

        if(this.state.userProfile_newPassword !== this.state.userProfile_confirmPassword || 
            this.state.userProfile_newPassword === this.state.userProfile_currentPassword) {
             let isPwdsSame = this.state.userProfile_newPassword !== this.state.userProfile_confirmPassword ? 'NO' : 'YES';
             let isOldPwd = this.state.userProfile_newPassword === this.state.userProfile_currentPassword ? 'YES' : 'NO';
             this.setState({ isPwdsSame: isPwdsSame });
             this.setState({ isOldPwd: isOldPwd});                     
             return;        
         }
         if(this.state.userProfile_newPassword === this.state.userProfile_confirmPassword){
            let isPwdsSame = this.state.userProfile_newPassword !== this.state.userProfile_confirmPassword ? 'NO' : 'YES';
            this.setState({ isPwdsSame: isPwdsSame });
         }
    }

    render() {
        const { t } = this.props;
        return (
            <div id="eticketing-userProfile">
                
                <UserAgent>

                    {v => {
                        this.browser = v.browser.name;
                        this.os = v.os.name;
                    }}
                    </UserAgent>
                    <BrowserView>
                    <div className="heading">
                        <span>{t('label_title.appTypeTitle')} </span>
                    </div>
                    </BrowserView>
                    <MobileView>
                    <div className="heading">
                        <span>{t('label_title.appTypeTitle')} </span>
                    </div>
                    </MobileView>
                <LoadingOverlay
              active={this.state.isActive}
              spinner={<LoadingComponent />}>
                <div className="mt-n2">
                    <div className="container mt-2 pb-4">
                    <div className="row mt-4 justify-content-center">
                    <div className="col-md-3 mb-4">
                        <BrowserView>
                            <MenuBarComponent selectedMenu="user-profile"> </MenuBarComponent>
                        </BrowserView>
                        <MobileView>
                            <MobileMenuBarComponent selectedMenu="user-profile"> </MobileMenuBarComponent>
                        </MobileView>
                    </div>
                    <div  className="col-md-9" tabIndex="-1">
                    <div id="userProfile_form" className="form-horizontal reg p-4 App">
                        <div className = "row">
                        <div className = "col-md-8">
                        <div className="form-head text-left">
                            <span>{t('label_title.userProfile')}</span>
                        </div>
                        </div>
                        <div className="col-md-4 text-right">
                            <a id="editProfile" name="editProfile"  style={njtEditFont}
                                onClick={ this.editProfile} className="text1 float-right p-0 link2"> 
                                <i className="fa fa-edit ml-2"  > </i> </a>
                        </div>
                        </div>
                        {this.state.showEdit ?
                    <div className="bg-light p-4 mb-2">
                        <div className="row mb-2">
                        <div className="col-md-4 control-label">{t('label_label.firstName')}
                        <span className="mandate">*</span> : </div>
                        <div className="col-md-6">{this.state.userProfile_firstName}</div>
                        </div>
                        <div className="row mb-2">
                        <div className="col-md-4 control-label">{t('label_label.lastName')}
                        <span className="mandate">*</span> : </div>
                        <div className="col-md-6">{this.state.userProfile_lastName}</div>
                        </div>
                        <div className="row mb-2">
                        <div className="col-md-4 control-label">{t('label_label.email')}
                        <span className="mandate">*</span> : </div>
                        <div className="col-md-6">{this.state.userProfile_email}</div>
                        </div>
                        <div className="row mb-2">
                        <div className="col-md-4 control-label">{t('label_label.phone')} 
                        <span className="mandate">*</span> : </div>
                        <div className="col-md-6">{this.state.userProfile_phoneNo}</div>
                        </div>
                        <div className="row">
                        <div className="col-md-4 control-label">{t('label_label.zip')} 
                        <span className="mandate">*</span> : </div>
                        <div className="col-md-6">{this.state.userProfile_zipCode}</div>
                        </div>
                        
                        
                    </div> :!this.state.showEdit ?
                        <div>
                        <div className="form-group mt-4">
                            <label htmlFor="userProfile_firstName" className="cols-sm-2 control-label">
                                {t('label_label.firstName')} <span className="mandate">*</span></label>
                            <div className="cols-sm-6">
                                <div className="input-group">
                                    <input type="text" className="form-control App" name="userProfile_firstName" id="userProfile_firstName" 
                                    placeholder={t('label_label.firstName')} value={this.state.userProfile_firstName} 
                                    onChange={this.handleChange} onBlur={this.onBlur}/>
                                </div>
                            </div>
                            {this.state.validateResponse.firstName_error === 'required' ?
                                <span className="form_error"> {t('label_label.firstNameRequired')} </span> : null}
                            {this.state.validateResponse.firstName_error === 'minLength' ?
                                <span className="form_error"> {t('label_label.firstNameMinlength')} </span> : null}
                            {this.state.validateResponse.firstName_error === 'maxLength' ?
                                <span className="form_error"> {t('label_label.firstNameMaxlength')} </span> : null}
                            {this.state.validateResponse.firstName_error === 'regex' ?
                                <span className="form_error"> {t('label_label.firstNameInvalid')} </span> : null}
                        </div>
                        <div className="form-group">
                            <label htmlFor="userProfile_lastName" className="cols-sm-2 control-label">
                                {t('label_label.lastName')} <span className="mandate">*</span></label>
                            <div className="cols-sm-6">
                                <div className="input-group">
                                    <input type="text" className="form-control App"  name="userProfile_lastName" id="userProfile_lastName" 
                                    placeholder={t('label_label.lastName')} value={this.state.userProfile_lastName} 
                                    onChange={this.handleChange} onBlur={this.onBlur}/>
                                </div>
                            </div>
                            {this.state.validateResponse.lastName_error === 'required' ?
                                <span className="form_error"> {t('label_label.lastNameRequired')} </span> : null}
                            {this.state.validateResponse.lastName_error === 'minLength' ?
                                <span className="form_error"> {t('label_label.lastNameMinlength')} </span> : null}
                            {this.state.validateResponse.lastName_error === 'maxLength' ?
                                <span className="form_error"> {t('label_label.lastNameMaxlength')} </span> : null}
                            {this.state.validateResponse.lastName_error === 'regex' ?
                                <span className="form_error"> {t('label_label.lastNameInvalid')} </span> : null}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="userProfile_email" className="cols-sm-2 control-label"> 
                            {t('label_label.email')} <span className="mandate">*</span></label>
                            <div className="cols-sm-6">
                                <div className="input-group">
                                    <input type="text" className="form-control App" name="userProfile_email" id="userProfile_email" disabled = {true}
                                        placeholder={t('label_label.email')} value={this.state.userProfile_email} 
                                        onChange={this.handleChange}/>
                                </div>
                            </div>
                            {this.state.validateResponse.email_error === 'required' ?
                                    <span className="form_error"> {t('label_label.emailRequired')} </span> : null}
                                {this.state.validateResponse.email_error === 'minLength' ?
                                    <span className="form_error"> {t('label_label.emailMinlength')} </span> : null}
                                {this.state.validateResponse.email_error === 'maxLength' ?
                                    <span className="form_error"> {t('label_label.emailMaxlength')} </span> : null}
                                {this.state.validateResponse.email_error === 'regex' ?
                                    <span className="form_error"> {t('label_label.emailInvalid')} </span> : null}

                        </div>
                        <div className="form-group">
                            <label htmlFor="userProfile_phoneNo" className="cols-sm-2 control-label">
                                {t('label_label.phone')}<span className="mandate">*</span></label>
                            <div className="cols-sm-6">
                                <div className="input-group">
                                    <input type="phone" className="form-control App" name="userProfile_phoneNo" id="userProfile_phoneNo"
                                        placeholder={t('label_label.phone')}  value={this.state.userProfile_phoneNo} 
                                        onChange={this.handleChange} onBlur={this.onBlur}/>
                                </div>
                            </div>
                            {this.state.validateResponse.phoneNo_error === 'required' ?
                                <span className="form_error">{t('label_label.phoneRequired')} </span> : null}
                            {this.state.validateResponse.phoneNo_error === 'minLength' ?
                                <span className="form_error"> {t('label_label.phoneMinlength')} </span> : null}
                            {this.state.validateResponse.phoneNo_error === 'maxLength' ?
                                <span className="form_error"> {t('label_label.phoneMaxlength')}</span> : null}
                            {this.state.validateResponse.phoneNo_error === 'regex' ?
                                <span className="form_error"> {t('label_label.phoneInvalid')} </span> : null}
                        </div>
                        <div className="form-group">
                            <label htmlFor="userProfile_zipCode" className="cols-sm-2 control-label">
                                {t('label_label.zip')}<span className="mandate">*</span></label>
                            <div className="cols-sm-6">
                                <div className="input-group">
                                    <input type="zip" className="form-control App" name="userProfile_zipCode" id="userProfile_zipCode"
                                        placeholder={t('label_label.zip')}  value={this.state.userProfile_zipCode} 
                                        onChange={this.handleChange} onBlur={this.onBlur}/>
                                </div>
                            </div>
                            {this.state.validateResponse.zipCode_error === 'required' ?
                                <span className="form_error"> {t('label_label.zipRequired')} </span> : null}
                            {this.state.validateResponse.zipCode_error === 'minLength' ?
                                <span className="form_error">{t('label_label.zipMinlength')} </span> : null}
                            {this.state.validateResponse.zipCode_error === 'maxLength' ?
                                <span className="form_error"> {t('label_label.zipMaxlength')} </span> : null}
                            {this.state.validateResponse.zipCode_error === 'regex' ?
                                <span className="form_error"> {t('label_label.zipInvalid')} </span> : null}
                        </div>

                        <div>
                        <div className="">
                        <div className="row">
                        <div className="form-group col-12">
                                <label htmlFor="userProfile_currentPassword" className="control-label">
                                    {t('label_label.enterCurrentPassword')}
                                    <span className="mandate">*</span></label>
                                <div className="">
                                    <div className="input-group">
                                        <input type="password" className="form-control App" name="userProfile_currentPassword" 
                                        id="userProfile_currentPassword" placeholder='Current Password' 
                                         onChange={this.updateEditProfile} onBlur={this.onBlur}/>
                                    </div>
                                    {this.state.validateResponse.currentPassword_error === 'required' ?
                                    <span className="form_error"> {t('label_label.currentPasswordRequired')} </span> : null}
                                {this.state.validateResponse.currentPassword_error === 'minLength' ?
                                    <span className="form_error"> {t('label_label.currentPasswordMinlength')} </span> : null}
                                {this.state.validateResponse.currentPassword_error === 'maxLength' ?
                                    <span className="form_error"> {t('label_label.currentPasswordMaxlength')} </span> : null}
                                {this.state.validateResponse.currentPassword_error === 'regex' ?
                                    <span className="form_error"> {t('label_label.currentPasswordInvalid')} </span> : null}

                                </div>
                        </div> 
                        </div>
                        </div> </div>
                        <div className="form-group ">
                        <button onClick={this.confirmUpdateUserProfile} disabled = {!this.state.updateButton}  
                        className="btn btn-primary btn-lg login-button register mt-2 m-auto">{t('label_btn.update')} </button>
                        </div>

                        </div>:null}

                        <div className="form-group">
                            <label htmlFor="editPassword" className="form-head text-left">
                                {t('label_label.changePassword')}</label>
                            <a id="editPassword" name="editPassword"  style={njtEditFont}
                                    onClick={ this.editPassword} 
                                    className="text1 float-right p-0 link2">  <i 
                                    className="fa fa-edit ml-2" > </i>  </a>
                            
                        </div>
                        {(!this.state.disablePassword) ?
                        <div className="px-2 py-1">
                        <div className="bg-light p-3 my-2">    
                        <div className="form-group">
                            <label htmlFor="userProfile_currentPassword" className="cols-sm-2 control-label">
                            {t('label_label.enterCurrentPassword')} <span className="mandate">*</span></label>
                            <div className="cols-sm-6">
                                <div className="input-group">
                                    <input type="password" className="form-control App" name="userProfile_currentPassword" 
                                    id="userProfile_currentPassword" placeholder='Current Password' 
                                     onChange={this.updateEditPassword}/>
                                </div>
                                {this.state.validateResponse.currentPassword_error === 'required' ?
                                    <span className="form_error"> {t('label_label.currentPasswordRequired')} </span> : null}
                                {this.state.validateResponse.currentPassword_error === 'minLength' ?
                                    <span className="form_error"> {t('label_label.currentPasswordMinlength')} </span> : null}
                                {this.state.validateResponse.currentPassword_error === 'maxLength' ?
                                    <span className="form_error"> {t('label_label.currentPasswordMaxlength')} </span> : null}
                                {this.state.validateResponse.currentPassword_error === 'regex' ?
                                    <span className="form_error"> {t('label_label.currentPasswordInvalid')} </span> : null}
                            </div>
                            </div>                                    
                            <div className="form-group">
                                <label htmlFor="userProfile_newPassword" className="cols-sm-2 control-label">
                                    {t('label_label.newPassword')}<span className="mandate">*</span></label>
                                <div className="cols-sm-6">
                                    <div className="input-group">
                                        <OverlayTrigger
                                            placement="right"
                                            delay={{ show: 250, hide: 400 }}
                                            overlay={this.renderTooltip}>
                                        <input type="password" className="form-control App" name="userProfile_newPassword" 
                                        id="userProfile_newPassword" placeholder={t('label_label.newPassword')} 
                                         onChange={this.updateEditPassword}/>
                                        </OverlayTrigger>
                                    </div>
                                    {this.state.isOldPwd === 'YES' ?
                                    <span className="form_error">{t('label_label.newandcurrent')}  </span>
                                    :
                                    <div>
                                    {this.state.validateResponse.newPassword_error === 'required' ?
                                        <span className="form_error">{t('label_label.newPasswordRequired')} </span> : null}
                                    {this.state.validateResponse.newPassword_error === 'minLength' ?
                                        <span className="form_error"> {t('label_label.newPasswordMinlength')} </span> : null}
                                    {this.state.validateResponse.newPassword_error === 'maxLength' ?
                                        <span className="form_error"> {t('label_label.newPasswordMaxlength')}</span> : null}
                                    {this.state.validateResponse.newPassword_error === 'regex' ?
                                        <span className="form_error"> {t('label_label.newPasswordInvalid')}</span> : null}
                                    </div>
                                    }
                                </div>
                            </div> 
                            <div className="form-group">
                                <label htmlFor="userProfile_confirmPassword" className="cols-sm-2 control-label">
                                    {t('label_label.confirmPassword')} <span className="mandate">*</span></label>
                                <div className="cols-sm-6">
                                    <div className="input-group">
                                        <input type="password" className="form-control App" name="userProfile_confirmPassword" 
                                        id="userProfile_confirmPassword" placeholder={t('label_label.confirmPassword')} 
                                        onChange={this.updateEditPassword}/>
                                    </div>
                                    {this.state.validateResponse.password_error === 'required' ?
                                    <span className="form_error">{t('label_label.verifyPasswordRequired')} </span> : null}
                                    {this.state.validateResponse.password_error === 'minLength' ?
                                        <span className="form_error"> {t('label_label.verifyPasswordMinlength')} </span> : null}
                                    {this.state.validateResponse.password_error === 'maxLength' ?
                                        <span className="form_error"> {t('label_label.verifyPasswordMaxlength')} </span> : null}
                                    {this.state.validateResponse.password_error === 'regex' ?
                                        <span className="form_error"> {t('label_label.verifyPasswordInvalid')} </span> : null}
                                    {this.state.isPwdsSame === 'NO' ?
                                        <span className="form_error"> {t('label_label.passwordMatch')} </span> : null}
                                    </div>
                            </div> 
                            
                            
                            <p className="p-2 mt-3 pnotes">{t('label_label.passwordNote')} </p>
                        </div>
                        <div className="form-group ">
                        <button onClick={this.openPopUp} disabled = {!this.state.updateButton} 
                        className="btn btn-primary btn-lg login-button register mt-2" alt="click here to update user profile">
                            {t('label_btn.update')} </button>
                        </div>
                        
                        </div> : <div className="bg-light p-4 mb-2">
                            <div className="row">
                            <div className="col-md-4 control-label">{t('label_label.currentPassword')}<span className="mandate">*</span> : </div>
                            <div className="col-md-6">********</div>
                            </div>
                        </div>}  

                        </div>

                    </div>
                </div>

  
            <Modal style={modalStyle} show={this.state.showConfirmPopUp} onHide={() => this.closePopUp()}>
                <Modal.Header closeButton>                    
                    {t('label_title.passwordUpdate')}
                </Modal.Header>
                <Modal.Body>
                    <div className="row" tabIndex="-1">
                        <div className="col-sm-12">
                            <div className="form-horizontal col-md-12 p-3">
                            <div className="odr pt-2">
                                    <div className="row m-2 mt-4">
                                        <div className="col-md-12">
                                            <span>Once you change your password, your current session will be killed and you must re-login.</span> <br/>                                            
                                        </div>                                        
                                    </div>
                                    <span className="mt-4"></span>
                                    <div className="row m-2 mt-4">
                                        <div className="col-md-12 mb-4">
                                            <span>Are you sure you want to change your password ?</span> <br/>                                            
                                        </div>                                        
                                    </div>                                    
                                </div>
                            <div className="form-group mt-4 col-md-11 pl-4">
                            <button  onClick={this.confirmUpdateUserProfile}
                            className="btn btn-primary btn-block login-button">{t('label_btn.confirm')}</button>
                            </div>    
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>                                   

                </div>
            </div>
                </LoadingOverlay>
            </div>

        );
    }
}

export default withTranslation() (UserProfileComponent);
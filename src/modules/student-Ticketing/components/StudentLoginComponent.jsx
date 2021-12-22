import React from 'react';
import '../css/Student-style.scss';
import { Link } from 'react-router-dom';
import { UserAgent } from 'react-ua';
import { MessageService } from '../../framework/services/MessageService';
import { StudentTicketingService } from '../services/StudentTicketingService';
import { CommonService } from '../../common/services/CommonService';
import { CacheService } from '../../framework/services/CacheService';
import { RestService } from '../../framework/services/RestService';
import { ValidationService } from '../../framework/services/ValidationService';
import { ExceptionHandlingService } from '../../framework/services/ExceptionHandlingService';
import * as commonConstants from '../../common/services/CommonConstants';
import { ReCaptcha } from 'react-recaptcha-google';
import { withTranslation } from 'react-i18next';
import LoadingOverlay from 'react-loading-overlay'
import LoadingComponent from '../../common/components/LoadingComponent';
import StudentSplashComponent from './StudentSplashComponent';

import { Modal } from 'react-bootstrap';
import {STUDENTTICKET_PATH} from '../../framework/services/ApplicationConstants';

const modalStyle = {
    overflowY: "scroll",
    maxHeight:"35em"   
}


class StudentLoginComponent extends React.Component {
    constructor(props) {
        super(props);
        let search = props.location.search;
        let params = new URLSearchParams(search);
        if (params.get('verification_key')) {
            this.verificationKey = params.get('verification_key');
        }
        this.userConfig = {};
        this.state = {
            error: '',
            email: '',
            password: '',
            value: '',
            submitted: false,
            validateResponse: {},
            user_config : {},
            showfaq : false,
            isActive : true,
            isTokenValid : false,
            outcome : '',
            respMsg : '',
            user : {}

        }
        this.browser = '';
        this.os = '';
        
       
        this.StudentTicketingService = new StudentTicketingService();
        this.CommonService = new CommonService();
        this.RestService = new RestService();
        this.ValidationService = new ValidationService();
        this.ExceptionHandlingService = new ExceptionHandlingService();
        this.MessageService = new MessageService();
        this.CacheService = new CacheService();   
        
        this.setState({isActive : true});              
        let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        if(app_config !== "undefined") {
            let user_config = JSON.parse(app_config)['home_config']['user_account'];
            this.setState({user_config : user_config});
            this.userConfig = user_config;
            this.homeimgUrl  = this.userConfig['HOME_IMAGE_URL'] +'?v=' + Date.now();
            
        } else {
            this.setState({outcome : 'invalidSchool'});
        }
        this.setState({isActive : false});

        if (this.verificationKey) {
            this.extendStudentProfile();
         }  else {
           this.setState({isTokenValid : false});          
         }
     
    }

    extendStudentProfile() {
        this.setState({isActive : true});
        let request = {};
        request.browser = this.browser;
        request.os = this.os;
        request.app_type = commonConstants.STUDENT_TICKETING_APP_TYPE;
        request.verificationKey = this.verificationKey;
        this.ValidationService.validateForm('extendStudentProfile', request).then(result => {
            this.setState({ validateResponse: result });
      if (this.state.validateResponse.isValid) {
        this.StudentTicketingService.extendStudentProfile(request).then(response => {
            this.setState({isTokenValid : true}); 
              let user = {};
              user.firstName = response.content.firstName;
              this.setState({user : user});
              this.CacheService.setCache('university_code', response.content.universityCode);
              this.setState({profExpDate : response.content.profileExpireDate});
              this.setState({outcome : 'activated'});
              this.setState({isActive : false});
        }).catch(error => {  
            this.setState({isActive : false});        	
            this.setState({isTokenValid : false}); 
    	});
        }else{
            this.setState({isActive : false}); 
        }
        }).catch(error => {
            this.setState({isActive : false});
            this.setState({isTokenValid : false}); 
          });
    }
        
 
    render() {
        const { t } = this.props;

    return (

      <div id="student_profile_extend" className="">
        <UserAgent>
          {v => {
            this.browser = v.browser.name;
            this.os = v.os.name;
          }}
        </UserAgent>
        <LoadingOverlay
              active={this.state.isActive}
              spinner={<LoadingComponent />}
              >
        {!this.state.isTokenValid ?
        <div>
            <div className="heading">                          
                <span>{t('label_title.appTypeTitle')}</span>
            </div>
            <div >
                <img id="student_banner" className="d-block w-100" src={require("../../../images/Image16.png")} alt="Second slide"></img>
                </div>
                        
                <div id="student_extend_msg">
                    <div className="container mt-2 ">
                        <div className="row justify-content-center">
                            <div className="col-md-9 py-4 msg">
                                <p className="fail justify-content-center">{t('label_label.profileExtendFailed')}</p>
                                <p className="studentMessages cntr"> {t('label_msg.profileExtendFailed')}  </p>
                                                        
                            </div>

                        </div>
                    </div>    

                </div>
            </div> : <StudentSplashComponent profExpDate={this.state.profExpDate} outcome={this.state.outcome} respMsg={this.state.respMsg}  user={this.state.user} > </StudentSplashComponent>}
            </LoadingOverlay>
      </div>
      


    );
  }
}

export default withTranslation()(StudentLoginComponent);
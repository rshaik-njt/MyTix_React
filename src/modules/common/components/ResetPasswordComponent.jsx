import React from 'react';
import { CommonService } from '../../common/services/CommonService';
import { RestService } from '../../framework/services/RestService';
import { ValidationService } from '../../framework/services/ValidationService';
import { ExceptionHandlingService } from '../../framework/services/ExceptionHandlingService';
import LoadingComponent from '../../common/components/LoadingComponent';
import { CacheService } from '../../framework/services/CacheService';
import { PROMOTIONS_PATH } from '../../framework/services/ApplicationConstants';
import LoadingOverlay from 'react-loading-overlay';

class ResetPasswordComponent extends React.Component {
    constructor(props) {
        super(props);
        let search = props.location.search;
        let params = new URLSearchParams(search);
        if(params.get('resetKey')) {
            this.resetKey = params.get('resetKey').replace(/ /g, '+');
        }
        this.state = {
            confirmPassword: '',
            validateResponse: {},
            isValidToken : true,
            rpStatus : '',
            email : '',
            isActive : true,
        }
 
        this.handleChange = this.handleChange.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.CommonService = new CommonService();
        this.RestService = new RestService();
        this.ValidationService = new ValidationService();
        this.ExceptionHandlingService = new ExceptionHandlingService();
        this.CacheService = new CacheService();

        if(this.resetKey) {
            this.validateResetToken();
        }
        
    }

    componentDidMount() {
        this.CacheService.setCache('isNewUser', 'YES');
    }

    password(event) {
        this.setState({ password: event.target.value })
    }
    confirmPassword(event) {
        this.setState({ confirmPassword: event.target.value })
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    resetPassword = (e) => {
        this.setState({isActive : true});
        e.preventDefault();   
        let request = {};
        request.email = this.state.email;
        request.password = this.state.password;
        request.action_type = this.reset_password;
        request.promo_code = this.CacheService.getCache('promoCode');

        request.app_type = this.CacheService.getCache('APP_TYPE');
        this.ValidationService.validateForm('forgotPromoUserPassword', request).then(result => {
            this.setState({ validateResponse: result });
            this.CommonService.resetPassword(request).then(response => {      
                this.props.history.push(PROMOTIONS_PATH +  this.CacheService.getCache("promoPath"));  
                this.setState({isActive : false});
            }).catch(error => {
                this.setState({isActive : false});
                        
            });
        });
    }

   
    validateResetToken() {
        this.setState({ submitted: true });
        this.setState({isActive : true});
        let request = {}; 
        request.reset_key = this.resetKey;
        request.app_type = this.CacheService.getCache('APP_TYPE');
        request.promo_code = this.CacheService.getCache('promoCode');
        this.ValidationService.validateForm('validateResetToken', request).then(result => {
            this.setState({ validateResponse: result });
            this.CommonService.validateResetToken(request).then(response => {
                this.setState({email : response.content.email});
                this.setState({isValidToken : true});
                this.setState({isActive : false});
            }).catch(error => {
                this.props.history.push(PROMOTIONS_PATH +  this.CacheService.getCache("promoPath"));  
                this.setState({isActive : false});
                this.setState({isValidToken : false});         
            });
        })
    }

    render() {

        return (
             <LoadingOverlay
              active={this.state.isActive}
              spinner={<LoadingComponent />}
              >
            <div className="row justify-content-center pt-4" id="resetpassword-container">               

                <div className="col-md-5">
                    <form id="resetPassword-form" className="form-horizontal col-md-12 reg p-4 App" method="post" action="#" onSubmit={this.resetPassword}>
                        <div className="form-head">
                            <span>Reset Password</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="cols-sm-2 control-label">New Password <span className="mandate">*</span></label>
                            <div className="cols-sm-6">
                                <div className="input-group">
                                    
                                    <input type="password" autoComplete="off" className="form-control App" name="password" id="reset-password-newpassword"
                                        placeholder="Password 6-20 alpha numeric characters" 
                                        onChange={this.handleChange} />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="cols-sm-2 control-label">Confirm Password <span className="mandate">*</span></label>
                            <div className="cols-sm-6">
                                <div className="input-group">
                                    
                                    <input type="password" autoComplete="off" className="form-control App" name="confirmPassword" id="reset-password-confirm-newpassword"
                                        placeholder="Password 6-20 alpha numeric characters" 
                                        onChange={this.handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="form-group ">
                            <button type="submit" className="btn btn-primary btn-lg btn-block login-button register mt-4">Reset Password</button>
                        </div>

                    </form>
                    
                </div>
                
            </div>
            </LoadingOverlay>
        );
    }
}

export default ResetPasswordComponent;
import React, { Component } from 'react';
import { CacheService } from '../../framework/services/CacheService';
import { withTranslation } from 'react-i18next';
import * as commonConstants from '../services/CommonConstants';

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


class HelpandSupportComponent extends Component {
    constructor(props) {
        super(props);         
        this.CacheService = new CacheService();
        this.homeimgUrl = '';

        let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
        if(app_config !== "undefined") {
            let user_config = JSON.parse(app_config)['home_config']['user_account'];
            this.homeimgUrl  = user_config['HOME_IMAGE_URL'] +'?v=' + Date.now();
        }
    }

    render() {
        const { t } = this.props;
        return (
            <div>
            <div className="heading">
            <div className="heading">                          
                          <span>{t('label_title.appTypeTitle')}</span>
                </div>
            </div>
            <div className="">
            <div className="row">
                <div className="col-12">
            
                <div>
                
                {this.CacheService.getCache('APP_TYPE') === '5'   ? 
                    <img id="paygo_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="Paygo slide"></img>
                : null}    
                 {this.CacheService.getCache('APP_TYPE') === '1'   ?    
                    <img id="eticket_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="Eticketing slide"></img>
                : null}
                 {this.CacheService.getCache('APP_TYPE') === '2'   ? 
                    <img id="student_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="Stident ticketing slide"></img>
                : null}
                 {(this.CacheService.getCache('APP_TYPE') === '0' || this.CacheService.getCache('APP_TYPE') === '3')  ? 
                    <img id="promo_login_banner" className=" b-img-ss rounded mt-4 mb-4" src={this.homeimgUrl} alt="Promo slide"></img>
                : null} 
            </div>

                </div>                 
                
                        <a id="maincontent" tabindex="-1"></a>
                            <h1 className="h2 mt-4">Help and support</h1>

                            <div className="content--grid">
                                <div className="content__block">
                                    <div className="content__section">
                                        <p>We're here to help. Use our how-to guides to learn about the Portal and how to use it while riding in NJTransit. For questions and assistance please give us a call.</p>
                                        <ul className="list--icon">
                                            <li className="text-dark"><img id="phone_image" className="" src={require("../../../images/phone_img.png")} alt="phone image"></img> <strong>973.275.5555</strong></li>
                                        </ul>
                                    </div>
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
    

                
                </div>
            </div>

        );
    }
}
export default withTranslation()(HelpandSupportComponent);
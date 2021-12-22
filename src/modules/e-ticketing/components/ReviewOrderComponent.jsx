import React, { Component } from 'react';
import MenuBarComponent from './MenuBarComponent';
import { withTranslation } from 'react-i18next';
import { EticketingService }  from '../services/EticketingService';
import { BrowserView, MobileView} from "react-device-detect";
import MobileMenuBarComponent from './MobileMenuBarComponent';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ValidationService } from '../../framework/services/ValidationService';
import { CacheService } from '../../framework/services/CacheService';
import { MessageService } from '../../framework/services/MessageService';
import  LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';
import {Modal } from 'react-bootstrap';

const modalStyle = {
    overflowY: "scroll",
    maxHeight:"35em"   
}

const divHeight = {
    minHeight:"55em"   
}


class ReviewOrderComponent extends Component {
 constructor(props){
     super(props);
     this.state = {
        ticketData : [],
        paymentData:[],
        total:0,
        acceptTerms : false,
        ccDigits:'',
        paymethodId:'',
        isActive : true,
        showTerms : false
     };
     this.EticketingService = new EticketingService();
     this.onClick = this.onClick.bind(this);
     this.onChange = this.onChange.bind(this);
     this.onBackClick = this.onBackClick.bind(this);
     this.handleTermsLink = this.handleTermsLink.bind(this);
     this.CacheService = new CacheService();
     this.ValidationService = new ValidationService();
     this.MessageService  = new MessageService();
 }

 componentDidMount() {
    this.setState({isActive : true});                    

    let uid = this.CacheService.getCache("uid");
    if(!uid) {
        this.MessageService.setMessageToDisplay(117);
        this.props.history.push("/mytix-portal/eticketing");
    }
    const paymentdata = JSON.parse(this.CacheService.getCache('selectedPayment'));
    this.setState({paymentData : paymentdata});

    for(let p in paymentdata){
        this.setState({ccDigits : paymentdata[p].ccDigits});
        this.setState({paymethodId : paymentdata[p].paymethodId});
        
    }

    const data = JSON.parse(this.CacheService.getCache('selectedTickets'));
    let dataArray = [];
      for(let i in data){
        dataArray.push(data[i]);
      }
    this.setState({ticketData : dataArray});
    let totalprice = 0.00;
    for(let index in dataArray){
        var ticketTotal = (dataArray[index].totalprice).toString().substr(1);
        totalprice  +=  parseFloat(ticketTotal);
    }
    totalprice = (totalprice/1).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    this.setState({total : totalprice});
    this.setState({isActive : false});                    

}

handleTermsLink = () => {
    this.setState({
         showTerms : true
    })
}

handleTCClose = () => {
    this.setState({
         showTerms : false
    })
}

    onChange(e) {
        this.setState({acceptTerms : !this.state.acceptTerms});
    }

    onClick = () => {
        let request = this.constructRequestObject();
        this.setState({isActive : true});                    

        this.ValidationService.validateForm('reviewOrder', request).then(result => {
            this.setState({ validateResponse: result });
            if(this.state.validateResponse.isValid) {
                this.EticketingService.purchase(request).then(response => {
                    this.setState({isActive : false});
                    this.CacheService.setCache('confirmationNumber',(response.purchase_version).toString());
                    this.CacheService.setCache('downloadTickets',JSON.stringify(response.ticketlist));
                    this.CacheService.removeDataFromCache('selectedTickets');
                    this.props.history.push('/mytix-portal/eticketing/order-complete');

                }).catch(error => {
                    this.setState({isActive : false});
                });
            } else {
                this.setState({isActive : false});                    

            }
        });
        
    }

    onBackClick = () => {
        this.props.history.push('/mytix-portal/eticketing/checkout')
    }

    constructRequestObject() {
        let request = {};
        let eventticketlist = [];
        let paymentlist = [];
        let paymentAttributes = {};
        
        let addresslist = [];

        paymentAttributes.cvv = this.state.paymentData[0].cvv;
        paymentAttributes.ccDigits = this.state.paymentData[0].ccDigits;
        paymentAttributes.paymethodId = this.state.paymentData[0].paymethodId;
        paymentAttributes.ccHolderName = this.state.paymentData[0].ccHolderName;
        paymentAttributes.site_id = this.state.paymentData[0].siteId;
        const totalString= (this.state.paymentData[0].totalAmt).toString().substr(1);
        paymentAttributes.amt = (totalString * 100).toString();
        // paymentAttributes.actionFlag = this.state.paymentData[0].;
        paymentAttributes.ccExp = this.state.paymentData[0].ccExp;
        paymentAttributes.is_default = this.state.paymentData[0].isDefault;
        paymentlist.push(paymentAttributes);

        for(let i in this.state.ticketData){

            if(this.state.ticketData[i].quantity > 0){
                for(let p=0; p<this.state.ticketData[i].quantity ; p++){
                    let eventTicketAttributes = {};
                    eventTicketAttributes.eventId =  this.state.ticketData[i].eventId;
                    eventTicketAttributes.faretable = '0';
                    eventTicketAttributes.origin = this.state.ticketData[i].origin;
                    eventTicketAttributes.destination = this.state.ticketData[i].destination;
                    eventTicketAttributes.via = this.state.ticketData[i].via;
                    eventticketlist.push(eventTicketAttributes); 
                }
            }    
        }

        request.eventticketlist = eventticketlist;
        request.paymentlist = paymentlist;
        request.addresslist = addresslist;
        
        return request;
    }


    render() {
        const { t } = this.props;
        return (
             
            <div id="review-order-eticketing">

                <BrowserView>
                     <div className="heading">
                          <span>{t('label_title.appTypeTitle')}</span>
                      </div>
                </BrowserView>
                <MobileView>
                <div className="heading">
                          <span>{t('label_title.appTypeTitle')}</span>
                      </div>                   
                </MobileView>
                <LoadingOverlay
                active={this.state.isActive}
                spinner={<LoadingComponent />}
                >
                <div className="mt-n2" tabIndex="-1">
                    <div className="container mt-2 pb-4">
                        <div className="row justify-content-center">
                            <div className="col-md-3 mt-4">
                                <BrowserView>
                                     <MenuBarComponent selectedMenu="purchase"> </MenuBarComponent>                                     
                                </BrowserView>
                                <MobileView>
                                <MobileMenuBarComponent selectedMenu="purchase"> </MobileMenuBarComponent>
                                </MobileView>
                            </div>
                            <div className="col-md-9 reg mt-4">
                                <div className="cntr mt-4">
                                    <span className="tab-lbl mt-2 mb-4" alt={t('label_title.ticketDesc')}> {t('label_title.ticketDesc')}</span>
                                </div>
                                <div className="tbl text-left mt-3">
                                    <span className="tab-lbl">{t('label_title.confirmOrder')}</span>
                                    <div className="table-responsive table tblOverFlow">
                                       
                                    <DataTable value={this.state.ticketData} paginator={false} 
                                        first={this.state.first} onPage={(e) => this.setState({ first: e.first })} 
                                        className="t12 thead-light">
                                            <Column field="validityStartDate" header={t('label_label.EventDate')} className="col-width"/>
                                            <Column field="longDisplayName" header={t('label_label.EventDescription')}  className="col-width" />
                                            <Column field="price" header={t('label_label.Fare')} className="col-width"/>
                                            <Column field="quantity" header={t('label_label.Quantity')} className="col-width"/>
                                            <Column field="totalprice" header={t('label_label.Total')} className="col-width"/>
                                        </DataTable>    

                                    </div>
                         
                                    <div className="row ml-4 mx-4 justify-content-center">
                                    <p className="lbl1 mt-2 mb-2">Your credit card <b>{(this.state.paymethodId).toString()} </b> ending in {(this.state.ccDigits).toString().substr(-4)} will be charged {this.state.total}</p>
                                        </div>
                                        <div className="row ml-4 mb-4 justify-content-center">
                                    <p className="lbl1 mt-2 mb-4">{t('label_label.checkbox')} <a onClick={this.handleTermsLink} className="lnk">{t('label_link.Terms')}</a> </p>
                                    <div className="">
                                                            
                                        <input className="form-check-input position-static chk" type="checkbox" onChange={this.onChange} id="blankCheckbox" value="option1" aria-label="...">
                                        </input>
                                        </div>
                                    </div>

                                <div className="row mb-4 justify-content-center">
                                    <div className="form-group mt-4 col-md-4 ml-4">
                                        <button type="submit" onClick={this.onBackClick}
                                            className="btn btn-outline-primary btn-lg btn-block login-button" id="back">{t('label_btn.back')}</button>
                                    </div>
                                    <div className="form-group mt-4 col-md-4 ml-4">
                                        <button type="submit" onClick={this.onClick} disabled={!this.state.acceptTerms}
                                            className="btn btn-primary btn-lg btn-block login-button" id="placeOrder">{t('label_btn.placeOrder')}</button>
                                    </div>
                                </div>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <Modal size="lg" show={this.state.showTerms} onHide={() => this.handleTCClose()}>
              <Modal.Header closeButton>
              <b>  {t('label_link.Terms')} </b>
               </Modal.Header>
               <Modal.Body style={modalStyle}>
                   <div className="row">
                        <div className="col-sm-12">
                         <div className="form-group">
                               

                              <h6> <b> NJ TRANSIT Mobile App® Terms of Use </b> </h6>
                              <h6> <b> March 2020 </b> </h6>

                              <p className="p-1 mt-1">
                                  Before using the NJ TRANSIT Mobile App, you must accept the terms of use and set permissions.
                              </p>

                              <p className="p-1 mt-1">
                                   <b> Terms Of Use - </b> The NJ TRANSIT Mobile App, or hereinafter "App," is provided as a service to the public and our 
                                   customers. Agreement and use of the App indicates acceptance of the terms of use. If you do not agree to the terms, 
                                   do not use the NJ TRANSIT Mobile App.
                              </p>

                              <h7> <b> NJ TRANSIT Mobile App Software License </b> </h7>


                               <p className="p-1 mt-1">
                                    NJ TRANSIT grants you a non-exclusive, non-transferable, limited right and license to install and use the App for your non-commercial personal use on an authorized mobile device solely as set forth in this license providing that you comply fully with these terms and conditions. Your acquired rights are granted subject to your compliance with this license. Any commercial use is prohibited. You are expressly prohibited from sub-licensing, renting, leasing, transferring or otherwise distributing the App or rights to use the App. The term of your license shall commence on the date that you install or otherwise use the App, and shall end on the earlier of the date that you dispose of the App; or termination of this license. You shall not interfere or attempt to interfere with the operation or use by others in any way, nor re-engineer or reverse engineer the App. All rights expressly and not expressly granted are reserved by NJ TRANSIT. 
                              </p> 

                              <p className="p-1 mt-1">
                                  Use of the NJ TRANSIT Mobile App will require your device(s) to have access or connection via mobile network or Internet (fees may apply), and may require obtaining updates or upgrades from time to time. Because use of the NJ TRANSIT Mobile App involves hardware, software and Internet access, your ability to use the NJ TRANSIT Mobile App may be affected by the performance of these factors. By accepting these terms and conditions, you acknowledge and agree that complying with such system requirements, which may be changed from time to time, are your responsibility and that your use of any third-party services are subject to the terms and conditions of use established by the respective third-party service providers. 
                              </p> 

                              <p className="p-1 mt-1">
                                  The NJ TRANSIT Mobile App may automatically download and install updates from time to time. NJ TRANSIT may issue updates to the App, in which case you may not be able to continue use of the App installed on your mobile device without downloading the update. You agree to such downloading and installation of updates as part of your use of the App. 
                              </p> 

                              <p className="p-1 mt-1">
                                  NJ TRANSIT does not guarantee the accuracy or completeness of any information obtained through this App including such features as, but not limited to, service, schedule, fare information, arrival/departure times or routes. NJ TRANSIT is not responsible if the App does not perform as desired. NJ TRANSIT is not financially responsible for any loss or reimbursement as a result of your use of the transit information contained within the App. Service to the App could be interrupted or disrupted due to atmospheric conditions, inaccurate satellite data, and other factors associated with use of satellites. You agree that your use of the App shall be at your sole risk. 
                              </p> 

                              <p className="p-1 mt-1">
                                  You must provide at your own expense the equipment, Internet connections or devices and/or service plans to access and use this App. NJ TRANSIT does not guarantee that this App can be accessed on all devices or wireless service plans. NJ TRANSIT does not guarantee that this App is available in all geographic locations. You acknowledge that when you use this App, your wireless carrier may charge you fees for data, messaging and/or other wireless access. Check with your carrier to see if there are any such fees that apply to you. You are solely responsible for any costs you incur to access this App from your device. 
                              </p> 

                              <p className="p-1 mt-1">
                                  This license is effective until terminated. Your rights under this license will terminate immediately and automatically without any notice from NJ TRANSIT if you fail to comply with any of the terms and conditions of this license. 
                              </p> 

                              <p className="p-1 mt-1">
                                  To the fullest extent permissible under applicable law, the App is provided to you "as is," with all faults, without warranty of any kind, without performance assurances or guarantees of any kind, and your use is at your sole risk. The entire risk of satisfactory quality and performance resides with you. NJ TRANSIT for purposes of this section does not make, and hereby disclaims, any and all express, implied or statutory warranties, including implied warranties of condition, uninterrupted use, merchantability, satisfactory quality, fitness for a particular purpose, non-infringement of third-party rights, and warranties (if any) arising from a course of dealing, usage, or trade custom. NJ TRANSIT does not warrant against interference with your enjoyment of the App; that the App will meet your requirements; that operation of the App will be uninterrupted or error-free; that the App will interoperate or be compatible with any other app; that any errors in the App will be corrected; or that the App will be available for reinstalls to the same or multiple devices. No oral or written advice provided by NJ TRANSIT or any authorized representative shall create a warranty. 
                              </p>

                              <p className="p-1 mt-1">
                              To the fullest extent permissible by applicable law, in no event shall NJ TRANSIT be liable to you for any personal injury, property damage, lost profits, cost of substitute goods or services, loss of data, loss of goodwill, work stoppage, computer failure or malfunction or any other form of direct or indirect, special, incidental, consequential or punitive damages from any causes of action arising out of or related to this license or the App, whether arising in tort (including negligence), contract, strict liability or otherwise, whether or not NJ TRANSIT has been advised of the possibility of such damage. 
                              </p>

                              <p className="p-1 mt-1">
                              You agree that the provisions in this license that limit liability are essential terms of this license. 
                              </p>

                              <p className="p-1 mt-1">
                              If any provision of this license is illegal or unenforceable under applicable law, the remainder of the provision shall be amended to achieve as closely as possible the effect of the original term and all other provisions of this license shall continue in full force and effect. 
                              </p>

                              <p className="p-1 mt-1">
                              You agree that a breach of this license will cause irreparable injury to NJ TRANSIT for which monetary damages would not be an adequate remedy and NJ TRANSIT shall be entitled to seek equitable relief in addition to any remedies it may have hereunder or at law without a bond, other security or proof of damages. 
                              </p>

                              <p className="p-1 mt-1">
                              The laws of the State of New Jersey, excluding its conflicts of law rules, govern this license and your use of the App, and you expressly agree that the exclusive jurisdiction for any claim or action arising out of or relating to this license and/or your use of the App shall be the State Courts in New Jersey and you expressly consent to the exercise of personal jurisdiction of such Courts. 
                              </p>

                              <p className="p-1 mt-1">
                              This license constitutes the entire agreement between you and NJ TRANSIT with respect to the App and supersedes all prior or contemporaneous understandings regarding such subject matter. No failure to exercise, and no delay in exercising, on the part of either party, any right or any power hereunder shall operate as a waiver thereof, nor shall any single or partial exercise of any right or power hereunder preclude further exercise of any other right hereunder. In the event of a conflict between this license and any applicable purchase or other terms, the terms of this license shall govern. 
                              </p>

                              <h7> <b> Mobile Ticketing </b> </h7>


                              <p className="p-1 mt-1">
                               <b> Mobile phone </b> used within these terms relates to any mobile device that is able to install the App and display the mobile ticket using the devices data capability. 
                              </p>

                              <p className="p-1 mt-1">
                                  <b>  Security - </b> The security of your mobile phone is your responsibility. However, if your mobile phone is lost/stolen/replaced, you can sign in to your account (on your new phone) with your User ID (email) and password. If you have active or non-active tickets, and do not see them, please delete and reinstall the App. If your tickets are still not shown, contact NJ TRANSIT at 973-275-5555 for assistance importing your tickets to your new mobile phone. 
                              </p>

                              <p className="p-1 mt-1">

                              <b>  Purchasing Tickets  - </b> By purchasing a mobile ticket you agree to activate the ticket prior to boarding the vehicle, cooperate fully with the train conductor, operator or ticket inspector, and display your mobile phone and any of the ticket details for inspection. It is your responsibility to ensure that the mobile phone is sufficiently charged and functional to clearly display the ticket as required for the duration of your journey. If you are unable to display your mobile ticket, you will be required to purchase a new fare (surcharge may apply). 
                              </p>

                              <p className="p-1 mt-1">
                              All tickets purchased using the NJ TRANSIT Mobile App conform to NJ TRANSIT Revenue Policy. Mobile tickets are subject to certain expiration dates. For further details, visit njtransit.com/tickets or the information section of your individual ticket. 
                              </p>

                              <p className="p-1 mt-1">

                              <b> Credit Card Authorizations - </b> You authorize and instruct NJ TRANSIT to charge the amount of your purchase to a designated credit card/charge card or debit card. You understand and agree that NJ TRANSIT is not liable in any way for incorrect charges to your credit card account(s), and that should an error occur, NJ TRANSIT's sole responsibility is to correct it, when and if NJ TRANSIT receives written notice of the error, with proper documentation, from you. You are responsible for any charges imposed by your bank or credit card company for exceeding your account limits or overdrawing your account. 
                              </p>

                              <p className="p-1 mt-1">

                                <b> System Maintenance - </b> During system maintenance and upgrades, you may be unable to purchase/activate tickets via the App. Every effort will be made to keep service disruptions to a minimum.
                              </p>
                              <h7> <b> Trademarks & Permissions </b> </h7>

                               <p className="p-1 mt-1">

                               As used in the App and/or for NJ TRANSIT goods or services related to the App, “NJ TRANSIT The Way To Go.” phrase and logos, “The Way To Go.”, “NJ TRANSIT” phrase and logo,  chevron (tri-color) logo,   NJ (NJ nested) logo,  “Quik-Tik” phrase and logo, “njtransit.com”, “River LINE” phrase and logo, “Adelante Con” phrase and logo,  “Hudson-Bergen Light Rail” phrase and logos, “Newark Light Rail” phrase and logo, “MyBus”, “DepartureVision”, “Quiet Commute” phrase and logos, “My Light Rail” phrase and logo, “MyBus Now”, “NJ TRANSIT Mobile App” phrase and 2D and 3D logos, “MyTrain”, “Music in Motion” phrase and logo, “MyTix”, “Score Card” logo, logos for NJ TRANSIT rail services on the Main Line, Bergen County Line, Pascack Valley Line, Montclair-Boonton Line, Morristown Line, Gladstone Line, Raritan Valley Line, Northeast Corridor Line, North Jersey Coast Line, Atlantic City Line and any proprietary product or service names contained in this App are either trademarks or registered trademarks of NJ TRANSIT, and may not be copied, imitated or used, in whole or in part, without the prior written permission of NJ TRANSIT. In addition, all banners, custom graphics, button icons and scripts are service marks, trademarks and/or trade dress of NJ TRANSIT, and may not be copied, imitated or used, in whole or in part, without the prior written permission of NJ TRANSIT. All other trademarks, registered trademarks, product names and company names or logos mentioned herein are the property of their respective owners.
                                    
                               </p>
 
                                <h7> <b> Copyrights & Permissions </b> </h7>
                               <p className="p-1 mt-1">
                                    All information, documents, products, software, services and other materials, hereinafter "the Materials," provided as part or accessed via this App are the property and copyrighted work of NJ TRANSIT or a third-party developer, author, manufacturer or vendor (the "Third Party Provider"). Except as stated in these legal terms for personal travel information, none of the Materials may be copied, downloaded, reproduced, altered, distributed, republished, posted or transmitted in any form or by any means, including, but not limited to, electronic, mechanical, photocopying or recording. No part of this App, including, but not limited to, any logo, graphic, word or design mark, sound or image, may be reproduced or retransmitted in any way, or by any means. NJ TRANSIT reserves the right at any time and in its sole discretion to change, modify, update, add, discontinue, remove, revise, delete or otherwise change any or all portions of the NJ TRANSIT Mobile App and the terms of use.
                               </p> 

                               <p className="p-1 mt-1">
                                   Any unauthorized use of any of the Materials may violate copyright laws, trademark laws, the laws of privacy and publicity, and communications regulations and statutes.
                                    © 2015-2020 New Jersey Transit Corporation. ALL RIGHTS RESERVED.

                                    
                               </p> 

                                <h7> <b> Privacy Policy </b> </h7>


                               <p className="p-1 mt-1">
                                    NJ TRANSIT is committed to maintaining your confidence and trust, and accordingly maintains the following Privacy Policy to protect personal information, including the information you upload to the App. You agree that you will comply with the NJ TRANSIT App privacy policy below.
                               </p> 

                               <p className="p-1 mt-1">
                                 <b> Collection and Use of Information - </b> NJ TRANSIT may collect personal information about you (such as your name, address, mobile phone number and email address) through use of the App or App features. NJ TRANSIT will not share any information gathered except to contact you with information about this organization, transit services, transportation or NJ TRANSIT marketing and promotional communications. NJ TRANSIT may provide information to outside entities who we engage to perform email/alert delivery services or other communication services on our behalf. We do not rent or sell information to other entities. If you do not want this information to be collected by us, do not submit it.
                                    
                               </p>

                                <p className="p-1 mt-1">

                                <b> Security - </b> NJ TRANSIT has implemented a number of security features to prevent the unauthorized release of, or access to, personal information. For example, database information is kept separate from live servers and is firewall protected. Although NJ TRANSIT has endeavored to create a secure and reliable environment, the confidentiality of any communication or material transmitted to or from NJ TRANSIT via the App, the NJ TRANSIT site or e-mail cannot be guaranteed. When disclosing any personal information, you should remain mindful of the fact that it is potentially accessible to the public and, consequently, can be collected and used by others without your consent. NJ TRANSIT is not responsible or liable for the security of information transmitted via the Internet.
                                    
                               </p>

                                <p className="p-1 mt-1">
                                <b>  Consent - </b> By using the NJ TRANSIT Mobile App, you consent to the collection and use of non-identifiable information regarding the location of this device and disclosure of location information to deliver location-based services. NJ TRANSIT may modify this Privacy Policy from time to time. If our Privacy Policy is changed, we will post those changes on this page. Your continued use of the App following the posting of changes to these terms will mean you accept these changes.
                                    
                               </p>

                                <p className="p-1 mt-1">
                                <b>  Advertising - </b> In the course of using our App, we may automatically track certain information about you with regard to advertisements and ad impressions provided through this product. This information includes the aggregate use of specific App features, what device and operating system you are using, and your location information. Many apps automatically collect this and similar information. You are always free to decline permission for access to specific information or use of device functionality; however, declining these permissions may impact the features and performance of the App.
                                    
                               </p>

                                <p className="p-1 mt-1">
                                <b> External Websites - </b> To the extent hyperlinks or banner advertisements incorporating hyperlinks are used to access third-party sites, you should be aware that these third-party websites are not controlled by NJ TRANSIT and, therefore, are not subject to the NJ TRANSIT Privacy Policy. You should review the privacy policies of these sites to determine risks associated with your personal information being made available to the operators of these third-party websites.
                                    
                               </p>

                            </div> 
                                              
                        </div>
                    </div>
              </Modal.Body>
               <Modal.Footer>
                    <div className="form-group col-md-2 margin_auto">
                       <button type="submit" onClick={this.handleTCClose}
                        className="btn btn-primary login-button">Close</button>
                    </div>        
               </Modal.Footer>
            </Modal>    
            
            </LoadingOverlay>
            </div>
        );
    }
}

export default withTranslation() (ReviewOrderComponent);
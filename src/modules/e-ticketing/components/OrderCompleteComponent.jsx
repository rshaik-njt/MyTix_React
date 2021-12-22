import React, { Component } from 'react';
import MenuBarComponent from './MenuBarComponent';
import { withTranslation } from 'react-i18next';
import { EticketingService }  from '../services/EticketingService';
import { BrowserView, MobileView} from "react-device-detect";
import MobileMenuBarComponent from './MobileMenuBarComponent';
import { CacheService } from '../../framework/services/CacheService';
import { MessageService } from '../../framework/services/MessageService';
import  LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';
import { ValidationService } from '../../framework/services/ValidationService';

const divHeight = {
    minHeight:"55em"   
}

const confFont = {
    color: "darkblue",
    fontSize: "larger",
    fontWeight: 650

}


const emailMsgFont = {
    fontSize: "medium",
    fontWeight: 600
}


class OrderCompleteComponent extends Component {
     constructor(props){
         super(props);
         this.state = {
             isActive : true,
             trxSeqId : '',
             ticketData:[]
         }
         this.EticketingService = new EticketingService();
         this.downloadTicket = this.downloadTicket.bind(this);
         this.CacheService = new CacheService();
         this.ValidationService = new ValidationService();
         this.MessageService = new MessageService();
     }
     
componentDidMount() {
    this.setState({isActive : true});
    let uid = this.CacheService.getCache("uid");
    if(!uid) {
        this.MessageService.setMessageToDisplay(117);
        this.props.history.push("/mytix-portal/eticketing");
    }
    const trxSeqId = JSON.parse(this.CacheService.getCache('confirmationNumber'));
    this.setState({trxSeqId : trxSeqId});
    const data = JSON.parse(this.CacheService.getCache('downloadTickets'));
    let dataArray = [];
      for(let i in data){
        dataArray.push(data[i]);
      }
    this.setState({ticketData : dataArray});
    this.setState({isActive : false});
}     

saveByteArray(reportName, byte) {
    var blob = new Blob([byte], {type: "application/pdf"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
}
base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
       var ascii = binaryString.charCodeAt(i);
       bytes[i] = ascii;
    }
    return bytes;
  }  

downloadTicket =() => {
    let request = {};
    let attributes = {};
    let tickets = [];
    this.setState({isActive : true});    

    for(let index in this.state.ticketData){
        attributes.trxSeqId = this.state.ticketData[index].trx_seq_id;
        attributes.termNo = this.state.ticketData[index].term_no;
        attributes.trxNo = this.state.ticketData[index].trx_no;
        attributes.trxDate = this.state.ticketData[index].activation_time;
        attributes.ticketAmt = this.state.ticketData[index].ticket_amount;
  
        tickets.push(attributes);
        request.ticketlist = tickets;
    }

    this.ValidationService.validateForm('userTickets', request).then(result => {
    this.setState({ validateResponse: result });
        if(this.state.validateResponse.isValid) {
            this.EticketingService.downloadEticket(request).then(response => {
                this.setState({isActive : false});
                const data = response.pdfByteArray; 
                const arrayBuffer = this.base64ToArrayBuffer(data);
                this.saveByteArray((response.fileName).toString(), arrayBuffer); 

            }).catch(error => {
                this.setState({show : false});
                this.setState({isActive : false});
            });
        } else {
            this.setState({isActive : false});                    

        }
    });
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
                <div className="mt-n2">
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
                                <div className="row mb-4">
                                    <div className="col-md-7"> 
                                        <div className="cntr mt-4">
                                            <span className="tab-lbl mt-4 mb-4">Thank You!</span>
                                        </div> <br/>
                                        <div className="tbl mt-2">
                                            <span className="tab-lbl">Your order is complete</span> <br/>
                                            <div className="table-responsive mt-2">
                                                <div className="mt-4">
                                                    <span style={confFont}> Confirmation Number - {this.state.trxSeqId} </span> <br/>
                                                    <span style={emailMsgFont}> Your Ticket(s) and reciept have been sent to your email. </span>
                                                </div> <br/> <br/>
                                                <div className="mt-2">
                                                    <div className="form-group m-auto col-md-4 ml-4">
                                                        <button 
                                                            className="btn btn-primary btn-lg btn-block login-button" onClick={this.downloadTicket}> Download </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>  
                                    </div>
                                    <div  className="col-md-5 mt-4">
                                        <img id="ticket_img" className="d-block w-100" 
                                        src={require("../../../images/state_fair.png")} alt="Second slide"></img>
                                       

                                    </div>

                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            
            </LoadingOverlay>  
            </div>
            
        );
    }
}

export default withTranslation() (OrderCompleteComponent);
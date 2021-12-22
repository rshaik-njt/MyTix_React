import React, { Component } from 'react';
import '../css/eticket-style.scss';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import MenuBarComponent from './MenuBarComponent';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { EticketingService }  from '../services/EticketingService';
import { withTranslation } from 'react-i18next';
import { BrowserView, MobileView} from "react-device-detect";
import MobileMenuBarComponent from './MobileMenuBarComponent';
import { ValidationService } from '../../framework/services/ValidationService';
import { CacheService } from '../../framework/services/CacheService';
import { MessageService } from '../../framework/services/MessageService';
import  LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay'

const njtFont = {
  color: "#F5600C",
  fontSize: "25px"
}

const njtgrayFont = {
    color: "#85898c",
    fontSize: "25px"
  }


class UserTicketsComponent extends Component {
    constructor(props) {
        super(props);
        this.state={
                tickets: [],
                pastTickets: [],
                upcomingTickets: [],
                selectedTicket: new Map(),
                isActive : true
        }
        this.EticketingService = new EticketingService();
        this.saveTicket = this.saveTicket.bind(this);
        this.ValidationService = new ValidationService();
        this.Download = this.Download.bind(this);
        this.pastDownloadImg = this.pastDownloadImg.bind(this);
        this.CacheService = new CacheService();
        this.MessageService = new MessageService();
    }  

    componentDidMount() {
            this.setState({isActive : true});                    

        let uid = this.CacheService.getCache("uid");
        if(!uid) {
            this.MessageService.setMessageToDisplay(117);
            this.props.history.push("/eticketing");
        }
        this.EticketingService.getTicketPurchaseHistory().then(data =>{
            let tickets = data.content;
            let currentTickets = [];
            let pastTickets = [];
            let upcomingTickets = [];

                for(let index in tickets){

                    if(tickets[index].ticketStatus === 'active'){
                        currentTickets.push(tickets[index]);
                    }else if (tickets[index].ticketStatus === 'expired'){
                        pastTickets.push(tickets[index]);
                    }else if(tickets[index].ticketStatus === 'upcoming'){
                        upcomingTickets.push(tickets[index]);
                    }

                }

            this.setState({ tickets: currentTickets });
            this.setState({ pastTickets: pastTickets });
            this.setState({ upcomingTickets: upcomingTickets });
            this.setState({isActive : false});
        }).catch(error => {
                    
            this.setState({isActive : false});       
        });
        
                            

    }

    Download(rowData,props) {
        return <a class="fa fa-download fa"  onClick={(e) => this.saveTicket(rowData ,props)} style={njtFont}> </a>;
    }

    pastDownloadImg(rowData,props) {
        return <a class="fa fa-download fa"  style={njtgrayFont}> </a>;
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

    saveTicket(rowData, props){
            this.setState({isActive : true});                    

        let request = {};
        let attributes = {};
        let tickets = [];
        attributes.trxSeqId = rowData.trxSeqId;
        attributes.termNo = rowData.termNo;
        attributes.trxNo = rowData.trxNo;
        attributes.trxDate = rowData.trxDate;
        attributes.ticketAmt = rowData.ticketAmt;
        tickets.push(attributes);
        request.ticketlist = tickets;

        this.ValidationService.validateForm('userTickets', request).then(result => {
        this.setState({ validateResponse: result });
            if(this.state.validateResponse.isValid) {
                this.EticketingService.downloadEticket(request).then(response => {

                    const data = response.pdfByteArray; 
                    const arrayBuffer = this.base64ToArrayBuffer(data);
                    this.saveByteArray((response.fileName).toString(), arrayBuffer); 
            this.setState({isActive : false});                    

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
             
            <div className="">
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
                        {/*  */}
                        <div className="row justify-content-center" tabIndex="-1">
                            <div className="col-md-3 mt-4">
                                <BrowserView>
                                <MenuBarComponent selectedMenu="my-tickets"> </MenuBarComponent>                                         
                                </BrowserView>
                                <MobileView>
                                <MobileMenuBarComponent selectedMenu="my-tickets"> </MobileMenuBarComponent>
                                </MobileView>
                            </div>
                            
                            <div class="col-md-9 reg mt-4">
                                <div class="cntr mt-4">
                                <div className="mt-4 mb-4 tab-lbl">
                                    <span className="">{t('label_label.ticket')}</span>
                                </div>
                                </div>
                                { (this.state.tickets.length === 0 && this.state.upcomingTickets.length === 0
                                 && this.state.pastTickets.length === 0) ?
                                 <div  class="cntr">
                                <label className="control-label crd"> {t('label_label.NoTickets')} </label> 
                                </div>: null}
                                
                                {this.state.tickets.length !== 0 ?
                                <div className="tbl text-left">
                                    <span className="tab-lbl pb-4" alt={t('label_title.current')}>{t('label_title.current')}</span>
                                    <div class="table-responsive table tblOverFlow"> 

                                    <DataTable value={this.state.tickets} paginator={false}  className=" t12 thead-light">
                                            <Column body={this.Download} field="Download" header={t('label_label.Download')} className="col-width "/>
                                            <Column field="eventDate" header={t('label_label.EventDate')}  className="col-width" />
                                            <Column field="trxDate" header={t('label_label.PurchaseDate')}  className="col-width" />
                                            <Column field="trxNo" header={t('label_label.ConfirmationNumber')} className="col-width"/>
                                            <Column field="desc" header={t('label_label.Description')} className="col-width"/>
                                        </DataTable>
                 

                                    </div>
                                </div> : null}

                                {this.state.upcomingTickets.length !== 0 ?    
                                <div className="tbl text-left mb-4 mt-4">
                                    <span className="tab-lbl pb-4" alt={t('label_title.upcoming')}>{t('label_title.upcoming')}</span>
                                    <div class="table-responsive table tblOverFlow">
                                    <DataTable value={this.state.upcomingTickets} paginator={false}  className="t12 thead-light">
                                        <Column body={this.Download} field="Download" header={t('label_label.Download')} className="col-width "/>
                                        <Column field="eventDate" header={t('label_label.EventDate')}  className="col-width" />
                                        <Column field="trxDate" header={t('label_label.PurchaseDate')}  className="col-width" />
                                        <Column field="trxNo" header={t('label_label.ConfirmationNumber')} className="col-width"/>
                                        <Column field="desc" header={t('label_label.Description')} className="col-width"/>
                                    </DataTable>
                                    </div>
                                </div> : null}

                                {this.state.pastTickets.length !== 0 ?     
                                <div className="tbl text-left mb-4 mt-4">
                                    <span className="tab-lbl pb-4" alt={t('label_title.past')}>{t('label_title.past')}</span>
                                    <div class="table-responsive table">
                                    <DataTable value={this.state.pastTickets} paginator={false} className="t12 thead-light">
                                        <Column body={this.pastDownloadImg} field="Download" header={t('label_label.Download')} className="col-width "/>
                                        <Column field="eventDate" header={t('label_label.EventDate')}  className="col-width" />
                                        <Column field="trxDate" header={t('label_label.PurchaseDate')}  className="col-width" />
                                        <Column field="trxNo" header={t('label_label.ConfirmationNumber')} className="col-width"/>
                                        <Column field="desc" header={t('label_label.Description')} className="col-width"/>
                                    </DataTable>
                                    </div>
                                    <p className="p-2 mt-3 pnotes"> Note: Past Event Tickets abailable only for last 30 days  </p>
                                </div> 
                                
                                : null}
                                


                            </div>
                        </div>
                    </div>
                </div>
                
                </LoadingOverlay>
            </div>
            
        );
    }
}

export default withTranslation() (UserTicketsComponent);
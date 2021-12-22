import React, { Component } from 'react';
import '../css/eticket-style.scss';
import AddBoxIcon from '@material-ui/icons/AddBox';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import MenuBarComponent from './MenuBarComponent';
import MobileMenuBarComponent from './MobileMenuBarComponent';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { EticketingService }  from '../services/EticketingService';
import { withTranslation } from 'react-i18next';
import { BrowserView, MobileView} from "react-device-detect";
import { CacheService } from '../../framework/services/CacheService';
import { MessageService } from '../../framework/services/MessageService';
import  LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';

const divHeight = {
    minHeight:"50em"   
}

class EventPurchaseComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            isActive : true,
            ticketSelected: false
        };
        this.EticketingService = new EticketingService();
        this.onAdderDecrease = this.onAdderDecrease.bind(this);
        this.onAdderIncrease = this.onAdderIncrease.bind(this);
        this.CacheService = new CacheService();
        this.onClick = this.onClick.bind(this);
        this.TicketAdder = this.TicketAdder.bind(this);
        this.MessageService = new MessageService();
    }
    
    componentDidMount() {
            this.setState({isActive : true});                    

        let uid = this.CacheService.getCache("uid");
        if(!uid) {
            this.MessageService.setMessageToDisplay(117);
            this.props.history.push("/mytix-portal/eticketing");
        }
        
        this.EticketingService.getEvents().then(data => {
            let events = data;
            let eventsWithCount = [];
            for (let index in events) {
                var event = events[index];
                event.quantity = 0;
                event.totalprice = (0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });;
                const value = event.price;
                event.price = (value/100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                eventsWithCount.push(event);

            }
            this.setState({ events: eventsWithCount });
            this.setState({isActive : false});                    

         });
            this.setState({isActive : false});                    
        

    }

    onAdderIncrease(rowData, props) {
        let events = this.state.events;
        let qty = rowData.quantity + 1;
        if(events[props.rowIndex].maxQty < qty){
            var element = document.getElementById("msg_description");
			element.innerHTML = "Only "+ events[props.rowIndex].maxQty +" ticket(s) available for this departure time"; 
			element.setAttribute('class', "alert alert--error alert--dismissible message-container-error"); 
			setTimeout(() => {
				element.innerHTML = ""; 
			element.setAttribute('class', ""); 
			}, 5000);
            return;
        }
        this.setState({ticketSelected : true});
        events[props.rowIndex].quantity = qty;
        const price = rowData.price.substr(1);
        events[props.rowIndex].totalprice =  (qty * price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        this.setState({events :  events});
    }

    onAdderDecrease(rowData, props) {
        let events = this.state.events;
        if(rowData.quantity === 0){
            return;
        }
        let qty = rowData.quantity - 1;
        events[props.rowIndex].quantity = qty;
        if(qty === 0){
            for(let i in events){
                if(events[i].quantity === 0){
                    this.setState({ticketSelected : false});
                }else{
                    this.setState({ticketSelected : true});
                    break;
                }
            }
        }
        
        const price = rowData.price.substr(1);
        events[props.rowIndex].totalprice =  (qty * price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        this.setState({events :  events});
    } 

    onClick = () => {
        let selectedTickets = [];
        for(var i=0; i<this.state.events.length;i++){
            if(this.state.events[i].quantity > 0){
                selectedTickets.push(this.state.events[i]);
            }
        }
        if(selectedTickets.length === 0 ){
            var element = document.getElementById("msg_description");
            element.innerHTML = "Please select Tickets"; 
            element.setAttribute('class', "alert alert--success alert--dismissible message-container-notification"); 
            setTimeout(() => {
                element.innerHTML = ""; 
                element.setAttribute('class', ""); 
            }, 10000);
                return;
        }
        this.CacheService.setCache('selectedTickets', JSON.stringify(selectedTickets));
        this.props.history.push('/mytix-portal/eticketing/checkout');
      }

    TicketAdder(rowData, props) {
        return <div className="number">
        <IndeterminateCheckBoxIcon  onClick={(e) => this.onAdderDecrease(rowData, props)} className="mandate"> </IndeterminateCheckBoxIcon>
        <span className="m-2">{rowData[props.field]}</span>
        <AddBoxIcon onClick={(e) => this.onAdderIncrease(rowData, props)} className="mandate">  </AddBoxIcon>
        </div>;
    }

    render() {
        const { t } = this.props;
        return (
            <LoadingOverlay
              active={this.state.isActive}
              spinner={<LoadingComponent />}
              >
            <div>
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
                            <div className="col-md-9 reg mt-4" tabIndex="-1">
                                <div className="cntr mt-4">
                                    <span className="tab-lbl mt-2" alt={t('label_title.ticketDesc')}>{t('label_title.ticketDesc')}</span>
                                </div>
                                <div className="tbl text-left mt-4">
                                    <span className="tab-lbl">{t('label_title.events')}</span>
                                    <div className="table-responsive table tblOverFlow">

                                        <DataTable value={this.state.events} paginator={false}
                                        first={this.state.first} onPage={(e) => this.setState({ first: e.first })} 
                                        className="thead-light text-left t12">
                                            <Column field="validityEndDate" header={t('label_label.EventDate')} className="col-width"/>
                                            <Column field="longDisplayName" header={t('label_label.EventDescription')}  className="col-width" />
                                            <Column field="price" header={t('label_label.Fare')} className="col-width"/>
                                            <Column field="quantity" 
                                            body ={this.TicketAdder}
                                            header={t('label_label.Quantity')} 
                                            className="col-width"/>
                                            <Column field="totalprice" header={t('label_label.Total')} className="col-width"/>
                                        </DataTable>
                                    </div>                                   

                                </div>
                                <div className="form-group mt-4">
                                        <button onClick={this.onClick} disabled={!this.state.ticketSelected}
                                            className="btn btn-primary login-button" id="proceed_to_checkout">{t('label_btn.checkout')}</button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
            </LoadingOverlay>
        );
    }
}

export default withTranslation() (EventPurchaseComponent);
import React, { Component } from 'react';
import '../css/eticket-style.scss';
import MenuBarComponent from './MenuBarComponent';
import {Modal } from 'react-bootstrap';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { withTranslation } from 'react-i18next';
import { EticketingService } from '../services/EticketingService';
import { BrowserView, MobileView} from "react-device-detect";
import MobileMenuBarComponent from './MobileMenuBarComponent';
import { ValidationService } from '../../framework/services/ValidationService';
import { CacheService } from '../../framework/services/CacheService';
import { MessageService } from '../../framework/services/MessageService';
import  LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';
import { Accordion, Card, Button,  OverlayTrigger, Tooltip } from 'react-bootstrap';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const divHeight = {
  minHeight:"50em"   
}

const chkStyle = {
height: "18px",
  margin: "0px"
}

const accHeadStyle = {
  fontSize: "16px",
  fontWeight: 500,
  color: "#007bff"
}

class CheckoutComponent extends React.Component {

    constructor(props) {
        super(props);
         this.state = {
          addShow : false,
          payments:[],
          selectedpayment:[],
          ticketData:[],
          validateResponse: {},
          item:'',
          NameonCard:'',
          addcard_cardName:'',
          paymethodId:'',
          addcard_saveas:'',
          cardNumber:'',
          addcard_cardNumber:'',
          expiryMonth:'',
          addcard_expiryMonth:'',
          expiryYear:'',
          addcard_year:'',
          zip:'',
          addcard_zip:'',
          cvv:'',
          addcard_cvv:'',
          paymethod_cvv1:'',
          total:0,
          isDefault: false,
          isActive : true,
          paymentSelected: false,
          addNewPayment: false,
          nopayments : false,
          allowAddCard: false,
          count1:0,
          count2:0
         };
         this.EticketingService = new EticketingService();
         this.handleChange = this.handleChange.bind(this);
         this.onBlur = this.onBlur.bind(this);
         this.handleCheckBox = this.handleCheckBox.bind(this);
         this.onChange = this.onChange.bind(this);
         this.ValidationService = new ValidationService();
         this.showDialog = this.showDialog.bind(this);
         this.handleClose = this.handleClose.bind(this);
         this.onBackClick =this.onBackClick.bind(this);
         this.onClick = this.onClick.bind(this);
         this.CacheService = new CacheService();
         this.constructYears = this.constructYears.bind(this);
         this.addCard = this.addCard.bind(this);
         this.MessageService = new MessageService();
         this.count1 = this.count1.bind(this);
         this.count2 = this.count2.bind(this);
         this.years = {};
         this.currentMonth = null;
         this.currentYear = null;
         
    }

    showDialog = (e) => {
      this.clearStateValues();
      let validateResponse = {};
      this.setState({validateResponse : validateResponse});
      let user = JSON.parse(this.CacheService.getCache("user"));
      var name = user.firstName +' '+ user.lastName;
      this.setState({addcard_cardName : name});
      this.setState({addShow : true});
    }

    componentDidMount() {
        this.setState({isActive : true});                    

        let uid = this.CacheService.getCache("uid");
        if(!uid) {
            this.MessageService.setMessageToDisplay(117);
            this.props.history.push("/mytix-portal/eticketing");
        }

        let ticketData = JSON.parse(this.CacheService.getCache('selectedTickets'));
 
        this.setState({ticketData : ticketData});

        this.EticketingService.getPayments().then(data =>{ 
          let payments = data.content;
          let paymentswithflag = [];

        let totalprice = 0.00;
        for(let index in ticketData){
            var ticketTotal = (ticketData[index].totalprice).toString().substr(1);
            totalprice  +=  parseFloat(ticketTotal);
        }
        totalprice = (totalprice/1).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        this.setState({total : totalprice});

          for(let i in payments){
            var payment = payments[i];
            if(payment.isDefault === 'Y'){
              let selectedpayment = [];
              payment.isChecked = true;              
              payment.totalAmt = totalprice;
              selectedpayment.push(payment);
              this.setState({selectedpayment : selectedpayment});
              this.setState({paymentSelected : true});
            }else{
            payment.isChecked = false;
            }
            paymentswithflag.push(payment);
          }
          if(paymentswithflag.length === 0){
            this.setState({nopayments : true});
          }else{
            this.setState({nopayments : false});
          }
          this.setState({isActive : false});                            
          this.setState({ payments: paymentswithflag });
        }).catch(error => {     
          this.setState({isActive : false});    
        });

        
        this.constructYears();                    

      }

      constructYears(){
          this.years = {};
          var today = new Date();
          var year = today.getFullYear();
          this.currentMonth = today.getMonth();
          this.currentYear = (year+'').substr(-2);
          for(var i = 0; i <= 5; i++) {
            var y = year + i + '';
            var shortyear = y.substr(-2);
            this.years[shortyear] = y;
          }
      }  

    onChange(e) {
        this.setState({isDefault : !this.state.isDefault});
    }

    addCard(e){
      this.setState({isActive : true});                    
      let validateResponse = {};
      this.setState({validateResponse : validateResponse});
      let request = {};
      let payment = [];
      let attributes = {};
      attributes.paymethodId = this.state.addcard_saveas;
      attributes.ccDigits = this.state.addcard_cardNumber;
      attributes.ccExp = this.state.addcard_expiryMonth + this.state.addcard_year;
      attributes.ccHolderName = this.state.addcard_cardName;
      attributes.cvv = this.state.addcard_cvv;
      attributes.isDefault = this.state.isDefault ? 'Y' : 'N';
      attributes.zip = this.state.addcard_zip;
      attributes.paymentType = '2';
      payment.push(attributes);
      request.paymentlist = payment;
      this.ValidationService.validateForm('addPayment', attributes).then(result => {
          this.setState({ validateResponse: result });
          if (this.state.validateResponse.isValid) {
            this.setState({addShow : false});

              let existpayments = this.state.payments;
                for(let index in existpayments){
                    if(existpayments[index].paymethodId.toLowerCase() === this.state.addcard_saveas.toLowerCase() ||
                       existpayments[index].paymethodId.toUpperCase() === this.state.addcard_saveas.toUpperCase()){
                        this.setState({isActive : false});
                        this.clearStateValues();   
                        var element = document.getElementById("msg_description");
                        element.innerHTML = "Profile name already exists"; 
                        element.setAttribute('class', "alert alert--error alert--dismissible message-container-error"); 
                        setTimeout(() => {
                            element.innerHTML = ""; 
                        element.setAttribute('class', ""); 
                        }, 5000);
                        return;
                    }
                    
                }
              let selectedMonth = parseInt(this.state.addcard_expiryMonth);
                if(this.state.addcard_year === this.currentYear && selectedMonth <= this.currentMonth){
                    this.setState({isActive : false});
                    this.clearStateValues();   
                    var element = document.getElementById("msg_description");
                    element.innerHTML = "Invalid Expiration Date"; 
                    element.setAttribute('class', "alert alert--error alert--dismissible message-container-error"); 
                    setTimeout(() => {
                        element.innerHTML = ""; 
                    element.setAttribute('class', ""); 
                    }, 5000);
                    return;
                }


              this.EticketingService.addPayment(request).then(response => {
                let newpayments = this.state.payments;
                for(let index in newpayments) 
                {                  
                    newpayments[index].isChecked = false;
                }
                let selectedpayment = [];
                var card = this.state.addcard_cardNumber+'';
                attributes.ccDigits = card.substr(0,6)+'XXXXXX'+card.substr(-4); 
                attributes.totalAmt = this.state.total
                attributes.isChecked = 'true';                
                newpayments.push(attributes);
                selectedpayment.push(attributes);
                this.setState({selectedpayment : selectedpayment});
                this.setState({paymentSelected : true});
                this.setState({payments : newpayments});
                  this.setState({nopayments : false});
                  this.clearStateValues();
                  
                  this.CacheService.setCache('selectedPayment', JSON.stringify(this.state.selectedpayment));
                  this.props.history.push('/mytix-portal/eticketing/review-order');
                  
                  this.setState({isActive : false});                    

              }).catch(error => {
                  this.clearStateValues();
                  this.setState({addShow : false});
                  this.setState({isActive : false});                    
              });
          } else {
              this.clearStateValues();
              this.setState({isActive : false});                    

          }
      }).catch(error => {
            this.clearStateValues();
            this.setState({addShow : false});
            this.setState({isActive : false});                    
                  
          
      });
  }


    async handleChange(e) {
      const { name, value } = e.target;
      await this.setState({ [name]: value });
      this.validate();
    }

    onBlur(e) {
      this.validate();
  }
  
  async validate(){
      
      let request = {};
      let sceenName = 'addPayment';
      
      if(this.state.addcard_saveas !== ''){
      request.paymethodId = this.state.addcard_saveas;
      }
      if(this.state.addcard_cardNumber !== ''){
      request.ccDigits = this.state.addcard_cardNumber;
      }
      if((this.state.addcard_expiryMonth + this.state.addcard_year) !== ''){
      request.ccExp = this.state.addcard_expiryMonth + this.state.addcard_year;
      }
      if(this.state.addcard_cardName !== ''){
      request.ccHolderName = this.state.addcard_cardName;
      }
      if(this.state.addcard_cvv !== ''){
      request.cvv = this.state.addcard_cvv;
      }
      if(this.state.isDefault !== ''){
      request.isDefault = this.state.isDefault ? 'Y' : 'N';
      }
      if(this.state.addcard_zip !== ''){
      request.zip = this.state.addcard_zip;
      }
      request.paymentType = '2';

      if(this.state.paymethod_cvv1 !== ''){
        request.cvv = this.state.paymethod_cvv1;
        sceenName = 'checkout';
      }
      
      this.ValidationService.validateForm(sceenName, request).then(result => {
  
              this.setState({ validateResponse: result });
      }).catch(error => {
          this.setState({isActive : false});
          
      });
      await this.setState();

        if(this.state.validateResponse.isValid && this.state.addcard_zip !== '' &&
            this.state.addcard_cvv !== '' && this.state.addcard_cardName !== '' &&
            this.state.addcard_cardNumber !== '' && (this.state.addcard_expiryMonth + this.state.addcard_year) !== ''
            && this.state.addcard_saveas !== ''){
            this.setState({allowAddCard: true});
        }else{
          this.setState({allowAddCard: false});
        }
  }

    handleCheckBox(e){
      let selectedpayment = [];
      this.setState({paymethod_cvv1 : ''});
      if(e.target.checked){
        if(e.target.value === "addNewPayment"){
          this.showDialog();
        }
          selectedpayment.push(JSON.parse(e.target.value));
          let payments = this.state.payments;
          for(let index in payments) 
          {
            if(payments[index].paymethodId === selectedpayment[0].paymethodId){
                payments[index].isChecked = true;
            }else{
                payments[index].isChecked = false;
            }
          }
          this.setState({payments :  payments});
      }else{
        let payments = this.state.payments;
          for(let index in payments) 
          {
            if(payments[index].paymethodId === selectedpayment[0].paymethodId){
                payments[index].isChecked = false;
            }
          }
          this.setState({payments :  payments});
      }
      if(selectedpayment.length === 0){
        return;
      }
      this.setState({paymentSelected : true});
      
      var payment = selectedpayment[0];
      payment.totalAmt = this.state.total
      selectedpayment.pop();
      selectedpayment.push(payment);
      this.setState({selectedpayment : selectedpayment});
      
    }

    handleClose = () => {
      this.clearStateValues();
      let validateResponse = {};
      this.setState({validateResponse : validateResponse});
      this.setState({addShow : false})
    }
   onBackClick = (e) => {
        this.props.history.push('/mytix-portal/eticketing/purchase');
    }

    count1(){
      let count1 = this.state.count1 + '';
      console.log(count1+":");
      this.setState({count1 : this.count1 + 1})
     return count1; 
    }
    count2(){
      let count2 = this.state.count2 + '';
      console.log(count2+"=");
      this.setState({count2 : this.count2 + 1})
      return count2; 
     }
  clearStateValues(){
      this.setState({
          addShow: false,
          NameonCard:'',
          addcard_cardName:'',
          cardNumber:'',
          addcard_cardNumber:'',
          expiryMonth:'00',
          expiryYear:'00',
          paymethodId:'',
          addcard_saveas:'',
          zip:'',
          addcard_zip:'',
          cvv:'',
          addcard_cvv:'',
          isDefault: false
      }); 
  }

    onClick = (e)  => {

      
      let attributes = {};
      let validateResponse = {};
      this.setState({validateResponse : validateResponse});
      attributes.cvv = this.state.paymethod_cvv1;
      this.ValidationService.validateForm('checkout', attributes).then(result => {
        this.setState({ validateResponse: result });
        if (this.state.validateResponse.isValid) {

                if(this.state.selectedpayment.length === 0){
                  
                  return;
                }else{
                  let selectedpayment = [];
                  selectedpayment = this.state.selectedpayment;
                  var payment = selectedpayment[0];
                  payment.cvv = this.state.paymethod_cvv1;
                  selectedpayment.pop();
                  selectedpayment.push(payment);
                  this.setState({selectedpayment : selectedpayment});
                }
                this.CacheService.setCache('selectedPayment', JSON.stringify(this.state.selectedpayment));
                this.props.history.push('/mytix-portal/eticketing/review-order');
              } else {
                
                return;                   
              }
      }).catch(error => {
        this.setState({isActive : false});                      
      });
    }

    render() {
      const { t } = this.props;
      let yearsListOptions = Object.keys(this.years).map((k) => {
        return (
              <option key={k} value={k} >{this.years[k]}</option>
        )
      }, this);
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
                spinner={<LoadingComponent />} >

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
                            <div className="col-md-9 reg mt-4" tabIndex="-1">
                                <div className="cntr mt-4">

                                    <span className="tab-lbl mt-2" tabIndex="0" alt={t('label_title.ticketDesc')}>{t('label_title.ticketDesc')}</span>
                                    <div className="row mt-4">

                                    <div className="col-md-12">
                                            <div className="form-head App">
                                                <span>{t('label_title.order')}</span>
                                            </div>
                                    <div className="tbl odr text-left">
                                    <div class="table-responsive table tblOverFlow"> 

                                    <DataTable value={this.state.ticketData} paginator={false} className=" t12 thead-light">
                                            <Column field="validityStartDate" header={t('label_label.EventDate')} className="col-width "/>
                                            <Column field="longDisplayName" header={t('label_label.EventDescription')}  className="col-width" />
                                            <Column field="price" header={t('label_label.Fare')}  className="col-width" />
                                            <Column field="quantity" header={t('label_label.Quantity')} className="col-width"/>                                            
                                        </DataTable>                

                                    </div>
                                    </div>

                                            <div className="ml-4 pt-2 px-3">
                                            <p className ="row"> <span className ="col-7 text-right"><b>Total</b></span> <span className=" col-5 text-center">{this.state.total}</span></p>
                                            </div>

                                    </div>
                                    </div>

                                    <div className="row mt-4">
                                        <div className="col-md-12" tabIndex="-1">

                                            <form className="form-horizontal" id="paymethod-from">
                                                
                                                    <div className="form-head App p-2">
                                                        <span>{t('label_title.payMethod')} </span>                                                        
                                                    </div>
                                                    <div className="box-card border">

                                                    { this.state.payments.map((item) => (                                                    
                                                        
                                                        <Accordion defaultActiveKey={item.isChecked ? "0" : "1"}>  
                                                        <Card>
                                                        <Card.Header className = "text-left bg-white">
                                                        <Accordion.Toggle as={Card.Header} className="btncheckbox" eventKey="0">
                                                        <input className="form-check-input position-static chk" type="radio"
                                                        style={chkStyle} id="paymethod_blankCheckbox" value={JSON.stringify(item)} checked = {item.isChecked} onChange = {this.handleCheckBox}/>
                                                        
                                                          {(item.ccDigits).toString().substr(0,1) === '4' ?
                                                          <img className="btn"  src={require("../images/visa_card.png")} alt="Visa Card"></img>
                                                          : null}
                                                          {(item.ccDigits).toString().substr(0,1) === '6' ?
                                                          <img className="btn"  src={require("../images/discover_card.png")} alt="Discover Card"></img>
                                                          : null}
                                                          {(item.ccDigits).toString().substr(0,1) === '5' ?
                                                          <img className="btn"  src={require("../images/master_card.png")} alt="Master Card"></img>
                                                          : null}
                                                          {(item.ccDigits).toString().substr(0,1) === '3' ?
                                                          <img className="btn"  src={require("../images/amex_card.png")} alt="Amex  Card"></img>
                                                          : null}
                                                          <span style={accHeadStyle} className="btn"><b> {item.paymethodId}</b> </span>                                                           
                                                          <span style={accHeadStyle} className="btn"> {'(************' + (item.ccDigits).toString().substr(-4) +')'} </span> 
                                                        </Accordion.Toggle>
                                                        </Card.Header> 
                                                        <Accordion.Collapse eventKey="0">
                                                        <Card.Body>
                                                        <div className="row ml-2">
                                                            <div className="form-group mt-4 App col-md-5">
                                                                  <label htmlFor="paymethod_cvv1" className="col-xs-3 control-label crd"> {t('label_label.cvv')} </label>
                                                                <div className="input-group">                                                                      
                                                                    <input type="text" className="form-control App" name="paymethod_cvv1" id="paymethod_cvv1"
                                                                         placeholder={t('label_label.cvv')}  onChange={this.handleChange} onBlur={this.onBlur} />
                                                                  </div>
                                                                  {this.state.validateResponse.cvv_error === 'required' ?
                                                                    <span className="form_error"> {t('label_label.cvvRequired')}</span> : null}
                                                                  {this.state.validateResponse.cvv_error === 'minLength' ?
                                                                    <span className="form_error"> {t('label_label.cvvMinlength')} </span> : null}
                                                                  {this.state.validateResponse.cvv_error === 'maxLength' ?
                                                                    <span className="form_error"> {t('label_label.cvvMaxlength')} </span> : null}
                                                                  {this.state.validateResponse.cvv_error === 'regex' ?
                                                                    <span className="form_error"> {t('label_label.cvvInvalid')} </span> : null}                                                            
                                                            </div>
                                                            <div className="col-md-7">
                                                                
                                                                <img className=""  src={require("../images/cvv_example.png")} alt="Amex Card"></img>
                                                                

                                                            </div>
                                                     </div>
                                                          
                                                        </Card.Body> 

                                                        </Accordion.Collapse>  
                                                        </Card>
                                                        </Accordion>

                                                    )) }
                                                    <Accordion>
                                                        <Card>
                                                        <Card.Header className = "text-left bg-white">
                                                        <Accordion.Toggle as={Card.Header} className="btncheckbox">
                                                        <input className="form-check-input position-static chk" type="radio"
                                                        style={chkStyle} id="paymethod_blankCheckbox" value="addNewPayment" checked = {this.state.addNewPayment} onChange = {this.handleCheckBox}/>

                                                        </Accordion.Toggle>
                                                        <span style={accHeadStyle} className="btn" alt="Add new payment method"><b>Add new payment method</b></span>

                                                        </Card.Header>
                                                        </Card>
                                                        </Accordion>
                                                    {/* {this.state.nopayments ? 
                                                    <label className="col-xs-3 form-head"> NO PAYMENT METHODS </label> : null} */}

                                                </div>

                                            </form>
                                        </div>
                                    </div>

                                    
                                </div>     

                                <div className="row mb-4 ">
                                    <div className="form-group mt-4 col-md-5">
                                        <button onClick={this.onBackClick}
                                            className="btn btn-outline-primary btn-lg btn-block login-button">{t('label_btn.back')}</button>
                                    </div>
                                    <div className="form-group mt-4 col-md-5 pl-4">
                                        <button onClick={this.onClick} disabled={!(this.state.validateResponse.isValid && this.state.paymethod_cvv1 !== '' && this.state.paymentSelected)}
                                            className="btn btn-primary btn-lg btn-block login-button">Review Order</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

  <Modal show={this.state.addShow} onHide={() => this.handleClose()}>
  <Modal.Header closeButton>
  {t('label_title.addPayment')}
  </Modal.Header>
  <Modal.Body><div className="row">
    <div className="col-sm-12" tabIndex="-1">
      <div className="form-horizontal col-md-12">

        <div className="form-group App">
          <label htmlFor="addcard_cardName" className="cols-sm-2 control-label"> {t('label_label.NameonCard')}<span className="mandate">*</span> </label>
          <div className="cols-sm-4">
            <div className="input-group">
              
              <input type="text" className="form-control App" alt="enter name of card" name="addcard_cardName" id="addcard_cardName" placeholder= {t('label_label.NameonCard')} value={this.state.addcard_cardName} onChange={this.handleChange} />
            </div>
            {this.state.validateResponse.ccHolderName_error === 'required' ?
              <span className="form_error"> {t('label_label.ccHolderNameRequired')}</span> : null}
            {this.state.validateResponse.ccHolderName_error === 'minLength' ?
              <span className="form_error"> {t('label_label.ccHolderNameMinlength')} </span> : null}
            {this.state.validateResponse.ccHolderName_error === 'maxLength' ?
              <span className="form_error"> {t('label_label.ccHolderNameMaxlength')} </span> : null}
            {this.state.validateResponse.ccHolderName_error === 'regex' ?
               <span className="form_error"> {t('label_label.ccHolderNameInvalid')} </span> : null}

          </div>
        </div>
        <div className="form-group App">
        <div className="row">
          <label htmlFor="addcard_cardNumber" className="col-5 pr-0 control-label"> {t('label_label.cardNumber')}<span className="mandate">*</span></label>
            <div className="text-right col-7 pl-0">
            <img className=""  src={require("../images/visa_card.png")} alt="Visa Card"></img>&nbsp;&nbsp;
            <img className=""  src={require("../images/master_card.png")} alt="Master Card"></img>&nbsp;&nbsp;
            <img className=""  src={require("../images/amex_card.png")} alt="Amex Card"></img>&nbsp;&nbsp;
            <img className=""  src={require("../images/discover_card.png")} alt="Discover Card"></img>&nbsp;&nbsp;
            </div>
        </div>  
          
          <div className="cols-sm-5">
            <div className="input-group">
              
              <input type="text" className="form-control App" alt="enter card number" name="addcard_cardNumber" id="addcard_cardNumber"  placeholder= {t('label_label.cardNumber')} onChange={this.handleChange} />
            </div>
            {this.state.validateResponse.ccDigits_error === 'required' ?
              <span className="form_error"> {t('label_label.ccDigitsRequired')}</span> : null}
            {this.state.validateResponse.ccDigits_error === 'minLength' ?
              <span className="form_error"> {t('label_label.ccDigitsMinlength')} </span> : null}
            {this.state.validateResponse.ccDigits_error === 'maxLength' ?
              <span className="form_error"> {t('label_label.ccDigitsMaxlength')} </span> : null}
            {this.state.validateResponse.ccDigits_error === 'regex' ?
              <span className="form_error"> {t('label_label.ccDigitsInvalid')} </span> : null}

          </div>
        </div>
        <div className="row ml-1">
          <div className="form-group App col-sm-4 pl-0">
            <label htmlFor="addcard_expiryMonth" className="col-xs-8 control-label p-0"> {t('label_label.expiryMonth')}<span className="mandate">*</span> </label>
            <div className="col-xs-8 p-0">
              <div className="input-group ">

                <select className="form-control" alt="select expiration month" name="addcard_expiryMonth" id="addcard_expiryMonth" value={this.state.addcard_expiryMonth} placeholder= {t('label_label.expiryMonth')} onChange={this.handleChange}>
                  <option value="">MONTH</option>
                  <option value="01">JAN</option>
                  <option value="02">FEB</option>
                  <option value="03">MAR</option>
                  <option value="04">APR</option>
                  <option value="05">MAY</option>
                  <option value="06">JUN</option>
                  <option value="07">JUL</option>
                  <option value="08">AUG</option>
                  <option value="09">SEP</option>
                  <option value="10">OCT</option>
                  <option value="11">NOV</option>
                  <option value="12">DEC</option>

                </select>
              </div>

            </div>

          </div>
          <div className="form-group  App col-sm-4 pl-0">
            <label htmlFor="addcard_year" className="col-xs-8 control-label p-0"> {t('label_label.expiryYear')}<span className="mandate">*</span> </label>
            <div className="col-xs-8 p-0">
              <div className="input-group">

                <select className="form-control" alt="select expiration year" name="addcard_year" id="addcard_year" value={this.state.addcard_year} placeholder= {t('label_label.expiryYear')} onChange={this.handleChange}>
                <option value="">YEAR</option>
                {yearsListOptions}
                </select>
              </div>


            </div>

          </div>
          <div className="form-group  App col-sm-4 pl-0">
            <label htmlFor="addcard_cvv" className="col-xs-5 control-label p-0"> {t('label_label.cvv')}<span className="mandate">*</span></label>
            <div className="col-xs-5 p-0">
              <div className="input-group col-xs-5">

                <input type="text" className="form-control App" name="addcard_cvv" id="addcard_cvv" placeholder= {t('label_label.cvv')}  onChange={this.handleChange} />
              </div>
              {this.state.validateResponse.cvv_error === 'required' ?
                <span className="form_error"> {t('label_label.cvvRequired')}</span> : null}
              {this.state.validateResponse.cvv_error === 'minLength' ?
                <span className="form_error"> {t('label_label.cvvMinlength')} </span> : null}
              {this.state.validateResponse.cvv_error === 'maxLength' ?
                <span className="form_error"> {t('label_label.cvvMaxlength')} </span> : null}
              {this.state.validateResponse.cvv_error === 'regex' ?
                <span className="form_error"> {t('label_label.cvvInvalid')} </span> : null}

            </div>

          </div>

        </div>
        <div className="row">
          <div className="form-group App col-md-5">
            <label htmlFor="addcard_zip" className="col-xs-5 control-label p-0"> {t('label_label.zip')} <span className="mandate">*</span></label>
            <div className="col-xs-8 p-0">
              <div className="input-group">
                <input type="text" className="form-control App" alt="enter zip code" name="addcard_zip" id="addcard_zip" value={this.state.addcard_zip} placeholder= {t('label_label.zip')} onChange={this.handleChange} />
              </div>
          </div>
                {this.state.validateResponse.zip_error === 'required' ?
                <span className="form_error"> {t('label_label.zipRequired')}</span> : null}
                {this.state.validateResponse.zip_error === 'minLength' ?
                <span className="form_error"> {t('label_label.zipMinlength')} </span> : null}
                {this.state.validateResponse.zip_error === 'maxLength' ?
                <span className="form_error"> {t('label_label.zipMaxlength')} </span> : null}
                {this.state.validateResponse.zip_error === 'regex' ?
                <span className="form_error"> {t('label_label.zipInvalid')} </span> : null}
          </div>
          <div className="form-group App mt-4 col-md-4 pl-0">
              <div className="form-check">
                <label htmlFor="addcard_isDefault" className="control-label App">Default</label>
                <input className="form-check-input position-static chk" type="checkbox" checked={this.state.isDefault} id="addcard_isDefault" value="option1" aria-label="..." onChange={this.onChange}>
                </input>
              </div>
          </div>
        </div>
        <div className="form-group App">
           <label for="addcard_saveas" className="cols-sm-3 control-label">Save As <span className="mandate">*</span> </label>
              <div className="cols-sm-5">
                  <div className="input-group">
                      <input type="text" className="form-control App" name="addcard_saveas" id="addcard_saveas" placeholder="Save As" value={this.state.addcard_saveas} onChange={this.handleChange} />
                  </div>
                  {this.state.validateResponse.paymethodId_error === 'required' ?
                    <span className="form_error"> {t('label_label.paymethodIdRequired')}</span> : null}
                  {this.state.validateResponse.paymethodId_error === 'minLength' ?
                    <span className="form_error"> {t('label_label.paymethodIdMinlength')} </span> : null}
                  {this.state.validateResponse.paymethodId_error === 'maxLength' ?
                     <span className="form_error"> {t('label_label.paymethodIdMaxlength')} </span> : null}
                  {this.state.validateResponse.paymethodId_error === 'regex' ?
                    <span className="form_error"> {t('label_label.paymethodIdInvalid')} </span> : null}
              </div>
          </div>
      <div className="row mt-3">
      <div className="col-4 col-md-3 ml-auto">
       <button  onClick={this.addCard} disabled = {!this.state.allowAddCard}
        className="btn btn-primary btn-block login-button">{t('label_btn.save')}</button>
      </div>
      <div className="col-4 col-md-3 mr-auto">
      <button onClick={this.handleClose}
        className="btn btn-block btn-outline-primary login-button">{t('label_btn.cancel')}</button>
        </div>
    </div>

      </div>
    </div>
  </div>
    
  </Modal.Body>

</Modal>
    </LoadingOverlay>                                             
    </div>
      );
    }
   
}

export default withTranslation() (CheckoutComponent);
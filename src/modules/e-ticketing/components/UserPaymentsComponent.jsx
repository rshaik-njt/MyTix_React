import React, { Component } from 'react';
import '../css/eticket-style.scss';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Modal from "react-bootstrap/Modal";
import MenuBarComponent from './MenuBarComponent';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { EticketingService } from '../services/EticketingService';
import { withTranslation } from 'react-i18next';
import { CacheService } from '../../framework/services/CacheService';
import { ValidationService } from '../../framework/services/ValidationService';
import { BrowserView, MobileView} from "react-device-detect";
import MobileMenuBarComponent from './MobileMenuBarComponent';
import { MessageService } from '../../framework/services/MessageService';
import  LoadingComponent from '../../common/components/LoadingComponent';
import LoadingOverlay from 'react-loading-overlay';

const divHeight = {
    minHeight:"55em"   
}

const modalStyle = {
    minWidth:"15em"   
}

const emailMsgFont = {
    fontSize: "medium",
    fontWeight: 600
}

class UserPaymentsComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addShow: false,
            editShow: false,
            deleteShow: false,
            payments: [],
            validateResponse: {},
            addCard_cardName:'',
            editPayment_cardName:'',
            NameonCard:'',
            paymethodId:'',
            addcard_saveas:'',
            addCard_cardNumber:'',
            editPayment_cardNumber:'',
            cardNumber:'',
            addCard_expiryMonth:'',
            editPayment_expiryMonth:'',
            expiryMonth:'',
            addCard_expiryYear:'',
            editPayment_expiryYear:'',
            expiryYear:'',
            addCard_zip:'',
            editPayment_zip:'',
            zip:'',
            addCard_cvv:'',
            editPayment_cvv:'',
            cvv:'',
            isDefault: false,
            isActive : true,
            validateScreenName: 'addPayment',
            allowUpdateCard : false,
            allowAddCard : false,

        };
        this.AddhandleShow = this.AddhandleShow.bind(this);
        this.AddhandleClose = this.AddhandleClose.bind(this);
        this.EdithandleShow = this.EdithandleShow.bind(this);
        this.EdithandleClose = this.EdithandleClose.bind(this);
        this.DeletehandleShow = this.DeletehandleShow.bind(this);
        this.DeletehandleClose = this.DeletehandleClose.bind(this);
        this.EticketingService = new EticketingService();
        this.ValidationService = new ValidationService();
        this.handleChange = this.handleChange.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.validate = this.validate.bind(this);
        this.onChange = this.onChange.bind(this);
        this.CacheService = new CacheService();
        this.MessageService = new MessageService();
        this.addCard = this.addCard.bind(this);
        this.editCard = this.editCard.bind(this);
        this.deleteCard = this.deleteCard.bind(this);
        this.PaymentEditRemover = this.PaymentEditRemover.bind(this);
        this.cardTypeImg = this.cardTypeImg.bind(this);
        this.constructYears = this.constructYears.bind(this);
        this.years = {};
        this.currentMonth = null;
        this.currentYear = null;
    }

    constructYears(){
        this.years = {};
        var today = new Date();
        var year = today.getFullYear();
        this.currentMonth = today.getMonth();
        this.currentYear = (year+'').substr(-2);
        this.setState({ expiryYear :((year+'').substr(-2)) });
        for(var i = 0; i <= 5; i++) {
          var y = year + i + '';
          var shortyear = y.substr(-2);
          this.years[shortyear] = y;
        } 
    }

    componentDidMount() {
        this.setState({isActive : true});                    

        let uid = this.CacheService.getCache("uid");
        if(!uid) {
            this.MessageService.setMessageToDisplay(117);
            this.props.history.push("/eticketing");
        }
        this.EticketingService.getPayments().then(data => {
            if( (data.content + "") !== "undefined"){
            this.setState({ payments: data.content });
            }
            this.setState({ isActive : false });                    
        }).catch(error => {
                    
            this.setState({isActive : false});
             
        });
    this.constructYears();                    

    }

    Edit(rowData, column) {
        return <EditIcon onClick={this.handleShow} />;

    }

    Delete(rowData, column) {
        return <DeleteIcon onClick={this.handleShow} />;
    }

    async handleChange(e) {
        const { name, value } = e.target;
        await this.setState({ [name]: value });
        this.validate();
    }

    onBlur(e) {
        this.validate();
    }

    onChange(e) {
        this.setState({isDefault : !this.state.isDefault});
    }

    async validate(){
      
        let request = {};

        if(this.state.validateScreenName === 'addPayment'){
            
            if(this.state.paymethodId !== ''){
            request.paymethodId = this.state.paymethodId;
            }
            if(this.state.addCard_cardNumber !== ''){
            request.ccDigits = this.state.addCard_cardNumber;
            }
            if((this.state.addCard_expiryMonth + this.state.addCard_expiryYear) !== ''){
            request.ccExp = this.state.addCard_expiryMonth + this.state.addCard_expiryYear;
            }
            if(this.state.addCard_cardName !== ''){
            request.ccHolderName = this.state.addCard_cardName;
            }
            if(this.state.addCard_cvv !== ''){
            request.cvv = this.state.addCard_cvv;
            }
            if(this.state.isDefault !== ''){
            request.isDefault = this.state.isDefault ? 'Y' : 'N';
            }
            if(this.state.addCard_zip !== ''){
            request.zip = this.state.addCard_zip;
            }
            request.paymentType = '2';
        }
        if(this.state.validateScreenName === 'updatePayment'){
            
            if(this.state.editPayment_cardNumber !== ''){
            request.ccDigits = this.state.editPayment_cardNumber;
            }
            if((this.state.editPayment_expiryMonth + this.state.editPayment_expiryYear) !== ''){
            request.ccExp = this.state.editPayment_expiryMonth + this.state.editPayment_expiryYear;
            }
            if(this.state.editPayment_cardName !== ''){
            request.ccHolderName = this.state.editPayment_cardName;
            }
            if(this.state.editPayment_cvv !== ''){
            request.cvv = this.state.editPayment_cvv;
            }
            if(this.state.isDefault !== ''){
            request.isDefault = this.state.isDefault ? 'Y' : 'N';
            }
            if(this.state.editPayment_zip !== ''){
            request.zip = this.state.editPayment_zip;
            }
            request.paymentType = '2';
        }
        
        this.ValidationService.validateForm(this.state.validateScreenName, request).then(result => {
    
                this.setState({ validateResponse: result });
        }).catch(error => {
            this.setState({isActive : false});
            
        });
        await this.setState();

        if(this.state.validateResponse.isValid && this.state.addCard_zip !== '' &&
            this.state.addCard_cvv !== '' && this.state.addCard_cardName !== '' &&
            this.state.addCard_cardNumber !== '' && (this.state.addCard_expiryMonth + this.state.addCard_expiryYear) !== ''
             && this.state.paymethodId !== ''){
            this.setState({allowAddCard: true});
        }else{
            this.setState({allowAddCard: false});
        }
        if(this.state.validateResponse.isValid && this.state.editPayment_zip !== '' &&
            this.state.editPayment_cvv !== '' && this.state.editPayment_cardName !== '' &&
            this.state.editPayment_cardNumber !== ''&& (this.state.editPayment_expiryMonth + this.state.editPayment_expiryYear) !== ''){
            this.setState({allowUpdateCard: true});
        }else{
            this.setState({allowUpdateCard: false});
        }
    }

    AddhandleClose() {
        this.clearStateValues();
        this.setState({ addShow: false });
        let validateResponse = {};
        this.setState({validateResponse : validateResponse});
        
    }

    AddhandleShow() {
        this.clearStateValues();
        let user = JSON.parse(this.CacheService.getCache("user"));
        var name = user.firstName +' '+ user.lastName;
        this.setState({addCard_cardName : name});
        this.setState({ addShow: true });
        this.setState({validateScreenName: 'addPayment'});
    }
    EdithandleClose() {
        this.clearStateValues();
        let validateResponse = {};
        this.setState({validateResponse : validateResponse});
        this.setState({ editShow: false });
    }

    EdithandleShow(rowdata) {
        this.clearStateValues();
        this.setState({ paymethodId : rowdata.paymethodId});
        this.setState({ editPayment_cardName : rowdata.ccHolderName});
        this.setState({ editShow: true });
        this.setState({validateScreenName : 'updatePayment'});
    }
    DeletehandleClose() {
        this.clearStateValues();
        this.setState({ deleteShow: false });
    }

    DeletehandleShow(rowdata) {
        this.setState({ paymethodId : rowdata.paymethodId});
        this.setState({ cardNumber : rowdata.ccDigits});
        this.setState({ NameonCard : rowdata.ccHolderName});
        this.setState({ expiryMonth : rowdata.ccExp.substr(0,2) });
        this.setState({ expiryYear : rowdata.ccExp.substr(-2)});
        this.setState({ zip : rowdata.zip});
        this.setState({ isDefault : rowdata.isDefault === 'Y' ? true : false});
        this.setState({ deleteShow: true });
        this.setState({validateScreenName : 'deletePayment'});
        
    }

    clearStateValues(){

        this.setState({            
            isDefault: false,
            addCard_cardName:'',
            editPayment_cardName:'',
            paymethodId:'',
            addCard_cardNumber:'',
            editPayment_cardNumber:'',
            addCard_expiryMonth:'',
            editPayment_expiryMonth:'',
            addCard_expiryYear:'',
            editPayment_expiryYear:'',
            addCard_zip:'',
            editPayment_zip:'',
            addCard_cvv:'',
            editPayment_cvv:'',
        }); 
    }

    addCard(e){
        this.setState({isActive : true});                    

        let request = {};
        let payment = [];
        let attributes = {};
        attributes.paymethodId = this.state.paymethodId;
        attributes.ccDigits = this.state.addCard_cardNumber;
        attributes.ccExp = this.state.addCard_expiryMonth + this.state.addCard_expiryYear;
        attributes.ccHolderName = this.state.addCard_cardName;
        attributes.isDefault = this.state.isDefault ? 'Y' : 'N';
        attributes.cvv = this.state.addCard_cvv;
        attributes.zip = this.state.addCard_zip;
        attributes.paymentType = '2';
        payment.push(attributes);
        request.paymentlist = payment;
        this.ValidationService.validateForm('addPayment', attributes).then(result => {
            this.setState({ validateResponse: result });
            if (this.state.validateResponse.isValid) {

                this.setState({addShow : false});                

                let existpayments = this.state.payments;
                for(let index in existpayments){
                    if(existpayments[index].paymethodId.toLowerCase() === this.state.paymethodId.toLowerCase() ||
                       existpayments[index].paymethodId.toUpperCase() === this.state.paymethodId.toUpperCase()){
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
                let selectedMonth = parseInt(this.state.addCard_expiryMonth);
                    if(this.state.addCard_expiryYear === this.currentYear && selectedMonth <= this.currentMonth){
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

                var card = this.state.addCard_cardNumber+'';
                attributes.ccDigits = card.substr(0,6)+'XXXXXX'+card.substr(-4);

                newpayments.push(attributes);
                this.setState({payments : newpayments});

                var element = document.getElementById("msg_description");
                        element.innerHTML = "Payment Method Added Successfully"; 
                        element.setAttribute('class', "alert alert--success alert--dismissible message-container-error"); 
                        setTimeout(() => {
                            element.innerHTML = ""; 
                        element.setAttribute('class', ""); 
                        }, 5000);

                    this.clearStateValues();                    
                    this.setState({isActive : false});                    

                }).catch(error => {
                    this.clearStateValues();
                    this.setState({isActive : false});                    
                    this.setState({addShow : false});
                     
                });
            } else {
                // this.clearStateValues();
                this.setState({isActive : false});                    

            }
        }).catch(error => {
            this.clearStateValues();
            this.setState({isActive : false});                    

        });
 
    }

    editCard(e){
        this.setState({isActive : true});
        let request = {};
        let payment = [];
        let attributes = {};
        attributes.paymethodId = this.state.paymethodId;
        attributes.ccDigits = this.state.editPayment_cardNumber;
        attributes.ccExp = this.state.editPayment_expiryMonth + this.state.editPayment_expiryYear;
        attributes.ccHolderName = this.state.editPayment_cardName;
        attributes.isDefault = this.state.isDefault ? 'Y' : 'N';
        attributes.cvv = this.state.editPayment_cvv;
        attributes.zip = this.state.editPayment_zip;
        attributes.paymentType = '2';
        payment.push(attributes);
        request.paymentlist = payment;
        this.ValidationService.validateForm('updatePayment', attributes).then(result => {
            this.setState({ validateResponse: result });
            if (this.state.validateResponse.isValid) {
                this.setState({editShow : false});

                let selectedMonth = parseInt(this.state.editPayment_expiryMonth);
                    if(this.state.editPayment_expiryYear === this.currentYear &&  selectedMonth <= this.currentMonth){
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

                this.EticketingService.updatePayment(request).then(response => {    
                let payments = this.state.payments;
                let updatedPayments = [];
                for(let index in payments){
                    if(payments[index].paymethodId === this.state.paymethodId){
                        var card = this.state.editPayment_cardNumber+'';
                        attributes.ccDigits = card.substr(0,6)+'XXXXXX'+card.substr(-4);
                        updatedPayments.push(attributes);
                    }else{
                        updatedPayments.push(payments[index]);
                    }
                    
                }

                this.setState({payments : updatedPayments});    
                var element = document.getElementById("msg_description");
                        element.innerHTML = "Payment Method Updated Successfully"; 
                        element.setAttribute('class', "alert alert--success alert--dismissible message-container-error"); 
                        setTimeout(() => {
                            element.innerHTML = ""; 
                        element.setAttribute('class', ""); 
                        }, 5000);

                    this.clearStateValues();
                    this.setState({isActive : false});
                    

                }).catch(error => {
                    this.clearStateValues();
                    this.setState({isActive : false});
                    this.setState({editShow : false});
                     
                });
            } else {
                // this.clearStateValues();
                this.setState({isActive : false});
            }
        }).catch(error => {
                this.clearStateValues();
                this.setState({isActive : false});
            
        });
        
    }

    deleteCard(e){
        this.setState({ deleteShow: false });
        this.setState({isActive : true});
        let request = {};
        let payment = [];
        let attributes = {};
        attributes.paymethodId = this.state.paymethodId;
        attributes.ccExp = this.state.expiryMonth + this.state.expiryYear;
        attributes.ccHolderName = this.state.NameonCard;
        attributes.isDefault = this.state.isDefault ? 'Y' : 'N';
        attributes.zip = this.state.zip;
        attributes.paymentType = '2';
        payment.push(attributes);
        request.paymentlist = payment;
                this.EticketingService.deletePayment(request).then(response => {
                    let payments = this.state.payments;
                    let updatedPayments = [];
                    for(let index in payments){
                        if(payments[index].paymethodId !== this.state.paymethodId){
                            updatedPayments.push(payments[index]);
                        }                        
                    }    
                this.setState({payments : updatedPayments});    
                    this.clearStateValues();
                    this.setState({isActive : false});
                    this.setState({deleteShow : false});

                    var element = document.getElementById("msg_description");
                        element.innerHTML = "Payment Method Deleted Successfully"; 
                        element.setAttribute('class', "alert alert--success alert--dismissible message-container-error"); 
                        setTimeout(() => {
                            element.innerHTML = ""; 
                        element.setAttribute('class', ""); 
                        }, 5000);

                }).catch(error => {
                    this.clearStateValues();
                    this.setState({isActive : false});
                    this.setState({deleteShow : false});
                     
                });
    }

    PaymentEditRemover(rowData){
        return  <div className="number">
        <EditIcon onClick={(e) => this.EdithandleShow(rowData)} className="color"> </EditIcon> 
        <DeleteIcon onClick={(e) => this.DeletehandleShow(rowData)} className="mandate"> </DeleteIcon>
        </div>;
    }
    cardTypeImg(rowData){
        
        if((rowData.ccDigits).toString().substr(0,1) === '4'){
        return <img className="" src={require("../images/visa_card.png")} alt="Visa Card"></img>;
        }
        else if((rowData.ccDigits).toString().substr(0,1) === '6'){
            return <img className="" src={require("../images/discover_card.png")} alt="Discover Card"></img>;   
        }
        else if((rowData.ccDigits).toString().substr(0,1) === '5'){
            return <img className="" src={require("../images/master_card.png")} alt="Master Card"></img>;   
        }
        else if((rowData.ccDigits).toString().substr(0,1) === '3'){
            return <img className="" src={require("../images/amex_card.png")} alt="Amex Card"></img>;   
        }
    }
    ccExpFormat(rowData){
        return (rowData.ccExp.substr(0,2) +'/'+ rowData.ccExp.substr(-2) );
    }


    render() {
        const { t } = this.props;
        let yearsListOptions = Object.keys(this.years).map((k) => {
            return (
                    <option key={k} value={k}>{this.years[k]}</option>
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
                   <MobileMenuBarComponent> </MobileMenuBarComponent>
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
                                         <MenuBarComponent selectedMenu="my-payments"> </MenuBarComponent>                                         
                                    </BrowserView>    
                               </div>
                            <div className="col-md-9 reg mt-4" tabIndex="-1">
                                <div className="mt-4 mb-4 tab-lbl">
                                <span className="">{t('label_title.paymentProfile')}</span>
                                </div>

                                    <div className="tbl text-left">
                                        <span className="tab-lbl pb-4">{t('label_title.savedCards')}</span>
                                        <div className="table-responsive table tblOverFlow">
                                            <DataTable value={this.state.payments} paginator={false}  className="thead-light text-left">
                                                <Column field={this.cardTypeImg} header={t('label_title.cardType')} className="col-width" />
                                                <Column field="paymethodId" header={t('label_title.paymentName')} className="col-width" />
                                                <Column field="ccHolderName" header={t('label_label.NameonCard')} className="col-width" />
                                                <Column field={this.ccExpFormat} header={t('label_label.ExpirationDate')} className="col-width" />
                                                <Column field="ccDigits" header={t('label_label.cardNumber')} className="col-width" />
                                                <Column field="zip" header={t('label_label.zip')} className="col-width" />
                                                <Column body={this.PaymentEditRemover} header="Actions" className="col-width" />
                                            </DataTable>

                                            
                                        </div>
                                        <div className="row mb-4">
                                        <div className="form-group mt-4 col-md-5 pl-4">
                                            <button className="btn btn-primary login-button" onClick={this.AddhandleShow}>{t('label_btn.addCard')}</button>
                                        </div>
                                        </div>
                                    </div>
                                    
                                {/* </div> */}
                            </div>
                        </div>
                    
                                
            <Modal show={this.state.addShow} onHide={() => this.AddhandleClose()}>
                <Modal.Header closeButton>
                {t('label_title.addPayment')} 
                </Modal.Header>
                <Modal.Body>
                    <div className="row" tabIndex="-1">
                        <div className="col-sm-12">
                            <div className="form-horizontal col-md-12 p-4" >{/*form division*/}
                                <div className="form-group App">
                                    <label htmlFor="addCard_cardName" className="cols-sm-2 control-label"> {t('label_label.NameonCard')} <span className="mandate">*</span> </label>
                                    <div className="cols-sm-4">
                                        <div className="input-group">
                                            <input type="text" className="form-control App" name="addCard_cardName" id="addCard_cardName" placeholder={t('label_label.NameonCard')} value={this.state.addCard_cardName} onChange={this.handleChange} onBlur={this.onBlur} />
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
                                        <label htmlhtmlFor="addCard_cardNumber" className="col-5 pr-0 control-label">{t('label_label.cardNumber')}<span className="mandate">*</span> </label>                                   

                                        <div className="text-right col-7 pl-0">
                                        <img className=""  src={require("../images/visa_card.png")} alt="Visa Card"></img> &nbsp;&nbsp;
                                        <img className=""  src={require("../images/master_card.png")} alt="Master Card"></img>&nbsp;&nbsp;
                                        <img className=""  src={require("../images/amex_card.png")} alt="Amex Card"></img>&nbsp;&nbsp;
                                        <img className=""  src={require("../images/discover_card.png")} alt="Discover Card"></img>&nbsp;&nbsp;
                                        </div>
                                    </div>
                                <div className="cols-sm-5">
                                        <div className="input-group">
                                            
                                            <input type="text" className="form-control App" name="addCard_cardNumber" id="addCard_cardNumber" placeholder={t('label_label.cardNumber')}  onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                    <div className="form-group App mr-3">
                                        <label htmlhtmlFor="addCard_expiryMonth" className="col-xs-8 control-label p-0">{t('label_label.expiryMonth')} <span className="mandate">*</span> </label>
                                        <div className="col-xs-8 p-0">
                                            <div className="input-group ">
                                                <select className="form-control" name="addCard_expiryMonth" id="addCard_expiryMonth" value={this.state.addCard_expiryMonth} onChange={this.handleChange} onBlur={this.onBlur}>
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
                                    <div className="form-group App ml-3">
                                        <label htmlhtmlFor="addCard_expiryYear" className="col-xs-8 control-label p-0">{t('label_label.expiryYear')} <span className="mandate">*</span> </label>
                                        <div className="col-xs-8 p-0">
                                            <div className="input-group">
                                                <select className="form-control" name="addCard_expiryYear" id="addCard_expiryYear" value={this.state.addCard_expiryYear} onChange={this.handleChange}>
                                                <option value="">YEAR</option>
                                                {yearsListOptions}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group App col-md-4 ml-2 ">
                                        <label htmlhtmlFor="addCard_cvv" className="col-xs-5 control-label p-0">{t('label_label.cvv')} <span className="mandate">*</span> </label>
                                        <div className="col-xs-5 p-0">
                                            <div className="input-group col-xs-5">
                                                <input type="text" className="form-control App" name="addCard_cvv" id="addCard_cvv" placeholder={t('label_label.cvv')}  onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                        <label htmlFor="addCard_zip" className="col-xs-8 control-label p-0"> {t('label_label.zip')} <span className="mandate">*</span> </label>
                                        <div className="col-xs-5">
                                            <div className="input-group">
                                                <input type="text" className="form-control App" name="addCard_zip" id="addCard_zip" placeholder={t('label_label.zip')} value={this.state.addCard_zip} onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                    <div className="form-group mt-4 App col-md-4">
                                        <div className="form-check">
                                            <label htmlFor="blankCheckbox_add" className="control-label App">Default</label>
                                            <input className="form-check-input position-static chk" type="checkbox" id="blankCheckbox_add" value="option1" checked = {this.state.isDefault} aria-label="..." onChange={this.onChange}>
                                            </input>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group App">
                                    <label htmlFor="paymethodId" className="cols-sm-3 control-label">Save As <span className="mandate">*</span></label>
                                    <div className="cols-sm-5">
                                        <div className="input-group">
                                            <input type="text" className="form-control App" name="paymethodId" id="paymethodId" placeholder="Save As" value={this.state.paymethodId} onChange={this.handleChange} onBlur={this.onBlur}/>
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
                            <div className="form-group mt-4 col-md-11 pl-4">
                            <button onClick={this.addCard} disabled = {!this.state.allowAddCard}
                            className="btn btn-primary btn-lg btn-block login-button">{t('label_btn.save')}</button>
                            </div>    
                            </div>
                        </div>
                    </div>
                    
                </Modal.Body>
            </Modal>                                    

            <Modal style={modalStyle} show={this.state.deleteShow} onHide={() => this.DeletehandleClose()}>
                <Modal.Header closeButton>
                    
                    {t('label_title.deleteSavedPayment')}
                </Modal.Header>
                <Modal.Body>
                    <div className="row" tabIndex="-1">
                        <div className="col-sm-12">
                            <div className="form-horizontal col-md-12 p-4">
                            <div className="odr pt-2">
                                    <div className="row m-2 mt-4">
                                        <div className="col-md-5">
                                            <span>Name</span> <br/>
                                            <span> <b> {this.state.NameonCard} </b> </span>
                                        </div>
                                        <div className="col-md-5">
                                            <span>Payment Name</span> <br/>
                                            <span><b> {this.state.paymethodId} </b> </span>
                                        </div>
                                    </div>
                                    <span className="mt-4"></span>
                                    <div className="row m-2 mt-4">
                                        <div className="col-md-5">
                                            <span>Expiration Time</span> <br/>
                                            <span><b> {this.state.expiryMonth}/ {this.state.expiryYear}</b> </span>
                                        </div>
                                        <div className="col-md-5">
                                            <span>Ending in</span> <br/>
                                            <span><b> {(this.state.cardNumber).toString().substring(-4)} </b> </span>
                                        </div>
                                    </div>
                                    <span className="m-4" style={emailMsgFont}>Are you sure you want to delete this payment?</span>
                                </div>
                            <div className="form-group mt-4 col-md-11 pl-4">
                            <button  onClick={this.deleteCard}
                            className="btn btn-primary btn-block login-button">{t('label_btn.confirm')}</button>
                            </div>    
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>                                    
 
           <Modal show = {this.state.editShow} onHide={() => this.EdithandleClose()}>
                <Modal.Header closeButton>
                {t('label_title.editpayment')} : <b> {this.state.paymethodId} </b> 
                </Modal.Header>
                <Modal.Body><div className="row" tabIndex="-1">
                    <div className="col-sm-12">
                        <div className="form-horizontal col-md-12"> 
                            <div className="form-group App">
                                    <label htmlFor="editPayment_cardName" className="cols-sm-2 control-label"> {t('label_label.NameonCard')} <span className="mandate">*</span></label>
                                <div className="cols-sm-4">
                                    <div className="input-group">                                        
                                        <input type="text" className="form-control App" name="editPayment_cardName" id="editPayment_cardName" placeholder= {t('label_label.NameonCard')} value={this.state.editPayment_cardName} onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                    <label htmlFor="editPayment_cardNumber" className="col-5 pr-0 control-label"> {t('label_label.cardNumber')} <span className="mandate">*</span> </label>
                                    <div className="text-right col-7 pl-0">
                                    <img className=""  src={require("../images/visa_card.png")} alt="Visa Card"></img>&nbsp;&nbsp;
                                    <img className=""  src={require("../images/master_card.png")} alt="Master Card"></img>&nbsp;&nbsp;
                                    <img className=""  src={require("../images/amex_card.png")} alt="Amex Card"></img>&nbsp;&nbsp;
                                    <img className=""  src={require("../images/discover_card.png")} alt="Discover Card"></img>&nbsp;&nbsp;
                                    </div>
                                </div>    
                                <div className="cols-sm-5">
                                    <div className="input-group">
                                        
                                        <input type="text" className="form-control App" name="editPayment_cardNumber" id="editPayment_cardNumber" placeholder={t('label_label.cardNumber')}  onChange={this.handleChange} onBlur={this.onBlur} />
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
                                <div className="form-group App mr-3">
                                    <label htmlFor="editPayment_expiryMonth" className="col-xs-8 control-label p-0">{t('label_label.expiryMonth')} <span className="mandate">*</span></label>
                                    <div className="col-xs-8 p-0">
                                        <div className="input-group ">
                                            <select className="form-control" name="editPayment_expiryMonth" id="editPayment_expiryMonth" value={this.state.editPayment_expiryMonth} placeholder={t('label_label.expiryMonth')} onChange={this.handleChange}>
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
                                <div className="form-group App ml-3">
                                    <label htmlFor="editPayment_expiryYear" className="col-xs-8 control-label p-0">{t('label_label.expiryYear')} <span className="mandate">*</span></label>
                                    <div className="col-xs-8 p-0">
                                        <div className="input-group">

                                            <select className="form-control" name="editPayment_expiryYear" id="editPayment_expiryYear" value={this.state.editPayment_expiryYear} placeholder={t('label_label.expiryYear')} onChange={this.handleChange}>
                                            <option value="">YEAR</option>
                                            {yearsListOptions}   
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group App col-md-4 ml-2 ">
                                    <label htmlFor="editPayment_cvv" className="col-xs-5 control-label p-0">{t('label_label.cvv')} <span className="mandate">*</span></label>
                                    <div className="col-xs-5 p-0">
                                        <div className="input-group col-xs-5">
                                            <input type="text" className="form-control App" name="editPayment_cvv" id="editPayment_cvv"  placeholder={t('label_label.cvv')} onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                    <label htmlFor="editPayment_zip" className="col-xs-5 control-label"> {t('label_label.zip')} <span className="mandate">*</span></label>
                                    <div className="col-xs-5">
                                        <div className="input-group">
                                           
                                            <input type="text" className="form-control App" name="editPayment_zip" id="editPayment_zip" value={this.state.editPayment_zip} placeholder={t('label_label.zip')} onChange={this.handleChange} onBlur={this.onBlur}/>
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
                                <div className="form-group App col-md-4">
                                    <div className="form-check">
                                        <label htmlFor="name" className="control-label App">Default </label>
                                        <input className="form-check-input position-static chk" type="checkbox" placeholder={t('label_label.saveCard')} checked = {this.state.isDefault}  id="blankCheckbox_edit" value="option1" aria-label="..." onChange={this.onChange}>
                                        </input>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group col-md-11 pl-4">
                            <button onClick={this.editCard}
                            className="btn btn-primary btn-block login-button" disabled = {!this.state.allowUpdateCard} alt="click here to update payment">{t('label_btn.updatePayment')}</button>
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

export default withTranslation() (UserPaymentsComponent);
import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import * as commonConstants from '../../common/services/CommonConstants';
import { CacheService } from '../../framework/services/CacheService';
import { withRouter } from 'react-router-dom';
import { EticketingService } from '../services/EticketingService';
import { ETICKETTING_PATH,STUDENTTICKET_PATH,PROMOTIONS_PATH } from '../../framework/services/ApplicationConstants';


const btnStyle = {
  backgroundColor: "#fff",
  border: "none",
  color: "#000",
  fontWeight: "bold"
}

class MenuBarComponent extends Component {

  constructor(props) {
    super(props);
    this.CacheService = new CacheService();
    this.EticketingService = new EticketingService();
    this.onClick = this.onClick.bind(this);
     let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
    let user_config = JSON.parse(app_config)['home_config']['user_account'];
    this.contactUsURL = user_config['CONTACT_US_URL'];
  }
  
  onClick(e){
    if(e.target.name === 'my-tickets') {
        this.CacheService.removeDataFromCache('my-tickets');
        this.props.history.push(ETICKETTING_PATH+"/my-tickets");
    } else if(e.target.name === "purchase") {
        this.props.history.push(ETICKETTING_PATH+"/purchase");
    }else if(e.target.name === "my-payments") {
      this.props.history.push(ETICKETTING_PATH+"/payment");
    }else if(e.target.name === "user-profile") {
      this.props.history.push(ETICKETTING_PATH+"/user-profile");
    }else if(e.target.name === "logout") {
        this.EticketingService.logout().then(response => {
          this.CacheService.removeDataFromCache('my-tickets');
          this.CacheService.removeDataFromCache('uid');
          this.props.history.push(ETICKETTING_PATH);
        }).catch(error => {
            this.CacheService.removeDataFromCache('my-tickets');
            this.CacheService.removeDataFromCache('uid');
            this.props.history.push(ETICKETTING_PATH);
        });
    }
  }

   render() {
     return (
         <Navbar bg="white" expand="false" className="p-2  shadow-sm rounded" tabIndex="-1">
              <span className="col-md-12 my-3 font-weight-bold text-dark" alt="MANAGE MY TICKETS"> MANAGE MY TICKETS </span>
            {this.props.selectedMenu === 'my-tickets' ?
              <Nav.Link className="col-md-12 menuBorder activeMenuColor" id="my-tickets" name="my-tickets" 
                onClick={this.onClick} alt="click for My tickets">My Tickets</Nav.Link> :
              <Nav.Link className="col-md-12 menuBorder" id="my-tickets" name="my-tickets" 
                onClick={this.onClick} alt="click for My tickets">My Tickets</Nav.Link> }

            {this.props.selectedMenu === 'purchase' ?

              <Nav.Link className="col-md-12 menuBorder activeMenuColor" id="purchase" name="purchase"
                onClick={this.onClick} alt="click for Purchase tickets">Purchase </Nav.Link> :

                <Nav.Link className="col-md-12 menuBorder" id="purchase" name="purchase"
                onClick={this.onClick} alt="click for Purchase tickets">Purchase </Nav.Link> }
              

              <span className="col-md-12 my-3 font-weight-bold text-dark" alt="MANAGE MY ACCOUNT"> MANAGE MY ACCOUNT </span>
              {this.props.selectedMenu === 'user-profile' ?
              <Nav.Link className="col-md-12 menuBorder activeMenuColor" id="user-profile" name="user-profile"
                onClick={this.onClick} alt="Account Settings">Account Settings</Nav.Link> :
              
              <Nav.Link className="col-md-12 menuBorder" id="user-profile" name="user-profile"
                onClick={this.onClick} alt="Account Settings">Account Settings</Nav.Link> }

              {this.props.selectedMenu === 'my-payments' ?
              <Nav.Link className="col-md-12 menuBorder activeMenuColor" id="my-payments" name="my-payments"
                onClick={this.onClick}  alt="My Payments">My Payments</Nav.Link> :
                <Nav.Link className="col-md-12 menuBorder" id="my-payments" name="my-payments"
                onClick={this.onClick}  alt="My Payments">My Payments</Nav.Link>
              }
              <Nav.Link className="col-md-12 menuBorder" target="_blank"  
              id="contactus" name="contactus" alt="Contact Us" href={this.contactUsURL}>Contact Us</Nav.Link>
              <Nav.Link className="col-md-12 menuBorder" alt="Logout" onClick={this.onClick} id="logout" name="logout">Logout</Nav.Link>
          </Navbar>
          )
   }

}


export default withRouter(MenuBarComponent);
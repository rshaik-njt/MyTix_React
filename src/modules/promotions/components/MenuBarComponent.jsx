import React, { Component } from 'react';
import { Nav, Navbar} from 'react-bootstrap';
import { PROMOTIONS_PATH } from '../../framework/services/ApplicationConstants';
import { CacheService } from '../../framework/services/CacheService';
import { withRouter } from 'react-router-dom';
import { PromotionsService } from '../services/PromotionsService';
import * as commonConstants from '../../common/services/CommonConstants';


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
    this.PromotionsService = new PromotionsService();
    this.onClick = this.onClick.bind(this);
     let app_config = this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD);
    let user_config = JSON.parse(app_config)['home_config']['user_account'];
    this.contactUsURL = user_config['CONTACT_US_URL'];
  }

  onClick(e){
    if(e.target.name === 'ticket_options') {
        this.CacheService.removeDataFromCache('ticket_data');
        this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath") +"/purchase"); 
    } else if(e.target.name === "user-profile") {
        this.props.history.push(PROMOTIONS_PATH +  this.CacheService.getCache("promoPath") + "/userProfile");
    }else if(e.target.name === "logout") {
        this.PromotionsService.logout().then(response => {
          this.CacheService.removeDataFromCache('ticket_data');
          this.CacheService.removeDataFromCache('uid');
          this.props.history.push(PROMOTIONS_PATH +  this.CacheService.getCache("promoPath"));
        }).catch(error => {
            this.CacheService.removeDataFromCache('ticket_data');
            this.CacheService.removeDataFromCache('uid');
            this.props.history.push(PROMOTIONS_PATH +  this.CacheService.getCache("promoPath"));
        });
    }
  }

   render() {
     return (

        <Navbar bg="white" expand="false" className="p-2  shadow-sm rounded">
                <span className="col-md-12 my-3 font-weight-bold text-dark"> MANAGE MY TICKETS </span>
                {this.props.selectedMenu === 'ticket_options' ?
                <Nav.Link id="ticket_options" name="ticket_options" alt="click here for Ticket Options"
                         className="col-md-12 menuBorder activeMenuColor" onClick={this.onClick}>Ticket Options</Nav.Link>
                :
                <Nav.Link id="ticket_options" name="ticket_options" alt="click here for Ticket Options"
                         className="col-md-12 menuBorder" onClick={this.onClick}>Ticket Options</Nav.Link>

                }
                <span className="col-md-12 my-3 font-weight-bold text-dark"> MANAGE MY ACCOUNT </span>
                {this.props.selectedMenu === 'user-profile' ?
                <Nav.Link  id="user-profile" name="user-profile" alt="click here account settings"
                          className="col-md-12 menuBorder activeMenuColor" onClick={this.onClick}>Account Settings</Nav.Link>
                :
                <Nav.Link  id="user-profile" name="user-profile" alt="click here account settings"
                          className="col-md-12 menuBorder" onClick={this.onClick}>Account Settings</Nav.Link>
                }
                <Nav.Link target="_blank" className="col-md-12 menuBorder" alt="click here for contact us" href={this.contactUsURL}>Contact Us</Nav.Link>
                <Nav.Link className="col-md-12 menuBorder" id="logout" name="logout" alt="click here to logout" onClick={this.onClick}>Logout</Nav.Link>
                      
            </Navbar>

         
          )
   }

}


export default withRouter(MenuBarComponent);
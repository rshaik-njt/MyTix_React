import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';

const mobMenuStyle = {
    top : "-15px",
    backgroundColor : "transparent"
}
class MobileMenuBarComponent extends Component {

   render() {
     return (
          <Navbar bg="white" collapseOnSelect expand="sm" style={mobMenuStyle}  className="py-0 mt-2  shadow-sm rounded" tabIndex="-1">
               
              <Navbar.Toggle aria-controls="responsive-navbar-nav" className="mobHeading mt-1 hamb" />
              <Navbar.Collapse id="responsive-navbar-nav">
                  <Nav className="mr-auto pl-3 pr-3">
                      <span className="col-md-12 mb-2 mt-2 p-0 font-weight-bold text-dark" alt="MANAGE MY TICKETS"> MANAGE MY TICKETS </span>
                      {this.props.selectedMenu === 'my-tickets' ?
                      <Nav.Link className="col-md-12 menuBorder activeMenuColor" href="/eticketing/my-tickets" alt="click for My tickets">My Tickets</Nav.Link>
                      : 
                      <Nav.Link className="col-md-12 menuBorder" href="/eticketing/my-tickets" alt="click for My tickets">My Tickets</Nav.Link>
                      }

                      {this.props.selectedMenu === 'purchase' ?
                      <Nav.Link className="col-md-12 menuBorder activeMenuColor" href="/eticketing/purchase" alt="click for Purchase tickets">Purchase </Nav.Link>
                      :
                      <Nav.Link className="col-md-12 menuBorder" href="/eticketing/purchase" alt="click for Purchase tickets">Purchase </Nav.Link>
                      }
                      <span className="col-md-12 mb-2 p-0 mt-2 font-weight-bold text-dark" alt="MANAGE MY ACCOUNT"> MANAGE MY ACCOUNT </span>
                      {this.props.selectedMenu === 'user-profile' ?
                      <Nav.Link className="col-md-12 menuBorder activeMenuColor" href="/eticketing/user-profile" alt="Account Settings">Account Settings</Nav.Link>
                      :
                      <Nav.Link className="col-md-12 menuBorder" href="/eticketing/user-profile" alt="Account Settings">Account Settings</Nav.Link>
                      }
                      {this.props.selectedMenu === 'my-payments' ?
                      <Nav.Link className="col-md-12 menuBorder activeMenuColor" href="/eticketing/payment" alt="My Payments">My Payments</Nav.Link>
                      :
                      <Nav.Link className="col-md-12 menuBorder" href="/eticketing/payment" alt="My Payments">My Payments</Nav.Link>
                      }
                      <Nav.Link className="col-md-12 menuBorder" target="_blank" href="https://www.njtransit.com/tm/tm_servlet.srv?hdnPageAction=ContactUsTo">Contact Us</Nav.Link>
                      <Nav.Link className="col-md-12 menuBorder" href="/eticketing">Logout</Nav.Link>
                  </Nav>
              </Navbar.Collapse>
          </Navbar>
      )
   }

}


export default MobileMenuBarComponent;
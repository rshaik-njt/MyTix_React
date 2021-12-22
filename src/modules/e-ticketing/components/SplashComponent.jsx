import React, { Component } from 'react';
import { CacheService } from '../../framework/services/CacheService';
import { CommonService } from '../../common/services/CommonService';
import { withTranslation } from 'react-i18next';

class SplashComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: '',
      msgCode: {}
    }
    this.CommonService = new CommonService();
    this.CacheService = new CacheService();

  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value })

  }
  // componentDidMount(){
  //   this.getMessaage();
  // }

  // getMessaage(){
  //   this.message = JSON.parse(this.CacheService.getCache('messages'));
  //   if(msgCode ===  100) { 
  //     let msg = JSON.parse(message)['messages']['msgCode'];
  //     var desc = [];
  //     for (let key in messages) {
  //       let success = {};
  //       success.msgCode = key;
  //       success.message = msg[key];
  //       desc.push(success);   
  //       this.setState({msg : desc});
  //   }
      
      
	// 	} 
    
  // }

  render() {
    
    // let msg = this.state.msg;
    // let successMsg = msg.map((msg) =>
    //         <option key={msg.msgCode} value={msg.msgCode}>{msg.desc}</option>
    //     );

    
    return (
      <div id="eticketing-splash-screen">
        <div className="bg-splash mt-n2" >

          <div className="container">
            <div className="row justify-content-center">

                <div id="notification-message-container" className="msgDesc">
                  <div id="msg_description"></div>
                </div>

            </div>

          </div>

        </div>
        
      </div>



    );
  }
}

export default withTranslation()(SplashComponent);
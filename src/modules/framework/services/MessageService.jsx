import { CacheService }  from '../../framework/services/CacheService';

export class MessageService {
	

    constructor(){
    	this.CacheService = new CacheService();
    	this.messages = [];
		this.displaymessage = {};
    }

    
	setMessageToDisplay(message) {   
		if(this.messages.length <= 0) { 
			this.messages = JSON.parse(this.CacheService.getCache('messages'));		
		} 	 
		if(this.messages && message !== 0) {
			this.messageToDisplay = this.messages[message]; 
			if(!this.messageToDisplay) {
				this.messageToDisplay = this.messages[101];
			}
			this.messageToDisplay['msgTimer'] = this.messageToDisplay['msgTimer'] * 1000;
			this.setMessage(this.messageToDisplay);
		} else {
		  	var element = document.getElementById("msg_description");
			element.innerHTML = "Unable to Process your Request. Please try again later"; 
			element.setAttribute('class', "alert alert--error alert--dismissible message-container-error"); 
			setTimeout(() => {
				element.innerHTML = ""; 
			element.setAttribute('class', ""); 
			}, 5000);
		}
	
	}

	setGlobalMessage(message) {
		this.setMessage(message) 
		this.setRegisterMessage(message)
	}

	setMessageAndCategory(messageToDisplay) {
	    var element = document.getElementById("msg_description");
	    if(element) {
			element.innerHTML = messageToDisplay.msgValue; 
			switch(messageToDisplay['msgCategory']) {
				case 0 :
					element.setAttribute('class', "alert alert--info alert--dismissible message-container-notification"); 
					break;
				case 1 : 
					element.setAttribute('class', 'alert alert--success alert--dismissible message-container-notification');
					break;
				case 2:
					element.setAttribute('class','alert alert--info alert--dismissible message-container-notification');
					break;
				case 3:
					element.setAttribute('class', 'alert alert--error alert--dismissible message-container-error');
					break;
				case 4:
					element.setAttribute('class', 'alert alert--warning alert--dismissible message-container-warning');
					break;
				default:
					element.innerHTML = ''; 
					element.setAttribute('class', '');
			}	

	    }
	
	}

	setMessage(messageToDisplay) {
		var msgTimer  = messageToDisplay['msgTimer'];
		setTimeout(() => {
		var el = document.getElementById('notification-message-container')
	        if (el) {
	            var y = el.offsetTop;
	            this.setMessageAndCategory(messageToDisplay)
	            window.scrollTo(0, y);		            
	            el.focus();
    			setTimeout(() => {
    				let noMessage = {};
    				noMessage['msgValue'] = "";
    				noMessage['msgCategory'] = "6";
			        this.setMessageAndCategory(noMessage);
			    }, msgTimer);
	        }
		}, 0);
	}

	setRegisterMessage(message) {
		if(this.messages.length === 100) { 
			this.messages = JSON.parse(this.CacheService.getCache('messages'));		
		} 	 
		if(this.messages && message !== 0) {
			this.messageToDisplay = this.messages[message]; 
			this.messageToDisplay['msgTimer'] = this.messageToDisplay['msgTimer'] * 1000;
			this.setMessage(this.messageToDisplay);
		} else {
		  	var element = document.getElementById("msg_description");
			element.innerHTML = "Unable to Process your Request. Please try again later"; 
			element.setAttribute('class', "alert alert--error alert--dismissible message-container-error"); 
			setTimeout(() => {
				element.innerHTML = ""; 
			element.setAttribute('class', ""); 
			}, 5000);
		}
	}

	clearMessge() {
		let noMessage = {};
		noMessage['msgValue'] = "";
		noMessage['msgCategory'] = "6";
        this.setMessageAndCategory(noMessage);
	}

	getMessageDesc(msg_code) {
		if(this.messages.length <= 0) { 
			this.messages = JSON.parse(this.CacheService.getCache('messages'));		
		} 
		return this.messages[msg_code]; 
	}
}
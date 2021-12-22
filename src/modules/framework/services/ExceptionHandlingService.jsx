 import { MessageService } from './MessageService';
 
 export  class ExceptionHandlingService  {
 	constructor() {
 		this.MessageService = new MessageService();
 	}
	setException(msg) {
		this.MessageService.setMessageToDisplay(0);
	}

	redirectToErrorPage() {
		// Redirect to Error Page. need to configure the page location and pass it here.
		// Simulate an HTTP redirect:
		//window.location("");

	}
}
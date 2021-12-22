export  class ValidationService {

    constructor() {
      this.rules = ['minLength', 'maxLength', 'required', 'regex'];
      this.typeConvertor = ['number', 'number', 'boolean', 'regex'];
      this.validations = null;
    }

   setValidations = (vs) => new Promise((resolve, reject) => {
     setTimeout(() => {
        if(this.validations) {
            return;
        }
      
        this.validations = {};
        var arr = null;
        var value = null;
        var regParts = null;
        var sep = String.fromCharCode(166);
        var ruleObject = {};
        var i = 0;
        for (var key in vs) {
            if (vs.hasOwnProperty(key)) {
                arr = vs[key].split(sep);
                ruleObject = {};
                for (i = 0; i < this.rules.length; i++) {
                  if (!arr[i]) {
                     continue;
                  }
                  switch (this.typeConvertor[i]) {
                      case 'number':
                        value = parseInt(arr[i]);
                         break;
                      case 'boolean':
                         value = (arr[i] === 'Y') ? true : false;
                        break;
                      case 'regex':
                         regParts = arr[i].match(/^\/(.*?)\/([gim]*)$/);
                         if (regParts) {
                           // the parsed pattern had delimiters and modifiers. handle them. 
                           value = new RegExp(regParts[1], regParts[2]);
                        } else {
                            // we got pattern string without delimiters
                            value = arr[i]; // removed regexp conversion
                        }
                        break;
                      default:
                         value = arr[i];
                        break
                  }
                  ruleObject[this.rules[i]] = value;
                }
              this.validations[key] = ruleObject;
            }
        }
       return resolve(this.validations);
     }, 20);
    });

    // Screen name coming from component should be as per DB configuration.
    validateForm =(screenName, request) => new Promise((resolve, reject) => { 
      var validationResponse = {}; 
      this.validations = JSON.parse(sessionStorage.getItem("validations"));
      validationResponse['isValid'] = true;
      Object.keys(request).forEach((key, index) => {
        let validationKey = screenName+'_'+key;
        if(this.validations[validationKey]) {
          if(this.validations[validationKey]['required'] && (!request[key]  || request[key] === '')) {
            validationResponse[key+'_error'] = 'required';
            validationResponse['isValid'] = false;
          } else if(request[key].length < this.validations[validationKey]['minLength']) {
              validationResponse[key+'_error'] = 'minLength';
              validationResponse['isValid'] = false;            
          } else if(request[key].length > this.validations[validationKey]['maxLength']) {
              validationResponse[key+'_error'] = 'maxLength';
              validationResponse['isValid'] = false;            
          }  else if(!new RegExp(this.validations[validationKey]['regex']).test(request[key]) ) {
              validationResponse[key+'_error'] = 'regex';
              validationResponse['isValid'] = false;   
                    
          } 

        }       
      });  
      return resolve(validationResponse);
    });

  };
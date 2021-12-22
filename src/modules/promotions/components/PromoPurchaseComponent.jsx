import React from 'react';
import '../css/Promo-style.scss';
import { MessageService } from '../../framework/services/MessageService';
import { PromotionsService } from '../services/PromotionsService';
import { CacheService } from '../../framework/services/CacheService';
import * as commonConstants from '../../common/services/CommonConstants';
import { ValidationService } from '../../framework/services/ValidationService';
import { PROMOTIONS_PATH } from '../../framework/services/ApplicationConstants';
import LoadingOverlay from 'react-loading-overlay'
import { withTranslation } from 'react-i18next';
import LoadingComponent from '../../common/components/LoadingComponent';
import MenuBarComponent from './MenuBarComponent';
import _ from 'lodash';
import Tab from 'react-bootstrap/Tab'
import { Nav, Row, Col} from 'react-bootstrap';
import { UserAgent } from 'react-ua';
import { BrowserView, MobileView} from "react-device-detect";
import MobileMenuBarComponent from './MobileMenuBarComponent';

const imgStyle = {
    height: "12em",
    width: "80%",
    margin: 'auto'
};

 const contentStyle = {
    width: "70%",
    margin: "auto",
    borderRadius: '5px',
    border: '1px solid #70707080',
    opacity: 1,
    boxShadow:'0px 6px 6px #00000066'
};

 const headStyle = {
    color: "#F5600C",
    width: "70%",
    margin: "auto"  
};

const leftPadding = {
  paddingLeft : '0px'
}

class PromoPurchaseComponent extends React.Component {

    constructor(props) {
        super(props);
        this.CacheService = new CacheService();
        this.state = {
            adder: 0,
            showOrigin: false,
            showDest: false,
            showVia: false,
            showTicketTypes: false,
            showdestination: false,
            showZones: false,
            showBus: false,
            showLightRail: false,
            busPurchaseType: '',
            products: [],
            selectedProduct: '',
            originStations: {},
            selectedOrigin: '',
            destinations: [],
            selectedDestination: '',
            viaStations : [],
            selectedVia : '',
            ticketTypes : [],
            selectedTktType : '',
            routes: {},
            selectedRoute : '',
            zones: [],
            selectedZone: '',
            tariffTypes : {},
            selectedTariff : '',
            isActive : true,
            showTariff : false,
            isDataValid : false,
            isProductEligible : true,
            lrLines : [],
            lrLine : '',
            defaultProduct : ''
        }
        this.promoProducts = [];
        this.welcomeImgUrl = '';
        this.lrProducts = [];
        this.handleChange = this.handleChange.bind(this);
        this.verifyOrder = this.verifyOrder.bind(this);
        this.onTicketTypeChange = this.onTicketTypeChange.bind(this);
        this.lrLineChange = this.lrLineChange.bind(this);
        this.PromotionsService = new PromotionsService();
        this.ValidationService = new ValidationService();
        this.MessageService = new MessageService();
        this.CacheService = new CacheService();
        this.app_config = {};        
        this.ticket_types = [];
      
    }
    componentDidMount() {
        let uid = this.CacheService.getCache("uid");
        if(!uid) {
            this.MessageService.setMessageToDisplay(117);
            this.props.history.push(PROMOTIONS_PATH +  this.CacheService.getCache("promoPath"));
        }

        this.setState({defaultProduct : '1'});                 
        this.welcomeImgUrl = this.CacheService.getCache('WELCOME_IMAGE_URL') +'?v=' + Date.now();
        this.MessageService.clearMessge();
        this.app_config = JSON.parse(this.CacheService.getCache(commonConstants.GET_CONFIG_METHOD));   
        this.getLightRailProducts();      

    }

    buildSelectedData(promoProducts) {
        if(this.CacheService.getCache('ticket_data')) {
            this.setState({isDataValid : true});
            let ticketData = JSON.parse(this.CacheService.getCache('ticket_data'));
            this.setState({isActive : false});            
            if(ticketData.productId === "1") {
                this.setState({defaultProduct : '1'});                 
                this.setState({selectedProduct : ticketData.productId});
                this.setState({selectedOrigin : ticketData.origin});
                this.setState({selectedDestination : ticketData.destination});
                this.setState({selectedVia : ticketData.via});
                this.setState({selectedTktType : ticketData.ttId});
                this.getOriginStations(ticketData.productId);
                this.getDestinationStations(ticketData.origin);
                this.getViaStations(ticketData.destination);
                this.getTicketTypes(ticketData.productId);
            } else if(ticketData.productId === "2") {
                this.setState({defaultProduct : '2'});               
                this.setState({selectedProduct : ticketData.productId});
                this.setState({selectedRoute : ticketData.selectedRoute});
                this.setState({selectedTariff : ticketData.tariffType});                
                this.setState({selectedZone : ticketData.busZone});
                this.setState({selectedTktType : ticketData.ttId});
                this.getRoutes(ticketData.productId);
                this.getTariffTypes(ticketData.selectedRoute);
                this.getZones(ticketData.tariffType);
                this.getTicketTypes(ticketData.productId);  
            } else {
                this.setState({defaultProduct : '3'});
                this.setState({selectedProduct : ticketData.productId});
                this.setState({selectedTktType : ticketData.ttId});
                this.getTicketTypes(ticketData.productId);
                this.setState({lrLine : ticketData.lrLine});
            }
            
        } else {
            this.setState({defaultProduct : '1'});
            this.setProduct("1", promoProducts);
        }
    }

    async setProduct(product, promoProducts){
        this.setState({isActive : true});
        this.setState({isDataValid : false});
        this.setState({selectedOrigin : ""});
        this.setState({selectedDestination : ""});
        this.setState({selectedVia : ""});
        this.setState({selectedTktType : ""});
        this.setState({isProductEligible : true});
        this.setState({lrLine : ''});
        this.setState({selectedRoute : ''});
        this.CacheService.removeDataFromCache("originStations");
        this.CacheService.removeDataFromCache("destinations");
        this.CacheService.removeDataFromCache("viaStations");
        this.CacheService.removeDataFromCache("routes");
        this.CacheService.removeDataFromCache("tarifTypes");
        this.CacheService.removeDataFromCache("zones");
        let selectedProduct = product;     
        await this.setState({ selectedProduct: selectedProduct });
        if(selectedProduct === '') {
            this.setState({isActive : false});
            return;
        }


        if(selectedProduct === '1') {
            this.setState({ showDest: false });
            this.setState({ showVia : false });
            this.setState({ showTicketTypes : false });
            if(!promoProducts[selectedProduct]) {
                this.setState({isProductEligible : false});
                this.setState({isActive : false}); 
                return;
            }
            this.getOriginStations(selectedProduct);    
           
            this.setState({defaultProduct : '1'});

        } else if(selectedProduct === '2') {
            this.setState({ showTariff: false });
            this.setState({ showZones : false });
            this.setState({ showTicketTypes : false });
            this.setState({defaultProduct : '2'});
             if(!promoProducts[selectedProduct]) {
                this.setState({isProductEligible : false});
                this.setState({isActive : false}); 
            }
            this.getRoutes(selectedProduct);
        } else {
            this.setState({ showTicketTypes : false }); 
            this.setState({defaultProduct : '3'});
            if(!(promoProducts["3"] || promoProducts["8"]  ||  promoProducts["9"])) {
                this.setState({isProductEligible : false});
                this.setState({isActive : false}); 
                return;
            }

        }
        this.setState({isActive : false});

    }

  
    onProductChange = (e) => {
       let selectedProduct = e.target.name;     
       this.setProduct(selectedProduct, this.promoProducts);
    }

    onOriginChange = (e) => {
        this.setState({isActive : true});
        this.setState({isDataValid : false});
        this.setState({selectedDestination : ""});
        this.setState({selectedVia : ""});
        this.setState({selectedTktType : ""});
        this.CacheService.removeDataFromCache("destinations");
        this.CacheService.removeDataFromCache("viaStations");
        this.setState({selectedOrigin : e.target.value});
        if(e.target.value === '') {
            this.setState({isActive : false});
            return;
        }
        this.setState({ showDest: false });
        this.setState({ showVia : false });
        this.setState({ showTicketTypes : false });
        this.getDestinationStations(e.target.value);
    }

    onDestinationChange = (e) => {
        this.setState({isActive : true});
        this.setState({isDataValid : false});

        this.setState({selectedVia : ""});
        this.setState({selectedTktType : ""});
        this.CacheService.removeDataFromCache("viaStations");
        this.setState({selectedDestination : e.target.value});
        if(e.target.value === '') {
            this.setState({isActive : false});
            return;
        }
        this.setState({ showVia : false });
        this.setState({ showTicketTypes : false });
        this.getViaStations(e.target.value);

    }

    onViaChange = (e) => {
        this.setState({selectedTktType : ""});
        this.setState({isDataValid : false});

        this.setState({selectedVia : e.target.value});  
        if(e.target.value === '') {
            this.setState({isActive : false});
            return;
        }       
        this.setState({ showTicketTypes : false });
        this.getTicketTypes();
    }

    onTicketTypeChange = (e) => {
        if(e.target.value !== 0 || e.target.value !== '') {
            this.setState({isDataValid : true});
        }
        this.setState({selectedTktType : e.target.value});
    }

    onBusRouteChange = (e) => {
        this.setState({isActive : true});
        this.setState({isDataValid : false});
        this.setState({selectedTariff : ""});
        this.setState({selectedZone : ""});
        this.setState({selectedTktType : ""});
        this.CacheService.removeDataFromCache("tarifTypes");
        this.CacheService.removeDataFromCache("zones");
        this.setState({selectedRoute : e.target.value});
         if(e.target.value === '') {
            this.setState({isActive : false});
            return;
        }
        this.getTariffTypes(e.target.value);
        this.setState({ showTariff: true });
        this.setState({ showBusZones: false });
        this.setState({ showTicketTypes : false });

    }

    onTariffChange = (e) => {
        this.setState({isActive : true}); 
        this.setState({isDataValid : false});

        this.setState({selectedZone : ""});
        this.setState({selectedTktType : ""}); 
        this.CacheService.removeDataFromCache("zones");      
        this.setState({selectedTariff : e.target.value});
         if(e.target.value === '') {
            this.setState({isActive : false});
            return;
        }
        this.getZones(e.target.value);
        this.setState({ showBusZones: true });
        this.setState({ showTicketTypes : false });
    }

    onZoneChange = (e) => {
        this.setState({selectedZone : e.target.value});
        this.setState({isDataValid : false});
        this.setState({selectedTktType : ""});
        if(e.target.value === '') {
            this.setState({isActive : false});
            return;
        }
        this.getTicketTypes();
        this.setState({ showTicketTypes : true });
    }

    async lrLineChange(e) {
        this.setState({isDataValid : false});
        this.setState({selectedTktType : ""});
        let selectedProduct = e.target.value;     
        this.setState({lrLine : selectedProduct});
        await this.setState({ selectedProduct: selectedProduct });
        if(selectedProduct === '') {
            this.setState({ showTicketTypes : false });

            this.setState({isActive : false});
            return;
        }
        this.getTicketTypes(selectedProduct);
        this.setState({ showTicketTypes : true });
    }
     

    handleChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    constructProducts()  {
        let products;
        this.PromotionsService.getProducts().then(result => {
            this.CacheService.setCache("promo_config", JSON.stringify(this.app_config['promo_config']));
            products = result;
            this.promoProducts = JSON.parse((this.app_config)['promo_config']['products']);
            var prdts = [];
            var lrLines = [];
            for (let prodId in this.promoProducts) {
                let option = {};
                option.prdtId = prodId;
                option.productName = products[prodId];
                if(prodId !== '1' && prodId !== '2') {
                    _.forEach(this.lrProducts, function(value, key) {
                        let tt_id = key.toString();
                        if(tt_id.substring(0,1) === prodId) {
                            lrLines.push(option);
                        }
                    });
                }
                prdts.push(option);
                this.setState({ products: prdts });
                this.setState({ lrLines: lrLines }); 

            }   
            this.buildSelectedData(this.promoProducts);                                   
        });

        
        
    }

    getOriginStations(product) {
        let selectedProduct = product ? product : this.state.selectedProduct;
        if(this.CacheService.getCache("originStations")) {
            let originStations = JSON.parse(this.CacheService.getCache("originStations"));
            let promoOrigin = this.promoProducts[selectedProduct]['origin'];
            if(promoOrigin.indexOf('ALL') !== -1) {
                this.setState({ originStations: originStations });
            } else {
                let stations = promoOrigin.split(',');
                let option = {};                
                for (let key in stations) {
                    option[stations[key]] = originStations[stations[key]];
                    this.setState({ originStations: option });
                }
            }
            this.setState({isActive : false});

        } else {
            this.PromotionsService.getOriginStations().then(result => {
                this.CacheService.setCache("originStations", JSON.stringify(result));  
                let originStations = result;
                let promoOrigin = this.promoProducts[selectedProduct]['origin'];
                if(promoOrigin.indexOf('ALL') !== -1) {
                    this.setState({ originStations: originStations });
                } else {
                    let stations = promoOrigin.split(',');
                    let option = {};                
                    for (let key in stations) {
                        option[stations[key]] = originStations[stations[key]];
                        this.setState({ originStations: option });
                    }
                }
                this.setState({isActive : false});

            }).catch(error => {
                this.setState({isActive : false});              
            });
        }
      
    }   

    getDestinationStations(selectedOrigin) {
        if(this.CacheService.getCache("destinations")) {
            let destinations = JSON.parse(this.CacheService.getCache("destinations"));
            this.setState({ destinations: destinations });
            this.setState({ showDest: true });
        } else {
            let request = {};
            request.promoCode = this.CacheService.getCache('promoCode');
            request.productId = this.state.selectedProduct;
            request.origin = selectedOrigin;
            this.ValidationService.validateForm('getDestinations', request).then(result => {
                this.setState({ validateResponse: result });
                if(this.state.validateResponse.isValid) {
                    this.PromotionsService.getDestinationStations(request).then(response => {
                        this.CacheService.setCache("destinations", JSON.stringify(response.content.stations));  
                        this.setState({ destinations: response.content.stations });
                        this.setState({isActive : false});
                        this.setState({ showDest: true });
                    }).catch(error => {
                        this.setState({isActive : false});
                    });
                } else {
                    this.setState({isActive : false});                    

                }
            }).catch(error => {
                this.setState({isActive : false});
            });
        }

    }

    getViaStations(selectedDestination) {
        if(this.CacheService.getCache("viaStations")) {
            let viaStations = JSON.parse(this.CacheService.getCache("viaStations"));

            let promoVia = this.promoProducts[this.state.selectedProduct]['via'].toLowerCase(); 
            if(promoVia.indexOf('all') !== -1) {
                this.setState({ viaStations: viaStations });
            } else {
                let option = [];                
                for (let via in viaStations) {
                    if(viaStations[via]['code'].toString() === promoVia){
                        option[via] =  viaStations[via];
                    }                    
                }
                this.setState({ viaStations: option });
            } 

            // this.setState({ viaStations: viaStations});
            this.setState({ showVia: true });
        } else {
            let request = {};
            request.promoCode = this.CacheService.getCache('promoCode');
            request.productId = this.state.selectedProduct;
            request.origin = this.state.selectedOrigin;
            request.destination = selectedDestination;
            this.ValidationService.validateForm('getViaStations', request).then(result => {
                this.setState({ validateResponse: result });
                if(this.state.validateResponse.isValid) {
                    this.PromotionsService.getViaStations(request).then(response => {
                        this.CacheService.setCache("viaStations", JSON.stringify(response.content.stations));  
                        let viaStations = response.content.stations;
                        // this.setState({ viaStations: response.content.stations });

                        let promoVia = this.promoProducts[this.state.selectedProduct]['via'].toLowerCase(); 
                        if(promoVia.indexOf('all') !== -1) {
                            this.setState({ viaStations: viaStations });
                        } else {
                            let option = [];                
                            for (let via in viaStations) {
                                console.log(promoVia+":::::::::"+viaStations[via]['code'].toString());
                                if(viaStations[via]['code'].toString() === promoVia){
                                    option[via] =  viaStations[via];
                                }                    
                            }
                            this.setState({ viaStations: option });
                        }
                        
                        this.setState({isActive : false});
                        this.setState({ showVia: true });
                    }).catch(error => {
                        this.setState({isActive : false});
                    });
                } else {
                    this.setState({isActive : false});                    

                }
            }).catch(error => {
                this.setState({isActive : false});
            });
        }
       
    }

    getTicketTypes(product) {
        let selectedProduct = product ? this.promoProducts[product] : this.promoProducts[this.state.selectedProduct];
        if(selectedProduct && selectedProduct.tt_id) {
            let tTypesList = [];
            for (let ttid in selectedProduct.tt_id) {
                let tTypes = {};
                let ticketTypes = JSON.parse(this.CacheService.getCache('ticket_types'));
                
                let types = ticketTypes[this.state.selectedProduct+'_'+selectedProduct.tt_id[ttid]];
                tTypes['value'] =  selectedProduct.tt_id[ttid];
                tTypes['label'] =  types;            
                
                tTypesList.push(tTypes);
            }
            if(tTypesList.length>0){
                this.setState({ showTicketTypes: true });
            }
            this.setState({ ticketTypes : tTypesList});
        }
    }

    getRoutes(product) {
        let selectedProduct = product ? product : this.state.selectedProduct;
        if(this.CacheService.getCache("routes")) {
             let routes = JSON.parse(this.CacheService.getCache("routes"));
             let promoRoutes = this.promoProducts[selectedProduct]['route'].toLowerCase();
             if(promoRoutes.indexOf('all') !== -1) {
                this.setState({ routes: routes });
            } else {
                let option = {};                
                for (let route in promoRoutes) {
                    option[promoRoutes] =  routes[promoRoutes];
                    this.setState({ routes: option });
                }
            }
      
        } else {
            let request = {};
            request.promoCode = this.CacheService.getCache('promoCode');
            this.PromotionsService.getRoutes(request).then(result => {  
                this.CacheService.setCache("routes", result.content.routes); 
                    this.setState({isActive : false});
                    let routes = JSON.parse(result.content.routes);
                    let promoRoutes = this.promoProducts[selectedProduct]['route'].toLowerCase();
                    if(promoRoutes.indexOf('all') !== -1) {
                        this.setState({ routes: routes });
                    } else {
                        let option = {};                
                        for (let route in promoRoutes) {
                            option[promoRoutes] =  routes[promoRoutes];
                            this.setState({ routes: option });
                        }
                    }
            }).catch(error => {
                    this.setState({isActive : false});
            }).catch(error => {
                this.setState({isActive : false});
            });
        }
        
    }

    getLightRailProducts() {
        let request = {};
        request.promoCode = this.CacheService.getCache('promoCode');
        this.PromotionsService.getLightRailProducts(request).then(result => {  
            this.setState({isActive : false});
            this.lrProducts = JSON.parse(result.content.lrProducts);
            this.constructProducts(); 
        }).catch(error => {
            this.setState({isActive : false});
        }); 
    }

    getTariffTypes(selectedRoute) {
        if(this.CacheService.getCache("tarifTypes")) {
            let tarifTypes = this.CacheService.getCache("tarifTypes"); 
            let routePreference = this.promoProducts['2']['route_preference'];
            this.setState({isActive : false});
            let tariffmap = {};
            if(routePreference === '1'){               
                tariffmap['1']="INTRASTATE";
            }else if(routePreference === '2'){
                tariffmap['2']="INTERSTATE";
            }else if(routePreference === '3'){
                tariffmap['3']="INTRA-COMMUTER";
            }else{
                tariffmap['1']="INTRASTATE";
                tariffmap['2']="INTERSTATE";
                tariffmap['3']="INTRA-COMMUTER";
            }
            this.setState({ tariffTypes: tariffmap});
            // this.setState({ tariffTypes: JSON.parse(tarifTypes)});
            this.setState({ showTariff : true });

        } else {
            let request = {};
            request.promoCode = this.CacheService.getCache('promoCode');
            request.productId = this.state.selectedProduct;
            request.route = selectedRoute; 
            this.ValidationService.validateForm('authenticateUser', request).then(result => {
                this.setState({ validateResponse: result });
                if(this.state.validateResponse.isValid) {
                    this.PromotionsService.getTariffTypes(request).then(response => {
                        let tarifTypes =   response.content.tarif_types; 
                        this.CacheService.setCache("tarifTypes", tarifTypes); 
                        this.setState({isActive : false});

                        let routePreference = this.promoProducts['2']['route_preference'];
                        let tariffmap = {};
                        if(routePreference === '1'){               
                            tariffmap['1']="INTRASTATE";
                        }else if(routePreference === '2'){
                            tariffmap['2']="INTERSTATE";
                        }else if(routePreference === '3'){
                            tariffmap['3']="INTRA-COMMUTER";
                        }else{
                            tariffmap['1']="INTRASTATE";
                            tariffmap['2']="INTERSTATE";
                            tariffmap['3']="INTRA-COMMUTER";
                        }
                        this.CacheService.setCache("tarifTypes", tariffmap); 
                        this.setState({ tariffTypes: tariffmap});
                        // this.setState({ tariffTypes: JSON.parse(tarifTypes)});
                        this.setState({ showTariff : true });
                    }).catch(error => {
                        this.setState({isActive : false});
                    });
                } else {
                    this.setState({isActive : false});
                }
            }).catch(error => {
                this.setState({isActive : false});
            });
        }
       
    }

    getZones(selectedTariff) {
        if(this.CacheService.getCache("zones")) {
            let zones = JSON.parse(this.CacheService.getCache("zones"));     
            let promoZone = this.promoProducts[this.state.selectedProduct]['zones'].toLowerCase(); 
            if(promoZone.indexOf('all') !== -1) {
                let option = {};
                for (let zone in zones) {                    
                    option[zones[zone]] =  zones[zone];                                 
                }
                this.setState({ zones: option });
            } else {
                let option = {};                
                // for (let zone in zones) {
                //     if(zones[zone] === promoZone){
                //         option[promoZone] =  zones[zone];
                //     }                    
                // }
                for (let zone=1; zone <= promoZone; zone++) {                    
                        option[zone] =  zone;                                      
                }
                this.setState({ zones: option });
            }              
            this.setState({isActive : false});
            // this.setState({ zones: zones });
            this.setState({ showBusZones : true });
        } else {
            let request = {};
            request.promoCode = this.CacheService.getCache('promoCode');
            request.productId = this.state.selectedProduct;
            request.route = this.state.selectedRoute;
            request.tariffType = selectedTariff;
            this.ValidationService.validateForm('authenticateUser', request).then(result => {
                this.setState({ validateResponse: result });
                if(this.state.validateResponse.isValid) {
                    this.PromotionsService.getZones(request).then(response => {
                        this.CacheService.setCache("zones", JSON.stringify(response.content.zones)); 
                        let zones = response.content.zones;     
                        let promoZone = this.promoProducts[this.state.selectedProduct]['zones'].toLowerCase(); 
                        if(promoZone.indexOf('all') !== -1) {
                            let option = {};
                            for (let zone in zones) {                    
                                option[zones[zone]] =  zones[zone];                                 
                            }
                            this.setState({ zones: option });
                        } else {
                            let option = {};                
                                // for (let zone in zones) {
                                //     if(zones[zone] === promoZone){
                                //     option[promoZone] =  zones[zone];
                                //     }
                                // }
                                for (let zone=1; zone <= promoZone; zone++) {                    
                                    option[zone] =  zone;                                      
                                }    
                            this.setState({ zones: option });
                        }              
                        this.setState({isActive : false});
                        // this.setState({ zones: zones });
                        this.setState({ showBusZones : true });

                    }).catch(error => {
                        this.setState({isActive : false});
                    });
                } else {
                    this.setState({isActive : false});
                }
            }).catch(error => {
                this.setState({isActive : false});
            });

        }
       
    }

    verifyOrder() {
        this.setState({isActive : true});
        let request = this.constructRequestObject();
        this.ValidationService.validateForm('getViaStations', request).then(result => {
            this.setState({ validateResponse: result });
            if(this.state.validateResponse.isValid) {
                this.PromotionsService.verifyOrder(request).then(response => {
                    this.setState({isActive : false});
                    this.props.history.push(PROMOTIONS_PATH + this.CacheService.getCache("promoPath") + '/reviewOrder');                    
                }).catch(error => {
                    this.setState({isActive : false});
                });
            } else {
                this.setState({isActive : false});
            }
        }).catch(error => {
            this.setState({isActive : false});
        });
    }

    constructRequestObject() {
        let request = {};
        request.promoCode = this.CacheService.getCache('promoCode');
        request.productId = this.state.selectedProduct;
        request.isspecial = "true";
        if(this.state.selectedProduct === "1") {
            request.origin = this.state.selectedOrigin;
            request.destination = this.state.selectedDestination;
            request.via = this.state.selectedVia;
            request.ttId = this.state.selectedTktType;
            let ticketData = {};
            ticketData.productId = this.state.selectedProduct;
            ticketData.origin = this.state.selectedOrigin;
            ticketData.destination = this.state.selectedDestination;
            ticketData.via = this.state.selectedVia;
            ticketData.ttId = this.state.selectedTktType;
            let origin = this.state.originStations[this.state.selectedOrigin];
            let destination = _.filter(this.state.destinations, { 'code': Number(this.state.selectedDestination)});
            let via = _.filter(this.state.viaStations, {'code': Number(this.state.selectedVia)});
            ticketData.route = origin + ' to ' + destination[0].nameShort;
            let ticketType = _.filter(this.state.ticketTypes, { 'value': this.state.selectedTktType});
            ticketData.originText = origin;
            ticketData.destinationText = destination[0].nameShort;
            ticketData.viaText = via[0].nameShort;
            ticketData.ticketType = ticketType[0];
            this.CacheService.setCache("ticket_data", JSON.stringify(ticketData));
        } else if(this.state.selectedProduct === "2") {
            request.promoCode = this.CacheService.getCache('promoCode');
            request.productId = this.state.selectedProduct;
            request.ttId = this.state.selectedTktType;
            request.bus_zone = this.state.selectedZone;
            request.tariff_type = this.state.selectedTariff;
            request.fare_table_no = this.state.selectedRoute;
            let ticketData = {};
            ticketData.productId = this.state.selectedProduct;
            ticketData.selectedRoute = this.state.selectedRoute;
            ticketData.tariffType =  this.state.selectedTariff;
            ticketData.busZone = this.state.selectedZone;
            ticketData.ttId = this.state.selectedTktType;
            ticketData.route = "Route:" + this.state.selectedRoute + ' | zones:' + this.state.selectedZone;
            let ticketType = _.filter(this.state.ticketTypes, { 'value': this.state.selectedTktType});
            ticketData.ticketType = ticketType[0];
            this.CacheService.setCache("ticket_data", JSON.stringify(ticketData));
        } else {
            request.promoCode = this.CacheService.getCache('promoCode');
            request.productId = this.state.selectedProduct;
            request.ttId = this.state.selectedTktType;
            let ticketData = {};
            ticketData.productId = this.state.selectedProduct;
            let lrRoute = _.filter(this.state.products, { 'prdtId': this.state.selectedProduct});
            ticketData.route = lrRoute[0] ? lrRoute[0]['productName'] : "";
            ticketData.ttId = this.state.selectedTktType;
            ticketData.lrLine = this.state.lrLine;
            let ticketType = _.filter(this.state.ticketTypes, { 'value': this.state.selectedTktType});
            ticketData.ticketType = ticketType[0];
            this.CacheService.setCache("ticket_data", JSON.stringify(ticketData));

        }
        return request;
    }



    render() {
        const { t } = this.props;


        let originStations = this.state.originStations;
        let originOptions = Object.keys(originStations).map((code) =>
            <option key={code} value={code}>{originStations[code]}</option>
        );
       
        let destinations = this.state.destinations;
        let destOptions = destinations.map((destination) =>
            <option key={destination.code} value={destination.code}>{destination.nameShort}</option>
        );

        let viaStations = this.state.viaStations;
        let viaOptions = viaStations.map((via) =>
            <option key={via.code} value={via.code}>{via.nameShort}</option>
        );

        let ticketTypes = this.state.ticketTypes;
        let ticketOptions = ticketTypes.map((ticketType) =>
            <option key={ticketType.value} value={ticketType.value}>{ticketType.label}</option>
        );
        
        let routes = this.state.routes;
        let routeOptions = Object.keys(routes).map((route) =>
            <option key={route} value={route}>{route +'-' + routes[route]}</option>
        );

        let tariffTypes = this.state.tariffTypes;
        let tariffOptions = Object.keys(tariffTypes).map((tariffType) =>
            <option key={tariffType} value={tariffType}>{tariffType +'-' + tariffTypes[tariffType]}</option>
        );

        let zones = this.state.zones;
        let zoneOptions = Object.keys(zones).map((zone) =>
            <option key={zones[zone]} value={zones[zone]}>{zones[zone]}</option>
        );

        let lrLines = this.state.lrLines;
        let  lrLineOptions = lrLines.map((lrLine) =>
            <option key={lrLine.prdtId} value={lrLine.prdtId}>{lrLine.productName}</option>
        );  

        return (
        <LoadingOverlay
              active={this.state.isActive}
              spinner={<LoadingComponent />}
              >
            <div className="" tabIndex="-1">
            <BrowserView>    
            <div className="heading text-mid-right">
                <span>{t('label_title.appTypeTitle')} </span>
            </div>
            </BrowserView>
            <MobileView>
                <div className="heading text-mid-right mb-4 pb-4">
                    <span>{t('label_title.appTypeTitle')} </span>
                </div>
                
            </MobileView>
            <MobileView>
                    <MobileMenuBarComponent selectedMenu = "ticket_options"> </MobileMenuBarComponent>
            </MobileView>   
            <div className="row">
                <div className="col-12">
                    <img id="promo_register_banner_img" className="b-img-ss rounded mt-1 mb-4 p-1" src={this.welcomeImgUrl} alt="First slide"></img>
               </div>
            </div>
                <div className=" mt-n2">
                <div className="col-md-12 container pb-3"  >                        
                 <div className="row justify-content-center">
                    <div className="col-md-3 p-1">
                        <BrowserView>
                            <MenuBarComponent selectedMenu = "ticket_options"> </MenuBarComponent>
                        </BrowserView>
                    </div>
                    <div className="col-md-9 px-5 py-4 reg mt-1 pb-3" tabIndex="-1">
                    <div>
                        <span className="head2" alt="select product">{t('label_label.selectProduct')}</span>
                    </div> 
                    <Tab.Container id="left-tabs-example" activeKey={this.state.defaultProduct}
                     defaultActiveKey={this.state.defaultProduct}>
                        <Row className="shadow-sm border rounded mt-2" tabIndex="-1" >
                             
                            <Col sm={3} style={leftPadding}>
                                <Nav variant="pills" className="flex-column">
                                    <Nav.Item>
                                        <Nav.Link onClick={this.onProductChange} name="1" eventKey="1">
                                            <span className="fs1 c-theme-font">
                                                <img id="rail_img" src={require("../../../images/Rail.svg")} className="tab_icon" alt="Rail"></img>
                                            </span>
                                            {t('label_label.rail')}  
                                        </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link onClick={this.onProductChange} name="2" eventKey="2">
                                            <span className="fs1 c-theme-font">
                                                <img id="bus_img" src={require("../../../images/Bus.svg")} className="tab_icon" alt="Bus"></img>
                                            </span>
                                            {t('label_label.bus')} 
                                            </Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link onClick={this.onProductChange} name="3" eventKey="3">
                                            <span className="fs1 c-theme-font">
                                                <img id="lightRail_img" src={require("../../../images/Light_Rail.svg")} className="tab_icon" alt="Light Rail"></img>
                                            </span>
                                            {t('label_label.lightRail')}
                                        </Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={9}>
                              <Tab.Content>
                                <Tab.Pane  eventKey="1" className='p-4'>
                                    {this.state.isProductEligible ?
                                   <div id="select-rail">
                                        <div className="form-group mt-1">
                                            <div className="col-md-12">
                                                <div className="input-group">
                                                    <select className="form-control float-right col-md-12"
                                                        value={this.state.selectedOrigin}
                                                        name="origin" onChange={this.onOriginChange}>
                                                        <option value="">{t('label_label.selectOrigin')}</option>
                                                        {originOptions}                                                   

                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {this.state.showDest ?
                                            <div className="form-group mt-1" id="Results">
                                                <div className="col-md-12">
                                                    <div className="input-group">
                                                        <select className="form-control float-right col-md-12"
                                                        value={this.state.selectedDestination}

                                                            name="destination" onChange={this.onDestinationChange}>
                                                            <option value="">{t('label_label.selectDestination')}</option>
                                                            {destOptions}                                                       

                                                        </select>
                                                    </div>
                                                </div>
                                            </div> : null}

                                        {this.state.showVia ?
                                            <div className="form-group mt-1 mb-3" id="Results">
                                                <div className="col-md-12">
                                                    <div className="input-group">
                                                        <select className="form-control float-right col-md-12" name="VIa"
                                                            value={this.state.selectedVia}
                                                            onChange={this.onViaChange}>
                                                            <option value="">{t('label_label.selectVIA')}</option>
                                                            {viaOptions}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div> : null}

                                        {this.state.showTicketTypes ?
                                            <div className="form-group mt-1 mb-3" id="tTypes">
                                                <div className="col-md-12">
                                                    <div className="input-group">
                                                        <select className="form-control float-right col-md-12" id="ticketTypes" onChange={this.onTicketTypeChange}
                                                            value={this.state.selectedTktType}
                                                            name="ticketTypes" > 
                                                            <option value="">{t('label_label.selectTicketType')}</option>
                                                             {ticketOptions}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div> : null}
                                   </div> : <span className="promo-os-lbl"> {t('label_msg.promounavailable')} </span>}
                                </Tab.Pane>
                                <Tab.Pane eventKey="2" className='p-4'>
                                    {this.state.isProductEligible ?
                                    <div id="bus-content">
                                        <div className="form-group mt-1">
                                            <div className="col-md-12 mb-3">
                                                <div className="input-group">
                                                    <select className="form-control float-right col-md-12"
                                                    value={this.state.selectedRoute}
                                                        name="origin" onChange={this.onBusRouteChange}>
                                                        <option value="">{t('label_label.selectRoute')}</option>
                                                        {routeOptions}                                                         
                                                    </select>
                                                </div>
                                            </div>
                                            {this.state.showTariff ?
                                                <div>
                                                    <div className="form-group mt-1 mb-3" id="ttypes">
                                                        <div className="col-md-12">
                                                            <div className="input-group">

                                                                <select className="form-control float-right col-md-12" onChange={this.onTariffChange}
                                                                    name="tariffTypes" value={this.state.selectedTariff}>
                                                                    <option value="">{t('label_label.tariffType')}</option>
                                                                     {tariffOptions}  
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {this.state.showBusZones ?
                                                    <div>

                                                        <div className="form-group mt-1 mb-3" id="ttypes">
                                                            <div className="col-md-12">
                                                                <div className="input-group">

                                                                    <select className="form-control float-right col-md-12" onChange={this.onZoneChange}
                                                                        name="ticketTypes" value={this.state.selectedZone}>
                                                                        <option value="">{t('label_label.selectZones')}</option>
                                                                         {zoneOptions}  
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {this.state.showTicketTypes ?
                                                        <div className="form-group mt-1 mb-3" id="ttypes">
                                                            <div className="col-md-12">
                                                                <div className="input-group">

                                                                    <select className="form-control float-right col-md-12" id="lrticketTypes" 
                                                                    onChange={this.onTicketTypeChange}
                                                                        value={this.state.selectedTktType}
                                                                        name="lrticketTypes" > 
                                                                        <option value="">{t('label_label.selectTicketType')}</option>
                                                                         {ticketOptions}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div> : null}
                                                        </div> : null}
                                                </div>

                                                : null}
                                        </div>
                                    </div> : <span className="promo-os-lbl"> {t('label_msg.promounavailable')} </span> }
                                </Tab.Pane>
                                <Tab.Pane eventKey="3" className='p-4'>
                                    {this.state.isProductEligible ? <div id="light-rail-content"> 

                                        <div className="form-group mt-1 mb-3" id="lrLinesdiv">

                                            <div className="col-md-12">
                                                <div className="input-group">
                                                      <select className="form-control float-right col-md-12" id="lrLines" onChange={this.lrLineChange}
                                                            value={this.state.lrLine}
                                                            name="ticketTypes" > 
                                                            <option value="">{t('label_label.selectLightRailLine')}</option>
                                                             {lrLineOptions}
                                                        </select>
                                                </div>
                                            </div>
                                        </div> 
                                        {this.state.showTicketTypes ?
                                        <div className="form-group mt-1 mb-3" id="ttypes">
                                            
                                            <div className="col-md-12">
                                                <div className="input-group">
                                                      <select className="form-control float-right col-md-12" id="ticketTypes" onChange={this.onTicketTypeChange}
                                                            value={this.state.selectedTktType}
                                                            name="ticketTypes" > 
                                                            <option value="">{t('label_label.selectTicketType')}</option>
                                                             {ticketOptions}
                                                        </select>
                                                </div>
                                            </div>
                                        </div> : null}
                                    </div> : <span className="promo-os-lbl"> {t('label_msg.promounavailable')} </span> }
                                </Tab.Pane>
                                <div className="row justify-content-center">
                                    <div className="form-group mt-4 col-md-6">
                                        <button type="submit" onClick={this.verifyOrder} disabled={!this.state.isDataValid}
                                            className="btn btn-primary btn-lg btn-block login-button">{t('label_btn.prReview')}
                                        
                                        </button>
                                    </div>
                                </div>
                              </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </div>
                </div>
                </div>
                </div>
                </div>
        </LoadingOverlay>
                                            
                
        );
    }

}

export default withTranslation()(PromoPurchaseComponent);
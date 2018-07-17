sap.ui.core.mvc.Controller.extend("com.kpi.controller.SectorDetail", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.SectorDetail
*/
	onInit: function() {
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		if (sap.ui.Device.system.phone) {
			//Do not wait for the master2 when in mobile phone resolution
			
			this.oInitialLoadFinishedDeferred.resolve();
		} else {
			var oEventBus = this.getEventBus();
			oEventBus.subscribe("Master", "LoadFinished", this.onMasterLoaded, this);
		}

		this.getRouter().attachRouteMatched(this.onRouteMatched, this);
	},
	
	onRouteMatched: function(oEvent) {
		var oParameters = oEvent.getParameters();	
		
		if (oParameters.name === "sectorDetail")
			{
			
		 var string = oParameters.arguments.entity;
		 var entity = string.split(",");
		 var name = entity[0];
		  var industryLbl = this.getView().byId("_industryLbl");
	        industryLbl.setText(name);
		 var industryId = entity[1];
		 var txtdesc =  this.getView().byId("titleSector");
         txtdesc.setText(entity[0]+"- Sectors");
	        var oSectorModel = new sap.ui.model.json.JSONModel();
	         serviceURL = "/sap/opu/odata/sap/ZGS_KPI_DASHBOARD_PROCAREA_KPI_SRV/IndustrySectorSet?$filter=IndustryId%20eq%20%27"+industryId+"%27&$format=json";
	         $.ajax({
	             type : 'GET',
	             url : serviceURL,
	             datatype : "application/json",
	             async : false,	
	             success : function(data){
	            	// var jsonModel  = new sap.ui.model.json.JSONModel();
	            	 oSectorModel.setData(data.d.results);
	  
	             },
	             error : function(error){
	                   alert("Sector Details Not found");
	             }        
	      });
	         this.getView().setModel(oSectorModel);
	}
	},
	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},
	onSelect : function(oEvent) {
		// Get the list item either from the listItem parameter
		// or from the event's
		// source itself (will depend on the device-dependent
		// mode)
		//var oList = this.getView().byId("master1List");
		this.showDetail(oEvent.getParameter("listItem")
				|| oEvent.getSource());
		//oList.removeSelections();
	},

	showDetail : function(oItem) {
		// If we're on a phone device, include nav in history
		var bReplace = jQuery.device.is.phone ? false : true;
		var context= oItem.getHeader();
		var industryLbl = this.getView().byId("_industryLbl");
		var data = this.getView().getModel().getData();
		var _industryId,_sectorId, _industryName = "";
		_industryName = industryLbl.getText();
		for (var i=0; i<data.length; i++ )
		 {
			if (data[i].SectorName === context )
				{
				_industryId = data[i].IndustryId;
				_sectorId = data[i].SectorId;
				break;
				}
			else
				{
				continue;
				}
		 }
		
		this.getRouter().navTo(
				"detail",
				{
					from : "main",
					entity : context+"|"+_industryId+"|"+_sectorId+"|"+_industryName,
				}, bReplace);
	},onNavBack: function() {
		// This is only relevant when running on phone devices
		this.getRouter().myNavBack("main");
	}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.SectorDetail
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.SectorDetail
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.SectorDetail
*/
//	onExit: function() {
//
//	}

});
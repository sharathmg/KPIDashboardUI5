sap.ui.core.mvc.Controller.extend("com.kpi.controller.KPIDetails", {

	onInit: function() {
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		if (sap.ui.Device.system.phone) {
			//Do not wait for the master2 when in mobile phone resolution
			this.oInitialLoadFinishedDeferred.resolve();
		} else {
			var oEventBus = this.getEventBus();
			oEventBus.subscribe("Master", "LoadFinished", this.onMasterLoaded, this);
		}

		this.getRouter().getRoute("kpidetail").attachPatternMatched(this.onRouteMatched, this);

	},
	onRouteMatched: function(oEvent) {
		var oParameters = oEvent.getParameters();
		 var string = oParameters.arguments.entity;
		 var entity = string.split("|");
		var kpiId = entity[0];
		var industryId = entity[1];
		var sectorId = entity[2];
        var oModel = new sap.ui.model.json.JSONModel();
        //oModel.loadData("model/KPIDetailSet.json","", false);
         serviceURL = "/sap/opu/odata/sap/ZGS_KPI_DASHBOARD_PROCAREA_KPI_SRV/KPIDetailSet?$filter=KpiId%20eq%20%27"+kpiId+"%27%20and%20IndustryId%20eq%20%27"+industryId+"%27%20and%20SectorId%20eq%20%27"+sectorId+"%27&$format=json";
         $.ajax({
             type : 'GET',
             url : serviceURL,
             datatype : "application/json",
             async : false,	
             success : function(data){
            	// var jsonModel  = new sap.ui.model.json.JSONModel();
            	 oModel.setData(data.d.results);
  
             },
             error : function(error){
                 alert("KPISet Count Not found");
           }        
    });
         this.getView().setModel(oModel);
         /*var form = this.getView().byId("simpleFormChange");
         form.setModel(oModel);*/
         var data = oModel.getData();
         
         // Set the value from model to the fields in the View
         this.getView().byId("txtKPIDesc").setText(data[0].KpiDesc);
         this.getView().byId("txtKPIDim").setText(data[0].KeyDimension);
         this.getView().byId("txtbusdriver").setText(data[0].BusinessDriver);
         this.getView().byId("txtBusValue").setText(data[0].BusinessValue);
         this.getView().byId("txtBusRole").setText(data[0].BusinessRole);
         this.getView().byId("txtDelTool").setText(data[0].DeliveryTools);
         this.getView().byId("txtKpiName").setText(data[0].KpiName);
         this.getView().byId("txtKPIType").setText(data[0].KpiType);
         this.getView().byId("txtSystemCompatible").setText(data[0].Compatibility);
         this.getView().byId("idSapLinkText").setText(data[0].GuiRepDesc);
         this.getView().byId("idSapLink").setText(data[0].GuiRepName);
         this.getView().byId("idFioriLinkText").setText(data[0].FioriDesc);
         this.getView().byId("idFioriLink").setText(data[0].FioriName);
         
	        var pageTitle = this.getView().byId("kpiDetailTitle");
	        pageTitle.setText(data[0].IndustryNam + "-" + data[0].SectorNam + "-"+"KPI Details");
         
	},
	
	onNavBack: function() {
		this.getRouter().myNavBack("kpiList1");
	},
	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},
	onExit: function(oEvent) {
		this.getEventBus().unsubscribe("Master2", "LoadFinished", this.onMasterLoaded, this);
	}
});
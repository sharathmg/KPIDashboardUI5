jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
sap.ui.core.mvc.Controller.extend("com.kpi.controller.KPIList", {


/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.KPIList
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
	
	onMasterLoaded: function(sChannel, sEvent, oData) {
		if (oData.oListItem) {
			this.bindView(oData.oListItem.getBindingContext().getPath());
			this.oInitialLoadFinishedDeferred.resolve();
		}
	},
	
	onRouteMatched: function(oEvent) {
		var oParameters = oEvent.getParameters();	
		
		if (oParameters.name === "kpiList")
			{
			var string = oParameters.arguments.entity;
			 var entity = string.split("|");
			 var industryId = entity[0];
			 var sectorId = entity[1];
			 var processArea = entity[2];
			 var priority = entity[3];
			 var processAreaText = entity[4];
			 var filterString;
			 var oModel = new sap.ui.model.json.JSONModel();
			 var serviceURL = "/sap/opu/odata/sap/ZGS_KPI_DASHBOARD_PROCAREA_KPI_SRV/ProcessAreaKPISet?$filter=IndustryId%20eq%20%27"+industryId+"%27%20and%20SectorId%20eq%20%27"+sectorId+"%27";
			 if (processArea === "")
				 {
				 filterString = "%20and%20Priority%20eq%20%27"+priority+"%27&$format=json";
				 }
			 else if(priority === "")
				 {
				 filterString = "%20and%20ProcessareaId%20eq%20%27"+processArea+"%27&$format=json";
				 }
			 else
				 {
				 filterString = "%20and%20ProcessareaId%20eq%20%27"+processArea+"%27%20and%20Priority%20eq%20%27"+priority+"%27&$format=json";	
				 }
			 $.ajax({
	             type : 'GET',
	             url : serviceURL+filterString,
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
			 oModel.setSizeLimit(500);
			 this.getView().setModel(oModel);
				var oTable = this.getView().byId("_customTable");
				oTable.setModel(oModel);
				var tabletile = this.getView().byId("_tabletitle");
		        var count = oTable.getItems().length;  
		       // var _processAreaText = "";
//		        switch(processArea) {
//		        case "RTR":
//		        	_processAreaText = "Record To Report"
//		            break;
//		        case "OTC":
//		        	_processAreaText = "Order To Cash"
//		            break;
//		        case "PTP" :
//		        	_processAreaText = "Procure To Pay"
//		        	break;
//		        default:
//		        	_processAreaText = ""
//		       
//		    }
		        var industryLbl = this.getView().byId("_industryLbl");
		        industryLbl.setText(industryId);
		        var sectorLbl = this.getView().byId("_sectorLbl");
		        sectorLbl.setText(sectorId);
		        var data = oModel.getData();
		        tabletile.setText(processAreaText+" "+priority+" "+ "KPI Items ("+count+")");
		        var pageTitle = this.getView().byId("kpiTitle");
		        pageTitle.setText(data[0].IndustryNam + "-" + data[0].SectorNam + "-"+"KPI List");

			 
			}
	},
	
	onClick : function (oControlEvent) {
		var bReplace = jQuery.device.is.phone ? false : true;
		var source = oControlEvent.getSource();
		var oModel = this.getView().getModel();
		var selContext = source.getBindingContext(); 
		var sPath = selContext.getPath();
		//var obj = this.getModel().getObject(sPath);
		var industryLbl = this.getView().byId("_industryLbl");
		var sectorLbl = this.getView().byId("_sectorLbl");
		var _industryId,_sectorId;
		_industryId = industryLbl.getText();
		_sectorId = sectorLbl.getText();
		var obj = oModel.getObject(sPath);
		var kpiId = obj["KpiId"];
		this.getRouter().navTo(
				"kpidetail",
				{
					from : "kpiList",
					entity : kpiId +"|"+_industryId+"|"+_sectorId
				}, bReplace);
		
	},
	onNavBack: function() {
		this.getRouter().myNavBack("detail1");
	},
	
	exportToExcel: function()
	{
		var oTable = this.getView().byId("_customTable");
		var  cols = oTable.getColumns();
		//var items = oTable.getRows();
		var oModel = this.getView().getModel();
		var items = oModel.getData();
		var cellId = null;
		var cellObj = null;
		var cellVal = null;
		var headerColVal = null;
		var column = null;
		var json = {};
		var colArray = [];
		var itemsArray = [];
		// push header column names to array
		for (var j = 0; j < cols.length; j++) {
			column = "";
			column = cols[j];
			if (j>0)
				{
			if(column.getAggregation("header")!== null)
				{
			// headerColVal = column.getAggregation("label").getText();
				headerColId = column.getAggregation("header").getId();
                headerColObj = sap.ui.getCore().byId(headerColId);
                headerColVal = headerColObj.getText();
			json = {
					name : headerColVal
				};
				colArray.push(json);
				}
				}
		}
		itemsArray.push(colArray);
		// push table cell values to array
		for (var i = 0; i < items.length; i++) {
			colArray = [];
			cellId = "";
			cellObj = "";
			cellVal = "";
			headerColVal = null;
			var item = items[i];
			for (var j = 0; j < cols.length; j++) {
					if (j === 0) {
						json = {
							name : "\r" + item.ProcessareaNam
						};
					}else if (j === 1) {
						json = {
							name : item.KpiNam
						};
					} else if (j === 2) {
						json = {
							name : item.KpiDesc
						};
					}else if(j === 3)  {
						json = {
							name : item.PgrpNam
						};
					}
					if (j < 4)
						{
					colArray.push(json);
						}
			}
			itemsArray.push(colArray);
		}
		
         
        //export json array to csv file
         var oExport = new sap.ui.core.util.Export({
               // Type that will be used to generate the content. Own ExportType's can be created to support other formats
               exportType: new sap.ui.core.util.ExportTypeCSV({
                   separatorChar: ","
               }),
               // Pass in the model created above
               models: oModel,
               // binding information for the rows aggregation
               rows: {
                   path: "/"
               },
               // column definitions with column name and binding info for the content
               columns: [itemsArray]
           });
         oExport.saveFile().always(function() {
               this.destroy();
           });
	},
	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.KPIList
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.KPIList
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.KPIList
*/
//	onExit: function() {
//
//	}

});
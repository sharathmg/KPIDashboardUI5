jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
jQuery.sap.require("sap.m.MessageToast")
sap.ui.core.mvc.Controller.extend("com.kpi.controller.Detail", {

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
		
		if (oParameters.name === "detail")
			{
			
		 var string = oParameters.arguments.entity;
		 var entity = string.split("|");
		
		 var industryId = entity[1];
		 var sectorId = entity[2];
		 var industryName = entity[3];
		
		 // build the variable to hold the text of the graph.&nbsp;
		 // title is combination of industry and sector names
		 var name = industryName.concat("-", entity[0], "-","KPI Graph" );
		 // Set the title with the concatenated title
		 this.getView().byId("titleProcessArea").setText(name);
		 // Execute the Process Model
	        var processAreaModel = new sap.ui.model.json.JSONModel();
	         serviceURL = "/sap/opu/odata/SAP/ZGS_KPI_DASHBOARD_PROCAREA_KPI_SRV/ProcessAreaSet?$format=json";

	         $.ajax({
	             type : 'GET',
	             url : serviceURL,
	             datatype : "application/json",
	             async : false,	
	             success : function(data){
	            	// var jsonModel  = new sap.ui.model.json.JSONModel();
	            	 processAreaModel.setData(data.d.results);
	
	             },
	             error : function(error){

	            	 sap.m.MessageToast.show("KPISet Count Not found");
	            	 //alert("KPISet Count Not found");
	             }
	      });
	         this.getView().setModel(processAreaModel);

			 var processKPIModel = new sap.ui.model.json.JSONModel();
        // processKPIModel.loadData("model/ProcessSet.json");
			 var serviceURL  = "/sap/opu/odata/sap/ZGS_KPI_DASHBOARD_PROCAREA_KPI_SRV/ProcessAreaCountSet?$filter=IndustryId%20eq%20%27"+industryId+"%27%20and%20SectorId%20eq%20%27"+sectorId+"%27&$format=json";
				$.ajax({
                  type : 'GET',
                  url : serviceURL,
                  datatype : "application/json",
                  async : true,	
                  success : function(data){
                 	// var jsonModel  = new sap.ui.model.json.JSONModel();
                 	 processKPIModel.setData(data.d.results);

                  },
                  error : function(error){
                        alert("Process Area Count Not found");
                  }
           });

        var vizFrame = this.getView().byId("idVizFrame");
        vizFrame.setModel(processKPIModel);
    	vizFrame.setVizProperties({
    		title:{
    			text : ""
    		},
            plotArea: {
            	//colorPalette : d3.scale.category20().range(),

                colorPalette: ['#d32030', '#e17b24', '#61a656', '#848f94'],

            	drawingEffect: "glossy"
                },
                dataLabel: {
                	visible: true;
                },
                interaction: {
                	selectability : {
                		mode : "exclusive"
                	},
                	zoom: {
                		direction: "in"
                	}
                }
                });

         /*serviceURL = "/sap/opu/odata/sap/ZGS_KPI_DASHBOARD_PROCAREA_KPI_SRV/";
         var  oMetaData = new sap.ui.model.odata.ODataModel(serviceURL,{ json: true });*/
//         var oTable = this.getView().byId("_customTable");
//         //oTable.setModel(oMetaData);
//         processAreaModel.setSizeLimit(500);
//         oTable.setModel(processAreaModel);
//         //oTable.rebindTable();

        var industryLbl = this.getView().byId("_industryLbl");
        industryLbl.setText(industryId);
        var sectorLbl = this.getView().byId("_sectorLbl");
        sectorLbl.setText(sectorId);
//        var tabletile = this.getView().byId("_tabletitle");
//        var count = oTable.getItems().length;&nbsp;&nbsp;
//        tabletile.setText("KPI Items ("+count+")");
	}
	},

	bindView: function(sEntityPath) {
		var oView = this.getView();
		oView.bindElement(sEntityPath);

		//Check if the data is already on the client
		if (!oView.getModel().getData(sEntityPath)) {

			// Check that the entity specified was found
			var oData = oView.getModel().getData(sEntityPath);
			if (!oData) {
				this.showEmptyView();
				this.fireDetailNotFound();
			} else {
				this.fireDetailChanged(sEntityPath);
			}

		} else {
			this.fireDetailChanged(sEntityPath);
		}

	},
	onSelect : function(oControlEvent) {
		var source = oControlEvent.getSource().vizSelection();
		//var oModel = this.getView().getModel();
		var industryLbl = this.getView().byId("_industryLbl");
		var sectorLbl= this.getView().byId("_sectorLbl")
		industryId = industryLbl.getText();
		sectorId = sectorLbl.getText();
		// changes to move the view to KPI List in third page
		var processArea = ""; 		
		var _priority = "";&nbsp;
		if(source.length === 1)
		{
			processArea = source[0].data["Process Area"];
			priority = source[0].data["Priority"];
		}
		else
			{
			for (var i=0; i<source.length; i++ )
				 {
				 if (i !== 0)
					 {
				  if(source[i].data["Priority"] === (source[i-1].data["Priority"]))
						  {
					   priority = source[i].data["Priority"];
					     break;
						  }
				  else if (source[i].data["Process Area"] === (source[i-1].data["Process Area"]))
					  {
					  // Priority variable is set to null so that all priorities for the selected process area is retrieved
					  	priority = "";
					   processArea = source[i].data["Process Area"];
						break;
					  }
				&nbsp;&nbsp;
					 }
				 else
					 {
					 continue;
					 }
				 }
			
			}
		var data = this.getView().getModel().getData();
		var processAreaText = "";
		for (var i=0; i<data.length; i++ )
		 {
			if (data[i].ProcessAreaID === processArea )
				{
				processAreaText = data[i].ProcessAreaName;
				break;
				}
			else
				{
				continue;
				}
		 }
		var bReplace = jQuery.device.is.phone ? false : true;
		this.getRouter().navTo(
				"kpiList",
				{
					from : "detail",
					entity : industryId+"|"+sectorId+"|"+processArea+"|"+ priority+"|"+ processAreaText
				}, bReplace);
		
		
		
//		var serviceURL = "/sap/opu/odata/sap/ZGS_KPI_DASHBOARD_PROCAREA_KPI_SRV/ProcessAreaKPISet?$filter=IndustryId%20eq%20%27"+industryId+"%27%20and%20SectorId%20eq%20%27"+sectorId+"%27";
//		var filterString = "";
//		if(source.length === 1)
//			{
//			var _processArea = source[0].data["Process Area"];
//			var _priority = source[0].data["Priority"];
//		     filterString = "%20and%20ProcessareaId%20eq%20%27"+_processArea+"%27%20and%20Priority%20eq%20%27"+_priority+"%27&$format=json";	
//			$.ajax({
//	             type : 'GET',
//	             url : serviceURL+filterString,
//	             datatype : "application/json",
//	             async : false,	
//	             success : function(data){
//	            	// var jsonModel  = new sap.ui.model.json.JSONModel();
//	            	 oModel.setData(data.d.results);
//	&nbsp;&nbsp;
//	             },
//	             error : function(error){
//	                 alert("KPISet Count Not found");
//	           }&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//	    });
//
//			}
//		else
//			{
//			 for (var i=0; i<source.length; i++ )
//				 {
//				 if (i !== 0)
//					 {
//				  if(source[i].data["Priority"] === (source[i-1].data["Priority"]))
//						  {
//					  var _priority = source[i].data["Priority"];
//						filterString = "%20and%20Priority%20eq%20%27"+_priority+"%27&$format=json";
//					     break;
//						  }
//				  else if (source[i].data["Process Area"] === (source[i-1].data["Process Area"]))
//					  {
//					  var _processArea = source[i].data["Process Area"];
//						 filterString = "%20and%20ProcessareaId%20eq%20%27"+_processArea+"%27&$format=json";
//						break;
//					  }
//				&nbsp;&nbsp;
//					 }
//				 else
//					 {
//					 continue;
//					 }
//				 }
//			 $.ajax({
//	             type : 'GET',
//	             url : serviceURL+filterString,
//	             datatype : "application/json",
//	             async : false,	
//	             success : function(data){
//	            	// var jsonModel  = new sap.ui.model.json.JSONModel();
//	            	 oModel.setData(data.d.results);
//	&nbsp;&nbsp;
//	             },
//	             error : function(error){
//	                 alert("KPISet Count Not found");
//	           }&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//	    });
//			}
//		var oTable = this.getView().byId("_customTable");
//		oTable.setModel(oModel);
//		var tabletile = this.getView().byId("_tabletitle");
//        var count = oTable.getItems().length;&nbsp;&nbsp;
//        if(_processArea === undefined )
//        	{
//        	_processArea = "";
//        	}
//        if(_priority === undefined )
//    	{
//        	_priority = "";
//    	}
//&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//        var _processAreaText = "";
//        switch(_processArea) {
//        case "RTR":
//        	_processAreaText = "Record To Report"
//            break;
//        case "OTC":
//        	_processAreaText = "Order To Cash"
//            break;
//        case "PTP" :
//        	_processAreaText = "Procure To Pay"
//        	break;
//        default:
//        	_processAreaText = ""
//&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//    }
//&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//        tabletile.setText(_processAreaText+" "+_priority+" "+ "KPI Items ("+count+")");
	},
	
	onClick : function (oControlEvent) {
		var bReplace = jQuery.device.is.phone ? false : true;
		var source = oControlEvent.getSource();
		var oModel = this.getView().getModel();
		var selContext = source.getBindingContext();&nbsp;
		var sPath = selContext.getPath();
		//var obj = this.getModel().getObject(sPath);
		var obj = oModel.getObject(sPath);
		var kpiId = obj["KpiId"];
		this.getRouter().navTo(
				"kpidetail",
				{
					from : "detail",
					entity : kpiId
				}, bReplace);
		
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
		
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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


	showEmptyView: function() {
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "com.so.view.NotFound",
			targetViewType: "XML"
		});
	},

	fireDetailChanged: function(sEntityPath) {
		this.getEventBus().publish("Detail", "Changed", {
			sEntityPath: sEntityPath
		});
	},

	fireDetailNotFound: function() {
		this.getEventBus().publish("Detail", "NotFound");
	},

	onNavBack: function() {
		// This is only relevant when running on phone devices
		this.getRouter().myNavBack("sectorDetail1");
	},

	onDetailSelect: function(oEvent) {
		sap.ui.core.UIComponent.getRouterFor(this).navTo("detail", {
			entity: oEvent.getSource().getBindingContext().getPath().slice(1)
		}, true);
	},

	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},

	getRouter: function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},
	setGraphProperties: function() {
		var frame = this.getView().byId("idVizFrame");
	},

	onExit: function(oEvent) {
		this.getEventBus().unsubscribe("Master2", "LoadFinished", this.onMasterLoaded, this);
	}
});
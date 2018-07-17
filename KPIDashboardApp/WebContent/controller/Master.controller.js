sap.ui.core.mvc.Controller
		.extend(
				"com.kpi.controller.Master",
				{

					onInit : function() {

						this.oInitialLoadFinishedDeferred = jQuery.Deferred();

						var oEventBus = this.getEventBus();
						var oModel = new sap.ui.model.json.JSONModel();
						// Load JSON in model
						//oModel.loadData("model/IndustrySet.json");
						
						var serviceURL  = "/sap/opu/odata/sap/ZGS_KPI_DASHBOARD_PROCAREA_KPI_SRV/IndustrySet?$format=json";
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
		                           alert("Industries Not found");
		                     }        
		              });
						this.getView().setModel(oModel);

						this
								.getView()
								.byId("vbox0")
								.attachEventOnce(
										"updateFinished",
										function() {
											this.oInitialLoadFinishedDeferred
													.resolve();
											oEventBus.publish("Master",
													"InitialLoadFinished", {
														oListItem : this
																.getView()
																.byId("vbox0")
																.getItems()[0]
													});
											this
													.getRouter()
													.detachRoutePatternMatched(
															this.onRouteMatched,
															this);
										}, this);

						// On phone devices, there is nothing to select from the
						// list. There is no need to attach events.
						if (sap.ui.Device.system.phone) {
							return;
						}

						this.getRouter().attachRoutePatternMatched(
								this.onRouteMatched, this);

						oEventBus.subscribe("Master", "NotFound",
								this.onNotFound, this);
					},

					onRouteMatched : function(oEvent) {
						var sName = oEvent.getParameter("name");

						if (sName !== "main") {
							return;
						}

						// Load the detail view in desktop
						/*this.getRouter().myNavToWithoutHash({
							currentView : this.getView(),
							targetViewName : "com.kpi.view.Detail",
							targetViewType : "XML",
							transition : "slide"
						});*/
						this.getRouter().myNavToWithoutHash({
							currentView : this.getView(),
							targetViewName : "com.kpi.view.Welcome",
							targetViewType : "XML",
							transition : "slide"
						});

						// Load the welcome view in desktop
						/*
						 * this.getRouter().myNavToWithoutHash({ currentView:
						 * this.getView(), targetViewName:
						 * "com.so.view.Welcome", targetViewType: "XML"
						 */
						// });
					},

					waitForInitialListLoading : function(fnToExecute) {
						jQuery.when(this.oInitialLoadFinishedDeferred).then(
								jQuery.proxy(fnToExecute, this));
					},

					onNotFound : function() {
						this.getView().byId("master1List").removeSelections();
					},

					onSearch : function() {
						// Add search filter
						var filters = [];
						var searchString = this.getView().byId(
								"master1SearchField").getValue();
						if (searchString && searchString.length > 0) {
							filters = [ new sap.ui.model.Filter("Name",
									sap.ui.model.FilterOperator.Contains,
									searchString) ];
						}

						// Update list binding
						this.getView().byId("vbox0").getBinding("items").filter(filters);
						
					},
					
					onHome  : function() {
						// If we're on a phone device, include nav in history
						this.getRouter().myNavToWithoutHash({
							currentView : this.getView(),
							targetViewName : "com.kpi.view.Welcome",
							targetViewType : "XML",
							transition : "slide"
						});
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
						// Hide the Master View
						if (sap.ui.Device.system.phone){
							//this.getView().getParent().getParent()._bMasterisOpen = false;
						}
						// Traverse up the chain to the split app control and hide the master. This should be done only for mobile view. 
						// Currently done to test
						this.getView().getParent().getParent().hideMaster();
					},

					showDetail : function(oItem) {
						// If we're on a phone device, include nav in history
						var bReplace = jQuery.device.is.phone ? false : true;
						var context= oItem.getHeader();
						var data = this.getView().getModel().getData();
						var _industryId = "";
						for (var i=0; i<data.length; i++ )
						 {
							if (data[i].Name === context )
								{
								_industryId = data[i].IndustryID;
								break;
								}
							else
								{
								continue;
								}
						 }
						
						this.getRouter().navTo(
								"sectorDetail",
								{
									from : "main",
									entity : context+","+_industryId,
								}, bReplace);
					},
					getEventBus : function() {
						return sap.ui.getCore().getEventBus();
					},

					getRouter : function() {
						return sap.ui.core.UIComponent.getRouterFor(this);
					},

					// event method linked to click on the tile
					/*onPressTile : function(oEvent) {
						// code to get the name of tile clicked by user
						var clickedHeader = oEvent.oSource.getHeader();
					},*/

					onExit : function(oEvent) {
						this.getEventBus().unsubscribe("Master", "NotFound",
								this.onNotFound, this);
					}
				});
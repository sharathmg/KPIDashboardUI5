jQuery.sap.declare("com.kpi.Component");
jQuery.sap.require("com.kpi.MyRouter");
sap.ui.core.UIComponent.extend("com.kpi.Component", {
	metadata: {
		name: "KPI App",
		version: "1.0",
		includes: [],
		dependencies: {
			libs: ["sap.m", "sap.ui.layout"],
			components: []
		},

		rootView: "com.kpi.view.App",

		config: {
			resourceBundle: "i18n/messageBundle.properties",
			serviceConfig: {
				name: "dmx=",
				serviceUrl: ""
			}
		},

		routing: {
			config: {
				routerClass: com.kpi.MyRouter,
				viewType: "XML",
				viewPath: "com.kpi.view",
				clearTarget: false,
				transition: "slide"
			},
			routes: [{
				pattern: "",
				name: "main",
				view: "Master",
				viewLevel: 1,
				targetAggregation: "masterPages",
				targetControl: "idAppControl",
				subroutes: [{
					pattern: "detail/{entity}",
					name: "detail",
					view: "Detail",
					viewLevel: 2,
					targetAggregation: "detailPages"
				},
				{
					pattern: "sectorDetail/{entity}",
					name: "sectorDetail",
					view: "SectorDetail",
					viewLevel: 2,
					targetAggregation: "detailPages"
				},
				{
					pattern: "detail",
					name: "detail1",
					view: "Detail",
					viewLevel: 2,
					targetAggregation: "detailPages"
				},
				{
					pattern: "sectorDetail",
					name: "sectorDetail1",
					view: "SectorDetail",
					viewLevel: 2,
					targetAggregation: "detailPages"
				},
				{
					pattern: "kpiList/{entity}",
					name: "kpiList",
					view: "KPIList",
					viewLevel: 3,
					targetAggregation: "detailPages"
				},
				{
					pattern: "kpiList",
					name: "kpiList1",
					view: "KPIList",
					viewLevel: 3,
					targetAggregation: "detailPages"
				},
				{
					pattern: "kpidetail/{entity}",
					name: "kpidetail",
					view: "KPIDetail",
					viewLevel: 4,
					targetAggregation: "detailPages"
				}
				]
			}]
		}
	},

	init: function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		var mConfig = this.getMetadata().getConfig();

		// Always use absolute paths relative to our own component
		// (relative paths will fail if running in the Fiori Launchpad)
		var oRootPath = jQuery.sap.getModulePath("com.kpi");

		// Set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [oRootPath, mConfig.resourceBundle].join("/")
		});
		this.setModel(i18nModel, "i18n");

		var sServiceUrl = mConfig.serviceConfig.serviceUrl;

/*		//This code is only needed for testing the application when there is no local proxy available
		var bIsMocked = jQuery.sap.getUriParameters().get("responderOn") === "true";
		// Start the mock server for the domain model
		if (bIsMocked) {
			this._startMockServer(sServiceUrl);
		}*/

		// Create and set domain model to the component
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, {
			json: true,
			loadMetadataAsync: true
		});
		this.setModel(oModel);

		// Set device model
		var oDeviceModel = new sap.ui.model.json.JSONModel({
			isTouch: sap.ui.Device.support.touch,
			isNoTouch: !sap.ui.Device.support.touch,
			isPhone: sap.ui.Device.system.phone,
			isNoPhone: !sap.ui.Device.system.phone,
			listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
			listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
		});
		oDeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(oDeviceModel, "device");

		this.getRouter().initialize();

	},

	_startMockServer: function(sServiceUrl) {
/*		jQuery.sap.require("sap.ui.core.util.MockServer");
		var oMockServer = new sap.ui.core.util.MockServer({
			rootUri: sServiceUrl
		});

		var iDelay = +(jQuery.sap.getUriParameters().get("responderDelay") || 0);
		sap.ui.core.util.MockServer.config({
			autoRespondAfter: iDelay
		});

		oMockServer.simulate("model/metadata.xml", "model/");
		oMockServer.start();

		sap.m.MessageToast.show("Running in demo mode with mock data.", {
			duration: 2000
		});*/
	}
});
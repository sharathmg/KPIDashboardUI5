sap.ui.core.mvc.Controller.extend("com.kpi.controller.Welcome", {
	
	onInit : function() {
		if (sap.ui.Device.system.phone) {
			 var image = this.getView().byId("_imgBackground");
			 image.setSrc("./images/background_mobile.png");
			 image.setWidth("100%")
		}
	},
	onNavBack: function() {
		// This is only relevant when running on phone devices
		this.getRouter().myNavToWithoutHash({
			currentView : this.getView(),
			targetViewName : "com.kpi.view.Master",
			targetViewType : "XML",
			transition : "slide"
		});
	},
	getRouter : function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	}
});
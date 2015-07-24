(function () {
	var errorMsg = "Cross-origin framing forbidden";
	function frameActivate() {
		var framingControl = document.getElementById("FramingControlStyle");
		if (framingControl) {
			framingControl.parentNode.removeChild(framingControl);
		}
	}
	try {
		if ((top === self) || (top.location.href)) {
			frameActivate();
		}
		else {
			throw new Error(errorMsg); // Safari mobile does not raise a security exception in that case
		}
	}
	catch (e) {
		if (console && (typeof console.error === "function")) {
			console.error(errorMsg);
		}
		else {
			throw new Error(errorMsg); // throw unhandled error
		}
	}
}());

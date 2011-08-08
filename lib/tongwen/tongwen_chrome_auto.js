setTimeout(function () {
	var cnt = 0;
	function reTry() {
		if (typeof TongWen == "undefined") {
			if (cnt++ > 100) return;
			setTimeout(reTry, 100);
		} else {
			TongWen.transAuto(document);
		}
	};
	reTry();
}, 100);

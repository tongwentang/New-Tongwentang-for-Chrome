chrome.extension.sendRequest(
	{
		reqtype: "loaded",
		baseURI: document.baseURI
	},
	function(response) {
		if (response.autoConvert == "none") return;
		// 自定詞彙
		if (response.userPhrase) {
			TongWen.addS2TTable(response.tradPhrase);
			TongWen.addT2STable(response.simpPhrase);
		}
		// 強制字型設定
		if (response.fontEnable) {
			TongWen.setTradFontset(response.fontTrad);
			TongWen.setSimpFontset(response.fontSimp);
			TongWen.enableCustomFontset(response.fontEnable);
		}
		// 自動轉換
		if (response.autoConvert == "trad") {
			TongWen.trans2Trad(document);
		} else if (response.autoConvert == "simp") {
			TongWen.trans2Simp(document);
		}
	}
);

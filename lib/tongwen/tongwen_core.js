/****************************
 * Node Types http://www.w3schools.com/dom/dom_nodetype.asp
 * NodeType 	Named Constant
 * 1 	ELEMENT_NODE
 * 2 	ATTRIBUTE_NODE
 * 3 	TEXT_NODE
 * 4 	CDATA_SECTION_NODE
 * 5 	ENTITY_REFERENCE_NODE
 * 6 	ENTITY_NODE
 * 7 	PROCESSING_INSTRUCTION_NODE
 * 8 	COMMENT_NODE
 * 9 	DOCUMENT_NODE
 * 10 	DOCUMENT_TYPE_NODE
 * 11 	DOCUMENT_FRAGMENT_NODE
 * 12 	NOTATION_NODE
 ****************************/

TongWen = (function () {

	var
		version  = "0.3.1",         // 版本

		flagSimp = "simplified",  // 簡體
		flagTrad = "traditional", // 繁體

		zhEncodesSimp = ["gb2312", "gbk", "x-gbk", "gb18030", "hz-gb-2312", "iso-2022-cn"],
		zhEncodesTrad = ["big5", "big5-hkscs", "x-euc-tw"],
		zhEncodesAll  = zhEncodesSimp.concat(zhEncodesTrad, ["utf-7", "utf-8", "utf-16le", "x-user-defined"]),

		enableFontset = false,
		fontTrad      = "PMingLiU,MingLiU,新細明體,細明體",
		fontSimp      = "MS Song,宋体,SimSun",

		t2s = {},                 // 繁轉簡 對照表
		s2t = {},                 // 簡轉繁 對照表

		maxSTLen = 1,             // 簡轉繁 最長的詞句
		maxTSLen = 1,             // 繁轉簡 最長的詞句

		curZhFlag = "",           // 目前網頁編碼
		toolbarId = "",           // 工具列編號
		toollBtns = [             // 工具列按鈕
			["X"   , "TongWen.hiddenToolbar();"],
			["繁"  , "TongWen.trans2Trad();"   ],
			["簡"  , "TongWen.trans2Simp();"   ]
		],
		styleIdx  = 0,            // 樣式索引
		counter   = 0;

		return init();

	function init() {
		var that = this;
		toolbarId = "tongwen-" + Math.ceil(Math.random() * 1000000);

		if (document) {
			if (document.addEventListener) {
				document.addEventListener("DOMContentLoaded", function () { winLoad() }, false);
			} else if (window.attachEvent) {
				window.attachEvent("onload", winLoad);
			}
		}

		return {
			version       : version,
			addS2TTable   : addS2TTable,
			addT2STable   : addT2STable,
			convert       : convert,
			transPage     : transPage,
			trans2Trad    : trans2Trad,
			trans2Simp    : trans2Simp,
			transAuto     : transAuto,
			showToolbar   : function () { counter = 0; showToolbar (); },
			hiddenToolbar : function () { counter = 0; hiddenToolbar(); },
			enableCustomFontset: enableCustomFontset,
			setTradFontset: setTradFontset,
			setSimpFontset: setSimpFontset,
			debug : function () { return curZhFlag; }
		}
	}

	function winLoad() {
		curZhFlag = getZhFlag(document);
		// appendStyle();
		// createToolbar();
	}

// =============================================================================

	function appendStyle() {
		document.body.appendChild(document.createElement("style"));
		styleIdx = document.styleSheets.length - 1;
		var sty = document.styleSheets[styleIdx];
		if (sty.insertRule && (typeof sty.addRule == "undefined")) {
			sty.addRule = function (rule, css, idx) {
				if (typeof idx == "undefined") {
					this.insertRule(rule + " { " + css + " }", this.cssRules.length);
				} else {
					this.insertRule(rule + "{" + css + "}", idx);
				}
			};
		}
		sty.addRule(
			"#" + toolbarId,
			"position: fixed; width: auto; height: 26px; top: 0; right: 0; background-color: #E5E5E5; " +
			"border-width: 1px 0 1px 1px; border-color: #808080 #B5B5B5 #B5B5B5 #B5B5B5; border-style: solid;"
		);
		sty.addRule("#" + toolbarId, "_position: absolute;");
		sty.addRule("#" + toolbarId + " a", "color: #005884; text-decoration: none; font-size: 16px;");
		sty.addRule("#" + toolbarId + " a:hover", "color: #005884; text-decoration: underline;");
		sty.addRule("#" + toolbarId + " a:visited", "color: #005884; text-decoration: none;");
	}

	function showToolbar() {
		var tbl = document.getElementById(toolbarId);
		if (tbl != null) {
			tbl.style.display = "";
		} else {
			if (counter > 10) return;
			counter++;
			setTimeout(function () {
				TongWen.showToolbar();
			}, 500);
		}
	}

	function hiddenToolbar() {
		var tbl = document.getElementById(toolbarId);
		if (tbl != null) {
			tbl.style.display = "none";
		} else {
			if (counter > 10) return;
			counter++;
			setTimeout(function () {
				TongWen.hiddenToolbar();
			}, 500);
		}
	}

	function createToolbar() {
		var node = document.createElement("div");
		node.setAttribute("id", toolbarId);
		node.style.display = "none";
		document.body.appendChild(node);
		var txt = '<table cellspacing="1" cellpadding="2" border="0"><tr>';
		for (var i = 0, c = toollBtns.length; i < c; i++) {
			txt += '<td><a href="#" onclick="' + toollBtns[i][1] + ' return false;">' + toollBtns[i][0] + '</a></td>';
		}
		txt += '</tr></table>';
		node.innerHTML = txt;
	}

// =============================================================================
	function enableCustomFontset(bol) {
		enableFontset = bol;
	}

	function setTradFontset(val) {
		fontTrad = val;
	}

	function setSimpFontset(val) {
		fontSimp = val;
	}

	function setFont(zhflag) {
		var css = "";
		if (zhflag == flagTrad) {
			css = " font-family: " + fontTrad + ";";
		} else if (zhflag == flagSimp) {
			css = " font-family: " + fontSimp + ";";
		}

		var sty = document.styleSheets[styleIdx];
		if (sty.insertRule && (typeof sty.addRule == "undefined")) {
			sty.addRule = function (rule, css, idx) {
				if (typeof idx == "undefined") {
					this.insertRule(rule + " { " + css + " }", this.cssRules.length);
				} else {
					this.insertRule(rule + " {" + css + "}", idx);
				}
			};
		}
		sty.addRule("*", css);
	}
// =============================================================================

	// 新增 簡轉繁 對照表
	function addS2TTable(table) {
		for (var i in table) {
			maxSTLen = Math.max(maxSTLen, table[i].length);
			s2t[i] = table[i];
		}
	}

	// 新增 繁轉簡 對照表
	function addT2STable(table) {
		for (var i in table) {
			maxTSLen = Math.max(maxTSLen, table[i].length);
			t2s[i] = table[i];
		}
	}

	function setZhFlag(doc, zhflag) {
		doc.documentElement.setAttribute("zhtongwen", zhflag);
	};

	function getZhFlag(doc) {
		var zhflag = "";
		if (doc && doc.documentElement) {
			var lang = doc.documentElement.getAttribute("lang");
			if (lang == null) {
				var charset = document.characterSet.toLowerCase();	
				if (zhEncodesAll.indexOf(charset) >= 0) {
					zhflag = (zhEncodesTrad.indexOf(charset) >= 0) ? flagTrad : flagSimp;
				}
			} else {
				switch (lang.toLowerCase()) {
					case "zh-tw":
					case "zh-hk":
						zhflag = flagTrad;
						break;
					case "zh-cn":
						zhflag = flagSimp;
						break;
				}
			}
		}
		return zhflag;
	};

	// 繁簡轉換
	function convert(str, zhflag) {
		var leng = 4;
		var zmap = null;

		if (zhflag == flagSimp) {
			// 繁轉簡
			zmap = t2s;
			leng = Math.min(maxTSLen, str.length);
		} else {
			// 簡轉繁
			zmap = s2t;
			leng = Math.min(maxSTLen, str.length);
		}

		// 單字轉換
		str = str.split("");
		for (var i = 0, c = str.length; i < c; i++) {
			str[i] = zmap[str[i]] || str[i];
		}
		str = str.join("");

		// 詞彙轉換
		var txt = "", s = "", bol = true;
		for (var i = 0, c = str.length; i < c;) {
			bol = true;
			for (var j = leng; j > 1; j--) {
				s = str.substr(i, j);
				if (s in zmap) {
					txt += zmap[s];
					i += j;
					bol = false;
					break;
				}
			}

			if (bol) {
				txt += str.substr(i, 1);
				i++;
			}
		}
		if (txt != "") str = txt;
		return str;
	}

	function parseTree(doc, zhflag) {
		var treeWalker = doc.createTreeWalker(doc.body, 1|4, null, false);
		
		function walker() {
			var node = null;
			var attr = null;

			if (treeWalker.nextNode()) {
				node = treeWalker.currentNode;

				// Node Types http://www.w3schools.com/dom/dom_nodetype.asp
				switch (node.nodeType) {
					case 1: // ELEMENT_NODE
						// opera.postError(node.nodeName + ": " + node.innerHTML);
						switch (node.nodeName.toLowerCase()) {
							case "frame"   :
							case "iframe"  :
							//if (typeof node.contentDocument != "undefined") {
							//	transPage(node.contentDocument, zhflag);
								// frame.push(node.contentDocument);
							//} else if ((typeof node.contentWindow != "undefined") && (typeof node.contentWindow.document != "undefined")) {
							//	transPage(node.contentWindow.document, zhflag);
								// frame.push(node.contentWindow.document);
							//}
							// transPage(node.contentDocument || node.contentWindow.document, zhflag);
							// frame.push(node.contentDocument || node.contentWindow.document);
								break;
							case "embed"   :
							case "object"  :
							case "script"  :
							case "noscript":
							case "style"   :
							case "title"   :
							case "br"      :
							case "hr"      :
							case "link"    :
							case "meta"    :
								break;
							case "img":
								attr = node.getAttribute("title");
								if (attr != null) {
									node.setAttribute("title", convert(attr, zhflag));
								}
								attr = node.getAttribute("alt");
								if (attr != null) {
									node.setAttribute("alt", convert(attr, zhflag));
								}
								break;
							case "input":
								switch(node.type.toLowerCase()){
									case "button":
									case "submit":
									case "reset":
									// case "text": // keep org value
										if (node.value.length > 0) {
											node.value = convert(node.value, zhflag);
										}
										break;
									default:
								}
								break;
							case "textarea":
								break;
							case "option":
								if (node.text.length > 0) {
									node.text = convert(node.text, zhflag);
								}
								break;
							default:
								attr = node.getAttribute("title");
								if (attr != null) {
									node.setAttribute("title", convert(attr, zhflag));
								}
								break;
						}
						break;
					case 3: // TEXT_NODE
						if (node.nodeValue.length > 0) {
							// opera.postError(node.nodeValue);
							node.nodeValue = convert(node.nodeValue, zhflag);
						}
						break;
				}

				node = null;
				attr = null;

				// setTimeout(walker, 1);
				walker();
			}
		}

		setTimeout(walker, 1);
	}

	function transPage(doc, zhflag) {
		curZhFlag = zhflag;
		try {
			doc.title = convert(doc.title, zhflag);
			parseTree(doc, zhflag);
			if (enableFontset) {
				setFont(zhflag);
			}
		} catch (ex) {
		}
	}

	function trans2Trad(doc) {
		transPage(doc || document, flagTrad);
	}

	function trans2Simp(doc) {
		transPage(doc || document, flagSimp);
	}

	function transAuto(doc) {
		var curDoc  = doc || document;
		var zhflag = (curZhFlag == flagTrad) ? flagSimp : flagTrad;
		transPage(curDoc, zhflag);
	}

})();

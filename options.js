var timer      = null;
var tongwen    = {};
var nowEditUrl = null, nowEditTrad = null, nowEditSimp = null;
var flagmap    = {
	"none" : "不轉換",
	"trad" : "轉 繁體",
	"simp" : "轉 簡體"
};
// var StoreUri = "http://127.0.0.1:8080";
var StoreUri = "http://tongwenapp.appspot.com/";

// ----------------------------------------------------------------------
// 自動轉換設定
function autoConvert() {
	var val = tongwen.autoConvert || "none";
	switch (val) {
		case "trad": $("#autoConvertTrad").attr("checked", true); break;
		case "simp": $("#autoConvertSimp").attr("checked", true); break;
		default    : $("#autoConvertNone").attr("checked", true); val = "none";
	}
	tongwen["autoConvert"] = val;
}
// 圖示轉換設定值
function iconAction() {
	var val = tongwen.iconAction || "auto";
	switch (val) {
		case "trad": $("#iconActionTrad").attr("checked", true); break;
		case "simp": $("#iconActionSimp").attr("checked", true); break;
		default    : $("#iconActionAuto").attr("checked", true); val = "auto";
	}
	tongwen["iconAction"] = val;
}
// 網址轉換規則設定值
function urlAction() {
	var val = tongwen.urlFilter.enable || false;
	if (val) {
		$("#enableUrlFilter").attr("checked", true);
	} else {
		$("#enableUrlFilter").removeAttr("checked");
	}
	val = tongwen.urlFilter.list;
	var txt = "";
	for (var i = 0, c = val.length; i < c; i++) {
		txt += '<li class="ui-state-default">';
		txt += uiMakeUrlList(val[i].url, val[i].zhflag);
		txt += '</li>';
	}
	$("#tableUrlList").append(txt);
}
// 標點符號轉換設定值
function symbolAction() {
	var val = tongwen.symConvert;
	if (typeof tongwen.symConvert == "undefined") {
		val = true;
	}
	if (val) {
		$("#symbolEnable").attr("checked", true);
	} else {
		$("#symbolDisable").attr("checked", true);
	}
	tongwen["symConvert"] = val;
}
// 強制字型設定值
function fontAction() {
	var val = tongwen.fontCustom;
	if (typeof tongwen.fontCustom == "undefined") {
		tongwen.fontCustom = {
			"enable" : false,
			"trad"   : "PMingLiU,MingLiU,新細明體,細明體",
			"simp"   : "MS Song,宋体,SimSun"
		};
		val = tongwen.fontCustom;
	}
	$("#fontEnable").attr("checked", val.enable);
	$("#fontTrad").val(val.trad).attr("disabled", !val.enable);
	$("#fontSimp").val(val.simp).attr("disabled", !val.enable);
	tongwen["fontCustom"] = val;
}
// 自訂詞彙
function phraseAction() {
	var txt = "";
	var val = tongwen.userPhrase.enable || false;
	if (val) {
		$("#enableCustomPhrase").attr("checked", true);
	} else {
		$("#enableCustomPhrase").removeAttr("checked");
	}
	// 繁體
	txt = "";
	val = tongwen.userPhrase.trad;
	for (var i in val) {
		txt += '<li class="ui-state-default">';
		txt += uiMakeTradList(i, val[i]);
		txt += '</li>';
	}
	$("#tableTradList").append(txt);
	// 簡體
	txt = "";
	val = tongwen.userPhrase.simp;
	for (var i in val) {
		txt += '<li class="ui-state-default">';
		txt += uiMakeSimpList(val[i], i);
		txt += '</li>';
	}
	$("#tableSimpList").append(txt);
}
// 右鍵選單
function contextMenuAction() {
	var val = tongwen.contextMenu.enable || false;
	if (val) {
		$("#enableContextMenu").attr("checked", true);
	} else {
		$("#enableContextMenu").removeAttr("checked");
	}
}
// ----------------------------------------------------------------------
// 儲存設定
function saveOptions() {
	tongwen.iconAction  = $("input[name=iconAction]:checked").val();
	tongwen.autoConvert = $("input[name=autoConvert]:checked").val();
	tongwen.symConvert  = $("#symbolEnable").get(0).checked;
	// 網址轉換規則
	tongwen.urlFilter = {
		"enable": $("#enableUrlFilter").attr("checked"),
		"list"  : []
//			{ "url": "", "zhflag": "none, trad, simp" }
	};
	$("#tableUrlList li:not(.disabled)").each(function () {
		var url    = $(this).children("span.url").attr("value");
		var zhflag = $(this).children("span.zhflag").attr("value");
		tongwen.urlFilter.list.push({ "url": url, "zhflag": zhflag });
	});
	// 強制字型設定
	tongwen.fontCustom = {
		"enable" : $("#fontEnable").attr("checked"),
		"trad"   : $("#fontTrad").val(),
		"simp"   : $("#fontSimp").val()
	};

	// 自訂詞彙
	tongwen.userPhrase = {
		"enable": $("#enableCustomPhrase").attr("checked"),
		"trad"  : {},
		"simp"  : {}
	}
	$("#tableTradList li:not(.disabled)").each(function () {
		var simp = $(this).children("span.simp").attr("value");
		var trad = $(this).children("span.trad").attr("value");
		tongwen.userPhrase.trad[simp] = trad;
	});
	$("#tableSimpList li:not(.disabled)").each(function () {
		var simp = $(this).children("span.simp").attr("value");
		var trad = $(this).children("span.trad").attr("value");
		tongwen.userPhrase.simp[trad] = simp;
	});
	// 右鍵選單
	tongwen.contextMenu = {
		"enable": $("#enableContextMenu").attr("checked")
	};

	// 回存
	localStorage["tongwen"] = JSON.stringify(tongwen);

	var bgPage = chrome.extension.getBackgroundPage();
	bgPage.reloadConfig();
	bgPage.iconActionStat();

	// 顯示訊息
	if (typeof timer == "number") clearTimeout(timer);
	$("#msgBannerContent").html("設定儲存完成。");
	$("#msgBanner").fadeIn("slow");
	timer = setTimeout(function () { $("#msgBanner").fadeOut("slow"); }, 6000); // 6 秒後自動關閉訊息
}

// 取出設定
function restoreOptions() {
	tongwen = JSON.parse(localStorage["tongwen"]);
	if (tongwen == null) {
		tongwen = {};
	}
	// 清空資料
	$("#tableUrlList li:not(.disabled)").remove();
	$("#tableTradList li:not(.disabled)").remove();
	$("#tableSimpList li:not(.disabled)").remove();

	// 顯示資料
	autoConvert();
	iconAction();
	urlAction();
	symbolAction();
	fontAction();
	phraseAction();
	contextMenuAction();
}

// 上傳設定
function uploadOptions(kind, option) {
	$.ajax({
		type: "POST",
		url: StoreUri + "/save",
		data: ({
			"category" : kind,
			"content"  : option
		}),
		success: function(data) {
			if (data < 0) {
				// 未登入
				$("#msgLoginDialog iframe").attr("src", StoreUri + "/login?act=save");
				$("#msgLoginDialog").dialog("open");
			} else if (data == 0) {
				alert("不支援");
			} else {
				$("#msgContent").html("儲存完成！");
				$("#msgDialog")
					.dialog("option", "title", "完成儲存")
					.dialog("option", "width", 300)
					.dialog("option", "buttons", {
						"確定": function() {
							$(this).dialog("close");
						}
					})
					.dialog("open");
			}
		}
	});
}

// 下載設定
function downloadOptions(kind) {
	$.ajax({
		type: "get",
		url: StoreUri + "/load",
		data: ({ "category" : kind }),
		success: function(data) {
			if (data < 0) {
				// 未登入
				$("#msgLoginDialog iframe").attr("src", StoreUri + "/login?act=load");
				$("#msgLoginDialog").dialog("open");
			} else if (data == 0) {
				alert("不支援");
			} else {
				$("#tongwenOptions").removeAttr("readonly").val(data);
				$("#msgContent").html("下載完成！<br />請點選「套用」使設定資料生效。");
				$("#msgDialog")
					.dialog("option", "title", "完成下載")
					.dialog("option", "width", 300)
					.dialog("option", "buttons", {
						"確定": function() {
							$(this).dialog("close");
						}
					})
					.dialog("open");
			}
		}
	});
}

// 登入登出按鈕
function btnLoginLogout() {
	if (!$("#msgInOutDialog").dialog("isOpen")) return;
	var btns = $("#msgInOutDialog").dialog("option", "buttons");
	$.ajax({
		type: "GET",
		url: StoreUri,
		success: function(data) {
			if (data > 0) {
				delete btns["登入"];
				if (typeof btns["登出"] == "undefined") {
					btns["登出"] = function () {
						$.ajax({
							type: "GET",
							url: StoreUri + "/logout",
							success: function (msg) {
								delete btns["登出"];
								$("#msgInOutDialog").dialog("option", "buttons", btns);
								btnLoginLogout()
							}
						});
					};
					$("#msgInOutDialog").dialog("option", "buttons", btns);
				}
			} else {
				delete btns["登出"];
				if (typeof btns["登入"] == "undefined") {
					btns["登入"] = function () {
						$.ajax({
							type: "GET",
							url: StoreUri + "/login",
							success: function (msg) {
								delete btns["登入"];
								$("#msgInOutDialog").dialog("option", "buttons", btns);
								$("#msgLoginDialog iframe").attr("src", StoreUri + "/login?act=save");
								$("#msgLoginDialog").dialog("open");
							}
						});
					};
					$("#msgInOutDialog").dialog("option", "buttons", btns);
				}
			}
		}
	});
}

// 匯出設定
function ExportOptions(title, node, kind) {
	if (typeof timer == "number") clearTimeout(timer);
	$("#divWarning, #divReplace").hide();

	var option = JSON.stringify(node);
	var btns = {
		"關閉": function () {
			$(this).dialog("close");
		},
		"上傳": function () {
			uploadOptions(kind, option);
		}
	};
	$("#msgNotice").html("請記得先儲存再匯出。");
	$("#tongwenOptions").attr("readonly", "readonly").val(option).click(function () { this.select(); });
	$("#msgInOutDialog").dialog("option", "title", title).dialog("option", "buttons", btns).dialog("open");
	btnLoginLogout();
}

// 匯入設定
function ImportOptions(title, kind) {
	if (typeof timer == "number") clearTimeout(timer);
	$("#divWarning").hide();
	$("#divReplace").show();

	$("#msgNotice").html("請貼上之前備份的設定。");
	$("#tongwenOptions").removeAttr("readonly").val("").click(function () {});
	$("#ckReplace").removeAttr("checked");

	var btns = {
		"取消": function () {
			$(this).dialog("close");
		},
		"套用": function () {
			var val = null;
			try {
				var bol = $("#ckReplace").attr("checked");
				var val = JSON.parse($("#tongwenOptions").val());

				switch (kind) {
					case "all" :
						if (bol) {
							if (val.urlFilter && val.urlFilter.list) {
								tongwen.urlFilter.list = [];
							}
							if (val.userPhrase && val.userPhrase.trad) {
								tongwen.userPhrase.trad = {};
							}
							if (val.userPhrase && val.userPhrase.simp) {
								tongwen.userPhrase.simp = {};
							}
						}
						for (var i in val) {
							if (i == "version") continue;
							switch (i) {
								case "urlFilter":
									if (typeof val.urlFilter.enable != "undefined")
										tongwen.urlFilter.enable = val.urlFilter.enable;
									if (val.urlFilter.list) {
										for (var i = 0, c = val.urlFilter.list.length; i < c; i++) {
											tongwen.urlFilter.list.push(val.urlFilter.list[i]);
										}
									}
									break;
								case "userPhrase":
									if (typeof val.userPhrase.enable != "undefined")
										tongwen.userPhrase.enable = val.userPhrase.enable;
									if (val.userPhrase.trad) {
										for (var i in val.userPhrase.trad) {
											tongwen.userPhrase.trad[i] = val.userPhrase.trad[i];
										}
									}
									if (val.userPhrase.simp) {
										for (var i in val.userPhrase.simp) {
											tongwen.userPhrase.simp[i] = val.userPhrase.simp[i];
										}
									}
									break;
								default:
									tongwen[i] = val[i];
							}
						}
						break;
					case "url" :
						if (bol) tongwen.urlFilter.list = [];
						for (var i = 0, c = val.length; i < c; i++) {
							tongwen.urlFilter.list.push(val[i]);
						}
						break;
					case "trad" :
						if (bol) tongwen.userPhrase.trad = {};
						for (var i in val) {
							tongwen.userPhrase.trad[i] = val[i];
						}
						break;
					case "simp" :
						if (bol) tongwen.userPhrase.simp = {};
						for (var i in val) {
							tongwen.userPhrase.simp[i] = val[i];
						}
						break;
				}
				// val = JSON.parse($("#tongwenOptions").val());
				// 回存
				localStorage["tongwen"] = JSON.stringify(tongwen);
				restoreOptions();
				$(this).dialog("close");

				if (typeof timer == "number") clearTimeout(timer);
				$("#msgBannerContent").html("資料匯入完成。");
				$("#msgBanner").fadeIn("slow");
				timer = setTimeout(function () { $("#msgBanner").fadeOut("slow"); }, 6000); // 6 秒後自動關閉訊息
			} catch (ex) {
				$("#divWarning").fadeIn("slow");
				$("#msgWarning").html("輸入的資料格式錯誤，請重新輸入！");
				timer = setTimeout(function () { $("#divWarning").fadeOut("slow"); }, 6000); // 6 秒後自動關閉訊息
			}
		},
		"下載": function () {
			downloadOptions(kind);
		}
	};

	$("#msgInOutDialog").dialog("option", "title", title).dialog("option", "buttons", btns).dialog("open");
	btnLoginLogout();
}

// ----------------------------------------------------------------------
function uiMackList(kind, v1, v2) {
	var data = "";
	switch (kind) {
		case "url":
			data += '<span class="url" value="' + v1 + '" title="' + v1 + '">' + v1 + '</span>';
			data += '<span class="zhflag center" value="' + v2 + '" title="' + flagmap[v2] + '">' + flagmap[v2] + '</span>';
			break;
		case "trad":
			data += '<span class="simp" value="' + v1 + '" title="' + v1 + '">' + v1 + '</span>';
			data += '<span class="trad" value="' + v2 + '" title="' + v2 + '">' + v2 + '</span>';
			break;
		case "simp":
			data += '<span class="trad" value="' + v2 + '" title="' + v2 + '">' + v2 + '</span>';
			data += '<span class="simp" value="' + v1 + '" title="' + v1 + '">' + v1 + '</span>';
			break;
		default:
			return "";
	}
	data += '<span class="icon ui-state-default right"><span class="ui-icon icon-cross delete" title="刪除"></span></span>';
	data += '<span class="icon ui-state-default right"><span class="ui-icon icon-pencil edit" title="編輯"></span></span>';
	return data;
}
function uiMakeUrlList(url, zhflag) {
	return uiMackList("url", url, zhflag);
}
function uiMakeTradList(simp, trad) {
	return uiMackList("trad", simp, trad);
}
function uiMakeSimpList(simp, trad) {
	return uiMackList("simp", simp, trad);
}

function uiUrlFilter() {
	// 網址自訂轉換規則
	$("#tableUrlList li:not(.disabled), #tableUrlList li span.icon").live("mouseover", function () {
		$(this).addClass("ui-state-hover");
	}).live("mouseout", function () {
		$(this).removeClass("ui-state-hover");
	});
	$("#btnAddUrl, #btnCancel").hover(
		function () { $(this).addClass("ui-state-hover"); },
		function () { $(this).removeClass("ui-state-hover"); }
	);
	// 匯出
	$("#tableUrlList li.disabled span.icon-export").click(function () {
		ExportOptions("匯出網址自訂轉換規則", tongwen.urlFilter.list, "url");
	});
	// 匯入
	$("#tableUrlList li.disabled span.icon-import").click(function () {
		ImportOptions("匯入網址自訂轉換規則", "url");
	});
	$("#btnAddUrl").click(function () {
		var data = "";
		var url = $.trim($("#urlAnchor").val());
		var zhflag = $("#tableUrlEdit input:radio:checked").val();
		if (url == "") {
			$("#msgContent").html("網址不得為空白，請填寫網址！");
			$("#msgDialog")
				.dialog("option", "title", "警告")
				.dialog("option", "width", 300)
				.dialog("option", "buttons", {
				"確定": function() {
					$(this).dialog("close");
					$("#urlAnchor").focus();
				}
			}).dialog("open");
			return;
		}
		data = uiMakeUrlList(url, zhflag);
		if (nowEditUrl == null) {
			data = '<li class="ui-state-default">' + data + '</li>';
			$("#tableUrlList").append(data);
		} else {
			nowEditUrl.html(data);
		}
		$("#btnCancel").trigger("click");
	});
	$("#btnCancel").click(function () {
		nowEditUrl = null;
		$(this).parent().hide();
		$("#btnAddUrl").html('<span class="ui-button-text">新增</span>');
		$("#urlAnchor").val("");
		$("#tableUrlEdit input:radio[value=none]").attr("checked", true);
	});
	$("#tableUrlList .delete").live("click", function () {
		$(this).parents("li").remove();
		if (nowEditUrl != null) $("#btnCancel").trigger("click");
	});
	$("#tableUrlList .edit").live("click", function () {
		nowEditUrl = $(this).parents("li");
		var val = $(this).parents("li").children("span.url").attr("value");
		$("#urlAnchor").val(val);
		val = $(this).parents("li").children("span.zhflag").attr("value");
		$("#tableUrlEdit input:radio[value=" + val + "]").attr("checked", true);
		$("#btnAddUrl").html('<span class="ui-button-text">修改</span>');
		$("#btnCancel").parent().show();
	});
}

function uiUserPhrase() {
	// 自定詞彙
	$("#tabsPhrase li:not(.disabled), #tabsPhrase li span.icon").live("mouseover", function () {
		$(this).addClass("ui-state-hover");
	});
	$("#tabsPhrase li:not(.disabled), #tabsPhrase li span.icon").live("mouseout", function () {
		$(this).removeClass("ui-state-hover");
	});
	$("#btnAddTrad, #btnTradCancel, #btnAddSimp, #btnSimpCancel").hover(
		function () { $(this).addClass("ui-state-hover"); },
		function () { $(this).removeClass("ui-state-hover"); }
	);
	$("#tabsPhrase .delete").live("click", function () {
		$(this).parents("li").remove();
		if (nowEditTrad != null) $("#btnTradCancel").trigger("click");
		if (nowEditSimp != null) $("#btnSimpCancel").trigger("click");
	});
	// 繁體
	// 匯出
	$("#tableTradList li.disabled span.icon-export").click(function () {
		ExportOptions("匯出簡轉繁對照表", tongwen.userPhrase.trad, "trad");
	});
	// 匯入
	$("#tableTradList li.disabled span.icon-import").click(function () {
		ImportOptions("匯入簡轉繁對照表", "trad");
	});
	$("#tableTradList .edit").live("click", function () {
		nowEditTrad = $(this).parents("li");
		var val = $(this).parents("li").children("span.simp").attr("value");
		$("#tradSimp").val(val);
		val = $(this).parents("li").children("span.trad").attr("value");
		$("#tradTrad").val(val);
		$("#btnAddTrad").html('<span class="ui-button-text">修改</span>');
		$("#btnTradCancel").parent().show();
	});
	$("#btnAddTrad").click(function () {
		var data = "";
		var simp = $.trim($("#tradSimp").val());
		var trad = $.trim($("#tradTrad").val());
		if (simp == "") {
			$("#msgContent").html("要轉換的字串不得為空白，請填寫！");
			$("#msgDialog")
				.dialog("option", "title", "警告")
				.dialog("option", "width", 300)
				.dialog("option", "buttons", {
				"確定": function() {
					$(this).dialog("close");
					$("#tradSimp").focus();
				}
			}).dialog("open");
			return;
		}
		data = uiMakeTradList(simp, trad);
		if (nowEditTrad == null) {
			data = '<li class="ui-state-default">' + data + '</li>';
			$("#tableTradList").append(data);
		} else {
			nowEditTrad.html(data);
		}
		$("#btnTradCancel").trigger("click");
	});
	$("#btnTradCancel").click(function () {
		nowEditTrad = null;
		$(this).parent().hide();
		$("#btnAddTrad").html('<span class="ui-button-text">新增</span>');
		$("#tradSimp, #tradTrad").val("");
	});
	// 簡體
	// 匯出
	$("#tableSimpList li.disabled span.icon-export").click(function () {
		ExportOptions("汇出繁转简对照表", tongwen.userPhrase.simp, "simp");
	});
	// 匯入
	$("#tableSimpList li.disabled span.icon-import").click(function () {
		ImportOptions("汇入繁转简对照表", "simp");
	});
	$("#tableSimpList .edit").live("click", function () {
		nowEditSimp = $(this).parents("li");
		var val = $(this).parents("li").children("span.simp").attr("value");
		$("#simpSimp").val(val);
		val = $(this).parents("li").children("span.trad").attr("value");
		$("#simpTrad").val(val);
		$("#btnAddSimp").html('<span class="ui-button-text">修改</span>');
		$("#btnSimpCancel").parent().show();
	});
	$("#btnAddSimp").click(function () {
		var data = "";
		var simp = $.trim($("#simpSimp").val());
		var trad = $.trim($("#simpTrad").val());
		if (trad == "") {
			$("#msgContent").html("要转换的字串不得为空白，请填写！");
			$("#msgDialog")
				.dialog("option", "title", "警告")
				.dialog("option", "width", 300)
				.dialog("option", "buttons", {
				"确定": function() {
					$(this).dialog("close");
					$("#simpTrad").focus();
				}
			}).dialog("open");
			return;
		}
		data = uiMakeSimpList(simp, trad);
		if (nowEditSimp == null) {
			data = '<li class="ui-state-default">' + data + '</li>';
			$("#tableSimpList").append(data);
		} else {
			nowEditSimp.html(data);
		}
		$("#btnSimpCancel").trigger("click");
	});
	$("#btnSimpCancel").click(function () {
		nowEditSimp = null;
		$(this).parent().hide();
		$("#btnAddSimp").html('<span class="ui-button-text">加入</span>');
		$("#simpSimp, #simpTrad").val("");
	});
}
// ----------------------------------------------------------------------

// 初始化
$(function () {
	restoreOptions();
	uiUrlFilter();
	uiUserPhrase();

	$("#tongwenWrap").dialog({
		modal    : false,
		position : "top",
		draggable: false,
		resizable: false,
		title    : "新同文堂 - 設定",
		width    : 550,
		buttons  : {
			"關閉": function () { window.close(); },
			"儲存": function () { saveOptions(); },
			"匯入設定": function () { ImportOptions("匯入所有設定", "all"); },
			"匯出設定": function () { ExportOptions("匯出所有設定", tongwen, "all"); }
		},
		close   : function () {
			window.close();
		}
	});
	// 隱藏關閉按鈕 並 顯示版本資訊
	$("div[aria-labelledby=ui-dialog-title-tongwenWrap] a.ui-dialog-titlebar-close")
	.before('<span class="ui-dialog-title right">版本：' + tongwen.version + '</span>')
	.hide();

	$("#fontEnable").click(function () {
		$("#fontTrad").attr("disabled", !this.checked);
		$("#fontSimp").attr("disabled", !this.checked);
	});

	$("#tabsTongwen, #tabUserPhrase").tabs();
	$("#tableUrlList").sortable({
		cursor: "move",
		placeholder: "ui-state-highlight",
		items: "li:not(.disabled)"
	});
	$("#msgDialog").dialog({
		autoOpen : false,
		modal    : true,
		width    : 300,
		resizable: false,
		buttons  : {
			"關閉": function() { $(this).dialog("close"); }
		}
	});
	$("#msgInOutDialog, #msgLoginDialog").dialog({
		autoOpen : false,
		modal    : true,
		width    : 460,
		resizable: false,
		buttons  : {
			"關閉": function() {
				btnLoginLogout();
				$(this).dialog("close");
			}
		}
	});
});

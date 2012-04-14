var tongwen = {
	'version'     : '',
	'autoConvert' : 'none',
	'iconAction'  : 'auto',
	'symConvert'  : true,
	'inputConvert': 'none',
	'fontCustom'  : {
		'enable': false,
		'trad'  : 'PMingLiU,MingLiU,新細明體,細明體',
		'simp'  : 'MS Song,宋体,SimSun'
	},
	'urlFilter'   : {
		'enable': false,
		'list'  : [
//			{ 'url': '', 'zhflag': 'none, trad, simp' }
		]
	},
	'userPhrase'  : {
		'enable': false,
		'trad'  : {},
		'simp'  : {}
	},
	'contextMenu' : {
		'enable': true
	}
};

/**
 * 合併新舊版本的設定值
 **/
function mergeConfig() {
	var oTongwen, i;

	if (typeof localStorage.tongwen === 'undefined') {
		localStorage.tongwen = JSON.stringify(tongwen);
	} else {
		oTongwen = JSON.parse(localStorage.tongwen);
		for (i in oTongwen) {
			if (oTongwen.hasOwnProperty(i) && (i !== 'version')) {
				tongwen[i] = oTongwen[i];
			}
		}
		if (typeof tongwen.userPhrase.enable === 'undefined') {
			tongwen.userPhrase.enable = false;
		}
		localStorage.tongwen = JSON.stringify(tongwen); // 回存設定
	}
}

/**
 * 重新載入設定值
 **/
function reloadConfig() {
	tongwen = JSON.parse(localStorage.tongwen);
}

function urlFilterAction(uri) {
	var lst = tongwen.urlFilter.list, i, c, url = '', re = null;
	for (i = 0, c = lst.length; i < c; i += 1) {
		if (lst[i].url.indexOf('*') >= 0) {
			// var url = lst[i].url.replace(/(\W+)/ig, '\\$1').replace('*.', '*\\.').replace(/\*/ig, '\\w*'); // 較為嚴謹
			url = lst[i].url.replace(/(\W)/ig, '\\$1').replace(/\\\*/ig, '*').replace(/\*/ig, '.*'); // 寬鬆比對
			re = new RegExp('^' + url + '$', 'ig');
			if (uri.match(re) !== null) {
				return lst[i].zhflag;
			}
		} else if (uri === lst[i].url) {
			return lst[i].zhflag;
		}
	}
	return '';
}

/**
 * 網頁載入後初始化的動作
 **/
function docLoadedInit(uri) {
	var zhflag = '';

	if (tongwen.urlFilter.enable) {
		zhflag = urlFilterAction(uri);
	}
	if (zhflag === '') {
		zhflag = tongwen.autoConvert;
	}

	return zhflag;
}

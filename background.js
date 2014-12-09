// 更新設定檔
chrome.runtime.onInstalled.addListener(function (details) {
    // details = {previousVersion: "1.0.3.9", reason: "update"};
    var data = chrome.runtime.getManifest();
    tongwen.version = data.version;
    mergeConfig();
    reloadConfig();
});

function getClipData() {
    var node = document.getElementById('clipdata');
    if (node === null) {
        return '';
    }
    node.value = '';
    node.focus();
    document.execCommand('Paste');
    return node.value;
}

function setClipData(val) {
    var node = document.getElementById('clipdata');
    if (node === null) {
        return '';
    }
    node.value = val;
    node.focus();
    node.select();
    document.execCommand('Copy');
    return node.value;
}

function doAction(tabId, act, flag, url, data) {
    var request = {
        tongwen: tongwen,
        act    : act,
        flag   : ('trad,simp'.indexOf(flag) < 0) ? 'auto' : flag,
        url    : (typeof url === 'undefined') ? '' : url,
        data   : (typeof data === 'undefined') ? '' : data
    };

    chrome.tabs.sendMessage(tabId, request, function(response) {
        console.log(response);
        //if (response.act === 'clip') {
        //    setClipData(response.data);
        //}
    });
}

// 設定圖示上的文字
function iconActionStat() {
    chrome.browserAction.setBadgeBackgroundColor({'color': '#C0C0C0'});
    switch (tongwen.iconAction) {
        case 'trad': chrome.browserAction.setBadgeText({'text': 'T'}); break;
        case 'simp': chrome.browserAction.setBadgeText({'text': 'S'}); break;
        default    : chrome.browserAction.setBadgeText({'text': ''});
    }
}

// context menus
function contextMenuAction() {
    if (!tongwen.contextMenu.enable) {
        return;
    }
    var
        pmenuID,
        contexts = ['page', 'selection', 'link', 'editable', 'image', 'video', 'audio'];

    pmenuID = chrome.contextMenus.create({
        'type'     : 'normal',
        'title'    : chrome.i18n.getMessage('extTitle'),
        'contexts' : contexts
    });
    chrome.contextMenus.create({
        'parentId' : pmenuID,
        'type'     : 'normal',
        'title'    : chrome.i18n.getMessage('contextInput2Trad'),
        'contexts' : ['editable'],
        'onclick'  : function () {
            chrome.windows.getCurrent(function (win) {
                chrome.tabs.query({'windowId': win.id, 'active': true}, function (tabAry) {
                    if (tabAry) {
                        doAction(tabAry[0].id, 'input', 'trad');
                    }
                });
            });
        }
    });
    chrome.contextMenus.create({
        'parentId' : pmenuID,
        'type'     : 'normal',
        'title'    : chrome.i18n.getMessage('contextInput2Simp'),
        'contexts' : ['editable'],
        'onclick'  : function () {
            chrome.windows.getCurrent(function (win) {
                chrome.tabs.query({'windowId': win.id, 'active': true}, function (tabAry) {
                    if (tabAry) {
                        doAction(tabAry[0].id, 'input', 'simp');
                    }
                });
            });
        }
    });
    chrome.contextMenus.create({
        'parentId' : pmenuID,
        'type'     : 'separator',
        'contexts' : ['editable']
    });
    chrome.contextMenus.create({
        'parentId' : pmenuID,
        'type'     : 'normal',
        'title'    : chrome.i18n.getMessage('contextPage2Trad'),
        'contexts' : ['all'],
        'onclick'  : function () {
            chrome.windows.getCurrent(function (win) {
                chrome.tabs.query({'windowId': win.id, 'active': true}, function (tabAry) {
                    if (tabAry) {
                        doAction(tabAry[0].id, 'page', 'trad');
                    }
                });
            });
        }
    });
    chrome.contextMenus.create({
        'parentId' : pmenuID,
        'type'     : 'normal',
        'title'    : chrome.i18n.getMessage('contextPage2Simp'),
        'contexts' : ['all'],
        'onclick'  : function () {
            chrome.windows.getCurrent(function (win) {
                chrome.tabs.query({'windowId': win.id, 'active': true}, function (tabAry) {
                    if (tabAry) {
                        doAction(tabAry[0].id, 'page', 'simp');
                    }
                });
            });
        }
    });
    chrome.contextMenus.create({
        'parentId' : pmenuID,
        'type'     : 'separator',
        'contexts' : ['all']
    });
    chrome.contextMenus.create({
        'parentId' : pmenuID,
        'type'     : 'normal',
        'title'    : chrome.i18n.getMessage('contextClip2Trad'),
        'contexts' : ['all'],
        'onclick'  : function () {
            chrome.windows.getCurrent(function (win) {
                chrome.tabs.query({'windowId': win.id, 'active': true}, function (tabAry) {
                    var txt = getClipData();
                    if (tabAry && (txt !== '')) {
                        doAction(tabAry[0].id, 'clip', 'trad', tabAry[0].url, txt);
                    }
                });
            });
        }
    });
    chrome.contextMenus.create({
        'parentId' : pmenuID,
        'type'     : 'normal',
        'title'    : chrome.i18n.getMessage('contextClip2Simp'),
        'contexts' : ['all'],
        'onclick'  : function () {
            chrome.windows.getCurrent(function (win) {
                chrome.tabs.query({'windowId': win.id, 'active': true}, function (tabAry) {
                    var txt = getClipData();
                    if (tabAry && (txt !== '')) {
                        doAction(tabAry[0].id, 'clip', 'simp', tabAry[0].url, txt);
                    }
                });
            });
        }
    });
}

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    doAction(tab.id, 'icon', tongwen.iconAction);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // 初始化
    // 網址過濾規則與自動轉換
    var zhflag = docLoadedInit(request.docURL);
    tongwen.symbolS2T = symbolS2T;
    tongwen.symbolT2S = symbolT2S;
    sendResponse([tongwen, zhflag]);
});

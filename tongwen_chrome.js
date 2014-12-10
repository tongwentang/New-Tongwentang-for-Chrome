chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        var isInput = false, val, attr, zhflag;

        // 輸入區文字轉換
        if (
            (request.act !== 'page')
                && (typeof document.activeElement.tagName !== 'undefined')
                && (request.tongwen.inputConvert !== 'none')
            )
        {
            if (document.activeElement.tagName.toLowerCase() === 'textarea') {
                isInput = true;
            } else if (
                (document.activeElement.tagName.toLowerCase() === 'input')
                    && (document.activeElement.type.toLowerCase() === 'text')
                ) {
                isInput = true;
            } else if (document.activeElement.isContentEditable) {
                isInput = false;
            }
        }

        if (isInput) {
            // 輸入區文字轉換
            zhflag = (request.act === 'input') ? request.flag : request.tongwen.inputConvert;
            val = document.activeElement.value;
            switch (zhflag) {
                case 'auto':
                    attr = document.activeElement.getAttribute('zhtongwen');
                    if (attr === null) {
                        zhflag = 'traditional';
                    } else {
                        zhflag = (attr === 'traditional') ? 'simplified' : 'traditional';
                    }
                    document.activeElement.setAttribute('zhtongwen', zhflag);
                    document.activeElement.value = TongWen.convert(val, zhflag);
                    break;

                case 'trad':
                    document.activeElement.value = TongWen.convert(val, 'traditional');
                    break;

                case 'simp':
                    document.activeElement.value = TongWen.convert(val, 'simplified');
                    break;
            }
        } else if (request.act !== 'input') {
            // 網頁轉換
            switch (request.flag) {
                case 'auto':
                    TongWen.transAuto(document);
                    break;
                case 'trad':
                    TongWen.trans2Trad(document);
                    break;
                case 'simp':
                    TongWen.trans2Simp(document);
                    break;
            }
        }
    }
);

// window loaded
chrome.runtime.sendMessage(
    '',
    {
        'baseURI': document.baseURI,
        'docURL' : document.URL
    },
    function (response) {
        TongWen.loadSettingData(response[0]);
        if (response[1] === 'trad') {
            TongWen.trans2Trad(document);
        } else if (response[1] === 'simp') {
            TongWen.trans2Simp(document);
        }
    }
);

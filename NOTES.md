# 開發者筆記

- `manifest.json`

    [Manifest File Format - Google Chrome](https://developer.chrome.com/extensions/manifest)

- `backgound.html`

    Chrome 擴充套件是一種事件驅動的執行模式，所以必須透過瀏覽器監聽事件，並透過擴充套件進行監聽事件。詳情請見 [Manage Events with Background Scripts](https://developer.chrome.com/extensions/background_pages) 說明。

    定義擴充套件背景執行的 HTML 頁面，主要用來載入多支 JavaScript 檔案，本擴充套件所有 JS 檔案都是透過這個頁面載入的。

    如果需要一些隱藏輸入欄位用來保存一些暫存的資料，也可以放在這份 HTML 裡面。本擴充套件的「剪貼簿」功能就會用到一個 `<textarea id="clipdata"></textarea>` 來暫存資料。

    ```json
    ...
    "background": {
        "page": "background.html"
    },
    ...
    ```

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <script src="lib/tongwen/tongwen_core.js"></script>
        <script src="lib/tongwen/tongwen_table_s2t.js"></script>
        <script src="lib/tongwen/tongwen_table_t2s.js"></script>
        <script src="lib/tongwen/tongwen_table_ps2t.js"></script>
        <script src="lib/tongwen/tongwen_table_pt2s.js"></script>
        <script src="lib/tongwen/tongwen_table_ss2t.js"></script>
        <script src="lib/tongwen/tongwen_table_st2s.js"></script>
        <script src="background.js"></script>
    </head>
    <body>
        <textarea id="clipdata"></textarea>
    </body>
    </html>
    ```

- `lib/tongwen/tongwen_core.js`

    新同文堂主要核心程式碼，會註冊一個 `TongWen` 全域變數來用。

- `lib/tongwen/tongwen_table_*.js` (繁簡字典檔)
  - 單字轉換
    - `s2t` 簡轉繁
    - `t2s` 繁轉簡
  - 詞彙轉換
    - `ps2t` 簡轉繁
    - `pt2s` 繁轉簡
  - 符號轉換
    - `ss2t` 簡轉繁
    - `st2s` 繁轉簡

- `backgound.js`

    背景執行的主程式，操作本地儲存([chrome.storage](https://developer.chrome.com/extensions/storage))、註冊右鍵選單([chrome.contextMenus](https://developer.chrome.com/extensions/contextMenus))、註冊擴充套件指令([chrome.commands](https://developer.chrome.com/extensions/commands))、多國語系支援([chrome.i18n](https://developer.chrome.com/extensions/i18n))、頁籤操作([chrome.tabs](https://developer.chrome.com/extensions/tabs))、瀏覽器動作([chrome.browserAction](https://developer.chrome.com/extensions/browserAction)) 與 [chrome.runtime](https://developer.chrome.com/extensions/runtime)。

- `options.html` 與 `options.js`

    當使用者開啟擴充套件「選項」設定時會載入的頁面，有用到 jQuery 1.11 與 jQuery UI 等函式庫。

- `tongwen_chrome.js`

    每個網頁開始執行時，Content Script 會載入 `tongwen_core.js` 與 `tongwen_table_*.js`

    當頁面載入完畢之後，Content Script 會載入 `tongwen_chrome.js`

    主要目的：**當頁面載入之後直接判斷是否要自動進行內容繁簡轉換！**

## 相關連結

- 開發教學
  - [Chrome Extension 入門 - 一小時 Chrome Extension 就上手 (1/?)](http://jzlin-blog.logdown.com/posts/143373-getting-started-with-building-a-chrome-extension)
  - [Chrome Extension 入門 - 基本架構介紹 (2/?)](http://jzlin-blog.logdown.com/posts/143437-getting-started-with-basic-structure-introduction)
  - [Chrome Extension 入門 - 背景執行緒 (3/?)](http://jzlin-blog.logdown.com/posts/145066-getting-started-with-background-threads)
  - [Chrome Extension 入門 - 彈出式頁面 (4/?)](http://jzlin-blog.logdown.com/posts/146050-getting-started-with-chrome-extension-popup-page)
  - [Chrome Extension 入門 - 內文執行緒 (5/?)](http://jzlin-blog.logdown.com/posts/147142-introduction-to-chrome-extension-pt-thread)
  - [Chrome Extension 進階 - 跨域資源共享 (CORS)](http://jzlin-blog.logdown.com/posts/154248-chrome-extension-advanced-cors)
  - [Chrome Extension 進階 - 使用快速鍵重新載入 Extension](http://jzlin-blog.logdown.com/posts/157697-progressive-chrome-extension-use-shortcut-keys-overload-extension)
  - [Chrome Extension 進階 - debug](http://jzlin-blog.logdown.com/posts/168563-chrome-extension-advanced-debug)
  - [Chrome Extension 開發入門篇 01 - Chrome Extension 是什麼？](http://jzlin-blog.logdown.com/posts/233782-what-are-chrome-extension)
  - [Chrome Extension 開發入門篇 02 - Chrome Extension 開發的基本功](http://jzlin-blog.logdown.com/posts/233942-basic-skills-for-chrome-extension-development)
  - [Chrome Extension 開發入門篇 03 - Chrome Extension 學習資源](http://jzlin-blog.logdown.com/posts/234172-chrome-extension-resources)
  - [Chrome Extension 開發入門篇 04 - Chrome Extension 開發環境介紹](http://jzlin-blog.logdown.com/posts/234178-chrome-extension-development-environment)
  - [Chrome Extension 開發入門篇 05 - Chrome Extension 設定檔](http://jzlin-blog.logdown.com/posts/234195-chrome-extension-manifest)
  - [Chrome Extension 開發入門篇 06 - Chrome Extension 彈出頁面](http://jzlin-blog.logdown.com/posts/234196-chrome-extension-popup-page)
  - [Chrome Extension 開發入門篇 07 - Chrome Extension 選項頁面](http://jzlin-blog.logdown.com/posts/234197-chrome-extension-options-page)
  - [Chrome Extension 開發入門篇 08 - Chrome Extension 後台頁面](http://jzlin-blog.logdown.com/posts/234202-chrome-extension-background-page)
  - [Chrome Extension 開發入門篇 09 - Chrome Extension 事件頁面](http://jzlin-blog.logdown.com/posts/234203-chrome-extension-event-page)
  - [Chrome Extension 開發入門篇 10 - Chrome Extension 內容腳本](http://jzlin-blog.logdown.com/posts/234204-chrome-extension-content-scripts)
  - [Chrome Extension 開發經驗篇 11 - 如何快速建立新的 Extension？](http://jzlin-blog.logdown.com/posts/234830-how-to-quickly-build-a-new-extension)
  - [Chrome Extension 開發經驗篇 12 - 如何快速重新載入 Extension？](http://jzlin-blog.logdown.com/posts/234831-how-to-quickly-reload-extension)
  - [Chrome Extension 開發經驗篇 13 - 如何 Debug？](http://jzlin-blog.logdown.com/posts/234832-how-to-debug-chrome-extension)
  - [Chrome Extension 開發經驗篇 14 - 如何在當前網頁嵌入 HTML 和 JavaScript？](http://jzlin-blog.logdown.com/posts/234833-how-to-embed-html-and-javascript-into-your-current-web-page)
  - [Chrome Extension 開發經驗篇 15 - 如何改變 browserAction 的圖示？](http://jzlin-blog.logdown.com/posts/234834-how-to-change-the-icon-of-the-browseraction)
  - [Chrome Extension 開發經驗篇 16 - 如何在右鍵選單上顯示選取的文字？](http://jzlin-blog.logdown.com/posts/234838-how-to-display-selected-text-on-the-context-menu)
  - [Chrome Extension 開發經驗篇 17 - 如何取得選取的 HTML？](http://jzlin-blog.logdown.com/posts/234839-how-to-get-the-selected-html)
  - [Chrome Extension 開發經驗篇 18 - 如何跨域資源共享？](http://jzlin-blog.logdown.com/posts/234840-how-to-cross-origin-resource-sharing)
  - [Chrome Extension 開發經驗篇 19 - 如何同步 Extension 的選項設定？](http://jzlin-blog.logdown.com/posts/234841-how-to-synchronize-an-extension-option-setting)
  - [Chrome Extension 開發經驗篇 20 - 如何看其他 Extension 的程式碼？](http://jzlin-blog.logdown.com/posts/234842-how-to-see-other-extension-source-code)
  - [Chrome Extension 開發實戰篇 21 - 專案需求說明](http://jzlin-blog.logdown.com/posts/236966-project-specifications)
  - [Chrome Extension 開發實戰篇 22 - 加入 Git 版本控管](http://jzlin-blog.logdown.com/posts/236967-add-the-git-version-control)
  - [Chrome Extension 開發實戰篇 23 - 建立專案雛形](http://jzlin-blog.logdown.com/posts/236968-establish-the-project-prototype)
  - [Chrome Extension 開發實戰篇 24 - 讀取 RSS](http://jzlin-blog.logdown.com/posts/236969-read-rss)
  - [Chrome Extension 開發實戰篇 25 - 儲存 RSS](http://jzlin-blog.logdown.com/posts/236970-store-rss)
  - [Chrome Extension 開發實戰篇 26 - 通知訊息](http://jzlin-blog.logdown.com/posts/236971-notification-message)
  - [Chrome Extension 開發實戰篇 27 - tts 語音](http://jzlin-blog.logdown.com/posts/236972-tts-voice)
  - [Chrome Extension 開發實戰篇 28 - 客製化選項設定](http://jzlin-blog.logdown.com/posts/236973-236973-customized-options)
  - [Chrome Extension 開發實戰篇 29 - 專案打包](http://jzlin-blog.logdown.com/posts/236974-packaging-project)
  - [Chrome Extension 開發實戰篇 30 - 發佈到應用程式商店](http://jzlin-blog.logdown.com/posts/236975-publish-to-the-app-store)
  - [大兜的 Chrome Extension 學習筆記](https://tonytonyjan.net/2012/05/25/get-start-with-chrome-extension/)
- 上架相關
  - [Developer Dashboard - Chrome Web Store](https://chrome.google.com/webstore/devconsole/49b29197-2b68-4180-acce-8c050a974942?hl=zh_TW)
  - [Declare Permissions](https://developer.chrome.com/extensions/declare_permissions) (必須用最小權限上架)
    - [The activeTab permission](https://developer.chrome.com/extensions/activeTab)

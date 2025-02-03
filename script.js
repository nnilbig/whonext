const LIFF_ID = "2006843080-qeWaGpZA";  // 請替換為你的 LIFF ID
const SHEET_ID = "121VE_IpIOdySED21vF1at56qguIDBTHVRrqltG1MWog";  // 你的 Google 試算表 ID
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzhSjZ6qgk900dd8_iIu98ECFRQMeQgBeatVWR_aXy4QFZ2kzEQgTivXXyp1M9ourDN-g/exec";  // 替換為你的 Google Apps Script URL

document.addEventListener("DOMContentLoaded", async function () {
    const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");
    const form = document.getElementById("register-form");
    const statusMessage = document.getElementById("status-message");
    const registeredList = document.getElementById("registered-list");
    const countSpan = document.getElementById("count");

    // 檢查 LIFF SDK 是否加載成功
    if (typeof liff === 'undefined') {
        console.error("LIFF SDK 加載失敗");
        return;
    }

    // 初始化 LIFF
    try {
        await liff.init({ liffId: LIFF_ID });
        console.log("LIFF 初始化成功!");
        fetchRegisteredUsers();  // 成功初始化後，獲取已報名者資料
    } catch (err) {
        console.error("LIFF 初始化失敗:", err);
    }

    // 切換 Tab
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            this.classList.add("active");
            document.getElementById(this.dataset.tab).classList.add("active");
        });
    });

    // 獲取已報名者名單
    async function fetchRegisteredUsers() {
        await fetchDataAndRenderList(`${APP_SCRIPT_URL}?action=get`, registeredList, (data) => {
            countSpan.textContent = data.length;
            return data.map((user, index) => `${index + 1}. ${user.name} <button class='cancel-btn' data-name='${user.name}'>取消</button>`);
        });
    }

    // 通用資料獲取與列表渲染函數
    async function fetchDataAndRenderList(url, listElement, renderCallback) {
        try {
            let response = await fetch(url);
            let data = await response.json();
            listElement.innerHTML = "";
            const listItems = renderCallback(data);
            listItems.forEach(item => {
                let li = document.createElement("li");
                li.innerHTML = item;
                listElement.appendChild(li);
            });
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    }

    // 表單提交處理
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const note = document.getElementById("note").value.trim();
        if (!name) {
            statusMessage.textContent = "請輸入姓名！";
            return;
        }
        statusMessage.textContent = "小助手協助中...";
        try {
            let response = await fetch(`${APP_SCRIPT_URL}?action=register&name=${encodeURIComponent(name)}&note=${encodeURIComponent(note)}`);
            let result = await response.json();
            statusMessage.textContent = result.message;
            fetchRegisteredUsers();
        } catch (error) {
            console.error("Registration failed:", error);
            statusMessage.textContent = "報名失敗，請稍後再試！";
        }
    });
    
    // 取消報名處理
    registeredList.addEventListener("click", async function (e) {
        if (e.target.classList.contains("cancel-btn")) {
            const cancelButton = e.target;
            const name = cancelButton.dataset.name;
    
            // 禁用取消按鈕，顯示正在處理
            cancelButton.disabled = true;
            cancelButton.innerHTML = "處理中...";
    
            try {
                let response = await fetch(`${APP_SCRIPT_URL}?action=cancel&name=${encodeURIComponent(name)}`);
                let result = await response.json();
                
                // 更新已報名者名單
                fetchRegisteredUsers(); 
    
                // 顯示取消成功訊息（可考慮用某種提示框顯示，或直接在狀態欄顯示）
                alert("取消成功");  // 可根據需求改為自訂顯示方式
    
            } catch (error) {
                console.error("Cancellation failed:", error);
                alert("取消報名失敗，請稍後再試！");
            } finally {
                // 取消後重設按鈕，避免重複點擊
                cancelButton.disabled = false;
                cancelButton.innerHTML = "取消";
            }
        }
    });

});

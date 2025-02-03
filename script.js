const LIFF_ID = "2006843080-qeWaGpZA";  // 請替換為你的 LIFF ID
const SHEET_ID = "121VE_IpIOdySED21vF1at56qguIDBTHVRrqltG1MWog";  // 你的 Google 試算表 ID
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzRX7xU3WJG3UyL6k0JcZr-f7ExXn5i0j0h46zjo1bGF_M-7kVTUe15vUMhjPvpjqDi8A/exec";  // 替換為你的 Google Apps Script URL

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
            const originalText = cancelButton.textContent; // 保存原本的按鈕文字
            cancelButton.textContent = "請稍等..."; // 改為「請稍等」
    
            const name = cancelButton.dataset.name;
            try {
                let response = await fetch(`${APP_SCRIPT_URL}?action=cancel&name=${encodeURIComponent(name)}`);
                let result = await response.json();
                fetchRegisteredUsers();  // 取消成功後更新已報名者名單
            } catch (error) {
                console.error("Cancellation failed:", error);
            } finally {
                cancelButton.textContent = originalText; // 恢復按鈕的原文字
            }
        }
    });
});

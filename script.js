const LIFF_ID = "2006843080-qeWaGpZA";  // 請替換為你的 LIFF ID
const SHEET_ID = "121VE_IpIOdySED21vF1at56qguIDBTHVRrqltG1MWog";  // 你的 Google 試算表 ID
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxPjORzDhSJW1P_b-i8IGrJb99-TRmFnF2GAHdzquxPYhYWN0-cXLyLpQDVQtv6hucoXw/exec";  // 替換為你的 Google Apps Script URL

document.addEventListener("DOMContentLoaded", async function () {
    // 檢查 liff 是否加載成功
    if (typeof liff === 'undefined') {
        console.error("LIFF SDK 加載失敗");
        return;
    }

    // 初始化 LIFF 並使用 await
    try {
        await liff.init({ liffId: LIFF_ID });
        console.log("LIFF 初始化成功!");
        fetchRegisteredUsers();  // 成功初始化後，獲取已報名者資料
    } catch (err) {
        console.error("LIFF 初始化失敗:", err);
    }

    const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");
    
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));
            
            this.classList.add("active");
            document.getElementById(this.dataset.tab).classList.add("active");
        });
    });

    const form = document.getElementById("register-form");
    const statusMessage = document.getElementById("status-message");
    const registeredList = document.getElementById("registered-list");
    const countSpan = document.getElementById("count");

    // 獲取已報名者的函數
    async function fetchRegisteredUsers() {
        try {
            let response = await fetch(`${APP_SCRIPT_URL}?action=get`);
            let data = await response.json();
            registeredList.innerHTML = "";
            countSpan.textContent = data.length;
            data.forEach((user, index) => {
                let li = document.createElement("li");
                li.innerHTML = `${index + 1}. ${user.name} <button class='cancel-btn' data-name='${user.name}'>取消報名</button>`;
                registeredList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching registered users:", error);
        }
    }

    // 取得可用次數的函數
    async function fetchAvailableCredits() {
        try {
            let response = await fetch(`${APP_SCRIPT_URL}?action=getCredits`);
            let data = await response.json();
            creditsList.innerHTML = "";
            data.forEach((user, index) => {
                if (user.credits > 1) {  // 只顯示次數大於 1 的名單
                    let li = document.createElement("li");
                    li.textContent = `${index + 1}. ${user.name} (${user.credits} 次)`;
                    creditsList.appendChild(li);
                }
            });
        } catch (error) {
            console.error("Error fetching available credits:", error);
        }
    }

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

    registeredList.addEventListener("click", async function (e) {
        if (e.target.classList.contains("cancel-btn")) {
            const name = e.target.dataset.name;
            try {
                let response = await fetch(`${APP_SCRIPT_URL}?action=cancel&name=${encodeURIComponent(name)}`);
                let result = await response.json();
                fetchRegisteredUsers();  // 取消成功後更新已報名者名單
            } catch (error) {
                console.error("Cancellation failed:", error);
            }
        }
    });
});

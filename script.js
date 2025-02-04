const LIFF_ID = "2006843080-qeWaGpZA";  // 替換為你的 LIFF ID
const SHEET_ID = "121VE_IpIOdySED21vF1at56qguIDBTHVRrqltG1MWog";  // Google 試算表 ID
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz6evAMTVVxWeJSZOTX7sm47uTYLF4Wq4C5V5lUc9n6qJzfkzUvLQJdRVoqB9K_om5wsw/exec";  // 替換為你的 Google Apps Script URL

document.addEventListener("DOMContentLoaded", async function () {
    if (typeof liff === 'undefined') {
        console.error("LIFF SDK 加載失敗");
        return;
    }

    try {
        await liff.init({ liffId: LIFF_ID });
        console.log("LIFF 初始化成功!");
        fetchRegisteredUsers();  // 初始化後獲取已報名者資料
        fetchQuota();  // 初始化時也載入可用次數
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
    const quotaList = document.getElementById("quota-list");

    // 🎮 顯示載入畫面
    function showLoading() {
        document.getElementById("loading-overlay").style.display = "flex";
    }

    // 🎮 隱藏載入畫面
    function hideLoading() {
        document.getElementById("loading-overlay").style.display = "none";
    }

    // 🎮 獲取已報名者的函數
    async function fetchRegisteredUsers() {
        try {
            let response = await fetch(`${APP_SCRIPT_URL}?action=get`);
            let data = await response.json();
            registeredList.innerHTML = "";
            countSpan.textContent = data.length;
            data.forEach((user, index) => {
                let li = document.createElement("li");
                li.innerHTML = `${index + 1}. ${user.name} <button class='cancel-btn' data-name='${user.name}'>CANCEL</button>`;
                registeredList.appendChild(li);
            });
        } catch (error) {
            console.error("Error fetching registered users:", error);
        } finally {
            hideLoading(); // 🎯 名單更新完後再隱藏載入畫面
        }
    }

    // 🎮 獲取可用次數
    async function fetchQuota() {
        try {
            let response = await fetch(`${APP_SCRIPT_URL}?action=quota`);
            let data = await response.json();
            quotaList.innerHTML = "";

            data.records.forEach(user => {
                let li = document.createElement("li");
                li.innerHTML = `${user.name} <span style="color: #C89F60; font-weight: bold;">(${user.count})</span>`;
                quotaList.appendChild(li);
            });

        } catch (error) {
            console.error("Error fetching quota:", error);
            quotaList.innerHTML = "<p style='color: red;'>無法獲取可用次數，請稍後再試。</p>";
        } finally {
            hideLoading();
        }
    }

    // 🎮 提交報名
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const note = document.getElementById("note").value.trim();
        if (!name) {
            statusMessage.textContent = "ENTER YOUR NAME!";
            return;
        }
        statusMessage.textContent = "CHECK...";
        showLoading();
        try {
            let response = await fetch(`${APP_SCRIPT_URL}?action=register&name=${encodeURIComponent(name)}&note=${encodeURIComponent(note)}`);
            let result = await response.json();
            statusMessage.textContent = result.message;
            fetchRegisteredUsers(); // 🎯 成功後更新名單
        } catch (error) {
            console.error("Registration failed:", error);
            statusMessage.textContent = "404，TRY AGAIN LATER！";
        } finally {
            hideLoading();
        }
    });

    // 🎮 取消報名
    registeredList.addEventListener("click", async function (e) {
        if (e.target.classList.contains("cancel-btn")) {
            const name = e.target.dataset.name;
            showLoading();
            try {
                let response = await fetch(`${APP_SCRIPT_URL}?action=cancel&name=${encodeURIComponent(name)}`);
                let result = await response.json();
                fetchRegisteredUsers(); // 🎯 成功後更新名單
            } catch (error) {
                console.error("Cancellation failed:", error);
            } finally {
                hideLoading();
            }
        }
    });
});

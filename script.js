const LIFF_ID = "2006843080-qeWaGpZA";  // 請替換為你的 LIFF ID
const SHEET_ID = "121VE_IpIOdySED21vF1at56qguIDBTHVRrqltG1MWog";  // 你的 Google 試算表 ID
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxiyUHmiwO4ZZItRhNM5Hao7_LJjRbxrytD1VRg_8d7_dOFlQNn0L1_S303wqOzHU5L0A/exec";  // 替換為你的 Google Apps Script URL

document.addEventListener("DOMContentLoaded", function () {
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
            let response = await fetch(`${APP_SCRIPT_URL}?action=register`, {
                method: "POST",
                body: JSON.stringify({ name, note }),
                headers: { "Content-Type": "application/json" }
            });
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
                let response = await fetch(`${APP_SCRIPT_URL}?action=cancel`, {
                    method: "POST",
                    body: JSON.stringify({ name }),
                    headers: { "Content-Type": "application/json" }
                });
                let result = await response.json();
                alert(result.message);
                fetchRegisteredUsers();
            } catch (error) {
                console.error("Cancellation failed:", error);
            }
        }
    });

    // 在頁面載入時初始化LIFF並加載報名者資料
    liff.init({ liffId: LIFF_ID })
        .then(() => {
            fetchRegisteredUsers();
        })
        .catch((err) => {
            console.error("LIFF 初始化失敗:", err);
        });
});

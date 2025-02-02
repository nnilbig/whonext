const LIFF_ID = "2006843080-qeWaGpZA";  // 替換為你的 LIFF ID
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxiyUHmiwO4ZZItRhNM5Hao7_LJjRbxrytD1VRg_8d7_dOFlQNn0L1_S303wqOzHU5L0A/exec";  // 替換為你的 Google Apps Script URL

async function initLiff() {
    await liff.init({ liffId: LIFF_ID });
    if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        document.getElementById("name").value = profile.displayName;
    } else {
        liff.login();
    }
    loadParticipants();
}

document.getElementById("register-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const note = document.getElementById("note").value.trim();
    if (!name) return alert("請輸入姓名");

    document.getElementById("status-message").innerText = "提交中...";
    try {
        // 檢查名稱是否已報名
        const checkResponse = await fetch(APP_SCRIPT_URL + "?action=check&name=" + encodeURIComponent(name), {
            method: "GET",
        });
        const checkResult = await checkResponse.json();
        if (checkResult.exists) {
            document.getElementById("status-message").innerText = "該姓名已報名過！";
            return;
        }

        // 沒有重複的情況，繼續報名
        const response = await fetch(APP_SCRIPT_URL + "?action=add&name=" + encodeURIComponent(name) + "&note=" + encodeURIComponent(note), {
            method: "GET",
        });

        const result = await response.json();
        if (result.success) {
            document.getElementById("status-message").innerText = "報名成功！";
            loadParticipants();
        } else {
            document.getElementById("status-message").innerText = "報名失敗：" + result.message;
        }
    } catch (error) {
        document.getElementById("status-message").innerText = "提交失敗：" + error.message;
    }
});

document.getElementById("cancel-btn").addEventListener("click", async function() {
    const name = document.getElementById("name").value.trim();
    if (!name) return alert("請輸入姓名以取消報名");

    document.getElementById("status-message").innerText = "取消中...";
    try {
        const response = await fetch(APP_SCRIPT_URL + "?action=remove&name=" + encodeURIComponent(name), {
            method: "GET",
        });

        const result = await response.json();
        if (result.success) {
            document.getElementById("status-message").innerText = "取消成功！";
            loadParticipants();
        } else {
            document.getElementById("status-message").innerText = "找不到報名記錄！";
        }
    } catch (error) {
        document.getElementById("status-message").innerText = "取消失敗：" + error.message;
    }
});

async function loadParticipants() {
    try {
        const response = await fetch(APP_SCRIPT_URL + "?action=load", {
            method: "GET",
        });

        const data = await response.json();
        const list = document.getElementById("registered-list");
        list.innerHTML = "";
        if (data.participants) {
            data.participants.forEach((participant, index) => {
                const listItem = document.createElement("li");
                listItem.textContent = `${index + 1}. ${participant.name}`;
                list.appendChild(listItem);
            });
        }
    } catch (error) {
        document.getElementById("status-message").innerText = "載入報名名單失敗：" + error.message;
    }
}

initLiff();

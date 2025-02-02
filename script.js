const LIFF_ID = "2006843080-qeWaGpZA";  // 請替換為你的 LIFF ID
const SHEET_ID = "121VE_IpIOdySED21vF1at56qguIDBTHVRrqltG1MWog";  // 你的 Google 試算表 ID
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzWZirhyVq0ypKbhiBXjm64t6efKaPEEQKVk-GQCDIC5F8AhFQNSVGnw7NqCJiLMeNeDw/exec";  // 替換為你的 Google Apps Script URL

document.addEventListener("DOMContentLoaded", () => {
    initLiff();
    document.getElementById("signupBtn").addEventListener("click", signup);
});

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

function switchTab(tabNumber) {
    document.getElementById("tabContent1").style.display = tabNumber === 1 ? "block" : "none";
    document.getElementById("tabContent2").style.display = tabNumber === 2 ? "block" : "none";
    document.getElementById("tab1").classList.toggle("active", tabNumber === 1);
    document.getElementById("tab2").classList.toggle("active", tabNumber === 2);
}

async function signup() {
    const name = document.getElementById("name").value.trim();
    const note = document.getElementById("note").value.trim();
    if (!name) return alert("請輸入姓名");

    document.getElementById("signupBtn").disabled = true;
    try {
        const response = await fetch(`${APP_SCRIPT_URL}?action=add&name=${encodeURIComponent(name)}&note=${encodeURIComponent(note)}`);
        const result = await response.json();
        if (result.success) {
            alert("報名成功！");
            loadParticipants();
        } else {
            alert("報名失敗：" + result.message);
        }
    } catch (error) {
        alert("提交失敗：" + error.message);
    }
    document.getElementById("signupBtn").disabled = false;
}

async function loadParticipants() {
    try {
        const response = await fetch(`${APP_SCRIPT_URL}?action=load`);
        const data = await response.json();
        const list = document.getElementById("participants").querySelector("ul");
        list.innerHTML = "";
        if (data.participants) {
            data.participants.forEach((participant, index) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `${index + 1}. ${participant.name} <button class='cancel-btn' onclick='removeParticipant("${participant.name}")'>取消</button>`;
                list.appendChild(listItem);
            });
        }
        document.getElementById("statistics").innerText = `目前的人數: ${data.participants.length} / 16`;
    } catch (error) {
        alert("載入報名名單失敗：" + error.message);
    }
}

async function removeParticipant(name) {
    try {
        const response = await fetch(`${APP_SCRIPT_URL}?action=remove&name=${encodeURIComponent(name)}`);
        const result = await response.json();
        if (result.success) {
            alert("取消成功！");
            loadParticipants();
        } else {
            alert("找不到報名記錄！");
        }
    } catch (error) {
        alert("取消報名失敗：" + error.message);
    }
}

const LIFF_ID = "2006843080-qeWaGpZA";  // 請替換為你的 LIFF ID
const SHEET_ID = "121VE_IpIOdySED21vF1at56qguIDBTHVRrqltG1MWog";  // 你的 Google 試算表 ID
const API_KEY = "AIzaSyDUwZDj2yjYQd3_Q53VyCXPRBBxthz0_I4";  // 你的 Google Cloud API Key
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzDcysf4W_d6I7Dr8vLxW_3XIvQBN3DZeQPIT398T_NEV73frlulClnw-g4CxcT-D9Y/exec";  // 替換為你的 Google Apps Script URL

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

document.getElementById("signupForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const note = document.getElementById("note").value.trim();
    if (!name) return alert("請輸入姓名");

    const data = { name, note };

    document.getElementById("status").innerText = "提交中...";
    try {
        // 先檢查名稱是否已經報名
        const checkResponse = await fetch(APP_SCRIPT_URL + "?action=check&name=" + encodeURIComponent(name), {
            method: "GET",
        });
        const checkResult = await checkResponse.json();
        if (checkResult.exists) {
            document.getElementById("status").innerText = "該姓名已報名過！";
            return;
        }

        // 沒有重複的情況，繼續報名
        const response = await fetch(APP_SCRIPT_URL + "?action=add&name=" + encodeURIComponent(name) + "&note=" + encodeURIComponent(note), {
            method: "GET",
        });

        const result = await response.json();
        if (result.success) {
            document.getElementById("status").innerText = "報名成功！";
            loadParticipants();
        } else {
            document.getElementById("status").innerText = "報名失敗：" + result.message;
        }
    } catch (error) {
        document.getElementById("status").innerText = "提交失敗：" + error.message;
    }
});

document.getElementById("cancelBtn").addEventListener("click", async function() {
    const name = document.getElementById("name").value.trim();
    if (!name) return alert("請輸入姓名以取消報名");

    document.getElementById("status").innerText = "取消中...";
    try {
        const response = await fetch(APP_SCRIPT_URL + "?action=remove&name=" + encodeURIComponent(name), {
            method: "GET",
        });

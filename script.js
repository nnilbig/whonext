const LIFF_ID = "2006843080-qeWaGpZA";  // 請替換為你的 LIFF ID
const SHEET_ID = "121VE_IpIOdySED21vF1at56qguIDBTHVRrqltG1MWog";  // 你的 Google 試算表 ID
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDHMrj9cISj7peci6N2_DGpHuc7zRbs5EaxlGA3BJp1CS90eUe4brROamFhgr_UwiZAg/exec";  // 替換為你的 Google Apps Script URL

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
    if (tabNumber === 1) {
        document.getElementById("tabContent1").style.display = "block";
        document.getElementById("tabContent2").style.display = "none";
        document.getElementById("tab1").classList.add("active");
        document.getElementById("tab2").classList.remove("active");
    } else {
        document.getElementById("tabContent1").style.display = "none";
        document.getElementById("tabContent2").style.display = "block";
        document.getElementById("tab2").classList.add("active");
        document.getElementById("tab1").classList.remove("active");
    }
}

// 報名
document.getElementById("signupBtn").addEventListener("click", async function() {
    const name = document.getElementById("name").value.trim();
    const note = document.getElementById("note").value.trim();
    if (!name) return alert("請輸入姓名");

    document.getElementById("signupBtn").disabled = true;

    try {
        const response = await fetch(APP_SCRIPT_URL + "?action=add&name=" + encodeURIComponent(name) + "&note=" + encodeURIComponent(note), {
            method: "GET",
        });

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
});

async function loadParticipants() {
    try {
        const response = await fetch(APP_SCRIPT_URL + "?action=load", {
            method: "GET",
        });

        const data = await response.json();
        const list = document.getElementById("participants").querySelector("ul");
        list.innerHTML = "";
        if (data.participants) {
            data.participants.forEach((participant, index) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `${index + 1}. ${participant.name} <span class="cancel-btn" onclick="removeParticipant(${index})">X</span>`;
                list.appendChild(listItem);
            });
        }
        document.getElementById("statistics").innerText = `目前的人數: ${data.participants.length} / 16`;
    } catch (error) {
        alert("載入報名名單失敗：" + error.message);
    }
}

async function removeParticipant(index) {
    try {
        const response = await fetch(APP_SCRIPT_URL + "?action=remove&index=" + encodeURIComponent(index), {
            method: "GET",
        });

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

initLiff();

document.getElementById('signupBtn').addEventListener('click', function() {
    const name = document.getElementById('name').value.trim();
    const remarks = document.getElementById('remarks').value.trim();

    if (!name) {
        alert('姓名為必填項目');
        return;
    }

    // 檢查姓名是否重複
    checkDuplicateName(name, function(isDuplicate) {
        if (isDuplicate) {
            alert('此姓名已經報名過了');
        } else {
            // 若未重複，進行報名
            submitSignup(name, remarks);
        }
    });
});

function checkDuplicateName(name, callback) {
    // 假設你有一個Google Sheets API處理報名名單
    // 這裡模擬檢查姓名是否已存在
    fetch('https://your-google-sheet-api-endpoint')  // 請根據你的 Google Sheets API 修改 URL
        .then(response => response.json())
        .then(data => {
            const existingNames = data.map(item => item.name);
            callback(existingNames.includes(name));
        })
        .catch(error => {
            console.error('錯誤:', error);
            callback(false); // 若發生錯誤，則視為沒有重複
        });
}

function submitSignup(name, remarks) {
    document.getElementById('signupStatus').textContent = '等待小助手處理中...';

    // 模擬報名成功後的處理
    setTimeout(() => {
        // 假設資料成功新增到 Google Sheets，更新畫面
        updateParticipantsList();
        document.getElementById('signupStatus').textContent = '報名成功！';
    }, 2000);
}

function updateParticipantsList() {
    // 假設你有一個API或是從Google Sheets讀取已報名者資料
    fetch('https://your-google-sheet-api-endpoint')  // 請根據你的 Google Sheets API 修改 URL
        .then(response => response.json())
        .then(data => {
            const participantsList = document.getElementById('participantsList');
            participantsList.innerHTML = '';  // 清空目前名單

            // 顯示已報名者名單
            data.forEach((participant, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${index + 1}. ${participant.name}`;
                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'X';
                cancelBtn.classList.add('cancel-btn');
                cancelBtn.onclick = function() {
                    cancelSignup(participant.name, index + 1);
                };
                listItem.appendChild(cancelBtn);
                participantsList.appendChild(listItem);
            });

            // 更新人數統計
            const statistics = document.getElementById('statistics');
            statistics.textContent = `目前已報名人數: ${data.length} / 16`;
        })
        .catch(error => console.error('錯誤:', error));
}

function cancelSignup(name, index) {
    // 模擬取消報名
    fetch('https://your-google-sheet-api-endpoint', {
        method: 'DELETE',
        body: JSON.stringify({ name: name }),  // 送出要刪除的資料
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        alert('取消報名成功');
        updateParticipantsList();  // 更新名單
    })
    .catch(error => {
        alert('取消報名失敗');
        console.error('錯誤:', error);
    });
}

// 初始載入已報名名單
updateParticipantsList();

// 切換 Tab
document.getElementById('tabSignupInfo').addEventListener('click', function() {
    document.getElementById('signupForm').style.display = 'block';
    document.getElementById('participants').style.display = 'none';
    this.classList.add('active');
    document.getElementById('tabParticipants').classList.remove('active');
});

document.getElementById('tabParticipants').addEventListener('click', function() {
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('participants').style.display = 'block';
    this.classList.add('active');
    document.getElementById('tabSignupInfo').classList.remove('active');
});

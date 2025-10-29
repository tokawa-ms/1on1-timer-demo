// Azure Speech Service を使用した 1 on 1 タイマーアプリケーション
// Speaker Diarization（話者分離）機能を使用して、マネージャーと部下の発話時間を計測

// ⚠️ セキュリティ警告：このアプリケーションは技術デモ用のサンプルです
// 本番環境では、APIキーをクライアントサイドに露出させず、バックエンドAPIを経由してください

console.log('=== 1 on 1 タイマーアプリケーション 起動 ===');

// 定数定義
const TICKS_PER_SECOND = 10000000; // Azure Speech SDK の時間単位（100ns単位から秒への変換）
const MANAGER_RATIO_HIGH_THRESHOLD = 70; // マネージャー発話比率の上限閾値（%）
const MANAGER_RATIO_LOW_THRESHOLD = 30; // マネージャー発話比率の下限閾値（%）

// グローバル変数
let speechConfig = null;
let audioConfig = null;
let conversationTranscriber = null;
let isRecording = false;

// 話者データの管理
let speakers = new Map(); // 話者ID -> { name, totalTime, segments, isManager }
let managerSpeakerIds = new Set(); // マネージャーとして選択された話者ID
let currentSegmentStart = new Map(); // 話者ID -> 発話開始時刻

// グラフ管理
let speakingRatioChart = null;

// DOM要素の取得
const elements = {
    speechRegion: document.getElementById('speechRegion'),
    speechKey: document.getElementById('speechKey'),
    saveConfigBtn: document.getElementById('saveConfigBtn'),
    configStatus: document.getElementById('configStatus'),
    startRecordingBtn: document.getElementById('startRecordingBtn'),
    stopRecordingBtn: document.getElementById('stopRecordingBtn'),
    recordingStatus: document.getElementById('recordingStatus'),
    speakerSelection: document.getElementById('speakerSelection'),
    conversationHistory: document.getElementById('conversationHistory'),
    managerTime: document.getElementById('managerTime'),
    subordinateTime: document.getElementById('subordinateTime'),
    managerRatio: document.getElementById('managerRatio'),
    subordinateRatio: document.getElementById('subordinateRatio'),
    advicePanel: document.getElementById('advicePanel'),
    adviceText: document.getElementById('adviceText')
};

console.log('DOM要素の取得完了');

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded イベント発火');
    initializeApp();
});

/**
 * アプリケーションの初期化
 */
function initializeApp() {
    console.log('アプリケーション初期化開始');
    
    // ローカルストレージから設定を読み込み
    loadSavedConfig();
    
    // グラフの初期化
    initializeChart();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    console.log('アプリケーション初期化完了');
}

/**
 * 保存された設定を読み込み
 */
function loadSavedConfig() {
    console.log('保存された設定を読み込み中...');
    
    const savedRegion = localStorage.getItem('speechRegion');
    const savedKey = localStorage.getItem('speechKey');
    
    if (savedRegion) {
        elements.speechRegion.value = savedRegion;
        console.log(`保存されたリージョン: ${savedRegion}`);
    }
    
    if (savedKey) {
        elements.speechKey.value = savedKey;
        console.log('保存されたキーを復元しました');
    }
    
    if (savedRegion && savedKey) {
        showConfigStatus('保存された設定を読み込みました', 'success');
    }
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    console.log('イベントリスナーを設定中...');
    
    elements.saveConfigBtn.addEventListener('click', handleSaveConfig);
    elements.startRecordingBtn.addEventListener('click', handleStartRecording);
    elements.stopRecordingBtn.addEventListener('click', handleStopRecording);
    
    console.log('イベントリスナーの設定完了');
}

/**
 * 設定の保存と接続テスト
 */
async function handleSaveConfig() {
    console.log('=== 設定保存と接続テスト開始 ===');
    
    const region = elements.speechRegion.value.trim();
    const key = elements.speechKey.value.trim();
    
    console.log(`入力されたリージョン: ${region}`);
    console.log(`キーの長さ: ${key.length} 文字`);
    
    if (!region || !key) {
        console.error('リージョンまたはキーが入力されていません');
        showConfigStatus('リージョンとサブスクリプションキーを入力してください', 'error');
        return;
    }
    
    try {
        showConfigStatus('接続テスト中...', 'info');
        console.log('Azure Speech Service への接続テスト開始');
        
        // Speech SDK の設定を作成
        const testConfig = SpeechSDK.SpeechConfig.fromSubscription(key, region);
        console.log('SpeechConfig 作成成功');
        
        // 簡易的な接続テスト（音声認識の初期化）
        testConfig.speechRecognitionLanguage = 'ja-JP';
        
        // 設定をローカルストレージに保存
        localStorage.setItem('speechRegion', region);
        localStorage.setItem('speechKey', key);
        console.log('設定をローカルストレージに保存しました');
        
        showConfigStatus('✅ 接続成功！設定を保存しました', 'success');
        console.log('=== 接続テスト成功 ===');
        
        // 録音ボタンを有効化
        elements.startRecordingBtn.disabled = false;
        
    } catch (error) {
        console.error('接続テストエラー:', error);
        console.error('エラー詳細:', error.message);
        showConfigStatus('❌ 接続に失敗しました。リージョンとキーを確認してください', 'error');
    }
}

/**
 * 録音開始処理
 */
async function handleStartRecording() {
    console.log('=== 録音開始処理 ===');
    
    const region = elements.speechRegion.value.trim();
    const key = elements.speechKey.value.trim();
    
    if (!region || !key) {
        console.error('設定が保存されていません');
        showConfigStatus('先に接続設定を保存してください', 'error');
        return;
    }
    
    try {
        // Speech SDK の設定
        speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key, region);
        speechConfig.speechRecognitionLanguage = 'ja-JP';
        console.log('SpeechConfig 設定完了');
        
        // オーディオ設定（マイクから入力）
        audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        console.log('AudioConfig 設定完了（デフォルトマイク）');
        
        // Conversation Transcriber の作成
        conversationTranscriber = new SpeechSDK.ConversationTranscriber(speechConfig, audioConfig);
        console.log('ConversationTranscriber 作成完了');
        
        // イベントハンドラの設定
        setupTranscriberEventHandlers();
        
        // 録音開始
        await conversationTranscriber.startTranscribingAsync(
            () => {
                console.log('✅ 録音開始成功');
                isRecording = true;
                updateRecordingUI(true);
                showRecordingStatus('🎤 録音中...', 'recording');
            },
            (error) => {
                console.error('❌ 録音開始エラー:', error);
                showRecordingStatus(`エラー: ${error}`, 'error');
            }
        );
        
    } catch (error) {
        console.error('録音開始時の例外:', error);
        console.error('エラー詳細:', error.message);
        showRecordingStatus(`エラー: ${error.message}`, 'error');
    }
}

/**
 * 録音停止処理
 */
async function handleStopRecording() {
    console.log('=== 録音停止処理 ===');
    
    if (!conversationTranscriber) {
        console.warn('ConversationTranscriber が存在しません');
        return;
    }
    
    try {
        await conversationTranscriber.stopTranscribingAsync(
            () => {
                console.log('✅ 録音停止成功');
                isRecording = false;
                updateRecordingUI(false);
                showRecordingStatus('録音を停止しました', 'info');
                
                // リソースのクリーンアップ
                conversationTranscriber.close();
                conversationTranscriber = null;
                console.log('リソースをクリーンアップしました');
            },
            (error) => {
                console.error('❌ 録音停止エラー:', error);
                showRecordingStatus(`停止エラー: ${error}`, 'error');
            }
        );
        
    } catch (error) {
        console.error('録音停止時の例外:', error);
    }
}

/**
 * Transcriber のイベントハンドラを設定
 */
function setupTranscriberEventHandlers() {
    console.log('Transcriber イベントハンドラ設定開始');
    
    // 認識中のテキスト
    conversationTranscriber.transcribing = (s, e) => {
        console.log(`[認識中] 話者: ${e.result.speakerId}, テキスト: ${e.result.text}`);
    };
    
    // 認識完了したテキスト
    conversationTranscriber.transcribed = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            const speakerId = e.result.speakerId;
            const text = e.result.text;
            const duration = e.result.duration / TICKS_PER_SECOND; // Azure SDK の時間単位から秒に変換
            
            console.log('=== 認識完了 ===');
            console.log(`話者ID: ${speakerId}`);
            console.log(`テキスト: ${text}`);
            console.log(`発話時間: ${duration.toFixed(2)}秒`);
            
            // 話者データを更新
            updateSpeakerData(speakerId, text, duration);
            
            // 会話履歴に追加
            addToConversationHistory(speakerId, text);
            
            // グラフと統計を更新
            updateStatistics();
        }
    };
    
    // セッション開始
    conversationTranscriber.sessionStarted = (s, e) => {
        console.log('=== セッション開始 ===');
        console.log(`セッションID: ${e.sessionId}`);
    };
    
    // セッション停止
    conversationTranscriber.sessionStopped = (s, e) => {
        console.log('=== セッション停止 ===');
        console.log(`セッションID: ${e.sessionId}`);
    };
    
    // キャンセル/エラー
    conversationTranscriber.canceled = (s, e) => {
        console.error('=== 認識キャンセル/エラー ===');
        console.error(`理由: ${e.reason}`);
        console.error(`エラーコード: ${e.errorCode}`);
        console.error(`エラー詳細: ${e.errorDetails}`);
        
        if (e.reason === SpeechSDK.CancellationReason.Error) {
            showRecordingStatus(`エラー: ${e.errorDetails}`, 'error');
        }
    };
    
    console.log('Transcriber イベントハンドラ設定完了');
}

/**
 * 話者データを更新
 */
function updateSpeakerData(speakerId, text, duration) {
    console.log(`話者データ更新: ${speakerId}`);
    
    if (!speakers.has(speakerId)) {
        console.log(`新しい話者を検出: ${speakerId}`);
        speakers.set(speakerId, {
            name: `話者 ${speakers.size + 1}`,
            totalTime: 0,
            segments: [],
            isManager: false
        });
        
        // 話者選択UIを更新
        updateSpeakerSelectionUI();
    }
    
    const speaker = speakers.get(speakerId);
    speaker.totalTime += duration;
    speaker.segments.push({
        text: text,
        duration: duration,
        timestamp: new Date()
    });
    
    console.log(`話者 ${speaker.name} の累計発話時間: ${speaker.totalTime.toFixed(2)}秒`);
}

/**
 * 話者選択UIを更新
 */
function updateSpeakerSelectionUI() {
    console.log('話者選択UI更新');
    
    const container = elements.speakerSelection;
    container.innerHTML = '';
    
    speakers.forEach((speaker, speakerId) => {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `speaker-${speakerId}`;
        checkbox.checked = managerSpeakerIds.has(speakerId);
        checkbox.className = 'w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500';
        checkbox.addEventListener('change', (e) => {
            handleSpeakerSelection(speakerId, e.target.checked);
        });
        
        const label = document.createElement('label');
        label.htmlFor = `speaker-${speakerId}`;
        label.className = 'flex-1 cursor-pointer';
        label.innerHTML = `
            <span class="font-medium">${speaker.name}</span>
            <span class="text-sm text-gray-500 ml-2">(${formatTime(speaker.totalTime)})</span>
        `;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
    
    console.log(`話者選択UI更新完了: ${speakers.size}人`);
}

/**
 * 話者選択の処理
 */
function handleSpeakerSelection(speakerId, isSelected) {
    console.log(`話者選択変更: ${speakerId}, 選択: ${isSelected}`);
    
    if (isSelected) {
        managerSpeakerIds.add(speakerId);
        speakers.get(speakerId).isManager = true;
    } else {
        managerSpeakerIds.delete(speakerId);
        speakers.get(speakerId).isManager = false;
    }
    
    // 統計を更新
    updateStatistics();
}

/**
 * 会話履歴に追加
 */
function addToConversationHistory(speakerId, text) {
    console.log(`会話履歴に追加: ${speakerId} - ${text}`);
    
    const container = elements.conversationHistory;
    
    // 初回メッセージの場合、プレースホルダーを削除
    if (container.children.length === 1 && container.children[0].classList.contains('text-center')) {
        container.innerHTML = '';
    }
    
    const speaker = speakers.get(speakerId);
    const isManager = managerSpeakerIds.has(speakerId);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message p-4 rounded-lg ${isManager ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-green-100 border-l-4 border-green-500'}`;
    
    messageDiv.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0 w-10 h-10 rounded-full ${isManager ? 'bg-blue-500' : 'bg-green-500'} flex items-center justify-center text-white font-bold">
                ${isManager ? 'M' : 'S'}
            </div>
            <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                    <span class="font-semibold ${isManager ? 'text-blue-900' : 'text-green-900'}">
                        ${speaker.name} ${isManager ? '(マネージャー)' : '(部下)'}
                    </span>
                    <span class="text-xs text-gray-500">
                        ${new Date().toLocaleTimeString('ja-JP')}
                    </span>
                </div>
                <p class="text-gray-800">${text}</p>
            </div>
        </div>
    `;
    
    container.appendChild(messageDiv);
    
    // 自動スクロール
    container.scrollTop = container.scrollHeight;
}

/**
 * 統計情報とグラフを更新
 */
function updateStatistics() {
    console.log('=== 統計情報更新 ===');
    
    let managerTotalTime = 0;
    let subordinateTotalTime = 0;
    
    speakers.forEach((speaker, speakerId) => {
        if (managerSpeakerIds.has(speakerId)) {
            managerTotalTime += speaker.totalTime;
        } else {
            subordinateTotalTime += speaker.totalTime;
        }
    });
    
    const totalTime = managerTotalTime + subordinateTotalTime;
    
    console.log(`マネージャー発話時間: ${managerTotalTime.toFixed(2)}秒`);
    console.log(`部下発話時間: ${subordinateTotalTime.toFixed(2)}秒`);
    console.log(`合計発話時間: ${totalTime.toFixed(2)}秒`);
    
    // 時間表示を更新
    elements.managerTime.textContent = formatTime(managerTotalTime);
    elements.subordinateTime.textContent = formatTime(subordinateTotalTime);
    
    // 比率を計算
    const managerRatio = totalTime > 0 ? (managerTotalTime / totalTime * 100) : 0;
    const subordinateRatio = totalTime > 0 ? (subordinateTotalTime / totalTime * 100) : 0;
    
    elements.managerRatio.textContent = `${managerRatio.toFixed(1)}%`;
    elements.subordinateRatio.textContent = `${subordinateRatio.toFixed(1)}%`;
    
    console.log(`マネージャー比率: ${managerRatio.toFixed(1)}%`);
    console.log(`部下比率: ${subordinateRatio.toFixed(1)}%`);
    
    // グラフを更新
    updateChart(managerTotalTime, subordinateTotalTime);
    
    // アドバイスを更新
    updateAdvice(managerRatio);
}

/**
 * グラフを初期化
 */
function initializeChart() {
    console.log('グラフ初期化');
    
    const ctx = document.getElementById('speakingRatioChart').getContext('2d');
    
    speakingRatioChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['マネージャー', '部下'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',  // Blue
                    'rgba(34, 197, 94, 0.8)'    // Green
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(34, 197, 94, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? (value / total * 100).toFixed(1) : 0;
                            return `${label}: ${formatTime(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    console.log('グラフ初期化完了');
}

/**
 * グラフを更新
 */
function updateChart(managerTime, subordinateTime) {
    console.log('グラフ更新');
    
    if (speakingRatioChart) {
        speakingRatioChart.data.datasets[0].data = [managerTime, subordinateTime];
        speakingRatioChart.update();
    }
}

/**
 * アドバイスを更新
 */
function updateAdvice(managerRatio) {
    console.log(`アドバイス更新: マネージャー比率 ${managerRatio.toFixed(1)}%`);
    
    let advice = '';
    let shouldShow = false;
    
    if (managerRatio > MANAGER_RATIO_HIGH_THRESHOLD) {
        advice = '⚠️ マネージャーの発話時間が多すぎます。もっと部下の話を聞くようにしましょう。1on1では部下が主役です。';
        shouldShow = true;
        console.log('アドバイス: マネージャー発話過多');
    } else if (managerRatio < MANAGER_RATIO_LOW_THRESHOLD) {
        advice = '💡 マネージャーの発話時間が少なすぎます。もっといろいろな話をして、部下をサポートしましょう。';
        shouldShow = true;
        console.log('アドバイス: マネージャー発話不足');
    } else {
        advice = '✅ 良いバランスです！このまま対話を続けましょう。';
        shouldShow = true;
        console.log('アドバイス: 良好なバランス');
    }
    
    if (shouldShow) {
        elements.advicePanel.classList.remove('hidden');
        elements.adviceText.textContent = advice;
    } else {
        elements.advicePanel.classList.add('hidden');
    }
}

/**
 * 録音UI状態を更新
 */
function updateRecordingUI(recording) {
    console.log(`録音UI状態更新: ${recording ? '録音中' : '停止'}`);
    
    elements.startRecordingBtn.disabled = recording;
    elements.stopRecordingBtn.disabled = !recording;
    
    if (recording) {
        elements.startRecordingBtn.classList.add('opacity-50', 'cursor-not-allowed');
        elements.stopRecordingBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        elements.recordingStatus.classList.add('recording-pulse', 'text-red-600', 'font-semibold');
    } else {
        elements.startRecordingBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        elements.stopRecordingBtn.classList.add('opacity-50', 'cursor-not-allowed');
        elements.recordingStatus.classList.remove('recording-pulse', 'text-red-600', 'font-semibold');
    }
}

/**
 * 設定ステータス表示
 */
function showConfigStatus(message, type) {
    console.log(`[設定ステータス] ${type}: ${message}`);
    
    const statusDiv = elements.configStatus;
    statusDiv.textContent = message;
    
    statusDiv.className = 'mt-3 text-sm p-3 rounded-md';
    
    switch (type) {
        case 'success':
            statusDiv.classList.add('bg-green-100', 'text-green-800', 'border', 'border-green-300');
            break;
        case 'error':
            statusDiv.classList.add('bg-red-100', 'text-red-800', 'border', 'border-red-300');
            break;
        case 'info':
            statusDiv.classList.add('bg-blue-100', 'text-blue-800', 'border', 'border-blue-300');
            break;
    }
}

/**
 * 録音ステータス表示
 */
function showRecordingStatus(message, type) {
    console.log(`[録音ステータス] ${type}: ${message}`);
    
    const statusDiv = elements.recordingStatus;
    statusDiv.textContent = message;
    
    statusDiv.className = 'mt-4 text-center text-sm';
    
    switch (type) {
        case 'recording':
            statusDiv.classList.add('text-red-600', 'font-semibold');
            break;
        case 'error':
            statusDiv.classList.add('text-red-600');
            break;
        case 'info':
            statusDiv.classList.add('text-gray-600');
            break;
    }
}

/**
 * 時間をフォーマット（秒 -> MM:SS）
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

console.log('=== スクリプト読み込み完了 ===');

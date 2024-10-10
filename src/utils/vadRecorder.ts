type OnNewRecordingCallback = (url: string) => void;

export async function startMonitoring(onNewRecording: OnNewRecordingCallback) {
    const vadThreshold = parseFloat(localStorage.getItem('vadThreshold') || '0.02');
    const silenceThreshold = 5; // seconds

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia API not supported.');
        return;
    }

    console.log(`VAD Monitoring started with threshold: ${vadThreshold}`);

    let isVoiceDetected = false;
    let silenceTimer = 0;
    let mediaRecorder: MediaRecorder;
    let audioChunks: Blob[] = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('Audio stream obtained.');

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    const mediaStreamSource = audioContext.createMediaStreamSource(stream);

    function analyzeAudio(buffer: Float32Array): number {
        const energy = buffer.reduce((a, b) => a + b * b, 0) / buffer.length;
        return energy;
    }

    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
        const inputData = event.inputBuffer.getChannelData(0);
        const energy = analyzeAudio(inputData);
        console.log(`Current Energy: ${energy}`);

        if (energy > vadThreshold) {
            if (!isVoiceDetected) {
                console.log('Voice detected. Starting recording...');
                startRecording();
            }
            isVoiceDetected = true;
            silenceTimer = 0;
        } else {
            if (isVoiceDetected) {
                silenceTimer += scriptProcessor.bufferSize / audioContext.sampleRate;
                if (silenceTimer >= silenceThreshold) {
                    console.log('Silence detected. Stopping recording...');
                    stopRecording();
                    isVoiceDetected = false;
                }
            }
        }
    };

    mediaStreamSource.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);

    function startRecording() {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
                console.log('Audio chunk added.');
            }
        };
        mediaRecorder.onstop = saveRecording;
        mediaRecorder.start();
        console.log('MediaRecorder started.');
    }

    function stopRecording() {
        mediaRecorder.stop();
        console.log('MediaRecorder stopped.');
    }

    function saveRecording() {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        audioChunks = [];
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Recording saved:', audioUrl);
        onNewRecording(audioUrl);
        uploadToS3(audioBlob);
    }

    function uploadToS3(blob: Blob) {
        // Placeholder function for uploading to S3
        console.log('Audio file ready for upload to S3.');
    }
}
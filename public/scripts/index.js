const LOCAL_STORAGE_ID_KEY = 'id';

const remoteVideo = document.getElementById('remote-video');
const localVideo = document.getElementById('local-video');
const userList = document.getElementById('users');
const callerList = document.getElementById('callers');
const userIdDom = document.getElementById('id');

const optionsDiv = document.getElementById('options');

const audioSelect = document.getElementById('audio-source');
const videoSelect = document.getElementById('video-source');

let currentPeer;
let userId;
let remoteId;
let currentStream;
let listenerInterval;
let offerSignals;
let answerSignals;
let users;

async function init() {
    await navigator.mediaDevices.enumerateDevices().then(gotDevices);

    audioSelect.onchange = offer;
    videoSelect.onchange = offer;

    userList.onchange = handleUserChange;
    callerList.onchange = handleCallerChange;

    userId = localStorage.getItem(LOCAL_STORAGE_ID_KEY);

    if(!userId) {
        userId = Date.now();
        localStorage.setItem(LOCAL_STORAGE_ID_KEY, userId);
    }

    userIdDom.innerHTML = userId;

    await addUser();

    listen();
    offer();
}

function createPeer() {
    currentPeer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.test.com:19000' }],
    });

    currentPeer.onconnectionstatechange = () => {
        const state = currentPeer.connectionState;

        console.log(state);

        state === 'connected'  && handleConnected();
    };

    currentPeer.ontrack = event => {
        if (!remoteVideo.srcObject) {
            remoteVideo.srcObject = event.streams[0];
        }
    };
}

async function offer() {
    createPeer();
    await getStream();

    const offer = await currentPeer.createOffer();

    await currentPeer.setLocalDescription(offer);
    await addSignal(null, 'offer', offer);
}

async function answer(offer) {
    createPeer();
    await getStream();

    await currentPeer.setRemoteDescription(offer);

    const answer = await currentPeer.createAnswer();

    await currentPeer.setLocalDescription(answer);
    listenForIce();

    await addSignal(remoteId, 'answer', answer);
}

async function establish(answer) {
    await currentPeer.setRemoteDescription(answer);

    listenForIce();
}

async function listenForIce() {
    currentPeer.onicecandidate = (iceEvent) => {
        addSignal(remoteId, 'ice', iceEvent.candidate);
    };
}

function handleUserChange(e) {
    const id = e.currentTarget.value;

    remoteId = id;

    const offer = offerSignals.find(({sender}) => sender === id).content;

    answer(offer);
}

function handleCallerChange(e) {
    const id = e.currentTarget.value;

    remoteId = id;

    const answer = answerSignals.find(({sender}) => sender === id).content;

    establish(answer);
}

function handleConnected() {
    remoteVideo.style.display = 'block';
}

function listen() {
    listenerInterval = setTimeout(async () => {
        let innerHTML = '';

        users = await getUsers();

        innerHTML = "<option value='default'>IDLE</option>";

        for(const user of users) {
            innerHTML += `<option value='${user.id}'>${user.id}</option>`;
        }

        userList.innerHTML = innerHTML;

        const signals = await getSignals(remoteId);

        offerSignals = [];
        answerSignals = [];
        const IceCandidates = [];

        for(signal of signals) {
            switch(signal.type) {
                case 'offer':
                    offerSignals.push(signal);
                    break;
                case 'answer':
                    answerSignals.push(signal);
                    break;
                case 'ice':
                    if(signal.sender === remoteId) {
                        IceCandidates.push(signal.content);
                    }

                    break;
                default:
            }
        }

        const callers = answerSignals.map(({sender}) => sender);

        innerHTML = "<option type='radio' name='caller' value='default'>IDLE</option>";

        for(const caller of callers) {
            innerHTML += `<option value='${caller}'>${caller}</option>`;
        }

        callerList.innerHTML = innerHTML;



        remoteId && IceCandidates.forEach(content =>  content && currentPeer.addIceCandidate(content));

        listen();
    }, 1000);
}

function addUser() {
    return userAPI('post', {id: userId});
}

function getUsers() {
    return userAPI('get');
}

function addSignal(receiver, type, content) {
    return signalAPI('post', {receiver, type, content});
}

function getSignals(sender) {
    return signalAPI('post', {sender}, true);
}

function deleteSignal(receiver, type) {
    return signalAPI('delete', {receiver, type});
}

async function signalAPI(method, data, isGet) {
    const url = `./signal/${userId}${isGet ? '/get' : ''}`;

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    return response.json();
}

async function userAPI(method, data) {
    const response = await fetch(`./user`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    return response.json();
}


function gotDevices(deviceInfos) {
    for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = document.createElement('option');

        option.value = deviceInfo.deviceId;

        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || 'microphone ' + (audioSelect.length + 1);
            audioSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
            videoSelect.appendChild(option);
        }
    }
}

async function getStream() {

    if (currentStream) {
        currentStream.getTracks().forEach((track) => {
            track.stop();
        });
    }

    const remoteConstraints = {
        audio: {
            deviceId: {exact: audioSelect.value}
        },
        video: {
            deviceId: {exact: videoSelect.value}
        }
    };


    const stream = await navigator.mediaDevices.getUserMedia(remoteConstraints);

    localVideo.srcObject = stream;
    stream.getTracks().forEach(track =>  currentPeer.addTrack(
        track,
        stream,
    ));

    currentStream = stream;

    return stream;
}




init();



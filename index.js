const loadFontkit  = wrapDep(files[0][0]);
const loadPdfjs    = wrapDep(files[1][0]);
const loadPdflibJs = wrapDep(files[2][0]);
const loadSchedule = wrapDep(files[3][0]);
const loadCommon   = wrapDep(files[4][0]);
const loadElements = wrapDep(files[5][0]);
const loadPopups   = wrapDep(files[6][0]);
const loadDatabase = wrapDep(files[7][0]);
const loadDom = domPromise;

function wrapDep(promise) {
    return promise.catch((e) => { throw "не удалось загрузить зависомость `" + e + "`. Попробуйте перезагрузить страницу" })
}

loadPdflibJs.then(arr => {
    deg90 = PDFLib.degrees(90)
})

loadPdfjs.then(arr => {
    pdfjsLib.GlobalWorkerOptions.workerPort = pdfjsWorker;
});

let isDomLoaded;
loadDom.then(_ => isDomLoaded = true);
function assertDomLoaded() { if(!isDomLoaded) throw 'Страница не была загружена до конца'; }

const dom = {}
loadDom.then(_ => {
    const qs = document.getElementById.bind(document)

    dom.groupInputEl = qs('group-input')
    dom.startButtonEl = qs('start-button')
    dom.groupBarEl = qs('group-bar')
    dom.moveWithBorderEls = document.body.querySelectorAll('.move-with-border')
    dom.progressBarEl = qs('progress-bar')
    dom.statusEl = qs('status')
    dom.warningEl = qs('warning')
    dom.fileInfoEl = qs('file-info')
    dom.filenameEl = qs('filename')
    dom.fileTypeEl = qs('file-type')
    dom.fileIsPdfEl = qs('is-pdf')
    dom.outputsEl = qs('outputs')
    dom.dataAccept = qs('data-acc')
    dom.dataDecline = qs('data-dec')
    dom.dataUsageOpen = qs('open-data-usage')
    dom.dropZoneEl = qs('drop-zone')
})

Promise.all([loadDom, loadDatabase]).then(_ => {
    let messageInteracted;
    try { messageInteracted = localStorage.getItem('index__userdata_interacted') } catch(e) { console.error(e) }

    function updateInteracted() {
        messageInteracted = true;
        try { localStorage.setItem('index__userdata_interacted', true) } catch(e) { console.error(e) }
    }

    function updateVisibility(open, accepted) {
        dataAccept.setAttribute('data-visible', open && accepted)
        dataDecline.setAttribute('data-visible', open && !accepted)
        dataUsageOpen.setAttribute('data-visible', !open)
        dataUsageOpen.setAttribute('data-usage-accepted', accepted)
    }

    function updateUserdataElements(open, accepted) {
        dataAccept.setAttribute('data-transition', '')
        dataDecline.setAttribute('data-transition', '')
        dataUsageOpen.setAttribute('data-transition', '')
        updateVisibility(open, accepted)
    }


    const { dataAccept, dataDecline, dataUsageOpen } = dom

    dataAccept.querySelector('.close-button').addEventListener('click', _ => {
        updateUserdataElements(false, getUserdataAllowed())
        updateInteracted()
    })
    dataDecline.querySelector('.close-button').addEventListener('click', _ => {
        updateUserdataElements(false, getUserdataAllowed())
        updateInteracted()
    })

    dataUsageOpen.addEventListener('click', _ => {
        updateUserdataElements(true, getUserdataAllowed())
        updateInteracted()
    })

    dataAccept.querySelector('span').addEventListener('click', _ => {
        window.setUserdataAllowed(false)
        updateUserdataElements(false, false)
        updateInteracted()
    })
    dataDecline.querySelector('span').addEventListener('click', _ => {
        window.setUserdataAllowed(true)
        updateUserdataElements(false, true)
        updateInteracted()
    })

    if(!messageInteracted) updateVisibility(true, getUserdataAllowed())
    else updateVisibility(false, getUserdataAllowed())
})

/*HTML does not have any way to make resizable multiline prompt
the only other option, namely contentEditable=true, has a number of fields for reading text, none of which work:
  textContent - ignores line breaks,
  innerText - doesn't read when the element is hidden (nice)  https://stackoverflow.com/a/43740154/18704284
  innerHTML - returns <br> and $nbsp; and God knows what else

  the idea behind this div is simple, we will use visible element + innerText, and I hope it won't break bc of height 0*/
let innerTextHack
Promise.all([loadDom, loadCommon]).then(_ => {
    innerTextHack = document.body.appendChild(htmlToElement(`<div style="position: absolute; width: 0px; height: 0px; top: 0; left: 0; transform: scale(0);"></div>`))
})

let handling = false
addEventListener("unhandledrejection", (event) => {
    try{ if(handling) return } catch(e) { return } // or completely hang the browser
    handling = true
    const res = '' + event.reason;
    loadDatabase.then(() => { updateUserdataF('regGeneralError')('$rej$' + res) })
        .then(() => { handling = false }) // not finally
});

addEventListener('error', (event) => {
    try{ if(handling) return } catch(e) { return } // or completely hang the browser
    handling = true
    const res = '' + event.error;
    loadDatabase.then(() => { updateUserdataF('regGeneralError')('$err$' + res) })
        .then(() => { handling = false })
});


let lastFileDataUrl;
let currentFilename, currentDocumentData;
let processing;

let prevProgress
let curStatus = {};

const genSettings = {}
const createGenSettings = wrapDep(Promise.all([loadDom, loadCommon ]).then(_ => {
    const genPopupHTML = htmlToElement(`
<div>
    <div style="margin-bottom: 0.6rem;">Расположение дней:</div>
    <div class="days-scheme" contenteditable="true" style="border:none;outline:none; border-bottom: 1px solid white;
        white-space: nowrap; width: 100%; min-height: 1rem; display: inline-block; font-family: monospace; font-size: 1.0rem">
        пн чт<br>вт пт<br>ср сб
    </div>

    <div style="display: flex; margin-top: 0.9em; gap: 0.2em;">
        <div class="gen-settings-switch gen-settings-prev no-select">
            <div><svg xmlns="http://www.w3.org/2000/svg" viewBox="-.2 -.2 1.4 1.4"><path d="M0 .75L.5 .25L1 0.75"></path></svg></div>
        </div>

        <div style="display: grid; grid-template-columns: auto auto">
            <span style="text-align: right;">Высота&nbsp;строки:</span>
            <span style="display: flex;align-items: baseline;">
                &nbsp;
                <input class="height-input" type="number" style="
                    text-align: right; font-size: 1rem;
                    color: white; border-bottom: 0.1rem solid white;
                    padding: 0; padding-right: 0.1em; width: 6ch;">
                %
            </span>

            <span style="text-align: right; margin-top: 0.9em;">Граница&nbsp;дней:</span>
            <span class="no-select" style="display: flex; margin-top: 0.6em;">
                &nbsp;<div class="border-color" style="cursor: pointer; border-bottom: 0.1rem solid var(--primary-contrast-color);"></div>
             </span>

            <span style="text-align: right; margin-top: 0.6em;">Размер:</span>
            <span style="display: flex;align-items: baseline;margin-top: 0.9em;">
                &nbsp;
                <input class="border-input" type="number" style="
                    text-align: right; font-size: 1em; color: white;
                    border-bottom: 0.1rem solid white;
                    padding: 0; padding-right: 0.1em; width: 6ch;">
                ‰
            </span>

            <span style="text-align: right; margin-top: 0.9em">Расположение дней недели:</span>
            <span class="no-select" style="display: flex;align-items: end;margin-top: 0.9em;">
                &nbsp;<div class="dow-position" style="cursor: pointer; border-bottom: 0.1rem solid var(--primary-contrast-color);"></div>
            </span>
       </div>

        <div class="gen-settings-switch gen-settings-next no-select">
            <div><svg xmlns="http://www.w3.org/2000/svg" viewBox="-.2 -.2 1.4 1.4"><path d="M0 .75L.5 .25L1 0.75"></path></svg></div>
        </div>
</div>
    `)

    genSettings.popupEl = genPopupHTML
    genSettings.scheduleLayoutEl = genPopupHTML.querySelector('.days-scheme')
    genSettings.heightEl = genPopupHTML.querySelector('.height-input')
    genSettings.borderSizeEl = genPopupHTML.querySelector('.border-input')
    genSettings.borderTypeEl = genPopupHTML.querySelector('.border-color')
    genSettings.dowPositionEl = genPopupHTML.querySelector('.dow-position')

    const savedSettings = [
        [(1/5.2 * 100).toFixed(2), '10', true, false],
        [(1/5.2 * 100).toFixed(2), '20', false, true],
    ]
    let curSettings = 0;

    function updBorderCol(value) {
        genSettings.drawBorder = value
        genSettings.borderTypeEl.innerText = value ? 'заливка' : 'отступ'
    }
    function updDowOnTop(value) {
        genSettings.dowOnTop = value
        genSettings.dowPositionEl.innerText = value ? 'сверху' : 'сбоку'
    }
    function updHeight(value) { genSettings.heightEl.value = value; }
    function updBorderSize(value) { genSettings.borderSizeEl.value = value; }
    function setFromSettings() {
        const s = savedSettings[curSettings]
        updHeight(s[0])
        updBorderSize(s[1])
        updBorderCol(s[2])
        updDowOnTop(s[3])
    }
    function updSettings(newSettings) {
        const s = savedSettings[curSettings]
        s[0] = genSettings.heightEl.value
        s[1] = genSettings.borderSizeEl.value
        s[2] = genSettings.drawBorder
        s[3] = genSettings.dowOnTop
        if(newSettings === -1) curSettings = savedSettings.length - 1
        else if(newSettings === savedSettings.length) curSettings = 0
        else curSettings = newSettings
        setFromSettings()
    }

    addClick(genSettings.borderTypeEl, () => { updBorderCol(!genSettings.drawBorder) })
    addClick(genSettings.dowPositionEl, () => { updDowOnTop(!genSettings.dowOnTop) })
    addClick(genPopupHTML.querySelector('.gen-settings-prev'), () => { updSettings(curSettings-1) })
    addClick(genPopupHTML.querySelector('.gen-settings-next'), () => { updSettings(curSettings+1) })

    setFromSettings()
}).catch((e) => { throw 'настройки' }))

Promise.all([loadDom, loadElements, loadPopups, createGenSettings]).then(_ => {
    const settingsEl = document.querySelector('#generation-settings')
    const genPopupEl = insertPopup(settingsEl)
    const genPopupId = registerPopup(genPopupEl)
    genPopupEl.popup.appendChild(genSettings.popupEl)
    popupAddHoverClick(genPopupId, settingsEl.firstElementChild, (pressed) => settingsEl.setAttribute('data-pressed', pressed))
})

function hideOverlay() {
    assertDomLoaded()
    dom.dropZoneEl.style.visibility = 'hidden'
    dom.dropZoneEl.style.opacity = 0
}

function showOverlay() {
    assertDomLoaded()
    dom.dropZoneEl.style.visibility = ''
    dom.dropZoneEl.style.opacity = 1
}

/*drag and drop*/ {
    let lastTarget
    window.addEventListener("dragenter", function(event) {
        event.preventDefault()
        lastTarget = event.target
        showOverlay()
    })

    window.addEventListener('dragleave', function(event) {
        event.preventDefault()
        if(event.target === lastTarget || event.target === document) hideOverlay()
    })

    window.addEventListener("dragover", function (e) { e.preventDefault(); });

    window.addEventListener('drop', function(ev) {
        ev.preventDefault();
        hideOverlay()
        loadFromListFiles(ev.dataTransfer.files)
    })
}

function checkShouldProcess() {
    if(processing) return;

    let userdata = [];
    try { try { userdata = ['' + currentFilename, '' + dom.groupInputEl.value.trim()] } catch(e) { console.error(e) } } catch(e) {}

    var nameS
    try { nameS = dom.groupInputEl.value.trim().split('$'); }
    catch(e) {
        updateUserdataF('regDocumentError')(...userdata, e)
        printScheduleError(e)
        return;
    }

    const name = nameS[0].trim();
    if(name == '') {
        updError({ msg: 'Для продолжения требуется имя группы', progress: 1 })
        return
    }

    try { localStorage.setItem('index__last_group_name', name) }
    catch(e) { console.error(e) }

    var indices
    var i = 0
    try {
        indices = Array(nameS.length - 1);
        for(i = 1; i < nameS.length; i++) indices[i-1] = Number.parseInt(nameS[i]);
    }
    catch(e) {
        if(i == 0) e = ['Не удалось создать массив индексов пропущенных уроков', e]
        else e = ['Индекс пропущенного урока ' + i + ' не является числом', e]
        updateUserdataF('regDocumentError')(...userdata, e)
        printScheduleError(e)
        return;
    }

    if(currentDocumentData == undefined) {
        updError({ msg: 'Для продолжения требуется файл расписания', progress: 1 })
        return
    }

    dom.startButtonEl.setAttribute('data-pending'/*rename to data-processing, since this name is outdated*/, '')
    processing = true;

    const startTime = performance.now()
    processPDF(userdata, name, indices)
        .catch(e => {
            updateUserdataF('regDocumentError')(...userdata, e)
            printScheduleError(e)
        }) // same in loadFromListFiles()
        .finally(() => {
            const endTime = performance.now()
            console.log(`call took ${endTime - startTime} milliseconds`)
            dom.startButtonEl.removeAttribute('data-pending')
            processing = false;
        })
}

loadDom.then(_ => {
    updInfo({ msg: 'Вы можете создать изображение или календарь занятий своей группы из общего расписания' })


    try {
        const lastName = localStorage.getItem('index__last_group_name')
        if(lastName != undefined) dom.groupInputEl.value = lastName
    }
    catch(e) { console.error(e) }

    const inputCharRegex = /[\p{L}0-9\-]/u
    document.body.addEventListener('keydown', function(event) {
        if (document.activeElement != document.body) return;
        if (
            event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey
            && inputCharRegex.test(event.key)
        ) {
            const inputField = dom.groupInputEl
            inputField.focus();
            inputField.value += event.key;
            event.preventDefault();
        }
        else if (event.keyCode == 13) {
            checkShouldProcess()
        }
    });
})

Promise.all([loadDom, loadCommon]).then(_ => {
    dom.groupInputEl.addEventListener('keyup', e => {
        if (e.keyCode == 13) {
          dom.groupInputEl.blur()
          checkShouldProcess()
        }
    })
    addClick(dom.startButtonEl, _ => {
        checkShouldProcess()
    })

    new ResizeObserver(() => resizeProgressBar(curStatus.progress, true)).observe(dom.groupBarEl)

    addClick(document.querySelector('#file-picker'), function() {
        const f = document.createElement('input');
        f.style.display = 'none';
        f.type = 'file';
        f.name = 'file';
        f.addEventListener('change', e => loadFromListFiles(e.target.files))
        document.body.appendChild(f);
        f.click();
        setTimeout(() => document.body.removeChild(f), 0);
    })
})

function resizeProgressBar(progress, immediately) {
    assertDomLoaded()
    const w = dom.groupBarEl.offsetWidth
    const b = dom.groupBarEl.offsetHeight * 0.5

    let newW;
    if(progress === undefined) newW = 0;
    else {
        progress = Math.min(Math.max(progress, 0), 1)
        if(!(progress >= 0 && progress <= 1)) {
            console.error('progress out of bounds', progress)
            progress = 0;
        }

        if(progress === 1) newW = w;
        else newW = progress * (w - 2*b) + b;
    }

    dom.moveWithBorderEls.forEach(it => it.style.marginRight = it.style.marginLeft = b + 'px')

    //https://stackoverflow.com/a/21594219/18704284
    dom.progressBarEl.setAttribute('data-transition', !immediately)
    dom.progressBarEl.style.width = newW + 'px'
}

let prevTime = performance.now()
function updStatus() { try {
    assertDomLoaded()
    const s = curStatus
    if(true) {
        const now = performance.now()
        console.log('time:', (now - prevTime).toFixed(3))
        prevTime = now;
        try { throw s.msg } catch(e) { console.error(e) }
    }

    const { progressBarEl, statusEl, warningEl } = dom

    if(s.level === 'error') {
        progressBarEl.style.backgroundColor = 'var(--error-color)'
        if(prevProgress !== s.progress) resizeProgressBar(s.progress)

        statusEl.innerHTML = "Ошибка: " + s.msg
        statusEl.style.color = 'var(--error-color)'
        statusEl.style.opacity = 1
    }
    else if(s.level === 'info') {
        progressBarEl.style.backgroundColor = 'var(--primary-color)'
        if(prevProgress !== s.progress) resizeProgressBar(s.progress)

        if(!s.msg || s.msg.trim() === '') {
            statusEl.innerHTML = '\u200c'
            statusEl.style.opacity = 0
        }
        else {
            statusEl.innerHTML = s.msg
            statusEl.style.color = 'var(--text-color)'
            statusEl.style.opacity = 1
        }
    }
    else throw "Неизвестный уровень статуса: `" + s.level + "`"

    if(!s.warning || s.warning.trim() === '') {
        warningEl.innerHTML = ''
        warningEl.style.display = 'none'
    }
    else {
        warningEl.style.display = ''
        warningEl.innerHTML = s.warning
        warningEl.style.opacity = 1
    }

} finally { prevProgress = curStatus.progress } }

function updError(statusParams) {
    statusParams.level = 'error'
    curStatus = statusParams
    updStatus()
}

function updInfo(statusParams) {
    statusParams.level = 'info'
    curStatus = statusParams
    updStatus()
}

function nameFixup(name) {
    const alphanumeric = /[\p{L})\p{N}]/u

    let newName = ''
    for(let i = 0; i < name.length; i++) {
        let a = name[i]
        if(alphanumeric.test(a)) newName += a.toLowerCase()
    }
    if(newName.length === 0) return name.trim()
    else return newName;
}

const pdfMagicNumbers = [0x25, 0x50, 0x44, 0x46]; // %PDF
function isPDF(arrayBuffer) {
    try {
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < pdfMagicNumbers.length; i++) {
            if (uint8Array[i] !== pdfMagicNumbers[i]) return false;
        }
        return true;
    }
    catch(e) {
        console.error(e)
        return false;
    }
}

async function loadFromListFiles(list) {
    if(list.length === 0) { //if you drop files fast enough sometimes files list would be empty
        if(!processing) updError({ msg: 'Не удалось получить файлы. Попробуйте ещё раз', progress: 1 });
        return
    }

    let res;
    for(let i = 1; i < list.length; i++) {
        const file = list[i];
        const ext = file.name.endsWith('.pdf')
        if(!ext) continue;
        res = { filename: file.name, ext, content: await file.arrayBuffer(), type: file.type };
    }
    if(res == undefined) {
        const file = list[0];
        res = { filename: file.name, ext: file.name.endsWith('.pdf'), content: await file.arrayBuffer(), type: file.type };
    }

    if(res.content.length === 0) { //no idea why this happens
        if(!processing) updError({ msg: 'Получен пустой файл', progress: 1 })
        return;
    }


    const filename = '' + (res.ext ? res.filename.substring(0, res.filename.length - 4) : res.filename);
    const fileContent = res.content;

    const fileDataUrl = lastFileDataUrl;
    lastFileDataUrl = URL.createObjectURL(new Blob([fileContent], { type: res.type }));
    updateFilenameDisplay('Файл' + (list.length === 1 ? '' : ' №' + (i+1)) + ': ', res.filename, lastFileDataUrl);
    URL.revokeObjectURL(fileDataUrl);

    dom.fileIsPdfEl.style.visibility = isPDF(fileContent) ? 'hidden' : ''

    if(!processing) {
        const name = dom.groupInputEl.value.trim()
        if(name == '') {
            updInfo({ msg: 'Введите имя группы (ИМгр-123, имгр123 и т.п.)' })
            try {
                dom.groupInputEl.focus({ preventScroll: true })
            }
            catch(e) { console.log(e) }
        }
        else updInfo({ msg: 'Файл загружен' })
    }

    // first update interface, only then decode some pages ahead of time
    async function getDocumentPage(orig, pageI) {
        const page = await orig.getPage(1 + pageI)
        return { page, text: (await page.getTextContent()).items }
    }

    const prevDocumentData = currentDocumentData
    const thisDocumentData = (async(fileContent) => {
        if (prevDocumentData) try {
            await (await prevDocumentData).task.destroy();
        } catch(e) { console.error(e) }

        await loadPdfjs

        const origTask = pdfjsLib.getDocument({ data: copy(fileContent) });
        let orig
        try { orig = await origTask.promise }
        catch (e) { throw ["Документ не распознан как PDF", e] }

        const pageCount = Math.min(orig.numPages, 20)
        const pages = new Array(pageCount)
        const result = { task: origTask, taskPromise: orig, pages }

        for(let i = 0; i < pageCount; i++) {
            pages[i] = getDocumentPage(orig, i)
        }

        return result
    })(fileContent)

    currentDocumentData = thisDocumentData;
    currentFilename = filename;

    thisDocumentData.catch((err) => {
        if (currentDocumentData != thisDocumentData) return;
        if (processing) return; // if processing, then the error would be updated by the processing function
        updateUserdataF('regDocumentError')(filename, 'no group', err)
        printScheduleError(err)
    })
}

function updateFilenameDisplay(fileType, filename, href) {
    if(filename == undefined) {
        dom.fileInfoEl.setAttribute('data-visible', false);
    }
    else {
        dom.fileInfoEl.setAttribute('data-visible', true);
        dom.fileTypeEl.innerText = fileType;
        dom.filenameEl.innerText = filename;
        dom.filenameEl.href = href;
    }
}

function readElementText(element) {
    innerTextHack.innerHTML = element.innerHTML
    return innerTextHack.innerText
}

function makeWarningText(schedule, scheme, bigFields) {
    if(!bigFields.length) return ''

    const days = new Set()
    for(let i = 0; i < scheme.length; i++) for(let j = 0; j < scheme[i].length; j++) days.add(scheme[i][j])

    let prevDay
    let warningText = ''
    for(let i = 0; i < bigFields.length; i++) {
        const f = bigFields[i]
        const day = f[0], hour = f[1], ch = f[2], z = f[3], index = f[4];
        if(!days.has(day)) continue
        warningText += '; ' + daysOfWeekShortened[day] + '-' + minuteOfDayToString(hour)
            + '-' + (ch ? 'ч' : '') + (z ? 'з' : '') + '(' + index + ')';
        prevDay = day;
    }

    if(warningText === '') return ''
    else return "Возможно пропущены уроки: " + warningText.substring(2)
        + ". Чтобы добавить их в расписание, допишите $<i>индекс_из_скобок</i> к имени группы, напр. ИМгр-123 $0 $2 $39."
        + " Также вы можете отредактировать расписание вручную, нажав на кнопку с карандашом на изображении"
        + " или <a href='./help-page.html' target='blank' class='link'>написать сюда</a>.";
}

window.updateUserdataF ??= () => () => { console.error('No function defined') }

function __stop() {
    __debug_start = false;
    __debug_mode = undefined;
}

let __debug_start, __debug_mode;
let __debug_schedule_parsing_results, __last_expected; //console.log(JSON.stringify());
Object.defineProperty(window, '__schedule_debug_names', { get() { return __debug_mode === 2; } });
let __debug_warningOn = [];

function __start(mode, folder, ...args) {
    if(__debug_start) {
        console.error('Cannot run more than one test at a time! (call __stop())')
        return
    }
    const modes = { 'groups': 1, 'schedule_names': 2 };

    __stop();
    __debug_start = true;
    __debug_mode = modes[mode] ?? 0;
    const testFolder = (folder == undefined || folder.trim() == '') ? undefined : 'test' + folder + '/'

    let goupNames, checkExpected;
    if(__debug_mode === 1) {
        groupNames = args[0]
    }
    else if(__debug_mode === 2) return Promise.resolve();
    else {
        checkExpected = (args[0] == undefined || !!args[0])
        groupNames = args[1]
    }

    return loadDom.then(async () => {
        async function readFile0(filename) {
            if(testFolder == undefined) return Promise.reject('test folder not given');
            const result = await fetch(testFolder + filename)
            if(!result.ok) throw '(custom error meaasge) File ' + filename + ' not loaded';
            return await result.arrayBuffer()
        };
        const readJson0 = (filename) => readFile0(filename).then(it => JSON.parse(new TextDecoder('utf-8').decode(it)))
        const wrap = (func) => func.catch(err => { console.error('file not loaded:', err); return undefined })
        const readFile = (filename) => wrap(readFile0(filename))
        const readJson = (filename) => wrap(readJson0(filename))

        if(__debug_mode === 0) {
            const contP = readFile('file.pdf')
            const expectedP = readJson('expected.txt')

            groupNames ??= await readJson('names.txt')
            await contP.then(it => { if(it != undefined) {
                currentFileContent = it
                updateFilenameDisplay('Test folder: ', testFolder);
            } })
            let expected = checkExpected ? await expectedP : undefined;
            if(expected != undefined) __last_expected = expected

            const differences = []

            if(groupNames == undefined) throw 'No group names provided'
            if(currentFileContent == undefined) throw 'No pdf provided'

            __debug_schedule_parsing_results = {};

            console.log('started' + (expected != undefined ? ' with expected/actual checks' : ''))
            for(let i = 0; i < groupNames.length; i++) {
                if(!__debug_start) break;
                dom.groupInputEl.value = groupNames[i]
                try { await processPDF(); } catch(e) { printScheduleError(e); break; }
                if(!__debug_start) break;
                if(expected != undefined) {
                    const ex = expected[groupNames[i]]
                    if(!ex) console.warn('Name', ex, 'not found in expected!')
                    else if(JSON.stringify(__debug_schedule_parsing_results[groupNames[i]]) !== JSON.stringify(ex)) {
                        differences.push(groupNames[i])
                        console.error('!')
                    }
                }
            }

            console.log('warning on:', '[' + __debug_warningOn.map(it => '"'+it[0]+'"') + ']', structuredClone(__debug_warningOn));
            __debug_warningOn.length = 0;

            if(differences.length !== 0) {
                console.error('results differ for: ')
                console.error('[' + differences.map(it => '"'+it+'"') + ']')
            }
            else if(expected != undefined) console.log('expected results matched')
        }
        else if(__debug_mode === 1) {
            const contP = readFile('file.pdf')
            await contP.then(it => { if(it != undefined) {
                currentFileContent = it
                updateFilenameDisplay('Test folder: ', testFolder);
            } })

            if(groupNames == undefined) throw 'No group names provided'
            if(currentFileContent == undefined) throw 'No pdf provided'

            for(let i = 0; i < groupNames.length; i++) {
                if(!__debug_start) break;
                dom.groupInputEl.value = groupNames[i]
                try { await processPDF(); } catch(e) { printScheduleError(e); break; }
            }
        }
    }).finally(() => {
        const n2 = testFolder == undefined ? '' : ' for ' + testFolder;
        if(__debug_start) {
            updInfo({ msg: 'Everything done' + n2, progress: 1 })
            console.log('done' + n2)
        }
        else {
            updInfo({ msg: 'Stopped' + n2, progress: 1 })
            console.log('done, stopped' + n2)
        }
        __stop();
    })
}

const loadDependencies = Promise.all([
    loadSchedule, loadCommon, loadElements, loadPopups, createGenSettings,
    loadPdfjs, loadPdflibJs, loadFontkit
])

loadDependencies.catch((e) => {
    updateUserdataF('regDocumentError')('global', 'global', e)
    printScheduleError(e)
})

function createOffscreenCanvas(width, height) {
    //this is certainly my job to check all of this
    if (window.OffscreenCanvas !== undefined) {
        const c = new window.OffscreenCanvas(width, height);
        return [c, c.convertToBlob.bind(c)];
    }
    else {
        const c = document.createElement('canvas');
        c.width = width;
        c.height = height;
        return [c, (function(options) {
            return new Promise((res, rej) => {
                this.toBlob((blob) => {
                    if(blob === null) rej('cannot create blob from canvas');
                    else res(blob);
                }, options?.type, options?.quality);
            })
        }).bind(c)];
    }
}

async function getDocument() {
    const pdfDoc = await PDFLib.PDFDocument.create() /*
        we can't reuse the document and glyph cache because of
        library issue: https://github.com/Hopding/pdf-lib/issues/1492
    */
    pdfDoc.registerFontkit(window.fontkit)
    const font = await pdfDoc.embedFont(await fontPromise, {subset:true});
    return [pdfDoc, font]
}

// browser can load the font but cant provide
// even 1 bit of info about it obviously...
const fontSizeFac = 0.8962800875273523
const canvasFontP = fontPromise.then(async(font) => {
    const cFont = new FontFace("TimesNewRoman", font)
    await cFont.load()
    document.fonts.add(cFont)
    return cFont
})
const textContextP = (async() => {
    // we need an entire canvas just to measure text...
    const data = createOffscreenCanvas(1, 1)
    const canvas = data[0]
    const context = canvas.getContext('2d', { alpha: false, desynchronized: true })
    const font = await canvasFontP
    context.font = '1px TimesNewRoman'
    return context
})()

async function processPDF(userdata, name, indices) {
    updInfo({ msg: 'Ожидаем зависимости', progress: 0 })
    await loadDependencies

    updInfo({ msg: 'Начинаем обработку', progress: 0.1 });
    const nameFixed = nameFixup(name);
    const rowRatio = Number(genSettings.heightEl.value) / 100;
    const borderFactor = Number(genSettings.borderSizeEl.value) / 1000;
    if(!(rowRatio < 1000 && rowRatio > 0.001)) throw ['неправильное значение высоты строки', genSettings.heightEl.value];
    if(!(borderFactor < 1000 && borderFactor >= 0)) throw ['неправильное значение ширины границы', genSettings.borderSizeEl.value];
    const drawBorder = genSettings.drawBorder;
    const dowOnTop = genSettings.dowOnTop;
    const scheme = readScheduleScheme(readElementText(genSettings.scheduleLayoutEl));

    const filename = currentFilename;

    const docData = await currentDocumentData
    try { orig = await docData.taskPromise }
    catch (e) { throw ["Документ не распознан как PDF", e] }

    // если название группы контрактников, сохраняем место неконтрактной группы
    const contractRegex = (/^(\p{L}+)к[2-9](\p{N}*)$/u)
    const isContract = contractRegex.test(nameFixed)
    const regularName = !isContract ? undefined : nameFixed.replace(contractRegex, '$11$2') // $1 1 $2 без к и первая цифра - 1
    const minBound = Math.max(Math.min(nameFixed.length*0.5, nameFixed.length - 4), 1)
    const maxBound = Math.max(nameFixed.length*2, nameFixed.length + 4, 1)
    var closestName = undefined, closestN = Infinity, closestNamePage = undefined;

    for(let j = 0; j < orig.numPages; j++) try {
        var page, cont
        const pageDataP = docData.pages[j]
        if (pageDataP != undefined) {
            const pageData = await pageDataP
            page = pageData.page
            cont = pageData.text
        }
        else {
            page = await orig.getPage(j+1);
            cont = (await page.getTextContent()).items;
        }

        const contLength = cont.length

        for(let i = 0; i < contLength; i++) try {
            const oname = nameFixup(cont[i].str)
            if(oname.length < minBound || oname.length > maxBound) continue;
            const n = levenshteinDistance(nameFixed, oname);
            if(n > 0) {
                if (oname == regularName) {
                    closestName = cont[i].str
                    closestNamePage = j;
                    closestN = 0;
                }
                else if(n < closestN) {
                    closestName = cont[i].str;
                    closestNamePage = j;
                    closestN = n;
                }
                continue
            }

            updInfo({ msg: 'Достаём расписание из файла', progress: 0.2 })
            const [schedule, dates, bigFields] = makeSchedule(cont, page.view, i, indices);
            const warningText = makeWarningText(schedule, scheme, bigFields)
            if(__debug_start && __debug_mode === 0) { __debug_schedule_parsing_results[name] = schedule; if(bigFields.length != 0) __debug_warningOn.push([name, warningText]); return }
            updInfo({ msg: 'Создаём PDF файл расписания', progress: 0.3 })

            var pdfDoc, font, page
            var w, h

            var cFont = await canvasFontP
            var canvas, context, textContext

            const renderer = {
                init: async(width, height) => {
                    w = width
                    h = height

                    canvas = createOffscreenCanvas(w, h)
                    context = canvas[0].getContext("2d", { alpha: false, desynchronized: true });

                    context.strokeStyle = '#000';
                    context.textBaseline = 'bottom';
                    renderer.fontSizeFac = fontSizeFac;
                    renderer.fontHeightFac = 1 / fontSizeFac;

                    // as if this is not a common operation
                    context.fillStyle = 'white';
                    context.fillRect(0, 0, w, h);

                    textContext = await textContextP
                },
                fontSizeFac: undefined,
                fontHeightFac: undefined,

                rotated: undefined,
                borderWidth: undefined,
                fillRect: undefined,

                setupRect: (borderWidth, fillYellow, fillWhite) => {
                    renderer.borderWidth = borderWidth
                    renderer.fillRect = fillYellow || fillWhite

                    if(fillYellow) context.fillStyle = '#ffff00'
                    else if(fillWhite) context.fillStyle = '#fff'
                    context.lineWidth = borderWidth
                },
                drawRect: (x, y, width, height) => {
                    context.rect(x, y, width, height)
                },
                finalizeRects: () => {
                    if(renderer.fillRect) context.fill();
                    if(renderer.borderWidth > 0) context.stroke();
                    context.beginPath()
                },
                setupText: (rotated) => {
                    if(rotated) context.setTransform(0, -1, 1, 0, 0, 0);
                    renderer.rotated = rotated;
                    context.fillStyle = '#000';
                },
                setFontSize: (size) => {
                    context.font = size + 'px TimesNewRoman';
                },
                drawText: (text, x, y) => {
                    if(renderer.rotated) {
                        context.fillText(text, -y, x);
                    } else {
                        context.fillText(text, x, y);
                    }
                },
                finalizeTexts: () => {
                    if(renderer.rotated) context.resetTransform();
                },
                textWidth: (text) => { // at font size 1
                    return textContext.measureText(text).width
                },
            }

            await scheduleToPDF(renderer, schedule, scheme, rowRatio, borderFactor, drawBorder, dowOnTop)
            //const doc = await pdfDoc.save()
            const doc = undefined
            updInfo({ msg: 'Создаём предпросмотр', progress: 0.4 })
            const outFilename = filename + '_' + name; //I hope the browser will fix the name if it contains chars unsuitable for file name
            await createAndInitOutputElement(
                doc, w, h, dom.outputsEl, outFilename,
                { rowRatio, scheme, schedule, drawBorder, dowOnTop, borderFactor, dates },
                userdata, canvas
            )

            updInfo({ msg: 'Готово. Пожалуйста, поделитесь сайтом с друзьями ❤️', warning: warningText, progress: 1.0 })
            updateUserdataF('regDocumentCreated')(...userdata)
            return
        }
        catch(e) {
            const add = "[название группы] = " + i + '/' + contLength
            if(Array.isArray(e)) { e.push(add); throw e }
            else throw [e, add]
        }
    }
    catch(e) {
        const add = "[страница] = " + j + '/' + orig.numPages
        if(Array.isArray(e)) { e.push(add); throw e }
        else throw [e, add]

    }

    let cloS = ''
    if(closestName != undefined) {
        cloS = ", возможно вы имели в виду `" + closestName + "` на странице " + (closestNamePage + 1)
    }
    throw ["имя `" + name + "` не найдено" + cloS, "количество страниц = " + orig.numPages];
}

/*
{
    var viewport = page.getViewport({ scale: 1 });
    console.log(viewport)
    var canvas = document.getElementById('the-canvas');
    var context = canvas.getContext('2d');

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height =  Math.floor(viewport.height) + "px";

    var renderContext = { canvasContext: context, viewport };
    await page.render(renderContext).promise
}
*/

function printScheduleError(e) {
    let str = ''
    if(Array.isArray(e)) {
        console.error('ERROR')
        for(let i = 0; i < e.length; i++) {
            console.error(e[i])
            if(i !== 0) str += ', '
            str += e[i]
        }
        console.error('RORRE')
    }
    else {
        str += e
        console.error(e)
    }

    updError({ msg: str, progress: curStatus.progress })
}

function levenshteinDistance(str1, str2) {
    const [s1, s2] = str1.length < str2.length ? [str1, str2] : [str2, str1];
    if(s1.length === 0) return s2.length;

    const len = s1.length;
    const row = Array(len);
    {
        const c2 = s2[0];
        let lef = 1;
        for(let i = 0; i < len; i++) {
            const c1 = s1[i];
            const top = i+1, toplef = i;
            lef = row[i] = (c1 === c2 ? toplef : Math.min(top, toplef, lef) + 1);
        }
    }
    for(let j = 1; j < s2.length-1; j++) {
        let lef = j + 1, toplef = j;
        const c2 = s2[j];
        for(let i = 0; i < len; i++) {
            const c1 = s1[i];
            const top = row[i];
            lef = row[i] = (c1 === c2 ? toplef : Math.min(top, toplef, lef) + 1);
            toplef = top;
        }
    }
    {
        let lef = s2.length, toplef = s2.length-1;
        const c2 = s2[s2.length-1];
        for(let i = 0; i < len; i++) {
            const c1 = s1[i];
            const top = row[i];
            lef = (c1 === c2 ? toplef : Math.min(top, toplef, lef) + 1);
            toplef = top;
        }
        return lef;
    }
}

//https://stackoverflow.com/a/35385518/18704284
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

const outputElementOrig = htmlToElement(`
<div class="output-cont">
    <div class="name" style="text-align: center"></div>
    <div class="output">
        <img style="max-width: 17rem; max-height: 17rem"></img>
        <div class="out-overlay">
            <div class="out-icons">
                <div class="view-pdf no-select" title="Открыть как PDF">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 2100 2100" stroke-width="150"><path d="M1251.654 0c44.499 0 88.207 18.07 119.718 49.581l329.223 329.224c31.963 31.962 49.581 74.54 49.581 119.717V1920H169V0Zm-66.183 112.941H281.94V1807.06h1355.294V564.706H1185.47V112.94Zm112.94 23.379v315.445h315.445L1298.412 136.32Z"></path> <path d="M900.497 677.67c26.767 0 50.372 12.65 67.991 37.835 41.901 59.068 38.965 121.976 23.492 206.682-5.308 29.14.113 58.617 16.263 83.125 22.814 34.786 55.68 82.673 87.981 123.219 23.718 29.93 60.198 45.854 97.13 40.885 23.718-3.276 52.292-5.986 81.656-5.986 131.012 0 121.186 46.757 133.045 89.675 6.55 25.976 3.275 48.678-10.165 65.506-16.715 22.701-51.162 34.447-101.534 34.447-55.793 0-74.202-9.487-122.767-24.96-27.445-8.81-55.906-10.617-83.69-3.275-55.453 14.456-146.936 36.48-223.284 46.983-40.772 5.647-77.816 26.654-102.438 60.875-55.454 76.8-106.842 148.518-188.273 148.518-21.007 0-40.32-7.567-56.244-22.701-23.492-23.492-33.544-49.581-28.574-79.85 13.778-92.95 128.075-144.79 196.066-182.625 16.037-8.923 28.687-22.589 36.592-39.53l107.86-233.223c7.68-16.377 10.051-34.56 7.228-52.518-12.537-79.059-31.06-211.99 18.748-272.075 10.955-13.44 26.09-21.007 42.917-21.007Zm20.556 339.953c-43.257 126.607-119.718 264.282-129.996 280.32 92.273-43.37 275.916-65.28 275.916-65.28-92.386-88.998-145.92-215.04-145.92-215.04Z"></path></svg>
                </div>

                <div title="Скопировать изображение" class="copy-img no-select">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M21 8C21 6.34315 19.6569 5 18 5H10C8.34315 5 7 6.34315 7 8V20C7 21.6569 8.34315 23 10 23H18C19.6569 23 21 21.6569 21 20V8ZM19 8C19 7.44772 18.5523 7 18 7H10C9.44772 7 9 7.44772 9 8V20C9 20.5523 9.44772 21 10 21H18C18.5523 21 19 20.5523 19 20V8Z"></path>
                            <path d="M6 3H16C16.5523 3 17 2.55228 17 2C17 1.44772 16.5523 1 16 1H6C4.34315 1 3 2.34315 3 4V18C3 18.5523 3.44772 19 4 19C4.55228 19 5 18.5523 5 18V4C5 3.44772 5.44772 3 6 3Z"></path>
                    </svg>
                </div>

                <div class="download-img no-select" title="Скачать изображение">
                    <svg viewBox="1 0 22 22" xmlns="http://www.w3.org/2000/svg">
                        <path id="Vector" d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke-linejoin="round" stroke-width="3" stroke-linecap="round"></path>
                    </svg>
                </div>
            </div>

            <div class="main-action view-img no-select" title="Открыть изображение">
                <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 -10 540 540" xml:space="preserve">
                    <path d="M449.803,62.197C408.443,20.807,353.85-0.037,299.646-0.006C245.428-0.037,190.85,20.807,149.49,62.197 C108.1,103.557,87.24,158.15,87.303,212.338c-0.047,37.859,10.359,75.766,30.547,109.359L15.021,424.525 c-20.016,20.016-20.016,52.453,0,72.469c20,20.016,52.453,20.016,72.453,0L190.318,394.15 c33.578,20.203,71.5,30.594,109.328,30.547c54.203,0.047,108.797-20.797,150.156-62.188 c41.375-41.359,62.234-95.938,62.188-150.172C512.053,158.15,491.178,103.557,449.803,62.197z M391.818,304.541 c-25.547,25.531-58.672,38.125-92.172,38.188c-33.5-0.063-66.609-12.656-92.188-38.188c-25.531-25.578-38.125-58.688-38.188-92.203 c0.063-33.484,12.656-66.609,38.188-92.172c25.578-25.531,58.688-38.125,92.188-38.188c33.5,0.063,66.625,12.656,92.188,38.188 c25.531,25.563,38.125,58.688,38.188,92.172C429.959,245.854,417.365,278.963,391.818,304.541z"></path>
                </svg>
            </div>

            <div class="out-icons">
                <div class="settings no-select" title="Настройки изображения">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M13.85 22.25h-3.7c-.74 0-1.36-.54-1.45-1.27l-.27-1.89c-.27-.14-.53-.29-.79-.46l-1.8.72c-.7.26-1.47-.03-1.81-.65L2.2 15.53c-.35-.66-.2-1.44.36-1.88l1.53-1.19c-.01-.15-.02-.3-.02-.46 0-.15.01-.31.02-.46l-1.52-1.19c-.59-.45-.74-1.26-.37-1.88l1.85-3.19c.34-.62 1.11-.9 1.79-.63l1.81.73c.26-.17.52-.32.78-.46l.27-1.91c.09-.7.71-1.25 1.44-1.25h3.7c.74 0 1.36.54 1.45 1.27l.27 1.89c.27.14.53.29.79.46l1.8-.72c.71-.26 1.48.03 1.82.65l1.84 3.18c.36.66.2 1.44-.36 1.88l-1.52 1.19c.01.15.02.3.02.46s-.01.31-.02.46l1.52 1.19c.56.45.72 1.23.37 1.86l-1.86 3.22c-.34.62-1.11.9-1.8.63l-1.8-.72c-.26.17-.52.32-.78.46l-.27 1.91c-.1.68-.72 1.22-1.46 1.22zM6.5 12a5.5 5.5 0 1 0 11 0 5.5 5.5 0 1 0-11 0" fill-rule="evenodd"/>
                    </svg>
                </div>

                <div class="edit no-select" title="Изменить">
                    <svg viewBox="3 3 18 18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.2942 7.95881C13.5533 7.63559 13.5013 7.16358 13.178 6.90453C12.8548 6.64549 12.3828 6.6975 12.1238 7.02072L13.2942 7.95881ZM6.811 14.8488L7.37903 15.3385C7.38489 15.3317 7.39062 15.3248 7.39623 15.3178L6.811 14.8488ZM6.64 15.2668L5.89146 15.2179L5.8908 15.2321L6.64 15.2668ZM6.5 18.2898L5.7508 18.2551C5.74908 18.2923 5.75013 18.3296 5.75396 18.3667L6.5 18.2898ZM7.287 18.9768L7.31152 19.7264C7.36154 19.7247 7.41126 19.7181 7.45996 19.7065L7.287 18.9768ZM10.287 18.2658L10.46 18.9956L10.4716 18.9927L10.287 18.2658ZM10.672 18.0218L11.2506 18.4991L11.2571 18.491L10.672 18.0218ZM17.2971 10.959C17.5562 10.6358 17.5043 10.1638 17.1812 9.90466C16.8581 9.64552 16.386 9.69742 16.1269 10.0206L17.2971 10.959ZM12.1269 7.02052C11.8678 7.34365 11.9196 7.81568 12.2428 8.07484C12.5659 8.33399 13.0379 8.28213 13.2971 7.95901L12.1269 7.02052ZM14.3 5.50976L14.8851 5.97901C14.8949 5.96672 14.9044 5.95412 14.9135
            5.94123L14.3 5.50976ZM15.929 5.18976L16.4088 4.61332C16.3849 4.59344 16.3598 4.57507 16.3337 4.5583L15.929 5.18976ZM18.166 7.05176L18.6968 6.52192C18.6805 6.50561 18.6635 6.49007 18.6458 6.47532L18.166 7.05176ZM18.5029 7.87264L19.2529 7.87676V7.87676L18.5029 7.87264ZM18.157 8.68976L17.632 8.15412C17.6108 8.17496 17.5908 8.19704 17.5721 8.22025L18.157 8.68976ZM16.1271 10.0203C15.8678 10.3433 15.9195 10.8153 16.2425 11.0746C16.5655 11.3339 17.0376 11.2823 17.2969 10.9593L16.1271 10.0203ZM13.4537 7.37862C13.3923 6.96898 13.0105 6.68666 12.6009 6.74805C12.1912 6.80943 11.9089 7.19127 11.9703 7.60091L13.4537 7.37862ZM16.813 11.2329C17.2234 11.1772 17.5109 10.7992 17.4552 10.3888C17.3994 9.97834 17.0215 9.69082 16.611 9.74659L16.813 11.2329ZM12.1238 7.02072L6.22577 14.3797L7.39623 15.3178L13.2942 7.95881L12.1238 7.02072ZM6.24297 14.359C6.03561 14.5995 5.91226 14.9011 5.89159 15.218L7.38841 15.3156C7.38786 15.324 7.38457 15.3321 7.37903 15.3385L6.24297 14.359ZM5.8908 15.2321L5.7508 18.2551L7.2492 18.3245L7.3892 15.3015L5.8908 15.2321ZM5.75396 18.3667C5.83563 19.1586 6.51588 19.7524 7.31152 19.7264L7.26248 18.2272C7.25928 18.2273 7.25771 18.2268 7.25669 18.2264C7.25526 18.2259 7.25337 18.2249 7.25144 18.2232C7.2495 18.2215 7.24825 18.2198 7.24754 18.2185C7.24703 18.2175 7.24637 18.216 7.24604 18.2128L5.75396 18.3667ZM7.45996 19.7065L10.46 18.9955L10.114 17.536L7.11404 18.247L7.45996 19.7065ZM10.4716 18.9927C10.7771 18.9151 11.05 18.7422 11.2506 18.499L10.0934 17.5445C10.0958 17.5417 10.0989 17.5397 10.1024 17.5388L10.4716 18.9927ZM11.2571 18.491L17.2971 10.959L16.1269 10.0206L10.0869 17.5526L11.2571 18.491ZM13.2971 7.95901L14.8851 5.97901L13.7149 5.04052L12.1269 7.02052L13.2971 7.95901ZM14.9135 5.94123C15.0521 5.74411 15.3214 5.6912 15.5243 5.82123L16.3337 4.5583C15.4544 3.99484 14.2873 4.2241 13.6865 5.0783L14.9135 5.94123ZM15.4492 5.7662L17.6862 7.6282L18.6458 6.47532L16.4088 4.61332L15.4492 5.7662ZM17.6352 7.58161C17.7111 7.6577 17.7535 7.761 17.7529 7.86852L19.2529 7.87676C19.2557 7.36905 19.0555 6.88127 18.6968 6.52192L17.6352 7.58161ZM17.7529 7.86852C17.7524 7.97604 17.7088 8.07886 17.632 8.15412L18.682 9.22541C19.0446 8.87002 19.2501 8.38447 19.2529 7.87676L17.7529 7.86852ZM17.5721 8.22025L16.1271 10.0203L17.2969 10.9593L18.7419 9.15928L17.5721 8.22025ZM11.9703 7.60091C12.3196 9.93221 14.4771 11.5503 16.813 11.2329L16.611 9.74659C15.0881 9.95352 13.6815 8.89855 13.4537 7.37862L11.9703 7.60091Z"></path></svg>
                </div>

                <div class="calendar" title="Добавить в календарь">
<svg viewBox="0 0 24 24" style="fill: none; stroke-width: 3" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"></path></svg>
                </div>

                <span class="not-icon" style="flex: 1 1 0px"></span>

                <div class="delete no-select" title="Удалить">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    </svg>
                </div>
            </div>
        </div>
    </div>
</div>
`);

function createOutputElement() {
    return outputElementOrig.cloneNode(true);
}

function insertPopup(par, onTop) {
    const el = htmlToElement(`<span class='popup-container' data-shown="false"><div><div class="safe-zone"><div class="popup"></div></div></div></span>`);
    par.append(el);
    if(onTop) el.setAttribute('data-anchor', 'top');

    return {
        element: el,
        popup: el.querySelector('.popup'),
        safeZone: el.querySelector('.safe-zone')
    };
}

async function renderPDF(pageP, width) {
    const page = await pageP

    const m1 = (num) => { if(num > 1 && num < Infinity) return num; else return 1 }
    const viewport = page.getViewport({ scale: m1(width) / page.getViewport({scale:1}).width })

    const [canvas, getBlob] = createOffscreenCanvas(
        m1(Math.floor(viewport.width)),
        m1(Math.floor(viewport.height))
    );
    const context = canvas.getContext("2d");

    const renderContext = {
        canvasContext: context,
        transform: null, viewport,
    };

    await page.render(renderContext).promise;
    return await getBlob({ type: 'image/png', quality: 1 });
}

async function createImage(width, ifw, retOrig, renderCommands) {
    for(let i = 0; i < ifw.length; i++) {
        if(ifw[i].width === width) {
            try {
                const res = await ifw[i].promise;
                return retOrig ? res.img : res.url;
            } catch(e) {}
        }
    }

    if(ifw.length > 4) {
        const it = ifw.pop()
        it.promise.then(res => { URL.revokeObjectURL(res.url) })
    }

    const promise = (async() => {
        const c = createCanvasRenderer();
        const r = createScalingRenderer(width, c);
        await playbackRenderRecording(renderCommands, r);
        const img = await c.canvas[1]();
        const url = URL.createObjectURL(img);
        return { img, url };
    })();
    ifw.unshift({ width, promise });

    const result = await promise;
    return retOrig ? result.img : result.url;
}

function updateUserdataF_elements(userdata, ...params) { try { try {
    const func = updateUserdataF(...params)
    return (...params2) => { try { try {
        func(...userdata, ...params2);
    } catch(e) { console.error(e); } } catch(e) {} }
} catch(e) { console.error(e); } } catch(e) {}
    return () => { console.error('no funcion defined'); };
}

function addClick_elements(el, name, func, usedFunc, useErrorFunc) {
    function iconAnim(el, isError) {
        el.removeAttribute('data-anim');
        setTimeout(_ => el.setAttribute('data-anim', isError ? 'err' : 'ok'));
    }
    addClick(el, _ => func().then(_ => {
        iconAnim(el);
        if(name) usedFunc(name);
    }, e => {
        iconAnim(el, true);
        if(name) useErrorFunc(name)
        console.error(e);
    }));
}

async function createAndInitOutputElement(
    width, height,
    defaultImageP, renderCommands,
    parentElement,
    name, editParams, userdata,
) {
    let hideName = false;
    try { if('hideName' in name) {
        hideName = true;
        name = name.nameS
    } } catch(e) { /*I don't care that name is string*/ }

    const imageP = defaultImageP.then(it => ({ img: it, url: URL.createObjectURL(it) }));
    const imagesForWidth = [{ width, promise: imageP }];
    var fileUrl;
    let settingsPopupId;

    const outputElement = createOutputElement();
    const settingsEl = outputElement.querySelector('.settings');
    const nameEl = outputElement.querySelector('.name');
    const imageEl = outputElement.querySelector('img');
    const delEl = outputElement.querySelector('.delete');
    const copyImgEl = outputElement.querySelector('.copy-img');
    const viewPdfEl = outputElement.querySelector('.view-pdf');
    const viewImgEl = outputElement.querySelector('.view-img');
    const calendarEl = outputElement.querySelector('.calendar');
    const downloadImgEl = outputElement.querySelector('.download-img');
    const editEl = outputElement.querySelector('.edit');
    const widthInputEl = (() => {
        const popupCont = htmlToElement(`
            <div style="display: flex; align-items: baseline;">
                Ширина:&nbsp;
                <input type="number" style="
                    text-align: right;
                    font-size: 1rem;
                    color: var(--primary-contrast-color);
                    border-bottom: 0.1rem solid var(--primary-contrast-color); width: 4ch;"></input>
                пикс.
            </div>
        `)
        const popupEl = insertPopup(settingsEl, true)
        popupEl.popup.appendChild(popupCont)
        settingsPopupId = registerPopup(popupEl)
        popupAddHoverClick(settingsPopupId, settingsEl.firstElementChild, (pressed) => settingsEl.setAttribute('data-pressed', pressed))
        addOpenedArgumentToElement(settingsPopupId, 'settings', outputElement)
        return popupEl.element.querySelector('input');
    })();

    const getImage = (retOrig) => createImage(Number.parseInt(widthInputEl.value), imagesForWidth, retOrig, renderCommands);
    const usedFunc = updateUserdataF_elements(userdata, 'regDocumentUsed');
    const useErrorFunc = updateUserdataF_elements(userdata, 'regDocumentUseError');
    const addClick2 = (el, name, func) => addClick_elements(el, name, func, usedFunc, useErrorFunc);

    const storageId = "parms" + String(Date.now());
    sessionStorage.setItem(storageId, JSON.stringify(editParams));

    if(!hideName) nameEl.textContent = name;
    widthInputEl.value = width;

    addClick2(viewPdfEl, 'vpdf', async() => {
        const tab = window.open();
        if(fileUrl == undefined) {
            const r = new PDFRenderer();
            await playbackRenderRecording(renderCommands, r);
            const doc = await r.pdfDoc.save()
            fileUrl = URL.createObjectURL(new Blob([doc], { type: 'application/pdf' }));
        }
        if(tab == null) {
            downloadUrl(fileUrl, name + '.pdf');
            return;
        }
        tab.location.href = fileUrl;
    })
    addClick2(viewImgEl, 'vimg', async() => {
        const img = await getImage();
        const tab = window.open();
        if(tab == null) {
            downloadUrl(img, name + '.png')
            return
        }
        tab.location.href = img;
    })
    addClick2(downloadImgEl, 'dimg', async() => {
        downloadUrl(await getImage(), name + '.png');
    })
    addClick2(copyImgEl, 'cimg', async() => {
        try {
            const img = await getImage(true);
            const obj = {};
            obj[img.type] = img;
            navigator.clipboard.write([new ClipboardItem(obj)])
        } catch (error) {
            const url = await getImage();
            downloadUrl(url, name + '.png');
            console.error(error);
        }
    })
    addClick2(editEl, null, async() => {
        window.open("./fix.html" + "?sid=" + storageId);
    })
    addClick2(delEl, null, async() => {
        //TODO: add onbeforeunload
        const el = outputElement;
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = null;
        el.style.animationDirection = 'reverse';
        el.style.animationDuration = '125ms';
        el.addEventListener('animationend', _ => {
            parentElement.removeChild(el);
            unregisterPopup(settingsPopupId);
            sessionStorage.removeItem(storageId);
            if(fileUrl != undefined) URL.revokeObjectURL(fileUrl);
            const ifw = imagesForWidth;
            for(let i = 0; i < ifw.length; i++) URL.revokeObjectURL(ifw[i].img);
        })
    })
    addClick2(calendarEl, null, async() => {
        window.open("./calendar.html" + "?sid=" + storageId);
    })

    imageEl.src = (await imageP).url;

    parentElement.appendChild(outputElement);
}


const css = `

.popup-container {
    width: 0px; height: 0px;
    left: 50%;
    position: relative;

    display: flex;
    justify-content: center;

    will-change: transform; /*chrome bug*/
    transition: opacity 300ms, transform 300ms;

    z-index: 997;
}

.popup-container:not([data-anchor=top]) { top: 0.3em; }
.popup-container[data-anchor=top]       { bottom: calc(100% + 0.3em); align-items: end; }

.popup-container:focus-within { z-index: 998; }
.popup-container:hover        { z-index: 999; }

.popup-container[data-shown=true] { transform: translateY(0); opacity: 1; }
.popup-container[data-shown=true] > * { transform: scale(1); transition: transform 0s; }
.popup-container:not([data-shown=true]) { opacity: 0; }

.popup-container:not([data-shown=true]):not([data-anchor=top]) { transform: translateY( 0.7rem); }
.popup-container:not([data-shown=true])[data-anchor=top]       { transform: translateY(-0.7rem); }
.popup-container:not([data-shown=true]) > * { transform: scale(0); transition: transform 0s 300ms; }

.popup-container > * { pointer-events: none; }

.popup-container > * > .safe-zone {
    padding: 1rem;
    margin-top: -1rem;
    margin-bottom: -1rem;
}

.popup-container > * > .safe-zone > .popup {
    box-sizing: border-box;
    box-shadow: 0px 0px var(--shadow2-size) 0px var(--shadow1-color);
    border: 0px solid transparent;
    border-radius: 10px;
    padding: 0.8rem;
}

.popup-container > * > .safe-zone > .popup:not(.popup-no-default-style) {
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
    pointer-events: all;
}

.popup-container > * > .safe-zone > .popup:not(.popup-no-default-style) input::-webkit-outer-spin-button,
.popup-container > * > .safe-zone > .popup:not(.popup-no-default-style) input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.popup-container > * > .safe-zone > .popup:not(.popup-no-default-style) input[type=number] { -moz-appearance: textfield; }
.popup-container > * > .safe-zone > .popup:not(.popup-no-default-style) input[type=number] { -moz-appearance: textfield; }
.popup-container > * > .safe-zone > .popup:not(.popup-no-default-style) input { border: none; outline: none; background: none; }
.popup-container > * > .safe-zone > .popup:not(.popup-no-default-style):hover { outline: 1px solid var(--primary-contrast-color); }

.popup-container > * > .safe-zone > .popup.hint-popup {
    font-size: 0.8em;
    background-color: var(--bg2-color);
    color: var(--hint-color);
    pointer-events: all;
    position: relative;
    cursor: grabbing; /*no better alternative*/
}

.popup-container > * > .safe-zone > .popup.hint-popup::before {
    pointer-events: none;
    position: absolute;
    top: 0px; left: 0px; right: 0px; bottom: 0px;
    content: '';
    border: 0px solid transparent;
    border-radius: inherit;
}

.popup-container > * > .safe-zone > .popup.hint-popup:hover::before {
    background: var(--bg-hover-text);
}

@keyframes opacity01 {
    from { opacity: 0 } to { opacity: 1 }
}

.output-cont {
    animation: opacity01;
    animation-duration: 200ms;

    /*https://stackoverflow.com/questions/26099421/css-animation-fill-mode-and-z-index-issue*/
    /*This is the closest reason for this to happen
    https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context#:~:text=Element%20with%20an%20opacity%20value%20less%20than%201%20(See%20the%20specification%20for%20opacity).
    cool behavior! even if the animation uses opacity only once, even if animates from 1 to 1,
    the browser still creates stacking context for the element.
    All of these would trigger this behavoir:
      @keyframes aaa { from{ opacity: 1 } to { opacity: 1 } }
      @keyframes AAA { from{} to { opacity: 1 } }
    */
    /*animation-fill-mode: both*/
}

.output-cont > .name {
    color: var(--text-color);
}

.output-cont .output {
    display: grid;
    align-items: center;
    justify-items: center;
    background: white;
    box-shadow: 0px 0px var(--shadow2-size) 0px var(--shadow1-color);
}
.output-cont .output > * { grid-row: 1; grid-column: 1; }

.output-cont .out-overlay {
    width: 100%; height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.output-cont .out-overlay > .main-action {
    flex: 1 1 auto;
    display: flex;
    justify-content: center;
    align-items: center;
}

.output-cont .out-overlay > .main-action > * {
    fill: var(--text-color-dark);

    min-width: 3rem;
    min-height: 3rem;
    max-width: max(30%, 3rem);
    max-height: max(30%, 3rem);
}

.output-cont .out-overlay .out-icons > *:not(.not-icon), .output-cont .outout-cont .out-overlay .main-action {
    position: relative;
    transition: background 200ms;
    cursor: pointer;
}

.output-cont .out-overlay .out-icons > *:not(.not-icon):hover, .output-cont .out-overlay .main-action:hover {
    background: var(--bg-hover-outputicon);
}

.output-cont .out-overlay .out-icons > *:not(.not-icon)::before, .output-cont .out-overlay .main-action::before {
    pointer-events: none;
    position: absolute;
    top: 0px; left: 0px; right: 0px; bottom: 0px;
    content: '';
    border: 0px solid transparent;
    border-radius: inherit;
    opacity: 0.4;
}

.output-cont .out-overlay .out-icons > *:not(.not-icon)[data-anim]::before, .output-cont .out-overlay .main-action[data-anim]::before {
    transition: opacity 200ms;
    opacity: 0;
}

.output-cont .out-overlay .out-icons > *:not(.not-icon)[data-anim=err]::before, .output-cont .out-overlay .main-action[data-anim=err]::before {
    background: var(--error-color);
}
.output-cont .out-overlay .out-icons > *:not(.not-icon)[data-anim=ok]::before, .output-cont .out-overlay .main-action[data-anim=ok]::before {
    background: var(--bg-click-outputicon);
}

.output-cont *.out-icons {
    display: flex;
    padding: 0.3rem;
}

.output-cont *.out-icons > *:not(.not-icon) {
    margin-left: 0.2rem;
    border: 0px solid transparent;
    border-radius: 999999px;
}

.output-cont *.out-icons > *:not(.not-icon) > *:first-child {
    border: inherit;
    border-radius: inherit;
    padding: 0.4em;
    overflow: visible;
    display: block;
    height: 1.4rem;
    fill: var(--text-color-dark);
    stroke: var(--text-color-dark);
}

.output-cont *.out-icons > *:not(.not-icon)[data-pressed=true]:hover,
    .output-cont *.out-icons > *:not(.not-icon)[data-pressed=true]:not(:hover) {
    background-color: var(--primary-contrast-color);
}

.output-cont *.out-icons > *:not(.not-icon)[data-pressed=true] > *:first-child {
    fill: var(--primary-color);
    stroke: var(--primary-color);
}

.output-cont *.out-icons > *:not(.not-icon).copy-img {
    flex: 1 0 auto;
    display: flex;
    justify-content: center;
}

.output-cont .out-overlay {
    opacity: 0;
    transition: opacity 200ms;
}

.output-cont:hover > .output > .out-overlay { opacity: 1; }
.output-cont[data-popup-opened]:not([data-popup-opened=""]) > .output > .out-overlay { opacity: 1; }
.output-cont:has(:focus-visible) > .output > .out-overlay { opacity: 1; }

@media (pointer: fine) {
    .output-cont .out-overlay {
        background: var(--outputoverlay-color);
    }
}

@media not (pointer: fine) {
    .output-cont .out-overlay { opacity: 1; }
    .output-cont .main-action { opacity: 0 }
    .output-cont .out-icons { background: var(--outputoverlay-color); }
}
`;

{ //https://stackoverflow.com/a/524721/18704284
    const head = document.head || document.getElementsByTagName('head')[0],
          style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet){
      // This is required for IE8 and below.
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
}

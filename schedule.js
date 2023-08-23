const daysOfWeek = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
    "Воскресенье"
]; 

const daysOfWeekLower = daysOfWeek.map(a => a.toLowerCase())
const daysOfWeekShortened = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const daysOfWeekShortenedLower = daysOfWeekShortened.map(it => it.toLowerCase())
const mergeLeading = 0.2, mergeSpace = 0.1;

function findItemBoundsH(cont, itemI) {
    const item = cont[itemI];
    const bs = bounds(item);
    const itemCenter = 0.5 * (bs.l + bs.r)

    const itemBounds = new Map();
    const items = new Set();
    const is = { l: bs.l, r: bs.r, t: bs.t, b: bs.b };

    let curI = itemI;
    let totalHeight = item.height;
    let totalCount = 1;
    let curAdded;

    const addItems = () => {
        const nItem = cont[curI];
        if(nItem.str.trim() == '') return;
        if(items.has(curI)) return;
        let ns;
        if(itemBounds.has(curI)) ns = itemBounds.get(curI);
        else itemBounds.set(curI, ns = bounds(nItem));

        const h = (totalHeight + nItem.height) / (totalCount+1);
        const lea = h * mergeLeading;
        const spa = h * mergeSpace;

        if(intersects(ns.b, ns.t, is.b - lea, is.t + lea)) {
            curAdded++;
            totalHeight = totalHeight + nItem.height;
            totalCount++;
            items.add(curI)
            is.l = Math.min(is.l, ns.l)
            is.b = Math.min(is.b, ns.b)
            is.r = Math.max(is.r, ns.r)
            is.t = Math.max(is.t, ns.t)
        }
        else return true;
    };

    do { //add all items in row
        curAdded = 0;
        curI--;
        for(; curI >= 0; curI--) if(addItems()) break;
        curI++;
        for(; curI < cont.length; curI++) if(addItems()) break;
    } while(curAdded !== 0);

    const itemsArr = Array.from(items);
    itemsArr.sort((a, b) => {
        const ba = itemBounds.get(a);
        const bb = itemBounds.get(b);
        const ac = (ba.l + ba.r) * 0.5;
        const bc = (bb.l + bb.r) * 0.5;
        return ac - bc;
    })

    if(typeof __schedule_debug_names != 'undefined' && __schedule_debug_names) console.log(itemsArr.map(it => '"' + cont[it].str + '"') + ',')

    const spaces = []
    {
        const firstBs = itemBounds.get(itemsArr[0])
        let colL = firstBs.l, colR = firstBs.r;
        let colXTotal = (colL + colR) * 0.5;
        let colCount = 1;
        let prevColCenter = undefined;

        for(let i = 1;; i++) {
            let bs, center;
            if(i < itemsArr.length) {
                bs = itemBounds.get(itemsArr[i])
                center = (bs.l + bs.r) * 0.5;
                if(intersects(bs.l, bs.r, colL, colR)) {
                    colXTotal += center;
                    colCount++;
                    colL = Math.min(colL, bs.l)
                    colR = Math.max(colR, bs.r)
                    continue;
                }
            }

            const curColCenter = colXTotal / colCount;
            if(prevColCenter != undefined) spaces.push(Math.abs(curColCenter - prevColCenter));

            if(i >= itemsArr.length) break;
            prevColCenter = curColCenter;
            colXTotal = center;
            colCount = 1;
            colL = bs.l;
            colR = bs.r;
        }
    }

    const err = item.height * 0.05;
    let avg;
    while(spaces.length > 2) {
        avg = 0;
        for(let i = 0; i < spaces.length; i++) {
            avg += 
                spaces[i];
        }
        avg /= spaces.length;
        
        let maxI = 0, maxDiff = Math.abs(spaces[0] - avg)
        for(let i = 1; i < spaces.length; i++) {
            const diff = Math.abs(spaces[i] - avg);
            if(!(diff <= maxDiff)) {
                maxDiff = diff;
                maxI = i;
            }
        }
        if(maxDiff < err) break;
        spaces.splice(maxI, 1)
    }

    if(avg != undefined) return { lef: itemCenter - avg/2, rig: itemCenter + avg/2, bottom: bs.b }; 
    else throw "Невозможно определить вертикальные границы расписания, [имя группы] = " + itemI + "/" + cont.length;
}

function parseTime(str) {
    if(str.length < 4) return;
    const d = ':'.charCodeAt(0);

    let i = 0;
    let hour = 0;
    for(; i < 2; i++) {
        const ch = str.charCodeAt(i);
        if(ch === d) break;
        else if(ch < '0'.charCodeAt(0) || ch > '9'.charCodeAt(0)) return;
        else hour = hour*10 + (ch - '0'.charCodeAt(0));
    }
    if(str.charCodeAt(i) !== d) return;
    i++;

    let j = 0;
    let minute = 0;
    for(; i < str.length; i++, j++) {
        const ch = str.charCodeAt(i);
        if(ch < '0'.charCodeAt(0) || ch > '9'.charCodeAt(0)) return;
        else minute = minute*10 + (ch - '0'.charCodeAt(0));
    }
    if(j !== 2) return;

    return hour * 60 + minute;
}

function bounds(item) {
    const h = 1;
    const w = item.width / item.height;

    const op = [[0,0], [0,h], [w,0], [w,h]]
    const a = item.transform[0], b = item.transform[1], c = item.transform[2], d = item.transform[3]
    
    const min = Number.MIN_VALUE, max = Number.MAX_VALUE;
    const bs = { l: max, b: max, r: min, t: min }
    for(let i = 0; i < 4; i++) {
        const x = op[i][0]
        const y = op[i][1]

        const xp = a*x + b*y;
        const yp = c*x + d*y;

        bs.l = Math.min(bs.l, xp)
        bs.b = Math.min(bs.b, yp)
        bs.r = Math.max(bs.r, xp)
        bs.t = Math.max(bs.t, yp)
    }

    bs.l += item.transform[4]
    bs.r += item.transform[4]
    bs.t += item.transform[5]
    bs.b += item.transform[5]

    return bs
}


function findDaysOfWeekHoursBoundsV(cont) {
    const dow = Array(daysOfWeek.length);
    const hours = [];
    let curStart = 0;
    for(let i = 0; i < cont.length; i++) {
        const str = cont[i].str.toLowerCase();
        for(let j = 0; j < daysOfWeek.length; j++) {
            if(str !== daysOfWeekLower[j]) continue;
            if(dow[j] != undefined) throw ["День недели " + j + " обнаружен дважды", "[дубликат] = " + i + "/" + cont.length];

            dow[j] = { si: curStart, i: i };
            curStart = i+1;
            break;
        }

        if(i + 1 < cont.length) {
            const h = parseTime(cont[i].str);
            if(h != undefined) {
                for(let j = 1; j < 3; j++) {
                    let h2 = parseTime(cont[i+j].str);
                    if(h2 != undefined) hours.push({ i: i, sTime: h, eTime: h2, items: [cont[i], cont[i+j]] });
                }
            }
        }
    }

    if(hours < 2) throw "В рассписании найдено меньше двух пар";

    let hoursSpacing2; //height between hours labels / 2
    {
        const b00 = bounds(hours[0].items[0])
        const b01 = bounds(hours[0].items[1])
        const b10 = bounds(hours[1].items[0])
        const b11 = bounds(hours[1].items[1])

        const c0 = 0.5 * (Math.min(b00.b, b01.b) + Math.max(b00.t, b01.t)) //center of the 1st hours label
        const c1 = 0.5 * (Math.min(b10.b, b11.b) + Math.max(b10.t, b11.t)) // --- 2nd ---

        hoursSpacing2 = Math.abs(c1 - c0) * 0.5;

        hours[0].top = c0 + hoursSpacing2
        hours[0].bot = c0 - hoursSpacing2
        hours[1].top = c1 + hoursSpacing2
        hours[1].bot = c1 - hoursSpacing2
    }

    for(let i = 2; i < hours.length; i++) {
        const b0 = bounds(hours[i].items[0]);
        const b1 = bounds(hours[i].items[1]);
        const c = 0.5 * (Math.min(b0.b, b1.b) + Math.max(b0.t, b1.t))
        hours[i].top = c + hoursSpacing2
        hours[i].bot = c - hoursSpacing2
    }

    const info = Array(dow.length); //starting and ending indices for the days of week
    let newHourI = 0;
    for(let d = 0; d < dow.length; d++) {
        if(dow[d] == undefined) continue;
        const it = {};
        info[d] = it;

        const si = dow[d].si;
        let ei;
        for(let j = d+1; j < dow.length; j++) if(dow[j] != undefined) {
            ei = dow[j].i - 1;
            break;
        }
        if(ei == undefined) ei = cont.length-1;

        it.si = si;
        it.ei = ei;
        it.hours = [];

        let prevTime;
        let i = newHourI;
        while(i < hours.length && hours[i].i <= si) i++; 
        while(i < hours.length && hours[i].i <= ei && (prevTime == undefined || hours[i].sTime > prevTime)) {
            prevTime = hours[i].eTime;
            it.hours.push(hours[i]);
            i++;
        }
        newHourI = i;
    }

    return info;
}

/*[a1; a2] & (b1, b2)*/
function intersects(a1, a2, b1, b2) {
    return a2 > b1 && a1 < b2;
}

function findDates(cont, hBounds) {
    const datesRegex = /(^|.*?\s)(\d\d)\.(\d\d)\.(\d\d\d\d)(\s.*?\s|\s)(\d\d)\.(\d\d)\.(\d\d\d\d)(\s|$)/
    const bottom = hBounds.bottom

    for(let i = 0; i < cont.length; i++) {
        const item = cont[i]
        const bs = bounds(item)
        if(bs.t > bottom) continue;
        if(!intersects(bs.l, bs.r, hBounds.lef, hBounds.rig)) continue;
        const gs = item.str.match(datesRegex)
        if(gs) return [
            new Date(gs[4], gs[3] - 1, gs[2]),
            new Date(gs[8], gs[7] - 1, gs[6]),
        ];
    }
}

function makeSchedule(cont, vBounds, hBounds) {
    const iterateHours = (func) => {
        for(let d = 0; d < vBounds.length; d++) {
            if(vBounds[d] == undefined) continue;
            const day = vBounds[d];
            const curS = schedule[d];
            for(let h = 0; h < day.hours.length; h++) {
                if(func(day, h, curS, d)) return;
            }
        }
    };

    const schedule = Array(vBounds.length);
    for(let dayI = 0; dayI < vBounds.length; dayI++) {
        if(vBounds[dayI] == undefined) continue;
        const day = vBounds[dayI];

        const curS = Array(day.hours.length);
        schedule[dayI] = curS;
        for(let i = 0; i < day.hours.length; i++) curS[i] = {
            sTime: day.hours[i].sTime,
            eTime: day.hours[i].eTime,
            lessons: ['', '', '', '']
        };
    }

    const la = hBounds.lef, ra = hBounds.rig;
    const ma = (la + ra) * 0.5;

    const fields = []
    for(let i = 0; i < cont.length; i++) {
        const item = cont[i];
        const ibounds = bounds(item)
        const bi = ibounds.b, ti = ibounds.t; 
        const li = ibounds.l, ri = ibounds.r;
        if(!intersects(li, ri, la, ra)) continue;

        iterateHours((day, h) => {
            const ba = day.hours[h].bot, ta = day.hours[h].top;
            if(!intersects(bi, ti, ba, ta)) return;
            fields.push({ item, bs: ibounds })
            return true
        });
    }
    if(fields.length === 0) throw "Не удалось найти ни одного урока для данной группы";

    const fieldGroups = [];
    let minYGroups;
    for(let i = 0; i < fields.length; i++) {
        const cur = fields[i]
        const cbs = cur.bs;

        let added = false, aboveMinGroup = true;
        for(let j = fieldGroups.length-1; j >= 0 && aboveMinGroup; j--) {
            aboveMinGroup = cbs.top <= minYGroups;
            const other = fieldGroups[j];
            const obs = other.bs;

            const h = Math.min(cur.item.height, other.fields[0].height)
            if(Math.abs(cur.item.height - other.fields[0].height) >= h * 0.1) continue;
            const lea = h * mergeLeading;
            const spa = h * mergeSpace;

            const ih = intersects(cbs.l, cbs.r, obs.l - spa, obs.r + spa)
            const iv = intersects(cbs.b, cbs.t, obs.b - lea, obs.t + lea)
            if(!ih || !iv) continue;
            const xh = intersects(cbs.l, cbs.r, obs.l, obs.r)
            const xv = intersects(cbs.b, cbs.t, obs.b, obs.t)
            if(xh && xv) continue;

            other.fields.push(cur.item)
            obs.l = Math.min(cbs.l, obs.l)
            obs.r = Math.max(cbs.r, obs.r)
            obs.b = Math.min(cbs.b, obs.b)
            obs.t = Math.max(cbs.t, obs.t)
            minYGroups = minYGroups == undefined ? other.bs.b : Math.min(minYGroups, other.bs.b);

            added = true;
            break;
        }
        if(!added) {
            const other = { fields: [cur.item], bs: cbs }
            fieldGroups.push(other)
            minYGroups = minYGroups == undefined ? other.bs.b : Math.min(minYGroups, other.bs.b);
        }
    }

    const bigFields0 = new Set()
    const bigFieldsLessons = []

    //put field groups in the schedule
    for(let gI = 0; gI < fieldGroups.length; gI++) {
        const group = fieldGroups[gI];
        const ibounds = group.bs;
        const bi = ibounds.b, ti = ibounds.t; 
        const li = ibounds.l, ri = ibounds.r;
        const err = group.fields[0].height * 0.1;
        const isBig = li + err < la || ri - err > ra
        
        const itemC = (bi + ti) * 0.5;
        const itemM = (li + ri) * 0.5;

        iterateHours((day, hours, curS, dayI) => {
            const ba = day.hours[hours].bot, ta = day.hours[hours].top;
            const ca = (ba + ta) * 0.5;

            if(!(ba < itemC && itemC < ta) && !(bi + err > ba && ti - err < ta)) return;
            const il = intersects(li, ri, la, ma);
            const ir = intersects(li, ri, ma, ra);
            if(!il && !ir) return;
            const ib = intersects(bi, ti, ba, ca);
            const it = intersects(bi, ti, ca, ta);
            if(!it && !ib) return;

            group.fields.sort((a, b) => {
                const dy = a.transform[5] - b.transform[5];
                if(Math.abs(dy) < 0.01 * Math.min(a.height, b.height)) return a.transform[4] - b.transform[4];
                else return -dy //in pdf y is flipped
            });
            let result = '' + group.fields[0].str;
            for(let i = 1; i < group.fields.length; i++) result += ' ' + group.fields[i].str;

            const lessons = curS[hours].lessons;
            const inters = [il && it, ir && it, il && ib, ir && ib];
            for(let i = 0; i < inters.length; i++) {
                if(!inters[i]) continue;
                if(lessons[i].length !== 0) console.error('Cannot add more than one group per field', dayI, hours, lessonsI)
                lessons[i] = result;
                if(isBig) {
                    bigFields0.add((BigInt(dayI) << BigInt(16)) + BigInt(hours));
                    bigFieldsLessons.push([lessons, i])
                }
            }

            return true
        })
    }

    //make big fields take all horisontal space if allowed
    //[top left] -> +top right, [top right] -> +top left, ...
    const otherIndex = [1, 0, 3, 2];
    for(let i = 0; i < bigFieldsLessons.length; i++) {
        const [lessons, index] = bigFieldsLessons[i];
        const oi = otherIndex[index]
        if(lessons[oi] === '') lessons[oi] = lessons[index]
    }

    //remove trailing empty lessons
    //? if day is completely empty => set to undefined ?
    for(let dayI = 0; dayI < vBounds.length; dayI++) {
        if(vBounds[dayI] == undefined) continue;
        const curS = schedule[dayI]

        let empty = true;
        for(let i = curS.length-1; i >= 0; i--) {
            const l = curS[i];
            for(let j = 0; j < 4 && empty; j++) empty &&= !l.lessons[j].length;
            if(empty) curS.pop();
        }
    }

    const bigFields = []
    bigFields0.forEach(it => {
        const day = Number(it >> BigInt(16))
        const hours = Number(it & ((BigInt(1) << BigInt(16)) - BigInt(1)))
        bigFields.push({ day, hours })
    })

    return [schedule, bigFields]
}

function heightAtSize(font, size) {
    try { return font.heightAtSize(size) }
    catch(e) { console.error(e); return NaN }
}

function sizeAtHeight(font, height) {
    try { return font.sizeAtHeight(height) }
    catch(e) { console.error(e); return NaN }
}

function descenderAtHeight(font, size) {
    try { return font.embedder.__descenderAtHeight(size) }
    catch(e) { console.error(e); return NaN }
}

function drawRectangle(page, params) {
    try{ page.drawRectangle(params) } catch(e) { console.error(e) }
}

function drawText(page, text, params) {
    try{ page.drawText(text, params) } catch(e) { console.error(e) }
}

function widthOfTextAtSize(font, text, size) {
    if(size != undefined && checkValid(size)) return font.widthOfTextAtSize(text, size)
    else {
        console.error('invalid size: ', size)
        return NaN
    }
}

function checkValid(...params) {
    for(let i = 0; i < params.length; i++) {
        const p = params[i]
        if(p != undefined && !(p > 0 && p < Infinity)) return false
    }
    return true
}


function drawTextCentered(text, page, font, fontSize, center, precompWidths = undefined) {
    const lineHeight = heightAtSize(font, fontSize);
    let widths = precompWidths
    if(widths === undefined) {
        widths = Array(text.length)
        for(let i = 0; i < text.length; i++) {
            const textWidth = widthOfTextAtSize(font, text[i], fontSize)
            widths[i] = textWidth;
        }
    }
    
    const d = descenderAtHeight(font, fontSize);
    const offY = center.y - d + lineHeight*text.length * 0.5;

    for(let i = 0; i < text.length; i++) {
        drawText(page, text[i], {
            x: center.x - widths[i] * 0.5,
            y: offY - i*lineHeight - lineHeight,
            size: fontSize,
            font: font,
            color: PDFLib.rgb(0, 0, 0),
        });
    }
}

const textBreak = new (function() {
    function arr(len) { const a = new Array(len); a.length = 0; return a }

    const count = 6
    const tried = arr(count)
    const objs = [
        { width: 0, height: 0, fontSize: 0, texts: arr(4), lineWidths: arr(4) },
        { width: 0, height: 0, fontSize: 0, texts: arr(4), lineWidths: arr(4) },
    ]

    let bestI, lastI

    this.reset = function() {
        tried.length = 0
        bestI = true
        lastI = !bestI
        for(let i = 0; i < objs.length; i++) {
            const o = objs[i]
            o.lineWidths.length = o.texts.length = o.width = o.height = o.fontSize = 0
        }
    }
    this.haveTried = function (divs) { return tried.includes(divs) }
    this.remeasure = function(strOrig, divs, font, bounds) {
        let prevSpace = true //trimStart
        let str = ''
        for(let i = 0; i < strOrig.length; i++) {
            if(prevSpace & (prevSpace = strOrig[i] === ' ')) continue;
            else str += strOrig[i]
        }
        str = str.trimEnd()

        tried.push(divs)


        const tmpI = !bestI
        const tmp = objs[+tmpI]
        tmp.lineWidths.length = tmp.texts.length = tmp.width = tmp.height = tmp.fontSize = 0
        /*break text*/ {
            const maxOffset = Math.max(1, Math.log(str.length+1)) * Math.sqrt(str.length)
            const lineLen =  Math.floor(str.length / divs)

            let prev = 0, startFrom = 0
            for(let i = 0; i < divs-1; i++) {
                const base = lineLen * (i+1)

                startFrom = Math.max(startFrom, base - maxOffset)

                let foundPos
                for(let cur = base; cur >= startFrom; cur--) if(str[cur] === ' ') {
                    foundPos = cur;
                    break;
                }
                                
                for(startFrom = Math.max(startFrom, base+1); 
                    startFrom <= Math.min(str.length-1, base + maxOffset)
                        && !(startFrom - base >= base - foundPos); 
                    startFrom++
                ) if(str[startFrom] === ' ') {
                    foundPos = startFrom++;
                    break;
                }

                if(foundPos) {
                    tmp.texts.push(str.substring(prev, foundPos));
                    prev = foundPos+1;
                }
            }

            tmp.texts.push(str.substring(prev));
        }

        /*calc sizes*/ {
            const fontSize = 10

            tmp.lineWidths.length = tmp.texts.length
            let maxWidth = 0
            for(let i = 0; i < tmp.texts.length; i++) {
                const textWidth = widthOfTextAtSize(font, tmp.texts[i], fontSize)
                tmp.lineWidths[i] = textWidth
                maxWidth = Math.max(maxWidth, textWidth);
            }
            const scaledHeight = Math.min(bounds.h / tmp.texts.length, heightAtSize(font, fontSize) * bounds.w / maxWidth);
            tmp.fontSize = sizeAtHeight(font, scaledHeight);

            const coeff = tmp.fontSize / fontSize
            for(let i = 0; i < tmp.lineWidths.length; i++) tmp.lineWidths[i] *= coeff
            tmp.width = maxWidth * coeff;
            tmp.height = tmp.texts.length * scaledHeight

            lastI = tmpI
            if(tmp.fontSize > objs[+bestI].fontSize) bestI = tmpI
        }
    }

    Object.defineProperty(this, 'best', { get: () => objs[+bestI] });
    Object.defineProperty(this, 'last', { get: () => objs[+lastI] });
})()

function fitTextBreakLines(str, font, size) {
    textBreak.reset()

    textBreak.remeasure(str, 1, font, size)

    for(let j = 0; j < 3; j++) {
        /*maximize text width*/ {
            const el = textBreak.last
            const scaledHeight = el.height * size.w / el.width;
            const fontSize = sizeAtHeight(font, scaledHeight);
            const divs = Math.max(1, Math.round(el.texts.length * Math.sqrt(size.h / scaledHeight)));
            if(textBreak.haveTried(divs)) break;
            else textBreak.remeasure(str, divs, font, size)
        }

        /*maximize text height*/ {
            const el = textBreak.last
            const scaledWidth = el.width * size.h / el.height;
            const divs = Math.max(1, Math.round(el.texts.length * Math.sqrt(scaledWidth / size.w)));
            const fontSize = sizeAtHeight(font, size.h / divs);
            if(textBreak.haveTried(divs)) break;
            else textBreak.remeasure(str, divs, font, size)
        }
    }

    const el = textBreak.best
    return [el.texts, el.fontSize, el.lineWidths]
}

function drawLessonText(lesson, secondWeek, page, font, coord, blockSize, borderWidth) {
    if(secondWeek && lesson.trim() !== '') drawRectangle(page, {
        x: coord.x,
        y: coord.y,
        width: blockSize.w,
        height: -blockSize.h,
        color: PDFLib.rgb(1, 1, 0),
    })
    if(lesson.trim() !== '') {
        const t = lesson;
        const innerSize = { w: blockSize.w * 0.95, h: blockSize.h * 0.9 }
        const [text, fontSize, widths] = fitTextBreakLines(t, font, innerSize)

        drawTextCentered(
            text, page, font, fontSize, 
            { x: coord.x + blockSize.w*0.5, y: coord.y - blockSize.h*0.5 },
            widths
        );
    }

    drawRectangle(page, {
        x: coord.x,
        y: coord.y,
        width: blockSize.w,
        height: -blockSize.h,
        borderColor: PDFLib.rgb(0, 0, 0),
        borderWidth: borderWidth,
    })
}

function minuteOfDayToString(it) {
    return Math.floor(it/60) + ":" + (it%60).toString().padStart(2, '0')
}

function drawTime(lesson, page, font, coord, blockSize, borderWidth) {
    const innerSize = { w: blockSize.w*0.8, h: blockSize.h*0.9 }

    const texts = [
        minuteOfDayToString(lesson.sTime),
        "–",
        minuteOfDayToString(lesson.eTime)
    ];
    const textHeight = innerSize.w
    let fontSize = sizeAtHeight(font, textHeight);
    const widths = []
    let largestWidth = 0
    for(let i = 0; i < texts.length; i++) {
        const textWidth = widthOfTextAtSize(font, texts[i], fontSize)
        widths.push(textWidth)
        if(textWidth > largestWidth) largestWidth = textWidth;
    }

    const scaledHeight = Math.min(textHeight * innerSize.w / largestWidth, innerSize.h / texts.length);
    fontSize = sizeAtHeight(font, scaledHeight);

    const coeff = scaledHeight / textHeight;
    for(let i = 0; i < widths.length; i++) widths[i] *= coeff

    drawTextCentered(
        texts, page, font, fontSize, 
        { x: coord.x + blockSize.w*0.5, y: coord.y - blockSize.h*0.5 },
        widths
    );

    drawRectangle(page, {
        x: coord.x,
        y: coord.y,
        width: blockSize.w,
        height: -blockSize.h,
        borderColor: PDFLib.rgb(0, 0, 0),
        borderWidth: borderWidth,
    })
}


function drawLessons(lesson, page, font, coord, size, borderWidth) {
    const eqh1 = lesson.lessons[0] === lesson.lessons[1];
    const eqh2 = lesson.lessons[2] === lesson.lessons[3];
    const eqv1 = lesson.lessons[0] === lesson.lessons[2];
    const eqv2 = lesson.lessons[1] === lesson.lessons[3];

    const points = [
        { x: coord.x             , y: coord.y              },
        { x: coord.x + size.w*0.5, y: coord.y              },
        { x: coord.x             , y: coord.y - size.h*0.5 },
        { x: coord.x + size.w*0.5, y: coord.y - size.h*0.5 },
    ];

    const sizes = [
        { w: size.w*0.5, h: size.h*0.5 },
        { w: size.w    , h: size.h*0.5 },
        { w: size.w*0.5, h: size.h     },
        { w: size.w    , h: size.h     }
    ];

    const drawLessons = Array(4)
    if(eqh1 && eqh2 && eqv1 && eqv2) drawLessonText(lesson.lessons[0], false, page, font, points[0], sizes[3], borderWidth)
    else if(eqh1 || eqh2) {
        if(eqh1) drawLessonText(lesson.lessons[0], false, page, font, points[0], sizes[1], borderWidth)
        else drawLessons[0] = drawLessons[1] = true

        if(eqh2) drawLessonText(lesson.lessons[2], true, page, font, points[2], sizes[1], borderWidth)
        else drawLessons[2] = drawLessons[3] = true
    }
    else if(eqv1 || eqv2) {
        if(eqv1) drawLessonText(lesson.lessons[0], false, page, font, points[0], sizes[2], borderWidth)
        else drawLessons[0] = drawLessons[2] = true

        if(eqv2) drawLessonText(lesson.lessons[1], false, page, font, points[1], sizes[2], borderWidth)
        else drawLessons[1] = drawLessons[3] = true
    }
    else drawLessons.fill(true)

    if(drawLessons[0]) drawLessonText(lesson.lessons[0], false, page, font, points[0], sizes[0], borderWidth)
    if(drawLessons[1]) drawLessonText(lesson.lessons[1], false, page, font, points[1], sizes[0], borderWidth)
    if(drawLessons[2]) drawLessonText(lesson.lessons[2], true, page, font, points[2], sizes[0], borderWidth)
    if(drawLessons[3]) drawLessonText(lesson.lessons[3], true, page, font, points[3], sizes[0], borderWidth)
}

function drawLesson(lesson, page, font, coord, size, timeWidth, borderWidth) {
    drawTime(lesson, page, font, coord, { w: timeWidth, h: size.h }, borderWidth)
    drawLessons(lesson, page, font, { x: coord.x + timeWidth, y: coord.y }, { w: size.w - timeWidth, h: size.h }, borderWidth)
}

function drawTextWidthinBounds(text, page, font, coord, size, params) {
    params ??= {}
    const padding = params.padding ?? 0.05
    const innerFactor = 1 - 2*padding

    const calcParams = (maxWidth, maxHeight) => {
        const offWidth = maxWidth * innerFactor
        const offHeight = maxHeight * innerFactor
        const fontSize = sizeAtHeight(font, offHeight);
        const largestWidth = widthOfTextAtSize(font, text, fontSize);
        const textHeight = heightAtSize(font, fontSize)
        const scaledHeight = Math.min(textHeight * offWidth / largestWidth, offHeight);
        const scaledWidth = largestWidth * scaledHeight / offHeight;
        const newSize = sizeAtHeight(font, scaledHeight);

        const offsetHeight = (offHeight + maxHeight) * 0.5;
        if(params.alignLeft) {
            const offsetWidth = 0;
            return [offsetWidth, offsetHeight, scaledWidth, scaledHeight, newSize]
        }
        else if(params.alignRight) { 
            const offsetWidth = maxWidth * (1 - padding) - scaledWidth
            return [offsetWidth, offsetHeight, scaledWidth, scaledHeight, newSize]
        }
        else {
            const offsetWidth = (maxWidth - scaledWidth) * 0.5
            return [offsetWidth, offsetHeight, scaledWidth, scaledHeight, newSize]
        }
    };
    const [offsetWidth, offsetHeight, tw, th, fontSize] = params.rotated ? calcParams(size.h, size.w) : calcParams(size.w, size.h)
    const d = descenderAtHeight(font, fontSize);
    const textOffsetX = params.rotated ? d : 0;
    const textOffsetY = params.rotated ? 0 : -d;
    const x = coord.x + (params.rotated ? offsetHeight : offsetWidth)
    const y = coord.y + (params.rotated ? -size.h + offsetWidth : -offsetHeight)

    if(params.backgroundColor) drawRectangle(page, {
        x, y, 
        width: params.rotated ? -th : tw,
        height: params.rotated ? tw : th,
        color: params.backgroundColor
    })

    drawText(page, text, {
        x: x + textOffsetX, y: y + textOffsetY,
        size: fontSize,
        font: font,
        color: PDFLib.rgb(0, 0, 0),
        rotate: PDFLib.degrees(params.rotated ? 90 : 0)
    });

    if(!params.noBorder) drawRectangle(page, {
        x: coord.x,
        y: coord.y,
        width: size.w,
        height: -size.h,
        borderColor: PDFLib.rgb(0, 0, 0),
        borderWidth: params.borderWidth ?? (() => { console.error('no border width!'); return 0 })(),
    })
}

function drawDay(
    page, font, 
    day, dayI, 
    outerCoord, groupSize, 
    borderWidth,  innerBorderWidth, drawBorder, dowOnTop
) {
    const borderOffset = (drawBorder 
        ? Math.max(0, borderWidth - innerBorderWidth)
        : borderWidth + innerBorderWidth) -1/*? border is drawn 1px less than it should ?*/;
    let x = outerCoord.x + borderOffset * 0.5;
    let y = outerCoord.y - borderOffset * 0.5;
    let w = groupSize.w - borderOffset;
    const rowsCount = day.length + (dowOnTop ? 1 : 0);
    const fullH = groupSize.h * rowsCount - borderOffset;
    const h = groupSize.h - borderOffset / rowsCount;
    const addColWidth = w*0.1

    const text = daysOfWeek[dayI]
    if(dowOnTop) {
        const size = { w, h }
        drawTextWidthinBounds(text, page, font, { x, y }, size, { borderWidth: innerBorderWidth })
        y -= size.h
    }
    else {
        const size = { w: addColWidth, h : fullH }
        drawTextWidthinBounds(text, page, font, { x, y }, size, { rotated: true, borderWidth: innerBorderWidth })
        x += size.w
        w -= addColWidth
    }

    const size = { w, h }
    for(let i = 0; i < day.length; i++) {
        drawLesson(day[i], page, font, { x: x, y: y - i*h }, size, addColWidth, innerBorderWidth);
    }

    if(drawBorder) drawRectangle(page, {
        x: outerCoord.x,
        y: outerCoord.y,
        width: groupSize.w,
        height: -groupSize.h * rowsCount,
        borderColor: PDFLib.rgb(0, 0, 0),
        borderWidth: borderWidth,
    })
}

async function renderPDF(doc, width, type = 'image/png', quality = 1) {
    const pdfTask = pdfjsLib.getDocument(doc); try {
    const pdf = await pdfTask.promise
    const page = await pdf.getPage(1)

    const m1 = (num) => { if(num > 1 && num < Infinity) return num; else return 1 }
    const viewport = page.getViewport({ scale: m1(width) / page.getViewport({scale:1}).width })

    const canvas = new OffscreenCanvas(
        m1(Math.floor(viewport.width)),
        m1(Math.floor(viewport.height))
    )
    const context = canvas.getContext("2d");

    const renderContext = {
        canvasContext: context,
        transform: null, viewport,
    };
    
    await page.render(renderContext).promise;

    return await canvas.convertToBlob({ type, quality });
    } finally { await pdfTask.destroy() }
}

async function getDocument() {
    const pdfDoc = await PDFLib.PDFDocument.create() /*
        we can't reuse the document and glyph cache because of 
        library issue: https://github.com/Hopding/pdf-lib/issues/1492
    */
    pdfDoc.registerFontkit(window.fontkit)

    const font = await pdfDoc.embedFont(await fontPromise, {subset:true});

    font.embedder.__descenderAtHeight = function(size, options) {
        if (options === void 0) { options = {}; }
        var _a = options.descender, descender = _a === void 0 ? true : _a;
        var _b = this.font, ascent = _b.ascent, descent = _b.descent, bbox = _b.bbox;
        var yTop = (ascent || bbox.maxY) * this.scale;
        var yBottom = (descent || bbox.minY) * this.scale;
        var height = yTop - yBottom;
        if (!descender)
            height -= Math.abs(descent) || 0;
        return yBottom/1000 * size;
    }

    return [pdfDoc, font]
}


//border factor is used inaccurately, but the difference should not be that big
async function scheduleToPDF(schedule, origPattern, rowRatio, borderFactor, drawBorder, dowOnTop) {
    const colWidth = 500
    const renderPattern = []

    const rowHeight = colWidth * rowRatio;
    const borderWidth = colWidth * borderFactor;
    const innerBorderWidth = colWidth * 2/500;

    const signatureHeight = 40, signaturePadding = 4;
    const signatureHeightFull = borderWidth*0.5 + signatureHeight + signaturePadding*2;

    let maxRows = 0;
    let firstRows = Infinity, lastRows = 0;
    for(let i = 0; i < origPattern.length; i++) {
        const newCol = []
        lastRows = 0;
        for(let j = 0; j < origPattern[i].length; j++) {
            const index = origPattern[i][j];
            if(index === -1) continue;
            const day = schedule[index];
            if(!day || !day.length) continue;

            lastRows += day.length;
            newCol.push(index)
        }
        if(dowOnTop) lastRows += newCol.length;

        if(firstRows === Infinity) firstRows = lastRows;
        if(lastRows > maxRows) maxRows = lastRows;
        if(newCol.length) renderPattern.push(newCol)
    }

    const rowMaxHeight = maxRows * rowHeight;
    const heightIfSignFirst = Math.max(rowMaxHeight, firstRows * rowHeight + signatureHeightFull);
    const heightIfSignLast  = Math.max(rowMaxHeight, lastRows  * rowHeight + signatureHeightFull);

    const pageHeight = Math.min(heightIfSignFirst, heightIfSignLast);
    const signFirst  = heightIfSignFirst < heightIfSignLast;
    const pageSize = [colWidth * renderPattern.length, pageHeight]
    const groupSize = { w: colWidth, h: colWidth * rowRatio };

    const ch = (num) => !(num >= 1 && num < Infinity)
    if(ch(pageSize[0]) || ch(pageSize[1])) {
        const [pdfDoc, font] = await getDocument()
        const page = pdfDoc.addPage([1, 1])
        return [1, await pdfDoc.save()] //no signature
    }

    const [pdfDoc, font] = await getDocument()
    const page = pdfDoc.addPage(pageSize)

    for(let i = 0; i < renderPattern.length; i++) {
        let curY = pageSize[1];
    
        for(let j = 0; j < renderPattern[i].length; j++) { 
            const index = renderPattern[i][j];
            if(index == undefined || schedule[index] == undefined) continue;
            drawDay(
                page, font, 
                schedule[index], index, 
                { x: i*groupSize.w, y: curY }, groupSize, 
                borderWidth, innerBorderWidth, drawBorder, dowOnTop
            );
            curY = curY - groupSize.h * (schedule[index].length + (dowOnTop ? 1 : 0));
        }
    }

    const signX = signFirst ? signaturePadding : pageSize[0] - colWidth*0.8 - signaturePadding;
    const alignRight = !signFirst;
    const alignLeft = signFirst;

    drawTextWidthinBounds(
        'vanaigr.github.io', page, font, 
        { x: signX, y: signatureHeight + signaturePadding }, 
        { w: colWidth*0.8, h: signatureHeight }, 
        { alignRight, alignLeft, noBorder: true, padding: 0, backgroundColor: PDFLib.rgb(1, 1, 1) }
    )

    return [pageSize[0], await pdfDoc.save()];
}

function readScheduleScheme(str) {
    const dowa = daysOfWeekShortenedLower
    const texts = str.split('\n')

    const scheme = []
    function appS(row, col, day) {
        while(scheme.length <= col) scheme.push([])
        const c = scheme[col]
        while(c.length <= row) c.push(undefined)
        c[row] = day
    }

    for(let i = 0; i < texts.length; i++) {
        const line = texts[i].trimEnd()
        const count = Math.floor(line.length+1)/3
        if(count*3-1 !== line.length) throw ['Неправильная строка расположения дней: `' + line + '`', '[строка] = ' + i + '/' + texts.length]

        for(let j = 0; j < count; j++) {
            const sp = j*3;
            const p = line.substring(sp, sp+2).toLowerCase()

            if(p.trim() === '');
            else {
                let found = false;
                for(let k = 0; k < dowa.length; k++) {
                    if(dowa[k] === p) {
                        found = true;
                        appS(i, j, k)
                        break
                    }
                }
                if(!found) throw ['Неправильный день недели `' + p + '`  в строке: `' + line + '` на ' + (sp+1) + ':' +  i]
            }
        }
    }

    return scheme
}

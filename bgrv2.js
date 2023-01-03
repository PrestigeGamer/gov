let laws = {}
const config = {
    'defaultLawBook': 'StGB'
}

async function init() {
    let calculatorWindow = document.querySelector('.bgr__wrapper')
    await fetch('./laws.json')
        .then(response => {
            return response.json();
        })
        .then(data => laws = data);
    loadNavigation(calculatorWindow)
    loadContent(calculatorWindow)
    initializeInfo(calculatorWindow)
    unselectButtonListener(calculatorWindow)
    clickRowListener(calculatorWindow)
    copyTextToClipboardListener(calculatorWindow)
    onAddTimeButtonClick(calculatorWindow)
    onSearchClick(calculatorWindow)
    drawWanteds(calculatorWindow)
    onNavItemClick(calculatorWindow)
}

function clickRowListener(calculatorWindow) {
    calculatorWindow.querySelectorAll('.table__row').forEach(function (el) {
        el.addEventListener('click', function () {
            if (el.querySelector('input:checked')) {
                el.classList.toggle('active')
            } else {
                el.classList.toggle('active')
            }
            updateInfos(calculatorWindow)
        })
    })
}

function updateInfos(calculatorWindow, setCurrentTime = false) {

    let calculatedPenalty = getPenaltyAndParagraphs(calculatorWindow)

    if (calculatedPenalty['penalty'] <= 500000) {
        calculatorWindow.querySelector('.bgr__infos__penalty output').innerText = calculatedPenalty['penalty']
    } else {
        calculatorWindow.querySelector('.bgr__infos__penalty output').innerText = 500000
    }

    let wantedsToDraw = 0
    let wantedsHtml = ''
    if (calculatedPenalty['wanteds'] <= 5) {
        wantedsToDraw = calculatedPenalty['wanteds']
    } else {
        wantedsToDraw = 5
    }

    for (let i = 0; i < wantedsToDraw; i++) {
        wantedsHtml += '&#11088;'
    }
    calculatorWindow.querySelector('.bgr__infos__wanteds output').innerHTML = wantedsHtml

    let wantedText = calculatedPenalty['paragraphs'] + getCurrentDate()
    if (calculatorWindow.querySelector('.bgr__infos__time input').checked || setCurrentTime) {
        wantedText += ' '+ getCurrentTime() + ' Uhr'
    }
    calculatorWindow.querySelector('.bgr__infos__text output').innerText = wantedText
    if (calculatedPenalty["lawyerNeeded"] && calculatedPenalty['fibNeeded']) {
        calculatorWindow.querySelector('.bgr__infos__notice').innerHTML = 'ACHTUNG! Übergabe an Staatsanwalt und FIB.'
    } else if (calculatedPenalty["lawyerNeeded"]) {
        calculatorWindow.querySelector('.bgr__infos__notice').innerHTML = 'ACHTUNG! Übergabe an Staatsanwalt.'
    } else if (calculatedPenalty["fibNeeded"]) {
        calculatorWindow.querySelector('.bgr__infos__notice').innerHTML = 'ACHTUNG! Übergabe an FIB.'
    } else {
        calculatorWindow.querySelector('.bgr__infos__notice').innerHTML = ''
    }
}

function drawWanteds(calculatorWindow) {
    calculatorWindow.querySelectorAll('.bgr__table__content .table__item.wanted').forEach(function (el) {
        let wantedsHtml = ''
        if (el.getAttribute('data-wanteds') === '-1' || el.getAttribute('data-wanteds') > 5) {
            wantedsHtml = 'nach Sachlage'
        }
        if (el.getAttribute('data-wanteds') <= 5) {
            for (let i = 0; i < el.getAttribute('data-wanteds'); i++) {
                wantedsHtml += '&#11088;'
            }
        }
        el.innerHTML = wantedsHtml
    })
    calculatorWindow.querySelectorAll('.bgr__list__entry .penalty').forEach(function (el) {
        if (el.innerHTML === '-1') {
            el.innerHTML = 'nach Sachlage'
            el.setAttribute('class', 'penalty noMoney')
        }
    })
}

function getPenaltyAndParagraphs(calculatorWindow) {
    let lawBook = calculatorWindow.querySelectorAll('.bgr__table__content')
    let penalty = 0
    let wanteds = 0
    let paragraphs = ''
    let lawyerNeeded = false
    let fibNeeded = false

    lawBook.forEach(function (el) {
        let checkedEntries = el.querySelectorAll('.table__row.active')

        if (checkedEntries.length > 0) {
            paragraphs += el.getAttribute('id') + ' '
        }

        checkedEntries.forEach(function (el) {
            let elementPenalty = parseInt(el.querySelector('.penalty').innerHTML)
            let elementWanteds = parseInt(el.querySelector('.wanted').getAttribute('data-wanteds'))
            console.log(parseInt(el.querySelector('.wanted').getAttribute('data-wanteds')))
            if (!isNaN(elementPenalty)) {
                penalty += elementPenalty
            }
            if (!isNaN(elementPenalty)) {
                wanteds += elementWanteds
            }
            paragraphs += el.querySelector('.paragraph').innerHTML.trim() + ' '
            if (el.getAttribute('data-lawyer')) {
                lawyerNeeded = true
            }
            if (el.getAttribute('data-fib')) {
                fibNeeded = true
            }
        })
    })
    console.log(lawyerNeeded, fibNeeded)
    return {
        'penalty': penalty,
        'wanteds': wanteds,
        'paragraphs': paragraphs,
        'lawyerNeeded': lawyerNeeded,
        'fibNeeded': fibNeeded
    }
}

function initializeInfo(calculatorWindow) {
    calculatorWindow.querySelector('.bgr__infos__penalty output').innerText = 0
    calculatorWindow.querySelector('.bgr__infos__text output').innerText = getCurrentDate()
}

function getCurrentDate() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    return dd + '.' + mm + '.' + yyyy
}

function getCurrentTime() {
    let today = new Date();
    let hh = String(today.getHours()).padStart(2, '0');
    let mm = String(today.getMinutes()).padStart(2, '0'); //January is 0!

    return hh + ':' + mm
}

function unselectButtonListener(calculatorWindow) {
    calculatorWindow.querySelector('.bgr__unselect').addEventListener('click', function () {
        calculatorWindow.querySelectorAll('.table__row.active').forEach(function (el) {
            el.classList.toggle('active')
            updateInfos(calculatorWindow)
        })
    })
}

function copyTextToClipboardListener(calculatorWindow) {
    let isBusy = false
    calculatorWindow.querySelector('.bgr__infos__text output').addEventListener('click', function () {
        if (!isBusy) {
            isBusy = true
            navigator.clipboard.writeText(this.innerText)
            let notification = calculatorWindow.querySelector('.bgr__copy__notification')
            notification.style.top = '-20px'
            setTimeout(function () {
                notification.style.top = '-80px'
                isBusy = false
            }, 1500)
        }
    })
}

function onAddTimeButtonClick(calculatorWindow) {
    calculatorWindow.querySelector('.bgr__infos__time input').addEventListener('click', function (e) {
        let setCurrentTime = setInterval(function () {
            if (!e.target.checked) {
                clearTimeout(setCurrentTime)
                return
            }
            updateInfos(calculatorWindow, true)
        }, 5000)
        updateInfos(calculatorWindow)
    })
}

function onSearchClick(calculatorWindow) {
    calculatorWindow.querySelector('.bgr__searchbar input[type="text"]').addEventListener('input', function () {
        getSearchResults(calculatorWindow)
    })
}

function getSearchResults(calculatorWindow) {
    let entries = calculatorWindow.querySelectorAll('.table__row') || []

    entries.forEach(function (entry) {
        let searchTerm = calculatorWindow.querySelector('.bgr__searchbar input[type="text"]').value.toLowerCase()
        entry.classList.remove('hidden')
        if (entry.querySelector('.table__item.paragraph').innerHTML.toLowerCase().includes(searchTerm, -2) || entry.querySelector('.table__item.text').innerHTML.toLowerCase().includes(searchTerm, -2)) return;

        entry.classList.toggle('hidden')
    })
}

function loadNavigation(calculatorWindow) {
    Object.keys(laws).forEach(function (name) {
        calculatorWindow.querySelector('.bgr__table__nav').innerHTML += `<div class="nav__item">${name}</div>`
    })
}

function loadContent(calculatorWindow) {
    Object.keys(laws).forEach(function (key) {
        let bookMarkup = `<div class="bgr__table__content hidden" id="${key}">`
        laws[key]['paragraphs'].forEach(function (data) {
            bookMarkup += `
            <div class="table__row" data-lawyer="${data['lawyer']}" data-fib="${data['fib']}">
                <div class="table__item paragraph">
                    ${data['paragraph']}
                </div>
                <div class="table__item text">
                    ${data['text']}
                </div>
                <div class="table__item info">
                    ${data['info']}
                </div>
                <div class="table__item exclusion">
                    ${data['exclusion']}
                </div>
                <div class="table__item penalty">
                    ${data['penalty']}
                </div>
                <div class="table__item wanted" data-wanteds="${data['wanted']}">
                </div>
                <input type="checkbox" class="hidden">
            </div>`
        })
        bookMarkup += `</div>`
        calculatorWindow.querySelector('.bgr__table').innerHTML += bookMarkup;
    })
}

function onNavItemClick(calculatorWindow) {
    let defaultLawBook = calculatorWindow.querySelector(`.bgr__table__content#${config.defaultLawBook}`)
    let navbar = calculatorWindow.querySelector('.bgr__table__nav')
    let link = calculatorWindow.querySelector('.bgr__table__link')
    defaultLawBook.classList.toggle('hidden')

    navbar.querySelectorAll('.nav__item').forEach(function (navItem) {
        if (navItem.innerHTML !== config.defaultLawBook) return
        navItem.classList.toggle('active')
        link.href = laws[config.defaultLawBook]['link']
    })

    calculatorWindow.querySelectorAll('.bgr__table__nav .nav__item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            let activeItem = navbar.querySelector('.active')
            calculatorWindow.querySelector(`.bgr__table__content#${activeItem.innerText}`).classList.toggle('hidden')
            activeItem.classList.toggle('active')
            e.target.classList.toggle('active')
            calculatorWindow.querySelector(`.bgr__table__content#${e.target.innerText}`).classList.toggle('hidden')
            link.href = laws[e.target.innerText]['link']
        })
    })

}
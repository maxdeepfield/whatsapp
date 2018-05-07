const { app, BrowserWindow, Tray, Menu } = require('electron')
const path = require('path')
const url = require('url')

const iconGreen = path.join(__dirname, 'icon.ico')
const iconBlack = path.join(__dirname, 'black.ico')

let window
let notifyTimer
let notifyIconIsBlack = false

function start() {
    window = new BrowserWindow({ 
        width: 1200, 
        height: 750, 
        icon: iconGreen, 
        title: 'WhatsApp' 
    })

    window.loadURL('https://web.whatsapp.com/')

    window.on('page-title-updated', function (e, title) {
        if (title !== 'WhatsApp') {
            icon.setImage(iconBlack)
            if (notifyTimer) {
                clearInterval(notifyTimer)
            }
            notifyTimer = setInterval(function () {
                icon.setImage(notifyIconIsBlack ? iconBlack : iconGreen)
                notifyIconIsBlack = !notifyIconIsBlack
            }, 1000)
        } else {
            icon.setImage(iconGreen)
            if (notifyTimer) {
                clearInterval(notifyTimer)
            }
        }
    })

    window.on('show', function () {
        icon.setHighlightMode('always')
    })

    window.on('minimize', function (event) {
        event.preventDefault()
        window.minimize()
    })

    window.on('close', function (event) {
        event.preventDefault()
        window.hide()
        return false
    })

    window.on('closed', function () {
        app.quit()
    })

    var menu = Menu.buildFromTemplate([
        {
            label: 'WhatsApp',
            click: function () {
                window.show()
            }
        },
        {
            label: 'Exit',
            click: function () {
                app.exit()
            }
        }
    ])

    var icon = new Tray(iconGreen)
    icon.setToolTip('WhatsApp');
    icon.setContextMenu(menu)
    icon.on('double-click', function () {
        window.show()
    })
}

app.on('ready', start)
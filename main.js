const {app, BrowserWindow, Tray, Menu} = require('electron');
const path = require('path');

const iconGreen = path.join(__dirname, 'icon.ico');
const iconBlack = path.join(__dirname, 'black.ico');

let win;
let notifyTimer;
let notifyIconIsBlack = false;

function start() {
    win = new BrowserWindow({
        width: 950,
        height: 600,
        icon: iconGreen,
        title: 'WhatsApp',
        visible: true,
        webPreferences: {
            nodeIntegration: true,
            partition: "persist:main",
            webSecurity: false
        }
    });

    win.webContents.setUserAgent(win.webContents.getUserAgent().replace(/(Electron|Chrome)\/([0-9\.]+)\ /g, ""));
    win.loadURL('https://web.whatsapp.com/', {userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'});

    win.webContents.on('did-finish-load', function () {
        win.webContents.executeJavaScript(`
            window.navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                    registration.unregister();
                }
            });
            const titleEl = document.querySelector('.window-title');
            if (titleEl && titleEl.innerHTML.includes('Google Chrome 36+')) {
                window.location.reload();
            }
        `);
    });

    win.on('closed', () => {
        win = null;
    });

    win.on('page-title-updated', function (e, title) {
        if (title !== 'WhatsApp') {
            icon.setImage(iconBlack);
            if (notifyTimer) {
                clearInterval(notifyTimer);
            }
            notifyTimer = setInterval(function () {
                icon.setImage(notifyIconIsBlack ? iconBlack : iconGreen);
                notifyIconIsBlack = !notifyIconIsBlack;
            }, 1000)
        } else {
            icon.setImage(iconGreen);
            if (notifyTimer) {
                clearInterval(notifyTimer);
            }
        }
    });

    win.on('show', function () {
        icon.setHighlightMode('always');
    });

    win.on('minimize', function (event) {
        event.preventDefault();
        win.minimize();
    });

    win.on('close', function (event) {
        event.preventDefault();
        win.hide();
        return false
    });

    win.on('closed', function () {
        app.quit()
    });

    const menu = Menu.buildFromTemplate([
        {
            label: 'WhatsApp',
            click: function () {
                win.show()
            }
        },
        {
            label: 'Exit',
            click: function () {
                app.exit()
            }
        }
    ]);

    const icon = new Tray(iconGreen);
    icon.setToolTip('WhatsApp');
    icon.setContextMenu(menu);
    icon.on('double-click', function () {
        win.show();
    });
}

app.on('ready', start);
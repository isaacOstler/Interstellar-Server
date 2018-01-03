var fs = require("fs");
var jsonfile = require('jsonfile');
var archiver = require('archiver');
var mkdirp = require('mkdirp');
var colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

const themesFolder = './themes/',
    cardsFolder = './cards/'

var cards = [],
    themes = []; //themes are compressed public folders

module.exports.getThemeFolderName = function(){
	return themesFolder;
}

module.exports.getThemeFiles = function(themeName, callback) {
    var path;
    for (var i = 0; i < themes.length; i++) {
        if (themes[i].themeInfo.themeName == themeName) {
            path = "./" + themes[i].compressedPath;
            break;
        }
    }
    if (!path) {
        var message = "Theme " + themeName + " couldn't be found!";
        console.log(message.error);
        return;
    }
    fs.readFile(path, function read(err, data) {
        if (err) {
            console.log("\n\nERROR [cardManager.js getThemeFiles]\n".error.bold + err.error + "\nERROR [cardManager.js getThemeFiles]\n\n".error.bold);
            throw err;
        }
        callback(data);
    });
}

module.exports.serveCard = function(cardName, callbackFunction) {
    var path;
    for (var i = 0; i < cards.length; i++) {
        if (cards[i].cardInfo.cardName == cardName) {
            path = "./" + cards[i].compressedPath;
            break;
        }
    }
    if (cardName == "viewscreen") {
        path = "./compressedCards/viewscreen";
    }
    if (!path) {
        console.log("Widget " + cardName + " couldn't be found!");
        return;
    }
    fs.readFile(path, function read(err, data) {
        if (err) {
            throw err;
        }
        callbackFunction(data);
    });
}
module.exports.cards = cards;
module.exports.getCards = function() {
    return cards;
}
module.exports.init = function(rebuildCards,rebuildThemes,callback){
	indexCards(rebuildCards,function(){
		indexThemes(rebuildThemes,callback);
	});
}

module.exports.getMenu = function(callback) {
    var path;
    for (var i = 0; i < cards.length; i++) {
        if (cards[i].cardInfo.cardName == "menu") {
            path = "./" + cards[i].compressedPath;
            break;
        }
    }
    if (!path) {
        console.log("Menu couldn't be found!");
        return;
    }
    fs.readFile(path, function read(err, data) {
        if (err) {
            throw err;
        }
        callback(data);
    });
}

function indexCards(rebuildCards, callback) {
    if (rebuildCards == false) {
        console.log("[" + "CARD MANAGER".blue + "] INDEXING ALL CARDS AND WIDGETS FOUND\n====================================")
        fs.readdir(cardsFolder, (err, files) => {
            files.forEach(file => {
                var cardPath = cardsFolder + file;
                if (fs.lstatSync(cardPath).isDirectory()) {
                    jsonfile.readFile(cardPath + "/cardInfo", function(err, obj) {
                        console.log("[" + "CARD MANAGER".blue + "] [" + "INDEXED".green + "] [" + obj.cardType.toString().input + "] " + obj.cardName.toString().bold + " at path '" + cardPath + "'");
                        cards.splice(cards.length, 0, {
                            "path": cardPath,
                            "compressedPath": "compressedCards/" + file,
                            "cardInfo": obj
                        });
                        if (cards.length == files.length - 1) {
                            callback();
                        }
                    });
                }
            });
        });
        callback();
        return;
    }
    mkdirp('./compressedCards/', function(err) {
        console.log("[" + "CARD MANAGER".blue + "] INDEXING ALL CARDS AND WIDGETS FOUND\n====================================")
        fs.readdir(cardsFolder, (err, files) => {
            files.forEach(file => {
                var cardPath = cardsFolder + file;
                if (fs.lstatSync(cardPath).isDirectory()) {
                    jsonfile.readFile(cardPath + "/cardInfo", function(err, obj) {
                        compressDirectory(cardPath, "compressedCards/" + file, function() {
                            console.log("[" + "CARD MANAGER".blue + "] [" + "INDEXED".green + "] [" + obj.cardType.toString().input + "] " + obj.cardName.toString().bold + " at path '" + cardPath + "'");
                            cards.splice(cards.length, 0, {
                                "path": cardPath,
                                "compressedPath": "compressedCards/" + file,
                                "cardInfo": obj
                            });
                            if (cards.length == files.length - 1) {
                                callback();
                            }
                        })
                    });
                }
            });
        });
    });
}

function indexThemes(rebuildThemes, callback) {
    if (rebuildThemes == false) {
        console.log("[" + "CARD MANAGER".blue + "] INDEXING ALL THEMES FOUND\n====================================".info);
        fs.readdir(themesFolder, (err, files) => {
            files.forEach(file => {
                var themePath = themesFolder + file;
                if (fs.lstatSync(themePath).isDirectory()) {
                    jsonfile.readFile(themePath + "/theme.json", function(err, obj) {
                        console.log("[" + "CARD MANAGER".blue + "] [" + "INDEXED".green + "] " + obj.themeName.toString().bold + " at path '" + themePath + "'");
                        themes.splice(themes.length, 0, {
                            "themeName": obj.themeName,
                            "path": themePath,
                            "compressedPath": "compressedThemes/" + file,
                            "themeInfo": obj
                        });
                        if (themes.length == themes.length - 1) {
                            callback();
                        }
                    });
                }
            });
        });
        callback();
        return;
    }
    mkdirp('./compressedThemes/', function(err) {
        console.log("\n====================================\n[" + "CARD MANAGER".blue + "] INDEXING ALL THEMES FOUND\n====================================")
        fs.readdir(themesFolder, (err, files) => {
            files.forEach(file => {
            	if(file == ".DS_Store"){
            		return;//don't compress this file, it's useless
            	}
                var themePath = themesFolder + file;
                if (fs.lstatSync(themePath).isDirectory()) {
                    jsonfile.readFile(themePath + "/theme.json", function(err, obj) {
                        compressDirectory(themePath, "compressedThemes/" + file, function() {
                            console.log("[" + "CARD MANAGER".blue + "] [" + "INDEXED".green + "] " + obj.themeName.toString().bold + " at path '" + themePath + "'");
                            themes.splice(themes.length, 0, {
                                "path": themePath,
                                "compressedPath": "compressedThemes/" + file,
                                "themeInfo": obj
                            });
                            if (themes.length == files.length - 1) {
                                callback();
                            }
                        })
                    });
                }
            });
        });
    });
}

function compressDirectory(filePath, targetName, callbackFunction) {
    var output = fs.createWriteStream(__dirname + "/" + targetName);

    var archive = archiver('zip', {
        store: true // Sets the compression method to STORE. 
    });
    // listen for all archive data to be written 


    var fileName = targetName;
    var fileOutput = fs.createWriteStream(fileName);

    fileOutput.on('close', function() {
        console.log("[" + "CARD MANAGER".blue + "] " + fileName + ' has been compressed... (' + (archive.pointer() / 1000000).toFixed(2) + 'MB)');
        callbackFunction();
    });

    archive.pipe(fileOutput);
    archive.glob(filePath + "/**"); //some glob pattern here]
    // add as many as you like
    archive.on('error', function(err) {
        console.log("[!] Encountered error compressing card...".error)
        throw err;
    });
    archive.finalize();
}
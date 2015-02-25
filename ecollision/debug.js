function toDegrees(ang) {
    return (ang / Math.PI) * 180;
}

function setCol(text, col) {
    return ("" + text).fontcolor(col);
}

function setColGreen(text) {
    return setCol(text, "green");
}

function dbgBool(bool) {
    if (bool)
        return setCol(""+bool, "green");
    else
        return setCol(""+bool, "red");
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function log(s) {
    console.log(s);
}
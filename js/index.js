var canvas = [], ctx = [], pixelArr = [], gradientCtx, gradientColor, gradientHue, colorMarker, gradientHueRect, gradientHueStart, gradientHueStartCtx;
var replace;

var kTrans, startColor, endColor;

document.addEventListener('DOMContentLoaded', function(){
    canvas[0]           = document.getElementById('photo');
    canvas[1]           = document.getElementById('fxPhoto');
    gradientHue         = document.getElementById('gradientHue');

    gradientHueStart    = document.getElementById('gradientHueStart');
    gradientHueStartCtx = gradientHueStart.getContext('2d');


    colorMarker = document.getElementById('colorMarker');

    (document.querySelector('input[name="replaceH"]')).onchange = changeInputVal;
    (document.querySelector('input[name="replaceS"]')).onchange = changeInputVal;
    (document.querySelector('input[name="replaceL"]')).onchange = changeInputVal;
    gradientHue.onmousedown = canvasMouseDown;

    ctx[0] = canvas[0].getContext('2d');
    ctx[1] = canvas[1].getContext('2d');

    gradientCtx = gradientHue.getContext('2d');

    loadImage("img/p2.jpeg"); 

    getReplaceState();
    getGrad();

    startColor = {
        r: 191,
        g: 101,
        b: 44
    };
    endColor = {
        r: 255,
        g: 255,
        b: 255
    };
    kTrans = {
        r: (startColor.r - endColor.r) / 255,
        g: (startColor.g - endColor.g) / 255,
        b: (startColor.b - endColor.b) / 255
    };
});

function changeInputVal(){
    getReplaceState();
    redraw();
}

function getReplaceState(){
    replace = {
        h: document.querySelector('input[name="replaceH"]:checked') != null,
        l: document.querySelector('input[name="replaceL"]:checked') != null,
        s: document.querySelector('input[name="replaceS"]:checked') != null
    }
}

function showStartGrad(){
    var gradient = gradientHueStartCtx.createLinearGradient(0, 0, gradientHueStart.width, 0);

    
    gradient.addColorStop(0, 'rgb('+startColor.r+','+startColor.g+','+startColor.b+')');
    gradient.addColorStop(1, 'rgb('+endColor.r+','+endColor.g+','+endColor.b+')');

    gradientHueStartCtx.fillStyle=gradient;
    gradientHueStartCtx.fillRect(0, 0, gradientHueStart.width, gradientHueStart.height);
}

function getGrad(){
    var gradient = gradientCtx.createLinearGradient(0, 0, gradientHue.width, 0);

    for (let h = 0; h <= 360; h++){
        let R, G, B, A;
        [R, G, B, A] = toRGB(h/360, 1, 0.5, 1);
        gradient.addColorStop(h/360, 'rgb('+R+','+G+','+B+')');
    }

    gradientCtx.fillStyle=gradient;
    gradientCtx.fillRect(0,0,gradientHue.width,gradientHue.height);
}

function loadImage(url){
    var img = new Image();
    img.src = url;
    img.onload = function() { 
        canvas[0].width = img.width;
        canvas[0].height = img.height;         
        
        canvas[1].width = img.width;
        canvas[1].height = img.height; 
        
        gradientHueStart.width = img.width * 2 + 26;
        gradientHueStart.height = 30;

        ctx[0].drawImage(img, 0, 0);
        showStartGrad(); 
        transformTo();
    };
}

function transformTo(){
    pixelArr[0] = ctx[0].getImageData(0, 0, canvas[0].width, canvas[0].height); 
    pixelArr[1] = pixelArr[0];

    for (let i = 0; i < pixelArr[1].data.length; i = i+4){
        let gray = (pixelArr[1].data[i] + pixelArr[1].data[i + 1] + pixelArr[1].data[i + 2]) / 3;

        pixelArr[1].data[i]   = Math.round(startColor.r - kTrans.r * gray);
        pixelArr[1].data[i+1] = Math.round(startColor.g - kTrans.g * gray);
        pixelArr[1].data[i+2] = Math.round(startColor.b - kTrans.b * gray);
    }

    ctx[1].putImageData(pixelArr[1], 0, 0);
}

function redraw(){
    let currR = parseInt(document.querySelector('input[name="red"]').value);
    let currG = parseInt(document.querySelector('input[name="green"]').value);
    let currB = parseInt(document.querySelector('input[name="blue"]').value);

    document.getElementById("targetColor").style.backgroundColor = '#'+(currR < 10 ? '0' + currR.toString(16): currR.toString(16))
                                                                      +(currG < 10 ? '0' + currG.toString(16): currG.toString(16))
                                                                      +(currB < 10 ? '0' + currB.toString(16): currB.toString(16));

    pixelArr[0] = ctx[0].getImageData(0, 0, canvas[0].width, canvas[0].height); 
    pixelArr[1] = pixelArr[0];

    var tH, tS, tL, tA;
    [tH, tS, tL, tA] = toHSL(
        currR,
        currG,
        currB,
        1
    );

    for (let i = 0; i < pixelArr[1].data.length; i = i+4){
        let H, S, L, A;
        [H, S, L, A] = toHSL(
            pixelArr[1].data[i],
            pixelArr[1].data[i+1],
            pixelArr[1].data[i+2],
            1
        );

        let R, G, B;
        [R, G, B, A] = toRGB(
            (replace.h) ? tH : H,
            (replace.s) ? tS : S,
            (replace.l) ? tL : L, 
            A
        );
        pixelArr[1].data[i]   = R;
        pixelArr[1].data[i+1] = G;
        pixelArr[1].data[i+2] = B;
    }

    ctx[1].putImageData(pixelArr[1], 0, 0);
}

function canvasMouseDown(e){
    gradientHueRect = gradientHue.getBoundingClientRect();
    colorMarker.style.display = 'block';
    colorMarker.style.left = (e.clientX - 5) + 'px'; 
    colorMarker.style.top = (gradientHueRect.top - 3) + 'px';
    pixel = gradientCtx.getImageData(e.clientX - gradientHueRect.left, 15, 1, 1); 
    document.querySelector('input[name="red"]').value = pixel.data[0];
    document.querySelector('input[name="green"]').value = pixel.data[1];
    document.querySelector('input[name="blue"]').value = pixel.data[2];

    redraw();
}

function toHSL(r, g, b, a){
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
    
        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
    
        return [h, s, l, a];
}

function toRGB(h, s, l, a){
    var r, g, b;

    if(s == 0){
        r = g = b = l;
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
}
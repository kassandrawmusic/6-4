//Kassandra W CMPO385 Major Assignment
//6 - 4: an interactive soundscape
//An exploration of and reflection on the Tiananmen Square Massacre

//brightness calibrated against a white wall in moderately bright artificial lighting from ceiling bulb 
//and lamp behind user to cast silhouette (works ok without this)


//scene variables
var previousMillis = 0;
var currentScene = 0;
var startGraphic;
var introGraphic;
var introBackground = 0;
var instrumentGraphic;
var outroGraphic;
var outroBackground = 240;
var endGraphic;

//mirror visuals variables
var video;
var vScale = 16; //decrease resolution for better performance
var brightSize;

//underlying grid for visuals and audio files variables
var gridSize;
var grid = []; //16 x 9 grid
var gridBrightAverage = [];

//brightness detection variables
var startBrightness = [];
var startBrightnessTotal;
var startBrightnessPrevious;
var bright;
var brightAverage;
var brightAverageOfEverything;
var impactTypeBoolean;
var impactTypeBooleanArray = [];

//impact variables and initialisation
var impactPoint = [];
var possibleHits = [];
var activeSpaces = [];
var swarm = [];
var force;

var hitImpact = new Tone.Player("./6_4Assets/hitImpact.mp3").toDestination();
var missImpact = new Tone.Player("./6_4Assets/missImpact.mp3").toDestination();


//oscillator variables and initialisation
var highOscBrightness, midOscBrightness, lowOscBrightness;

var ambOscHigh = new Tone.FatOscillator("C5", "sine", 1).toDestination().start();
var ambOscMid = new Tone.FatOscillator("C4", "sine", 1).toDestination().start();
var ambOscLow = new Tone.FatOscillator("C3", "sine", 1).toDestination().start();

ambOscHigh.volume.value = -30;
ambOscMid.volume.value = -25;
ambOscLow.volume.value = -20;

//intro and outro audio files
var introVoice = new Tone.Player("./6_4Assets/introVoice.mp3").toDestination();
var outroVoice = new Tone.Player("./6_4Assets/outroVoice.mp3").toDestination();
outroVoice.volume.value = 15;

//soundscape (pre-recorded audio) initialisation
var soundscape = [];

for (var i = 0; i < 56; i++) {
    if (i > 8 && i < 15) {
        soundscape[i] = 0;
    }
    else if (i > 16 && i < 23) {
        soundscape[i] = 0;
    }
    else if (i > 24 && i < 31) {
        soundscape[i] = 0;
    }
    else {
        soundscape[i] = new Tone.Player("./6_4Assets/" + i + ".mp3").toDestination();
    }
}

for (var i = 0; i < 56; i++) {
    if (soundscape[i] != 0) {
        soundscape[i].volume.value = -40;
        soundscape[i].loop = true;
    }
}

//font
function preload() {
    avenir = loadFont('./6_4Assets/avenirFont.otf');
}


function setup() {
    createCanvas(1600, 900);
    pixelDensity(1);

    video = createCapture(VIDEO);
    video.size(width / vScale, height / vScale); 
    video.hide();

    gridSize = createVector(width / 16, height / 9);

    //create and populate array of all possible grid positions
    var hitsIndex = 0;
    for (var y = 0; y < 9; y++) {
        for (var x = 0; x < 16; x++) {
            possibleHits[hitsIndex] = createVector(x * gridSize.x, y * gridSize.y);
            activeSpaces[hitsIndex] = [hitsIndex, (x * this.gridSize.x), (y * this.gridSize.y)];

            hitsIndex++;
        }
    }

    startGraphic = createGraphics(1600, 900);
    introGraphic = createGraphics(1600, 900, WEBGL);
    instrumentGraphic = createGraphics(1600, 900);
    outroGraphic = createGraphics(1600, 900, WEBGL);
    endGraphic = createGraphics(1600, 900);
}


function draw() {
    if (currentScene === 0) {
        //setup start scene, 6 - 4
        startGraphic.background(0);
        startGraphic.noStroke();
        startGraphic.fill(240);
        startGraphic.textSize(72);
        startGraphic.textAlign(CENTER);
        startGraphic.textFont(avenir);
        startGraphic.text("6 - 4", width / 2, height / 2);
        image(startGraphic, 0, 0);

        video.loadPixels();
        //find average brightness of webcam input, store brightness of each pixel in array
        for (var y = 0; y < video.height; y++) {
            for (var x = 0; x < video.width; x++) {
                var startIndex = ((video.width - x + 1) + y * video.width) * 4;
                var startR = video.pixels[startIndex + 0];
                var startG = video.pixels[startIndex + 1];
                var startB = video.pixels[startIndex + 2];

                startBrightness[startIndex] = (startR + startG + startB) / 3;
            }
        }

        //compare brightness of previous frame to current
        startBrightnessPrevious = startBrightnessTotal;
        startBrightnessTotal = 0;

        for (var i = 0; i < startBrightness.length; i++) {
            startBrightnessTotal = startBrightnessTotal + startBrightness[startIndex];
        }

        startBrightnessTotal = startBrightnessTotal / (video.width * video.height);

        //move to next scene if brightness changes (person moves into frame)
        if (abs(startBrightnessPrevious - startBrightnessTotal) > 100 && millis() - previousMillis > 2000) {
            previousMillis = millis();
            currentScene = 1;
            startGraphic.remove();
            introVoice.start(); //start intro voice over
        }
    }


    if (currentScene === 1) {
        //set up intro scene, abstract 3D mirror and voiceover
        introGraphic.background(introBackground);
        introGraphic.pixelDensity(1);

        video.loadPixels();
        //find brightness of each video pixel
        for (var y = 0; y < video.height; y++) {
            for (var x = 0; x < video.width; x++) {
                var introIndex = ((video.width - x + 1) + y * video.width) * 4;
                var r = video.pixels[introIndex + 0];
                var g = video.pixels[introIndex + 1];
                var b = video.pixels[introIndex + 2];

                //ellipse size decreases with brightness
                var introBright = (r + g + b) / 3;
                var introBrightSize = map(introBright, 0, 255, 1, 0) * 2;

                //smaller circles appear further away, swirly abstract feel
                var introDepth = map(introBrightSize, 0, 1, -100, 20);

                //draw circles 
                introGraphic.push();
                introGraphic.translate((x * vScale) - width, (y * vScale) - height, introDepth); 

                if (introBright > 1.8) {
                    introGraphic.noStroke();
                    introGraphic.fill(0);
                    introGraphic.ellipse(x * vScale, y * vScale, introBrightSize / 2 * vScale);
                }
                introGraphic.pop();
            }
        }

        image(introGraphic, 0, 0);

        //fade from black to instrument background grey
        if (introBackground < 240) {
            introBackground = introBackground + 2.5;
        }

        //move to next scene after 14 seconds
        if (millis() - previousMillis >= 14000) {
            previousMillis = millis();
            currentScene = 2;
            introGraphic.remove();
            //start populated soundscapes
            for (var i = 0; i < 56; i++) {
                if (soundscape[i] != 0) {
                    soundscape[i].start();
                }
            }
            introVoice.stop();
            brightnessOfEverything(); //checks brightness of each grid square
        }
    }

    if (currentScene === 2) {
        //instrument, no graphic
        background(240);

        video.loadPixels();

        //find brightness of each video pixel
        for (var y = 0; y < video.height; y++) {
            for (var x = 0; x < video.width; x++) {
                var index = ((video.width - x + 1) + y * video.width) * 4;
                var r = video.pixels[index + 0];
                var g = video.pixels[index + 1];
                var b = video.pixels[index + 2];

                bright = (r + g + b) / 3;

                //try cancel out some background shadow 'noise'
                if (bright < 180) {
                    brightSize = map(bright, 0, 255, 1, 0);
                }
                else {
                    brightsize = 0;
                }

                //draw as ellipses of corresponding sizes
                noStroke();
                fill(0);
                ellipse(x * vScale, y * vScale, brightSize * vScale);
            }
        }

        //randomly 'shoot' at pre-populated gridpoints
        //if the randomly picked grid square is dark (has person), then hit, otherwise miss
        for (var i = 0; i < impactPoint.length; i++) {
            if (impactTypeBooleanArray[i]) {
                //hitDisplay freezes that grid square
                impactPoint[i].hitDisplay();
            }
            else {
                //missDisplay emanates some ellipse shrapnel
                impactPoint[i].missDisplay();

                //create a swarm of black ellipses from misses
                for (var j = 0; j < swarm.length; j++) {
                    force = impactPoint[i].missRepel(swarm[j]);
                    swarm[j].applyForce(force);
                    swarm[j].updatePosition();
                    swarm[j].checkEdges();
                    swarm[j].display();

                    if (swarm[j].gone) {
                        swarm.splice(j, 1);
                    }
                }
            }
        }

        //every ten frames reassess video brightness
        if (frameCount % 10 === 0) {
            brightnessOfEverything(); //checks brightness of each grid square
            setSpread(); //sets frequency spread of main oscillators according to brightness

            //randomly generated impacts
            var impactPossibility = random(0, 1);

            //sets frequency/likelihood of a hit
            if (impactPossibility > 0.94 - (impactPoint.length / 95)) {
                var randomGridNumber = floor(random(0, activeSpaces.length));
                var newImpactPoint = impactPoint.length;

                //make new impact points and store their type status in array
                impactPoint.push(new ImpactPoint(activeSpaces[randomGridNumber][0], activeSpaces[randomGridNumber][1], activeSpaces[randomGridNumber][2], gridSize.x, gridSize.y, random(0, gridSize.x), random(0, gridSize.y)));
                impactTypeBooleanArray.push(impactPoint[newImpactPoint].impactType());

                //if in bright area (miss), make shrapnel swarm, play miss sound
                if (impactPoint[newImpactPoint].impactType() === false) {
                    missImpact.start();
                    for (var i = 0; i < 20; i++) {
                        swarm.push(new Swarm(impactPoint[newImpactPoint].missPosition.x, impactPoint[newImpactPoint].missPosition.y, random(0, gridSize.x), random(0, gridSize.y)));
                    }
                }

                //if in dark area (hit), play hit sound and mute audio file
                //reveals more subtle audio files, forces user to get closer to webcam for volume/more easily hit
                else {
                    hitImpact.start();
                    impactPoint[newImpactPoint].hitNoiseOsc();
                    if (randomGridNumber > 31) {
                        if (randomGridNumber % 2 === 0) {
                            soundscape[randomGridNumber / 2 - 16].mute = true;
                        }
                        else {
                            soundscape[(randomGridNumber - 1) / 2 - 16].mute = true;
                        }
                        activeSpaces.splice(randomGridNumber, 1);
                    }
                }
            }
        }

        //move to next scene after 80 hits
        if (impactPoint.length > 80) {
            previousMillis = millis();
            currentScene = 3;
            for (var i = 0; i < impactPoint.length; i++) {
                impactPoint[i].fadeNoiseOsc(); //start to fade white noise hits
            }
            for (var i = 0; i < 56; i++) {
                if (soundscape[i] != 0) {
                    soundscape[i].volume.rampTo(-100, 90); //start to fade remaining audio files
                }
            }
            outroVoice.start(); //start outro voice over
        }
    }


    if (currentScene === 3) {
        //set up outro scene, abstract 3D mirror and voiceover
        //same mechanism as introGraphic
        outroGraphic.background(outroBackground);
        outroGraphic.pixelDensity(1);

        video.loadPixels();

        for (var y = 0; y < video.height; y++) {
            for (var x = 0; x < video.width; x++) {
                var outroIndex = ((video.width - x + 1) + y * video.width) * 4;
                var r = video.pixels[outroIndex + 0];
                var g = video.pixels[outroIndex + 1];
                var b = video.pixels[outroIndex + 2];

                var outroBright = (r + g + b) / 3;
                var outroBrightSize = map(outroBright, 0, 255, 1, 0) * 2;
                var outroDepth = map(outroBrightSize, 0, 1, -100, 20);

                outroGraphic.push();
                outroGraphic.translate((x * vScale) - width, (y * vScale) - height, outroDepth);

                if (outroBright > 1.8) {
                    outroGraphic.noStroke();
                    outroGraphic.fill(0);
                    outroGraphic.ellipse(x * vScale, y * vScale, outroBrightSize / 2 * vScale);
                }
                outroGraphic.pop();
            }
        }

        image(outroGraphic, 0, 0);

        //fade to black
        if (outroBackground >= 0) {
            outroBackground = outroBackground - 0.7;
        }

        //move to next scene after 90 seconds
        if (millis() - previousMillis >= 90000) {
            previousMillis = millis();
            currentScene = 4;
            outroGraphic.remove();
            ambOscHigh.volume.rampTo(-100, 20);
            ambOscMid.volume.rampTo(-100, 5);
            ambOscLow.volume.rampTo(-100, 10);
        }
    }


    if (currentScene === 4) {
        //setup end scene, same as start scene
        endGraphic.background(0);
        endGraphic.noStroke();
        endGraphic.fill(240);
        endGraphic.textSize(72);
        endGraphic.textAlign(CENTER);
        endGraphic.textFont(avenir);
        endGraphic.text("6 - 4", width / 2, height / 2);
        image(endGraphic, 0, 0);
    }
}


////////////////FUNCTIONS///////////////////////


//sets frequency spread of the three main oscillators according to brightness
function setSpread() {
    ambOscHigh.spread = highOscBrightness / 40;
    ambOscMid.spread = midOscBrightness / 40;
    ambOscLow.spread = lowOscBrightness / 40;
}


//checks brightness of each grid square (takes into account darkness of missImpact visuals)
function brightnessOfEverything() {
    loadPixels();

    highOscBrightness = 0;
    midOscBrightness = 0;
    lowOscBrightness = 0;

    brightAverageOfEverything = 0;

    //checks brightness of pixels, one grid at a time
    for (var currentGrid = 0; currentGrid < 144; currentGrid++) {
        brightAverage = 0;
        for (var y = possibleHits[currentGrid].y; y < possibleHits[currentGrid].y + gridSize.y; y += 4) {
            for (var x = possibleHits[currentGrid].x; x < possibleHits[currentGrid].x + gridSize.x; x += 4) {
                var gridIndex = (x + y * width) * 4;
                var r = pixels[gridIndex + 0];
                var g = pixels[gridIndex + 1];
                var b = pixels[gridIndex + 2];

                brightAverage = brightAverage + ((r + g + b) / 3);
            }
        }
        brightAverage = brightAverage / (gridSize.x * gridSize.y / 16);
        gridBrightAverage[currentGrid] = brightAverage; //use this in impactPoint class, keeps things clearer

        //set volume of corresponding audio file if applicable
        setVolume(currentGrid, brightAverage);

        //determines brightness of grid squares relevant to main oscillators
        if (currentGrid > 51 && currentGrid < 60) {
            highOscBrightness += brightAverage;
        }
        else if (currentGrid > 67 && currentGrid < 76) {
            midOscBrightness += brightAverage;
        }
        else if (currentGrid < 83 && currentGrid < 92) {
            lowOscBrightness += brightAverage;
        }
    }
}


//sets volume of audio files to correspond with how dark its allocated grid square is
//allocation is determined by placement (lower sounds correspond with lower squares
//more 'interesting'/active sounds towards periphery, panned according to visual location etc.)

function setVolume(currentGrid, brightAverage) {
    if (currentGrid > 31 && currentGrid % 2 == 0) {
        var soundscapeNumber = currentGrid / 2 - 16;
        if (soundscape[soundscapeNumber] !== 0) {
            if (brightAverage < 150) {
                soundscape[soundscapeNumber].volume.rampTo(map(brightAverage, 0, 150, 50, -20), 0.3);
            }
            else {
                soundscape[soundscapeNumber].volume.rampTo(-35, 0.7);
            }
        }
    }
}


////////////////////CLASSES/////////////////////////


//randomly chosen grid square that is shot at
class ImpactPoint {
    constructor(randomGridNumber, x, y, gridSizeX, gridSizeY, offsetX, offsetY) {
        this.position = createVector(x, y);
        this.gridSize = createVector(gridSizeX, gridSizeY);
        this.mass = 20;
        this.missPosition = createVector(x + offsetX, y + offsetY);
        this.gridNumber = randomGridNumber;
        this.noiseOsc = new Tone.Noise("white");

    }

    //impact type returns whether square is light (miss) or dark (hit)
    impactType() {
        var specificBrightAverage = gridBrightAverage[this.gridNumber];

        if (specificBrightAverage > 150) {
            impactTypeBoolean = false;
        }
        else if (specificBrightAverage <= 150) {
            impactTypeBoolean = true;
        }
        return impactTypeBoolean;
    }

    //if hit, pixellate the square, eventually make this effect audio
    hitDisplay() {
        noStroke();
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 10; j++) {
                fill(random(0, 255));
                rect(this.position.x + i * (this.gridSize.x / 10), this.position.y + j * (this.gridSize.y / 10), this.gridSize.x / 10, this.gridSize.y / 10);
            }
        }
    }

    //plays panned white noise
    hitNoiseOsc() {
        var xpos = map(this.position.x, 0, width, -1, 1);
        var ypos = map(this.position.y, 0, height, -1, 1);
        var panner = new Tone.Panner3D(xpos, ypos, 0).toDestination();
        this.noiseOsc.volume.value = -30;
        this.noiseOsc.connect(panner).start("+0.4");
    }

    //fade during transition to outro scene
    fadeNoiseOsc() {
        this.noiseOsc.volume.rampTo(-100, 20);
    }

    //if miss, small black ellipse is left
    missDisplay() {
        noStroke();
        fill(0);
        ellipse(this.missPosition.x, this.missPosition.y, 20);
    }

    //if miss, some flying black ellipses emanate from impact point
    missRepel(swarm) {
        var force = p5.Vector.sub(this.missPosition, swarm.position);
        var distance = force.mag;

        var strength = (this.mass * swarm.mass) / (distance * distance);

        force.setMag(strength);
        force.mult(-1);
        return force;
    }
}


//small black ellipses that emanate from missed impacts
class Swarm {
    constructor(impactPositionX, impactPositionY, offsetX, offsetY) {
        this.position = createVector(impactPositionX, impactPositionY);
        this.velocity = createVector(random(-1, 1), random(-1, 1));
        this.acceleration = createVector(0, 0);
        this.mass = random(0.1, 2);
        this.gone = false;
    }

    checkEdges() {
        if (this.position.x < 0 || this.position.x > width || this.position.y < 0 || this.position.y > height) {
            this.gone = true;
        }
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    updatePosition() {
        this.velocity.add(this.acceleration);
        this.velocity.limit(10, 20);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    display() {
        noStroke();
        fill(0);
        ellipse(this.position.x, this.position.y, 10);
    }
}
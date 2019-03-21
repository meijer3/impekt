
class insight {
    classname: string
    minLiters: number
    maxLiters: number
    name: string
    direction: morpher.direction
    offset: number

    constructor(name, classname, min, max, direction, offset) {
        this.classname = classname;
        this.minLiters = min;
        this.maxLiters = max;
        this.name = name;
        this.direction = direction;
        this.offset = offset;
    }
    select(liters) {
        if (liters > this.minLiters && liters <= this.maxLiters) {
            return this;
        }
    }
    percentage(liters) {
        return (liters / this.maxLiters);
    }
}
function PrettyNumber(num) {
    let significance = 3;
    let strlen;
    let clean;
    let RNum;
    if (num == 0) {
        return '0';
    }
    if (num > 10) {
        strlen = (num.toFixed(0) + '').length;
        clean = Math.pow(10, strlen - significance);
        RNum = parseInt((num / clean).toFixed(0)) * clean;
        return RNum.toLocaleString('fr-EG');
    }
    else if (num > 1) {
        strlen = (num.toFixed(0) + '').length;
        clean = Math.pow(10, strlen - significance + 1);
        RNum = parseInt((num / clean).toFixed(1)) * clean;
        return RNum.toLocaleString('fr-EG');
    }
    else {
        num = num.toFixed(100);
        clean = Math.abs(Math.floor(Math.log10(num)));
        RNum = (num + '').substring(0, clean + 2 + 1);
        let value = RNum.substring(0, 4) + " " + RNum.substring(4).replace(/(.{2})/g, "$1");
        if (value.endsWith(" 0")) value = value.slice(0, -2);
        return value
    }
}
class morpher {
    insights: insight[] = []
    percentage: number = 0.5;
    svg: SVGElement
    mainGroup: SVGGElement
    volumaPath: SVGGElement
    clipPathElement: SVGGElement
    active: insight
    morphing: boolean = false;


    constructor(selectionSVG, selectionGroup, selectionVoluma, min, max) {



        this.svg = document.querySelector(selectionSVG);
        this.mainGroup = this.svg.querySelector(selectionGroup);
        this.volumaPath = this.mainGroup.querySelector(selectionVoluma);
        this.clipPathElement = this.svg.querySelector('clipPath path');



        document.querySelector('.controls input').addEventListener('input', (d) => {
            let el = (<any>d.target)

            function logslider(position) {
                var minp = 0;
                var maxp = 100;
                var minv = Math.log(min);
                var maxv = Math.log(max);
                var scale = (maxv - minv) / (maxp - minp);
                return Math.exp(minv + scale * (position - minp));
            }
            let value = logslider(el.value)// from 0 to 100  --> 0.01 to 20 000

            // Pick right object to show
            let insight = this.insights.filter((insight) => { return insight.select(value); })[0];
            this.percentage = insight.percentage(value);


            if (this.active == insight) { // Old object, just update
                this.updatePercentage();
            }
            else { // New Object
                this.active = insight;
                this.morph(this.active);
            }



            // create slider balloon
            var newPlace;
            let width = el.getBoundingClientRect().width
            let newPoint = (el.value - el.getAttribute("min")) / (el.getAttribute("max") - el.getAttribute("min"));
            let offset = -1;
            // Prevent bubble from going beyond left or right (unsupported browsers)
            if (newPoint < 0) { newPlace = 0; }
            else if (newPoint > 1) { newPlace = width; }
            else { newPlace = width * newPoint + offset; offset -= newPoint; }
            //console.log(newPlace, width, el)
            // Move bubble
            let outputTag = el.parentElement.querySelector('output')
            outputTag.style.left = (newPlace - 70) + "px";
            outputTag.style.marginLeft = offset + "%";
            outputTag.innerHTML = PrettyNumber(value) + ' liter <br>' + insight.name + ' ' + parseInt('' + this.percentage * 100) + '%'

            // Change title
            document.querySelector('#liters').innerHTML = ""+PrettyNumber(value)


        });


    }


    updatePercentage() {

        if (!this.morphing) { // Not during morphing

            let bbox = this.volumaPath.getBBox();
            let x = bbox.x;
            let y = bbox.y;
            let width = bbox.width;
            let height = bbox.height;
            let duration = 1200;
            //console.log('Morph to: ' + Math.round(this.percentage * 100) + '%', this.active.classname, reset);

            this.moveClip(duration, width, height)



        }

    }
    
    moveClip(duration, width, height) {
        if (this.active.direction == morpher.direction.horizontal) {
            this.clipPathElement.style.transition = duration + 'ms'
            this.clipPathElement.style.transform = 'translate(' + (width * this.percentage / this.active.offset) + 'px,' + 0 + 'px)'
        }
        if (this.active.direction == morpher.direction.vertical) {
            this.clipPathElement.style.transition = duration + 'ms'
            this.clipPathElement.style.transform = 'translate(' + 0 + 'px,' + -(height * this.percentage / this.active.offset) + 'px)'
        }
    }
    stopClip(duration) {

        if (this.clipPathElement) {
            this.clipPathElement.style.transition = duration + 's'
            this.clipPathElement.style.transform = 'translate(0px,0px)'


            this.clipPathElement.style.transform = 'translate(-5000px,5000px)'
            this.clipPathElement.style.transition = 'none'


        }
    }
    resetClip() {
        return new Promise((resolve) => {

            this.clipPathElement.style.transition = '1ms'
            this.clipPathElement.style.transform = 'translate(0px,0px)'

            let d = this.svg.querySelector('#' + this.active.classname + ' #clip').getAttribute('d');
            this.clipPathElement.setAttribute('d', d)

            let clipEvent = this.whichTransitionEvent();

            clipEvent && this.clipPathElement.addEventListener(clipEvent, () => {
                return resolve('clip')
            });
        })
    }
    morph(insight) {
        //console.clear()
        this.stopClip(1.5);
        let promises = [];
        this.morphing = true
        this.mainGroup.querySelectorAll('path').forEach((d) => {
            let pathID = d.getAttribute('id');
            let animate = true;

            if (pathID == 'volumaDark' || pathID == 'voluma' || pathID == 'clip') {
                animate = false;
            }

            promises.push(this.morphPath(insight, pathID, animate));

        });
        promises.push(this.resetClip())

        //console.log('promises', promises)
        Promise.all(promises).then(() => {
            this.morphing = false;
            this.updatePercentage();
        }).catch((e) => {
            console.error(e);
        });
    }

    morphPath(insight, pathID, animate) {
        let duration = animate ? 1.2 : 0;

        return new Promise((resolve) => {
            // Selecters
            let pathSelection = '#' + pathID;
            let targetSelection = '#' + insight.classname + ' #' + pathID;
            let path = this.mainGroup.querySelector(pathSelection);
            let d = this.svg.querySelector(targetSelection).getAttribute('d').split('  ').join();

            // If old path is the same resolve promise
            if (path.getAttribute('d') == d) {
                return resolve(pathID);
            }

            // Animated or not
            if (duration == 0) {
                (<any>path).style.transition = 'none'
                // console.log(pathID)
                path.setAttribute('d', d)
                return resolve(pathID);
            } else {
                (<any>path).style.transition = duration + 's'
                path.setAttribute('d', d)

                // Classic way to check if  css transition has passed
                var transitionEvent = this.whichTransitionEvent();
                transitionEvent && path.addEventListener(transitionEvent, function () {
                    return resolve(pathID);
                });
            }




        });

    }

    whichTransitionEvent() {
        var t;
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)); }


        var el = document.createElement('fakeelement' + text);
        var transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        }
        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }
}
module morpher {
    export enum direction {
        horizontal,
        vertical,
        diagonal
    }
}

let visual
document.addEventListener("DOMContentLoaded", function () {

    // Create visual
    visual = new morpher('svg#insight', 'g#Main', '#voluma', 0.01, 20000)

    // Add different objects
    visual.insights.push(new insight('Can', 'Cannetje', 0, 0.33, morpher.direction.vertical, 1.3));
    visual.insights.push(new insight('Bottle', 'Bottle', 0.33, 1.5, morpher.direction.vertical, 1));
    visual.insights.push(new insight('Bucket', 'Bucket', 1.5, 10, morpher.direction.vertical, 1));
    visual.insights.push(new insight('Barrol', 'Barrol', 10, 160, morpher.direction.vertical, 1.15));
    visual.insights.push(new insight('Trailer', 'Trailer', 160, 2500, morpher.direction.horizontal, 1));
    visual.insights.push(new insight('Tanker truck', 'Tank', 2500, 20000, morpher.direction.horizontal, 1));

    // Trigger Once to start value
    document.querySelector('.controls input').value = 95;
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("input", false, true);
    document.querySelector('.controls input').dispatchEvent(evt);

    // Morphing never happend, so manualy update once
    visual.morphing = false; 
    visual.updatePercentage()
});











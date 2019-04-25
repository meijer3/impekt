

class inputSlider {
    input: HTMLInputElement
    label: HTMLOutputElement
    rawvalue: number
    logvalue: number
    min: number
    max: number
    step: number
    label_flag

    constructor(form_id: string, min: number, max: number,  callback) {

        // Select right elements
        this.input = document.querySelector(form_id + " input")
        this.label = document.querySelector(form_id + " output")
        this.min = +min
        this.max = +max
        this.input.min = "0";
        this.input.max = "100";
        let linkname = form_id.replace("#",'') + "_link"
        this.input.name = linkname
        this.label.setAttribute("for", linkname)
        this.label.setAttribute("onforminput", "value = " + linkname + ".valueAsNumber" )

        this.input.addEventListener('input', () => {
            this.update(callback)
        })
        this.update(callback)
    }
    update(callback) {
        this.rawvalue = +this.input.value
        this.logvalue = this.logarithmic();
        var newPlace;
        let width = this.input.getBoundingClientRect().width;
        let newPoint = (this.rawvalue - this.min) / (this.max - this.min);
        let offset = -1;
        if (newPoint < 0) {
            newPlace = 0;
        }
        else if (newPoint > 1) {
            newPlace = width;
        }
        else {
            newPlace = width * newPoint + offset;
            offset -= newPoint;
        }
        this.label = this.input.parentElement.querySelector('output');
        this.label.style.left = (newPlace - 70) + "px";
        this.label.style.marginLeft = offset + "%";

        this.label.innerHTML = callback(this)
    }

    logarithmic() {
        var minv = Math.log(this.min);
        var maxv = Math.log(this.max);
        var scale = (maxv - minv) / (+this.input.max - +this.input.min);
        console.log(Math.log(this.min))
        return Math.exp(minv + scale * (+this.rawvalue - +this.input.min));
    }
}

let slider = new inputSlider('#mainslider', -100, 600, (data: inputSlider) => {
    return "" + data.rawvalue + "<br>" + data.logvalue + ""
})


// This Typescript is meant for Impekt Viewer 



function parseURLParams(url: string) {
    let queryStart = url.indexOf("?") + 1,
        queryEnd = url.indexOf("#") + 1 || url.length + 1,
        query = url.slice(queryStart, queryEnd - 1),
        pairs = query.replace(/\+/g, " ").split("&"),
        parms = {}, i, n, v, nv;

    if (query === url || query === "") return false;

    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);

        if (!parms.hasOwnProperty(n)) parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }

    return parms;

}

function toggleMenu(x) {
    x.parentNode.parentNode.classList.toggle("header-menu-open");
}

class UIlink {
    link: link
    UI: UI
    resource: resource;
    constructor(UI: UI, link:link) {
        this.UI = UI;
        this.link = link;
        this.addToTable();
        this.addToResource();
    }
    
    addToTable() {
        if (this.link.link_type == graph.typeOfLink.subimpekt) {
            let subimpekt = this.link.subimpact;
            let row = this.UI.elTable.append('tr')
                .attr('class', 'graph-UI-table-tr graph-UI-table-impact')
                .attr('title', 'drag me into the formula')

            // Add Dragable
            row.append('td')
                .attr('class', 'graph-UI-info-copy')
                .html(`<span data-type="` + graph.typeOfLink.subimpekt + `" data-name="` + subimpekt.short_code_name + `" data-drop='<hr class="graph-UI-input-tags" data-alias="` + subimpekt.short_code_name + `" data-value="` + this.link.link_uid + `">'>` + subimpekt.short_code_name + `</span>`)


            // symbol
            row.append('td')
                .style('background-image', "url('../img/symbol_impekt.png')")
                .attr('class', 'symbol')
                .style('margin', '9px 14px -9px 0px')
                .attr('title','This is an impekt')

            // title
            row.append('td')
                .html(subimpekt.title + ` (` + subimpekt.short_code_name + `)`)

            // Value + Unit
            row.append('td').attr('colspan', '2')
                .style('text-align', 'center')
            .html('-')

            // More Info
            row.append('td').append('a')
                .attr('href', '#' + this.link.link_alias)
                .attr('title', 'More information')
                .html('Info')

            // Nothing in Contollers
            row.append('td')
                .style('text-align', 'center')
                .html('-')

        }
        if (this.link.link_type == graph.typeOfLink.variable) {
            // Add variables to table
            let row = this.UI.elTable.append('tr')
                .attr('class', 'graph-UI-table-tr graph-UI-table-variable')
                .attr('title', 'drag me into the formula')

            // Add Dragable
            row.append('td')
                .attr('class', 'graph-UI-info-copy')
                .html(`<span data-type="` + this.link.variable.type + `" data-name="` + this.link.variable.short_code_name + `" data-drop='<hr class="graph-UI-input-tags" data-alias="` + this.link.variable.short_code_name + `" data-value="` + this.link.link_uid + `">'>` + this.link.variable.short_code_name + `</span>`)

            // symbol
            row.append('td')
                .style('background-image', "url('../img/symbol_variabele.png')")
                .attr('class', 'symbol')
                .style('margin', '9px 14px -9px 0px')
                .attr('title','This is a variable')

            // title
            row.append('td')
                .html(this.link.variable.title + ` (` + this.link.variable.short_code_name + `)`)

            // Value
            let update = row.append('td')
                .style('text-align', 'right')
                .style('padding-right', '5px')
                .style('width', '50px')
                .html(this.link.variable.value.toString())

            // Set in the update Array for onchange events
            this.link.variable.elUpdate.push(update);
            // Unit
            row.append('td')
                .html(this.link.variable.unit)

            row.append('td').append('a')
                .attr('href', '#' + this.link.link_alias)
                .attr('title', 'More information')
                .html('Info')

            // Add controlers
            if (this.link.link_advanced) {
                this.link.variable.addConrollers(row.append('td'), () => {this.UI.graph.update();}) // callback = values on change
            } else {
                row.append('td').html('Change above')
                    .style('text-align', 'center')
                this.link.variable.addConrollers(this.UI.graph.elControllers, () => {this.UI.graph.update();}) // callback = values on change
            }
            
        }
    }
    addToResource() {
        this.resource = new resource()
        this.resource.create(this.link, this.UI.elResource, this.UI.elIncl)
    }
}
class resource {
    elResource: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elResourceDiv: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elIncl: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elInclLink: d3.Selection<HTMLElement, {}, HTMLElement, any>
    link_type: graph.typeOfLink
    id: string
    alias: string

    // On create and delete
    create(oneLink: link, elResource, elIncl) {

        this.elResource = elResource;
        this.elIncl = elIncl;
        this.link_type = oneLink.link_type

        if (this.link_type === graph.typeOfLink.variable) {
            this.alias = oneLink.variable.short_code_name
            this.id = this.alias
            this.addResourceVariable(oneLink)
        }
        if (this.link_type === graph.typeOfLink.subimpekt) {
            this.alias = oneLink.subimpact.short_code_name
            this.id = this.alias
            this.addResourceImpekt(oneLink)
        }

        this.elResourceDiv.append('div').attr('class', 'resource-link_descr').html(oneLink.link_descr)


        this.addToIcl()
    }
    addResourceImpekt(oneLink: link) {
        this.elResourceDiv = this.elResource.append('div').attr('id', this.id).attr('class', 'resource resource-sub')

        this.elResourceDiv.append('div')
            .style('background-image', "url('../img/symbol_impekt.png')")
            .attr('class', 'symbol')
            .style('margin', '2px 0px -2px 0px')
            .style('position', 'absolute')
            .style('width', '30px')
            .style('height', '20px')
            .attr('title', 'This is an impekt')

        this.elResourceDiv.append('div').attr('class', 'resource-title').html(oneLink.subimpact.title)
        this.elResourceDiv.append('div').attr('class', 'resource-sub_title').html(oneLink.subimpact.sub_title)
        this.elResourceDiv.append('span').attr('class', 'resource-long_code_name').html(oneLink.subimpact.long_code_name)
            .attr('title', 'Long code name')
        this.elResourceDiv.append('span').attr('class', 'resource-short_code_name').html(oneLink.subimpact.short_code_name)
            .attr('title', 'Short code name')
        this.elResourceDiv.append('span').attr('class', 'resource-maingroup').html(oneLink.subimpact.maingroup)
            .attr('title', 'Group')
        this.elResourceDiv.append('span').attr('class', 'resource-subgroup').html(oneLink.subimpact.subgroup)
            .attr('title', 'Sub group')



    }
    addResourceVariable(oneLink: link) {
        this.elResourceDiv = this.elResource.append('div').attr('id', this.id).attr('class', 'resource resource-vari')


        this.elResourceDiv.append('div')
            .style('background-image', "url('../img/symbol_variabele.png')")
            .attr('class', 'symbol')
            .style('margin', '2px 0px -2px 0px')
            .style('position', 'absolute')
            .style('width', '30px')
            .style('height', '20px')
            .attr('title', 'This is a variable')



        this.elResourceDiv.append('div').attr('class', 'resource-title').html(oneLink.variable.title)
        this.elResourceDiv.append('div').attr('class', 'resource-sub_title').html(oneLink.variable.sub_title)
        this.elResourceDiv.append('span').attr('class', 'resource-long_code_name').html(oneLink.variable.long_code_name)
            .attr('title', 'Long code name')
        this.elResourceDiv.append('span').attr('class', 'resource-short_code_name').html(oneLink.variable.short_code_name)
            .attr('title', 'Short code name')
        this.elResourceDiv.append('span').attr('class', 'resource-maingroup').html(oneLink.variable.short_code_name)
            .attr('title', 'Group')
    }

    // Delete Resource
    remove() {
        this.elResourceDiv.remove()
    }


    // Add and remove from index
    addToIcl() {
        this.elInclLink = this.elIncl
            .append('a')
            .attr('href', "#" + this.id)
            .html(this.alias)
    }
    removeFromIcl() {
        this.elInclLink.remove();
    }
}
class UI {



    graph: graph
    title: string = ''
    subtitle: string = ''

    elUI: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elFormula: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elAdvanced: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elAdvancedError: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elAdvancedForm: d3.Selection<HTMLElement, {}, HTMLElement, any>[] = [];
    elInfo: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elTable: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elImpekt: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elResource: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elTitle: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elIncl: d3.Selection<HTMLElement, { }, HTMLElement, any >
    timeout: any
    simplified: boolean


    UIlinks: UIlink[] = [];


    constructor(graph) {
        this.graph = graph
        this.elUI = d3.select('#page').append('div').attr('class', 'graph-UI-group')
        this.elAdvanced = this.elUI.append('div').attr('class', 'graph-UI-advanced')
        this.elFormula = this.elUI.append('div').attr('class', 'graph-UI-formula')
        this.elImpekt = this.elUI.append('div').attr('class', 'graph-UI-impekt')
        this.elResource = this.elUI.append('div').attr('class', 'graph-UI-resource')

        // Including
        this.elResource.append('h4').html("Resources")
        this.elIncl = this.elResource.append('div').attr('class', 'graph-UI-resource-incl')
        this.elTitle = d3.select("#page").insert('h1', '.graph-graph').attr('class', 'graph-title')
    }     // Does nothing
    update() {


        this.setTitle();
        this.setSimplifiedMode(false);       // Set default mode: Simplified || Technical
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.createNormalFormula();
            this.addAdvanced();
            this.addAdvancedFormula();
            this.addMoreInformation();
            this.modeSimplified();
        }


        // Add links 
        this.graph.impekts.map((impekt) => {
            impekt.links.map((link) => {
                // Update Link to UILink
                this.UIlinks.push(new UIlink(this, link));
                this.makeTableRowDraggable();
            })
        })

    }               // Update UI
    decodeFormula() {
        //this.graph.errors(false);

        // Decode HR into normal formula like in de DB
        let newFormula: Iformula[] = []
        this.elAdvancedForm.map((formulaPart, k) => {

            let HRformula = formulaPart.html();
            //console.log('decodeFormula',HRformula)
            let technicalFormula: string = HRformula
                .replace(/  /g, ' ')
                .split(/(<hr.+?>+)/g)
                .filter(x => x/*.trim()*/)
                .map((x) => {

                    if (x.indexOf('<hr') === 0) {
                        let value = x.match(/data-value=".*?"/g)[0]
                        return ('[' + value.substring(12, value.length - 1) + ']')
                    }
                    else {
                        return x;
                    }
                })
                .join('')
            // Create new formula and put in Array()
            let newFormulaPart: Iformula = { title: d3.select('#graph_ui_input_edit_' + k).property('value'), technical: technicalFormula }
            newFormula.push(newFormulaPart)
        })
        this.graph.impekts[0].edited = true;


        // Update formula 
        this.graph.updateFormula(newFormula)


        // Update graph
        this.graph.update();



        // Update also UI
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.createNormalFormula();

        } else {
            console.log('requested soft data update, but will do a hard one, data changed too much')
            this.update() // Do hard update
        }
    }        // Get from a change in formula (typing or adding HR-tag)


    ///////////// Build interface /////////////

    setTitle() {
        let subtitleString = ''
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.title = this.graph.impekts[0].title
            this.subtitle = this.graph.impekts[0].sub_title
            subtitleString = '<div  id="graph-UI-title-sub">' + this.graph.impekts[0].sub_title + '</div>'
        } else {
            this.title = this.graph.impekts.map(x => x.title).join(' ')
            this.subtitle = ''
        }
        //d3.selectAll('.graph-title').remove()
        /*d3.select('.graph-container')
            .insert('h1', '.graph-graph')
            .attr('class', 'graph-title')*/
        this.elTitle
            .html('<div id="graph-UI-title-main">' + this.title + '</div>' + subtitleString)
    }              // Set title
    addAdvanced() {

        this.elAdvanced.html('')
        var block = this.elAdvanced.append('div').attr('id', 'graph-group-main')

        // Advanced button
        let label = block.append('label')
            .attr('class', 'settings-button')
        label.append('input')
            .attr('class', 'settings-toggle-main')
            .attr('type', 'checkbox')
        label.append('span')
        label.append('span')
        label.append('span')
        label.append('span')
        label.append('div')
        label.on('change', () => { this.toggleAdvanced() })

        // Info div
        this.elInfo = block.append('div').attr('class', 'graph-UI-info').attr('id', 'graph-UI-info-main')
        this.elInfo.style('max-height', '0px')




        // Overview Table
        this.elTable = this.elInfo.append('table')
        this.elTable.append('tr').html("<th><!--Drag--></th><th><!--Symbol--></th><th>Item</th><th colspan='2' style='text-align:center;padding: 5px 20px 5px 0;width:30px;'>Value</th><th></th><th></th>")



        this.elAdvancedError = this.elInfo.append('div').attr('class', 'graph-UI-info-error')





    }           // Adds advanced folding div
    createNormalFormula() {
        this.elFormula.html('')
        this.elFormula.append('h4').html('Formula')
        let singleImpekt = this.graph.impekts[0]

        if (typeof singleImpekt.formula !== "undefined") {
            // Input JSON formula with name and groups
            // Outputs a Formula with {<hr>+<hr>}
            // In the end formula is like a update


            // per group in formula
            for (var k = 0, groups = singleImpekt.formula.length; k < groups; k += 1) {
                if (k !== 0) { // Skip first but add + sign
                    this.elFormula.append('div').attr('class', 'sign').html('+').style('display', 'inline-block')
                }
                this.elFormula.append('div')
                    .attr('class', 'graph-UI-info-form graph-form-hr')
                    .attr('id', 'graph-UI-info-form-' + k)
                    .attr('title', singleImpekt.formula[k].title)
                    .html(singleImpekt.formula[k].hr)
                    .style('border-bottom', ' solid 2px' + color[k])
                this.resizeAllFormulaBlocks() // Update so the HR are not collapsed
            }
        }

    }   // Add text formula to mainpage
    addMoreInformation() {
        this.elImpekt.html('')
        // AddExplanation
        let singleImpekt = this.graph.impekts[0]
        if (singleImpekt.descr) {
            this.elImpekt.append('h4').html("Explanation")
            this.elImpekt.append('p').html(singleImpekt.descr).attr('class', 'graph-expl-explanation')//.attr('data-json', 'jsonData[0].explanation')
        }

        // Excluding
        if (singleImpekt.descr) {
            this.elImpekt.append('h4').html("Known exclusions")
            this.elImpekt.append('p').html(singleImpekt.excl).attr('class', 'graph-expl-exclusions')//.attr('data-json', 'jsonData[0].excl')
        }
    }    // Adds information about impekt
    setSimplifiedMode(changed) {

        this.simplified = false
        if (changed) {
            this.simplified = d3.select('#simpleMode').property('checked')
        }
        else {
            this.simplified = false
            d3.select('#simpleMode').property('checked', false)
        }
        d3.select('body').classed('simplified', this.simplified)

    }

    // Formula //
    addAdvancedFormula() {


        let singleImpekt = this.graph.impekts[0]

        if (typeof singleImpekt.formula !== "undefined") {
            // Input JSON formula with name and groups
            // Outputs a Formula with {<hr>+<hr>}
            // In the end formula is like a update


            // elAdvancedForm
            let elementForm = this.elInfo.append('div').attr('class', 'graph-UI-input-block')

            // per group in formula

            for (var k = 0, groups = singleImpekt.formula.length; k < groups; k += 1) {



                if (k !== 0) { // Skip first but add + sign
                    this.addAdvancedFormulaPlus()
                }

                this.addAdvancedFormulaPart(k, singleImpekt.formula[k].title, singleImpekt.formula[k].hr);

                this.resizeAllFormulaBlocks() // Update so the HR are not collapsed
            }
        }

    }                       // Adds formula to advanced section
    addAdvancedFormulaPart(k, title, formula) {
        //console.log(k, title, formula)
        let group = d3.select('.graph-UI-input-block')
            .append('div')
            .attr('class', 'graph-UI-input-group')
            .attr('data-part', k)


        // Edit section Title
        group
            .append('input')
            .attr('class', 'graph-UI-input-edit ')
            .attr('id', 'graph_ui_input_edit_' + k)
            .attr('data-part', k)
            .style('border-left-color', color[k])
            .property('value', title)
            .on('change', (d, i, arr) => { this.updateFormulaTitle(arr[i].value, arr[i].getAttribute('data-part')) })


        // Add 
        let el = group
            .append('div')
            .attr('class', 'graph-UI-input graph-form-hr')
            .attr('id', 'graph_ui_input_' + k)
            .attr('data-part', k)
            .attr('contenteditable', 'true')
            .attr('spellcheck', 'false')
            .attr('data-title', title)
            .style('border-left', ' solid 6px' + color[k])
            .html(formula)
            .on('keyup paste copy cut'/*, '[contenteditable]' */, () => {

                // Clean input
                if (d3.event.keyCode == 13) {//enter
                    el.html(el.html().split('<br>').join('')) // removes <br>
                }

                // Only update on some keys
                if ([16,// Shit
                    17, // ctrl
                    18, // Alt
                    13, // enter
                    32, // Space
                    27, // esc
                    37, 38, 39, 40 // Arrow movement
                ].indexOf(d3.event.keyCode) < 0) {
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => { this.decodeFormula(); }, 400);
                }
            })

        this.elAdvancedForm.push(el);
        return group
    }  // Adds one formula part
    addAdvancedFormulaPlus() {
        d3.select('.graph-UI-input-block')
            .append('span')
            .attr('class', 'sign')
            .html('+')
            .style('font-size', '160%')
            .style('color', 'rgba(0,0,0,0.4)')
            .style('display', 'block')
            .style('clear', 'both')
            .style('height', '13px')
            .style('padding-top', '7px')


    }                   // Adds one formula part

    ///////////// Controllers /////////////
    toggleAdvanced(show?: boolean) {
        if (show) (<HTMLInputElement>this.elUI.select('.settings-toggle-main').node()).checked = true
        if ((<HTMLInputElement>this.elUI.select('.settings-toggle-main').node()).checked) {
            this.elInfo.style('max-height', '999px').transition().duration(500)//.style('margin','0 0 50px 0')
        } else {
            this.elInfo.style('max-height', '0').transition().duration(500)//.style('margin','0 0 0 0')
        }
    }             // Show or Hide advanced section
    resizeAllFormulaBlocks() {
        this.elUI.selectAll('.graph-form-hr hr').each((d, i, arr) => {
            let hr = <HTMLHRElement>arr[i]
            hr.style.width = (parseInt(window.getComputedStyle(hr, ':before').width.replace('px', '')) + 1) + 'px'
        })

    }                   // All formulas: make HR blocks right width
    updateFormulaTitle(value, id) {
        this.graph.impekts[0].formula[id].title = value;

        this.graph.update(true);

    }              // Advanced formula: Title change
    makeTableRowDraggable() {
        // Drag and drop function
        console.log('Start dragable')
        this.elTable
            .selectAll('tr + tr>td:nth-child(3)').each(function () { d3.select(this) })
            .call(d3.drag()

                .on("start", (d, i, arr) => {

                    let info = this.elInfo
                    let divFormulas = this.elAdvancedForm//.selectAll('.graph-UI-input')
                    // First time update mouse
                    let coords = d3.mouse(info.node())
                    console.log(arr[i])
                    let dragable = d3.select(arr[i].parentElement).select('.graph-UI-info-copy span')


                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {


                        // Add gray blocks in Advanced>Formula>Inputs
                        let divIndex = 1
                        divFormulas.map((divFormula) => {


                            //var divFormula = d3.select(this)
                            var reg = /(<hr.+?>+)/g // optional whitespaces
                            var splits = divFormula.html().replace(/  /g, ' ').split(reg).filter(x => x//*.trim()
                            )

                            // remove empty parts

                            var forhtml = '<div class="div-small" id="X' + divIndex + '">' + '</div>'
                            divIndex += 1

                            for (var i = 0, j = splits.length; i < j; i += 1) {
                                if (splits[i].slice(0, 3) === '<hr') {
                                    forhtml += '<p id="X' + divIndex + '">' + splits[i] + '</p>'
                                    divIndex += 1
                                }
                                else {
                                    var charsplits = splits[i].split(/\b/g).filter(function (x) { return x.trim() !== '' })
                                    for (var k = 0, l = charsplits.length; k < l; k += 1) {
                                        forhtml += '<p id="X' + divIndex + '">' + charsplits[k] + '</p>'
                                        divIndex += 1
                                    }

                                }
                                forhtml += '<div class="div-small" id="X' + divIndex + '">' + '</div>'
                                divIndex += 1
                            }

                            divFormula.html(forhtml)
                            divFormula.style('min-height', '60px').style('padding', '10px 0')
                            divFormula.selectAll('.div-small').style('width', '')
                        })




                        dragable
                            .style('position', "absolute")
                            .style('display', "block")
                            .style('left', coords[0] + "px")
                            .style('top', coords[1] + "px")
                            .style('margin-top', "-40px")

                        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                            dragable.style('margin-top', "-30px")
                        }


                        ///////////////// Force New lines ///////////////////////////
                        /*positions=[]
                        info.selectAll('.graph-UI-input>*').each(function(d,i){
                            positions.push(this.getBoundingClientRect().y)
                        })
                        info.selectAll('.graph-UI-input').on('mouseover',function() {
                            // Get breakID	
                            info.selectAll('.graph-UI-input>*').each(function(d,i){
                
                                if (positions[i]+7<this.getBoundingClientRect().y){
                                    var smallid = this.id.replace('X','')
                                    if ( smallid > 3 && breakID > smallid && this.getAttribute('class') === "div-small"){
                                        breakID = smallid
                                    }
                                }
                            })
                            // Remove other breakIDs
                            divFormula.selectAll('.graph-UI-input-break').remove()
                            // New breakID<
                            if(breakID!==999){
                                divFormula.insert('div','#X'+(breakID-1)).attr('class','graph-UI-input-break').html('<br/>')
                                // console.log("break here: X",breakID-1)				
                            }
                
                        })*/

                    }, 400);
                })
                .on("drag", (d, i, arr) => {

                    let info = this.elInfo

                    let coords = d3.mouse(info.node())
                    // console.log(coords)
                    let dragable = d3.select(arr[i].parentElement).select('.graph-UI-info-copy span')
                    dragable.style('margin-top', "-30px")
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        dragable.style('margin-top', "-30px")
                    }

                    dragable
                        .style('left', coords[0] + "px")
                        .style('top', coords[1] + "px")
                })
                .on("end", (d, i, arr) => {
                    //console.clear()
                    // Basics and reset
                    let inputBars = (this.elAdvancedForm)//.selectAll('.graph-UI-input') 
                    var dragable = d3.select(arr[i].parentElement).select('.graph-UI-info-copy span')

                    dragable
                        .style('position', "relative").style('left', "")
                        .style('top', "")
                        .style('display', "")

                    var targetDiv = <HTMLElement>d3.select('.div-small:hover').node()


                    // If drop on gray area:

                    var regstr = /(<div.+?\/div>)?(<p.+?>)?(<\/p>)?/g
                    if (targetDiv !== null //&& targetDiv.toString().indexOf('<div class="div-small"') ==0
                    ) {
                        // reset breakid
                        //breakID = 999
                        //inputBars.selectAll('.graph-UI-input-break').remove()

                        // Clean up all grey areas
                        inputBars.map((d, i, arr) => { // For each input field		
                            var inputBar = arr[i]
                            var newForm = inputBar.html()
                            if (newForm.split((<HTMLElement>targetDiv).outerHTML).length > 1) { // Only in the right input window
                                // Update html:
                                inputBar.html(newForm.split((<HTMLElement>targetDiv).outerHTML)[0].replace(regstr, '') + dragable.attr('data-drop') + newForm.split((<HTMLElement>targetDiv).outerHTML)[1].replace(regstr, ''))
                            }
                            else {// Other inputs that doesnot contain grey box: rebuilt formula
                                inputBar.html(inputBar.html().replace(regstr, ''))
                            }
                        })
                        // Update HR blocks
                        this.resizeAllFormulaBlocks();
                        this.decodeFormula()
                    }
                    // Go back and do nothing (user missed gray boxes)
                    else {

                        inputBars.map((d, i, arr) => { // For each input field		
                            var inputBar = arr[i]

                            console.log(3, inputBar.html().replace(regstr, ''))
                            inputBar.html(inputBar.html().replace(regstr, ''))
                        })
                    }


                    // reset layout
                    inputBars.map(function (d, e, i) { d3.select(this).style('min-height', '').transition().duration(500).style('padding', '') })



                })// end click-end

            ); // end call
       // 
    }                    // Advanced table: drag&drop
    modeSimplified() {
        d3.select('#simpleMode').on('change', () => { this.setSimplifiedMode(true)})
    }                           // Advanced table: Simplified
}



window.onload = () => {

    // use GET parameter for IDs
    let para: any = parseURLParams(window.location.href)

    if (para == false) { } else {
        if (typeof para.id !== 'undefined') {
            let ids = []
            para.id.map((x) => { x.split(';').map((y) => { ids.push(y) }) })
            settings.ids = ids
        }
    }
    

    // Create graph
    let newGraph = new graph();
    // Create interface with 
    x = new UI(newGraph);
    newGraph.buildGraph().then(() => {
        x.update();
        x.toggleAdvanced(true);
        //console.log(x.stackMax)
        //console.log(x.stackMax)
        //x.pushFormula();
        // window.scrollTo(0, 800);
    });
};

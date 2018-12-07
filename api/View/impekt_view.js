class UI {
    constructor(graph) {
        this.title = '';
        this.subtitle = '';
        this.elAdvancedForm = [];
        this.graph = graph;
        this.elUI = d3.select('.graph-container').append('div').attr('class', 'graph-UI-group');
        this.elAdvanced = this.elUI.append('div').attr('class', 'graph-UI-advanced');
        this.elFormula = this.elUI.append('div').attr('class', 'graph-UI-formula');
        this.elImpekt = this.elUI.append('div').attr('class', 'graph-UI-impekt');
        this.elResource = this.elUI.append('div').attr('class', 'graph-UI-resource');
    }
    update() {
        this.setTitle();
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.addOverviewFormula();
            this.addAdvanced();
            this.addAdvancedFormula();
            this.addImpekt();
            this.addResource();
        }
        this.addVariable();
    }
    addVariable() {
        this.graph.variables.map((variable) => {
            variable.elTable = this.elTable;
            variable.addToUI(() => {
                this.graph.update();
                this.makeTableRowDraggable();
            });
        });
    }
    decodeFormula() {
        let newFormula = [];
        this.elAdvancedForm.map((formulaPart, k) => {
            let HRformula = formulaPart.html();
            let technicalFormula = HRformula
                .replace(/  /g, ' ')
                .split(/(<hr.+?>+)/g)
                .filter(x => x)
                .map((x) => {
                if (x.indexOf('<hr') === 0) {
                    let value = x.match(/data-alias=".*?"/g)[0];
                    return ('[' + value.substring(12, value.length - 1) + ']');
                }
                else {
                    return x;
                }
            })
                .join('');
            let newFormulaPart = { title: this.graph.impekts[0].formula[k].title, technical: technicalFormula };
            newFormula.push(newFormulaPart);
        });
        this.graph.impekts[0].edited = true;
        this.graph.updateFormula(newFormula);
        this.graph.update();
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.addOverviewFormula();
        }
        else {
            console.log('requested soft data update, but will do a hard one, data changed too much');
            this.update();
        }
    }
    setTitle() {
        let subtitleString = '';
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.title = this.graph.impekts[0].title;
            this.subtitle = this.graph.impekts[0].sub_title;
            subtitleString = '<div  id="graph-UI-title-sub">' + this.graph.impekts[0].sub_title + '</div>';
        }
        else {
            this.title = this.graph.impekts.map(x => x.title).join(' ');
            this.subtitle = '';
        }
        d3.selectAll('.graph-title').remove();
        d3.select('.graph-container')
            .insert('h1', '.graph-graph')
            .attr('class', 'graph-title')
            .html('<div id="graph-UI-title-main">' + this.title + '</div>' + subtitleString);
    }
    addOverviewFormula() {
        this.elFormula.html('');
        this.elFormula.append('h4').html('Formula');
        let singleImpekt = this.graph.impekts[0];
        if (typeof singleImpekt.formula !== "undefined") {
            for (var k = 0, groups = singleImpekt.formula.length; k < groups; k += 1) {
                if (k !== 0) {
                    this.elFormula.append('div').attr('class', 'sign').html('+').style('display', 'inline-block');
                }
                this.elFormula.append('div')
                    .attr('class', 'graph-UI-info-form graph-form-hr')
                    .attr('id', 'graph-UI-info-form-' + k)
                    .attr('title', singleImpekt.formula[k].title)
                    .html(singleImpekt.formula[k].hr)
                    .style('border-bottom', ' solid 2px' + color[k]);
                this.resizeAllFormulaBlocks();
            }
        }
    }
    addAdvanced() {
        this.elAdvanced.html('');
        var block = this.elAdvanced.append('div').attr('id', 'graph-group-main');
        let label = block.append('label')
            .attr('class', 'settings-button');
        label.append('input')
            .attr('class', 'settings-toggle-main')
            .attr('type', 'checkbox');
        label.append('span');
        label.append('span');
        label.append('span');
        label.append('span');
        label.append('div');
        label.on('change', () => { this.toggleAdvanced(); });
        this.elInfo = block.append('div').attr('class', 'graph-UI-info').attr('id', 'graph-UI-info-main');
        this.elInfo.style('max-height', '0px');
        this.elTable = this.elInfo.append('table');
        this.elTable.append('tr').html("<th></th><th>Forumla</th><th colspan='2' style='text-align:center;	padding: 5px 20px 5px 0;' >Value</th><th></th>");
        this.graph.impekts[0].subimpact.map((subImpekt) => {
            this.addAdvancedSubImpekt(subImpekt);
        });
        this.elAdvancedError = this.elInfo.append('div').attr('class', 'graph-UI-info-error');
        this.makeTableRowDraggable();
    }
    addAdvancedFormula() {
        let singleImpekt = this.graph.impekts[0];
        if (typeof singleImpekt.formula !== "undefined") {
            let elementForm = this.elInfo.append('div').attr('class', 'graph-UI-input-block');
            for (var k = 0, groups = singleImpekt.formula.length; k < groups; k += 1) {
                if (k !== 0) {
                    this.addAdvancedFormulaPlus();
                }
                this.addAdvancedFormulaPart(k, singleImpekt.formula[k].title, singleImpekt.formula[k].hr);
                this.resizeAllFormulaBlocks();
            }
        }
    }
    addAdvancedFormulaPart(k, title, formula) {
        let group = d3.select('.graph-UI-input-block')
            .append('div')
            .attr('class', 'graph-UI-input-group')
            .attr('data-part', k);
        group
            .append('input')
            .attr('class', 'graph-UI-input-edit ')
            .attr('id', 'graph_ui_input_edit_' + k)
            .attr('data-part', k)
            .style('border-left-color', color[k])
            .property('value', title)
            .on('change', (d, i, arr) => { this.updateFormulaTitle(arr[i].value, arr[i].getAttribute('data-part')); });
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
            .on('keyup paste copy cut', () => {
            if ([16, 17, 18, 32, 27, 37, 38, 39, 40].indexOf(d3.event.keyCode) < 0) {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => { this.decodeFormula(); }, 400);
            }
        });
        this.elAdvancedForm.push(el);
        return group;
    }
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
            .style('padding-top', '7px');
    }
    addAdvancedSubImpekt(e) {
        this.elTable.append('tr')
            .attr('class', 'graph-UI-table-tr graph-UI-table-impact')
            .attr('title', 'drag me into the formula')
            .html(`
                    <td class="graph-UI-info-copy"><span data-type="` + graph.typeOfLink.subimpekt + `" data-name="` + e.short_code_name + `" data-drop='<hr class="graph-UI-input-tags" data-alias="` + e.short_code_name + `" data-value="dataset[0].subimpact[` + e.localid + `].impactdata[0][field]">'>` + e.short_code_name + `</span></td>
                    <td>` + e.title + ` (` + e.short_code_name + `)</td>
                    <td colspan='2' style='text-align:center;' class='vari_` + e.short_code_name + `'><a href='#id_` + e.short_code_name + `' title='More information'>Fixed</a></td>
                `);
    }
    addImpekt() {
        this.elImpekt.html('');
        let singleImpekt = this.graph.impekts[0];
        if (singleImpekt.descr) {
            this.elImpekt.append('h4').html("Explanation");
            this.elImpekt.append('p').html(singleImpekt.descr).attr('class', 'graph-expl-explanation');
        }
        if (singleImpekt.descr) {
            this.elImpekt.append('h4').html("Known exclusions");
            this.elImpekt.append('p').html(singleImpekt.excl).attr('class', 'graph-expl-exclusions');
        }
    }
    addResource() {
        let list = [];
        this.graph.impekts.map(impekt => {
            impekt.impactvariables.map((vari) => {
                list.push(vari.short_code_name);
            });
        });
        this.graph.impekts.map(impekt => {
            impekt.subimpact.map((subs) => {
                list.push(subs.short_code_name);
            });
        });
        var inlc = this.elImpekt.append('p').attr('class', 'graph-expl-included').html('<h4>Including</h4>');
        list.map(x => inlc.append('a').html('<a href="#resource_' + x + '">' + x + '</a>'));
    }
    toggleAdvanced(show) {
        if (show)
            this.elUI.select('.settings-toggle-main').node().checked = true;
        if (this.elUI.select('.settings-toggle-main').node().checked) {
            this.elInfo.style('max-height', '999px').transition().duration(500);
        }
        else {
            this.elInfo.style('max-height', '0').transition().duration(500);
        }
    }
    resizeAllFormulaBlocks() {
        this.elUI.selectAll('.graph-form-hr hr').each((d, i, arr) => {
            let hr = arr[i];
            hr.style.width = (parseInt(window.getComputedStyle(hr, ':before').width.replace('px', '')) + 1) + 'px';
        });
    }
    updateFormulaTitle(value, id) {
        this.graph.impekts[0].formula[id].title = value;
        this.graph.update(true);
    }
    makeTableRowDraggable() {
        this.elTable
            .selectAll('tr + tr').each(function () { d3.select(this); })
            .call(d3.drag()
            .on("start", (d, i, arr) => {
            let info = this.elInfo;
            let divFormulas = this.elAdvancedForm;
            let divIndex = 1;
            divFormulas.map((divFormula) => {
                var reg = /(<hr.+?>+)/g;
                var splits = divFormula.html().replace(/  /g, ' ').split(reg).filter(x => x);
                var forhtml = '<div class="div-small" id="X' + divIndex + '">' + '</div>';
                divIndex += 1;
                for (var i = 0, j = splits.length; i < j; i += 1) {
                    if (splits[i].slice(0, 3) === '<hr') {
                        forhtml += '<p id="X' + divIndex + '">' + splits[i] + '</p>';
                        divIndex += 1;
                    }
                    else {
                        var charsplits = splits[i].split(/\b/g).filter(function (x) { return x.trim() !== ''; });
                        for (var k = 0, l = charsplits.length; k < l; k += 1) {
                            forhtml += '<p id="X' + divIndex + '">' + charsplits[k] + '</p>';
                            divIndex += 1;
                        }
                    }
                    forhtml += '<div class="div-small" id="X' + divIndex + '">' + '</div>';
                    divIndex += 1;
                }
                divFormula.html(forhtml);
                divFormula.style('min-height', '60px').style('padding', '10px 0');
                divFormula.selectAll('.div-small').style('width', '');
            });
            let coords = d3.mouse(info.node());
            let dragable = d3.select(arr[i]).select('.graph-UI-info-copy span');
            dragable
                .style('position', "absolute")
                .style('display', "block")
                .style('left', coords[0] + "px")
                .style('top', coords[1] + "px")
                .style('margin-top', "-40px");
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                dragable.style('margin-top', "-30px");
            }
        })
            .on("drag", (d, i, arr) => {
            let info = this.elInfo;
            let coords = d3.mouse(info.node());
            let dragable = d3.select(arr[i]).select('.graph-UI-info-copy span');
            dragable.style('margin-top', "-30px");
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                dragable.style('margin-top', "-30px");
            }
            dragable
                .style('left', coords[0] + "px")
                .style('top', coords[1] + "px");
        })
            .on("end", (d, i, arr) => {
            let inputBars = (this.elAdvancedForm);
            var dragable = d3.select(arr[i]).select('.graph-UI-info-copy span');
            dragable
                .style('position', "relative").style('left', "")
                .style('top', "")
                .style('display', "");
            var targetDiv = d3.select('.div-small:hover').node();
            var regstr = /(<div.+?\/div>)?(<p.+?>)?(<\/p>)?/g;
            if (targetDiv !== null) {
                inputBars.map((d, i, arr) => {
                    var inputBar = arr[i];
                    var newForm = inputBar.html();
                    if (newForm.split(targetDiv.outerHTML).length > 1) {
                        inputBar.html(newForm.split(targetDiv.outerHTML)[0].replace(regstr, '') + dragable.attr('data-drop') + newForm.split(targetDiv.outerHTML)[1].replace(regstr, ''));
                        this.decodeFormula();
                    }
                    else {
                        inputBar.html(inputBar.html().replace(regstr, ''));
                    }
                });
            }
            else {
                inputBars.map((d, i, arr) => {
                    var inputBar = arr[i];
                    inputBar.html(inputBar.html().replace(regstr, ''));
                });
            }
            inputBars.map(function (d, e, i) { d3.select(this).style('min-height', '').transition().duration(500).style('padding', ''); });
            this.resizeAllFormulaBlocks();
        }));
    }
}
let y;
window.onload = () => {
    x = new graph();
    y = new UI(x);
    x.buildGraph().then(() => {
        y.update();
        y.toggleAdvanced(true);
        window.scrollTo(0, 0);
    });
};

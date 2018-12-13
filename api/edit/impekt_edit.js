class overlay {
    constructor() {
        this.el = d3.select('.overlay');
        this.el.style('display', 'none');
        let background = this.el.append('div').attr('class', 'overlay-background');
        let container = this.el.append('div').attr('class', 'overlay-container');
        let close = container.append('div').attr('class', 'overlay-close').html('close');
        this.title = container.append('h1').attr('class', 'overlay-title');
        this.body = container.append('div').attr('class', 'overlay-html');
        background.on('click touch', () => { this.hideOverlay(); });
        close.on('click touch', () => { this.hideOverlay(); });
    }
    open(show) {
        if (show) {
            this.body.html('');
            this.openOverlay();
        }
        else {
            this.hideOverlay();
        }
    }
    setTitle(title) {
        this.title.html(title);
    }
    openOverlay() {
        d3.select('body').classed('stop-scrolling', true);
        d3.select('body').on('touchmove', function (e) {
            '';
        });
        this.el.style('display', 'block');
    }
    hideOverlay() {
        d3.select('body').classed('stop-scrolling', false);
        d3.select('body').on('touchmove');
        this.el.style('display', 'none');
    }
}
class confirmButton {
    constructor(location, html, classes, titles, callback) {
        let timeout;
        let buttonX = location.append('span')
            .attr('class', classes)
            .attr('title', titles)
            .html(html)
            .on('click touch', () => {
            buttonX.style('display', 'none');
            buttonSure.style('display', '');
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                buttonX.style('display', '');
                buttonSure.style('display', 'none');
            }, 2000);
        });
        let buttonSure = location.append('span')
            .attr('class', classes)
            .attr('title', 'Sure to ' + titles)
            .html('Sure?')
            .style('display', 'none')
            .on('click touch', () => {
            clearTimeout(timeout);
            buttonX.style('display', '');
            buttonSure.style('display', 'none');
            callback(location);
        });
    }
}
class editUI extends UI {
    constructor(graph) {
        super(graph);
        this.editActive = false;
        this.overlay = new overlay();
        this.buttonEdit = (item, fieldname, type, callback) => {
            if (item.select('.edit-container').empty())
                item.html("<span class='edit-container-fieldname'>" + fieldname + ": </span><span class='edit-container'>" + item.html() + "</span>");
            if (type != editUI.editDivType.notAllowed) {
                item.append('span').attr('class', 'UI-edit').html('Edit')
                    .attr('data-type', type)
                    .on('click touch', (d, i, arr) => {
                    this.goEditer(arr[i], callback);
                });
            }
        };
    }
    startEdit() {
        d3.selectAll('[class^="UI-edit"]').remove();
        this.toggleAdvanced(true);
        this.addExtraCodes();
        this.addSaveBlock();
        this.buttonEdit(d3.select('#graph-UI-title-main'), 'Title', editUI.editDivType.oneline, (val) => { this.graph.impekts[0].title = val; this.graph.impekts[0].edited = true; });
        this.buttonEdit(d3.select('#graph-UI-title-sub'), 'Sub title', editUI.editDivType.oneline, (val) => { this.graph.impekts[0].sub_title = val; this.graph.impekts[0].edited = true; });
        this.buttonEdit(d3.select('#graph-UI-long-code'), 'Long code', editUI.editDivType.warning_oneline, (val) => { this.graph.impekts[0].long_code_name = val; this.graph.impekts[0].edited = true; });
        this.buttonEdit(d3.select('#graph-UI-short-code'), 'Short code', editUI.editDivType.warning_oneline, (val) => { this.graph.impekts[0].short_code_name = val; this.graph.impekts[0].edited = true; });
        this.buttonEdit(d3.select('#graph-UI-main-group'), 'Main group', editUI.editDivType.warning_oneline, (val) => { this.graph.impekts[0].maingroup = val; this.graph.impekts[0].edited = true; });
        this.buttonEdit(d3.select('#graph-UI-sub-group'), 'Sub group', editUI.editDivType.warning_oneline, (val) => { this.graph.impekts[0].subgroup = val; this.graph.impekts[0].edited = true; });
        this.buttonEdit(d3.select('#graph-UI-unit'), 'Unit', editUI.editDivType.oneline, (val) => { this.graph.impekts[0].unit = val; this.graph.impekts[0].edited = true; });
        this.buttonEdit(d3.select('#graph-UI-uid'), 'UID', editUI.editDivType.notAllowed, (val) => { });
        this.buttonEdit(d3.select('#graph-UI-id'), 'ID', editUI.editDivType.notAllowed, (val) => { });
        this.buttonEdit(d3.select('.graph-expl-explanation'), 'Description', editUI.editDivType.multiline, (val) => { this.graph.impekts[0].descr = val; this.graph.impekts[0].edited = true; });
        this.buttonEdit(d3.select('.graph-expl-exclusions'), 'Exclusions', editUI.editDivType.multiline, (val) => { this.graph.impekts[0].excl = val; this.graph.impekts[0].edited = true; });
        this.elTable.selectAll('tr[title]').each((d, i, arr) => {
            new confirmButton(d3.select(arr[i]).append('td').attr('class', "UI-edit-td"), 'x', "UI-edit-delete", "delete", () => {
                this.removeLink(d3.select(arr[i]));
            });
        });
        this.buttonNewLink(this.elTable);
        this.elInfo.selectAll('.graph-UI-input-group').each((d, i, arr) => {
            this.buttonRemoveFormula(arr[i]);
        });
        d3.select('.graph-UI-input-block').append('div').html('+ add formula').attr('class', "UI-edit-add-fomrula-part").on('click touch', () => {
            d3.select(".UI-edit-add-fomrula-part").remove();
            this.buttonNewFormula();
        });
    }
    removeLink(row) {
        let span = row.select('td span');
        let short_code_name = span.attr('data-name');
        let type = span.attr('data-type');
        row.remove();
        d3.select('a[href="#resource_' + short_code_name + '"').remove();
        if (type == graph.typeOfLink.subimpekt.toString()) {
            this.removeSubImpekt(short_code_name);
        }
        if (type == graph.typeOfLink.variable.toString()) {
            this.removeVariable(short_code_name);
        }
        this.elUI.selectAll('hr[data-alias="' + short_code_name + '"]').style('background', '#ff9595');
        this.graph.updateFormula(this.graph.impekts[0].formula);
    }
    removeSubImpekt(short_code_name) {
    }
    removeVariable(short_code_name) {
        d3.selectAll('.graph-buttons-group>div[title="' + short_code_name + '"]').remove();
        this.graph.variables = this.graph.variables.filter((vari) => {
            if (vari.short_code_name !== short_code_name)
                return vari;
        });
    }
    buttonRemoveFormula(element) {
        new confirmButton(d3.select(element), 'x', "UI-edit-delete", "delete", () => {
            let k = parseInt(d3.select(element).attr('data-part'));
            this.graph.impekts[0].formula = this.graph.impekts[0].formula.filter((part, i) => { if (i !== k)
                return part; });
            this.graph.updateFormula(this.graph.impekts[0].formula);
            this.graph.update(true);
            this.update();
            this.startEdit();
        });
    }
    buttonNewFormula() {
        d3.select(".UI-edit-add-fomrula-part").remove();
        let len = d3.selectAll('.graph-UI-input-group').nodes().length;
        let newTitle = 'New part ' + (len + 1);
        this.addAdvancedFormulaPlus();
        let newPart = this.addAdvancedFormulaPart(len, newTitle, '');
        this.buttonRemoveFormula(newPart.node());
        d3.select('.graph-UI-input-block').append('div').html('+ add formula').attr('class', "UI-edit-add-fomrula-part").on('click touch', () => {
            this.buttonNewFormula();
        });
        this.graph.impekts[0].formula.push({ technical: '', title: newTitle });
    }
    buttonNewLink(elTable) {
        let addRow = elTable.append('tr').style('cursor', 'ititial').attr('class', "UI-edit-row");
        addRow.append('td');
        addRow.append('td').html('Add new item');
        addRow.append('td');
        addRow.append('td');
        addRow.append('td').append('span').html('+').attr('class', "UI-edit-add")
            .attr('title', "add");
        addRow.on('click touch', (d, i, arr) => {
            this.overlayerNewLink();
        });
    }
    databaseRequestLinks(search, divSuggestions, type) {
        let url = 'https://u39639p35134.web0087.zxcs-klant.nl/api/';
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var jsonData;
                try {
                    jsonData = JSON.parse(xhr.responseText);
                }
                catch (e) {
                    console.error(xhr);
                    throw new Error(xhr.responseText);
                }
                jsonData.map((link) => {
                    let item = divSuggestions.append('div').attr('class', 'newItem-item-div');
                    item.append('div').attr('class', 'newItem-long').html(link.long_code_name);
                    item.append('div').attr('class', 'newItem-short').html(link.short_code_name);
                    item.append('div').attr('class', 'newItem-desc').html(link.desc);
                    item.append('div').attr('class', 'newItem-tags').html(link.tags);
                    item.append('div').attr('class', 'newItem-group').html(link.group);
                    item.append('div').attr('class', 'newItem-subgroup').html(link.sub_group);
                    if (type == graph.typeOfLink.subimpekt) {
                        item.on('click touch', () => {
                            this.addNewSubImpekt(link.impact_id);
                        });
                    }
                    if (type == graph.typeOfLink.variable) {
                        item.on('click touch', () => {
                            this.addNewVariable(link.var_id);
                        });
                    }
                });
            }
        };
        if (type == graph.typeOfLink.subimpekt) {
            xhr.send('x=getSubimpekt&y=' + search);
        }
        if (type == graph.typeOfLink.variable) {
            xhr.send('x=getVariable&y=' + search);
        }
    }
    overlayerNewLink() {
        this.overlay.open(true);
        this.overlay.setTitle('Add new item');
        let overlay = this.overlay.body;
        let divPick = overlay.append('div').attr('class', 'newItem-pick-div');
        let subimpekt = divPick.append('div');
        subimpekt.append('input').attr('id', 'newItem-pick-option1').attr('type', 'radio').attr('name', 'newItemPick')
            .attr('value', graph.typeOfLink.subimpekt)
            .on('change', () => {
            divInputSub.style('display', '');
            divInputVari.style('display', 'none');
        });
        subimpekt.append('label').attr('for', 'newItem-pick-option1').html('subimpekt');
        let divInputSub = overlay.append('div').attr('class', 'newItem-input-div newItem-input-div-sub').style('display', 'none');
        let inputSub = divInputSub.append('input').attr('class', 'newItem-input').attr('placeholder', 'Start typing...').attr('value', 'igh');
        inputSub.on('keyup paste copy cut', () => {
            let value = inputSub.property('value');
            if ([16, 17, 18, 32, 27, 37, 38, 39, 40].indexOf(d3.event.keyCode) < 0) {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    if (value.length > 2) {
                        divSuggestionsSub.html('');
                        this.databaseRequestLinks(value, divSuggestionsSub, graph.typeOfLink.subimpekt);
                    }
                }, 400);
            }
        });
        let divSuggestionsSub = divInputSub.append('div').attr('class', 'newItem-suggestions-div');
        let variable = divPick.append('div');
        variable.append('input').attr('id', 'newItem-pick-option2').attr('type', 'radio').attr('name', 'newItemPick')
            .attr('value', graph.typeOfLink.variable).property('checked', true)
            .on('change', () => {
            divInputSub.style('display', 'none');
            divInputVari.style('display', '');
        });
        variable.append('label').attr('for', 'newItem-pick-option2').html('variable');
        let divInputVari = overlay.append('div').attr('class', 'newItem-input-div newItem-input-div-vari');
        let inputVari = divInputVari.append('input').attr('class', 'newItem-input').attr('placeholder', 'Start typing...').attr('value', 'anc');
        inputVari.on('keyup paste copy cut', () => {
            let value = inputSub.property('value');
            if ([16, 17, 18, 32, 27, 37, 38, 39, 40].indexOf(d3.event.keyCode) < 0) {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    if (value.length > 2) {
                        divSuggestionsVari.html('');
                        this.databaseRequestLinks(value, divSuggestionsVari, graph.typeOfLink.variable);
                    }
                }, 400);
            }
        });
        let divSuggestionsVari = divInputVari.append('div').attr('class', 'newItem-suggestions-div');
    }
    addNewVariable(var_id) {
        let newVariable = new variable();
        newVariable.elControllers = this.graph.elControllers;
        newVariable.elTable = this.elTable;
        newVariable.fromID(var_id).then(() => {
            newVariable.value = 0;
            this.graph.variables.push(newVariable);
            newVariable.addToUI(() => { this.graph.update(); });
            this.overlay.open(false);
            this.makeTableRowDraggable();
        });
    }
    addNewSubImpekt(impekt_uid) {
        console.log('add sub impekt_id', impekt_uid);
        this.getNewSubImpekt(impekt_uid).then((subimpekt) => {
            this.addAdvancedSubImpekt(subimpekt);
            this.makeTableRowDraggable();
            this.overlay.open(false);
        });
    }
    getNewSubImpekt(impekt_uid) {
        return new Promise((resolve, reject) => {
            let url = 'https://u39639p35134.web0087.zxcs-klant.nl/api/';
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var jsonData;
                    try {
                        jsonData = JSON.parse(xhr.responseText);
                        resolve(jsonData);
                    }
                    catch (e) {
                        console.error(e);
                        reject(xhr.responseText);
                    }
                }
            };
            xhr.send('x=getSubimpektByID&y=' + impekt_uid);
        });
    }
    addExtraCodes() {
        d3.selectAll('#graph-UI-extras').remove();
        let titleDiv = d3.select('.graph-title').append('div').attr('id', 'graph-UI-extras');
        titleDiv.append('div').attr('id', 'graph-UI-long-code').html(this.graph.impekts[0].long_code_name);
        titleDiv.append('div').attr('id', 'graph-UI-short-code').html(this.graph.impekts[0].short_code_name);
        titleDiv.append('div').attr('id', 'graph-UI-main-group').html(this.graph.impekts[0].maingroup);
        titleDiv.append('div').attr('id', 'graph-UI-sub-group').html(this.graph.impekts[0].subgroup);
        titleDiv.append('div').attr('id', 'graph-UI-unit').html(this.graph.impekts[0].unit);
        titleDiv.append('div').attr('id', 'graph-UI-uid').html(this.graph.impekts[0].uid.toString());
        titleDiv.append('div').attr('id', 'graph-UI-id').html(this.graph.impekts[0].impact_id.toString());
    }
    goEditer(el, callback) {
        let parentNode = d3.select(el.parentNode);
        let container = parentNode.select('.edit-container');
        let type = el.getAttribute('data-type');
        let oldText = container.html();
        if (type == editUI.editDivType.warning_oneline.toString()) {
            this.graph.tooltip.show('this', 1, 1);
            type = editUI.editDivType.oneline.toString();
            parentNode.select('.UI-edit-warning').remove();
            parentNode.append('span').attr('class', 'UI-edit-warning').html('WARNING: continue only if you know the consequences');
        }
        if (type == editUI.editDivType.oneline.toString()) {
            container.html('<input />');
            parentNode.select('input').property('focus', true).property('value', oldText);
        }
        if (type == editUI.editDivType.multiline.toString()) {
            container.html('<textarea></textarea >');
            parentNode.select('textarea').property('focus', true).property('value', oldText.split('<br>').join('\n'));
        }
        el.style.display = 'none';
        parentNode.classed('UI-editor', true);
        parentNode.append('span')
            .attr('class', 'UI-edit')
            .html('Save').attr('data-type', type)
            .on('click touch', (d, i, arr) => {
            this.closeEditer(arr[i], callback);
        });
    }
    closeEditer(el, callback) {
        let parentNode = d3.select(el.parentNode);
        let newText = 'error';
        let type = el.getAttribute('data-type');
        if (type == editUI.editDivType.oneline.toString()) {
            newText = parentNode.select('.edit-container input').property('value');
            parentNode.select('.edit-container').html(newText);
        }
        if (type == editUI.editDivType.multiline.toString()) {
            newText = parentNode.select('.edit-container textarea').property('value');
            parentNode.select('.edit-container').html(newText.split('\n').join('<br>'));
        }
        el.remove();
        parentNode.select('.UI-edit-warning').remove();
        parentNode.classed('UI-editor', false);
        parentNode.select('.UI-edit').style('display', '');
        callback(newText);
    }
    addSaveBlock() {
        let saveDiv = d3.select('.graph-UI-group').insert('div', ':first-child').attr("class", "UI-edit-div");
        saveDiv.append('div').attr('class', "UI-edit-div-active").html('Edit the data');
        let button = new confirmButton(saveDiv, "Save", "UI-edit-div-button UI-edit-div-save", "Save data in Database", () => {
            this.databaseRequest(saveDiv);
        });
    }
    databaseRequest(saveDiv) {
        let timeout;
        saveDiv.select('.UI-edit-div-button').style('display', 'none');
        let editButton = saveDiv.append('span')
            .attr('class', 'UI-edit-div-button UI-edit-div-wait')
            .style('cursor', 'progress')
            .html('<span class="spinner">Wait</span>');
        delete this.graph.impekts[0].calculatedData;
        this.graph.impekts[0].formula = this.graph.impekts[0].formula.map(formula => {
            delete formula.evalValue;
            delete formula.readable;
            delete formula.hr;
            return formula;
        });
        let editJSON = JSON.stringify(this.graph.impekts[0]);
        console.warn(editJSON);
        let promise = new Promise((resolve, reject) => {
            let url = 'https://u39639p35134.web0087.zxcs-klant.nl/api/';
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status == 202 || xhr.status == 200) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        }
                        catch (e) {
                            reject(xhr.responseText);
                        }
                    }
                    else {
                        console.error('Wrong post', xhr.status, '');
                        reject(xhr);
                    }
                }
            };
            xhr.send('x=setData&y=' + editJSON);
        });
        promise.catch((error) => {
            console.error('Cannot parse: ', error, ' json was: ', editJSON);
            editButton.html('Error!').attr('class', 'UI-edit-div-button UI-edit-div-error');
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                console.log('Going back');
                this.startEdit();
            }, 4000);
        });
        promise.then((reply) => {
            console.log(reply);
            if (reply.status == "nothing updated") {
                editButton.html('Noting updated!')
                    .attr('class', 'UI-edit-div-button UI-edit-div-wait');
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.startEdit();
                }, 2000);
            }
            else if (reply.status == "updated") {
                this.graph.update(true);
                this.update();
                editButton.html('Saved').attr('class', 'UI-edit-div-button UI-edit-div-wait');
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.startEdit();
                }, 2000);
            }
        });
    }
}
(function (editUI) {
    let editDivType;
    (function (editDivType) {
        editDivType[editDivType["oneline"] = 0] = "oneline";
        editDivType[editDivType["multiline"] = 1] = "multiline";
        editDivType[editDivType["warning_oneline"] = 2] = "warning_oneline";
        editDivType[editDivType["notAllowed"] = 3] = "notAllowed";
    })(editDivType = editUI.editDivType || (editUI.editDivType = {}));
    let restict;
    (function (restict) {
        restict[restict["noEnter"] = 0] = "noEnter";
    })(restict = editUI.restict || (editUI.restict = {}));
})(editUI || (editUI = {}));
let z;
window.onload = () => {
    x = new graph();
    y = new editUI(x);
    x.buildGraph().then(() => {
        y.update();
        y.startEdit();
        y.startEdit();
        window.scrollTo(0, 0);
    });
};

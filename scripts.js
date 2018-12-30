function encodeHash(hash) {
    return encodeURIComponent(hash).replace(".", '%2e')
}

function decodeHash(hash) {
    return decodeURIComponent(hash.replace('%2e',"."))
}

function escapePath(path) {
    return '"' + path.replace('"','\\"') + '"'
}

function childByClass(element, className) {
    for (var i = 0; i < element.childNodes.length; i++) {
	if (element.childNodes[i].className == className) {
	    return element.childNodes[i];
	}
    }
    return;
}

function get_allowed_options(id) {
    var allowed = {};
    var js_target = document.getElementById(id);
    
    if (js_target) {
	
	//Get js-allowed with allowed keys and values
	var js_allowed = childByClass(js_target, "js-allowed").dataset || {}

	//Get allowed list
	for (var key in js_allowed) {
	    allowed[key] = js_allowed[key].split(";");
	}
    }
    return allowed;
}

function get_hash_options() {
    var allowed = {};
    var targets, target, keys, key, value, tuple;
    
    //Get targets
    targets = window.location.hash.substring(1).split("&");
    for (var i in targets) {
	
	//Get target
	tuple = targets[i].split(".");
	target = tuple[0];
	
	//Get allowed keys and values
	if (!allowed[target]) {
	    allowed[target] = get_allowed_options(target);
	    if (!allowed[target] || !tuple[1]) {
		continue
	    }
	}
	
	//Get keys
	keys = tuple[1].split(";");
	for (var j in keys) {
	    
	    //Get key and value
	    tuple = keys[j].split("=");
	    key = tuple[0];
	    value = decodeHash(tuple[1]);
	    
	    //Set if allowed
	    if (allowed[target][key]) {
		if ((allowed[target][key].indexOf("*") > -1) || (allowed[target][key].indexOf(value) > -1)) {
		    set_state(target, key, value);
		}
	    }
	}
    }
    
    update_output();
}

function set_hash_options() {
    var targets = [], keys, defaults;
    var js_targets = document.getElementsByClassName('js-target');
    
    for (var i=0; i < js_targets.length; i++) {
	js_target = js_targets[i];
	target = js_target.id;
    
	//Get defaults
	defaults = childByClass(js_target, "js-defaults").dataset || {}
	
	//Get keys and values
	dataset = js_target.dataset;
	keys = [];
	for (key in dataset) {
	    value = dataset[key];
	    
	    // Get changed values
	    if (value != defaults[key]) {
		keys.push(key + "=" + encodeHash(value));
	    }
	}
	
	//Only add targets with changed values
	if (keys.length) {
	    targets.push(target + "." + keys.join(";"));
	}
    }
    
    window.location.hash = targets.join("&");
}

function set_state(target, key, value, back) {
    var js_target = document.getElementById(target);
    if ((typeof back == "string") && (js_target.dataset[key] == value)) {
	js_target.dataset[key] = back;
    }
    else {
	js_target.dataset[key] = value;
    }
    set_hash_options();
}

function actor_state(event) {
    //event.preventDefault()
    var target = this.dataset.target;
    var key = this.dataset.key;
    var value = this.dataset.value;
    var back = this.dataset.back;
    set_state(target, key, value, back);
    update_output();
    this.blur();
}

function input_state() {
    console.log(this.value)
    var target = this.dataset.target;
    var key = this.dataset.key;
    var value = this.value;
    set_state(target, key, value);
    update_output();
}

function update_output() {
    var js_target = document.getElementById("phockup");
    var phockup = js_target.dataset;
    var output = childByClass(js_target, "output");
    var command = [];
    
    output.classList.remove("valid");
    
    //Mutual exclusion for --move and --link
    if (phockup["move"] == "true") {
	phockup["link"] = "false";
    }
	
    //Only create command with valid input and output
    if (phockup["input"] && phockup["output"]) {
	var options = {};
	var key, value;
	
	//Input & Output
	options["input"] = escapePath(phockup["input"]);
	options["output"] = escapePath(phockup["output"]);
	
	//Action
	if (phockup["move"] == "true") {
	    options["move"] = "--move"
	}
	else if (phockup["link"] == "true") {
	    options["link"] = "--link";
	}
	
	//Text inputs
	var keys = ["date", "regex"];
	for (var i in keys) {
	    key = keys[i];
	    value = phockup[key];
	    if (value != "") {
		options[key] = "--" + key.replace("_", "-") + " " + escapePath(value);
	    }
	}
	
	//Bollean options
	keys = ["timestamp", "original_names"];
	for (var i in keys) {
	    key = keys[i];
	    value = phockup[key];
	    if (value == "true") {
		options[key] = "--" + key.replace("_", "-");
	    }
	}
	
	//Correct order
	var order = ["input", "output", "date", "move", "link", "original_names", "regex", "timestamp"];
	command.push("phockup");
	for (var i in order) {
	    key = order[i];
	    if (options[key]) {
		command.push(options[key])
	    }
	}
    }
    
    output.innerHTML = command.join(" ");
    update_GUI();
}

update_GUI = function() {
    var targets = {
	"phockup" : document.getElementById("phockup").dataset,
	"app" : document.getElementById("app").dataset
    }
    
    //Action
    if (targets["phockup"]["move"] == "true") {
	document.getElementById("action_move").checked = true;
    }
    else if (targets["phockup"]["link"] == "true") {
	document.getElementById("action_link").checked = true;
    }
    else {
	document.getElementById("action_copy").checked = true;
    }
	
    //UI elements
    var js_ui = document.getElementsByClassName('js-ui');
    var ui, type;
	
    for (var i=0; i < js_ui.length; i++) {
	ui = js_ui[i];
	type = ui.dataset["ui"];
	
	if (type == "checked") {
	    if (targets[ui.dataset["target"]][ui.dataset["key"]] == "true") {
		ui.checked = true;
	    }
	    else {
		ui.checked = false;
	    }
	}
	
	else if (type == "input") {
	    ui.value = targets[ui.dataset["target"]][ui.dataset["key"]];
	}
	
	else if (type == "text") {
	    ui.innerHTML = targets[ui.dataset["target"]][ui.dataset["key"]];
	}
    }
    
}

window.onload = function() {
    
    var phockup = document.getElementById("phockup");
    
    get_hash_options();
    
    var actors = document.getElementsByClassName('js-actor');
    for (var i=0; i < actors.length; i++) {
	actors[i].addEventListener( 'click', actor_state);
    }
    
    var inputs = document.getElementsByClassName('js-input');
    for (var i=0; i < inputs.length; i++) {
	inputs[i].addEventListener( 'change', input_state);
    }
    
    
}
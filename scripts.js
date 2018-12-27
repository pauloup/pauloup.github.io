function get_allowed_options(id) {
    js_target = document.getElementById(id);
    if (!js_target) {
	return {}
    }
    
    //Get js-allowed with allowed keys and values
    var js_allowed = {};
    for (var i = 0; i < js_target.childNodes.length; i++) {
	if (js_target.childNodes[i].className == "js-allowed") {
	    js_allowed = js_target.childNodes[i].dataset;
	    break
	}
    }

    //Get allowed list
    var allowed = {};
    for (var key in js_allowed) {
	allowed[key] = js_allowed[key].split(";");
    }
    
    return allowed;
}

function get_hash_options() {
    var allowed = {};
    var hash_data = window.location.hash.substring(1).split("&")
    
    for (var i=0; i < hash_data.length; i++) {
	
	//Get (id, key, value) for each option
	option = hash_data[i].split(".");
	id = option[0];
	pair = option[1];
	if (id && pair) {
	    pair = pair.split("=");
	    key = pair[0];
	    value = pair[1];
	    if (!key || !value) {
		continue
	    }
	}
	else {
	    continue
	}
	
	//Get target and allowed keys
	if (!allowed[id]) {
	    allowed[id] = get_allowed_options(id);
	}
	
	if (key == "date") {
	    console.log(allowed[id][key])
	}
	//Set state if value is allowed
	if ((allowed[id][key].indexOf("*") > -1) ||
	    (allowed[id][key].indexOf(value) > -1)) {
	    set_state(id, key, value);
	}
    }
}

function set_hash_options() {
    var hash = []
    var js_targets = document.getElementsByClassName('js-target');
    
    for (var i=0; i < js_targets.length; i++) {
	target = js_targets[i];
	id = target.id;
    
	//console.log(js_targets.length, target);
	//Get defaults
	defaults = {};
	for (var j = 0; j < target.childNodes.length; j++) {
	    if (target.childNodes[j].className == "js-defaults") {
		defaults = target.childNodes[j].dataset;
		break
	    }
	}
	
	//Print changed values
	dataset = target.dataset;
	for (key in dataset) {
	    value = dataset[key];
	    console.log(id, value, defaults[key]);
	    if (value != defaults[key]) {
		hash.push(id + "." + key + "=" + value);
	    }
	}
    }
    
    window.location.hash = hash.join("&");
}

function set_state(target, key, value, back) {
    target = document.getElementById(target);
    if ((back != undefined) && (target.dataset[key] == value)) {
	target.dataset[key] = back;
    }
    else {
	target.dataset[key] = value;
    }
    set_hash_options();
}

function actor_state(event) {
    var target = this.dataset.target;
    var key = this.dataset.data;
    var value = this.dataset.value;
    var back = this.dataset.back;
    set_state(target, key, value, back);
    this.blur()
}
  
window.onload = function(){
    
    get_hash_options();
    
    var actors = document.getElementsByClassName('js-actor');
    
    for (var i=0; i < actors.length; i++) {
	actors[i].addEventListener( 'click', actor_state);
    }
}
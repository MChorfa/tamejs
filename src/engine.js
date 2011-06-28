
//-----------------------------------------------------------------------
//
//  A piece of output as output by the compilation engine

function Output (fnName, startLine) {

    this._fnName = fnName;
    this._lines = [];
    this._indent = 0;

    this.indent = function () { this._indent ++; };
    this.unindent = function () { this._indent--; };
    this.fnName = function () { return this._fnName; }

    this.fnNameList = function () {
	if (this._fnName) { return [ this._fnName ] ; }
	else { return []; }
    };

    this.localLabelName = function (l) {
	return "__k_local_" + l;
    };

    this.addLine = function (l) {
	this._lines.push ([this._indent, l]);
    };

    this.addLines = function (v) {
	for (var i in v) {
	    this.addLine (v[i]);
	}
    };

    this.addOutput = function (o) {
	for (var i in o._lines) {
	    var line = o._lines[i];
	    this._lines.push ([this._indent + line[0], line[1]]);
	}
    };

    this.initLocalLabel = function (l) {
	this.addLine ("var " + l + " = {};");
    };

    this.populateLabels = function (lbl, k_cont, k_break) {
	if (k_break) {
	    this.addLine ("tame.__k_global.k_break = " + k_break + ";");
	}
	if (k_cont) {
	    this.addLine ("tame.__k_global.k_continue = " + k_cont + ";");
	}
	if (k_break && lbl) {
	    this.addLine (lbl + ".k_break = " + k_break + ";");
	}
	if (k_cont && lbl) {
	    this.addLine (lbl + ".k_continue = " + k_cont + ";");
	}

    };

    this.addLambda = function (fn) {
	this.addLine ("var " + fn + " = function (" + 
		      this.genericCont () + ") {");
	this.indent ();
    };

    this.closeLambda = function () {
	this.unindent ();
	this.addLine ("};");
    };

    this.genericCont = function () { return "k"; }

    this.addCall = function (calls) {
	calls.push (this.genericCont ());
	var cc = "tame.callChain ([" + calls.join (", ") + "]);";
	this.addLine (cc);
    };
    
    this._cachedIndents = {};
    this.outputIndent = function (n) {
	var ret;
	if (this._cachedIndents[n]) {
	    ret = this._cachedIndents[n];
	} else {
	    var spc = "    ";
	    var v = []
	    for (var i = 0; i < n; i++) {
		v.push (spc);
	    }
	    ret = v.join ("");
	    this._cachedIndents[n] = ret;
	}
	return ret;
    };

    this.formatOutputLines = function () {
	var out = [];
	for (var i in this._lines) {
	    var l = this._lines[i];
	    var line = this.outputIndent (l[0]) + l[1];
	    out.push (line);
	}
	return out;
    };

    this.formatOutput = function () {
	return this.formatOutputLines().join ("\n");
    };

    this.inlineOutput = function () {
	return this.formatOutputLines().join (" ");
    };

    this.dump = function () {
	console.log (this.formatOutput ());
    };

    return this;
};

//-----------------------------------------------------------------------

function Engine () {

    this._fnId = 0;

    this.fnFresh = function () {
	var id = this._fnId;
	this._fnId ++;
	return "__tame_fn_" + id;
    };

    this.run = function (node) {
	return node.compile (this);
    };


    this.Output = Output;
    return this;
};

//-----------------------------------------------------------------------

exports.Engine = Engine;
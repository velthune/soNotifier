

// Importing modules

const fs = require('fs');
const jsdom = require("jsdom");
const notifier = require('node-notifier');
const open = require('open');
const file = "log"

// Define variables

var timeout = 1; // seconds
var site = "http://stackoverflow.com/questions/"
var questions = []; 
var transporter;

// Define functions

function observeQuestions() {
	checkQuestion(0);
}

// Check question at it index.
function checkQuestion(index) {
	var questionsCount = Object.keys(questions).length;
	if (questionsCount > index) {
		var question = Object.keys(questions)[index];
		jsdom.env(
			  site + question,
			  ["http://code.jquery.com/jquery.js"],
			  function (err, window) {
			  	var answers = window.$(".answer").length;
			  	console.log("Question", question, "have", answers, "answer (was ",questions[question],").")
			  	if (answers != questions[question]) {
			  		notifyWithGrowl(question);
			  		questions[question] = answers;
					updateObservableQuestions();
			  	}
			  	checkQuestion(index + 1);
			  }
			);
	} else {
		console.log("");
		startObserver();
	}
}

function startObserver() {
	setTimeout(function () {
  		observeQuestions(); 
	}, timeout * 1000);
}

function init() {
	loadObservableQuestions();
	startObserver();
}

function updateObservableQuestions() {
	fs.writeFileSync(file, JSON.stringify(questions), 'utf8');
}

function loadObservableQuestions() {
	questions = JSON.parse(fs.readFileSync(file, 'utf8'));
}

function notifyWithGrowl(question) {
	var text = "New answer for question: " + site + question;
	var title = "Stackoverflow notification.";
	notifier.notify({
	  title: title,
	  message: text,
	  sound: true 
	}, function (err, response) {
	});	
	notifier.on('click', function (notifierObject, options) {
		var html = options.message.split(": ")[1];
  		open(html);
	});
}

init();
/*************************************************
    Language Generator    ----    generator.js
	by Robbie Antenesse, Alamantus GameDev
*************************************************/
var allowConsecutiveConsonants = dieRoll(6),
	allowConsecutiveVowels = dieRoll(4),
	hasAdverbs = coinFlip(),
	hasPronouns = coinFlip(),
	hasArticles = coinFlip(),
	hasPossessive = coinFlip(),
	hasContractions = coinFlip(),
	hasClicks = dieRoll(6),
	allowMergeWords = dieRoll(10);
var consonants = [];
var vowels = [];
var tenses = [];
var languageName, pluralFix, verbFix, possessiveIndicator, definiteArticle, direction, sentenceOrder, descriptiveOrder;
var possibleFixes = ["pre", "suf", "any", "non"];		//Prefix, suffix, prefix or suffix, or none
var possibleTenses = ["Present", "Present Progressive", "Present Perfect", "Present Perfect Progressive", "Past", "Past Progressive", "Past Perfect", "Past Perfect Progressive", "Future", "Future Progressive", "Future Perfect", "Future Perfect Progressive", "Theoretical", "Theoretical Progressive", "Theoretical Perfect", "Theoretical Perfect Progressive"];
var possibleDirections = ["left-to-right", "right-to-left", "top-to-bottom, left-to-right", "top-to-bottom, right-to-left"];
var possibleSentenceOrders = ["subject-verb-object", "verb-subject-object", "verb-object-subject", "object-verb-subject", "object-subject-verb", "subject-object-verb"];
var possibleDescriptiveOrders = ["adverb-adjective-noun", "adjective-adverb-noun", "adjective-noun-adverb", "adverb-noun-adjective", "noun-adjective-adverb", "noun-adverb-adjective"];

var MAXLANGUAGENAMELENGTH = 8;
var MINLANGUAGENAMELENGTH = 3;
var MAXWORDLENGTH = 15;
var MINWORDLENGTH = 1;

var possiblePunctuation = [".", ",", ";", ":", "'", "&lt;", "&gt;", "(", ")", "\"", "\\", "/"];
if (!hasClicks) {
	possiblePunctuation.push("!");
}
var punctuation = {
	end		: choosePunctuation(),
	pause	: choosePunctuation(),
	quote	: choosePunctuation(),
	separate: choosePunctuation(),
	question: choosePunctuation(),
	exclam	: choosePunctuation(),
	possess	: choosePunctuation()
}

var dictionary = {
	nouns		: [],
	pronouns	: [],
	adjectives	: [],
	verbs		: [],
	prepositions: [],
	adverbs		: [],
	conjunctions: []
};

function writeLanguageToPage() {
	buildLanguage();
	
	document.getElementById("languagename").innerHTML = languageName;
	document.getElementById("consonants").innerHTML = ((hasClicks)? " (includes Clicks)<br />" : "") + consonants.join(", ");
	document.getElementById("consecutiveconsonants").innerHTML = ((allowConsecutiveConsonants)? "Yes" : "No");
	document.getElementById("vowels").innerHTML = vowels.join(", ");
	document.getElementById("consecutivevowels").innerHTML = ((allowConsecutiveVowels)? "Yes" : "No");
	document.getElementById("plural").innerHTML = pluralFix;
	document.getElementById("useadverbs").innerHTML = ((hasAdverbs)? "Yes" : "No");
	document.getElementById("tenses").innerHTML = ((verbFix == "non" || !tenses)? "No Verb Tenses" : tenses.sort().join("<br />"));
	document.getElementById("definitearticle").innerHTML = definiteArticle;
	document.getElementById("usearticle").innerHTML = ((hasArticles)? "Yes" : "No");
	document.getElementById("usepronoun").innerHTML = ((hasPronouns)? "Yes" : "No");
	document.getElementById("usepossessive").innerHTML = ((hasPossessive)? "Yes &mdash; " + possessiveIndicator : "No");
	document.getElementById("usecontraction").innerHTML = ((hasContractions)? "Yes" : "No");
	document.getElementById("mergewords").innerHTML = ((allowMergeWords)? "Yes" : "No");
	document.getElementById("direction").innerHTML = direction;
	document.getElementById("sentenceorder").innerHTML = sentenceOrder;
	document.getElementById("descriptiveorder").innerHTML = descriptiveOrder;
    
    writeDictionary("nouns");
    if (hasPronouns) {
        document.getElementById("pronouns").innerHTML = dictionary.pronouns.join("<br />");
    } else {
        document.getElementById("pronouns").innerHTML = "N/A";
    }
    writeDictionary("adjectives");
    writeDictionary("verbs");
    writeDictionary("prepositions");
    if (hasAdverbs) {
        writeDictionary("adverbs");
    } else {
        document.getElementById("adverbs").innerHTML = "N/A";
    }
    writeDictionary("conjunctions");
    
    buildSampleSentences();
}

function buildLanguage() {
	consonants = chooseLetters("consonants");
	vowels = chooseLetters("vowels");
	languageName = generateWord(MINLANGUAGENAMELENGTH, MAXLANGUAGENAMELENGTH, true);
	chooseTenses();
	pluralFix = choosePlural();
	definiteArticle = generateWord(MINWORDLENGTH, 4, false);
	possessiveIndicator = choosePossessiveIndicator();
	direction = possibleDirections[randomInt(0, possibleDirections.length)];
	sentenceOrder = possibleSentenceOrders[randomInt(0, possibleSentenceOrders.length)];
	descriptiveOrder = possibleDescriptiveOrders[randomInt(0, possibleDescriptiveOrders.length)];
	generateAllDictionaries();
}

function chooseLetters(type) {
	var resultLetters = [];
	if (type == "consonants") {
		var possibleConsonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z", "\u0299", "\u03B2", "\u0255", "\u00E7", "\u0256", "\u00F0", "\u02A4", "\u025F", "\u0261", "\u0262", "\u0266", "\u0267", "\u0127", "\u0265", "\u029C", "\u029D", "\u026D", "\u026C", "\u026B", "\u026E", "\u029F", "\u0271", "\u0270", "\u014B", "\u0273", "\u0272", "\u0274", "\u0278", "\u03B8", "\u0279", "\u027A", "\u027E", "\u027B", "\u0280", "\u0281", "\u027D", "\u0282", "\u0283", "\u0288", "\u02A7", "\u028B", "\u2C71", "\u0263", "\u028D", "\u03C7", "\u028E", "\u0291", "\u0290", "\u0292", "\u0294", "\u02A1", "\u0295", "\u02A2"];
		var countTo = possibleConsonants.length;
		if (hasClicks) {
			possibleConsonants.push("\u0298", "\u01C1", "\u01C2", "|", "!", "\u0253", "\u0257", "\u0284", "\u0260", "\u029B", "p\u02BC", "t\u032A\u02BC", "t\u02BC", "\u0288\u02BC", "c\u02BC", "k\u02BC", "q\u02BC", "f\u02BC", "\u03B8\u02BC", "s\u02BC", "\u026C\u02BC", "\u0283\u02BC", "\u0282\u02BC", "\u0255\u02BC", "x\u02BC", "\u03C7\u02BC", "ts\u02BC", "t\u026C\u02BC", "c\u028E\u031D\u0325?\u02BC", "t\u0283\u02BC", "\u0288\u0282\u02BC", "kx\u02BC", "k\u029F\u031D\u030A\u02BC", "q\u03C7\u02BC");
		}
		
		countTo = possibleConsonants.length;
		for (var i = 0; i < countTo; i++) {
			if (coinFlip()) {
				resultLetters.push(possibleConsonants[i]);
			}
		}
		
	} else if (type == "vowels") {
		var possibleVowels = ["a", "\u0251", "\u0250", "\u0252", "\u00E6", "e", "\u0258", "\u025B", "\u025C", "\u025E", "iy", "\u0268", "\u026A", "\u028F", "o", "\u00F8", "\u0275", "\u0153", "\u0276", "\u0264", "\u028A", "u", "\u026F", "\u0289", "\u028C", "\u0254"];
		var countTo = possibleVowels.length;
		
		countTo = possibleVowels.length;
		for (var i = 0; i < countTo; i++) {
			if ((Math.random() * 5) > 2) {   //60% chance of allowing vowel
				resultLetters.push(possibleVowels[i]);
			}
		}
		
	} else {
		alert("Invalid Letter Type Specified");
	}
	return resultLetters;
}

function chooseTenses() {
	verbFix = possibleFixes[randomInt(0, possibleFixes.length)];
	
	var numberOfTenses = randomInt(0, possibleTenses.length);
	
	if (verbFix == "non" || numberOfTenses <= 0) {
		tenses = false;
	} else {
		for (var i = 0; i < numberOfTenses; i++) {
			var tense = createUnusedTense(tenses);
			tenses.push(tense);
		}
	}
}
function createUnusedTense(usedTenses) {
	var resultingTense = generateWord(0, 5);
	
	switch (verbFix) {
		case "pre":
			resultingTense = "Prefixed &ldquo;<strong>" + resultingTense + "</strong>&rdquo;";
			break;
		case "suf":
			resultingTense = "Suffixed &ldquo;<strong>" + resultingTense + "</strong>&rdquo;";
			break;
		default:
			if (coinFlip()) {
				resultingTense = "Prefixed &ldquo;<strong>" + resultingTense + "</strong>&rdquo;";
			} else {
				resultingTense = "Suffixed &ldquo;<strong>" + resultingTense + "</strong>&rdquo;";
			}
			break;
	}
	
	var tense = randomInt(0, possibleTenses.length);
	resultingTense = possibleTenses[tense] + ": " + resultingTense;
	possibleTenses.splice(tense, 1);
	
	return resultingTense;
}

function choosePunctuation() {
	var punct = randomInt(0, possiblePunctuation.length);
	var result = possiblePunctuation[punct];
	possibleTenses.splice(punct, 1);
	return result;
}

function choosePlural() {
	var resultingPlural = generateWord(0, 2);
	
	var possessiveFix = possibleFixes[randomInt(0, possibleFixes.length-1)];
	switch (possessiveFix) {
		case "pre":
			resultingPlural = "Prefixed &ldquo;<strong>" + resultingPlural + "</strong>&rdquo;";
			break;
		case "suf":
			resultingPlural = "Suffixed &ldquo;<strong>" + resultingPlural + "</strong>&rdquo;";
			break;
		default:
			if (coinFlip()) {
				resultingPlural = "Prefixed &ldquo;<strong>" + resultingPlural +"</strong>&rdquo;";
			} else {
				resultingPlural = "Suffixed &ldquo;<strong>" + resultingPlural + "</strong>&rdquo;";
			}
			break;
	}
	return resultingPlural;
}

function choosePossessiveIndicator() {
	var resultingPossessive = generateWord(0, 4);
	
	var possessiveFix = possibleFixes[randomInt(0, possibleFixes.length-1)];
	switch (possessiveFix) {
		case "pre":
			resultingPossessive = "Prefixed &ldquo;<strong>" + resultingPossessive + punctuation.possess + "</strong>&rdquo;";
			break;
		case "suf":
			resultingPossessive = "Suffixed &ldquo;<strong>" + punctuation.possess + resultingPossessive + "</strong>&rdquo;";
			break;
		default:
			if (coinFlip()) {
				resultingPossessive = "Prefixed &ldquo;<strong>" + resultingPossessive + punctuation.possess + "</strong>&rdquo;";
			} else {
				resultingPossessive = "Suffixed &ldquo;<strong>" + punctuation.possess + resultingPossessive + "</strong>&rdquo;";
			}
			break;
	}
	return resultingPossessive;
}

function buildSampleSentences() {
	var resultSentences = "";
	var sentenceNouns = [],
        sentenceAdjectives = [],
        sentenceAdverbs = [],
        sentenceVerbs = [],
        sentencePronouns = [],
        sentencePrepositions = [],
        sentenceConjunctions = [];
	var nounBlocks = [];
	for (var i = 0; i < 8; i++) {
		sentenceNouns.push(dictionary.nouns[randomInt(0,(dictionary.nouns.length - 1))]);
		sentenceAdjectives.push(dictionary.adjectives[randomInt(0,(dictionary.adjectives.length - 1))]);
		sentenceAdverbs.push(dictionary.adverbs[randomInt(0,(dictionary.adverbs.length - 1))]);
		sentenceVerbs.push(dictionary.verbs[randomInt(0,(dictionary.verbs.length - 1))]);
		sentencePronouns.push(dictionary.pronouns[randomInt(0,(dictionary.pronouns.length - 1))]);
		sentencePrepositions.push(dictionary.prepositions[randomInt(0,(dictionary.prepositions.length - 1))]);
		sentenceConjunctions.push(dictionary.conjunctions[randomInt(0,(dictionary.conjunctions.length - 1))]);
	}

    resultSentences += '<div>';
	switch (descriptiveOrder) {
		case "adverb-adjective-noun":
			for (var i = 0; i < 4; i++) {
				nounBlocks.push(((hasAdverbs) ? (sentenceAdverbs[i] + " ") : "") + sentenceAdjectives[i] + " " + sentenceNouns[i]);
			}
			break;
		case "adjective-adverb-noun":
			for (var i = 0; i < 4; i++) {
				nounBlocks.push(sentenceAdjectives[i] + " " + ((hasAdverbs) ? (sentenceAdverbs[i] + " ") : "") + sentenceNouns[i]);
			}
			break;
		case "adjective-noun-adverb":
			for (var i = 0; i < 4; i++) {
				nounBlocks.push(sentenceAdjectives[i] + " " + sentenceNouns[i] + ((hasAdverbs) ? (" " + sentenceAdverbs[i]) : ""));
			}
			break;
		case "adverb-noun-adjective":
			for (var i = 0; i < 4; i++) {
				nounBlocks.push(((hasAdverbs) ? (sentenceAdverbs[i] + " ") : "") + sentenceNouns[i] + " " + sentenceAdjectives[i]);
			}
			break;
		case "noun-adjective-adverb":
			for (var i = 0; i < 4; i++) {
				nounBlocks.push(sentenceNouns[i] + " " + sentenceAdjectives[i] + ((hasAdverbs) ? (sentenceAdverbs[i] + " ") : ""));
			}
			break;
		case "noun-adverb-adjective":
			for (var i = 0; i < 4; i++) {
				nounBlocks.push(sentenceNouns[i] + " " + ((hasAdverbs) ? (sentenceAdverbs[i] + " ") : "") + sentenceAdjectives[i]);
			}
			break;
	}
	
    resultSentences += "<ul>";
	switch (sentenceOrder) {
		case "subject-verb-object":
			resultSentences += "<li>" + definiteArticle + " " + sentenceNouns[0] + " " + sentenceVerbs[0] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[0] + " " + sentenceVerbs[1] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[1] + " " + sentenceVerbs[2] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[2] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[2] + " " + sentenceVerbs[3] + " " + definiteArticle + " " + sentenceNouns[3] + " " + sentenceConjunctions[0] + " " + definiteArticle + " " + nounBlocks[1] + " " + sentenceVerbs[4] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[3] + " " + sentenceVerbs[5] + " " + sentencePrepositions[1] + " " + definiteArticle + " " + sentenceNouns[5] + " " + sentenceConjunctions[0] + " " + definiteArticle + " " + nounBlocks[1] + " " + sentenceVerbs[6] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[6] + "</li>";
			break;
		case "verb-subject-object":
			resultSentences += "<li>" + sentenceVerbs[0] + " " + definiteArticle + " " + sentenceNouns[0] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + sentenceVerbs[1] + " " + definiteArticle + " " + nounBlocks[0] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + sentenceVerbs[2] + " " + definiteArticle + " " + nounBlocks[1] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[2] + "</li>";
			resultSentences += "<li>" + sentenceVerbs[3] + " " + definiteArticle + " " + nounBlocks[2] + " " + definiteArticle + " " + sentenceNouns[3] + " " + sentenceConjunctions[0] + " " + sentenceVerbs[2] + " " + definiteArticle + " " + nounBlocks[1] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + sentenceVerbs[3] + " " + definiteArticle + " " + nounBlocks[3] + " " + sentencePrepositions[1] + " " + definiteArticle + " " + sentenceNouns[5] + " " + sentenceConjunctions[0] + " " + sentenceVerbs[2] + " " + definiteArticle + " " + nounBlocks[1] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[6] + "</li>";
			break;
		case "verb-object-subject":
			resultSentences += "<li>" + sentenceVerbs[0] + " " + definiteArticle + " " + sentenceNouns[0] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + sentenceVerbs[1] + " " + definiteArticle + " " + nounBlocks[0] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + sentenceVerbs[2] + " " + definiteArticle + " " + nounBlocks[1] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[2] + "</li>";
			resultSentences += "<li>" + sentenceVerbs[3] + " " + definiteArticle + " " + nounBlocks[2] + " " + definiteArticle + " " + sentenceNouns[3] + " " + sentenceConjunctions[0] + " " + sentenceVerbs[2] + " " + definiteArticle + " " + nounBlocks[1] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + sentenceVerbs[3] + " " + definiteArticle + " " + nounBlocks[3] + " " + sentencePrepositions[1] + " " + definiteArticle + " " + sentenceNouns[5] + " " + sentenceConjunctions[0] + " " + sentenceVerbs[2] + " " + definiteArticle + " " + nounBlocks[1] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[6] + "</li>";
			break;
		case "object-verb-subject":
			resultSentences += "<li>" + definiteArticle + " " + sentenceNouns[0] + " " + sentenceVerbs[0] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[0] + " " + sentenceVerbs[1] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[1] + " " + sentenceVerbs[2] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[2] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[2] + " " + sentenceVerbs[3] + " " + definiteArticle + " " + sentenceNouns[3] + " " + sentenceConjunctions[0] + " " + definiteArticle + " " + nounBlocks[1] + " " + sentenceVerbs[2] + " " + definiteArticle + " " + sentenceNouns[1] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[3] + " " + sentenceVerbs[4] + " " + sentencePrepositions[1] + " " + definiteArticle + " " + sentenceNouns[5] + " " + sentenceConjunctions[0] + " " + definiteArticle + " " + nounBlocks[1] + " " + sentenceVerbs[2] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[6] + "</li>";
			break;
		case "object-subject-verb":
			resultSentences += "<li>" + definiteArticle + " " + sentenceNouns[0] + " " + definiteArticle + " " + sentenceNouns[1] + " " + sentenceVerbs[0] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[0] + " " + definiteArticle + " " + sentenceNouns[1] + " " + sentenceVerbs[1] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[1] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[2] + " " + sentenceVerbs[2] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[2] + " " + definiteArticle + " " + sentenceNouns[3] + " " + sentenceVerbs[3] + " " + sentenceConjunctions[0] + " " + definiteArticle + " " + nounBlocks[1] + " " + definiteArticle + " " + sentenceNouns[1] + " " + sentenceVerbs[2] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[3] + " " + sentencePrepositions[1] + " " + definiteArticle + " " + sentenceNouns[5] + " " + sentenceVerbs[4] + " " + sentenceConjunctions[0] + " " + definiteArticle + " " + nounBlocks[1] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[6] + " " + sentenceVerbs[2] + "</li>";
			break;
		case "subject-object-verb":
			resultSentences += "<li>" + definiteArticle + " " + sentenceNouns[0] + " " + definiteArticle + " " + sentenceNouns[1] + " " + sentenceVerbs[0] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[0] + " " + definiteArticle + " " + sentenceNouns[1] + " " + sentenceVerbs[1] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[1] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[2] + " " + sentenceVerbs[2] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[2] + " " + definiteArticle + " " + sentenceNouns[3] + " " + sentenceVerbs[3] + " " + sentenceConjunctions[0] + " " + definiteArticle + " " + nounBlocks[1] + " " + definiteArticle + " " + sentenceNouns[1] + " " + sentenceVerbs[2] + "</li>";
			resultSentences += "<li>" + definiteArticle + " " + nounBlocks[3] + " " + sentencePrepositions[1] + " " + definiteArticle + " " + sentenceNouns[5] + " " + sentenceVerbs[4] + " " + sentenceConjunctions[0] + " " + definiteArticle + " " + nounBlocks[1] + " " + sentencePrepositions[0] + " " + definiteArticle + " " + sentenceNouns[6] + " " + sentenceVerbs[2] + "</li>";
			break;
	}
	resultSentences += "</ul>";
    
	resultSentences += "</div>";
    document.getElementById("sentences").innerHTML = resultSentences;
}

function generateAllDictionaries() {
    generateDictionary("noun", 100, 150, MINWORDLENGTH, MAXWORDLENGTH);
	generateDictionary("verb", 75, 150, MINWORDLENGTH, 10);
	generateDictionary("adjective", 50, 100, MINWORDLENGTH, MAXWORDLENGTH);
	generateDictionary("preposition", 25, 100, MINWORDLENGTH, 6);
	if (hasPronouns) generateDictionary("pronoun", 1, 24, MINWORDLENGTH, 5);
	if (hasAdverbs) generateDictionary("adverb", 40, 100, MINWORDLENGTH, 7);	//Need adverb -fix identifier!
	generateDictionary("conjunction", 1, 12, MINWORDLENGTH, 5);
}

function generateDictionary(partOfSpeech, minNumberOfWords, maxNumberOfWords, minWordLength, maxWordLength) {
	var numberOfWords = randomInt(minNumberOfWords, maxNumberOfWords + 1);
    
    document.getElementById(partOfSpeech + "s").innerHTML = "Fetching " + numberOfWords.toString() + " words. Please wait...";
    
	for (var i = 0; i < numberOfWords; i++) {
		dictionary[partOfSpeech + "s"].push(generateUniqueWord(minWordLength, maxWordLength));
	}
}

function generateWord(minLength, maxLength, capitalize) {
	var resultingWord = "";
	var numberOfLetters = randomInt(minLength, maxLength);
	//Add a first letter
	if (coinFlip()) {
		resultingWord += (capitalize) ? vowels[randomInt(0, vowels.length)].toUpperCase() : vowels[randomInt(0, vowels.length)];
	} else {
		resultingWord += (capitalize) ? consonants[randomInt(0, consonants.length)].toUpperCase() : consonants[randomInt(0, consonants.length)];
	}
	for (var i = 0; i < numberOfLetters; i++) {
		if (resultingWord.length > maxLength) {
			break;
		} else {
			resultingWord += addRandomLetter(resultingWord);
		}
	}
	
	return resultingWord;
}

function generateUniqueWord(minLength, maxLength, capitalize) {
	var resultingWord = generateWord(minLength, maxLength, capitalize);
	
	if (resultingWord == definiteArticle
		|| resultingWord == languageName
		|| dictionary.nouns.indexOf(resultingWord) > 0
		|| dictionary.pronouns.indexOf(resultingWord) > 0
		|| dictionary.adjectives.indexOf(resultingWord) > 0
		|| dictionary.verbs.indexOf(resultingWord) > 0
		|| dictionary.prepositions.indexOf(resultingWord) > 0
		|| dictionary.adverbs.indexOf(resultingWord) > 0
		|| dictionary.conjunctions.indexOf(resultingWord) > 0)
	{
		return generateUniqueWord(minLength, maxLength, capitalize);
	} else {
		return resultingWord;
	}
}

function addRandomLetter(wordToCheck) {
	var resultLetter = "";
	var lastLetter = wordToCheck.slice(-1);
	if (allowConsecutiveConsonants && allowConsecutiveVowels) {
		if (coinFlip()) {
			resultLetter += vowels[randomInt(0, vowels.length)];
		} else {
			resultLetter += consonants[randomInt(0, consonants.length)];
		}
	} else if (allowConsecutiveConsonants && !allowConsecutiveVowels) {
		if (stringIsInArray(lastLetter, vowels)) {
			resultLetter += consonants[randomInt(0, consonants.length)];
		} else {
			if (coinFlip()) {
				resultLetter += vowels[randomInt(0, vowels.length)];
			} else {
				resultLetter += consonants[randomInt(0, consonants.length)];
			}
		}
	} else if (!allowConsecutiveConsonants && allowConsecutiveVowels) {
		if (stringIsInArray(lastLetter, consonants)) {
			resultLetter += vowels[randomInt(0, vowels.length)];
		} else {
			if (coinFlip()) {
				resultLetter += vowels[randomInt(0, vowels.length)];
			} else {
				resultLetter += consonants[randomInt(0, consonants.length)];
			}
		}
	} else {
		if (stringIsInArray(lastLetter, consonants)) {
			resultLetter += vowels[randomInt(0, vowels.length)];
		} else {
			resultLetter += consonants[randomInt(0, consonants.length)];
		}
	}
	return resultLetter;
}

function writeDictionary (dictionaryToWrite) {
    dictionary[dictionaryToWrite].sort();
    var text = "";
    for (var i = 0; i < dictionary[dictionaryToWrite].length; i++) {
        text += dictionary[dictionaryToWrite][i] + "<br>";
    }
    document.getElementById(dictionaryToWrite).innerHTML = text;
}

function CreateNewLanguage() {
    //Reset All Variables
    allowConsecutiveConsonants = dieRoll(6);
	allowConsecutiveVowels = dieRoll(4);
	hasAdverbs = coinFlip();
	hasPronouns = coinFlip();
	hasArticles = coinFlip();
	hasPossessive = coinFlip();
	hasContractions = coinFlip();
	hasClicks = dieRoll(6);
	allowMergeWords = dieRoll(10);
    consonants = [];
    vowels = [];
    tenses = [];
    possibleFixes = ["pre", "suf", "any", "non"];		//Prefix, suffix, prefix or suffix, or none
    possibleTenses = ["Present", "Present Progressive", "Present Perfect", "Present Perfect Progressive", "Past", "Past Progressive", "Past Perfect", "Past Perfect Progressive", "Future", "Future Progressive", "Future Perfect", "Future Perfect Progressive", "Theoretical", "Theoretical Progressive", "Theoretical Perfect", "Theoretical Perfect Progressive"];
    possibleDirections = ["left-to-right", "right-to-left", "top-to-bottom, left-to-right", "top-to-bottom, right-to-left"];
    possibleSentenceOrders = ["subject-verb-object", "verb-subject-object", "verb-object-subject", "object-verb-subject", "object-subject-verb", "subject-object-verb"];
    possibleDescriptiveOrders = ["adverb-adjective-noun", "adjective-adverb-noun", "adjective-noun-adverb", "adverb-noun-adjective", "noun-adjective-adverb", "noun-adverb-adjective"];

    possiblePunctuation = [".", ",", ";", ":", "'", "&lt;", "&gt;", "(", ")", "\"", "\\", "/"];
    if (!hasClicks) {
        possiblePunctuation.push("!");
    }
    punctuation.end = choosePunctuation(),
    punctuation.pause = choosePunctuation();
    punctuation.quote = choosePunctuation();
    punctuation.separate = choosePunctuation();
    punctuation.question = choosePunctuation();
    punctuation.exclam = choosePunctuation();
    punctuation.possess = choosePunctuation();

    dictionary.nouns = [];
    dictionary.pronouns = [];
    dictionary.adjectives = [];
    dictionary.verbs = [];
    dictionary.prepositions = [];
    dictionary.adverbs = [];
    dictionary.conjunctions = [];
    
    writeLanguageToPage();
}

function coinFlip() {
    //Returns true or false;
	return (Math.floor(Math.random() * 2) == 0);
}
function dieRoll(sides) {
    //Returns true or false;
	return (Math.floor(Math.random() * sides) == 0);
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function stringIsInArray(str, strArray) {
    for (var i = 0; i < strArray.length; i++) {
        if (strArray[i].match(encodeURIComponent(str))) return true;
    }
    return false;
}


// Retrieved from http://stackoverflow.com/a/3629211/3508346 for <IE9
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}
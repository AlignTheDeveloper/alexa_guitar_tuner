/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const util = require('./util');
const express = require('express');
const { ExpressAdapter } = require('ask-sdk-express-adapter')

 const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to My Guitar Tuner. Please tell me which string you would like to tune.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const currentString = sessionAttributes.guitar_string || 'none';

        const speakOutput = `This skill helps you tune your guitar. Currently, you have selected the ${currentString} string. You can ask me to play a reference sound or choose a different string.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to do?')
            .getResponse();
    }
};

const validStrings = ["E", "A", "D", "G", "B", "high E", "low E"];

const ChooseStringIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChooseString';
    },
    handle(handlerInput) {
        const string = Alexa.getSlotValue(handlerInput.requestEnvelope, 'guitar_string');

        // Validate the string
        if (!validStrings.includes(string)) {
            const speakOutput = `I'm sorry, ${string} is not a valid guitar string. Please choose from low E, A, D, G, B, or high E.`;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('Please tell me which string you want to tune.')
                .getResponse();
        }

        // Save the selected string to session attributes
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.guitar_string = string;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = `The string you want to tune is ${string}. Would you like me to play the reference note?`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Would you like me to play the reference note?')
            .getResponse();
    }
};




const PlayReferenceIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayReference';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let string = sessionAttributes.guitar_string;

        // If no string is selected, prompt the user
        if (!string) {
            return handlerInput.responseBuilder
                .speak('I don’t know which string to play. Please tell me which string you want to tune.')
                .reprompt('Please tell me which string you want to tune.')
                .getResponse();
        }

        // Generate the audio URL for the string
        const sanitizedString = string.replace(' ', '_');
        const audioUrl = `https://alignthedeveloper.github.io/guitar-tuner-audio/audio/${sanitizedString}.mp3`;
        const speakOutput = `Here is the reference sound for the ${string} string.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .addAudioPlayerPlayDirective('REPLACE_ALL', audioUrl, string, 0, null)
            .reprompt('Please tell me which string you want to tune or ask me to repeat the reference note.')
            .getResponse();
    }
};


const CheckTuneIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckTune';
    },
    handle(handlerInput) {
        const speakOutput = 'It sounds like your tuning is getting better! Keep practicing.';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Please tell me which string you want to tune.')
            .getResponse();
    }
};

const TrackUsageIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TrackUsage';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.usageCount = (sessionAttributes.usageCount || 0) + 1;

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = `You have used Guitar Tuner ${sessionAttributes.usageCount} times. Keep it up!`;
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to do next? You can choose a string to tune or exit the skill.')
            .getResponse();
    }
};



const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = `Sorry, I didn't understand that. You can ask me to tune a string, play a reference note, or check how many times you've used this skill. What would you like to do?`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to do?')
            .getResponse();
    }
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`~~~~ Error handled: ${JSON.stringify(error)}`);

        const speakOutput = 'Sorry, something went wrong. You can ask me to tune a string, play a reference note, or check your usage stats.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What would you like to do?')
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
const skill = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        ChooseStringIntentHandler,
        PlayReferenceIntentHandler,
        CheckTuneIntentHandler,
        TrackUsageIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .create();

const adapter = new ExpressAdapter(skill, false, false);
const app = express();

app.post('/', adapter.getRequestHandlers());
app.use(express.static(__dirname + '/public'));
app.listen(3036);
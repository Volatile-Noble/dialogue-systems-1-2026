import { assign, createActor, setup } from "xstate";
import { Settings, speechstate } from "speechstate";
import { createBrowserInspector } from "@statelyai/inspect";
import { KEY } from "./azure";
import { DMContext, DMEvents } from "./types";

const inspector = createBrowserInspector();

const azureCredentials = {
  endpoint:
    "https://swedencentral.api.cognitive.microsoft.com/sts/v1.0/issuetoken",
  key: KEY,
};

const settings: Settings = {
  azureCredentials: azureCredentials,
  azureRegion: "swedencentral",
  asrDefaultCompleteTimeout: 0,
  asrDefaultNoInputTimeout: 5000,
  locale: "en-US",
  ttsDefaultVoice: "en-US-DavisNeural",
};

interface GrammarEntry {
  person?: string;
  day?: string;
  time?: string;
  yesno?: string;
}

const grammar: { [index: string]: GrammarEntry } = {
  adam: { person: "Adam" },
  vlad: { person: "Vladislav Maraev" },
  bora: { person: "Bora Kara" },
  tal: { person: "Talha Bedir" },
  tom: { person: "Tom Södahl Bladsjö" },

  monday: { day: "Monday" },
  tuesday: { day: "Tuesday" },
  wednesday: { day: "Wednesday" },
  thursday: { day: "Thursday" },
  friday: { day: "Friday" },
  saturday: { day: "Saturday" },
  sunday: { day: "Sunday" },

  "1": { time: "1:00" },
  "2": { time: "2:00" },
  "3": { time: "3:00" },
  "4": { time: "4:00" },
  "5": { time: "5:00" },
  "6": { time: "6:00" },
  "7": { time: "7:00" },
  "8": { time: "8:00" },
  "9": { time: "9:00" },
  "10": { time: "10:00" },
  "11": { time: "11:00" },
  "12": { time: "12:00" },
  "13": { time: "13:00" },
  "14": { time: "14:00" },
  "15": { time: "15:00" },
  "16": { time: "16:00" },
  "17": { time: "17:00" },
  "18": { time: "18:00" },
  "19": { time: "19:00" },
  "20": { time: "20:00" },
  "21": { time: "21:00" },
  "22": { time: "22:00" },
  "23": { time: "23:00" },
  "24": { time: "24:00" },

  "1 am": { time: "1:00" },
  "2 am": { time: "2:00" },
  "3 am": { time: "3:00" },
  "4 am": { time: "4:00" },
  "5 am": { time: "5:00" },
  "6 am": { time: "6:00" },
  "7 am": { time: "7:00" },
  "8 am": { time: "8:00" },
  "9 am": { time: "9:00" },
  "10 am": { time: "10:00" },
  "11 am": { time: "11:00" },
  "12 am": { time: "12:00" },

  "1 pm": { time: "13:00" },
  "2 pm": { time: "14:00" },
  "3 pm": { time: "15:00" },
  "4 pm": { time: "16:00" },
  "5 pm": { time: "17:00" },
  "6 pm": { time: "18:00" },
  "7 pm": { time: "19:00" },
  "8 pm": { time: "20:00" },
  "9 pm": { time: "21:00" },
  "10 pm": { time: "22:00" },
  "11 pm": { time: "23:00" },
  "12 pm": { time: "00:00" },

  

  "pm" : { time: "pm" },
  "am" : { time: "am" },

  "yes" : { yesno: "yes" },
  "no" : { yesno: "no" },
};

function isInGrammar(utterance: string) {
  return utterance.toLowerCase() in grammar;
}

function getPerson(utterance: string) {
  return (grammar[utterance.toLowerCase()] || {}).person;
}
function getDay(utterance: string) {
  return (grammar[utterance.toLowerCase()] || {}).day;
}
function getTime(utterance: string) {
  return (grammar[utterance.toLowerCase()] || {}).time;
}

const dmMachine = setup({
  types: {
    /** you might need to extend these */
    context: {} as DMContext,
    events: {} as DMEvents,
  },
  actions: {
    /** define your actions here */
    "spst.speak": ({ context }, params: { utterance: string }) =>
      context.spstRef.send({
        type: "SPEAK",
        value: {
          utterance: params.utterance,
        },
      }),
    "spst.listen": ({ context }) =>
      context.spstRef.send({
        type: "LISTEN",
      }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBECyA6ACgJzABwENcBiAQQGUAlAFWvIH1KBRU5ATQG0AGAXUVDwB7WAEsALiMEA7fiAAeiALQBGLgGZ0Adk0AOAKxdVANj1rlyzQE4ANCACeSgEw7l6ACyWuL1Wqua3ym4AvkG2aOgA6gTi1ILkYkRixADCADIAkskA0tx8SCBCohLSsgoIikaa6JWaXI7KespGZnqWarYO5eZVjnoubm5WnppqOo4hYRgA4rhgElJQxHKwCWJg6AQAZmvYABSOXIcAlMThM2BzIgu5soXikjL5ZYqOanroFo5uhuqORjqWPQdRCaVyWQKHIxcAavHRqSwTEDhVAXeaLDLkahMABy9GSAHlUJhUkwsTd8ndio9QGVHFZ0JY3DpmgDWpYWcCEF93lY3Go+f83JU9EzEcjUVd0elMTi8YTiaSmBxlHkBMJ7iUnk4+ehDm1HPU3pVwUZOWZLOhWv5AiM1FxdNCxRgUZcFlhsIIALZ4JLkTAsLJyokksm8W7qqmlbUaPVqA3KI1WJpm5QWq0BQZqO0O4KhJHOiVu7GCdJSPAAV19-tIgYJwcV5LVRQeUfKXxjXH1hr0xuT9kQ5stlmtmezOkdefFrqg6FIsAA1sRmASptjpUxkI2ChGW1q2zrY-HEyaU2nhxnbfbx7nJugXWjZwuyFR6Nj8elsZgAKrULeU3c0tGuqdnG3a9qa-YIIO6Y2lmV4TreyQABZgAAxvOMwEJ6npEMQfoBkGCqhqq27NpqgHlC4VRGEYvStGMFiMkCkHmI4FraE0XBGIybh9Aik4YMg0hgCkGTZH+O7kfIShChagSBEyBzaB4nKVDo6BvL4vFeDomg9kYIR5lIggQHAshoOGZHUtJlEmNUtF6PR9S8sxnSKI51HyWYzLmMOBkCe6+BEGAlkatZzyAtUqh6BxCY+G4nKKIMXAfPJtHKK8VheGoTqRNEYixPEiShZGe6KMyqVcbx3zCq5SiplUOjfCKmj1F8zL6Ll5zTiVAE2S8OjqRYCljEmgR1ZR7x0nSfivEybx6Ll96Sr1UnPFm6lGKmAKWO1uh-JyryOLq551GMngBEYN75nehYzjgXo+qt4VOJ4UWWDte1jBBnS8VUen-MKBytBlS13egxalhWYjPa2LxvVtH2WLtTL7T9iDNBavT-NodIeL5YPTo+86w2VbEpYjn2o99nJjClAODbUbFHYtAXIWhGHYFhOHYKTFEDUNoI1axTITao466sldrS24vQ6LlQlSCFFKSS95SyR8HnIyMUJXfatMHJLdKpnjnyaIZQRAA */
  context: ({ spawn }) => ({
    spstRef: spawn(speechstate, { input: settings }),
    lastResult: null,
    person: null,
    day: null,
    time: null,
    wholeday: null,
  }),
  id: "DM",
  initial: "Prepare",
  states: {
    Prepare: {
      entry: ({ context }) => context.spstRef.send({ type: "PREPARE" }),
      on: { ASRTTS_READY: "WaitToStart" },
    },

    WaitToStart: {
      on: { CLICK: "Greeting" },
    },
    Greeting:{
      entry: { type: "spst.speak", params: { utterance: `Hi, Let's create an appointment.` } },
      on: { SPEAK_COMPLETE: "Meeting" },
    },
    
    Meeting: {
      initial: "Prompt",
      on: {
        LISTEN_COMPLETE: [
          {
            target: "CheckPerson",
            guard: ({ context }) => !!context.lastResult,
          },
          { target: ".NoInput" },
        ]
      },
      states: {
        Prompt: {
          entry: { type: "spst.speak", params: { utterance: `Who are you meeting with?` } },
          on: { SPEAK_COMPLETE: "Ask" },
        },
        NoInput: {
          entry: {
            type: "spst.speak",
            params: { utterance: `I can't hear you!` },
          },
          on: { SPEAK_COMPLETE: "Ask" },
        },
        Ask: {
          entry: { type: "spst.listen" },
          on: {
            RECOGNISED: {
              actions: assign(({ event }) => {
                const utterance = event.value[0].utterance;
                const person = getPerson(utterance) ?? null;
                return {lastResult: event.value,person,};
              }),
            },
            ASR_NOINPUT: {
              actions: assign({ lastResult: null }),
            },
          },
          
        },
      },
    },
    Day: {
      initial: "Prompt",
      on: {
        LISTEN_COMPLETE: [
          {
            target: "CheckDate",
            guard: ({ context }) => !!context.lastResult,
          },
          { target: ".NoInput" },
        ]
      },
      states: {
        Prompt: {
          entry: { type: "spst.speak", params: ({ context }) => ({utterance: `on which day are you meeting: ${context.person}.`})},
          on: { SPEAK_COMPLETE: "Ask" },
        },
        NoInput: {
          entry: {
            type: "spst.speak",
            params: { utterance: `I can't hear you!` },
          },
          on: { SPEAK_COMPLETE: "Ask" },
        },
        Ask: {
          entry: { type: "spst.listen" },
          on: {
            RECOGNISED: {
              actions: assign(({ event }) => {
                const utterance = event.value[0].utterance;
                const day = getDay(utterance) ?? null;
                return {lastResult: event.value,day,};
              }),
            },
            ASR_NOINPUT: {
              actions: assign({ lastResult: null }),
            },
          },
          
        },
      },
    },
    Whole: {
      initial: "Prompt",
      on: {
        LISTEN_COMPLETE: [
          {target: "WholeCompAppoint", guard: ({ context }) => context.wholeday === true,},
          {target: "Time",  guard: ({ context }) => context.wholeday === false},
          {
            guard: ({ context }) => !!context.lastResult,
          },
          { target: ".NoInput" },
        ]
      },
      states: {
        Prompt: {
          entry: { type: "spst.speak", params: { utterance: `will your apointment take the whole day?` } },
          on: { SPEAK_COMPLETE: "Ask" },
        },
        NoInput: {
          entry: {
            type: "spst.speak",
            params: { utterance: `I can't hear you!` },
          },
          on: { SPEAK_COMPLETE: "Ask" },
        },
        Ask: {
          entry: { type: "spst.listen" },
          on: {
            RECOGNISED: {
              actions: assign(({ event }) => {
                const utterance = (event.value[0].utterance ?? "").toLowerCase();
                const wholeday = utterance.includes("yes") || utterance.includes("yeah") ? true :
                                 utterance.includes("no")  || utterance.includes("nope") ? false :
                                 null;
                return {lastResult: event.value,wholeday,};
              }),
            },
            ASR_NOINPUT: {
              actions: assign({ lastResult: null }),
            },
          },
          
        },
      },
    },
    Time: {
      initial: "Prompt",
      on: {
        LISTEN_COMPLETE: [
          {
            target: "CheckTime",
            guard: ({ context }) => !!context.lastResult,
          },
          { target: ".NoInput" },
        ]
      },
      states: {
        Prompt: {
          entry: { type: "spst.speak", params: ({ context }) => ({utterance: `what time on ${context.day} do you whish to meet: ${context.person}.`})},
          on: { SPEAK_COMPLETE: "Ask" },
        },
        NoInput: {
          entry: {
            type: "spst.speak",
            params: { utterance: `I can't hear you!` },
          },
          on: { SPEAK_COMPLETE: "Ask" },
        },
        Ask: {
          entry: { type: "spst.listen" },
          on: {
            RECOGNISED: {
              actions: assign(({ event }) => {
                const utterance = event.value[0].utterance;
                const time = getTime(utterance) ?? null;
                return {lastResult: event.value,time,};
              }),
            },
            ASR_NOINPUT: {
              actions: assign({ lastResult: null }),
            },
          },
          
        },
      },
    },
    CompAppoint: {
      initial: "Prompt",
      on: {
        LISTEN_COMPLETE: [
          {target: "Fin", guard: ({ context }) => context.wholeday === true,},
          {target: "Meeting",  guard: ({ context }) => context.wholeday === false},
          {
            guard: ({ context }) => !!context.lastResult,
          },
          { target: ".NoInput" },
        ]
      },
      states: {
        Prompt: {
          entry: { type: "spst.speak", params: ({ context }) => ({utterance: `Do you want me to create an appointment with ${context.person} on ${context.day} at ${context.time}?`})},
          on: { SPEAK_COMPLETE: "Ask" },
        },
        NoInput: {
          entry: {
            type: "spst.speak",
            params: { utterance: `I can't hear you!` },
          },
          on: { SPEAK_COMPLETE: "Ask" },
        },
        Ask: {
          entry: { type: "spst.listen" },
          on: {
            RECOGNISED: {
              actions: assign(({ event }) => {
                const utterance = (event.value[0].utterance ?? "").toLowerCase();
                const CompAppoint = utterance.includes("yes") || utterance.includes("yeah") ? true :
                                 utterance.includes("no")  || utterance.includes("nope") ? false :
                                 null;
                return {lastResult: event.value,CompAppoint,};
              }),
            },
            ASR_NOINPUT: {
              actions: assign({ lastResult: null }),
            },
          },
          
        },
      },
    },
    WholeCompAppoint: {
      initial: "Prompt",
      on: {
        LISTEN_COMPLETE: [
          {target: "Fin", guard: ({ context }) => context.wholeday === true,},
          {target: "Meeting",  guard: ({ context }) => context.wholeday === false},
          {
            guard: ({ context }) => !!context.lastResult,
          },
          { target: ".NoInput" },
        ]
      },
      states: {
        Prompt: {
          entry: { type: "spst.speak", params: ({ context }) => ({utterance: `Do you want me to create an appointment with ${context.person} on ${context.day} for the whole day?`})},
          on: { SPEAK_COMPLETE: "Ask" },
        },
        NoInput: {
          entry: {
            type: "spst.speak",
            params: { utterance: `I can't hear you!` },
          },
          on: { SPEAK_COMPLETE: "Ask" },
        },
        Ask: {
          entry: { type: "spst.listen" },
          on: {
            RECOGNISED: {
              actions: assign(({ event }) => {
                const utterance = (event.value[0].utterance ?? "").toLowerCase();
                const CompAppoint = utterance.includes("yes") || utterance.includes("yeah") ? true :
                                 utterance.includes("no")  || utterance.includes("nope") ? false :
                                 null;
                return {lastResult: event.value,CompAppoint,};
              }),
            },
            ASR_NOINPUT: {
              actions: assign({ lastResult: null }),
            },
          },
          
        },
      },
    },
     Fin:{
      entry: { type: "spst.speak", params: { utterance: `Your apointment has been created` } },
      on: { SPEAK_COMPLETE: "Done" },
    },
    
    CheckGrammar: {
      entry: {
        type: "spst.speak",
        params: ({ context }) => ({
          utterance: `You just said: ${context.lastResult![0].utterance}. And it ${
            isInGrammar(context.lastResult![0].utterance) ? "is" : "is not"
          } in the grammar.`,
        }),
      },
      on: { SPEAK_COMPLETE: "Done" },
    },

    CheckPerson: {
      entry: {
        type: "spst.speak",
        params: ({ context }) => ({
          utterance: `You just said: ${context.person}.`
          
          
          /*`You just said: ${context.lastResult![0].utterance}. And it ${
            isInGrammar(context.lastResult![0].utterance) ? "is" : "is not"
          } in the grammar.`,*/
        }),
      },
      on: { SPEAK_COMPLETE: "Day" },
    },

    CheckDate: {
      entry: {
        type: "spst.speak",
        params: ({ context }) => ({
          utterance: `You just said: ${context.day}.`
          
          
          /*`You just said: ${context.lastResult![0].utterance}. And it ${
            isInGrammar(context.lastResult![0].utterance) ? "is" : "is not"
          } in the grammar.`,*/
        }),
      },
      on: { SPEAK_COMPLETE: "Whole" },
    },

    CheckTime: {
      entry: {
        type: "spst.speak",
        params: ({ context }) => ({
          utterance: `You just said: ${context.time}.`
          
          
          /*`You just said: ${context.lastResult![0].utterance}. And it ${
            isInGrammar(context.lastResult![0].utterance) ? "is" : "is not"
          } in the grammar.`,*/
        }),
      },
      on: { SPEAK_COMPLETE: "CompAppoint" },
    },

    Done: {
      on: {
        CLICK: "Greeting",
      },
    }
  },
});

const dmActor = createActor(dmMachine, {
  inspect: inspector.inspect,
}).start();

dmActor.subscribe((state) => {
  console.group("State update");
  console.log("State value:", state.value);
  console.log("State context:", state.context);
  console.groupEnd();
});

export function setupButton(element: HTMLButtonElement) {
  element.addEventListener("click", () => {
    dmActor.send({ type: "CLICK" });
  });
  dmActor.subscribe((snapshot) => {
    const meta: { view?: string } = Object.values(
      snapshot.context.spstRef.getSnapshot().getMeta(),
    )[0] || {
      view: undefined,
    };
    element.innerHTML = `${meta.view}`;
  });
}

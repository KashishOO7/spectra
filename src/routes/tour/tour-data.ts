
export interface TourSpot {
  left: number;
  top: number;
  width: number;
  height: number;
  label: string;
  body: string;
}

export interface TourStop {
  id: string;
  file: string;
  title: string;
  blurb: string;
  spots: TourSpot[];
}

export const TOUR_IMAGE = { width: 1280, height: 1000 };

export const TOUR: TourStop[] = [
  {
    "id": "front",
    "file": "01-front.jpg",
    "title": "The front page asks one question",
    "blurb": "No sign-up and no wall of a hundred items. Eight plain sentences and a button.",
    "spots": [
      {
        "left": 25.625,
        "top": 32.203,
        "width": 48.75,
        "height": 5.6,
        "label": "The eight harms",
        "body": "Tap as many as you like, or none at all. These are the eight things people are usually afraid of, and your taps decide the order of everything that follows."
      },
      {
        "left": 43.192,
        "top": 86.203,
        "width": 13.616,
        "height": 4,
        "label": "Show me what to do",
        "body": "Takes you to your list. If you tapped nothing, you still get a sensible place to start."
      },
      {
        "left": 80.535,
        "top": 0.6,
        "width": 9.153,
        "height": 4.4,
        "label": "Your setup",
        "body": "On every page. What you are worried about, how far you have got, and the code that moves your setup to another device."
      }
    ]
  },
  {
    "id": "setup-who",
    "file": "02-setup-who.jpg",
    "title": "It asks who you are protecting yourself from",
    "blurb": "Four short screens, and every one of them can be skipped. This is the one that does the most work: your answers here reweight the whole list, which is why two people never get the same order.",
    "spots": [
      {
        "left": 25.625,
        "top": 23.75,
        "width": 7.219,
        "height": 1.6,
        "label": "How common each one is",
        "body": "Common, elevated, high risk. It is a note about how often this happens to people, not a guess about you, and picking a rare one does not make the list longer."
      },
      {
        "left": 50.391,
        "top": 54.8,
        "width": 23.984,
        "height": 11.85,
        "label": "Pick as many as apply",
        "body": "Each one changes the weighting behind your list. Choosing a former partner, for example, pushes device encryption and screen locks above the things that would otherwise come first."
      },
      {
        "left": 67.642,
        "top": 93.6,
        "width": 6.733,
        "height": 4,
        "label": "Or skip the lot",
        "body": "Answer nothing and you still get a list. There is no wrong answer here and none of it leaves the browser."
      }
    ]
  },
  {
    "id": "setup-tracks",
    "file": "03-setup-tracks.jpg",
    "title": "And whether anything else applies to you",
    "blurb": "This is the screen that adds whole sets of steps. Nothing here is a category to browse: each one unlocks items written for that situation.",
    "spots": [
      {
        "left": 25.625,
        "top": 17.55,
        "width": 48.75,
        "height": 6.8,
        "label": "The baseline is always there",
        "body": "Whatever else you pick, the steps everyone needs stay on your list. Nothing you choose here can make it shorter."
      },
      {
        "left": 25.625,
        "top": 25.55,
        "width": 48.75,
        "height": 6.8,
        "label": "Each one adds real steps",
        "body": "Picking this puts items about children on your list, written for the person doing the protecting rather than for the child."
      },
      {
        "left": 25.625,
        "top": 33.15,
        "width": 48.75,
        "height": 6.8,
        "label": "Women's safety",
        "body": "Adds the items on stalking, tracking apps and images shared without consent. Several of them open by telling you not to use the device you are worried about."
      }
    ]
  },
  {
    "id": "list",
    "file": "04-list.jpg",
    "title": "Your list leads with one step",
    "blurb": "Two people who tapped different worries get different first steps. That is the point of it.",
    "spots": [
      {
        "left": 11.875,
        "top": 16,
        "width": 28.032,
        "height": 2.4,
        "label": "Coverage, the only number you see",
        "body": "Covered means you have done the essentials for one of the eight worries. It is a count of those, not a mark out of a hundred, and a step you set aside still counts against it."
      },
      {
        "left": 69.43,
        "top": 16.1,
        "width": 6.796,
        "height": 3.4,
        "label": "Your map",
        "body": "Draws the worries you tapped, who might act on them, and the steps that stand in the way."
      },
      {
        "left": 83.735,
        "top": 16.1,
        "width": 4.39,
        "height": 3.4,
        "label": "Print",
        "body": "Turns this list into a sheet of paper you can tick off by hand."
      },
      {
        "left": 13.672,
        "top": 32.7,
        "width": 72.656,
        "height": 2.75,
        "label": "The one thing to do next",
        "body": "One step, not a list of thirty-two. Chosen from your answers, and written so you can act on it without looking anything up."
      },
      {
        "left": 13.672,
        "top": 41.85,
        "width": 72.656,
        "height": 5.2,
        "label": "Mark as done",
        "body": "Saves it on this device and brings up the next step. Nothing is sent anywhere."
      },
      {
        "left": 13.672,
        "top": 48.05,
        "width": 72.656,
        "height": 5.2,
        "label": "Show me how",
        "body": "Opens the instructions for your phone or computer, a few lines at a time."
      },
      {
        "left": 13.672,
        "top": 54.85,
        "width": 9.211,
        "height": 3.4,
        "label": "Why this one?",
        "body": "Explains, in plain words, why this step came first for you."
      },
      {
        "left": 30.358,
        "top": 54.85,
        "width": 12.126,
        "height": 3.4,
        "label": "Doesn't apply to me",
        "body": "Takes it off your list. The count stays on screen and one tap puts it back."
      },
      {
        "left": 13.203,
        "top": 67.05,
        "width": 73.594,
        "height": 4.2,
        "label": "Say it in your own words",
        "body": "Type what is worrying you as a sentence. If Spectra has nothing for it, it says so instead of guessing."
      }
    ]
  },
  {
    "id": "queue",
    "file": "05-queue.jpg",
    "title": "The rest of the list is one tap away",
    "blurb": "The front of the list holds one step because a wall of thirty-two is what makes people close the tab. The rest is right here, in the order the engine put them in.",
    "spots": [
      {
        "left": 11.875,
        "top": 77.225,
        "width": 76.25,
        "height": 5.8,
        "label": "Everything else, in order",
        "body": "Opens the rest of your list. It is ordered, not alphabetical: what sits at the top is what your answers pushed there."
      },
      {
        "left": 11.875,
        "top": 91.225,
        "width": 14.531,
        "height": 3.8,
        "label": "Narrow it down",
        "body": "Filter by the kind of thing a step is about, if you already know what you came for. Leaving it alone is the normal way to use this."
      },
      {
        "left": 11.875,
        "top": 96.225,
        "width": 8.805,
        "height": 3.4,
        "label": "Easy mode",
        "body": "On by default, and it shows one plain sentence per step. Switch it off and each step carries the full detail: the effort, what it protects, and the sources behind it."
      }
    ]
  },
  {
    "id": "ask-hit",
    "file": "06-ask-hit.jpg",
    "title": "Ask it in your own words",
    "blurb": "It works out what you mean without sending your words anywhere, and without downloading anything.",
    "spots": [
      {
        "left": 13.203,
        "top": 67.05,
        "width": 73.594,
        "height": 4.2,
        "label": "A whole sentence",
        "body": "You do not need the right keyword. Describe the situation and Spectra finds the steps that match it."
      }
    ]
  },
  {
    "id": "ask-miss",
    "file": "07-ask-miss.jpg",
    "title": "And it tells you when it cannot help",
    "blurb": "Most search boxes always hand you something. This one would rather tell you the truth.",
    "spots": [
      {
        "left": 14.453,
        "top": 95.625,
        "width": 71.094,
        "height": 2,
        "label": "The refusal",
        "body": "Spectra is a short list of things worth doing, not an answer to everything. When nothing on it fits, it says so and stops."
      }
    ]
  },
  {
    "id": "map",
    "file": "08-map.jpg",
    "title": "Your map, if you want to see the shape of it",
    "blurb": "Read it left to right: who might try, the steps that stand in the way, and what those steps protect. It is drawn from your own answers, so somebody else's map is a different picture.",
    "spots": [
      {
        "left": 1.875,
        "top": 36.8,
        "width": 19.552,
        "height": 2,
        "label": "It is not just a picture",
        "body": "Tap any name on the left to see only what touches it. Tap a step to open it. Scroll to zoom, drag to move around."
      },
      {
        "left": 63.358,
        "top": 13.7,
        "width": 7.451,
        "height": 3.4,
        "label": "Full screen",
        "body": "Gives the whole window to the drawing, which is the only comfortable way to read it on a small display."
      },
      {
        "left": 88.976,
        "top": 14,
        "width": 9.149,
        "height": 2.8,
        "label": "Back to the list",
        "body": "The map is for understanding. The list is for doing, and this goes back to it."
      }
    ]
  },
  {
    "id": "incident",
    "file": "09-incident.jpg",
    "title": "Something already happened",
    "blurb": "A separate way in, on every page, for anyone who cannot start with a checklist.",
    "spots": [
      {
        "left": 21.875,
        "top": 18.1,
        "width": 56.25,
        "height": 9.2,
        "label": "Five incident paths",
        "body": "Five situations, each with what to do first. The order matters when the phone in your hand might be the one that is affected."
      }
    ]
  },
  {
    "id": "setup-panel",
    "file": "10-setup-panel.jpg",
    "title": "Everything you have told it, in one panel",
    "blurb": "Reachable from every page. It is the only place your own answers are gathered together, and every one of them can be changed or thrown away here.",
    "spots": [
      {
        "left": 71.641,
        "top": 18.15,
        "width": 7.301,
        "height": 3,
        "label": "Change this",
        "body": "Reopens the four setup screens with your answers still in them. Changing what you are worried about reorders the list straight away, and nothing you have already done is lost."
      },
      {
        "left": 71.641,
        "top": 29.55,
        "width": 12.59,
        "height": 3,
        "label": "See everything, in detail",
        "body": "Turns off the simplified view and shows the whole list at once, with the effort, the sources and the related steps behind each one."
      },
      {
        "left": 71.641,
        "top": 49.9,
        "width": 14.89,
        "height": 3.6,
        "label": "Something changed in my life",
        "body": "A move, a break-up, a new baby, a new job. Each one adds the steps that matter now and moves them to the front, without you having to work out which ones they were."
      }
    ]
  },
  {
    "id": "share",
    "file": "11-share.jpg",
    "title": "A whole profile in twenty characters",
    "blurb": "It travels inside the link itself. Your browser never sends that part to us, so we never see it.",
    "spots": [
      {
        "left": 78.477,
        "top": 30.125,
        "width": 13.125,
        "height": 16.8,
        "label": "Scan it",
        "body": "Point another phone camera at this and it opens Spectra with your setup already in place."
      },
      {
        "left": 77.93,
        "top": 49.025,
        "width": 14.219,
        "height": 2,
        "label": "Twenty characters",
        "body": "Your whole setup, short enough to read down a phone or write on paper. It is always this length, so nobody can tell from the code how much you have done."
      },
      {
        "left": 71.641,
        "top": 65.25,
        "width": 26.797,
        "height": 3.4,
        "label": "Print this setup",
        "body": "Prints the same list on paper, for someone who would rather not use a website at all."
      }
    ]
  },
  {
    "id": "playbook",
    "file": "12-playbook.jpg",
    "title": "Hand it to someone on paper",
    "blurb": "Because the person who most needs this is often the one who will not use a website.",
    "spots": [
      {
        "left": 21.875,
        "top": 28.875,
        "width": 56.25,
        "height": 17.4,
        "label": "Choose what prints",
        "body": "Choose what goes on the page: what is left to do, what is already done (which prints already ticked), or what you set aside."
      },
      {
        "left": 21.875,
        "top": 47.875,
        "width": 10.565,
        "height": 4,
        "label": "Print this page",
        "body": "Uses your browser's own Save as PDF, or a real printer. The text stays proper text, so it prints sharply at any size."
      }
    ]
  }
];

// Social-engineering susceptibility quiz scenarios.

export interface SEQuestion {
  id: string;
  register: string;
  scenario: string;
  prompt: string;
}

export const SE_QUIZ_QUESTIONS: SEQuestion[] = [
  {
    id: 'q_authority',
    register: 'authority',
    scenario: 'Your bank calls saying suspicious activity has been detected. The caller knows your name and your most recent transaction. They ask you to confirm your card number and PIN to "protect your account".',
    prompt: 'How likely would you be to provide the information?'
  },
  {
    id: 'q_urgency',
    register: 'urgency',
    scenario: "An email from 'IT Support' says your work account will be permanently suspended in 2 hours unless you click a link to re-verify your credentials. The email looks convincing.",
    prompt: 'How likely would you be to click the link without verifying with IT directly?'
  },
  {
    id: 'q_trust',
    register: 'trust_exploitation',
    scenario: "A close friend messages you: \"I thought of you when I saw this — you have to check it out!\" with a link. The domain looks slightly unfamiliar but your friend's account seems normal.",
    prompt: 'How likely would you be to click without examining the URL?'
  },
  {
    id: 'q_fear',
    register: 'fear',
    scenario: "You receive an email claiming the sender recorded you through your webcam during a 'compromising moment'. They threaten to send the video to all your contacts unless you pay within 24 hours.",
    prompt: 'How likely would you be to feel genuinely threatened and consider paying?'
  },
  {
    id: 'q_scarcity',
    register: 'scarcity',
    scenario: "\"Congratulations — you've been selected for an exclusive deal. Only 2 remaining at this price. Your offer expires in 9 minutes.\" with a link to claim it.",
    prompt: 'How likely would you be to click before the timer runs out?'
  },
  {
    id: 'q_reciprocity',
    register: 'reciprocity',
    scenario: 'Someone you met briefly at a conference sends you an unexpected $30 gift card by email with a short note, and a link to a site where you can redeem it. They say they just wanted to say thank you.',
    prompt: 'How likely would you be to visit the link and use the gift card?'
  },
  {
    id: 'q_social_proof',
    register: 'social_proof',
    scenario: '"Your colleague Sarah and 847 other people at your company have already completed the mandatory security update. Click here to avoid losing account access by Friday."',
    prompt: 'How likely would you be to click without verifying through official IT channels?'
  }
];

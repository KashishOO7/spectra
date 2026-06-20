// Incident-triage playbooks shown in /audit?mode=incident.

export interface IncidentPlaybook {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  severity: 'critical' | 'high';
  immediateSteps: string[];
  simpleSteps: string[];
  relatedItemIds: string[];
  doNotText: string;
}

export const INCIDENT_PLAYBOOKS: IncidentPlaybook[] = [
  {
    id: 'account_hacked',
    icon: '🔓',
    title: 'Account Hacked',
    subtitle: "You can't log in, or see activity you didn't do",
    severity: 'critical',
    immediateSteps: [
      'From a trusted device (not the compromised one), go to the service\'s account recovery page and reset your password immediately.',
      'Check and revoke all active sessions — look for "Active sessions", "Devices", or "Security" in account settings.',
      'Change the password on every account that uses the same or similar password.',
      'Enable two-factor authentication if it wasn\'t active — this is what will stop a repeat.',
      'Check email forwarding rules and connected third-party apps — attackers often set these up for persistence.',
      'If it\'s your email account: check rules, filters, and recovery contact details for tampering.'
    ],
    simpleSteps: [
      'Use a different device (your phone or a friend\'s computer) — not the one you think was compromised.',
      'Go to the website, find "Forgot password" and reset it to something new you haven\'t used before.',
      'Once back in, look for "Active sessions" or "Devices" in Settings and sign out of everything.',
      'If you used the same password anywhere else, change it on those sites too.',
      'Turn on two-step verification now — this is what stops it happening again even if your password leaks.',
      'If it was your email: check Settings for any forwarding rules or replies you didn\'t set up.'
    ],
    relatedItemIds: ['auth-2fa-001', 'auth-password-manager-001', 'auth-backup-codes-001', 'incident-breach-monitor-001'],
    doNotText: 'Do not use the potentially compromised device to do recovery — use your phone or a different computer.'
  },
  {
    id: 'device_stolen',
    icon: '💻',
    title: 'Device Stolen',
    subtitle: 'Your phone, laptop, or tablet is missing',
    severity: 'critical',
    immediateSteps: [
      'For iPhone: iCloud.com → Find My → mark device as Lost to lock it and display a message. For Android: android.com/find → Lock or Erase.',
      'For Mac: iCloud.com → Find My. For Windows: account.microsoft.com → Find My Device.',
      'Change passwords for your most critical accounts immediately (email, banking, work) from a different device.',
      'Revoke trusted device status: in Google, Apple ID, Microsoft, and any work accounts, remove the stolen device from trusted list.',
      'Call your carrier if it was a phone — ask to suspend the SIM to prevent SIM-based account recovery abuse.',
      'File a police report with the serial number (check original box or account purchase history). This helps with insurance and sometimes recovery.'
    ],
    simpleSteps: [
      'On iPhone: go to icloud.com on another device, sign in, click Find My, find your phone and tap "Lost Mode" to lock it.',
      'On Android: go to android.com/find on another device, sign in, and choose "Lock" or "Erase".',
      'For a laptop: icloud.com/find (Mac) or account.microsoft.com → Devices → Find My Device (Windows).',
      'Change your email and banking passwords right now from a different device.',
      'If it was a phone: call your mobile carrier and ask them to suspend the SIM.',
      'Remove the device from trusted devices in your Google, Apple, or Microsoft account settings.'
    ],
    relatedItemIds: ['device-encrypt-001', 'device-screenlock-001', 'auth-2fa-001'],
    doNotText: 'Do not wait — remote wipe becomes useless once the device is wiped by someone else or the SIM is swapped.'
  },
  {
    id: 'stalkerware',
    icon: '👁',
    title: 'Monitoring Suspected',
    subtitle: 'Someone may have installed software to watch you',
    severity: 'critical',
    immediateSteps: [
      'Do not do this research on the device you suspect is compromised — use a different phone or a library computer.',
      'On Android: Settings → Apps → look for anything unfamiliar with "accessibility" or "device admin" permissions. On iPhone: Settings → Privacy & Security → check VPN/Device Management profiles.',
      'If you find something or are unsure: a factory reset is the most reliable solution. Back up photos/contacts to a fresh account first.',
      'Change passwords for everything — email, social, banking — from a safe device AFTER the reset.',
      'If this involves an intimate partner situation: contact a domestic violence tech safety specialist before taking action. Some monitoring software alerts the abuser if removed.',
      'National DV Hotline (US): 1-800-799-7233. Safety Net at NNEDV provides tech safety support.'
    ],
    simpleSteps: [
      'Do not do any of this on the phone or computer you think is being monitored — use a different device.',
      'On iPhone: go to Settings → General → VPN & Device Management. If you see anything unfamiliar, it may be monitoring software.',
      'On Android: Settings → Apps → look for anything with "Accessibility" permissions you don\'t recognise.',
      'If you find something suspicious, or just aren\'t sure: a factory reset is the safest option. Back up photos and contacts to a fresh account first.',
      'If this involves a partner or family member: contact a safety specialist before doing anything. Some apps alert the person who installed them if removed.',
      'US: National DV Hotline 1-800-799-7233. Ask specifically about tech safety resources.'
    ],
    relatedItemIds: ['device-screenlock-001', 'device-encrypt-001', 'device-updates-001'],
    doNotText: 'Do not confront the person first — removing stalkerware can alert them and escalate a dangerous situation.'
  },
  {
    id: 'phishing_clicked',
    icon: '🎣',
    title: 'Phishing Link Clicked',
    subtitle: 'You clicked a suspicious link or entered credentials on an unfamiliar site',
    severity: 'high',
    immediateSteps: [
      'If you entered a password: change that account\'s password immediately from a different device or browser.',
      'Enable 2FA on the affected account right now — even if the password was captured, 2FA stops the attacker from using it.',
      'Check whether you use the same password anywhere else — change it on every service that shares it.',
      'If the link opened a file or installer: disconnect from the internet and run a malware scan. On Windows: Windows Defender. On Mac: Malwarebytes.',
      'Check your email for any "unusual sign-in" notifications from the affected account — these may have already arrived.',
      'Watch that account\'s activity for 1-2 weeks: new email rules, sent mail you didn\'t send, profile changes.'
    ],
    simpleSteps: [
      'If you typed in a password on that page: change it right now on a different browser or device.',
      'Turn on two-step verification (2FA) on that account straight away — even if they got your password, they still can\'t log in.',
      'Did you use that password on other websites? Change it on those too.',
      'If the link made you download or open a file: disconnect from WiFi and run a virus scan (Windows Defender on Windows, Malwarebytes on Mac).',
      'Check your inbox — you may already have "unusual sign-in" alert emails from that account.',
      'Keep an eye on that account for the next week or two for anything you didn\'t do.'
    ],
    relatedItemIds: ['auth-2fa-001', 'auth-password-manager-001', 'human-urgency-001', 'human-verify-001'],
    doNotText: 'Do not ignore it hoping nothing happens — credential theft from phishing is typically automated and immediate.'
  },
  {
    id: 'data_breach',
    icon: '💾',
    title: 'Data Breach Notification',
    subtitle: 'A service you use has been breached',
    severity: 'high',
    immediateSteps: [
      'Change your password on the breached service immediately, even if the company says passwords weren\'t exposed — err on the side of caution.',
      'Check haveibeenpwned.com with your email address to see what data is associated with this breach and what else may be exposed.',
      'If you use the same password anywhere else: change it everywhere. A breach of one service is a credential-stuffing risk for all others.',
      'Enable 2FA on the affected service if you haven\'t already.',
      'If the breach included payment card data: contact your bank to flag the card for suspicious activity or request a replacement.',
      'If the breach included sensitive personal data (SSN, passport): consider a credit freeze at the three major bureaus (Equifax, Experian, TransUnion in the US).'
    ],
    simpleSteps: [
      'Change your password on that website now — even if they say passwords weren\'t affected, do it anyway.',
      'Go to haveibeenpwned.com and type in your email address to see what else may have been exposed.',
      'Did you use the same password on other sites? Change it everywhere it was used.',
      'Turn on two-step login (2FA) on the affected account if you haven\'t already.',
      'If your payment card was included: call your bank and ask them to flag it or send you a new card.',
      'If your ID or passport details were included: you can freeze your credit for free at Equifax, Experian, and TransUnion (US) to stop someone opening accounts in your name.'
    ],
    relatedItemIds: ['incident-breach-monitor-001', 'auth-2fa-001', 'auth-password-manager-001'],
    doNotText: 'Do not trust breach notification emails blindly — verify through the company\'s official website directly.'
  }
];

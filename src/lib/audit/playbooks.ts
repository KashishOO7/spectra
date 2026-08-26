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
    icon: '○',
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
      'If it was your email: check Settings for any forwarding rules or auto-replies you didn\'t set up.',
      'Look for "Connected apps", "Third-party access" or "Apps with account access" in Settings and remove anything you don\'t recognise — a password change does not lock these out.',
      'If your phone number can reset the account, call your mobile provider and ask them to lock the number against transfers.'
    ],
    relatedItemIds: ['auth-2fa-001', 'auth-password-manager-001', 'auth-backup-codes-001', 'incident-breach-monitor-001'],
    doNotText: 'Do not use the potentially compromised device to do recovery — use your phone or a different computer.'
  },
  {
    id: 'device_stolen',
    icon: '◈',
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
      'Remove the device from trusted devices in your Google, Apple, or Microsoft account settings.',
      'Report it to the police with the serial number — you can find it on the original box or in your account\'s purchase history. Insurers usually ask for the report number.'
    ],
    relatedItemIds: ['device-encrypt-001', 'device-screenlock-001', 'auth-2fa-001'],
    doNotText: 'Do not wait — remote wipe becomes useless once the device is wiped by someone else or the SIM is swapped.'
  },
  {
    id: 'stalkerware',
    icon: '◉',
    title: 'Monitoring Suspected',
    subtitle: 'Someone may have installed software to watch you',
    severity: 'critical',
    immediateSteps: [
      'Do not confront the person you suspect, and do not remove anything yet. Removal is what tells them they have been found, and that is the moment these situations escalate.',
      'Treat the device as watched. Assume its screen, keystrokes and location are visible, and do not read this page or plan anything on it.',
      'Move to a device the other person has never had access to — a friend\'s phone, a work laptop, a library computer.',
      'Preserve what you have before changing anything: photograph unfamiliar apps, notification history, and any messages showing they knew something they should not. Store it in an account they do not know about. A reset destroys all of it.',
      'Contact a domestic violence tech safety specialist and describe what you have seen. They can walk the device safely, advise on timing, and help with evidence — none of which is safe to improvise.',
      'If someone close to you may have access to your phone or accounts, a domestic violence service in your country can help. Ask for their tech safety team. They handle phones and accounts specifically, and they can tell you what is safe to change first.',
      'When the specialist says it is safe: change passwords for email first, then banking, then everything else — from the safe device, and only after the device is clean or replaced.',
      'Turn on two-factor authentication as you go, and check account recovery options — a phone number or backup email the other person controls reopens the door immediately.'
    ],
    simpleSteps: [
      'Do not say anything to the person you suspect, and do not delete anything yet. Deleting it is what tells them you know, and that is when things often get worse.',
      'Assume the device is being watched — screen, typing, location. Do not read this page or make plans on it.',
      'Use a different device that person has never touched: a friend\'s phone, a work computer, or one at a library.',
      'Before you change anything, save proof: take photos of apps you do not recognise, and of any message showing they knew something they should not have. Put it somewhere they cannot reach. Resetting the device erases all of it.',
      'Talk to a domestic violence tech safety specialist before you touch the device. They can check it safely and tell you when it is the right moment to act.',
      'If someone close to you may have access to your phone or accounts, a domestic violence service in your country can help. Ask for their tech safety team. They handle phones and accounts specifically, and they can tell you what is safe to change first.',
      'Once they say it is safe: change your email password first, then banking, then the rest — on the safe device, not the old one.',
      'Turn on two-step login while you are there, and check the recovery phone number and backup email on each account. If either one is theirs, change it.'
    ],
    relatedItemIds: ['device-screenlock-001', 'device-encrypt-001', 'device-updates-001'],
    doNotText: 'Do not confront the person, and do not remove anything yet. Removing monitoring software tells them you know, and that is when these situations escalate. Talk to a specialist first.'
  },
  {
    id: 'phishing_clicked',
    icon: '◆',
    title: 'Phishing Link Clicked',
    subtitle: 'You clicked a suspicious link or entered credentials on an unfamiliar site',
    severity: 'high',
    immediateSteps: [
      'If you entered a password: change that account\'s password immediately from a different device or browser.',
      'Enable 2FA on the affected account right now — even if the password was captured, 2FA stops the attacker from using it.',
      'Check whether you use the same password anywhere else — change it on every service that shares it.',
      'If the link opened a file or installer: disconnect from the internet and run a malware scan. On Windows: Windows Defender. On Mac: Malwarebytes.',
      'Check your email for any "unusual sign-in" notifications from the affected account — these may have already arrived.',
      'Watch that account\'s activity for 1-2 weeks: new forwarding rules or auto-replies, sent mail you didn\'t send, and changes to recovery email or phone.'
    ],
    simpleSteps: [
      'If you typed in a password on that page: change it right now on a different browser or device.',
      'Turn on two-step verification (2FA) on that account straight away — even if they got your password, they still can\'t log in.',
      'Did you use that password on other websites? Change it on those too.',
      'If the link made you download or open a file: disconnect from WiFi and run a virus scan (Windows Defender on Windows, Malwarebytes on Mac).',
      'Check your inbox — you may already have "unusual sign-in" alert emails from that account.',
      'Keep an eye on that account for the next week or two — specifically new forwarding rules, messages in Sent that you did not send, and changes to your recovery email or phone number.'
    ],
    relatedItemIds: ['auth-2fa-001', 'auth-password-manager-001', 'human-urgency-001', 'human-verify-001'],
    doNotText: 'Do not ignore it hoping nothing happens — credential theft from phishing is typically automated and immediate.'
  },
  {
    id: 'data_breach',
    icon: '●',
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

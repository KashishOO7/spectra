
export const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'am', 'do', 'does', 'did', 'have', 'has', 'had', 'i', 'me', 'my', 'mine', 'you', 'your',
  'yours', 'he', 'him', 'his', 'she', 'her', 'hers', 'they', 'them', 'their', 'it', 'its',
  'we', 'us', 'our', 'this', 'that', 'these', 'those', 'to', 'of', 'in', 'on', 'at', 'by',
  'for', 'with', 'from', 'as', 'into', 'about', 'can', 'could', 'would', 'should', 'will',
  'what', 'which', 'who', 'when', 'where', 'how', 'why', 'there', 'here', 'get', 'got',
  'know', 'think', 'want', 'need', 'just', 'now', 'then', 'some', 'any', 'all', 'so', 'up',
  'out', 'down', 'over', 'very', 'really', 'still', 'help', 'please',
  'someone', 'something', 'anyone', 'everyone', 'somebody', 'people', 'person'
]);

export function stem(word: string): string {
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) {
    return word.slice(0, -1);
  }
  return word;
}

export function tokenize(text: string): string[] {
  return (text ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 1)
    .map(stem)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

export const SYNONYMS: Record<string, string[]> = {
  hacked:      ['credential', 'password', 'login', 'stuffing', 'phishing', 'recovery', 'breach'],
  hack:        ['credential', 'password', 'login', 'stuffing', 'breach'],
  breached:    ['breach', 'credential', 'password', 'leak'],
  leaked:      ['breach', 'credential', 'password', 'leak'],
  login:       ['login', 'credential', 'password', 'authentication'],
  signin:      ['login', 'credential', 'password', 'authentication'],
  locked:      ['recovery', 'backup', 'code', 'credential'],
  '2fa':       ['two', 'step', 'authentication', 'code'],
  otp:         ['two', 'step', 'code', 'authentication'],
  passcode:    ['password', 'credential', 'screen', 'lock'],

  money:       ['financial', 'money', 'payment', 'bank'],
  bank:        ['financial', 'money', 'payment'],
  card:        ['financial', 'payment', 'money'],
  paid:        ['financial', 'payment', 'money'],
  fraud:       ['financial', 'scam', 'phishing', 'social', 'engineering'],
  scam:        ['scam', 'phishing', 'social', 'engineering', 'sender', 'message'],
  scammed:     ['scam', 'phishing', 'social', 'engineering'],
  phishing:    ['phishing', 'sender', 'message', 'scam'],

  stalker:     ['stalkerware', 'location', 'insider', 'physical', 'access', 'malware'],
  stalking:    ['stalkerware', 'location', 'insider', 'physical', 'access'],
  following:   ['location', 'insider', 'osint', 'passive'],
  tracking:    ['location', 'tracker', 'behavioral', 'metadata', 'broker'],
  tracked:     ['location', 'tracker', 'behavioral', 'metadata'],
  spying:      ['stalkerware', 'malware', 'insider', 'access', 'microphone', 'camera', 'monitoring'],
  spyware:     ['stalkerware', 'malware', 'insider', 'access', 'monitoring', 'suspected'],
  watching:    ['stalkerware', 'malware', 'camera', 'microphone', 'insider', 'monitoring'],
  monitoring:  ['stalkerware', 'malware', 'monitoring', 'suspected', 'insider'],
  clicked:     ['phishing', 'clicked', 'link', 'scam', 'sender'],
  link:        ['phishing', 'clicked', 'link', 'sender', 'message'],
  location:    ['location', 'physical', 'osint'],
  gps:         ['location', 'physical'],

  ex:          ['insider', 'access', 'physical', 'relationship', 'location', 'stalkerware'],
  boyfriend:   ['insider', 'access', 'relationship', 'location'],
  girlfriend:  ['insider', 'access', 'relationship', 'location'],
  husband:     ['insider', 'access', 'relationship', 'location'],
  wife:        ['insider', 'access', 'relationship', 'location'],
  partner:     ['insider', 'access', 'relationship', 'location'],
  stranger:    ['osint', 'passive', 'reputation', 'identity'],

  kid:         ['child', 'kid', 'teen', 'parent', 'family'],
  child:       ['child', 'kid', 'teen', 'parent', 'family'],
  son:         ['child', 'kid', 'teen', 'parent', 'family'],
  daughter:    ['child', 'kid', 'teen', 'parent', 'family'],
  teenager:    ['child', 'kid', 'teen', 'parent'],
  school:      ['child', 'kid', 'teen'],

  bullying:    ['harassment', 'target', 'reputation', 'relationship', 'reporting'],
  bullied:     ['harassment', 'target', 'reputation', 'relationship', 'reporting'],
  troll:       ['harassment', 'target', 'reputation', 'reporting'],
  harass:      ['harassment', 'target', 'reputation', 'reporting', 'incident'],
  harassed:    ['harassment', 'target', 'reputation', 'reporting', 'incident'],
  harassing:   ['harassment', 'target', 'reputation', 'reporting', 'incident'],
  harassment:  ['harassment', 'target', 'reputation', 'reporting', 'incident'],
  abuse:       ['harassment', 'image', 'intimate', 'insider', 'reputation'],
  nude:        ['intimate', 'image', 'reputation', 'deepfake'],
  pic:         ['intimate', 'image', 'reputation', 'deepfake'],
  photo:       ['intimate', 'image', 'reputation', 'deepfake'],
  revenge:     ['intimate', 'image', 'reputation'],
  deepfake:    ['deepfake', 'image', 'voice', 'clone', 'pretend'],
  impersonate: ['deepfake', 'voice', 'clone', 'identity', 'pretend'],
  pretend:     ['pretend', 'deepfake', 'voice', 'clone', 'identity', 'caller'],
  pretending:  ['pretend', 'deepfake', 'voice', 'clone', 'identity', 'caller'],
  fake:        ['deepfake', 'voice', 'clone', 'pretend', 'scam'],

  phone:       ['phone', 'device', 'mobile', 'screen', 'lock'],
  mobile:      ['phone', 'device', 'mobile'],
  laptop:      ['device', 'laptop', 'encryption', 'local'],
  computer:    ['device', 'laptop', 'encryption', 'local'],
  stolen:      ['stolen', 'physical', 'access', 'encryption', 'device'],
  lost:        ['stolen', 'physical', 'access', 'encryption', 'device', 'recovery'],
  virus:       ['malware', 'stalkerware', 'update'],
  malware:     ['malware', 'stalkerware', 'update'],
  update:      ['update', 'device'],

  wifi:        ['network', 'interception', 'vpn', 'dns'],
  vpn:         ['vpn', 'network', 'interception'],
  cafe:        ['network', 'interception', 'vpn'],
  message:     ['message', 'communication', 'chat', 'sender'],
  text:        ['message', 'communication', 'chat', 'sender'],
  chat:        ['message', 'communication', 'chat', 'encrypt'],
  email:       ['email', 'account', 'credential', 'message'],
  call:        ['voice', 'clone', 'caller', 'sender'],
  encrypt:     ['encrypt', 'encryption'],

  broker:      ['broker', 'data', 'aggregation', 'remove'],
  google:      ['account', 'ecosystem', 'history', 'tracking'],
  social:      ['social', 'profile', 'visibility', 'osint'],
  profile:     ['social', 'profile', 'visibility'],
  permission:  ['permission', 'camera', 'microphone', 'location', 'app'],
  camera:      ['camera', 'permission', 'microphone'],
  microphone:  ['microphone', 'permission', 'camera'],
  backup:      ['backup', 'recovery', 'code'],
  delete:      ['deletion', 'remove', 'broker'],
  remove:      ['deletion', 'remove', 'broker'],
  private:     ['privacy', 'private', 'visibility', 'encrypt', 'encryption'],

  game:        ['child', 'kid', 'teen', 'manipulation', 'social', 'engineering'],
  talk:        ['social', 'engineering', 'manipulation', 'message', 'urgency'],
  grooming:    ['child', 'manipulation', 'social', 'engineering', 'secret'],
  online:      ['social', 'profile', 'osint', 'harassment', 'visibility'],
  company:     ['broker', 'data', 'aggregation', 'ecosystem', 'service'],
  sell:        ['broker', 'data', 'aggregation'],
  detail:      ['identity', 'data', 'broker', 'credential'],
  file:        ['backup', 'local', 'data', 'encryption'],
  safe:        ['backup', 'recovery', 'encryption', 'lock'],
  border:      ['travel', 'physical', 'border'],
  travel:      ['travel', 'physical', 'border'],
  screen:      ['screen', 'lock', 'device'],
  lock:        ['screen', 'lock', 'encryption', 'device'],
  history:     ['history', 'tracking', 'behavioral', 'ecosystem'],
  install:     ['malware', 'stalkerware', 'app', 'update'],
  app:         ['app', 'permission', 'device'],
  report:      ['harassment', 'reporting', 'incident'],
  secret:      ['secret', 'word', 'family', 'clone']
};

export const SYNONYM_INDEX: Map<string, string[]> = new Map(
  Object.entries(SYNONYMS).map(([k, v]) => [stem(k.toLowerCase()), v.map(t => stem(t))])
);

function variants(token: string): string[] {
  const out = [token];
  if (token.length > 5 && token.endsWith('ing')) {
    out.push(token.slice(0, -3), token.slice(0, -3) + 'e');
  }
  if (token.length > 4 && token.endsWith('ed')) {
    out.push(token.slice(0, -2), token.slice(0, -1));
  }
  return out;
}

export function expand(token: string): string[] {
  const forms = variants(token);
  const out = new Set<string>(forms);
  for (const form of forms) {
    for (const s of SYNONYM_INDEX.get(form) ?? []) out.add(s);
  }
  return [...out];
}

let waiting = '';

export function sendAsk(question: string): void {
  waiting = question.trim();
}

export function takeAsk(): string {
  const question = waiting;
  waiting = '';
  return question;
}

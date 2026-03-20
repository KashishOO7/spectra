#!/usr/bin/env python3

import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import os
import sys
import json
import re
import yaml
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser


# Configuration
RSS_SOURCES = [
    {'name': 'EFF Deeplinks',        'url': 'https://www.eff.org/rss/updates.xml'},
    {'name': 'Krebs on Security',    'url': 'https://krebsonsecurity.com/feed/'},
    {'name': 'Have I Been Pwned',    'url': 'https://feeds.feedburner.com/HaveIBeenPwnedLatestBreaches'},
]

KEYWORD_RULES = [
    {
        'keywords': ['phishing', 'spear phishing', 'ai phish', 'ai-generated phish'],
        'topic_slug': 'ai-phishing',
        'severity': 'high',
        'multiplier': 1.2,
        'related_items': [
            'human-urgency-001',
            'auth-2fa-001',
            'auth-password-manager-001',
            'human-verify-001',
            'ai-phishing-detect-001',
        ],
    },
    {
        'keywords': ['credential stuffing', 'credential theft', 'password spray'],
        'topic_slug': 'credential-stuffing',
        'severity': 'high',
        'multiplier': 1.2,
        'related_items': [
            'auth-password-manager-001',
            'auth-2fa-001',
            'incident-breach-monitor-001',
        ],
    },
    {
        'keywords': ['data breach', 'breach', 'pwned', 'exposed records', 'records exposed'],
        'topic_slug': 'data-breach',
        'severity': 'moderate',
        'multiplier': 1.15,
        'related_items': [
            'incident-breach-monitor-001',
            'auth-password-manager-001',
        ],
    },
    {
        'keywords': ['sim swap', 'sim hijack', 'ss7', 'sms hijack', 'sms bypass', 'sms 2fa bypass'],
        'topic_slug': 'sms-bypass',
        'severity': 'high',
        'multiplier': 1.3,
        'related_items': [
            'auth-2fa-001',
            'auth-backup-codes-001',
        ],
    },
    {
        'keywords': ['stalkerware', 'spyware', 'surveillance app', 'tracking app', 'intimate partner'],
        'topic_slug': 'stalkerware',
        'severity': 'high',
        'multiplier': 1.3,
        'related_items': [
            'womens-stalkerware-001',
            'device-screenlock-001',
            'device-updates-001',
        ],
    },
    {
        'keywords': ['deepfake', 'voice clone', 'voice cloning', 'synthetic voice', 'ai fraud', 'ai scam'],
        'topic_slug': 'ai-voice-deepfake',
        'severity': 'high',
        'multiplier': 1.25,
        'related_items': [
            'ai-voice-clone-001',
            'human-verify-001',
            'ai-phishing-detect-001',
        ],
    },
    {
        'keywords': ['data broker', 'people search', 'personal data sold', 'doxxing', 'dox'],
        'topic_slug': 'data-broker',
        'severity': 'moderate',
        'multiplier': 1.2,
        'related_items': [
            'data-broker-optout-001',
            'osint-self-001',
        ],
    },
    {
        'keywords': ['ransomware', 'malware', 'trojan', 'backdoor', 'infostealer'],
        'topic_slug': 'malware',
        'severity': 'high',
        'multiplier': 1.2,
        'related_items': [
            'device-updates-001',
            'data-backup-001',
            'device-encrypt-001',
        ],
    },
    {
        'keywords': ['vpn vulnerability', 'vpn leak', 'dns leak', 'dns attack', 'dns hijack', 'dns poisoning'],
        'topic_slug': 'network-threat',
        'severity': 'moderate',
        'multiplier': 1.15,
        'related_items': [
            'net-vpn-001',
            'net-dns-001',
        ],
    },
    {
        'keywords': ['2fa bypass', 'mfa bypass', 'authenticator hijack', 'otp interception'],
        'topic_slug': 'mfa-bypass',
        'severity': 'high',
        'multiplier': 1.25,
        'related_items': [
            'auth-2fa-001',
            'auth-backup-codes-001',
            'auth-password-manager-001',
        ],
    },
]

FETCH_TIMEOUT_SECONDS = 15
MAX_ITEMS_PER_FEED = 25
MAX_ARTICLE_AGE_DAYS = 7
LANDSCAPE_FEED_PATH = 'content/landscape-feed.yaml'

# Matching thresholds
TITLE_MATCH_SCORE   = 3
LEDE_MATCH_SCORE    = 2
BODY_MATCH_SCORE    = 1
MINIMUM_MATCH_SCORE = 3

# Issue deduplication
ISSUE_COOLDOWN_DAYS = 6


# HTML stripping
class _HTMLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self._parts: list[str] = []

    def handle_data(self, d: str) -> None:
        self._parts.append(d)

    def get_text(self) -> str:
        return ' '.join(self._parts)


def strip_html(html: str) -> str:
    if not html:
        return ''
    s = _HTMLStripper()
    try:
        s.feed(html)
        text = s.get_text()
    except Exception:
        text = re.sub(r'<[^>]+>', ' ', html)
    return re.sub(r'\s+', ' ', text).strip()


# RSS fetching
def fetch_rss(source: dict) -> list[dict]:
    items: list[dict] = []
    try:
        req = urllib.request.Request(
            source['url'],
            headers={
                'User-Agent': 'Spectra-LandscapeBot/2.0 (+https://github.com/KashishOO7/spectra)',
                'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
            },
        )
        with urllib.request.urlopen(req, timeout=FETCH_TIMEOUT_SECONDS) as resp:
            raw = resp.read()

        root = ET.fromstring(raw)
        tag = root.tag

        if 'atom' in tag.lower() or tag == '{http://www.w3.org/2005/Atom}feed':
            ns = 'http://www.w3.org/2005/Atom'
            for entry in root.findall(f'{{{ns}}}entry')[:MAX_ITEMS_PER_FEED]:
                title_el  = entry.find(f'{{{ns}}}title')
                link_el   = entry.find(f'{{{ns}}}link')
                summ_el   = entry.find(f'{{{ns}}}summary') or entry.find(f'{{{ns}}}content')
                date_el   = entry.find(f'{{{ns}}}updated') or entry.find(f'{{{ns}}}published')
                items.append({
                    'title':       (title_el.text or '').strip() if title_el is not None else '',
                    'link':        link_el.get('href', '').strip() if link_el is not None else '',
                    'description': strip_html(summ_el.text or '') if summ_el is not None else '',
                    'pubDate':     (date_el.text or '').strip() if date_el is not None else '',
                    'source':      source['name'],
                })
        else:
            channel = root.find('channel') or root
            for item in channel.findall('item')[:MAX_ITEMS_PER_FEED]:
                items.append({
                    'title':       (item.findtext('title') or '').strip(),
                    'link':        (item.findtext('link') or '').strip(),
                    'description': strip_html(item.findtext('description') or ''),
                    'pubDate':     (item.findtext('pubDate') or '').strip(),
                    'source':      source['name'],
                })

        print(f'[scan] {source["name"]}: {len(items)} items fetched', file=sys.stderr)

    except urllib.error.URLError as exc:
        print(f'[scan] {source["name"]}: network error — {exc}', file=sys.stderr)
    except ET.ParseError as exc:
        print(f'[scan] {source["name"]}: XML parse error — {exc}', file=sys.stderr)
    except Exception as exc:
        print(f'[scan] {source["name"]}: unexpected error — {exc}', file=sys.stderr)

    return items


# Smart keyword matching
def score_article(title: str, description: str) -> list[dict]:
    title_lower = title.lower()
    desc_lower  = description.lower()
    lede_lower  = desc_lower[:200]

    results = []
    for rule in KEYWORD_RULES:
        best_score = 0
        evidence_parts = []

        for kw in rule['keywords']:
            kw_lower = kw.lower()
            score = 0
            ev = []

            # Title match
            if kw_lower in title_lower:
                score += TITLE_MATCH_SCORE
                ev.append(f'title contains "{kw}"')

            elif kw_lower in lede_lower:
                score += LEDE_MATCH_SCORE
                ev.append(f'lede contains "{kw}"')

            # Body occurrences beyond the lede
            body_only = desc_lower[200:]
            occurrences = body_only.count(kw_lower)
            if occurrences > 0:
                score += occurrences * BODY_MATCH_SCORE
                loc = 'body' if kw_lower not in lede_lower else 'body (additional)'
                ev.append(f'{loc} contains "{kw}" ×{occurrences}')

            if score > best_score:
                best_score = score
                evidence_parts = ev

        if best_score >= MINIMUM_MATCH_SCORE:
            results.append({
                **rule,
                'match_score': best_score,
                'match_evidence': '; '.join(evidence_parts) if evidence_parts else 'keyword match',
            })

    return results


# Date parsing
_DATE_FORMATS = [
    '%a, %d %b %Y %H:%M:%S %z',
    '%a, %d %b %Y %H:%M:%S GMT',
    '%a, %d %b %Y %H:%M:%S +0000',
    '%Y-%m-%dT%H:%M:%S%z',
    '%Y-%m-%dT%H:%M:%SZ',
    '%Y-%m-%dT%H:%M:%S.%f%z',
]


def parse_pub_date(date_str: str) -> datetime | None:
    if not date_str:
        return None
    for fmt in _DATE_FORMATS:
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except ValueError:
            continue
    return None


# Existing feed deduplication
def load_existing_source_urls() -> set[str]:
    try:
        with open(LANDSCAPE_FEED_PATH, 'r', encoding='utf-8') as fh:
            data = yaml.safe_load(fh)
        if not data or 'events' not in data:
            return set()
        return {
            str(e.get('source_url', ''))
            for e in (data.get('events') or [])
            if e
        }
    except FileNotFoundError:
        print(f'[scan] {LANDSCAPE_FEED_PATH} not found — skipping dedup', file=sys.stderr)
        return set()
    except Exception as exc:
        print(f'[scan] Could not read landscape feed: {exc}', file=sys.stderr)
        return set()


# Issue deduplication check
def recent_landscape_issue_exists() -> bool:
    if ISSUE_COOLDOWN_DAYS <= 0:
        return False

    token = os.environ.get('GITHUB_TOKEN')
    repo  = os.environ.get('GITHUB_REPOSITORY')
    if not token or not repo:
        return False

    cutoff = (datetime.now(timezone.utc) - timedelta(days=ISSUE_COOLDOWN_DAYS)).strftime(
        '%Y-%m-%dT%H:%M:%SZ'
    )
    url = (
        f'https://api.github.com/repos/{repo}/issues'
        f'?labels=landscape-candidate&state=open&per_page=5&sort=created&direction=desc'
    )
    req = urllib.request.Request(
        url,
        headers={
            'Authorization':        f'Bearer {token}',
            'Accept':               'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent':           'Spectra-LandscapeBot/2.0',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            issues = json.loads(resp.read())
        if not issues:
            return False
        most_recent_created = issues[0].get('created_at', '')
        if most_recent_created >= cutoff:
            issue_num = issues[0].get('number', '?')
            print(
                f'[scan] Open landscape issue #{issue_num} already exists '
                f'(created {most_recent_created[:10]}, cooldown {ISSUE_COOLDOWN_DAYS}d). '
                f'Skipping new issue creation.',
                file=sys.stderr,
            )
            return True
    except Exception as exc:
        print(f'[scan] Could not check existing issues: {exc} — proceeding normally', file=sys.stderr)

    return False


# YAML draft formatting
def format_yaml_draft(article: dict, rule: dict, pub_date: datetime | None) -> str:
    utc_now    = datetime.now(timezone.utc)
    base_date  = pub_date or utc_now
    published_str = base_date.strftime('%Y-%m-%d')
    expires_str   = (base_date + timedelta(days=90)).strftime('%Y-%m-%d')
    year_month    = base_date.strftime('%Y-%m')
    event_id      = f'landscape-{rule["topic_slug"]}-{year_month}'

    desc = re.sub(r'\s+', ' ', article.get('description', '')).strip()
    if len(desc) > 250:
        desc = desc[:250]
        last_period = desc.rfind('.')
        if last_period > 100:
            desc = desc[:last_period + 1]

    related_lines = '\n'.join(f'      - "{rid}"' for rid in rule['related_items'])

    return (
        f'  - id: "{event_id}"\n'
        f'    title: "⚠️ EDIT — {article["title"][:60]}"\n'
        f'    description: |\n'
        f'      ⚠️ REWRITE in framework voice before adding.\n'
        f'      Original: {desc}\n'
        f'    related_items:\n'
        f'{related_lines}\n'
        f'    multiplier: {rule["multiplier"]}\n'
        f'    severity: "{rule["severity"]}"\n'
        f'    published_at: "{published_str}"\n'
        f'    expires_at: "{expires_str}"\n'
        f'    source_url: "{article["link"]}"\n'
        f'    # detected_by: {rule["topic_slug"]} keyword rule\n'
        f'    # original_source: {article["source"]}'
    )


# GitHub issue creation
def create_github_issue(title: str, body: str) -> None:
    token = os.environ.get('GITHUB_TOKEN')
    repo  = os.environ.get('GITHUB_REPOSITORY')

    if not token or not repo:
        print('[scan] GITHUB_TOKEN or GITHUB_REPOSITORY not set — printing candidates instead', file=sys.stderr)
        print('\n' + '=' * 60)
        print(f'ISSUE TITLE: {title}')
        print('=' * 60)
        print(body)
        return

    payload = json.dumps({
        'title':  title,
        'body':   body,
        'labels': ['landscape-candidate'],
    }).encode('utf-8')

    req = urllib.request.Request(
        f'https://api.github.com/repos/{repo}/issues',
        data=payload,
        method='POST',
        headers={
            'Authorization':        f'Bearer {token}',
            'Accept':               'application/vnd.github+json',
            'Content-Type':         'application/json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent':           'Spectra-LandscapeBot/2.0',
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
        print(f'[scan] Created issue #{result["number"]}: {result["html_url"]}', file=sys.stderr)
    except Exception as exc:
        print(f'[scan] Failed to create GitHub issue: {exc}', file=sys.stderr)
        sys.exit(1)


# Main
def main() -> None:
    print('[scan] Spectra landscape scanner v2 starting...', file=sys.stderr)

    if recent_landscape_issue_exists():
        print('[scan] Exiting — recent open issue exists. Triage it before next scan.', file=sys.stderr)
        return

    existing_urls = load_existing_source_urls()
    print(f'[scan] {len(existing_urls)} existing source URLs loaded for dedup', file=sys.stderr)

    cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_ARTICLE_AGE_DAYS)
    severity_order = {'critical': 4, 'high': 3, 'moderate': 2, 'low': 1}

    candidates: list[dict] = []
    seen_links: set[str] = set()

    for source in RSS_SOURCES:
        for item in fetch_rss(source):
            link = item.get('link', '').strip()
            if not link:
                continue
            if link in existing_urls or link in seen_links:
                continue
            seen_links.add(link)

            pub_date = parse_pub_date(item.get('pubDate', ''))
            if pub_date and pub_date < cutoff:
                continue

            matches = score_article(item.get('title', ''), item.get('description', ''))
            if not matches:
                continue

            best = max(matches, key=lambda r: (severity_order.get(r['severity'], 0), r['multiplier']))

            candidates.append({
                'article':    item,
                'rule':       best,
                'pub_date':   pub_date,
                'all_topics': [r['topic_slug'] for r in matches],
            })
            print(
                f'[scan] CANDIDATE (score={best["match_score"]}): "{item["title"][:70]}" → '
                f'{best["topic_slug"]} ({best["severity"]}) | evidence: {best["match_evidence"]}',
                file=sys.stderr,
            )

    if not candidates:
        print('[scan] No new candidates found — nothing to report', file=sys.stderr)
        return

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    n = len(candidates)

    lines = [
        f'## Landscape Feed Candidates — {today}',
        '',
        f'Found **{n} article{"s" if n != 1 else ""}** matching security keyword rules in the past {MAX_ARTICLE_AGE_DAYS} days.',
        '',
        '> This issue will not be re-opened automatically until you close it (cooldown: '
        f'{ISSUE_COOLDOWN_DAYS} days). Triage at your own pace.',
        '',
        '### How to use this issue',
        '',
        '1. Review each candidate below. Each shows **match evidence** explaining why it was selected.',
        '2. For relevant events: **rewrite** the `title` and `description` fields in framework voice.',
        '3. Verify `related_items` IDs exist in `content/items/`. Remove any that do not.',
        '4. Adjust `multiplier` and `severity` if needed (multiplier > 1.3 requires extra review).',
        '5. Remove the `⚠️ EDIT` prefix and `detected_by` / `original_source` comments.',
        '6. Paste into `content/landscape-feed.yaml` under `events:` (max 4 active events).',
        '7. Close this issue.',
        '',
        '> ⚠️ **Do not paste drafts directly** — the `⚠️ EDIT` prefix must be removed and content rewritten.',
        '',
        '---',
        '',
    ]

    for i, c in enumerate(candidates, 1):
        article = c['article']
        rule    = c['rule']
        topics  = ', '.join(c['all_topics'])

        lines += [
            f'### Candidate {i} of {n} &nbsp;·&nbsp; `{rule["topic_slug"]}` &nbsp;·&nbsp; **{rule["severity"].upper()}**',
            '',
            f'| Field | Value |',
            f'|-------|-------|',
            f'| **Source** | {article["source"]} |',
            f'| **Headline** | {article["title"]} |',
            f'| **URL** | {article["link"]} |',
            f'| **Published** | {article.get("pubDate", "unknown")} |',
            f'| **Matched rules** | {topics} |',
            f'| **Match evidence** | `{rule["match_evidence"]}` (score: {rule["match_score"]}/{MINIMUM_MATCH_SCORE} min) |',
            '',
            '**Draft YAML (edit before using):**',
            '',
            '```yaml',
            format_yaml_draft(article, rule, c['pub_date']),
            '```',
            '',
            '---',
            '',
        ]

    lines += [
        '',
        f'*Generated by [Spectra landscape scanner]'
        f'(https://github.com/{os.environ.get("GITHUB_REPOSITORY", "KashishOO7/spectra")}'
        f'/blob/main/.github/scripts/scan-landscape.py) · {today}*',
    ]

    issue_title = f'🔍 Landscape Candidates — {today} ({n} found)'
    issue_body  = '\n'.join(lines)

    create_github_issue(issue_title, issue_body)
    print(f'[scan] Done — {n} candidate{"s" if n != 1 else ""} submitted for review', file=sys.stderr)


if __name__ == '__main__':
    main()
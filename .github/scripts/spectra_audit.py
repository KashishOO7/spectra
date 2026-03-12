#!/usr/bin/env python3

import os
import json
import yaml
import re
from pathlib import Path
from datetime import date, timedelta
from collections import defaultdict
from typing import Optional

SINGLE_ITEM_DIRS = [
    Path("content/controls"),
    Path("content/items"),
    Path("content/threats"),
]

COLLECTION_FILES = [
    Path("content/resources/tools.yaml"),
]

AMBER_DAYS    = 180
RED_DAYS      = 365
CRITICAL_DAYS = 548

TRACKING_PARAMS = re.compile(
    r"[?&](utm_source|utm_medium|utm_campaign|utm_content|utm_term"
    r"|fbclid|gclid|msclkid)=",
    re.IGNORECASE,
)


def load_yaml_safe(path: Path) -> Optional[object]:
    try:
        with path.open("r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except Exception as exc:
        print(f"  PARSE_ERROR  {path}: {exc}", flush=True)
        return None


def extract_items_from_file(path: Path, data: object) -> list[dict]:
    if data is None:
        return []
    items = []
    if isinstance(data, dict):
        if "id" in data:
            data["__path__"] = str(path)
            data["__source_file__"] = str(path)
            items.append(data)
        else:
            for key, value in data.items():
                if isinstance(value, dict) and "id" in value:
                    value["__path__"] = f"{path}#{key}"
                    value["__source_file__"] = str(path)
                    items.append(value)
    elif isinstance(data, list):
        for i, entry in enumerate(data):
            if isinstance(entry, dict) and "id" in entry:
                entry["__path__"] = f"{path}[{i}]"
                entry["__source_file__"] = str(path)
                items.append(entry)
    return items


def load_all_items_raw() -> list[dict]:
    raw = []
    for directory in SINGLE_ITEM_DIRS:
        if not directory.exists():
            print(f"  WARN  Directory not found: {directory}", flush=True)
            continue
        for path in sorted(directory.rglob("*.yaml")):
            data = load_yaml_safe(path)
            raw.extend(extract_items_from_file(path, data))
    for filepath in COLLECTION_FILES:
        if not filepath.exists():
            print(f"  WARN  Collection file not found: {filepath}", flush=True)
            continue
        data = load_yaml_safe(filepath)
        raw.extend(extract_items_from_file(filepath, data))
    return raw


def check_staleness(items: dict) -> list[dict]:
    findings = []
    today = date.today()
    for item_id, data in items.items():
        lv = data.get("last_verified")
        if not lv:
            findings.append({"id": item_id, "file": data["__path__"], "level": "amber",
                              "check": "staleness", "detail": "No last_verified date set."})
            continue
        try:
            verified = date.fromisoformat(str(lv)[:10])
        except ValueError:
            findings.append({"id": item_id, "file": data["__path__"], "level": "amber",
                              "check": "staleness",
                              "detail": f"last_verified '{lv}' is not a valid ISO date."})
            continue
        age = (today - verified).days
        if age >= CRITICAL_DAYS:
            level = "critical"
        elif age >= RED_DAYS:
            level = "red"
        elif age >= AMBER_DAYS:
            level = "amber"
        else:
            continue
        findings.append({"id": item_id, "file": data["__path__"], "level": level,
                          "check": "staleness",
                          "detail": f"last_verified: {lv} ({age} days ago)."})
    return findings


def check_deprecated_integrity(items: dict) -> list[dict]:
    findings = []
    for item_id, data in items.items():
        if data.get("status") == "deprecated" and not data.get("superseded_by"):
            findings.append({"id": item_id, "file": data["__path__"], "level": "red",
                              "check": "deprecated_integrity",
                              "detail": "status:deprecated but superseded_by is null."})
    return findings


def check_source_integrity(items: dict) -> list[dict]:
    findings = []
    for item_id, data in items.items():
        if data.get("status") != "active":
            continue
        sources = data.get("sources") or []
        if not sources:
            findings.append({"id": item_id, "file": data["__path__"], "level": "red",
                              "check": "source_integrity",
                              "detail": "status:active but no sources listed."})
            continue
        if not any(isinstance(s, dict) and s.get("type") == "primary" for s in sources):
            findings.append({"id": item_id, "file": data["__path__"], "level": "amber",
                              "check": "source_integrity",
                              "detail": "status:active but no source with type:primary."})
    return findings


def check_cross_references(items: dict) -> list[dict]:
    all_ids = set(items.keys())
    findings = []
    REF_FIELDS = [
        "compensating_controls", "depends_on", "related_items", "resources",
        "controls_implemented", "superseded_by", "implemented_by",
        "mitigated_by", "mitigates_threats", "alternatives",
    ]
    def check_ref(item_id, path, field, ref):
        ref_id = ref.get("id") if isinstance(ref, dict) else (ref if isinstance(ref, str) else None)
        if ref_id and ref_id not in all_ids:
            findings.append({"id": item_id, "file": path, "level": "red",
                              "check": "cross_reference",
                              "detail": f"'{field}' references '{ref_id}' which does not exist."})
    for item_id, data in items.items():
        path = data["__path__"]
        for field in REF_FIELDS:
            val = data.get(field)
            if not val:
                continue
            refs = val if isinstance(val, list) else [val]
            for ref in refs:
                check_ref(item_id, path, field, ref)
    return findings


def check_landscape_issues() -> list[dict]:
    import requests as req
    token = os.environ.get("GITHUB_TOKEN", "")
    repo = os.environ.get("REPO_NAME", "")
    if not token or not repo:
        return []
    headers = {"Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3+json",
                "X-GitHub-Api-Version": "2022-11-28"}
    findings = []
    try:
        res = req.get(f"https://api.github.com/repos/{repo}/issues"
                      f"?labels=landscape-candidate&state=open&per_page=50",
                      headers=headers, timeout=10)
        res.raise_for_status()
        for issue in res.json():
            try:
                age = (date.today() - date.fromisoformat(issue.get("created_at", "")[:10])).days
            except ValueError:
                continue
            if age > 30:
                findings.append({
                    "id": f"landscape-issue-#{issue['number']}",
                    "file": issue.get("html_url", ""),
                    "level": "amber", "check": "landscape_triage",
                    "detail": (f"Open landscape issue #{issue['number']} "
                               f"is {age} days old: \"{issue.get('title', '')[:80]}\".")
                })
    except Exception as exc:
        print(f"  WARN  Could not fetch landscape issues: {exc}", flush=True)
    return findings


def check_duplicate_ids(items_raw: list[dict]) -> list[dict]:
    id_to_paths: dict[str, list] = defaultdict(list)
    for item in items_raw:
        item_id = item.get("id")
        if item_id:
            id_to_paths[item_id].append(item.get("__path__", "unknown"))
    findings = []
    for item_id, paths in id_to_paths.items():
        if len(paths) > 1:
            findings.append({"id": item_id, "file": ", ".join(paths), "level": "critical",
                              "check": "duplicate_id",
                              "detail": f"ID appears in {len(paths)} files: {', '.join(paths)}"})
    return findings


def check_schema_version(items: dict) -> list[dict]:
    return [
        {"id": iid, "file": data["__path__"], "level": "amber",
         "check": "schema_version", "detail": "Missing schema_version field."}
        for iid, data in items.items() if not data.get("schema_version")
    ]


def check_human_track_integrity(items: dict) -> list[dict]:
    return [
        {"id": iid, "file": data["__path__"], "level": "red",
         "check": "human_track_integrity",
         "detail": "category:human_vulnerability requires emotional_register."}
        for iid, data in items.items()
        if data.get("category") == "human_vulnerability" and not data.get("emotional_register")
    ]


def check_mixed_posture_caveats(items: dict) -> list[dict]:
    return [
        {"id": iid, "file": data["__path__"], "level": "red",
         "check": "mixed_posture_caveats",
         "detail": (f"privacy_posture:{data.get('privacy_posture')} requires non-empty caveats.")}
        for iid, data in items.items()
        if data.get("privacy_posture") in ("mixed", "avoid") and not data.get("caveats")
    ]


def extract_all_urls(data, prefix=""):
    if isinstance(data, dict):
        for key, value in data.items():
            path = f"{prefix}.{key}" if prefix else key
            if key == "url" and isinstance(value, str) and value.startswith("http"):
                yield (path, value)
            else:
                yield from extract_all_urls(value, path)
    elif isinstance(data, list):
        for i, item in enumerate(data):
            yield from extract_all_urls(item, f"{prefix}[{i}]")


def check_tracking_urls(items: dict) -> list[dict]:
    findings = []
    for item_id, data in items.items():
        for field_path, url in extract_all_urls(data):
            if TRACKING_PARAMS.search(url):
                findings.append({"id": item_id, "file": data["__path__"], "level": "red",
                                  "check": "tracking_url",
                                  "detail": f"URL at '{field_path}' has tracking params: {url[:120]}"})
    return findings


def main():
    today_str = date.today().isoformat()
    print(f"Spectra Internal Audit — {today_str}", flush=True)
    print("=" * 60, flush=True)

    items_raw = load_all_items_raw()
    items: dict[str, dict] = {}
    for item in items_raw:
        item_id = item.get("id")
        if item_id:
            items[item_id] = item

    print(f"Loaded {len(items)} unique items from {len(items_raw)} total entries.", flush=True)

    if not items:
        print(
            "WARNING: Zero items loaded. Verify content directory paths. "
            "A zero-item audit produces a clean report that is a false negative.",
            flush=True,
        )

    all_findings: list[dict] = []
    all_findings += check_duplicate_ids(items_raw)
    all_findings += check_staleness(items)
    all_findings += check_deprecated_integrity(items)
    all_findings += check_source_integrity(items)
    all_findings += check_cross_references(items)
    all_findings += check_schema_version(items)
    all_findings += check_human_track_integrity(items)
    all_findings += check_mixed_posture_caveats(items)
    all_findings += check_tracking_urls(items)
    all_findings += check_landscape_issues()

    severity_order = {"critical": 0, "red": 1, "amber": 2}
    all_findings.sort(key=lambda f: severity_order.get(f["level"], 9))

    by_level: dict[str, list] = defaultdict(list)
    for f in all_findings:
        by_level[f["level"]].append(f)

    print(f"\nTotal findings: {len(all_findings)}", flush=True)
    for level in ["critical", "red", "amber"]:
        if level in by_level:
            print(f"  {level.upper()}: {len(by_level[level])}", flush=True)

    report = {
        "date": today_str,
        "item_count": len(items),
        "raw_entry_count": len(items_raw),
        "finding_count": len(all_findings),
        "findings": all_findings,
    }
    with open("audit_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\nReport written to audit_report.json.", flush=True)


if __name__ == "__main__":
    main()
from __future__ import annotations

from pathlib import Path

import yaml
from mkdocs.structure.files import InclusionLevel

BLOG_PREFIX = "blog/posts/"
PUBLISH_KEY = "publish"
CONTRIBUTOR_INFO_FILENAME = "author_info.md"
CONTRIBUTORS_PLACEHOLDER = "<!-- CONTRIBUTORS_SECTION -->"
AUTHOR_INFO_PLACEHOLDER = "<!-- AUTHOR_INFO_SECTION -->"
AUTHOR_INFO_PAGE_SRC = "authors/index.md"


def _read_front_matter(path: Path) -> dict:
    if not path.is_file():
        return {}
    with path.open("r", encoding="utf-8") as handle:
        first = handle.readline()
        if not first.startswith("---"):
            return {}

        lines = []
        for line in handle:
            if line.startswith("---"):
                break
            lines.append(line)

    data = yaml.safe_load("".join(lines)) or {}
    return data if isinstance(data, dict) else {}


def _read_markdown_body(path: Path) -> str:
    if not path.is_file():
        return ""
    lines = path.read_text(encoding="utf-8").splitlines()
    if lines and lines[0].strip() == "---":
        idx = 1
        while idx < len(lines):
            if lines[idx].strip() == "---":
                lines = lines[idx + 1 :]
                break
            idx += 1
    return "\n".join(lines).strip()


def _extract_summary(markdown_body: str) -> str:
    if not markdown_body:
        return ""

    lines = markdown_body.splitlines()
    start = 0
    for i, line in enumerate(lines):
        if line.strip().lower() in {"## about", "# about"}:
            start = i + 1
            break

    paragraph: list[str] = []
    for line in lines[start:]:
        text = line.strip()
        if not text:
            if paragraph:
                break
            continue
        if text.startswith("#"):
            if paragraph:
                break
            continue
        if text.startswith("!"):
            continue
        paragraph.append(text)

    summary = " ".join(paragraph).strip()
    if not summary:
        return ""

    words = summary.split()
    if len(words) > 28:
        return " ".join(words[:28]) + "..."
    return summary


def _collect_contributors(config, files) -> list[dict]:
    docs_dir = Path(config["docs_dir"]).resolve()
    posts_root = docs_dir / BLOG_PREFIX.rstrip("/")
    if not posts_root.exists():
        return []

    file_url_by_src = {file.src_uri: file.url for file in files}
    contributors: list[dict] = []

    for info_path in sorted(posts_root.rglob(CONTRIBUTOR_INFO_FILENAME)):
        info_meta = _read_front_matter(info_path)
        if info_meta.get(PUBLISH_KEY) is not True:
            continue

        published_posts: list[dict] = []
        for post_path in sorted(info_path.parent.glob("*.md")):
            if post_path.name == CONTRIBUTOR_INFO_FILENAME:
                continue
            post_meta = _read_front_matter(post_path)
            if post_meta.get(PUBLISH_KEY) is not True:
                continue
            post_src = post_path.relative_to(docs_dir).as_posix()
            post_url = file_url_by_src.get(post_src, "")
            if not post_url:
                continue
            post_url = "../" + post_url.lstrip("/")
            published_posts.append(
                {
                    "title": str(post_meta.get("title") or post_path.stem.replace("_", " ")),
                    "date": str(post_meta.get("date") or ""),
                    "url": post_url,
                }
            )

        latest_post: dict | None = None
        if published_posts:
            published_posts.sort(key=lambda post: post["date"], reverse=True)
            latest_post = published_posts[0]

        contributors.append(
            {
                "name": str(info_meta.get("title") or info_path.parent.name),
                "summary": _extract_summary(_read_markdown_body(info_path)),
                "latest_title": latest_post["title"] if latest_post else "",
                "latest_url": latest_post["url"] if latest_post else "",
            }
        )

    contributors.sort(key=lambda contributor: contributor["name"].lower())
    return contributors


def _table_text(value: str) -> str:
    return " ".join(value.strip().split()).replace("|", "\\|")


def _render_contributors_section(contributors: list[dict]) -> str:
    if not contributors:
        return "_No author profiles are marked with `publish: true` yet._"

    lines = [
        "| Contributor | Details | Latest Post |",
        "| --- | --- | --- |",
    ]

    for contributor in contributors:
        details = _table_text(contributor["summary"] or "Contributor profile")

        if contributor["latest_url"]:
            latest_post = (
                f'<a href="{contributor["latest_url"]}">'
                f'{_table_text(contributor["latest_title"])}</a>'
            )
        else:
            latest_post = "_No published posts yet_"

        lines.append(
            f"| **{_table_text(contributor['name'])}** | {details} | {latest_post} |"
        )

    return "\n".join(lines)


def on_files(files, config):
    for file in files:
        src_path = file.src_uri
        if not src_path.endswith(".md"):
            continue
        if not src_path.startswith(BLOG_PREFIX):
            continue
        if src_path.endswith(f"/{CONTRIBUTOR_INFO_FILENAME}"):
            file.inclusion = InclusionLevel.EXCLUDED
            continue

        meta = _read_front_matter(Path(file.abs_src_path))
        if meta.get(PUBLISH_KEY) is True:
            file.inclusion = InclusionLevel.INCLUDED
        else:
            file.inclusion = InclusionLevel.DRAFT

    return files


def on_page_markdown(markdown, page, config, files):
    if page.file.src_uri == AUTHOR_INFO_PAGE_SRC and AUTHOR_INFO_PLACEHOLDER in markdown:
        contributors = _collect_contributors(config, files)
        rendered = _render_contributors_section(contributors)
        return markdown.replace(AUTHOR_INFO_PLACEHOLDER, rendered)

    if page.file.src_uri != "index.md":
        return markdown
    if CONTRIBUTORS_PLACEHOLDER not in markdown:
        return markdown

    contributors = _collect_contributors(config, files)
    rendered = _render_contributors_section(contributors)
    return markdown.replace(CONTRIBUTORS_PLACEHOLDER, rendered)

from __future__ import annotations

from pathlib import Path

import yaml
from mkdocs.structure.files import InclusionLevel

BLOG_PREFIX = "blog/posts/"
PUBLISH_KEY = "publish"


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


def on_files(files, config):
    for file in files:
        src_path = file.src_uri
        if not src_path.endswith(".md"):
            continue
        if not src_path.startswith(BLOG_PREFIX):
            continue

        meta = _read_front_matter(Path(file.abs_src_path))
        if meta.get(PUBLISH_KEY) is True:
            file.inclusion = InclusionLevel.INCLUDED
        else:
            file.inclusion = InclusionLevel.DRAFT

    return files

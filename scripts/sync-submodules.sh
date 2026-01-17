#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(git -C "$script_dir" rev-parse --show-toplevel)"
list_file="${1:-"$repo_root/scripts/submodules.txt"}"
dest_root="${2:-"$repo_root/docs/blog/posts"}"

if [[ ! -f "$list_file" ]]; then
  echo "Missing list file: $list_file" >&2
  echo "Expected format: <slug> <repo-url>" >&2
  exit 1
fi

mkdir -p "$dest_root"

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line#"${line%%[![:space:]]*}"}"
  line="${line%"${line##*[![:space:]]}"}"
  [[ -z "$line" || "$line" == \#* ]] && continue

  set -- $line
  slug="${1:-}"
  repo_url="${2:-}"

  if [[ -z "$slug" || -z "$repo_url" ]]; then
    echo "Invalid line in $list_file: $line" >&2
    exit 1
  fi

  dest_path="$dest_root/$slug"
  if [[ -e "$dest_path" && ! -f "$dest_path/.git" && ! -d "$dest_path/.git" ]]; then
    echo "Path exists and is not a submodule: $dest_path" >&2
    exit 1
  fi

  if git -C "$repo_root" submodule status -- "$dest_path" >/dev/null 2>&1; then
    echo "Submodule already present: $dest_path"
  else
    echo "Adding submodule: $dest_path -> $repo_url"
    git -C "$repo_root" submodule add "$repo_url" "$dest_path"
  fi
done < "$list_file"

git -C "$repo_root" submodule sync --recursive
git -C "$repo_root" submodule update --init --recursive

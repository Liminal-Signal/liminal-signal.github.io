[use]: https://github.com/Andre601/mkdocs-template/generate

# Quick Start for Students

## 1. Install Python

- Download and install Python 3.11 or newer from [python.org](https://www.python.org/downloads/).
- On Windows, check the box to add Python to PATH during installation.
- To check your Python version, run:
  ```bash
  python --version
  # or
  python3 --version
  ```
- If you don't have `pip`, see [pip installation guide](https://pip.pypa.io/en/stable/installation/).

## 2. Install Git

- Download and install Git from [git-scm.com](https://git-scm.com/downloads).
- To check if Git is installed, run:
  ```bash
  git --version
  ```

## 3. Open a Terminal

- **Windows:** Use Command Prompt, PowerShell, or Windows Terminal.
- **Mac/Linux:** Use Terminal app.

## 4. Clone the Repository

```bash
git clone <your-repo-url>
cd alexanderlewisstevens.github.io
```

## 5. Install Dependencies

```bash
pip install -r requirements.txt
```

- If you get errors, try:
  ```bash
  pip install --upgrade -r requirements.txt
  ```

## 6. Preview the Site Locally

```bash
mkdocs serve
```

- If `mkdocs` is not found, try:
  ```bash
  python -m mkdocs serve
  ```
- Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.
- If port 8000 is in use, try:
  ```bash
  mkdocs serve -a 127.0.0.1:8001
  ```

## 7. Build the Site

```bash
mkdocs build
```

## 8. Edit Files

- Use [VS Code](https://code.visualstudio.com/) or any text editor to edit Markdown files in the `docs/` folder.

## 9. Push Your Changes to GitHub

```bash
git add .
git commit -m "Describe your changes"
git push
```

## 10. Resetting Your Repo (if you get stuck)

```bash
cd ..
rm -rf alexanderlewisstevens.github.io
# or use File Explorer to delete the folder
# Then reclone as above
```

---

# Collaborative Development

## Recommended Workflow (VS Code + Dev Containers)

1. **Install [VS Code](https://code.visualstudio.com/) and the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).**
2. **Clone this repository.**
3. **Open the folder in VS Code.**
4. **When prompted, reopen in the Dev Container.**
   - This will build the Docker image and set up all dependencies automatically.
5. **Use the built-in terminal to run:**
   - `make serve` to preview the site at [http://localhost:8000](http://localhost:8000)
   - `make build` to build the static site

All contributors will have a consistent environment, including Python, MkDocs, and all required plugins.

## Manual Development (without Dev Containers)

- Install Python 3.11+
- Run `pip install -r requirements.txt`
- Use `make serve` or `mkdocs serve` to preview

## Troubleshooting

- If `mkdocs` is not found, ensure your Python Scripts directory is in your PATH.
- If port 8000 is in use, try `mkdocs serve -a 127.0.0.1:8001`.
- If you see permission errors, try running the command with `python -m mkdocs`.
- If you get dependency errors, run `pip install --upgrade -r requirements.txt` again.
- For broken links or images, check file paths and ensure referenced files exist.

## Getting Help

- If you need help, contact your instructor, ask on Discord/Teams, or open an issue on GitHub.

---

For more help, contact your instructor or open an issue on GitHub.

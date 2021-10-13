"""Sphinx configuration."""
from datetime import datetime


project = "Quantum-viz.js widget"
author = "Microsoft Corporation"
copyright = f"{datetime.now().year}, {author}"
extensions = ["sphinx.ext.intersphinx"]
intersphinx_mapping = {"mypy": ("https://mypy.readthedocs.io/en/stable/", None)}  # noqa
language = "en"
html_static_path = ["_static"]
html_theme = "alabaster"
html_theme_options = {
    "github_banner": "true",
    "github_button": "true",
    "github_count": "true",
    "github_user": "guenp",
    "github_repo": "quantum-viz.js",
    "github_type": "star",
    "logo": "logo.png",
    "logo_name": "true",
    "fixed_sidebar": "true",
    "sidebar_width": "250px",
}
linkcheck_ignore = [
    "codeofconduct.html",
    "https://github.com/PyCQA/flake8-bugbear#",
    "https://github.com/peterjc/flake8-rst-docstrings#",
    "https://github.com/pre-commit/pre-commit-hooks#",
    "https://github.com/pycqa/pep8-naming#",
    "https://github.com/terrencepreilly/darglint#",
    "https://github.com/PyCQA/mccabe#",
    "https://github.com/microsoft/quantum-viz.js/releases/tag/",
]

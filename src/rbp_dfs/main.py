"""
Main entry point for RogueByte Police Digital Forensics Suite (RBP-DFS).
Author: SidoDev-Dz
Organization: RogueByte
"""

import sys
import os
from pathlib import Path

# Ensure package root is in sys.path
package_root = Path(__file__).resolve().parent.parent
if str(package_root) not in sys.path:
    sys.path.insert(0, str(package_root))

from rbp_dfs.cli.menu import main as cli_main


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        sys.argv = [sys.argv[0], "--menu"]
        cli_main()
    else:
        cli_main()


if __name__ == "__main__":
    main()

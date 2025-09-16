# Generate Changelog

Generate a detailed changelog for the current branch compared to main.

## Usage
```
/changelog
```

## Description
This command analyzes the differences between the current branch and the main branch, then generates a comprehensive changelog including:

- **Added features** - New functionality and components
- **Changed functionality** - Modified existing features
- **Fixed issues** - Bug fixes and corrections
- **Removed items** - Deleted or deprecated functionality
- **Technical changes** - Infrastructure, dependencies, and internal improvements

## Implementation

```bash
# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Get the merge base between current branch and main
MERGE_BASE=$(git merge-base HEAD main)

# Get list of changed files
echo "## Changed Files"
git diff --name-only $MERGE_BASE..HEAD

echo -e "\n## Commit Messages"
git log --oneline $MERGE_BASE..HEAD

echo -e "\n## File Changes Summary"
git diff --stat $MERGE_BASE..HEAD

echo -e "\n## Detailed Changes"
git diff $MERGE_BASE..HEAD
```

The command will:
1. Compare the current branch with main branch
2. Identify all modified, added, and deleted files
3. Extract commit messages for context
4. Generate a structured changelog
5. Categorize changes by type (feat, fix, chore, etc.)
6. Highlight breaking changes if any

## Output Format
The changelog will be formatted in standard markdown with:
- Clear section headers
- Bullet points for each change
- File references where applicable
- Commit hashes for traceability
# Contributing

## How to Release a New Version

Below is the workflow for developers to release a new version to npm:

1. **Ensure you are on the `master` branch** and that your local copy is up-to-date:

   ```bash
   git checkout master
   git pull origin master
   ```

2. **Confirm all tests pass and the build is clean**:

   ```bash
   npm ci
   npm run build
   ```

   This helps avoid publishing broken builds.

3. **Bump the version** using one of the semantic identifiers (`patch`, `minor`, or `major`). This will update the version in `package.json` and create a Git tag:

   ```bash
   npm version patch  # or minor / major
   ```

4. **Push your commit and tags**:

   ```bash
   git push --follow-tags
   ```

   Our CI/CD pipeline will detect the new tag and publish the package to npm automatically.

5. **Verify the release** on [npmjs.com](https://www.npmjs.com) and in your local project if desired.

> **Tip:** Use `npm version prerelease` for alpha or beta releases if you want to share preview versions without impacting the stable release line.

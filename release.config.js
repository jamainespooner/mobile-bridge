/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-undef */
const name = `@syft-application/mobile-bridge`
const srcRoot = `libs/react/mobile-bridge`

module.exports = {
  extends: '../../../release.config.js',
  tagFormat: 'react-mobile-bridge-v${version}',
  plugins: [
    [
      '@abgov/nx-release',
      {
        project: 'react-mobile-bridge',
        preset: 'conventionalcommits',
        parserOpts: {
          issuePrefixes: ['FETI-', 'PTE-', 'WORKERCORE-'],
          issueUrlFormat: 'https://syftapp.atlassian.net/browse/{{prefix}}{{id}}',
        },
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogTitle: `# Indeed flex - ${name}`,
        changelogFile: `${srcRoot}/CHANGELOG.md`,
      },
    ],
    [
      '@semantic-release/npm',
      {
        pkgRoot: 'dist/libs/react/mobile-bridge',
        tarballDir: 'pack/dist/libs/react/mobile-bridge',
        npmPublish: true,
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: [`${srcRoot}/CHANGELOG.md`, `${srcRoot}/package.json`, `${srcRoot}/yarn.lock`],
        message: 'chore(release): ' + name + ' ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: 'pack/dist/libs/react/mobile-bridge/*.tgz',
      },
    ],
    [
      '@syft-application/semantic-release-jira',
      {
        transitionStatus: 'Done',
        resolutionStatus: 'Done',
        // eslint-disable-next-line no-template-curly-in-string
        versionNameTemplate: '${package_name}-${version}',
      },
    ],
  ],
}

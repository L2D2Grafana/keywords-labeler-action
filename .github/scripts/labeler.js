const core = require('@actions/core')
const github = require('@actions/github')
const nlp = require('compromise')
const _ = require('lodash')

async function run() {
  try {
    const issueTitle = github.context.payload.issue.title
    const issueBody = github.context.payload.issue.body
    const issueNumber = github.context.payload.issue.number
    const issueLabels = github.context.payload.issue.labels

    console.log('issueLabels', issueLabels)

    const keywordToLabelMap = [
      { keywords: ['PIR', 'pir', 'incident', 'Incident'], label: 'postmortem' },
      {
        keywords: [
          'BackendSrv',
          'Dashboard',
          'Annotations',
          'News panel',
          'Text panel',
          'Login',
          'Playlists',
          'Navigation',
          'A11y',
          'Legacy Graph panel',
          'Theming',
          'App notifications',
          'grafana/ui components',
          'Timepicker',
          'Search FE',
          'Command palette',
          'Internationalization'
        ],
        label: 'oss-user-essentials'
      }
    ]

    const octokit = github.getOctokit(process.env.REPO_TOKEN)

    let labelsToAdd = []

    const issueContent = issueTitle + ' ' + issueBody

    const doc = nlp(issueContent.toLowerCase())

    keywordToLabelMap.forEach(mapping => {
      if (_.some(mapping.keywords, keyword => doc.has(keyword))) {
        labelsToAdd.push(mapping.label)
      }
    })

    if (labelsToAdd.length > 0) {
      // loop through labelsToAdd and remove any that are already on the issue
      labelsToAdd = labelsToAdd.filter(
        label => !issueLabels.some(issueLabel => issueLabel.name === label)
      )
    }
    console.log('labelsToAdd :>> ', labelsToAdd)

    if (labelsToAdd.length > 0) {
      await octokit.rest.issues.addLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: issueNumber,
        labels: labelsToAdd
      })
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

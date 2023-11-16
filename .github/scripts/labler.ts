import * as core from '@actions/core'
import github from '@actions/github'
const nlp = require('compromise')
import _ from 'lodash'

export const labeler = async () => {
  try {
    const issueTitle = github?.context?.payload?.issue?.title
    const issueBody = github?.context?.payload?.issue?.body
    const issueNumber = github?.context?.payload?.issue?.number

    const keywordToLabelMap = [
      { keywords: ['PIR', 'pir', 'incident', 'Incident'], label: 'postmortem' }
    ]

    const token = core.getInput('repo-token', { required: true })
    const octokit = github.getOctokit(token)

    let labelsToAdd: string[] = []

    const issueContent = issueTitle + ' ' + issueBody

    const doc = nlp(issueContent.toLowerCase())

    keywordToLabelMap.forEach(mapping => {
      if (_.some(mapping.keywords, keyword => doc.has(keyword))) {
        labelsToAdd.push(mapping.label)
      }
    })

    if (labelsToAdd.length > 0 && issueNumber) {
      await octokit.rest.issues.addLabels({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: issueNumber,
        labels: labelsToAdd
      })
    }
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

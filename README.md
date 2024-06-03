This app is the frontend client for the adjudications service, which is used to create adjudication details, log hearings, awarded punishments and create DIS forms.

Backend client: hmpps-manage-adjudications-api

### Running the app for development

Create a `.env` file with the following environment variables:

```
API_CLIENT_ID=<ask team>
API_CLIENT_SECRET=<ask team>
SYSTEM_CLIENT_ID=<ask team>
SYSTEM_CLIENT_SECRET=<ask team>
SESSION_SECRET=<ask team>
TAG_MANAGER_CONTAINER_ID=<ask team>
TOKEN_VERIFICATION_API_URL=https://token-verification-api-dev.prison.service.justice.gov.uk
HMPPS_MANAGE_USERS_API_URL=https://manage-users-api-dev.hmpps.service.justice.gov.uk
HMPPS_AUTH_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
MANAGE_ADJUDICATIONS_API_URL=https://manage-adjudications-api-dev.hmpps.service.justice.gov.uk
PRISON_API_URL=https://prison-api-dev.prison.service.justice.gov.uk
DIGITAL_PRISON_SERVICE_URL=https://digital-dev.prison.service.justice.gov.uk
PRISONER_PROFILE_SERVICE_URL=http://prisoner-dev.digital.prison.service.justice.gov.uk
CURIOUS_API_URL=https://testservices.sequation.net/sequation-virtual-campus2-api
SUPPORT_URL=https://support-dev.hmpps.service.justice.gov.uk/
PRISONER_SEARCH_API_URL=https://prisoner-search-dev.prison.service.justice.gov.uk
NOMIS_USER_API_URL=https://nomis-user-dev.aks-dev-1.studio-hosting.service.justice.gov.uk/
FRONTEND_COMPONENT_API_URL=https://frontend-components-dev.hmpps.service.justice.gov.uk
DATA_INSIGHTS_API_URL=https://adjudications-insights-api-dev.hmpps.service.justice.gov.uk
ENVIRONMENT_NAME=DEV
```

To start the main services excluding the manage adjudications app:

`docker-compose up`

Install dependencies using `npm install`, ensuring you are using >= `Node v20.x` and >= `npm v10`

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Run tests

`npm run test`

### Running integration tests

For local running, start a test db, redis, and wiremock instance by:

`docker-compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with nodemon)

And then either, run tests in headless mode with:

`npm run int-test`

Or run tests with the cypress UI:

`npm run int-test-ui`

### Guide around adding offences to the decision tree

The offences are stored in the decisionTree.ts, and are either presented as a series of questions, across multiple pages, or as a single page
with the questions grouped by paragraph.

Its possible when policy changes, that some offences and their questions will be altered, amended, or a new series added, to go live on a specific date

In order to meet this criteria the decisionTree now contains versioning.  The defaults will be all the versions.  To add a new version, add the new version to all of occurences of the 

```applicableVersions: number[] ```

For the standard decision tree (ie a sequence of pages) examples include adding a new final answer

```
      .child(
          answer('Threatening, abusive, or insulting behaviour').versionedChild([
            question('Did the incident involve racist behaviour?', null, [1])
              .child(answer('Yes').offenceCode(20001))
              .child(answer('No').offenceCode(20002)),
            question('Was the incident aggravated by a protected characteristic?', null, [2])
              .child(answer('Yes').child(protectedCharacteristicsQuestion(2000124)))
              .child(answer('No').offenceCode(20002)) 
          ])
        )
```

adding a some new text in a question

```
answer(CHILD_1_Q, [1]).child(versionedQuestion1Answers),
answer(CHILD_1_Q_V2, [2]).child(versionedQuestion1Answers),
  ```

  For the ALO versions, the versions will go in the config such as 

```
new AloOffenceItem(CHILD_1_Q,['1', '1(a)', '4', '5'], [1]),
new AloOffenceItem(CHILD_1_Q_V2,['1', '1(a)', '4', '5', '1(b)', '1(c)', '1(d)'], [2]),
  
new AloOffenceItem(CHILD_1_Q,['1', '2', '5', '6'], [1]),
new AloOffenceItem(CHILD_1_Q_V2,['1', '2', '5', '6', '2(a)', '2(b)', '2(c)'], [2]),
```

If they have additonal questions leading from this page the extra pages config can also be versioned

```
new ParaToNextQuestion('2',adultPara1aYoiPara2OverrideQuestionId, [1] ),
new ParaToNextQuestion('2',adultPara1aYoiPara2OverrideQuestionIdV2, [2] ),
```

finally to map the config back to the correct offence codes, this can also be versioned such as 

```
new ParaToOffenceCode('24(a)','24101', [1] ),
new ParaToOffenceCode('24(a)', '2410124', [2]),
 ```
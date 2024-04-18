/* eslint-disable */
import { PlaceholderText as Text } from './Placeholder'
import { IncidentRole as Role } from '../incidentRole/IncidentRole'
import { AnswerType as Type } from './Answer'
import { answer, question } from './Decisions'
import { GroupedOffenceRulesAndTitles, OffenceRule, offenceRuleAndTitle } from '../data/DraftAdjudicationResult'

const CHILD_1_Q = 'Assault, fighting, or endangering the health or personal safety of others'
const CHILD_1_Q_V2 = 'Assault, fighting, endangering the health or personal safety of others or sexually assault, expose or harass someone'
const CHILD_2_Q = 'Escape or failure to comply with temporary release conditions'
const CHILD_3_Q = 'Possession of unauthorised articles, or drugs or alcohol related (including MDT charges)'
const CHILD_4_Q = 'Sets fire to, or damages, the prison or any property'
const CHILD_5_Q = 'Disrespectful, threatening, abusive, or insulting behaviour'
const CHILD_6_Q = 'Disobeys any lawful order, or failure to comply with any rule or regulation' 
const CHILD_6_Q_V2 = 'Disobeys any lawful order, or failure to comply with any rule or regulation including any payback punishment' 
const CHILD_7_Q = 'Detains another person'
const CHILD_8_Q = 'Stopping someone who is not a prisoner from doing their job'
const CHILD_9_Q = 'Being absent without authorisation, being in an unauthorised place, or failing to work correctly'

class AloOffenceItem{
  childQuestion: string
  paras: string[]
  private readonly applicableVersions: number[]

  constructor(
    childQuestion: string,
    paras: string[],
    applicableVersions: number[] = [1,2]
  ) {
    this.childQuestion = childQuestion
    this.paras = paras
    this.applicableVersions = applicableVersions
  }

  isApplicableVersion(version: number): boolean {
    return this.applicableVersions.includes(version)
  }
}

class ParaToNextQuestion {
  para: string
  questionId: string
  private readonly applicableVersions: number[]


  constructor(
    para: string,
    questionId: string,
    applicableVersions: number[] = [1,2]
  ) {
    this.para = para
    this.questionId = questionId
    this.applicableVersions = applicableVersions
    }
  
    isApplicableVersion(version: number): boolean {
      return this.applicableVersions.includes(version)
    }
  
}

class ParaToOffenceCode {
  para: string
  offenceCode: string
  private readonly applicableVersions: number[]


  constructor(
    para: string,
    offenceCode: string,
    applicableVersions: number[] = [1,2]
  ) {
    this.para = para
    this.offenceCode = offenceCode
    this.applicableVersions = applicableVersions
    }
  
    isApplicableVersion(version: number): boolean {
      return this.applicableVersions.includes(version)
    }
 

}

// Adult
const adultQToOffencePara = [
  new AloOffenceItem(CHILD_1_Q,['1', '1(a)', '4', '5'], [1]),
  new AloOffenceItem(CHILD_1_Q_V2,['1', '1(a)', '4', '5', '1(b)', '1(c)', '1(d)'], [2]),
  new AloOffenceItem(CHILD_2_Q,['7', '8']),
  new AloOffenceItem(CHILD_3_Q,['9', '10', '11', '12', '13', '14', '15', '24']),
  new AloOffenceItem(CHILD_4_Q,['16', '17', '24(a)'], [1]),
  new AloOffenceItem(CHILD_4_Q,['16', '17', '17(a)', '24(a)'], [2]),
  new AloOffenceItem(CHILD_5_Q,['19', '20', '20(a)']),
  new AloOffenceItem(CHILD_6_Q,['22', '23'], [1]),
  new AloOffenceItem(CHILD_6_Q_V2,['22', '23', '23(a)'], [2]),
  new AloOffenceItem(CHILD_7_Q,['2']),
  new AloOffenceItem(CHILD_8_Q,['3', '6']),
  new AloOffenceItem(CHILD_9_Q,['18', '21']),
]
// YOI
const yoiQToOffencePara = [
  new AloOffenceItem(CHILD_1_Q,['1', '2', '5', '6'], [1]),
  new AloOffenceItem(CHILD_1_Q_V2,['1', '2', '5', '6', '2(a)', '2(b)', '2(c)'], [2]),
  new AloOffenceItem(CHILD_2_Q,['8', '9']),
  new AloOffenceItem(CHILD_3_Q,['10', '11', '12', '13', '14', '15', '16', '27']),
  new AloOffenceItem(CHILD_4_Q,['17', '18', '19', '28']),
  new AloOffenceItem(CHILD_5_Q,['21', '22', '23']),
  new AloOffenceItem(CHILD_6_Q,['25'], [1]),
  new AloOffenceItem(CHILD_6_Q_V2,['25', '26(a)'], [2]),
  new AloOffenceItem(CHILD_7_Q,['3']),
  new AloOffenceItem(CHILD_8_Q,['4', '7', '26']),
  new AloOffenceItem(CHILD_9_Q,['20', '24']),
]

const para1OverrideQuestionId = '99'
const adultPara1aYoiPara2OverrideQuestionId = '98'
const adultPara7YoiPara8OverrideQuestionId = '97'
const adultPara8YoiPara9OverrideQuestionId = '96'
const adultPara9YoiPara10OverrideQuestionId = '95'
const adultPara12YoiPara13OverrideQuestionId = '94'
const adultPara24YoiPara27OverrideQuestionId = '93'
const adultPara18YoiPara20OverrideQuestionId = '92'
const adultPara23YoiPara26OverrideQuestionId = '91'
const adultPara22YoiPara25OverrideQuestionId = '90'

const adultParaToNextQuestion = [
  new ParaToNextQuestion('4','1-1-2'),
  new ParaToNextQuestion('5', '1-1-3' ),
  new ParaToNextQuestion('2', '1-7' ),
  new ParaToNextQuestion('19','1-5-1' ),
  new ParaToNextQuestion('1', para1OverrideQuestionId ),
  new ParaToNextQuestion('1(a)',adultPara1aYoiPara2OverrideQuestionId ),
  new ParaToNextQuestion('7',adultPara7YoiPara8OverrideQuestionId ),
  new ParaToNextQuestion('8',adultPara8YoiPara9OverrideQuestionId ),
  new ParaToNextQuestion('9',adultPara9YoiPara10OverrideQuestionId ),
  new ParaToNextQuestion('12',adultPara12YoiPara13OverrideQuestionId ),
  new ParaToNextQuestion('24',adultPara24YoiPara27OverrideQuestionId ),
  new ParaToNextQuestion('18',adultPara18YoiPara20OverrideQuestionId ),
  new ParaToNextQuestion('23',adultPara23YoiPara26OverrideQuestionId ),
  new ParaToNextQuestion('22',adultPara22YoiPara25OverrideQuestionId ),
  new ParaToNextQuestion('20(a)','1-5-2-1', [2]),
  new ParaToNextQuestion('17(a)', '1-4-2', [2]),
  new ParaToNextQuestion('24(a)','1-4-3', [2]),
]

const yoiParaToNextQuestion = [
  new ParaToNextQuestion('5','1-1-2' ),
  new ParaToNextQuestion('6','1-1-3' ),
  new ParaToNextQuestion('3','1-7' ),
  new ParaToNextQuestion('21','1-5-1' ),
  new ParaToNextQuestion('1',para1OverrideQuestionId ),
  new ParaToNextQuestion('2',adultPara1aYoiPara2OverrideQuestionId ),
  new ParaToNextQuestion('8',adultPara7YoiPara8OverrideQuestionId ),
  new ParaToNextQuestion('9',adultPara8YoiPara9OverrideQuestionId ),
  new ParaToNextQuestion('10',adultPara9YoiPara10OverrideQuestionId ),
  new ParaToNextQuestion('13',adultPara12YoiPara13OverrideQuestionId ),
  new ParaToNextQuestion('27',adultPara24YoiPara27OverrideQuestionId ),
  new ParaToNextQuestion('20',adultPara18YoiPara20OverrideQuestionId ),
  new ParaToNextQuestion('26',adultPara23YoiPara26OverrideQuestionId ),
  new ParaToNextQuestion('25', adultPara22YoiPara25OverrideQuestionId),
  new ParaToNextQuestion('23', '1-5-2-1', [2]),
  new ParaToNextQuestion('19','1-4-2', [2]),
  new ParaToNextQuestion('28','1-4-3', [2]),
]

const adultParaToOffenceCode = [
  new ParaToOffenceCode('10','10001'),
  new ParaToOffenceCode('11','11001' ),
  new ParaToOffenceCode('13','13001' ),
  new ParaToOffenceCode('14','14001' ),
  new ParaToOffenceCode('15','15001' ),
  new ParaToOffenceCode('16','16001' ),
  new ParaToOffenceCode('17','17002' ),
  new ParaToOffenceCode('24(a)','24101', [1] ),
  new ParaToOffenceCode('20','20002' ),
  new ParaToOffenceCode('20(a)','20001', [1]),
  new ParaToOffenceCode('3','3001' ),
  new ParaToOffenceCode('6','6001' ),
  new ParaToOffenceCode('21','21001' ),
  new ParaToOffenceCode('23(a)','2600124'),
  new ParaToOffenceCode('20(a)', '2000124', [2]),
  new ParaToOffenceCode('17(a)', '1700124', [2]),
  new ParaToOffenceCode('24(a)', '2410124', [2]),
  new ParaToOffenceCode('1(b)', '102224', [2]),
  new ParaToOffenceCode('1(c)', '102324', [2]),
  new ParaToOffenceCode('1(d)', '102424', [2]),
]

const yoiParaToOffenceCode = [
  new ParaToOffenceCode('11','10001' ),
  new ParaToOffenceCode('12','11001' ),
  new ParaToOffenceCode('14','13001' ),
  new ParaToOffenceCode('15','14001' ),
  new ParaToOffenceCode('16','15001' ),
  new ParaToOffenceCode('17','16001' ),
  new ParaToOffenceCode('18','17002' ),
  new ParaToOffenceCode('19','17001' ),
  new ParaToOffenceCode('28','24101', [1] ),
  new ParaToOffenceCode('22','20002' ),
  new ParaToOffenceCode('23','20001', [1] ),
  new ParaToOffenceCode('4','3001' ),
  new ParaToOffenceCode('7','6001' ),
  new ParaToOffenceCode('24','21001' ),
  new ParaToOffenceCode('26(a)','2600124'),
  new ParaToOffenceCode('23','2000124', [2] ),
  new ParaToOffenceCode('19', '1700124', [2]),
  new ParaToOffenceCode('28', '2410124', [2]),
  new ParaToOffenceCode('2(a)', '102224', [2]),
  new ParaToOffenceCode('2(b)', '102324', [2]),
  new ParaToOffenceCode('2(c)', '102424', [2]),
]

export const paraToNextQuestion = (
  isYouthOffender: boolean,
  version: number,
): ParaToNextQuestion[] => {
  return (isYouthOffender ? yoiParaToNextQuestion : adultParaToNextQuestion).filter(q => q.isApplicableVersion(version))
}

export const getOffenceInformation = (
  allOffenceRules: OffenceRule[],
  isYouthOffender: boolean,
  version: number,
): GroupedOffenceRulesAndTitles[] => {
  const dataMap = (isYouthOffender ? yoiQToOffencePara : adultQToOffencePara).filter(q => q.isApplicableVersion(version))
  const offenceInformation = {}
  for (const offenceRule of allOffenceRules) {
    // Find the corresponding data from the dataMap based on the paragraph number
    const matchingOffence = dataMap.find(offence => offence.paras.includes(offenceRule.paragraphNumber))
    // If a matching data item is found, create an object and add it to the array
    if (matchingOffence) {
      const offenceInfoItem = {
        childQuestion: matchingOffence.childQuestion,
        paragraphNumber: offenceRule.paragraphNumber,
        paragraphDescription: offenceRule.paragraphDescription,
      }

      // Create a group for the childQuestion if it doesn't exist
      if (!offenceInformation[offenceInfoItem.childQuestion]) {
        offenceInformation[offenceInfoItem.childQuestion] = []
      }

      // Check if the paragraphNumber already exists in the group
      const isDuplicate = offenceInformation[offenceInfoItem.childQuestion].some(
        (item: offenceRuleAndTitle) => item.paragraphNumber === offenceInfoItem.paragraphNumber
      )

      // Add the object to the group if it isn't a duplicate
      if (!isDuplicate) offenceInformation[offenceInfoItem.childQuestion].push(offenceInfoItem)
    }
  }

  // Sort the paragraph numbers within each group in ascending order
  for (const childQuestion in offenceInformation) {
    if (offenceInformation.hasOwnProperty(childQuestion)) {
      offenceInformation[childQuestion].sort((a: offenceRuleAndTitle, b: offenceRuleAndTitle) =>
        a.paragraphNumber.localeCompare(b.paragraphNumber, undefined, { numeric: true })
      )
    }
  }

  // Convert the object into an array
  const groupedOffenceInformation = Object.entries(offenceInformation).map(
    ([childQuestion, offenceRules]: [string, offenceRuleAndTitle[]]) => ({
      offenceTitle: childQuestion,
      offenceRules,
    })
  )
  return groupedOffenceInformation
}

export const getOffenceCodeFromParagraphNumber = (chosenParagraphNumber: string, isYoi: boolean, version: number) => {
  const dataMap = (isYoi ? yoiParaToOffenceCode : adultParaToOffenceCode).filter(code => code.isApplicableVersion(version))
  const matchingParagraphNumber = dataMap.find(paraOffenceCode => paraOffenceCode.para === chosenParagraphNumber)
  if (matchingParagraphNumber) return matchingParagraphNumber.offenceCode
  return null
}

export const paragraphNumberToQuestionId = (paragraphNumber: string, isYoi: boolean, version: number) => {
  const dataMap = paraToNextQuestion(isYoi, version)
  const matchingParaQuestion = dataMap.find(paraQuestion => paraQuestion.para === paragraphNumber)
  if (matchingParaQuestion) return matchingParaQuestion.questionId
  return null
}

const protectedCharacteristicsQuestion = (offenceCode: number) => question('Select which protected characteristics were part of the reason for the incident')
.child(answer('Age').type(Type.CHECKBOXES_ONLY).offenceCode(offenceCode))
.child(answer('Disability').type(Type.CHECKBOXES_ONLY).offenceCode(offenceCode))
.child(answer('Gender reassignment').type(Type.CHECKBOXES_ONLY).offenceCode(offenceCode))
.child(answer('Marriage and civil partnership').type(Type.CHECKBOXES_ONLY).offenceCode(offenceCode))
.child(answer('Pregnancy and maternity').type(Type.CHECKBOXES_ONLY).offenceCode(offenceCode))
.child(answer('Race').type(Type.CHECKBOXES_ONLY).offenceCode(offenceCode))
.child(answer('Reglion or belief').type(Type.CHECKBOXES_ONLY).offenceCode(offenceCode))
.child(answer('Sex').type(Type.CHECKBOXES_ONLY).offenceCode(offenceCode))
  .child(answer('Sexual orientation').type(Type.CHECKBOXES_ONLY).offenceCode(offenceCode))

const versionedQuestion6Answers =  question('What did the incident involve?')
.child(answer('Disobeying any lawful order').offenceCode(22001))
.child(answer('Failure to comply with any rule or regulation').offenceCode(23101))
  .child(answer('Failure to comply with any payback punishment', [2]).offenceCode(2600124))

const versionedQuestion1Answers =  question('What did the incident involve?')
.child(
  answer('Assaulting someone').child(
    question([
      [Role.COMMITTED, 'Who was assaulted?'],
      [Role.ATTEMPTED, `Who did ${Text.PRISONER_FULL_NAME} attempt to assault?`],
      [
        Role.ASSISTED,
        `Who did ${Text.PRISONER_FULL_NAME} assist ${Text.ASSOCIATED_PRISONER_FULL_NAME} to assault?`,
      ],
      [
        Role.INCITED,
        `Who did ${Text.PRISONER_FULL_NAME} incite ${Text.ASSOCIATED_PRISONER_FULL_NAME} to assault?`,
      ],
    ])
      .child(
        answer(['A prisoner in this establishment', `Another prisoner - ${Text.VICTIM_PRISONER_FULL_NAME}`])
          .type(Type.PRISONER)
          .child(
            question('Was the incident a racially aggravated assault?')
              .child(answer('Yes').offenceCode(1001))
              .child(answer('No').offenceCode(1002))
          )
      )
      .child(
        answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`])
          .type(Type.OFFICER)
          .child(
            question('Was the incident a racially aggravated assault?')
              .child(answer('Yes').offenceCode(1003))
              .child(answer('No').offenceCode(1004))
          )
      )
      .child(
        answer([
          'A member of staff who is not a prison officer',
          `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`,
        ])
          .type(Type.STAFF)
          .child(
            question('Was the incident a racially aggravated assault?')
              .child(answer('Yes').offenceCode(1005))
              .child(answer('No').offenceCode(1006))
          )
      )
      .child(
        answer([
          'A prisoner who’s left this establishment',
          `A prisoner who's left this establishment - ${Text.VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT}`,
        ])
          .type(Type.PRISONER_OUTSIDE_ESTABLISHMENT)
          .child(
            question('Was the incident a racially aggravated assault?')
              .child(answer('Yes').offenceCode(1021))
              .child(answer('No').offenceCode(1022))
          )
      )
      .child(
        answer([
          'A person not listed above',
          `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`,
        ])
          .type(Type.OTHER_PERSON)
          .child(
            question('Was the incident a racially aggravated assault?')
              .child(answer('Yes').offenceCode(1007))
              .child(answer('No').offenceCode(1008))
          )
      )
  )
)
.child(
  answer('Fighting with someone').child(
    question([
      [Role.COMMITTED, `Who did ${Text.PRISONER_FULL_NAME} fight with?`],
      [Role.ATTEMPTED, `Who did ${Text.PRISONER_FULL_NAME} attempt to fight with?`],
      [
        Role.ASSISTED,
        `Who did ${Text.PRISONER_FULL_NAME} assist ${Text.ASSOCIATED_PRISONER_FULL_NAME} to fight with?`,
      ],
      [
        Role.INCITED,
        `Who did ${Text.PRISONER_FULL_NAME} incite ${Text.ASSOCIATED_PRISONER_FULL_NAME} to fight with?`,
      ],
    ])
      .child(
        answer(['A prisoner in this establishment', `Another prisoner - ${Text.VICTIM_PRISONER_FULL_NAME}`])
          .type(Type.PRISONER)
          .offenceCode(4001)
      )
      .child(
        answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`])
          .type(Type.OFFICER)
          .offenceCode(4002)
      )
      .child(
        answer([
          'A member of staff who is not a prison officer',
          `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`,
        ])
          .type(Type.STAFF)
          .offenceCode(4003)
      )
      .child(
        answer([
          'A prisoner who’s left this establishment',
          `A prisoner who's left this establishment - ${Text.VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT}`,
        ])
          .type(Type.PRISONER_OUTSIDE_ESTABLISHMENT)
          .offenceCode(4004)
      )
      .child(
        answer([
          'A person not listed above',
          `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`,
        ])
          .type(Type.OTHER_PERSON)
          .offenceCode(4005)
      )
  )
)
.child(
  answer('Endangering the health or personal safety of someone').child(
    question([
      [Role.COMMITTED, `Who did ${Text.PRISONER_FULL_NAME} endanger?`],
      [Role.ATTEMPTED, `Who did ${Text.PRISONER_FULL_NAME} attempt to endanger?`],
      [
        Role.ASSISTED,
        `Who did ${Text.PRISONER_FULL_NAME} assist ${Text.ASSOCIATED_PRISONER_FULL_NAME} to endanger?`,
      ],
      [
        Role.INCITED,
        `Who did ${Text.PRISONER_FULL_NAME} incite ${Text.ASSOCIATED_PRISONER_FULL_NAME} to endanger?`,
      ],
    ])
      .child(
        answer(['A prisoner in this establishment', `Another prisoner - ${Text.VICTIM_PRISONER_FULL_NAME}`])
          .type(Type.PRISONER)
          .offenceCode(5001)
      )
      .child(
        answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`])
          .type(Type.OFFICER)
          .offenceCode(5002)
      )
      .child(
        answer([
          'A member of staff who is not a prison officer',
          `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`,
        ])
          .type(Type.STAFF)
          .offenceCode(5003)
      )
      .child(
        answer([
          'A prisoner who’s left this establishment',
          `A prisoner who's left this establishment - ${Text.VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT}`,
        ])
          .type(Type.PRISONER_OUTSIDE_ESTABLISHMENT)
          .offenceCode(5004)
      )
      .child(
        answer([
          'A person not listed above',
          `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`,
        ])
          .type(Type.OTHER_PERSON)
          .offenceCode(5005)
      )
  ))
  .child(answer('Sexual offence or obscene act', [2]).child(
      question('What happened?')
        .child(answer('Sexual assault').offenceCode(102224))
        .child(answer('Exposes themselves or any other indecent or obscene act').offenceCode(102324))
        .child(answer('Sexually harasses any person').offenceCode(102424))))


// This decision tree is created from a spreadsheet that is linked to in JIRA ticket NN-3935.
export default question([
  [Role.COMMITTED, `What type of offence did ${Text.PRISONER_FULL_NAME} commit?`],
  [Role.ATTEMPTED, `What type of offence did ${Text.PRISONER_FULL_NAME} attempt to commit?`],
  [
    Role.ASSISTED,
    `What type of offence did ${Text.PRISONER_FULL_NAME} assist another prisoner to commit or attempt to commit?`,
  ],
  [Role.INCITED, `What type of offence did ${Text.PRISONER_FULL_NAME} incite another prisoner to commit?`],
])
.versionedChild([
    answer(CHILD_1_Q, [1]).child(versionedQuestion1Answers),
    answer(CHILD_1_Q_V2, [2]).child(versionedQuestion1Answers),
   ]) 
  .child(
    answer(CHILD_2_Q).child(
      question('What did the incident involve?')
        .child(answer('Escaping').offenceCode(7001))
        .child(answer('Absconding from either prison or legal custody').offenceCode(7002))
        .child(answer('Failing to comply with any conditions of a temporary release').offenceCode(8001))
        .child(answer('Failing to return from their temporary release').offenceCode(8002))
    )
  )
  .child(
    answer(CHILD_3_Q).child(
      question('What did the incident involve?')
        .child(
          answer('Possession of an unauthorised article').child(
            question('What happened?')
              .child(
                answer('Has an unauthorised article in their possession').child(
                  question('Did they have a greater amount than they are allowed to have?')
                    .child(answer('Yes').offenceCode(12001))
                    .child(answer('No').offenceCode(12002))
                )
              )
              .child(
                answer('Sells or gives an unauthorised article to another person').child(
                  question(`Was the article only for ${Text.PRISONER_FULL_NAME_POSSESSIVE} personal use?`)
                    .child(answer('Yes').offenceCode(14001))
                    .child(answer('No').offenceCode(13001))
                )
              )
              .child(answer('Takes an article from another person without permission').offenceCode(15001))
          )
        )
        .child(
          answer('Drugs').child(
            question('What happened?')
              .child(answer('Receiving any controlled drug without the consent of an officer').offenceCode(24001))
              .child(answer('Receiving any controlled drug or any other article during a visit').offenceCode(24002))
              .child(answer('Tampering with or falsifying a drug testing sample').offenceCode(23001))
              .child(answer('Refuses to provide a sample for drug testing').offenceCode(23002))
              .child(answer('Administrating a controlled drug to themself').offenceCode(9001))
              .child(answer('Failing to stop someone else administrating a controlled drug to them').offenceCode(9002))
              .child(answer('Possessing any unauthorised controlled drugs').offenceCode(12101))
              .child(
                answer('Possessing a greater quantity of controlled drugs than authorised to have').offenceCode(12102)
              )
          )
        )
        .child(
          answer('Alcohol').child(
            question('What happened?')
              .child(answer('Consumes any alcoholic drink').offenceCode(10001))
              .child(
                answer('Consumes any alcoholic drink other than that provided to them under rule 25(1)').offenceCode(
                  11001
                )
              )
          )
        )
    )
  )
  .child(
    answer(CHILD_4_Q).child(
      question('What did the incident involve?')
        .child(answer('Sets fire to any part of the prison or any property').offenceCode(16001))
        .child(
          answer('Destroys part of the prison or someone else’s property').versionedChild([
            question('Was the incident racially aggravated?', null, [1])
              .child(answer('Yes').offenceCode(17001))
              .child(answer('No').offenceCode(17002)),
            question('Was the incident aggravated by a protected characteristic?', null, [2])
              .child(answer('Yes').child(protectedCharacteristicsQuestion(1700124)))
              .child(answer('No').offenceCode(17002)) 
          ])
        )
        .child(answer('Displays or draws abusive or racist images', [1]).offenceCode(24101))
        .child(answer('Displays or draws abusive images aggravated by a protected characteristic', [2])
              .child(protectedCharacteristicsQuestion(2410124)))
    )
  )
  .child(
    answer(CHILD_5_Q).child(
      question('What did the incident involve?')
        .child(
          answer('Disrespectful behaviour').child(
            question([
              [Role.COMMITTED, `Who was ${Text.PRISONER_FULL_NAME} disrespectful to?`],
              [Role.ATTEMPTED, `Who was ${Text.PRISONER_FULL_NAME} attempting to be disrespectful to?`],
              [Role.INCITED, `Who did ${Text.PRISONER_FULL_NAME} incite another prisoner to be disrespectful to?`],
              [Role.ASSISTED, `Who did ${Text.PRISONER_FULL_NAME} assist another prisoner to be disrespectful to?`],
            ])
              .child(
                answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`])
                  .type(Type.OFFICER)
                  .offenceCode(19001)
              )
              .child(
                answer([
                  'A member of staff who is not a prison officer',
                  `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`,
                ])
                  .type(Type.STAFF)
                  .offenceCode(19002)
              )
              .child(
                answer([
                  'Another person not listed above',
                  `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`,
                ])
                  .type(Type.OTHER_PERSON)
                  .offenceCode(19003)
              )
          )
      )  
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
    )
  )
  .versionedChild(
    [
      answer(CHILD_6_Q, [1]).child(versionedQuestion6Answers),
      answer(CHILD_6_Q_V2, [2]).child(versionedQuestion6Answers)
    ])
  .child(
    answer(CHILD_7_Q).child(
      question([
        [Role.COMMITTED, `Who did ${Text.PRISONER_FULL_NAME} detain?`],
        [Role.ATTEMPTED, `Who did ${Text.PRISONER_FULL_NAME} attempt to detain?`],
        [Role.INCITED, `Who did ${Text.PRISONER_FULL_NAME} incite ${Text.ASSOCIATED_PRISONER_FULL_NAME} to detain?`],
        [Role.ASSISTED, `Who did ${Text.PRISONER_FULL_NAME} assist ${Text.ASSOCIATED_PRISONER_FULL_NAME} to detain?`],
      ])
        .child(
          answer(['A prisoner in this establishment', `Another prisoner - ${Text.VICTIM_PRISONER_FULL_NAME}`])
            .type(Type.PRISONER)
            .offenceCode(2001)
        )
        .child(
          answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`])
            .type(Type.OFFICER)
            .offenceCode(2002)
        )
        .child(
          answer([
            'A member of staff who is not a prison officer',
            `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`,
          ])
            .type(Type.STAFF)
            .offenceCode(2003)
        )
        .child(
          answer([
            'A prisoner who’s left this establishment',
            `A prisoner who's left this establishment - ${Text.VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT}`,
          ])
            .type(Type.PRISONER_OUTSIDE_ESTABLISHMENT)
            .offenceCode(2021)
        )
        .child(
          answer([
            'A person not listed above',
            `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`,
          ])
            .type(Type.OTHER_PERSON)
            .offenceCode(2004)
        )
    )
  )
  .child(
    answer(CHILD_8_Q).child(
      question('What did the incident involve?')
        .child(answer('Denying someone access to any part of the prison').offenceCode(3001))
        .child(answer('Obstructing a member of staff from doing their job').offenceCode(6001))
        .child(
          answer('Stopping someone carrying out a drug test').child(
            question('What happened?')
              .child(answer('Tampering with or falsifying a drug testing sample').offenceCode(23201))
              .child(answer('Refuses to provide a sample for drug testing').offenceCode(23202))
          )
        )
    )
  )
  .child(
    answer(CHILD_9_Q).child(
      question('What did the incident involve?')
        .child(answer('Being absent without authorisation').offenceCode(18001))
        .child(answer('Being in an unauthorised place').offenceCode(18002))
        .child(answer('Failing to work correctly').offenceCode(21001))
    )
)
  

export const paragraph1 = question('Who was assaulted?', para1OverrideQuestionId)
  .child(
    answer(['A prisoner in this establishment', `Another prisoner - ${Text.VICTIM_PRISONER_FULL_NAME}`])
      .type(Type.PRISONER)
      .offenceCode(1002)
  )
  .child(
    answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`])
      .type(Type.OFFICER)
      .offenceCode(1004)
  )
  .child(
    answer([
      'A member of staff who is not a prison officer',
      `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`,
    ])
      .type(Type.STAFF)
      .offenceCode(1006)
  )
  .child(
    answer([
      'A prisoner who’s left this establishment',
      `A prisoner who's left this establishment - ${Text.VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT}`,
    ])
      .type(Type.PRISONER_OUTSIDE_ESTABLISHMENT)
      .offenceCode(1022)
  )
  .child(
    answer(['A person not listed above', `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`])
      .type(Type.OTHER_PERSON)
      .offenceCode(1008)
  )

export const paragraph1A = question('Who was assaulted?', adultPara1aYoiPara2OverrideQuestionId)
  .child(
    answer(['A prisoner in this establishment', `Another prisoner - ${Text.VICTIM_PRISONER_FULL_NAME}`])
      .type(Type.PRISONER)
      .offenceCode(1001)
  )
  .child(
    answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`])
      .type(Type.OFFICER)
      .offenceCode(1003)
  )
  .child(
    answer([
      'A member of staff who is not a prison officer',
      `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`,
    ])
      .type(Type.STAFF)
      .offenceCode(1005)
  )
  .child(
    answer([
      'A prisoner who’s left this establishment',
      `A prisoner who's left this establishment - ${Text.VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT}`,
    ])
      .type(Type.PRISONER_OUTSIDE_ESTABLISHMENT)
      .offenceCode(1021)
  )
  .child(
    answer(['A person not listed above', `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`])
      .type(Type.OTHER_PERSON)
      .offenceCode(1007)
  )

export const paragraph7 = question('What did the incident involve?', adultPara7YoiPara8OverrideQuestionId)
  .child(answer('Escaping').offenceCode(7001))
  .child(answer('Absconding from either prison or legal custody').offenceCode(7002))

export const paragraph8 = question('What did the incident involve?', adultPara8YoiPara9OverrideQuestionId)
  .child(answer('Failing to comply with any conditions of a temporary release').offenceCode(8001))
  .child(answer('Failing to return from their temporary release').offenceCode(8002))

export const paragraph9 = question('What did the incident involve?', adultPara9YoiPara10OverrideQuestionId)
  .child(answer('Administrating a controlled drug to themself').offenceCode(9001))
  .child(answer('Failing to stop someone else administrating a controlled drug to them').offenceCode(9002))

export const paragraph12 = question('What did the incident involve?', adultPara12YoiPara13OverrideQuestionId)
  .child(
    answer('Possession of an unauthorised article').child(
      question('Did they have a greater amount than they are allowed to have?')
        .child(answer('Yes').offenceCode(12001))
        .child(answer('No').offenceCode(12002))
    )
  )
  .child(answer('Possessing any unauthorised controlled drugs').offenceCode(12101))
  .child(answer('Possessing a greater quantity of controlled drugs than authorised to have').offenceCode(12102))

export const paragraph24 = question('What happened?', adultPara24YoiPara27OverrideQuestionId)
  .child(answer('Receiving any controlled drug without the consent of an officer').offenceCode(24001))
  .child(answer('Receiving any controlled drug or any other article during a visit').offenceCode(24002))

export const paragraph18 = question('What did the incident involve?', adultPara18YoiPara20OverrideQuestionId)
  .child(answer('Being absent without authorisation').offenceCode(18001))
  .child(answer('Being in an unauthorised place').offenceCode(18002))

export const paragraph23 = question('What did the incident involve?', adultPara23YoiPara26OverrideQuestionId)
  .child(answer('Tampering with or falsifying a drug testing sample').offenceCode(23001))
  .child(answer('Failure to comply with any rule or regulation').offenceCode(23101))

export const paragraph22 = question('What did the incident involve?', adultPara22YoiPara25OverrideQuestionId)
  .child(answer('Disobeying any lawful order').offenceCode(22001))
  .child(answer('Refuses to provide a sample for drug testing').offenceCode(23202))
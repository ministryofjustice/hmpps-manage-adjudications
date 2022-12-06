/* eslint-disable */
import { PlaceholderText as Text } from './Placeholder'
import { IncidentRole as Role } from '../incidentRole/IncidentRole'
import { AnswerType as Type } from './Answer'
import { answer, question } from './Decisions'

// This decision tree is created from a spreadsheet that is linked to in JIRA ticket NN-3935.
export default question([
  [Role.COMMITTED, `What type of offence did ${Text.PRISONER_FULL_NAME} commit?`],
  [Role.ATTEMPTED, `What type of offence did ${Text.PRISONER_FULL_NAME} attempt to commit?`],
  [Role.ASSISTED, `What type of offence did ${Text.PRISONER_FULL_NAME} assist another prisoner to commit or attempt to commit?`],
  [Role.INCITED, `What type of offence did ${Text.PRISONER_FULL_NAME} incite another prisoner to commit?`],
])
  .child(answer('Assault, fighting, or endangering the health or personal safety of others')
    .child(question('What did the incident involve?')
      .child(answer('Assaulting someone')
        .child(question([
          [Role.COMMITTED, 'Who was assaulted?'],
          [Role.ATTEMPTED, `Who did ${Text.PRISONER_FULL_NAME} attempt to assault?`],
          [Role.ASSISTED, `Who did ${Text.PRISONER_FULL_NAME} assist ${Text.ASSOCIATED_PRISONER_FULL_NAME} to assault?`,],
          [Role.INCITED, `Who did ${Text.PRISONER_FULL_NAME} incite another prisoner to assault?`],
        ])
          .child(answer(['A prisoner in this establishment', `Another prisoner - ${Text.VICTIM_PRISONER_FULL_NAME}`]).type(Type.PRISONER)
            .child(question('Was the incident a racially aggravated assault?')
              .child(answer('Yes').offenceCode(1001))
              .child(answer('No').offenceCode(1002))))
          .child(answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`]).type(Type.OFFICER)
            .child(question('Was the incident a racially aggravated assault?')
              .child(answer('Yes').offenceCode(1003))
              .child(answer('No').offenceCode(1004))))
          .child(answer(['A member of staff who is not a prison officer', `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`]).type(Type.STAFF)
            .child(question('Was the incident a racially aggravated assault?')
              .child(answer('Yes').offenceCode(1005))
              .child(answer('No').offenceCode(1006))))
          .child(answer(['A prisoner who’s left this establishment', `A prisoner who's left this establishment - ${Text.VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT}`]).type(Type.PRISONER_OUTSIDE_ESTABLISHMENT)
            .child(question('Was the incident a racially aggravated assault?')
              .child(answer('Yes').offenceCode(1021))
              .child(answer('No').offenceCode(1022))))
          .child(answer(['A person not listed above', `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`]).type(Type.OTHER_PERSON)
            .child(question('Was the incident a racially aggravated assault?')
              .child(answer('Yes').offenceCode(1007))
              .child(answer('No').offenceCode(1008))))))
      .child(answer('Fighting with someone').offenceCode(4001))
      .child(answer('Endangering the health or personal safety of someone')
      .child(question([
        [Role.COMMITTED, 'Who was endangered?'],
        [Role.ATTEMPTED, `Who did ${Text.PRISONER_FULL_NAME} attempt to endanger?`],
        [Role.ASSISTED, `Who did ${Text.PRISONER_FULL_NAME} assist ${Text.ASSOCIATED_PRISONER_FULL_NAME} to endanger?`,],
        [Role.INCITED, `Who did ${Text.PRISONER_FULL_NAME} incite another prisoner to endanger?`],
      ])
        .child(answer(['A prisoner in this establishment', `Another prisoner - ${Text.VICTIM_PRISONER_FULL_NAME}`]).type(Type.PRISONER).offenceCode(5001))
        .child(answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`]).type(Type.OFFICER).offenceCode(5002))
        .child(answer(['A member of staff who is not a prison officer', `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`]).type(Type.STAFF).offenceCode(5003))
        .child(answer(['A prisoner who’s left this establishment', `A prisoner who's left this establishment - ${Text.VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT}`]).type(Type.PRISONER_OUTSIDE_ESTABLISHMENT).offenceCode(5004))
        .child(answer(['A person not listed above', `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`]).type(Type.OTHER_PERSON).offenceCode(5005))))))
  .child(answer('Escape or failure to comply with temporary release conditions')
    .child(question('What did the incident involve?')
      .child(answer('Escaping').offenceCode(7001))
      .child(answer('Absconding from either prison or legal custody').offenceCode(7002))
      .child(answer('Failing to comply with any conditions of a temporary release').offenceCode(8001))
      .child(answer('Failing to return from their temporary release').offenceCode(8002))))
  .child(answer('Possession of unauthorised articles, or drugs or alcohol related')
    .child(question('What did the incident involve?')
      .child(answer('Possession of an unauthorised article')
        .child(question('What happened?')
          .child(answer('Has an unauthorised article in their possession')
            .child(question('Did they have a greater amount than they are allowed to have?')
              .child(answer('Yes').offenceCode(12001))
              .child(answer('No').offenceCode(12002))))
          .child(answer('Sells or gives an unauthorised article to another person')
            .child(question(`Was the article only for ${Text.PRISONER_FULL_NAME_POSSESSIVE} personal use?`)
              .child(answer('Yes').offenceCode(14001))
              .child(answer('No').offenceCode(13001))))
          .child(answer('Takes an article from another person without permission').offenceCode(15001))))
      .child(answer('Drugs')
        .child(question('What happened?')
          .child(answer('Receiving any controlled drug without the consent of an officer').offenceCode(24001))
          .child(answer('Receiving any controlled drug or any other article during a visit').offenceCode(24002))
          .child(answer('Tampering with or falsifying a drug testing sample').offenceCode(23001))
          .child(answer('Refuses to provide a sample for drug testing').offenceCode(23002))
          .child(answer('Administrating a controlled drug to themself').offenceCode(9001))
          .child(answer('Failing to stop someone else administrating a controlled drug to them').offenceCode(9002))
          .child(answer('Possessing any unauthorised controlled drugs').offenceCode(12101))
          .child(answer('Possessing a greater quantity of controlled drugs than authorised to have').offenceCode(12102))))
      .child(answer('Alcohol')
        .child(question('What happened?')
          .child(answer('Consumes any alcoholic drink').offenceCode(10001))
          .child(answer('Consumes any alcoholic drink other than that provided to them under rule 25(1)').offenceCode(11001))))))
  .child(answer('Sets fire to, or damages, the prison or any property')
    .child(question('What did the incident involve?')
      .child(answer('Sets fire to any part of the prison or any property').offenceCode(16001))
      .child(answer('Racially aggravated damage').offenceCode(24101))
      .child(answer('Destroys or damages any part of the prison').offenceCode(17001))
      .child(answer("Destroys or damages someone else’s property").offenceCode(17002))))
  .child(answer('Disrespectful, threatening, abusive, or insulting behaviour')
    .child(question('What did the incident involve?')
      .child(answer('Disrespectful behaviour')
        .child(question([
          [Role.COMMITTED, `Who was ${Text.PRISONER_FULL_NAME} disrespectful to?`],
          [Role.ATTEMPTED, `Who was ${Text.PRISONER_FULL_NAME} attempting to be disrespectful to?`],
          [Role.INCITED, `Who did ${Text.PRISONER_FULL_NAME} incite another prisoner to be disrespectful to?`],
          [Role.ASSISTED, `Who did ${Text.PRISONER_FULL_NAME} assist another prisoner to be disrespectful to?`],
        ])
          .child(answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`]).type(Type.OFFICER).offenceCode(19001))
          .child(answer(['A member of staff who is not a prison officer', `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`]).type(Type.STAFF).offenceCode(19002))
          .child(answer(['Another person not listed above', `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`]).type(Type.OTHER_PERSON).offenceCode(19003))))
      .child(answer('Threatening, abusive, or insulting behaviour')
        .child(question('Did the incident involve racist behaviour?')
          .child(answer('Yes').offenceCode(20001))
          .child(answer('No').offenceCode(20002))))))
  .child(answer('Disobeys any lawful order, or failure to comply with any rule or regulation')
    .child(question('What did the incident involve?')
      .child(answer('Disobeying any lawful order').offenceCode(22001))
      .child(answer('Failure to comply with any rule or regulation').offenceCode(23101))))
  .child(answer('Detains another person')
    .child(question([
      [Role.COMMITTED, `Who did ${Text.PRISONER_FULL_NAME} detain?`],
      [Role.ATTEMPTED, `Who did ${Text.PRISONER_FULL_NAME} attempt to detain?`],
      [Role.INCITED, `Who did ${Text.PRISONER_FULL_NAME} incite another prisoner to detain?`],
      [Role.ASSISTED, `Who did ${Text.PRISONER_FULL_NAME} assist ${Text.ASSOCIATED_PRISONER_FULL_NAME} to detain?`],
    ])
      .child(answer(['A prisoner in this establishment', `Another prisoner - ${Text.VICTIM_PRISONER_FULL_NAME}`]).type(Type.PRISONER).offenceCode(2001))
      .child(answer(['A prison officer', `A prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`]).type(Type.OFFICER).offenceCode(2002))
      .child(answer(['A member of staff who is not a prison officer', `A member of staff who is not a prison officer - ${Text.VICTIM_STAFF_FULL_NAME}`]).type(Type.STAFF).offenceCode(2003))
      .child(answer(['A prisoner who’s left this establishment', `A prisoner who's left this establishment - ${Text.VICTIM_PRISONER_OUTSIDE_ESTABLISHMENT}`]).type(Type.PRISONER_OUTSIDE_ESTABLISHMENT).offenceCode(2021))
      .child(answer(['A person not listed above', `Another person not listed above - ${Text.VICTIM_OTHER_PERSON_FULL_NAME}`]).type(Type.OTHER_PERSON).offenceCode(2004))))
  .child(answer('Stopping someone who is not a prisoner from doing their job')
    .child(question('What did the incident involve?')
      .child(answer('Denying someone access to any part of the prison').offenceCode(3001))
      .child(answer('Obstructing a member of staff from doing their job').offenceCode(6001))
      .child(answer('Stopping someone carrying out a drug test').child(question('What happened?')
        .child(answer('Tampering with or falsifying a drug testing sample').offenceCode(23201))
        .child(answer('Refuses to provide a sample for drug testing').offenceCode(23202))))))
  .child(answer('Being absent without authorisation, being in an unauthorised place, or failing to work correctly')
    .child(question('What did the incident involve?')
      .child(answer('Being absent without authorisation').offenceCode(18001))
      .child(answer('Being in an unauthorised place').offenceCode(18002))
      .child(answer('Failing to work correctly').offenceCode(21001))))

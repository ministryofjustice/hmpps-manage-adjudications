import { Decision, DecisionType as Type, decision } from './Decision'
import { PlaceholderText as Text } from './Placeholder'
import Role from '../incidentRole/IncidentRole'

// This decision tree is created from a spreadsheet that is linked to in JIRA ticket NN-3935.
export default new Decision()
  .title([
    [Role.COMMITTED, `What type of offence did ${Text.OFFENDER_FULL_NAME} commit?`],
    [Role.ATTEMPTED, `What type of offence did ${Text.OFFENDER_FULL_NAME} attempt to commit?`],
    [Role.ASSISTED, `What type of offence did ${Text.OFFENDER_FULL_NAME} assist another prisoner to commit?`],
    [Role.INCITED, `What type of offence did ${Text.OFFENDER_FULL_NAME} incite another prisoner to commit?`],
  ])
  .child(
    decision('Assault, fighting, or endangering the health or personal safety of others')
      .title('What did the incident involve?')
      .child(
        decision('Assaulting someone')
          .title([
            [Role.COMMITTED, 'Who was assaulted?'],
            [Role.ATTEMPTED, `Who did Who did ${Text.OFFENDER_FULL_NAME} attempt to assault?`],
            [Role.ASSISTED, `Who did ${Text.OFFENDER_FULL_NAME} incite another prisoner to assault?`],
            [Role.INCITED, `Who did Who did ${Text.OFFENDER_FULL_NAME} assist ${Text.ASSISTED_FULL_NAME} to assault?`],
          ])
          .url('incident-involved/1')
          .child(
            decision('Another prisoner')
              .type(Type.PRISONER)
              .title('Was the incident a racially aggravated assault?')
              .child(decision('Yes').code(1001))
              .child(decision('No').code(1002))
          )
          .child(
            decision('A prison officer')
              .type(Type.OFFICER)
              .title('Was the incident a racially aggravated assault?')
              .child(decision('Yes').code(1003))
              .child(decision('No').code(1004))
          )
          .child(
            decision('A member of staff who is not a prison officer')
              .type(Type.STAFF)
              .title('Was the incident a racially aggravated assault?')
              .child(decision('Yes').code(1005))
              .child(decision('No').code(1006))
          )
          .child(
            decision('Another person not listed above')
              .title('Was the incident a racially aggravated assault?')
              .type(Type.ANOTHER)
              .child(decision('Yes').code(1007))
              .child(decision('No').code(1008))
          )
      )
      .child(decision('Fighting with someone').code(4001))
      .child(decision('Endangering the health or personal safety of someone').code(5001))
  )
  .child(
    decision('Escape or failure to comply with temporary release conditions')
      .title('What did the incident involve?')
      .child(decision('Escaping').code(7001))
      .child(decision('Absconding from either prison or legal custody').code(7002))
      .child(decision('Failing to comply with any conditions of a temporary release').code(8001))
      .child(decision('Failing to return from their temporary release').code(8002))
  )
  .child(
    decision('Possession of unauthorised articles, or drugs or alcohol related')
      .title('What did the incident involve?')
      .child(
        decision('Possession of an unauthorised article')
          .title('What happened?')
          .child(
            decision('Has unauthorised article in possession')
              .title('Did they have a greater amount than they are allowed to have?')
              .child(decision('Yes').code(12001))
              .child(decision('No').code(12002))
          )
          .child(
            decision('Sells or gives an unauthorised article to another person')
              .title(`Was the article only for ${Text.OFFENDER_FULL_NAME}'s personal user`)
              .child(decision('Yes').code(14001))
              .child(decision('No').code(13001))
          )
          .child(decision('Takes an article from another person without permission').code(15001))
      )
      .child(
        decision('Drugs')
          .title('What happened?')
          .child(decision('Receiving any controlled drug without the consent of an officer').code(24001))
          .child(decision('Receiving any controlled drug or any other article during a visit').code(24002))
          .child(decision('Tampering with or falsifying a drug testing sample').code(23001))
          .child(decision('Refuses to provide a sample for drug testing').code(23002))
          .child(decision('Administrating a controlled drug to themself').code(9101))
          .child(decision('Failing to stop someone else administrating a controlled drug to them').code(9002))
          .child(decision('Possessing any unauthorised controlled drugs').code(12101))
          .child(decision('Possessing a greater quantity of controlled drugs than authorised to have').code(12102))
      )
      .child(
        decision('Alcohol')
          .title('What happened?')
          .child(decision('Consumes any alcoholic drink').code(10001))
          .child(decision('Consumes any alcoholic drink other than that provided to them under rule 25(1)').code(11001))
      )
  )
  .child(
    decision('Sets fire to, or damages, the prison or any property')
      .title('What did the incident involve?')
      .child(decision('Sets fire to any part of the prison or any property').code(16001))
      .child(decision('Racially aggravated damage').code(24101))
      .child(decision('Destroys or damages any part of the prison').code(17001))
      .child(decision("Destroys or damages someone else's property").code(17002))
  )
  .child(
    decision('Disrespectful, threatening, abusive, or insulting')
      .title('What did the incident involve?')
      .child(
        decision('Disrespectful behaviour')
          .title([
            [Role.COMMITTED, `Who was ${Text.OFFENDER_FULL_NAME} disrespectful to?`],
            [Role.ATTEMPTED, `Who was ${Text.OFFENDER_FULL_NAME} attempting to be disrespectful to?`],
            [Role.INCITED, `Who did ${Text.OFFENDER_FULL_NAME} incite another prisoner to be disrespectful to?`],
            [Role.ASSISTED, `Who did ${Text.OFFENDER_FULL_NAME} assist another prisoner to be disrespectful to?`],
          ])
          .child(decision('A prison officer').type(Type.OFFICER).code(19001))
          .child(decision('A member of staff who is not a prison officer').type(Type.PRISONER).code(19002))
          .child(decision('Another person not listed above').type(Type.ANOTHER).code(19003))
      )
      .child(
        decision('Threatening, abusive, or insulting behaviour')
          .title('Did the incident involve racist behaviour?')
          .child(decision('Yes').code(20001))
          .child(decision('No').code(20002))
      )
  )
  .child(
    decision('Disobeys any lawful order, or failure to comply with any rule or regulation')
      .title('What did the incident involve?')
      .child(decision('Disobeying any lawful order').code(22001))
      .child(decision('Failure to comply with any rule or regulation').code(23101))
  )
  .child(
    decision('Detains another person')
      .title([
        [Role.COMMITTED, `Who did ${Text.OFFENDER_FULL_NAME} detain?`],
        [Role.ATTEMPTED, `Who did ${Text.OFFENDER_FULL_NAME} attempt to detain?`],
        [Role.INCITED, `Who did ${Text.OFFENDER_FULL_NAME} incite another prisoner to detain?`],
        [Role.ASSISTED, `Who did ${Text.OFFENDER_FULL_NAME} assist ${Text.ASSISTED_FULL_NAME} to detain?`],
      ])
      .child(decision('Another prisoner').type(Type.PRISONER).code(2001))
      .child(decision('A prison officer').type(Type.OFFICER).code(2002))
      .child(decision('A member of staff who is not a prison officer').type(Type.STAFF).code(2003))
      .child(decision('Another person not listed above').type(Type.ANOTHER).code(2004))
  )
  .child(
    decision('Stopping someone who is not a prisoner from doing their job')
      .title('What did the incident involve?')
      .child(decision('Denying someone access to any part of the prison').code(3001))
      .child(decision('Obstructing a member of staff from doing their job').code(6001))
      .child(
        decision('Stopping someone carrying out a drug test')
          .title('What happened?')
          .child(decision('Tampering with or falsifying a drug testing sample').code(23201))
          .child(decision('Refuses to provide a sample for drug testing').code(23202))
      )
  )
  .child(
    decision('Being absent without authorisation, being in an unauthorised place, or failing to work correctly')
      .title('What did the incident involve?')
      .child(decision('Being absent without authorisation').code(18001))
      .child(decision('Being in an unauthorised place').code(18002))
      .child(decision('Failing to work correctly').code(21001))
  )

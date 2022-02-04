import Decision from './Decision'
import Question from './Question'
import Code from './Code'

// Codes
const todo = new Code('TODO')

function decision(question: Question | string) {
  return new Decision(question)
}

const committed = new Decision()
  .title('What type of offence did {} commit?')
  .child(
    decision('Assault, fighting, or endangering the health or personal safety of others')
      .title('What did the incident involve?')
      .url('qqrp')
      .child(
        decision('Assaulting someone')
          .title('Who was assaulted?')
          .url('incident-involved/1')
          .child(
            decision('Another prisoner')
              .title('Was the incident a racially aggravated assault?')
              .child(decision('Yes').code(todo))
              .child(decision('No').code(todo))
          )
          .child(
            decision('A prison officer')
              .title('Was the incident a racially aggravated assault?')
              .child(decision('Yes').code(todo))
              .child(decision('No').code(todo))
          )
          .child(
            decision('A member of staff who is not a prison officer')
              .title('Was the incident a racially aggravated assault?')
              .child(decision('Yes').code(todo))
              .child(decision('No').code(todo))
          )
          .child(
            decision('Another person not listed above')
              .title('Was the incident a racially aggravated assault?')
              .child(decision('Yes').code(todo))
              .child(decision('No').code(todo))
          )
      )
      .child(decision('Fighting with someone').code(todo))
      .child(decision('Endangering the health or personal safety of someone').code(todo))
  )
  .child(
    decision('Escape or failure to comply with temporary release conditions')
      .title('What did the incident involve?')
      .child(decision('Escaping').code(todo))
      .child(decision('Absconding from either prison or legal custody').code(todo))
      .child(decision('Failing to comply with any conditions of a temporary release').code(todo))
      .child(decision('Failing to return from their temporary release').code(todo))
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
              .child(decision('Yes').code(todo))
              .child(decision('No').code(todo))
          )
          .child(
            decision('Sells or gives an unauthorised article to another person')
              .title('Was the article only for {}`s personal user')
              .child(decision('Yes').code(todo))
              .child(decision('No').code(todo))
          )
          .child(decision('Takes an article from another person without permission').code(todo))
      )
      .child(
        decision('Drugs')
          .title('What happened?')
          .child(decision('Receiving any controlled drug without the consent of an officer').code(todo))
          .child(decision('Receiving any controlled drug or any other article during a visit').code(todo))
          .child(decision('Tampering with or falsifying a drug testing sample').code(todo))
          .child(decision('Refuses to provide a sample for drug testing').code(todo))
          .child(decision('Administrating a controlled drug to themself').code(todo))
          .child(decision('Failing to stop someone else administrating a controlled drug to them').code(todo))
          .child(decision('Possessing any unauthorised controlled drugs').code(todo))
          .child(decision('Possessing a greater quantity of controlled drugs than authorised to have').code(todo))
      )
      .child(
        decision('Alcohol')
          .title('What happened?')
          .child(decision('Possessing any unauthorised controlled drugs').code(todo))
          .child(decision('Possessing a greater quantity of controlled drugs than authorised to have').code(todo))
      )
  )
  .child(
    decision('Sets fire to, or damages, the prison or any property')
      .title('What did the incident involve?')
      .child(decision('Sets fire to any part of the prison or any property').code(todo))
      .child(decision('Racially aggravated damage').code(todo))
      .child(decision('Destroys or damages any part of the prison').code(todo))
      .child(decision("Destroys or damages someone else's property").code(todo))
  )
  .child(
    decision('Disrespectful, threatening, abusive, or insulting')
      .title('What did the incident involve?')
      .child(
        decision('Disrespectful behaviour')
          .title('Who was {} disrespectful to?')
          .child(decision('A prison officer').code(todo))
          .child(decision('A member of staff who is not a prison officer').code(todo))
          .child(decision('Another person not listed above').code(todo))
      )
      .child(
        decision('Threatening, abusive, or insulting behaviour')
          .title('Did the incident involve racist behaviour?')
          .child(decision('Yes').code(todo))
          .child(decision('No').code(todo))
      )
  )
  .child(
    decision('Disobeys any lawful order, or failure to comply with any rule or regulation')
      .title('What did the incident involve?')
      .child(decision('Disobeying any lawful order').code(todo))
      .child(decision('Failure to comply with any rule or regulation').code(todo))
  )
  .child(
    decision('Detains another person')
      .title('Who did {} attempt to detain?')
      .child(decision('Another prisoner').code(todo))
      .child(decision('A prison officer').code(todo))
      .child(decision('A member of staff who is not a prison officer').code(todo))
      .child(decision('Another person not listed above').code(todo))
  )
  .child(
    decision('Stopping someone who is not a prisoner from doing their job')
      .title('What did the incident involve?')
      .child(decision('Denying someone access to any part of the prison').code(todo))
      .child(decision('Obstructing a member of staff from doing their job').code(todo))
      .child(
        decision('Stopping someone carrying out a drug test')
          .title('What happened?')
          .child(decision('Tampering with or falsifying a drug testing sample').code(todo))
          .child(decision('Refuses to provide a sample for drug testing').code(todo))
      )
  )
  .child(
    decision('Being absent without authorisation, being in an unauthorised place, or failing to work correctly')
      .title('What did the incident involve?')
      .child(decision('Being absent without authorisation').code(todo))
      .child(decision('Being in an unauthorised place').code(todo))
      .child(decision('Failing to work correctly').code(todo))
  )

export default committed

import Decision from './Decision'
import Title from './Title'
import Question from './Question'
import Code from './Code'

// Codes
const todo = new Code('TODO')

// Titles
const typeOfOffence = new Title('What type of offence did {} commit?')
const whatDidTheIncidentInvolve = new Title('What did the incident involve?')
const whoWasAssaulted = new Title('Who was assaulted?')
const raciallyAggravated = new Title('Was the incident a racially aggravated assault?')
const whatHappened = new Title('What happened?')
const greaterThanAllowed = new Title('Did they have a greater amount than they are allowed to have?')
const forPersonalUse = new Title('Was th article only for {}`s personal user')

// Questions
const assault = new Question('Assault, fighting, or endangering the health or personal safety of others')
const escaped = new Question('Escape or failure to comply with temporary release conditions')
const possession = new Question('Possession of unauthorised articles, or drugs or alcohol related')
const damages = new Question('Sets fire to, or damages, the prison or any property')
const disrespectful = new Question('Disrespectful, threatening, abusive, or insulting')
const disobeys = new Question('Disobeys any lawful order, or failure to comply with any rule or regulation')
const detains = new Question('Detains another person')
const prevents = new Question('Preventing someone doing their job')
const absent = new Question(
  'Being absent without authorisation, being in an unauthorised place, or failing to work correctly'
)

const assaulting = new Question('Assaulting someone')
const fighting = new Question('Fighting with someone')
const endangering = new Question('Endangering')

const prisoner = new Question('Another prisoner')
const officer = new Question('A prison officer')
const staff = new Question('A member of staff who is not a prison officer')
const another = new Question('Another person not listed above')

const yes = new Question('Yes')
const no = new Question('No')

const escaping = new Question('Escaping')
const absconding = new Question('Absconding from either prison or legal custody')
const failingToComply = new Question('Failing to comply with any conditions of a temporary release')
const failingToReturn = new Question('Failing to return from their temporary release')

const unauthorised = new Question('Possession of an unauthorised article')
const drugs = new Question('Drugs')
const alcohol = new Question('Alcohol')

const inPossession = new Question('Has unauthorised article in possession')
const sells = new Question('Sells or gives an unauthorised article to another person')
const takes = new Question('Takes an article from another person without permission')

const receivingWithoutConsent = new Question('Receiving any controlled drug without the consent of an officer')
const receivingDuringVisit = new Question('Receiving any controlled drug or any other article during a visit')
const tampering = new Question('Tampering with or falsifying a drug testing sample')
const refuseSample = new Question('Refuses to provide a sample for drug testing')
const administratingThemselves = new Question('Administrating a controlled drug to themself ')
const failingToStopSomeoneElse = new Question('Failing to stop someone else administrating a controlled drug to them ')
const possessionOfControlled = new Question('Possessing any unauthorised controlled drugs')
const possessionOfControlledGreater = new Question(
  'Possessing a greater quantity of controlled drugs than authorised to have'
)

const consumeAlcohol = new Question('Possessing any unauthorised controlled drugs')
const consumeAlcoholOtherThanProvided = new Question(
  'Possessing a greater quantity of controlled drugs than authorised to have'
)

const setsFire = new Question('Sets fire to any part of the prison or any property')
const raciallyAggravatedDamage = new Question('Racially aggravated damage')
const damagesPrison = new Question('Destroys or damages any part of the prison')
const damagesProperty = new Question("Destroys or damages someone else's property")

function decision(question: Question) {
  return new Decision(question)
}

const committed = new Decision()
  .title(typeOfOffence)
  .child(
    decision(assault)
      .title(whatDidTheIncidentInvolve)
      .child(
        decision(assaulting)
          .title(whoWasAssaulted)
          .child(
            decision(prisoner).title(raciallyAggravated).child(decision(yes).code(todo)).child(decision(no).code(todo))
          )
          .child(
            decision(officer).title(raciallyAggravated).child(decision(yes).code(todo)).child(decision(no).code(todo))
          )
          .child(
            decision(staff).title(raciallyAggravated).child(decision(yes).code(todo)).child(decision(no).code(todo))
          )
          .child(
            decision(another).title(raciallyAggravated).child(decision(yes).code(todo)).child(decision(no).code(todo))
          )
          .child(decision(fighting).code(todo))
          .child(decision(endangering).code(todo))
      )
  )
  .child(
    decision(escaped)
      .title(whatDidTheIncidentInvolve)
      .child(decision(escaping).code(todo))
      .child(decision(absconding).code(todo))
      .child(decision(failingToComply).code(todo))
      .child(decision(failingToReturn).code(todo))
  )
  .child(
    decision(possession)
      .title(whatDidTheIncidentInvolve)
      .child(
        decision(unauthorised)
          .title(whatHappened)
          .child(
            decision(inPossession)
              .title(greaterThanAllowed)
              .child(decision(yes).code(todo))
              .child(decision(no).code(todo))
          )
          .child(decision(sells).title(forPersonalUse).child(decision(yes).code(todo)).child(decision(no).code(todo)))
          .child(decision(takes).code(todo))
      )
      .child(
        decision(drugs)
          .title(whatHappened)
          .child(decision(receivingWithoutConsent).code(todo))
          .child(decision(receivingDuringVisit).code(todo))
          .child(decision(tampering).code(todo))
          .child(decision(refuseSample).code(todo))
          .child(decision(administratingThemselves).code(todo))
          .child(decision(failingToStopSomeoneElse).code(todo))
          .child(decision(possessionOfControlled).code(todo))
          .child(decision(possessionOfControlledGreater).code(todo))
      )
      .child(
        decision(alcohol)
          .title(whatHappened)
          .child(decision(consumeAlcohol).code(todo))
          .child(decision(consumeAlcoholOtherThanProvided).code(todo))
      )
  )

  .child(
    decision(damages)
      .title(whatDidTheIncidentInvolve)
      .child(decision(setsFire).code(todo))
      .child(decision(raciallyAggravatedDamage).code(todo))
      .child(decision(damagesPrison).code(todo))
      .child(decision(damagesProperty).code(todo))
  )
  .child(decision(disrespectful))
  .child(decision(disobeys))
  .child(decision(detains))
  .child(decision(prevents))
  .child(decision(absent))

export default committed

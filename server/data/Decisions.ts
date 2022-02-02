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

function decision(question: Question) {
  return new Decision(question)
}

const committed = new Decision()
  .withTitle(typeOfOffence)
  .withChild(
    decision(assault)
      .withTitle(whatDidTheIncidentInvolve)
      .withChild(
        decision(assaulting)
          .withTitle(whoWasAssaulted)
          .withChild(
            decision(prisoner)
              .withTitle(raciallyAggravated)
              .withChild(decision(yes).withCode(todo))
              .withChild(decision(no).withCode(todo))
          )
          .withChild(
            decision(officer)
              .withTitle(raciallyAggravated)
              .withChild(decision(yes).withCode(todo))
              .withChild(decision(no).withCode(todo))
          )
          .withChild(
            decision(staff)
              .withTitle(raciallyAggravated)
              .withChild(decision(yes).withCode(todo))
              .withChild(decision(no).withCode(todo))
          )
          .withChild(
            decision(another)
              .withTitle(raciallyAggravated)
              .withChild(decision(yes).withCode(todo))
              .withChild(decision(no).withCode(todo))
          )
          .withChild(decision(fighting).withCode(todo))
          .withChild(decision(endangering).withCode(todo))
      )
  )
  .withChild(
    decision(escaped)
      .withTitle(whatDidTheIncidentInvolve)
      .withChild(decision(escaping).withCode(todo))
      .withChild(decision(absconding).withCode(todo))
      .withChild(decision(failingToComply).withCode(todo))
      .withChild(decision(failingToReturn).withCode(todo))
  )
  .withChild(
    decision(possession)
      .withTitle(whatDidTheIncidentInvolve)
      .withChild(
        decision(unauthorised)
          .withTitle(whatHappened)
          .withChild(
            decision(inPossession)
              .withTitle(greaterThanAllowed)
              .withChild(decision(yes).withCode(todo))
              .withChild(decision(no).withCode(todo))
          )
          .withChild(
            decision(sells)
              .withTitle(forPersonalUse)
              .withChild(decision(yes).withCode(todo))
              .withChild(decision(no).withCode(todo))
          )
          .withChild(decision(takes).withCode(todo))
      )
      .withChild(decision(drugs).withTitle(whatHappened))
      .withChild(decision(alcohol).withTitle(whatHappened))
  )

  .withChild(decision(damages))
  .withChild(decision(disrespectful))
  .withChild(decision(disobeys))
  .withChild(decision(detains))
  .withChild(decision(prevents))
  .withChild(decision(absent))

export default committed

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
const forPersonalUse = new Title('Was the article only for {}`s personal user')
const whoWasDisrespectfulTo = new Title('Who was {} disrespectful to?')
const racistBehaviour = new Title('Did the incident involve racist behaviour?')
const whoDidAttemptToDetain = new Title('Who did {} attempt to detain?')

// Questions
const assault = new Question('Assault, fighting, or endangering the health or personal safety of others')
const escaped = new Question('Escape or failure to comply with temporary release conditions')
const possession = new Question('Possession of unauthorised articles, or drugs or alcohol related')
const damages = new Question('Sets fire to, or damages, the prison or any property')
const disrespectfulThreatening = new Question('Disrespectful, threatening, abusive, or insulting')
const disobeys = new Question('Disobeys any lawful order, or failure to comply with any rule or regulation')
const detains = new Question('Detains another person')
const stopping = new Question('Stopping someone who is not a prisoner from doing their job')
const absent = new Question(
  'Being absent without authorisation, being in an unauthorised place, or failing to work correctly'
)

const assaulting = new Question('Assaulting someone')
const fighting = new Question('Fighting with someone')
const endangering = new Question('Endangering the health or personal safety of someone')

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
const administratingThemselves = new Question('Administrating a controlled drug to themself')
const failingToStopSomeoneElse = new Question('Failing to stop someone else administrating a controlled drug to them')
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

const disrespectful = new Question('Disrespectful behaviour')

const threatening = new Question('Threatening, abusive, or insulting behaviour')

const disobeyingLawful = new Question('Disobeying any lawful order')
const failureToComply = new Question('Failure to comply with any rule or regulation')

const denyingAccess = new Question('Denying someone access to any part of the prison')
const obstructing = new Question('Obstructing a member of staff from doing their job')
const preventingTest = new Question('Stopping someone carrying out a drug test')

const absentWithoutAuthorisation = new Question('Being absent without authorisation')
const unauthorisedPlace = new Question('Being in an unauthorised place')
const failingWork = new Question('Failing to work correctly')

function decision(question: Question) {
  return new Decision(question)
}

function t(title: string) {
  return new Title(title)
}

function q(question: string) {
  return new Question(question)
}

function c(code: string) {
  return new Code(code)
}

const committed = new Decision()
  .title(t('What type of offence did {} commit?'))
  .child(
    decision(q('Assault, fighting, or endangering the health or personal safety of others'))
      .title(t('What did the incident involve?'))
      .child(
        decision(q('Assaulting someone'))
          .title(t('Who was assaulted?'))
          .child(
            decision(q('Another prisoner'))
              .title(t('Was the incident a racially aggravated assault?'))
              .child(decision(q('Yes')).code(todo))
              .child(decision(q('No')).code(todo))
          )
          .child(
            decision(q('A prison officer'))
              .title(t('Was the incident a racially aggravated assault?'))
              .child(decision(q('Yes')).code(todo))
              .child(decision(q('No')).code(todo))
          )
          .child(
            decision(q('A member of staff who is not a prison officer'))
              .title(t('Was the incident a racially aggravated assault?'))
              .child(decision(q('Yes')).code(todo))
              .child(decision(q('No')).code(todo))
          )
          .child(
            decision(q('Another person not listed above'))
              .title(t('Was the incident a racially aggravated assault?'))
              .child(decision(q('Yes')).code(todo))
              .child(decision(q('No')).code(todo))
          )
          .child(decision(q('Fighting with someone')).code(todo))
          .child(decision(q('Endangering the health or personal safety of someone')).code(todo))
      )
  )
  .child(
    decision(q('Escape or failure to comply with temporary release conditions'))
      .title(t('What did the incident involve?'))
      .child(decision(q('Escaping')).code(todo))
      .child(decision(q('Absconding from either prison or legal custody')).code(todo))
      .child(decision(q('Failing to comply with any conditions of a temporary release')).code(todo))
      .child(decision(q('Failing to return from their temporary release')).code(todo))
  )
  .child(
    decision(q('Possession of unauthorised articles, or drugs or alcohol related'))
      .title(t('What did the incident involve?'))
      .child(
        decision(q('Possession of an unauthorised article'))
          .title(t('What happened?'))
          .child(
            decision(q('Has unauthorised article in possession'))
              .title(t('Did they have a greater amount than they are allowed to have?'))
              .child(decision(q('Yes')).code(todo))
              .child(decision(q('No')).code(todo))
          )
          .child(
            decision(q('Sells or gives an unauthorised article to another person'))
              .title(t('Was the article only for {}`s personal user'))
              .child(decision(q('Yes')).code(todo))
              .child(decision(q('No')).code(todo))
          )
          .child(decision(q('Takes an article from another person without permission')).code(todo))
      )
      .child(
        decision(q('Drugs'))
          .title(t('What happened?'))
          .child(decision(q('Receiving any controlled drug without the consent of an officer')).code(todo))
          .child(decision(q('Receiving any controlled drug or any other article during a visit')).code(todo))
          .child(decision(q('Tampering with or falsifying a drug testing sample')).code(todo))
          .child(decision(q('Refuses to provide a sample for drug testing')).code(todo))
          .child(decision(q('Administrating a controlled drug to themself')).code(todo))
          .child(decision(q('Failing to stop someone else administrating a controlled drug to them')).code(todo))
          .child(decision(q('Possessing any unauthorised controlled drugs')).code(todo))
          .child(decision(q('Possessing a greater quantity of controlled drugs than authorised to have')).code(todo))
      )
      .child(
        decision(q('Alcohol'))
          .title(t('What happened?'))
          .child(decision(q('Possessing any unauthorised controlled drugs')).code(todo))
          .child(decision(q('Possessing a greater quantity of controlled drugs than authorised to have')).code(todo))
      )
  )
  .child(
    decision(q('Sets fire to, or damages, the prison or any property'))
      .title(t('What did the incident involve?'))
      .child(decision(q('Sets fire to any part of the prison or any property')).code(todo))
      .child(decision(q('Racially aggravated damage')).code(todo))
      .child(decision(q('Destroys or damages any part of the prison')).code(todo))
      .child(decision(q("Destroys or damages someone else's property")).code(todo))
  )
  .child(
    decision(q('Disrespectful, threatening, abusive, or insulting'))
      .title(t('What did the incident involve?'))
      .child(
        decision(q('Disrespectful behaviour'))
          .title(t('Who was {} disrespectful to?'))
          .child(decision(q('A prison officer')).code(todo))
          .child(decision(q('A member of staff who is not a prison officer')).code(todo))
          .child(decision(q('Another person not listed above')).code(todo))
      )
      .child(
        decision(q('Threatening, abusive, or insulting behaviour'))
          .title(t('Did the incident involve racist behaviour?'))
          .child(decision(q('Yes')).code(todo))
          .child(decision(q('No')).code(todo))
      )
  )
  .child(
    decision(q('Disobeys any lawful order, or failure to comply with any rule or regulation'))
      .title(t('What did the incident involve?'))
      .child(decision(q('Disobeying any lawful order')).code(todo))
      .child(decision(q('Failure to comply with any rule or regulation')).code(todo))
  )
  .child(
    decision(q('Detains another person'))
      .title(t('Who did {} attempt to detain?'))
      .child(decision(q('Another prisoner')).code(todo))
      .child(decision(q('A prison officer')).code(todo))
      .child(decision(q('A member of staff who is not a prison officer')).code(todo))
      .child(decision(q('Another person not listed above')).code(todo))
  )
  .child(
    decision(q('Stopping someone who is not a prisoner from doing their job'))
      .title(t('What did the incident involve?'))
      .child(decision(q('Denying someone access to any part of the prison')).code(todo))
      .child(decision(q('Obstructing a member of staff from doing their job')).code(todo))
      .child(
        decision(q('Stopping someone carrying out a drug test'))
          .title(t('What happened?'))
          .child(decision(q('Tampering with or falsifying a drug testing sample')).code(todo))
          .child(decision(q('Refuses to provide a sample for drug testing')).code(todo))
      )
  )
  .child(
    decision(q('Being absent without authorisation, being in an unauthorised place, or failing to work correctly'))
      .title(t('What did the incident involve?'))
      .child(decision(q('Being absent without authorisation')).code(todo))
      .child(decision(q('Being in an unauthorised place')).code(todo))
      .child(decision(q('Failing to work correctly')).code(todo))
  )

const committed2 = new Decision()
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
  .child(
    decision(disrespectfulThreatening)
      .title(whatDidTheIncidentInvolve)
      .child(
        decision(disrespectful)
          .title(whoWasDisrespectfulTo)
          .child(decision(officer).code(todo))
          .child(decision(staff).code(todo))
          .child(decision(another).code(todo))
      )
      .child(
        decision(threatening).title(racistBehaviour).child(decision(yes).code(todo)).child(decision(no).code(todo))
      )
  )
  .child(decision(disobeys).child(decision(disobeyingLawful).code(todo)).child(decision(failureToComply).code(todo)))
  .child(
    decision(detains)
      .title(whoDidAttemptToDetain)
      .child(decision(prisoner).code(todo))
      .child(decision(officer).code(todo))
      .child(decision(staff).code(todo))
      .child(decision(another).code(todo))
  )
  .child(
    decision(stopping)
      .title(whatDidTheIncidentInvolve)
      .child(decision(denyingAccess).code(todo))
      .child(decision(obstructing).code(todo))
      .child(
        decision(preventingTest)
          .title(whatHappened)
          .child(decision(tampering).code(todo))
          .child(decision(refuseSample).code(todo))
      )
  )
  .child(
    decision(absent)
      .title(whatDidTheIncidentInvolve)
      .child(decision(absentWithoutAuthorisation).code(todo))
      .child(decision(unauthorisedPlace).code(todo))
      .child(decision(failingWork).code(todo))
  )

export default committed

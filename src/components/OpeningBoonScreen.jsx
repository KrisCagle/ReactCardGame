import { OpeningBoonButton } from './shared'
import { ScreenFrame } from './ui/ScreenFrame'

export function OpeningBoonScreen({ run, onChoose }) {
  return (
    <ScreenFrame eyebrow="Opening Choice" message="A stranger at the foot of the spire offers you a gift. Choose one." run={run} title={`${run.character.name}'s First Edge`}>
      <div className="choice-grid">
        {run.openingChoices.map((boon) => (
          <OpeningBoonButton boon={boon} key={boon.id} onClick={() => onChoose(boon)} />
        ))}
      </div>
    </ScreenFrame>
  )
}

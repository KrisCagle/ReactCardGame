import { RewardButton } from './shared'

export function RewardScreen({ run, onChoose, onSkip }) {
  return (
    <main className="game-shell reward-shell">
      <section className="reward-panel">
        <div>
          <p className="eyebrow">{run.rewardKind === 'shop' ? 'Shop' : 'Reward'}</p>
          <h1>{run.rewardTitle}</h1>
          <p className="run-message">{run.message}</p>
        </div>

        <div className="reward-cards">
          {run.rewardChoices.map((reward) => (
            <RewardButton
              kind={run.rewardKind}
              key={`${reward.deckId ?? reward.id}-${run.rewardKind}-${run.rewardTitle}-${reward.name}`}
              reward={reward}
              onClick={() => onChoose(reward)}
            />
          ))}
        </div>

        {run.rewardKind !== 'relic' && (
          <button className="secondary-action" onClick={onSkip} type="button">Leave</button>
        )}
      </section>
    </main>
  )
}

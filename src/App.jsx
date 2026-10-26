import { useCallback, useReducer } from 'react'
import { createInitialGameState, gameReducer } from './game/gameReducer'
import { CharacterSelectScreen } from './components/CharacterSelectScreen'
import { OpeningBoonScreen } from './components/OpeningBoonScreen'
import { MapScreen } from './components/MapScreen'
import { RewardScreen } from './components/RewardScreen'
import { CombatScreen } from './components/CombatScreen'
import { VictoryScreen } from './components/VictoryScreen'
import { RestScreen } from './components/RestScreen'
import { ShopScreen } from './components/ShopScreen'
import { EventScreen } from './components/EventScreen'

function App() {
  const [{ run, combat }, dispatch] = useReducer(gameReducer, undefined, () => createInitialGameState())
  const restart = () => dispatch({ type: 'restart' })
  const discardPotion = (index) => dispatch({ type: 'discardPotion', index })
  // Stable identity: CombatScreen schedules this after the enemy's death animation.
  const finishCombat = useCallback(() => dispatch({ type: 'finishCombat' }), [])

  if (run.screen === 'characterSelect') {
    return <CharacterSelectScreen onChoose={(character) => dispatch({ type: 'chooseCharacter', character })} />
  }
  if (run.screen === 'openingBoon') {
    return <OpeningBoonScreen run={run} onChoose={(boon) => dispatch({ type: 'chooseOpeningBoon', boon })} />
  }
  if (run.screen === 'map') {
    return (
      <MapScreen
        run={run}
        onPickNode={(nodeId) => dispatch({ type: 'enterNode', nodeId })}
        onRestart={restart}
        onDiscardPotion={discardPotion}
      />
    )
  }
  if (run.screen === 'rest') {
    return (
      <RestScreen
        run={run}
        onRest={() => dispatch({ type: 'restHeal' })}
        onSmith={(deckId) => dispatch({ type: 'smithCard', deckId })}
        onLeave={() => dispatch({ type: 'leaveRest' })}
        onDiscardPotion={discardPotion}
      />
    )
  }
  if (run.screen === 'shop') {
    return (
      <ShopScreen
        run={run}
        onBuy={(kind, index) => dispatch({ type: 'buyShopItem', kind, index })}
        onRemoveCard={(deckId) => dispatch({ type: 'removeCard', deckId })}
        onLeave={() => dispatch({ type: 'leaveShop' })}
        onDiscardPotion={discardPotion}
      />
    )
  }
  if (run.screen === 'reward') {
    return (
      <RewardScreen
        run={run}
        onClaim={(itemId, choiceId) => dispatch({ type: 'claimReward', itemId, choiceId })}
        onProceed={() => dispatch({ type: 'skipRewards' })}
        onDiscardPotion={discardPotion}
      />
    )
  }
  if (run.screen === 'event') {
    return (
      <EventScreen
        run={run}
        onChoose={(index) => dispatch({ type: 'chooseEventOption', index })}
        onPickCard={(deckId) => dispatch({ type: 'pickEventCard', deckId })}
        onContinue={() => dispatch({ type: 'continueEvent' })}
        onDiscardPotion={discardPotion}
      />
    )
  }
  if (run.screen === 'victory') return <VictoryScreen run={run} onRestart={restart} />

  return (
    <CombatScreen
      combat={combat}
      onEndTurn={() => dispatch({ type: 'endTurn' })}
      onPlayCard={(card) => dispatch({ type: 'playCard', instanceId: card.instanceId })}
      onUsePotion={(index) => dispatch({ type: 'usePotion', index })}
      onFinish={finishCombat}
      onRestart={restart}
      run={run}
    />
  )
}

export default App

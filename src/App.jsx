import { useReducer } from 'react'
import './App.css'
import { createInitialGameState, gameReducer } from './game/gameReducer'
import { CharacterSelectScreen } from './components/CharacterSelectScreen'
import { OpeningBoonScreen } from './components/OpeningBoonScreen'
import { MapScreen } from './components/MapScreen'
import { RewardScreen } from './components/RewardScreen'
import { CombatScreen } from './components/CombatScreen'
import { VictoryScreen } from './components/VictoryScreen'
import { RestScreen } from './components/RestScreen'
import { ShopScreen } from './components/ShopScreen'

function App() {
  const [{ run, combat }, dispatch] = useReducer(gameReducer, undefined, () => createInitialGameState())
  const restart = () => dispatch({ type: 'restart' })

  if (run.screen === 'characterSelect') {
    return <CharacterSelectScreen onChoose={(character) => dispatch({ type: 'chooseCharacter', character })} />
  }
  if (run.screen === 'openingBoon') {
    return <OpeningBoonScreen run={run} onChoose={(boon) => dispatch({ type: 'chooseOpeningBoon', boon })} />
  }
  if (run.screen === 'map') {
    return <MapScreen run={run} onPickNode={(nodeId) => dispatch({ type: 'enterNode', nodeId })} onRestart={restart} />
  }
  if (run.screen === 'rest') {
    return (
      <RestScreen
        run={run}
        onRest={() => dispatch({ type: 'restHeal' })}
        onSmith={(deckId) => dispatch({ type: 'smithCard', deckId })}
      />
    )
  }
  if (run.screen === 'shop') {
    return (
      <ShopScreen
        run={run}
        onBuyCard={(index) => dispatch({ type: 'buyShopCard', index })}
        onBuyRelic={(index) => dispatch({ type: 'buyShopRelic', index })}
        onRemoveCard={(deckId) => dispatch({ type: 'removeCard', deckId })}
        onLeave={() => dispatch({ type: 'leaveShop' })}
      />
    )
  }
  if (run.screen === 'reward') {
    return (
      <RewardScreen
        run={run}
        onChoose={(reward) => dispatch({ type: 'chooseReward', reward })}
        onSkip={() => dispatch({ type: 'skipReward' })}
      />
    )
  }
  if (run.screen === 'victory') return <VictoryScreen run={run} onRestart={restart} />

  return (
    <CombatScreen
      combat={combat}
      onEndTurn={() => dispatch({ type: 'endTurn' })}
      onPlayCard={(card) => dispatch({ type: 'playCard', instanceId: card.instanceId })}
      onRestart={restart}
      run={run}
    />
  )
}

export default App

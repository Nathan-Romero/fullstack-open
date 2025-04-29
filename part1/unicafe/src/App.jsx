import { useState } from 'react'

const Display = props => <div>{props.category} {props.value}</div>

const Button = (props) => (
  <button onClick={props.onClick}>
    {props.text}
  </button>
)

const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <h1>give feedback</h1>
      <Button onClick={() => setGood(good + 1)} text="good" />
      <Button onClick={() => setNeutral(neutral + 1)} text="neutral" />
      <Button onClick={() => setBad(bad + 1)} text="bad" />
      <h1>statistics</h1>
      <Display category="good" value={good} />
      <Display category="neutral" value={neutral} />
      <Display category="bad" value={bad} />
      <Display category="all" value={good + neutral + bad} />
      <Display category="average" value={good + neutral + bad === 0 ? 0 : ((good - bad) / (good + neutral + bad)).toPrecision(14)} />
      <Display category="positive" value={good + neutral + bad === 0 ? 0 : (((good / (good + neutral + bad)) * 100).toPrecision(14) + ' %')} />
    </div>
  )
}

export default App
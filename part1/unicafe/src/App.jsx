import { useState } from 'react'

const Display = ({ category, value }) => (
  <div>{category} {value}</div>
)

const Statistics = ({ good, neutral, bad }) => {
  let all = good + neutral + bad
  let average = (good - bad) / all
  let positive = (good / all) * 100 + ' %'
  
  if (all === 0) {
    return <div>No feedback given</div>
  }

  return (
    <>
      <Display category="good" value={good} />
      <Display category="neutral" value={neutral} />
      <Display category="bad" value={bad} />
      <Display category="all" value={all} />
      <Display category="average" value={average} />
      <Display category="positive" value={positive} />
    </>
  )
}

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
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App
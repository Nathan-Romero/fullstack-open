import { useState } from 'react'

const Button = ({ onClick, text }) => (
  <button onClick={onClick}>
    {text}
  </button>
)

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.',
    'The only way to go fast, is to go well.'
  ]

  const [selected, setSelected] = useState(0)
  const [votes, setVotes] = useState(Array(anecdotes.length).fill(0))

  const setToRandom = () => {
    let newSelected

    do {
      newSelected = Math.floor(Math.random() * anecdotes.length)
    } while (newSelected === selected)
    
    setSelected(newSelected)
  }

  const setVote = () => {
    const copy = [...votes]
    copy[selected] += 1
    
    setVotes(copy)
  }

  const getMostVotes = () => {
    return votes.indexOf(Math.max(...votes))
  }

  console.log('selected: ', selected)
  console.log('votes: ', votes)
  return (
    <div>
      <h1>Anecdote of the day</h1>
      <div>{anecdotes[selected]}</div>
      <div>has {votes[selected]} votes</div>
      <Button onClick={() => setVote()} text="vote" />
      <Button onClick={() => setToRandom()} text="next anecdote" />
      <h1>Anecdote with most votes</h1>
      <div>{anecdotes[getMostVotes()]}</div>
      <div>has {votes[getMostVotes()]} votes</div>
    </div>
  )
}

export default App
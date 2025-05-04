import { useState, useEffect } from 'react'
import personService from './services/persons'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState(null)
  const [errorFlag, setErrorFlag] = useState(false)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber,
    }

    const existingPerson = persons.find(person => person.name === newName)
    
    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        updatePerson(existingPerson.id, {...existingPerson, number: newNumber})
      }
      return
    }

    personService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        setErrorFlag(false)
        setMessage(`Added ${newName}`)
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
      .catch(error => {
        console.log(error.response.data.error)
        setErrorFlag(true)
        setMessage(error.response.data.error)
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const updatePerson = (id, personObject) => {
    personService
      .update(id, personObject)
      .then(returnedPerson => {
        setPersons(persons.map(person => 
          person.id === id ? returnedPerson : person
        ))
        setNewName('')
        setNewNumber('')
        setErrorFlag(false)
        setMessage(
          `Number has been updated for ${personObject.name}`
        )
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.data.error) {
          setErrorFlag(true)
          setMessage(error.response.data.error)
        } else {
          setErrorFlag(true)
          setMessage(`Information of ${personObject.name} has already been removed`)
          setPersons(persons.filter(p => p.id !== id))
        }
        
        setTimeout(() => {
          setMessage(null)
        }, 5000)
      })
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name} ?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setErrorFlag(false)
          setMessage(
            `${name} has been deleted`
          )
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
        .catch(() => {
          setErrorFlag(true)
          setMessage(
            `Information of ${name} has already been removed`
          )
          setTimeout(() => {
            setMessage(null)
          }, 5000)
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const filteredPersons = persons.filter(person => 
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} errorFlag={errorFlag} />
      <Filter searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
      <h3>Add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      <Persons persons={filteredPersons} deletePerson={deletePerson} />
    </div>
  )
}

export default App